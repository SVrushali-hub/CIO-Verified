import multer from "multer";
import path from "path";
import fs from "fs";

// create folders if not exist
const createFolder = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/others";

    if (file.fieldname === "gstDoc") folder = "uploads/gst";
    if (file.fieldname === "sezDoc") folder = "uploads/sez";
    if (file.fieldname === "companyProfile") folder = "uploads/profile";
    if (file.fieldname === "pitchDeck") folder = "uploads/pitch";
    if (file.fieldname === "certifications") folder = "uploads/certs";

    // 🔥 ADD THESE FOR ASSESSOR
    if (file.fieldname === "resume") folder = "uploads/resume";
    if (file.fieldname === "company_profile") folder = "uploads/company_profile";

    createFolder(folder);
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });