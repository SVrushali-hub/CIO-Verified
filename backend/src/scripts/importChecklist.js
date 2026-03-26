import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.join(__dirname, "../../data/CIO_Verified_Checklists_v2.xlsx");

const PRODUCT_CATEGORIES = [
  "ERP",
  "CRM",
  "HRMS",
  "Accounting",
  "Operational SaaS",
  "Integration / Data",
  "AI",
  "Security",
  "Vertical Software",
];

const SOLUTION_CATEGORIES = [
  "Implementation Partner",
  "System Integrator",
  "Managed Services",
  "ITES",
  "ISO / Compliance Auditor",
];

function clean(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str.length ? str : null;
}

function parseNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeYesNo(value) {
  return String(value || "").trim().toLowerCase() === "yes";
}

function slugify(value, maxLen = 50) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, maxLen);
}

function buildSafeItemCode(sectionId, jsonKey, itemName) {
  if (jsonKey) return slugify(jsonKey, 50);

  const sectionPart = slugify(sectionId, 12);
  const itemPart = slugify(itemName, 34);

  return `${sectionPart}_${itemPart}`
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

function getRowsFromSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);

  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const headerRowIndex = 11; // Excel row 12
  const headers = raw[headerRowIndex];
  const dataRows = raw.slice(headerRowIndex + 1);

  return dataRows
    .filter((row) => row && row.length)
    .map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
}

function getValidCategories(checklistType) {
  return checklistType === "PRODUCT"
    ? PRODUCT_CATEGORIES
    : SOLUTION_CATEGORIES;
}

function isRealChecklistRow(row) {
  const sectionId = clean(row["Section ID"]);
  const pillarName = clean(row["Pillar"]);
  const itemName = clean(row["Criterion"]);
  const maxScore = parseNumber(row["Max Points"], NaN);
  const jsonKey = clean(row["JSON Key"]);

  if (!sectionId || !pillarName || !itemName || !Number.isFinite(maxScore)) {
    return false;
  }

  const lowerItem = String(itemName).toLowerCase();
  const lowerJson = String(jsonKey || "").toLowerCase();

  if (lowerItem.includes("pillar total check")) return false;
  if (lowerItem.includes("summary")) return false;
  if (lowerItem.includes("total check")) return false;
  if (lowerJson.includes("pillar_total")) return false;
  if (lowerJson.includes("summary")) return false;

  return true;
}

function buildTemplateRows(rows, checklistType, frameworkId) {
  const result = [];
  let sortOrder = 1;

  for (const row of rows) {
    if (!isRealChecklistRow(row)) continue;

    const sectionId = clean(row["Section ID"]);
    const pillarName = clean(row["Pillar"]);
    const itemName = clean(row["Criterion"]);
    const description = clean(row["Description / What to look for"]);
    const maxScore = parseNumber(row["Max Points"], 0);
    const isCritical = normalizeYesNo(row["Critical?"]);
    const jsonKey = clean(row["JSON Key"]);
    const categories = getValidCategories(checklistType);

    for (const category of categories) {
      result.push({
        framework_id: frameworkId,
        checklist_type: checklistType,
        category,
        subcategory: null,
        pillar_code: sectionId,
        pillar_name: pillarName,
        item_code: buildSafeItemCode(sectionId, jsonKey, itemName),
        item_name: itemName,
        description,
        json_key: jsonKey,
        max_score: maxScore,
        min_required_score: isCritical ? maxScore : 0,
        is_critical: isCritical ? 1 : 0,
        evidence_required: 1,
        item_status_default: "pending",
        sort_order: sortOrder++,
        is_active: 1,
        applicability_text: clean(row["Applicability"]),
      });
    }
  }

  return result;
}

