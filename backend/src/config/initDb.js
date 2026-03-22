import db from "./db.js";

export const initDatabase = async () => {
  try {
    console.log("🔄 Initializing Database...");

    // ================= USERS =================
    await db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),

    role ENUM('APPLICANT','AUDITOR','REVIEWER','ADMIN') DEFAULT 'APPLICANT',

    is_verified BOOLEAN DEFAULT FALSE,
    otp VARCHAR(10),
    otp_expiry DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ================= APPLICATIONS =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,

        user_id INT,

        legal_name VARCHAR(255),
        brand_name VARCHAR(255),
        website VARCHAR(255),
        hq_location VARCHAR(255),

        contact_name VARCHAR(255),
        contact_email VARCHAR(255),

        service_scope TEXT,
        customer_count INT,
        employee_count INT,
        years_in_business FLOAT,

        status ENUM(
          'SUBMITTED',
          'PENDING_REVIEW',
          'INVOICE_SENT',
          'NEGOTIATION',
          'AWAITING_PAYMENT',
          'UNDER_VERIFICATION',
          'COMPLETED'
        ) DEFAULT 'SUBMITTED',

        total_amount DECIMAL(10,2) DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // ================= APPLICATION ITEMS =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS application_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT,
        item_name VARCHAR(255),
        package_type ENUM(
          'VERIFICATION',
          'VERIFICATION_CERTIFICATION',
          'FULL_PACKAGE'
        ),
        price DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'PENDING',
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      )
    `);

    // ================= EVIDENCES =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS evidences (
        id INT AUTO_INCREMENT PRIMARY KEY,

        application_id INT,

        document_type ENUM(
          'CIN',
          'GST',
          'INCORPORATION',
          'PAN',
          'ADDRESS_PROOF',
          'LICENSE',
          'OTHER'
        ),

        file_name VARCHAR(255),
        drive_file_id VARCHAR(255),
        file_url TEXT,

        uploaded_by INT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      )
    `);

    // ================= CERTIFICATES =================
    await db.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,

        application_id INT,
        item_id INT,

        certificate_name VARCHAR(255),
        drive_file_id VARCHAR(255),
        certificate_url TEXT,

        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES application_items(id) ON DELETE CASCADE
      )
    `);

    // ================= ADMIN CREATION =================
    const [admin] = await db.query(
      "SELECT * FROM users WHERE role = 'ADMIN'"
    );

    if (admin.length === 0) {
      const bcrypt = (await import("bcryptjs")).default;
      const hashedPassword = await bcrypt.hash("Admin@123", 10);

      await db.query(
        "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
        ["admin@cioverified.com", hashedPassword, "ADMIN"]
      );

      console.log("✅ Admin created (admin@cioverified.com / Admin@123)");
    }

    console.log("✅ Database initialized successfully");

  } catch (error) {
    console.error("❌ DB Init Error:", error.message);
  }
};