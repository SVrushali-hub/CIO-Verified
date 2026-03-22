export const createApplication = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      legal_name,
      brand_name,
      website,
      hq_location,
      contact_name,
      contact_email,
      service_scope,
      customer_count,
      employee_count,
      years_in_business,
      items
    } = req.body;

    const [appResult] = await db.query(
      `INSERT INTO applications 
      (user_id, legal_name, brand_name, website, hq_location, contact_name, contact_email, service_scope, customer_count, employee_count, years_in_business)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        legal_name,
        brand_name,
        website,
        hq_location,
        contact_name,
        contact_email,
        service_scope,
        customer_count,
        employee_count,
        years_in_business
      ]
    );

    const applicationId = appResult.insertId;
    const files = req.files;

for (let file of files) {
  await db.query(
    `INSERT INTO evidences (application_id, file_name, file_url)
     VALUES (?, ?, ?)`,
    [applicationId, file.originalname, file.path]
  );
}
    for (let item of items) {
      await db.query(
        `INSERT INTO application_items (application_id, item_name, package_type)
         VALUES (?, ?, ?)`,
        [applicationId, item.name, item.package_type]
      );
    }

    res.status(201).json({ message: "Application created" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};