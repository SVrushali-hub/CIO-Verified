import db from "./db.js";

export const initDatabase = async () => {
  try {
    console.log("🔄 Initializing Database...");

    // ================= USERS =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,

        username VARCHAR(100) UNIQUE,
        email VARCHAR(100) UNIQUE NULL,
        password VARCHAR(255) NOT NULL,

        role ENUM(
          'APPLICANT',
          'ADMIN',
          'SUPERADMIN',
          'AUDITOR',
          'REVIEWER'
        ) DEFAULT 'APPLICANT',

        is_verified BOOLEAN DEFAULT FALSE,
        is_temp_password BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,

        otp VARCHAR(10),
        otp_expiry DATETIME,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // ================= INTERNAL USERS =================

    await db.query(`
  CREATE TABLE IF NOT EXISTS internal_users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNIQUE,

    full_name VARCHAR(255),
    designation VARCHAR(100),
    department VARCHAR(100),
    phone VARCHAR(20),

    created_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);
    // ================= COMPANIES =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,

        user_id INT,

        company_name VARCHAR(255),
        registration_number VARCHAR(50),

        industry VARCHAR(100),
        contact_person VARCHAR(100),
        designation VARCHAR(100),

        email VARCHAR(100),
        phone VARCHAR(20),

        source ENUM(
          'google',
          'linkedin',
          'referral',
          'advertisement',
          'social_media',
          'other'
        ),

        referral_name VARCHAR(255),
        other_source VARCHAR(255),

        status ENUM('PENDING','VERIFIED','REJECTED') DEFAULT 'PENDING',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    /* =========================
       COMPANY PEOPLE
    ========================= */
    await db.query(`
      CREATE TABLE if not exists company_people (
    id INT AUTO_INCREMENT PRIMARY KEY,

    company_id INT,

    name VARCHAR(100),
    designation VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),

    role ENUM('OWNER', 'PARTNER'),

    aadhaar VARCHAR(20),
    pan VARCHAR(20),
    experience VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE
);
    `);

    // ================= APPLICATIONS =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,

        user_id INT,
        company_id INT,

        legal_name VARCHAR(255),
        brand_name VARCHAR(255),
        website VARCHAR(255),

        hq_location VARCHAR(255),
        contact_name VARCHAR(255),
        contact_email VARCHAR(100),

        service_scope TEXT,
        customer_count INT,
        employee_count INT,
        years_in_business INT,

        status ENUM(
          'SUBMITTED',
          'UNDER_REVIEW_OPS',
          'PRICING_DEFINED',
          'INVOICE_SENT',
          'PAID',
          'AUDITOR_ASSIGNED',
          'AUDIT_COMPLETED',
          'FINAL_APPROVED'
        ) DEFAULT 'SUBMITTED',

        assigned_auditor_id INT,
        assigned_reviewer_id INT,

        total_amount DECIMAL(10,2),

        verified_by INT,
        verified_at TIMESTAMP,

        last_updated_by INT,
        last_updated_at TIMESTAMP,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_auditor_id) REFERENCES users(id),
        FOREIGN KEY (assigned_reviewer_id) REFERENCES users(id),
        FOREIGN KEY (verified_by) REFERENCES users(id)
      )
    `);
    /* =========================
       APPLICATION ITEMS
    ========================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS application_items (
        id INT AUTO_INCREMENT PRIMARY KEY,

        application_id INT,
        item_name VARCHAR(255),
        package_type VARCHAR(100),

        price DECIMAL(10,2),
        final_price DECIMAL(10,2),

        status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',

        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      )
    `);

    /* =========================
       PRODUCTS (NEW)
    ========================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,

        application_id INT,

        product_name VARCHAR(255),
        category VARCHAR(100),
        description TEXT,
        industry_served VARCHAR(255),

        team_size VARCHAR(50),
        version VARCHAR(50),
        deployment_type VARCHAR(100),
        pricing_model VARCHAR(100),

        customers_count INT,
        major_clients TEXT,
        integrations TEXT,

        key_features TEXT,
        security_standards TEXT,
        uptime_sla VARCHAR(50),
        roadmap TEXT,

        package TEXT,
        remark TEXT,

        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      )
    `);

    /* =========================
       SOLUTIONS (NEW)
    ========================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS solutions (
        id INT AUTO_INCREMENT PRIMARY KEY,

        application_id INT,

        solution_name VARCHAR(255),
        category VARCHAR(100),
        description TEXT,
        industry_served VARCHAR(255),

        team_size VARCHAR(50),
        services_provided TEXT,
        projects_completed INT,
        ongoing_projects INT,

        customers_count INT,
        major_clients TEXT,

        tools_used TEXT,
        integrations TEXT,
        methodology TEXT,
        certifications TEXT,

        package TEXT,
        remark TEXT,

        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      )
    `);

    // ================= EVIDENCES =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS evidences (
        id INT AUTO_INCREMENT PRIMARY KEY,

        application_id INT,
        document_type VARCHAR(100),

        file_name VARCHAR(255),
        file_url TEXT,

        uploaded_by INT,

        verified BOOLEAN DEFAULT FALSE,
        verified_by INT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      )
    `);
    // ================= INVOICES ================= 🔥
    await db.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,

        application_id INT,

        total_amount DECIMAL(10,2),

        status ENUM(
          'DRAFT',
          'SENT',
          'NEGOTIATION',
          'ACCEPTED',
          'PAID'
        ) DEFAULT 'DRAFT',

        version INT DEFAULT 1,

        created_by INT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      )
    `);
    // ================= INVOICE MESSAGES ================= 🔥
    await db.query(`
      CREATE TABLE IF NOT EXISTS invoice_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,

        invoice_id INT,
        sender_id INT,

        sender_role ENUM(
          'APPLICANT',
          'OPERATIONS',
          'ADMIN'
        ),

        message TEXT,

        message_type ENUM(
          'TEXT',
          'PRICE_UPDATE',
          'SYSTEM'
        ) DEFAULT 'TEXT',

        is_read BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ================= AUDITOR_PROFILE =================

    await db.query(`
      CREATE TABLE if not exists auditor_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id INT NOT NULL,

  type ENUM('INDIVIDUAL','COMPANY') NOT NULL,

  -- 👤 Individual
  full_name VARCHAR(255),
  email VARCHAR(100),
  phone VARCHAR(20),
  experience_years INT,

  resume LONGBLOB,                     -- ✅ storing file

  -- 🏢 Company
  company_name VARCHAR(255),
  gstin VARCHAR(50),
  years_in_operation INT,

  company_profile LONGBLOB,            -- ✅ storing file

  -- 🌍 Common professional fields
  specialization TEXT,                 -- domain expertise
  certifications TEXT,
  linkedin_profile VARCHAR(255),
  address TEXT,

  -- 🔐 Status
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',

  is_available BOOLEAN DEFAULT TRUE,

  approved_by INT,
  approved_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);
    `);
    // ================= Reviewers =================
    await db.query(`
     CREATE TABLE if not exists reviewer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id INT NOT NULL,

  type ENUM('INDIVIDUAL','COMPANY') NOT NULL,

  -- 👤 Individual
  full_name VARCHAR(255),
  email VARCHAR(100),
  phone VARCHAR(20),
  experience_years INT,

  resume LONGBLOB,

  -- 🏢 Company
  company_name VARCHAR(255),
  gstin VARCHAR(50),
  years_in_operation INT,

  company_profile LONGBLOB,

  -- 🌍 Common
  specialization TEXT,
  certifications TEXT,
  linkedin_profile VARCHAR(255),
  address TEXT,

  -- 🔐 Status
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',

  is_available BOOLEAN DEFAULT TRUE,

  approved_by INT,
  approved_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);
    `);

    // ================= AUTH GROUPS =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS auth_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ================= PERMISSIONS =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      )
    `);

    // ================= GROUP → PERMISSIONS =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS auth_group_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT,
        permission_id INT,

        UNIQUE KEY unique_group_permission (group_id, permission_id),

        FOREIGN KEY (group_id) REFERENCES auth_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);

    // ================= USER → GROUP =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_auth_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        group_id INT,

        UNIQUE KEY unique_user_group (user_id, group_id),

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES auth_groups(id) ON DELETE CASCADE
      )
    `);

    // ================= USER PERMISSION OVERRIDE =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        permission_id INT,

        is_revoked BOOLEAN DEFAULT TRUE,

        UNIQUE KEY unique_user_permission (user_id, permission_id),

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);

    // ================= ADMIN ACCESS VIEW 🔥 =================
    await db.query(`
      CREATE OR REPLACE VIEW admin_access_view AS
      SELECT 
        u.id AS user_id,
        u.username,
        u.email,
        ag.name AS auth_group,
        p.name AS permission,
        COALESCE(up.is_revoked, FALSE) AS is_revoked

      FROM users u

      LEFT JOIN user_auth_groups uag ON u.id = uag.user_id
      LEFT JOIN auth_groups ag ON uag.group_id = ag.id

      LEFT JOIN auth_group_permissions agp ON ag.id = agp.group_id
      LEFT JOIN permissions p ON agp.permission_id = p.id

      LEFT JOIN user_permissions up 
        ON u.id = up.user_id AND p.id = up.permission_id

      WHERE u.role = 'ADMIN';
    `);

    // ================= SEED AUTH GROUPS =================
    await db.query(`
      INSERT IGNORE INTO auth_groups (name, description) VALUES

('Application Operations', 'Handles application flow, assignment, and certification process'),

('Assessor Management', 'Handles auditor/reviewer onboarding, approval, and credential issuance'),

('Finance', 'Handles invoice generation, payments, and financial tracking'),

('Reporting', 'Provides access to reports and analytics');
    `);

    // ================= SEED PERMISSIONS =================
    await db.query(`
      INSERT IGNORE INTO permissions (name) VALUES

-- Application
('view_applications'),
('verify_company_data'),

-- Assignment
('assign_auditor'),
('assign_reviewer'),

-- Evaluation
('evaluate_review_scores'),
('send_certification_result'),

-- Assessor
('invite_auditor'),
('invite_reviewer'),
('review_assessor_application'),
('approve_assessor_admin'),
('reject_assessor_admin'),
('approve_assessor_superadmin'),
('send_assessor_credentials'),

-- Finance
('generate_invoice'),
('send_invoice'),
('mark_payment_paid'),
('verify_payment'),

-- Reporting
('view_reports'),
('view_analytics');
    `);

    // ================= MAP GROUP → PERMISSIONS =================
    await db.query(`
      INSERT IGNORE INTO auth_group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM auth_groups g, permissions p
WHERE g.name = 'Application Operations'
AND p.name IN (
  'view_applications',
  'verify_company_data',
  'assign_auditor',
  'assign_reviewer',
  'evaluate_review_scores',
  'send_certification_result'
);
    `);

    await db.query(`
      INSERT IGNORE INTO auth_group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM auth_groups g, permissions p
WHERE g.name = 'Assessor Management'
AND p.name IN (
  'invite_auditor',
  'invite_reviewer',
  'review_assessor_application',
  'approve_assessor_admin',
  'reject_assessor_admin',
  'send_assessor_credentials'
);
    `);

    await db.query(`
      INSERT IGNORE INTO auth_group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM auth_groups g, permissions p
WHERE g.name = 'Finance'
AND p.name IN (
  'generate_invoice',
  'send_invoice',
  'mark_payment_paid',
  'verify_payment'
);
    `);

    await db.query(`
      INSERT IGNORE INTO auth_group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM auth_groups g, permissions p
WHERE g.name = 'Reporting'
AND p.name IN (
  'view_reports',
  'view_analytics'
);
    `);

    // ================= APPLICATION ASSESSMENT=================
    await db.query(`
      CREATE TABLE IF NOT EXISTS application_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  user_id INT NOT NULL,
  application_id INT NOT NULL,
  
  role ENUM('auditor', 'reviewer') NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys (recommended)
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
    `);

    //================= ASSESSOR INVITATIONS =================
    await db.query(`CREATE TABLE IF NOT EXISTS assessor_invitations (
  id INT AUTO_INCREMENT PRIMARY KEY,

  email VARCHAR(255) NOT NULL,
  role ENUM('AUDITOR', 'REVIEWER') NOT NULL,

  invited_by_admin_id INT NOT NULL,

  token VARCHAR(255) NOT NULL UNIQUE,

  status ENUM('PENDING', 'FILLED', 'ADMIN_APPROVED', 'ADMIN_REJECTED', 'SUPERADMIN_APPROVED', 'SUPERADMIN_REJECTED')
    DEFAULT 'PENDING',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- 🔗 FK to users table
  CONSTRAINT fk_invited_admin
    FOREIGN KEY (invited_by_admin_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
`);
    // ================= Assessor Profiles Temp =================
    await db.query(`CREATE TABLE IF NOT EXISTS assessor_profiles_temp (
  id INT AUTO_INCREMENT PRIMARY KEY,

  invitation_id INT NOT NULL,

  full_name VARCHAR(255),
  phone VARCHAR(20),
  experience_years INT,
  specialization TEXT,
  address TEXT,

  type ENUM('individual','company'),

  company_name VARCHAR(255),
  gstin VARCHAR(50),
  years_in_operation INT,

  resume LONGBLOB,
  company_profile LONGBLOB,

  status ENUM(
    'SUBMITTED',
    'ADMIN_APPROVED',
    'ADMIN_REJECTED',
    'SUPERADMIN_APPROVED',
    'SUPERADMIN_REJECTED'
  ) DEFAULT 'SUBMITTED',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (invitation_id)
    REFERENCES assessor_invitations(id)
    ON DELETE CASCADE
);
`);

    // ================= checklist_frameworks =================

    await db.query(`CREATE TABLE IF NOT EXISTS checklist_frameworks (
  id INT AUTO_INCREMENT PRIMARY KEY,

  framework_code VARCHAR(50) NOT NULL UNIQUE,
  framework_name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  description TEXT,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
  
`);

    // ================= checklist_templates  =================

    await db.query(`CREATE TABLE IF NOT EXISTS checklist_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,

  framework_id INT NOT NULL,

  checklist_type ENUM('PRODUCT','SOLUTION') NOT NULL,

  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(150) DEFAULT NULL,

  pillar_code VARCHAR(50) NOT NULL,
  pillar_name VARCHAR(150) NOT NULL,

  item_code VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,

  applicability_text TEXT,

  json_key VARCHAR(255) DEFAULT NULL,

  max_score DECIMAL(6,2) NOT NULL DEFAULT 0,
  min_required_score DECIMAL(6,2) DEFAULT 0,

  is_critical BOOLEAN DEFAULT FALSE,
  evidence_required BOOLEAN DEFAULT TRUE,

  item_status_default ENUM(
    'pending',
    'in_review',
    'completed',
    'not_applicable'
  ) DEFAULT 'pending',

  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_checklist_templates_framework
    FOREIGN KEY (framework_id) REFERENCES checklist_frameworks(id) ON DELETE CASCADE,

  UNIQUE KEY uq_template_item (
    framework_id,
    checklist_type,
    category,
    subcategory,
    pillar_code,
    item_code
  )
);

`);

    // ================= Assessment_checklists =================
    await db.query(`
CREATE TABLE IF NOT EXISTS assessment_checklists (
  id INT AUTO_INCREMENT PRIMARY KEY,

  application_id INT NOT NULL,
  company_id INT NOT NULL,

  entity_type ENUM('product','solution') NOT NULL,
  entity_id INT NOT NULL,
  entity_name VARCHAR(255) NOT NULL,

  checklist_type ENUM('PRODUCT','SOLUTION') NOT NULL,

  framework_id INT NOT NULL,
  framework_version VARCHAR(50) NOT NULL,

  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(150) DEFAULT NULL,

  assigned_auditor_id INT DEFAULT NULL,
  assigned_reviewer_id INT DEFAULT NULL,

  assessment_date DATE DEFAULT NULL,
  notes TEXT,
  review_comments TEXT,

  status ENUM(
    'DRAFT',
  'IN_PROGRESS',
  'SUBMITTED',
  'REVIEWED',
  'REWORK_REQUIRED',
  'FINALIZED'
  ) DEFAULT 'DRAFT',

  total_score DECIMAL(6,2) DEFAULT 0,
  max_score DECIMAL(6,2) DEFAULT 0,
  percentage_score DECIMAL(6,2) DEFAULT 0,

  trust_index DECIMAL(5,2) DEFAULT 0,

  critical_failure BOOLEAN DEFAULT FALSE,
  pillar_rule_failure BOOLEAN DEFAULT FALSE,

  evaluation_status ENUM(
    'NOT_STARTED',
    'IN_PROGRESS',
    'COMPLETED'
  ) DEFAULT 'NOT_STARTED',

  certification_status ENUM(
    'NOT_EVALUATED',
    'CERTIFIED',
    'WITHHELD',
    'NOT_CERTIFIED'
  ) DEFAULT 'NOT_EVALUATED',

  certification_band VARCHAR(100) DEFAULT NULL,
  outcome_label VARCHAR(150) DEFAULT NULL,

  certificate_eligible BOOLEAN DEFAULT FALSE,

  issued_on DATE DEFAULT NULL,
  valid_till DATE DEFAULT NULL,

  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  finalized_at TIMESTAMP NULL DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_assessment_checklists_application
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,

  CONSTRAINT fk_assessment_checklists_company
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,

  CONSTRAINT fk_assessment_checklists_auditor
    FOREIGN KEY (assigned_auditor_id) REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT fk_assessment_checklists_reviewer
    FOREIGN KEY (assigned_reviewer_id) REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT fk_assessment_checklists_framework
    FOREIGN KEY (framework_id) REFERENCES checklist_frameworks(id) ON DELETE RESTRICT,

  UNIQUE KEY uq_assessment_entity (
    application_id,
    entity_type,
    entity_id,
    framework_id
  )
);
`);

    // ================= checklist_response_items  =================
    await db.query(`
CREATE TABLE IF NOT EXISTS checklist_response_items (
  id INT AUTO_INCREMENT PRIMARY KEY,

  checklist_id INT NOT NULL,
  template_id INT DEFAULT NULL,

  checklist_type ENUM('PRODUCT','SOLUTION') NOT NULL,

  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(150) DEFAULT NULL,

  pillar_code VARCHAR(50) NOT NULL,
  pillar_name VARCHAR(150) NOT NULL,

  item_code VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,

  json_key VARCHAR(255) DEFAULT NULL,

  max_score DECIMAL(6,2) NOT NULL DEFAULT 0,
  min_required_score DECIMAL(6,2) DEFAULT 0,
  awarded_score DECIMAL(6,2) DEFAULT 0,

  critical_item BOOLEAN DEFAULT FALSE,
  evidence_required BOOLEAN DEFAULT TRUE,

  status ENUM(
    'pending',
    'in_review',
    'completed',
    'not_applicable'
  ) DEFAULT 'pending',

  observation TEXT,
  risk_note TEXT,
  recommendation TEXT,
  evidence_ref TEXT,
  comments TEXT,

  assessor_updated_by INT DEFAULT NULL,
  reviewer_updated_by INT DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_response_items_checklist
    FOREIGN KEY (checklist_id) REFERENCES assessment_checklists(id) ON DELETE CASCADE,

  CONSTRAINT fk_response_items_template
    FOREIGN KEY (template_id) REFERENCES checklist_templates(id) ON DELETE SET NULL,

  CONSTRAINT fk_response_items_assessor_user
    FOREIGN KEY (assessor_updated_by) REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT fk_response_items_reviewer_user
    FOREIGN KEY (reviewer_updated_by) REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE KEY uq_checklist_item (
    checklist_id,
    pillar_code,
    item_code
  )
);
`);

    // ================= Assessment_pillar_scores =================

    await db.query(`CREATE TABLE IF NOT EXISTS assessment_pillar_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,

  checklist_id INT NOT NULL,

  pillar_code VARCHAR(50) NOT NULL,
  pillar_name VARCHAR(150) NOT NULL,

  awarded_score DECIMAL(6,2) DEFAULT 0,
  max_score DECIMAL(6,2) DEFAULT 0,
  percentage_score DECIMAL(6,2) DEFAULT 0,

  minimum_required_score DECIMAL(6,2) DEFAULT 0,
  meets_minimum_rule BOOLEAN DEFAULT TRUE,

  risk_level ENUM('LOW','MEDIUM','HIGH') DEFAULT NULL,
  summary_note TEXT DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_pillar_scores_checklist
    FOREIGN KEY (checklist_id) REFERENCES assessment_checklists(id) ON DELETE CASCADE,

  UNIQUE KEY uq_checklist_pillar (
    checklist_id,
    pillar_code
  )
);
`);

    // ================= Assessment_reports =================

    await db.query(`
CREATE TABLE IF NOT EXISTS assessment_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,

  checklist_id INT NOT NULL,

  report_type ENUM(
    'EVALUATION_REPORT',
    'IMPROVEMENT_ADVISORY',
    'CERTIFICATION_REPORT'
  ) NOT NULL,

  report_status ENUM(
    'DRAFT',
    'FINAL'
  ) DEFAULT 'DRAFT',

  strengths TEXT,
  risks TEXT,
  recommendations TEXT,
  improvement_advisory TEXT,

  generated_json JSON DEFAULT NULL,

  generated_by INT DEFAULT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_assessment_reports_checklist
    FOREIGN KEY (checklist_id) REFERENCES assessment_checklists(id) ON DELETE CASCADE,

  CONSTRAINT fk_assessment_reports_user
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);
`);
    // ================= Assessment_outcome_history  =================

    await db.query(`CREATE TABLE IF NOT EXISTS assessment_outcome_history (
  id INT AUTO_INCREMENT PRIMARY KEY,

  checklist_id INT NOT NULL,

  previous_status VARCHAR(100) DEFAULT NULL,
  new_status VARCHAR(100) DEFAULT NULL,

  previous_certification_status VARCHAR(100) DEFAULT NULL,
  new_certification_status VARCHAR(100) DEFAULT NULL,

  previous_certification_band VARCHAR(100) DEFAULT NULL,
  new_certification_band VARCHAR(100) DEFAULT NULL,

  remarks TEXT,
  action_by INT DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_outcome_history_checklist
    FOREIGN KEY (checklist_id) REFERENCES assessment_checklists(id) ON DELETE CASCADE,

  CONSTRAINT fk_outcome_history_user
    FOREIGN KEY (action_by) REFERENCES users(id) ON DELETE SET NULL
);
`);

    // ================= CERTIFICATES =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,

  checklist_id INT NOT NULL,
  application_id INT NOT NULL,
  company_id INT NOT NULL,

  certificate_name VARCHAR(255) NOT NULL,
  certificate_id_code VARCHAR(100) NOT NULL UNIQUE,

  certification_band VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(150) DEFAULT NULL,

  issue_date DATE NOT NULL,
  valid_till DATE NOT NULL,

  drive_file_id VARCHAR(255) DEFAULT NULL,
  certificate_url TEXT DEFAULT NULL,
  badge_url TEXT DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_certificates_checklist
    FOREIGN KEY (checklist_id) REFERENCES assessment_checklists(id) ON DELETE CASCADE,

  CONSTRAINT fk_certificates_application
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,

  CONSTRAINT fk_certificates_company
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
    `);

    // ================= ADMIN CREATION =================
    const [superadmin] = await db.query(
      "SELECT * FROM users WHERE role = 'SUPERADMIN'",
    );

    if (superadmin.length === 0) {
      const bcrypt = (await import("bcryptjs")).default;

      const password = process.env.SUPERADMIN_PASSWORD || "SuperAdmin@123";
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.query(
        `INSERT INTO users 
   (username, email, password, role, is_verified, is_temp_password, is_active) 
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          "superadmin",
          "superadmin@cioverified.com",
          hashedPassword,
          "SUPERADMIN",
          true,
          false, // ✅ no temp password
          true,
        ],
      );

      console.log("✅ Super Admin created (superadmin@cioverified.com)");
    }

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ DB Init Error:", error.message);
  }
};