async function importChecklist() {
  const conn = await db.getConnection();

  try {
    console.log("Excel path:", excelPath);

    const workbook = XLSX.readFile(excelPath);

    const productRows = getRowsFromSheet(workbook, "Product Checklist");
    const solutionRows = getRowsFromSheet(workbook, "Solution Checklist");

    console.log("Parsed product rows:", productRows.length);
    console.log("Parsed solution rows:", solutionRows.length);

    await conn.beginTransaction();

    await conn.query(`UPDATE checklist_frameworks SET is_active = FALSE`);

    const [existingFrameworkRows] = await conn.query(
      `SELECT id
       FROM checklist_frameworks
       WHERE framework_code = ?`,
      ["CIO_V2"]
    );

    let frameworkId;

    if (existingFrameworkRows.length) {
      frameworkId = existingFrameworkRows[0].id;

      await conn.query(
        `UPDATE checklist_frameworks
         SET framework_name = ?,
             version = ?,
             description = ?,
             is_active = TRUE,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          "CIO Verified Checklist Framework",
          "v2.0",
          "Imported from CIO_Verified_Checklists_v2.xlsx",
          frameworkId,
        ]
      );
    } else {
      const [frameworkResult] = await conn.query(
        `INSERT INTO checklist_frameworks (
          framework_code,
          framework_name,
          version,
          description,
          is_active
        ) VALUES (?, ?, ?, ?, TRUE)`,
        [
          "CIO_V2",
          "CIO Verified Checklist Framework",
          "v2.0",
          "Imported from CIO_Verified_Checklists_v2.xlsx",
        ]
      );

      frameworkId = frameworkResult.insertId;
    }

    // Delete only unused templates for this framework
    await conn.query(
      `DELETE FROM checklist_templates
       WHERE framework_id = ?
         AND id NOT IN (
           SELECT template_id
           FROM checklist_response_items
           WHERE template_id IS NOT NULL
         )`,
      [frameworkId]
    );

    const productTemplates = buildTemplateRows(productRows, "PRODUCT", frameworkId);
    const solutionTemplates = buildTemplateRows(solutionRows, "SOLUTION", frameworkId);
    const allTemplates = [...productTemplates, ...solutionTemplates];

    console.log("Templates to insert:", allTemplates.length);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const tpl of allTemplates) {
      const [existingTemplateRows] = await conn.query(
        `SELECT id
         FROM checklist_templates
         WHERE framework_id = ?
           AND checklist_type = ?
           AND category = ?
           AND IFNULL(subcategory, '') = IFNULL(?, '')
           AND pillar_code = ?
           AND item_code = ?`,
        [
          tpl.framework_id,
          tpl.checklist_type,
          tpl.category,
          tpl.subcategory,
          tpl.pillar_code,
          tpl.item_code,
        ]
      );

      if (existingTemplateRows.length) {
        skippedCount++;
        continue;
      }

      await conn.query(
  `INSERT INTO checklist_templates (
    framework_id,
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
    is_critical,
    evidence_required,
    item_status_default,
    sort_order,
    is_active,
    applicability_text
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    tpl.framework_id,
    tpl.checklist_type,
    tpl.category,
    tpl.subcategory,
    tpl.pillar_code,
    tpl.pillar_name,
    tpl.item_code,
    tpl.item_name,
    tpl.description,
    tpl.json_key,
    tpl.max_score,
    tpl.min_required_score,
    tpl.is_critical,
    tpl.evidence_required,
    tpl.item_status_default,
    tpl.sort_order,
    tpl.is_active,
    tpl.applicability_text
  ]
);
      insertedCount++;
    }

    await conn.commit();

    console.log("✅ Framework imported:", frameworkId);
    console.log("✅ Product templates prepared:", productTemplates.length);
    console.log("✅ Solution templates prepared:", solutionTemplates.length);
    console.log("✅ Templates inserted:", insertedCount);
    console.log("ℹ️ Templates skipped (already existed):", skippedCount);
    console.log("🎉 Import completed successfully");
  } catch (error) {
    await conn.rollback();
    console.error("❌ Import failed:", error);
  } finally {
    conn.release();
  }
}

importChecklist();