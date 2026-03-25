import db from "../config/db.js";
import sendEmail from "../utils/sendEmail.js"; // ✅ ADDED

export const getMyApplications = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

   const [rows] = await db.query(
  `SELECT 
      a.*,
      i.total_amount,
      ii.status AS issue_status

   FROM applications a

   /* ✅ latest invoice */
   LEFT JOIN invoices i
     ON i.id = (
       SELECT MAX(id)
       FROM invoices
       WHERE application_id = a.id
     )

   /* ✅ latest issue */
   LEFT JOIN invoice_issues ii
     ON ii.id = (
       SELECT id
       FROM invoice_issues
       WHERE application_id = a.id
       ORDER BY created_at DESC
       LIMIT 1
     )

   WHERE a.user_id = ?
   ORDER BY a.created_at DESC`,
  [req.user.id]
);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT a.*, c.company_name
      FROM applications a
      LEFT JOIN companies c ON a.company_id = c.id
      WHERE a.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const submitApplication = async (req, res) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // ✅ SAFETY: CHECK USER
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ✅ SAFE JSON PARSE
    let formData;
    try {
      formData = JSON.parse(req.body.data);
    } catch (err) {
      await conn.rollback();
      return res.status(400).json({ error: "Invalid JSON data" });
    }

    // ✅ GET COMPANY ID + EMAIL (UPDATED)
    const [companyRows] = await conn.query(
      `SELECT id, email FROM companies WHERE user_id = ?`,
      [req.user.id]
    );

    if (!companyRows.length) {
      await conn.rollback();
      return res.status(400).json({
        error: "No company found. Please register first.",
      });
    }

    const companyId = companyRows[0].id;
    const companyEmail = companyRows[0].email; // ✅ ADDED

    // ================= APPLICATION =================
    const [appResult] = await conn.query(
      `INSERT INTO applications (
        user_id,
        company_id,
        legal_name,
        brand_name,
        website,
        hq_location,
        contact_email,
        employee_count,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        req.user.id,
        companyId,
        formData.companyDetails?.organisationName || "",
        formData.companyDetails?.brandName || "",
        formData.companyDetails?.website || "",
        `${formData.companyDetails?.city || ""}, ${formData.companyDetails?.state || ""}`,
        formData.companyDetails?.officialEmail || "",
        formData.companyDetails?.companySize || 0,
        "SUBMITTED"
      ]
    );

    const applicationId = appResult.insertId;

    // ================= OWNERS =================
    for (let o of formData.owners || []) {
      await conn.query(
        `INSERT INTO company_people
        (company_id, name, designation, email, phone, role, aadhaar, pan, experience)
        VALUES (?, ?, ?, ?, ?, 'OWNER', ?, ?, ?)`,
        [
          companyId,
          o.name || "",
          o.designation || "",
          o.email || "",
          o.phone || "",
          o.aadhaar || "",
          o.pan || "",
          o.experience || "",
        ]
      );
    }

    // ================= PARTNERS =================
    for (let p of formData.partners || []) {
      await conn.query(
        `INSERT INTO company_people
        (company_id, name, designation, email, phone, role)
        VALUES (?, ?, ?, ?, ?, 'PARTNER')`,
        [
          companyId,
          p.name || "",
          p.designation || "",
          p.email || "",
          p.phone || "",
        ]
      );
    }

    // ================= PRODUCTS =================
    for (let p of formData.products || []) {
      await conn.query(
        `INSERT INTO products (
          application_id,
          product_name,
          category,
          description,
          industry_served,
          team_size,
          version,
          deployment_type,
          pricing_model,
          customers_count,
          major_clients,
          integrations,
          key_features,
          security_standards,
          uptime_sla,
          roadmap,
          package,
          remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationId,
          p.productName || "",
          p.customCategory || p.category || "",
          p.description || "",
          p.customIndustry || p.industryServed || "",
          p.teamSize || "",
          p.version || "",
          p.customDeployment || p.deploymentType || "",
          p.customPricing || p.pricingModel || "",
          p.customersCount || 0,
          p.majorClients || "",
          p.integrations || "",
          p.keyFeatures || "",
          p.securityStandards || "",
          p.uptimeSLA || "",
          p.roadmap || "",
          (p.package || []).join(", "),
          p.remark || "",
        ]
      );

      for (let pkg of p.package || []) {
        await conn.query(
          `INSERT INTO application_items
          (application_id, item_name, package_type)
          VALUES (?, ?, ?)`,
          [applicationId, p.productName || "", pkg]
        );
      }
    }

    // ================= SOLUTIONS =================
    for (let s of formData.solutions || []) {
      await conn.query(
        `INSERT INTO solutions (
          application_id,
          solution_name,
          category,
          description,
          industry_served,
          team_size,
          services_provided,
          projects_completed,
          ongoing_projects,
          customers_count,
          major_clients,
          tools_used,
          integrations,
          methodology,
          certifications,
          package,
          remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          applicationId,
          s.solutionName || "",
          s.customCategory || s.category || "",
          s.description || "",
          s.customIndustry || s.industryServed || "",
          s.teamSize || "",
          s.customService || s.servicesProvided || "",
          s.projectsCompleted || 0,
          s.ongoingProjects || 0,
          s.customersCount || 0,
          s.majorClients || "",
          s.toolsUsed || "",
          s.integrations || "",
          s.customMethodology || s.methodology || "",
          s.certifications || "",
          (s.package || []).join(", "),
          s.remark || "",
        ]
      );

      for (let pkg of s.package || []) {
        await conn.query(
          `INSERT INTO application_items
          (application_id, item_name, package_type)
          VALUES (?, ?, ?)`,
          [applicationId, s.solutionName || "", pkg]
        );
      }
    }

    // ================= FILES =================
    const files = req.files || {};

    const saveFile = async (type, fileArr) => {
      if (!fileArr) return;

      for (let file of fileArr) {
        await conn.query(
          `INSERT INTO evidences (
            application_id,
            document_type,
            file_name,
            file_url,
            uploaded_by
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            applicationId,
            type,
            file.originalname,
            file.path,
            req.user.id,
          ]
        );
      }
    };

    await saveFile("GST", files.gstDoc);
    await saveFile("SEZ", files.sezDoc);
    await saveFile("PROFILE", files.companyProfile);
    await saveFile("PITCH", files.pitchDeck);
    await saveFile("CERT", files.certifications);

    // ✅ COMMIT FIRST
    await conn.commit();

    // ✅ SEND EMAIL AFTER SUCCESS
    if (companyEmail) {
      await sendEmail(
        companyEmail,
        "Application Submitted",
        `Your application (ID: ${applicationId}) has been successfully submitted.`
      );
    }

    res.json({
      success: true,
      message: "Application submitted successfully",
      applicationId,
    });

  } catch (err) {
    await conn.rollback();
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

export const getApplications = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, c.company_name
      FROM applications a
      LEFT JOIN companies c ON a.company_id = c.id
      ORDER BY a.created_at DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching applications" });
  }
};

export const setPricing = async (req, res) => {
  try {
    const { application_id, total_amount } = req.body;

    // 1️⃣ Update application
    await db.query(
      `UPDATE applications 
       SET total_amount = ?, status = 'PRICING_DEFINED' 
       WHERE id = ?`,
      [total_amount, application_id]
    );

    // 2️⃣ (Optional) update items
    await db.query(
      `UPDATE application_items 
       SET final_price = price 
       WHERE application_id = ?`,
      [application_id]
    );

    return res.json({ message: "Pricing set successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error setting pricing" });
  }
};
/* =========================
   CANCEL APPLICATION
========================= */
export const cancelApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 check if exists
    const [rows] = await db.query(
      "SELECT * FROM applications WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Application not found" });
    }

    // ❌ cancel application
    await db.query(
      "UPDATE applications SET status = 'CANCELLED' WHERE id = ?",
      [id]
    );

    res.json({ message: "Application cancelled successfully" });

  } catch (err) {
    console.error("❌ CANCEL ERROR:", err);
    res.status(500).json({ message: "Failed to cancel application" });
  }
};