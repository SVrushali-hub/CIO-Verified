export const uploadEvidence = async (req, res) => {
  try {
    const { application_id, document_type } = req.body;

    // After Google Drive upload (later)
    const fileUrl = "TEMP_URL";

    await db.query(
      `INSERT INTO evidences 
      (application_id, document_type, file_name, file_url, uploaded_by)
      VALUES (?, ?, ?, ?, ?)`,
      [
        application_id,
        document_type,
        req.file.originalname,
        fileUrl,
        req.user.id
      ]
    );

    res.json({ message: "Document uploaded" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};