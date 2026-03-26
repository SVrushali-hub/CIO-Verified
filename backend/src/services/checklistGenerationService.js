import db from "../config/db.js";

const PRODUCT_APPLICABILITY_MAP = {
  ERP: ["ERP", "Finance", "regulated categories"],
  CRM: ["CRM"],
  HRMS: ["HRMS", "HR"],
  Accounting: ["Accounting", "Finance"],
  "Operational SaaS": ["Operational SaaS"],
  "Integration / Data": ["Integration / Data", "Data"],
  AI: ["AI"],
  Security: ["Security"],
  "Vertical Software": ["Vertical Software", "regulated domains"],
};

const SOLUTION_APPLICABILITY_MAP = {
  "Implementation Partner": ["Implementation Partner", "IT Consulting"],
  "System Integrator": ["System Integrator"],
  "Managed Services": ["Managed Services", "Support / AMS"],
  ITES: ["ITES"],
  "ISO / Compliance Auditor": [
    "ISO / Compliance Auditor",
    "Security Auditor",
    "regulated services",
  ],
};

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getApplicabilityAliases(checklistType, category) {
  const map =
    checklistType === "PRODUCT"
      ? PRODUCT_APPLICABILITY_MAP
      : SOLUTION_APPLICABILITY_MAP;

  return (map[category] || [category]).map((v) => normalize(v));
}

function isTemplateApplicable(checklistType, entityCategory, applicabilityText) {
  const appText = normalize(applicabilityText);

  if (!appText) return true;

  if (checklistType === "PRODUCT" && appText === "all product categories") {
    return true;
  }

  if (checklistType === "SOLUTION" && appText === "all solution categories") {
    return true;
  }

  const allowedParts = String(applicabilityText || "")
    .split(",")
    .map((part) => normalize(part))
    .filter(Boolean);

  const aliases = getApplicabilityAliases(checklistType, entityCategory);

  return aliases.some((alias) => allowedParts.includes(alias));
}

async function createChecklistFromTemplates({
  conn,
  application,
  framework,
  entityType,
  entityId,
  entityName,
  checklistType,
  category,
  subcategory = null,
}) {
  const [existing] = await conn.query(
    `SELECT id
     FROM assessment_checklists
     WHERE application_id = ?
       AND entity_type = ?
       AND entity_id = ?
       AND framework_id = ?`,
    [application.id, entityType, entityId, framework.id]
  );

  if (existing.length) {
    return null;
  }

  const [templateRows] = await conn.query(
    `SELECT *
     FROM checklist_templates
     WHERE framework_id = ?
       AND checklist_type = ?
       AND category = ?
       AND is_active = TRUE
     ORDER BY sort_order ASC, id ASC`,
    [framework.id, checklistType, category]
  );

  if (!templateRows.length) {
    throw new Error(`No active ${checklistType} templates found for category: ${category}`);
  }

  const applicableTemplates = templateRows.filter((template) =>
    isTemplateApplicable(checklistType, category, template.applicability_text)
  );

  if (!applicableTemplates.length) {
    throw new Error(
      `No applicable ${checklistType} templates found for category: ${category}`
    );
  }

  const [insertResult] = await conn.query(
    `INSERT INTO assessment_checklists (
      application_id,
      company_id,
      entity_type,
      entity_id,
      entity_name,
      checklist_type,
      framework_id,
      framework_version,
      category,
      subcategory,
      assigned_auditor_id,
      assigned_reviewer_id,
      evaluation_status,
      certification_status,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NOT_STARTED', 'NOT_EVALUATED', 'DRAFT')`,
    [
      application.id,
      application.company_id,
      entityType,
      entityId,
      entityName,
      checklistType,
      framework.id,
      framework.version,
      category,
      subcategory,
      application.assigned_auditor_id || null,
      application.assigned_reviewer_id || null,
    ]
  );

  const checklistId = insertResult.insertId;

  for (const template of applicableTemplates) {
    await conn.query(
      `INSERT INTO checklist_response_items (
        checklist_id,
        template_id,
        checklist_type,
        category,
        subcategory,
        pillar_code,
        pillar_name,
        item_code,
        item_name,
        description,
        json_key,
        max_score,
        min_required_score,
        awarded_score,
        critical_item,
        evidence_required,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [
        checklistId,
        template.id,
        checklistType,
        template.category,
        template.subcategory,
        template.pillar_code,
        template.pillar_name,
        template.item_code,
        template.item_name,
        template.description,
        template.json_key,
        template.max_score,
        template.min_required_score,
        template.is_critical,
        template.evidence_required,
        template.item_status_default || "pending",
      ]
    );
  }

  return {
    checklist_id: checklistId,
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    inserted_items: applicableTemplates.length,
  };
}

export const generateChecklistsForApplicationService = async (
  applicationId,
  existingConn = null
) => {
  const conn = existingConn || (await db.getConnection());
  const ownConn = !existingConn;

  try {
    const [appRows] = await conn.query(
      `SELECT * FROM applications WHERE id = ?`,
      [applicationId]
    );

    if (!appRows.length) {
      throw new Error("Application not found");
    }

    const application = appRows[0];

    const [frameworkRows] = await conn.query(
      `SELECT * FROM checklist_frameworks WHERE is_active = TRUE LIMIT 1`
    );

    if (!frameworkRows.length) {
      throw new Error("No active checklist framework found");
    }

    const framework = frameworkRows[0];

    const [products] = await conn.query(
      `SELECT * FROM products WHERE application_id = ?`,
      [applicationId]
    );

    const [solutions] = await conn.query(
      `SELECT * FROM solutions WHERE application_id = ?`,
      [applicationId]
    );

    if (!products.length && !solutions.length) {
      throw new Error("No products or solutions found for this application");
    }

    const created = [];

    for (const product of products) {
      const result = await createChecklistFromTemplates({
        conn,
        application,
        framework,
        entityType: "product",
        entityId: product.id,
        entityName: product.product_name,
        checklistType: "PRODUCT",
        category: product.category || "GENERAL",
        subcategory: product.subcategory || null,
      });

      if (result) {
        created.push(result);
      }
    }

    for (const solution of solutions) {
      const result = await createChecklistFromTemplates({
        conn,
        application,
        framework,
        entityType: "solution",
        entityId: solution.id,
        entityName: solution.solution_name,
        checklistType: "SOLUTION",
        category: solution.category || "GENERAL",
        subcategory: solution.subcategory || null,
      });

      if (result) {
        created.push(result);
      }
    }

    return created;
  } finally {
    if (ownConn) conn.release();
  }
};