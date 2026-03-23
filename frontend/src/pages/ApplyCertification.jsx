import { useState } from "react";
import "../styles/applyCertification.css";

function CompanyApplication() {
  // ================= VALIDATION REGEX =================
const phoneRegex = /^\d{10}$/;
const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const pincodeRegex = /^\d{6}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const websiteRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/\S*)?$/;

// optional file state
const [files, setFiles] = useState({
  gstDoc: null,
  sezDoc: null,
  companyProfile: null,
  pitchDeck: null,
  certifications: []
});
const [errors, setErrors] = useState({});
const handleFileChange = (e) => {
  const { name, files: selectedFiles } = e.target;

  setFiles((prev) => ({
    ...prev,
   [name]: Array.from(selectedFiles)
  }));
};
  const [step, setStep] = useState(1);
const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    companyDetails: { hasGST: "" },
    owners: [
      {
        name: "",
        designation: "",
        email: "",
        phone: "",
        experience: "",
        aadhaar: "",
        pan: "",
      },
    ],
    partners: [],
    businessType: "",
    products: [],
    solutions: [],
  });
  
  const handleOwnerChange = (index, e) => {
  const { name, value } = e.target;
  const updated = [...formData.owners];
  updated[index][name] = value;
  setFormData({ ...formData, owners: updated });
  setErrors((prev) => ({
  ...prev,
  [`owner_${index}_${name}`]: ""
}));
};

const validateStep = () => {
  // ================= STEP 1 =================
  if (step === 1) {
  const c = formData.companyDetails;
  let newErrors = {};

  if (!c.organisationName)
    newErrors.organisationName = "Organisation name required";

  if (!c.registeredAddress)
    newErrors.registeredAddress = "Address required";

  if (!c.country) newErrors.country = "Country required";
  if (!c.state) newErrors.state = "State required";
  if (!c.city) newErrors.city = "City required";

  if (!c.pincode)
    newErrors.pincode = "Pincode required";
  else if (!pincodeRegex.test(c.pincode))
    newErrors.pincode = "Invalid pincode";

  if (!c.officialEmail)
    newErrors.officialEmail = "Email required";
  else if (!emailRegex.test(c.officialEmail))
    newErrors.officialEmail = "Invalid email";

  if (c.website && !websiteRegex.test(c.website))
    newErrors.website = "Invalid website";

  if (!c.contactNumber)
    newErrors.contactNumber = "Contact required";
  else if (!phoneRegex.test(c.contactNumber))
    newErrors.contactNumber = "Invalid number";

  if (c.hasGST === "yes" && !c.gstinNumber)
    newErrors.gstinNumber = "GSTIN required";

  if (c.hasGST === "yes" && !files.gstDoc)
  newErrors.gstDoc = "GST document required";

  if (c.hasGST === "no" && !files.sezDoc)
    newErrors.sezDoc = "SEZ document required";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return false;
  }

  setErrors({});
}

  // ================= STEP 2 =================
  if (step === 2) {
  let newErrors = {};

  formData.owners.forEach((o, i) => {
    if (!o.name)
      newErrors[`owner_${i}_name`] = "Name required";

    if (!o.email)
      newErrors[`owner_${i}_email`] = "Email required";
    else if (!emailRegex.test(o.email))
      newErrors[`owner_${i}_email`] = "Invalid email";

    if (!o.phone)
      newErrors[`owner_${i}_phone`] = "Phone required";
    else if (!phoneRegex.test(o.phone))
      newErrors[`owner_${i}_phone`] = "Invalid phone";

    if (o.aadhaar && !aadhaarRegex.test(o.aadhaar))
      newErrors[`owner_${i}_aadhaar`] = "Invalid Aadhaar";

    if (o.pan && !panRegex.test(o.pan))
      newErrors[`owner_${i}_pan`] = "Invalid PAN";
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return false;
  }

  setErrors({});
}

  // ================= STEP 3 =================
  if (step === 3) {
  let newErrors = {};

  if (!formData.businessType)
    newErrors.businessType = "Select business type";

  if (
    (formData.businessType === "product" ||
      formData.businessType === "both") &&
    formData.products.length === 0
  ) {
    newErrors.products = "Add at least one product";
  }

  if (
    (formData.businessType === "solution" ||
      formData.businessType === "both") &&
    formData.solutions.length === 0
  ) {
    newErrors.solutions = "Add at least one solution";
  }
  
  if (!agreed)
    newErrors.agreed = "You must accept disclaimer";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return false;
  }

  setErrors({});
}

  // ================= STEP 4 =================

if (step === 4) {
  let newErrors = {};

  if (!files.companyProfile)
    newErrors.companyProfile = "Upload company profile";

  if (!files.pitchDeck)
    newErrors.pitchDeck = "Upload pitch deck";


  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return false;
  }

  setErrors({});
}

  return true;
};
  /* ================= HANDLERS ================= */
 const handleCompanyChange = (e) => {
  const { name, value } = e.target;

  setFormData({
    ...formData,
    companyDetails: {
      ...formData.companyDetails,
      [name]: value
    }
  });

  // ✅ clear error for that field
  setErrors((prev) => ({ ...prev, [name]: "" }));
};

  const addOwner = () => {
  setFormData({
    ...formData,
    owners: [
      ...formData.owners,
      {
        name: "",
        designation: "",
        email: "",
        phone: "",
        experience: "",
        aadhaar: "",
        pan: "",
      },
    ],
  });
};

  const removeOwner = (i) => {
    const updated = formData.owners.filter((_, index) => index !== i);
    setFormData({ ...formData, owners: updated });
  };

  const addPartner = () => {
  setFormData({
    ...formData,
    partners: [
      ...formData.partners,
      {
        name: "",
        designation: "",
        email: "",
        phone: ""
      }
    ]
  });
};

  const removePartner = (i) => {
    const updated = formData.partners.filter((_, index) => index !== i);
    setFormData({ ...formData, partners: updated });
  };

 
  const [hasOtherCert, setHasOtherCert] = useState("");
  
  // ✅ INITIAL STATES FIXED
  const initialProduct = {
    productName: "",
    category: "",
    customCategory: "",
    description: "",
    industryServed: "",
    customIndustry: "",
    teamSize: "",
    version: "",
    deploymentType: "",
    customDeployment: "",
    pricingModel: "",
    customPricing: "",
    customersCount: "",
    majorClients: "",
    integrations: "",
    keyFeatures: "",
    securityStandards: "",
    uptimeSLA: "",
    roadmap: "",
    package: [],
    remark: "",
  };

  const initialSolution = {
    solutionName: "",
    category: "",
    customCategory: "",
    description: "",
    industryServed: "",
    customIndustry: "",
    teamSize: "",
    servicesProvided: "",
    customService: "",
    projectsCompleted: "",
    ongoingProjects: "",
    customersCount: "",
    majorClients: "",
    toolsUsed: "",
    integrations: "",
    methodology: "",
    customMethodology: "",
    certifications: "",
    package: [],
    remark: "",
  };

  const [productForm, setProductForm] = useState(initialProduct);
  const [solutionForm, setSolutionForm] = useState(initialSolution);

  /* ================= PRODUCT ================= */
  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setProductForm((prev) => {
        const existing = prev.package || [];
        return {
          ...prev,
          package: checked
            ? [...existing, value]
            : existing.filter((item) => item !== value),
        };
      });
    } else {
      setProductForm({ ...productForm, [name]: value });
    }
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { ...productForm }],
    });

    setProductForm(initialProduct); // ✅ reset
  };

  const removeProduct = (i) => {
    const updated = formData.products.filter((_, index) => index !== i);
    setFormData({ ...formData, products: updated });
  };

  /* ================= SOLUTION ================= */
  const handleSolutionChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setSolutionForm((prev) => {
        const existing = prev.package || [];
        return {
          ...prev,
          package: checked
            ? [...existing, value]
            : existing.filter((item) => item !== value),
        };
      });
    } else {
      setSolutionForm({ ...solutionForm, [name]: value });
    }
  };

  const addSolution = () => {
    setFormData({
      ...formData,
      solutions: [...formData.solutions, { ...solutionForm }],
    });

    setSolutionForm(initialSolution); // ✅ reset
  };

  const removeSolution = (i) => {
    const updated = formData.solutions.filter((_, index) => index !== i);
    setFormData({ ...formData, solutions: updated });
  };

  return (
    <div className="apply-wrapper">
      <div className="apply-card">
        <h2>Apply for CIO Certification</h2>

        {/* ================= PROGRESS ================= */}
        <div className="progress-bar">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="progress-step">
              <div className={`circle ${step >= s ? "active" : ""}`}>{s}</div>
              <span>
                {s === 1 && "Company"}
                {s === 2 && "Owners"}
                {s === 3 && "Items"}
                {s === 4 && "Evidence"}
              </span>
            </div>
          ))}
        </div>

        {/* ================= SECTION 1 ================= */}
        {step === 1 && (
          <>
            <h3>Company Details</h3>

            <input
  name="organisationName"
  placeholder="Organisation Name"
  onChange={handleCompanyChange}
/>
{errors.organisationName && (
  <span className="error">{errors.organisationName}</span>
)}

            <input
              name="brandName"
              placeholder="Brand Name"
              onChange={handleCompanyChange}
            />

            <textarea
              name="registeredAddress"
              placeholder="Registered Address"
              onChange={handleCompanyChange}
            />
            <textarea
              name="operationalAddress"
              placeholder="Operational Address"
              onChange={handleCompanyChange}
            />

            <input
              name="billingAddress"
              placeholder="Billing Address"
              onChange={handleCompanyChange}
            />
            <input
              name="shippingAddress"
              placeholder="Shipping Address"
              onChange={handleCompanyChange}
            />

            <div className="grid">
              <input
                name="country"
                placeholder="Country"
                onChange={handleCompanyChange}
              />
              <input
                name="state"
                placeholder="State"
                onChange={handleCompanyChange}
              />
            </div>

            <div className="grid">
              <input
                name="city"
                placeholder="City"
                onChange={handleCompanyChange}
              />
                       <input
  name="pincode"
  placeholder="Pincode"
 onChange={(e) => {
  const value = e.target.value.replace(/\D/g, "");
  handleCompanyChange({
    target: { name: "pincode", value }
  });
}}
maxLength={6}
/>
{errors.pincode && (
  <span className="error">{errors.pincode}</span>
)}
              </div>
     

           <input
  name="website"
  placeholder="Website"
  onChange={handleCompanyChange}
/>
{errors.website && (
  <span className="error">{errors.website}</span>
)}

           <input
  name="officialEmail"
  placeholder="Official Email"
  onChange={handleCompanyChange}
/>
{errors.officialEmail && (
  <span className="error">{errors.officialEmail}</span>
)}
            <input
  name="contactNumber"
  placeholder="Contact Number"
  maxLength={10}
  onChange={(e) => {
  const value = e.target.value.replace(/\D/g, "");
  handleCompanyChange({
    target: { name: "contactNumber", value }
  });
}}
/>
{errors.contactNumber && (
  <span className="error">{errors.contactNumber}</span>
)}

            <div className="grid">
              <input
  name="yearOfIncorporation"
  placeholder="Year of Incorporation"
  onChange={handleCompanyChange}
/>

<input
  name="companySize"
  placeholder="Company Size"
  onChange={handleCompanyChange}
/>
            </div>

            <input
  name="industry"
  placeholder="Industry"
 onChange={(e) => {
  const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
  handleCompanyChange({
    target: { name: "industry", value }
  });
}}
/>

            {/* GST */}
            <div className="gst-block">
              <label>Do you have GSTIN?</label>

              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="hasGST"
                    value="yes"
                    onChange={handleCompanyChange}
                  />{" "}
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="hasGST"
                    value="no"
                    onChange={handleCompanyChange}
                  />{" "}
                  No
                </label>
              </div>
            </div>

            {formData.companyDetails.hasGST === "yes" && (
              <>
                {/* GSTIN INPUT */}
                <div className="form-row">
                  <input
  name="gstinNumber"
  placeholder="GSTIN Number"
  onChange={handleCompanyChange}
/>
{errors.gstinNumber && (
  <span className="error">{errors.gstinNumber}</span>
)}
                </div>

                {/* FILE UPLOAD */}
                <div className="file-row">
                  <span>Incorporation Certificate</span>
        
  <input type="file" name="gstDoc" onChange={handleFileChange} />

  {errors.gstDoc && (
    <span className="error">{errors.gstDoc}</span>
  )}
</div>
                
              </>
            )}
            {formData.companyDetails.hasGST === "no" && (
  <div className="file-row">
    <span>SEZ Document</span>

    <input
      type="file"
      name="sezDoc"
      onChange={handleFileChange}
    />

    {errors.sezDoc && (
      <span className="error">{errors.sezDoc}</span>
    )}
  </div>
)}

            <button className="btn-primary" onClick={() => {
  if (validateStep()) setStep(2);
}}>
              Next
            </button>
          </>
        )}

        {/* ================= SECTION 2 ================= */}
        {step === 2 && (
          <>
            <h3>Owners</h3>

         {formData.owners.map((o, i) => (
  <div key={i} className="card">

    <div className="grid">
      <div>
        <input
          name="name"
          placeholder="Name"
          value={o.name || ""}
          onChange={(e) => handleOwnerChange(i, e)}
        />
        {errors[`owner_${i}_name`] && (
          <span className="error">{errors[`owner_${i}_name`]}</span>
        )}
      </div>

      <div>
        <input
          name="designation"
          placeholder="Designation"
          value={o.designation || ""}
          onChange={(e) => handleOwnerChange(i, e)}
        />
      </div>
    </div>

    <div className="grid">
      <div>
        <input
          name="email"
          placeholder="Email"
          value={o.email || ""}
          onChange={(e) => handleOwnerChange(i, e)}
        />
        {errors[`owner_${i}_email`] && (
          <span className="error">{errors[`owner_${i}_email`]}</span>
        )}
      </div>

      <div>
        <input
          name="phone"
          placeholder="Phone"
          value={o.phone || ""}
          onChange={(e) => {
  const value = e.target.value.replace(/\D/g, "");
  handleOwnerChange(i, {
    target: { name: "phone", value }
  });
}}
maxLength={10}
        />
        {errors[`owner_${i}_phone`] && (
          <span className="error">{errors[`owner_${i}_phone`]}</span>
        )}
      </div>
    </div>

    <div className="grid">
      <div>
        <input
          name="experience"
          placeholder="Experience"
          value={o.experience || ""}
          onChange={(e) => handleOwnerChange(i, e)}
        />
      </div>

      <div>
        <input
          name="aadhaar"
          placeholder="Aadhaar Number"
          value={o.aadhaar || ""}
onChange={(e) => {
  const value = e.target.value.replace(/\D/g, "");
  handleOwnerChange(i, {
    target: { name: "aadhaar", value }
  });
}}
maxLength={12}
        />
        {errors[`owner_${i}_aadhaar`] && (
          <span className="error">{errors[`owner_${i}_aadhaar`]}</span>
        )}
      </div>
    </div>

    <input
      name="pan"
      placeholder="PAN Number"
      value={o.pan || ""}
      onChange={(e) => {
  const value = e.target.value.toUpperCase();
  handleOwnerChange(i, {
    target: { name: "pan", value }
  });
}}
    />
    {errors[`owner_${i}_pan`] && (
      <span className="error">{errors[`owner_${i}_pan`]}</span>
    )}

    {i > 0 && (
      <button className="btn-remove" onClick={() => removeOwner(i)}>
        Remove
      </button>
    )}
  </div>
))}
<button className="btn-add" onClick={addOwner}>
  + Add Owner
</button>
           <h3>Partners</h3>

            {formData.partners.map((p, i) => (
              <div key={i} className="card">
                <div className="grid">
                  <input
  value={p.name || ""}
  onChange={(e) => {
    const updated = [...formData.partners];
    updated[i].name = e.target.value;
    setFormData({ ...formData, partners: updated });
  }}
/>
                  <input
  value={p.designation || ""}
  onChange={(e) => {
    const updated = [...formData.partners];
    updated[i].designation = e.target.value;
    setFormData({ ...formData, partners: updated });
  }}
/>
                </div>

                <div className="grid">
                  <input
  value={p.email || ""}
  onChange={(e) => {
    const updated = [...formData.partners];
    updated[i].email = e.target.value;
    setFormData({ ...formData, partners: updated });
  }}
/>

                 <input
  value={p.phone || ""}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, "");
    const updated = [...formData.partners];
    updated[i].phone = value;
    setFormData({ ...formData, partners: updated });
  }}
  maxLength={10}
/>
                </div>

                <button className="btn-remove" onClick={() => removePartner(i)}>
                  Remove
                </button>
              </div>
            ))}

            <button className="btn-add" onClick={addPartner}>
              + Add Partner
            </button>
            <div className="button-group">
              <button className="btn-back" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn-primary" onClick={() => {
  if (validateStep()) setStep(3);
}}>
                Next
              </button>
            </div>
          </>
        )}

        {/* ================= SECTION 3 ================= */}
        {step === 3 && (
          <>
            <h3>Business Type</h3>

           <select
  value={formData.businessType}
  onChange={(e) => {
  setFormData({
    ...formData,
    businessType: e.target.value
  });

  setErrors((prev) => ({ ...prev, businessType: "" }));
}}
>
              <option value="">Select</option>
              <option value="product">Product</option>
              <option value="solution">Solution</option>
              <option value="both">Both</option>
            </select>

            {/* ================= DROPDOWN DATA ================= */}
            {(() => {
              const productCategories = [
                "ERP",
                "CRM",
                "HRMS",
                "Finance",
                "AI",
                "Security",
                "Other",
              ];
              const industries = [
                "Finance",
                "Healthcare",
                "Retail",
                "Manufacturing",
                "Education",
                "Government",
                "Other",
              ];
              const deploymentTypes = [
                "Cloud",
                "On-Premise",
                "Hybrid",
                "Other",
              ];
              const pricingModels = [
                "Subscription",
                "One-time",
                "Usage-based",
                "Freemium",
                "Other",
              ];

              const solutionCategories = [
                "Implementation",
                "Integration",
                "Consulting",
                "MSP",
                "Audit",
                "Other",
              ];
              const methodologies = [
                "Agile",
                "Waterfall",
                "ITIL",
                "DevOps",
                "Hybrid",
                "Other",
              ];
              const servicesList = [
                "ERP Implementation",
                "CRM Implementation",
                "Cloud Migration",
                "Security Audit",
                "Support Services",
                "Other",
              ];

              return (
                <>
                  {/* ================= PRODUCTS ================= */}

                  {(formData.businessType=== "product" ||formData.businessType === "both") && (
                    <>
                      <h3>Add Product</h3>
                      <input
                        name="productName"
                        placeholder="Product Name"
                        value={productForm.productName}
                        onChange={handleProductChange}
                      />
                      <select
                        name="category"
                        value={productForm.category}
                        onChange={handleProductChange}
                      >
                        <option value="">Category</option>
                        {productCategories.map((c, i) => (
                          <option key={i}>{c}</option>
                        ))}
                      </select>
                      {productForm.category === "Other" && (
                        <input
                          name="customCategory"
                          placeholder="Enter Category"
                          value={productForm.customCategory}
                          onChange={handleProductChange}
                        />
                      )}
                      <textarea
                        name="description"
                        placeholder="Description"
                        value={productForm.description}
                        onChange={handleProductChange}
                      />
                      <select
                        name="industryServed"
                        value={productForm.industryServed}
                        onChange={handleProductChange}
                      >
                        <option value="">Industry</option>
                        {industries.map((i, idx) => (
                          <option key={idx}>{i}</option>
                        ))}
                      </select>
                      {productForm.industryServed === "Other" && (
                        <input
                          name="customIndustry"
                          placeholder="Enter Industry"
                          value={productForm.customIndustry}
                          onChange={handleProductChange}
                        />
                      )}
                      <input
                        name="teamSize"
                        placeholder="Team Size"
                        value={productForm.teamSize}
                        onChange={handleProductChange}
                      />
                      <input
                        name="version"
                        placeholder="Version"
                        value={productForm.version}
                        onChange={handleProductChange}
                      />
                      <select
                        name="deploymentType"
                        value={productForm.deploymentType}
                        onChange={handleProductChange}
                      >
                        <option value="">Deployment</option>
                        {deploymentTypes.map((d, i) => (
                          <option key={i}>{d}</option>
                        ))}
                      </select>
                      {productForm.deploymentType === "Other" && (
                        <input
                          name="customDeployment"
                          placeholder="Enter Deployment"
                          value={productForm.customDeployment}
                          onChange={handleProductChange}
                        />
                      )}
                      <select
                        name="pricingModel"
                        value={productForm.pricingModel}
                        onChange={handleProductChange}
                      >
                        <option value="">Pricing</option>
                        {pricingModels.map((p, i) => (
                          <option key={i}>{p}</option>
                        ))}
                      </select>
                      {productForm.pricingModel === "Other" && (
                        <input
                          name="customPricing"
                          placeholder="Enter Pricing"
                          value={productForm.customPricing}
                          onChange={handleProductChange}
                        />
                      )}
                      <input
                        name="customersCount"
                        placeholder="Customers Count"
                        value={productForm.customersCount}
                        onChange={handleProductChange}
                      />
                      <input
                        name="majorClients"
                        placeholder="Major Clients"
                        value={productForm.majorClients}
                        onChange={handleProductChange}
                      />
                      <input
                        name="integrations"
                        placeholder="Integrations"
                        value={productForm.integrations}
                        onChange={handleProductChange}
                      />
                      <input
                        name="keyFeatures"
                        placeholder="Key Features"
                        value={productForm.keyFeatures}
                        onChange={handleProductChange}
                      />
                      <input
                        name="securityStandards"
                        placeholder="Security Standards"
                        value={productForm.securityStandards}
                        onChange={handleProductChange}
                      />
                      <input
                        name="uptimeSLA"
                        placeholder="Uptime SLA"
                        value={productForm.uptimeSLA}
                        onChange={handleProductChange}
                      />
                      <input
                        name="roadmap"
                        placeholder="Roadmap"
                        value={productForm.roadmap}
                        onChange={handleProductChange}
                      />
                      {/* PACKAGE */}
                              <div className="package-block">
  <label className="section-label">
    What are you looking for in this product?
  </label>

  <div className="checkbox-group">
    {["Certification", "Verification", "Marketing"].map((pkg) => (
      <label key={pkg} className="checkbox-item">
        <input
          type="checkbox"
          value={pkg}
         checked={productForm.package.includes(pkg)}
onChange={handleProductChange}
        />
        {pkg}
      </label>
    ))}
  </div>
</div>
                      <input
                        name="remark"
                        placeholder="Remark"
                        value={productForm.remark}
                        onChange={handleProductChange}
                      />
                      <button className="btn-add" onClick={addProduct}>
                        Add Product
                      </button>
                      {/* TABLE */}{" "}
                      <div className="table-container">
                        {" "}
                        <table>
                          {" "}
                          <thead>
                            {" "}
                            <tr>
                              {" "}
                              <th>Name</th> <th>Description</th>{" "}
                              <th>Category</th> <th>Industry</th> <th>Team</th>{" "}
                              <th>Version</th> <th>Deployment</th>{" "}
                              <th>Pricing</th> <th>Customers</th>{" "}
                              <th>Clients</th> <th>Integrations</th>{" "}
                              <th>Features</th> <th>Security</th> <th>SLA</th>{" "}
                              <th>Roadmap</th> <th>Package</th> <th>Remark</th>{" "}
                              <th></th>{" "}
                            </tr>{" "}
                          </thead>{" "}
                          <tbody>
                            {" "}
                            {formData.products.map((p, i) => (
                              <tr key={i}>
                                {" "}
                                <td>{p.productName}</td>{" "}
                                <td>{p.description}</td>{" "}
                                <td>{p.customCategory || p.category}</td>{" "}
                                <td>{p.customIndustry || p.industryServed}</td>{" "}
                                <td>{p.teamSize}</td> <td>{p.version}</td>{" "}
                                <td>
                                  {p.customDeployment || p.deploymentType}
                                </td>{" "}
                                <td>{p.customPricing || p.pricingModel}</td>{" "}
                                <td>{p.customersCount}</td>{" "}
                                <td>{p.majorClients}</td>{" "}
                                <td>{p.integrations}</td>{" "}
                                <td>{p.keyFeatures}</td>{" "}
                                <td>{p.securityStandards}</td>{" "}
                                <td>{p.uptimeSLA}</td> <td>{p.roadmap}</td>{" "}
                                <td>{p.package?.join(", ")}</td>{" "}
                                <td>{p.remark}</td>{" "}
                                <td>
                                  {" "}
                                  <button
                                    className="btn-remove"
                                    onClick={() => removeProduct(i)}
                                  >
                                    X
                                  </button>{" "}
                                </td>{" "}
                              </tr>
                            ))}{" "}
                          </tbody>{" "}
                        </table>
                      </div>
                    </>
                  )}
                  {/* ================= SOLUTIONS ================= */}
                  {(formData.businessType === "solution" || formData.businessType=== "both") && (
                    <>
                      <h3>Add Solution</h3>

                      <input
                        name="solutionName"
                        placeholder="Solution Name"
                        value={solutionForm.solutionName}
                        onChange={handleSolutionChange}
                      />

                      <select
                        name="category"
                        value={solutionForm.category}
                        onChange={handleSolutionChange}
                      >
                        <option value="">Category</option>
                        {solutionCategories.map((c, i) => (
                          <option key={i}>{c}</option>
                        ))}
                      </select>

                      {solutionForm.category === "Other" && (
                        <input
                          name="customCategory"
                          placeholder="Enter Category"
                          value={solutionForm.customCategory}
                          onChange={handleSolutionChange}
                        />
                      )}

                      <textarea
                        name="description"
                        placeholder="Description"
                        value={solutionForm.description}
                        onChange={handleSolutionChange}
                      />

                      <select
                        name="industryServed"
                        value={solutionForm.industryServed}
                        onChange={handleSolutionChange}
                      >
                        <option value="">Industry</option>
                        {industries.map((i, idx) => (
                          <option key={idx}>{i}</option>
                        ))}
                      </select>

                      {solutionForm.industryServed === "Other" && (
                        <input
                          name="customIndustry"
                          placeholder="Enter Industry"
                          value={solutionForm.customIndustry}
                          onChange={handleSolutionChange}
                        />
                      )}

                      <input
                        name="teamSize"
                        placeholder="Team Size"
                        value={solutionForm.teamSize}
                        onChange={handleSolutionChange}
                      />

                      <select
                        name="servicesProvided"
                        value={solutionForm.servicesProvided}
                        onChange={handleSolutionChange}
                      >
                        <option value="">Services</option>
                        {servicesList.map((s, i) => (
                          <option key={i}>{s}</option>
                        ))}
                      </select>

                      {solutionForm.servicesProvided === "Other" && (
                        <input
                          name="customService"
                          placeholder="Enter Service"
                          value={solutionForm.customService}
                          onChange={handleSolutionChange}
                        />
                      )}

                      <input
                        name="projectsCompleted"
                        placeholder="Projects Completed"
                        value={solutionForm.projectsCompleted}
                        onChange={handleSolutionChange}
                      />

                      <input
                        name="ongoingProjects"
                        placeholder="Ongoing Projects"
                        value={solutionForm.ongoingProjects}
                        onChange={handleSolutionChange}
                      />

                      <input
                        name="customersCount"
                        placeholder="Customers Count"
                        value={solutionForm.customersCount}
                        onChange={handleSolutionChange}
                      />

                      <input
                        name="majorClients"
                        placeholder="Major Clients"
                        value={solutionForm.majorClients}
                        onChange={handleSolutionChange}
                      />

                      <input
                        name="toolsUsed"
                        placeholder="Tools Used"
                        value={solutionForm.toolsUsed}
                        onChange={handleSolutionChange}
                      />

                      <input
                        name="integrations"
                        placeholder="Integrations"
                        value={solutionForm.integrations}
                        onChange={handleSolutionChange}
                      />

                      <select
                        name="methodology"
                        value={solutionForm.methodology}
                        onChange={handleSolutionChange}
                      >
                        <option value="">Methodology</option>
                        {methodologies.map((m, i) => (
                          <option key={i}>{m}</option>
                        ))}
                      </select>

                      {solutionForm.methodology === "Other" && (
                        <input
                          name="customMethodology"
                          placeholder="Enter Methodology"
                          value={solutionForm.customMethodology}
                          onChange={handleSolutionChange}
                        />
                      )}

                      <input
                        name="certifications"
                        placeholder="Certifications"
                        value={solutionForm.certifications}
                        onChange={handleSolutionChange}
                      />

                      {/* ✅ CHECKBOX FIX */}
                              <div className="package-block">
  <label className="section-label">
    What are you looking for in this product?
  </label>

  <div className="checkbox-group">
    {["Certification", "Verification", "Marketing"].map((pkg) => (
      <label key={pkg} className="checkbox-item">
        <input
          type="checkbox"
          value={pkg}
          checked={solutionForm.package.includes(pkg)}
onChange={handleSolutionChange}
        />
        {pkg}
      </label>
    ))}
  </div>
</div>
                      <input
                        name="remark"
                        placeholder="Remark / Notes"
                        value={solutionForm.remark}
                        onChange={handleSolutionChange}
                      />

                      <button className="btn-add" onClick={addSolution}>
                        Add Solution
                      </button>

                      {/* TABLE */}
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Category</th>
                              <th>Industry</th>
                              <th>Team</th>
                              <th>Services</th>
                              <th>Projects</th>
                              <th>Ongoing</th>
                              <th>Customers</th>
                              <th>Clients</th>
                              <th>Tools</th>
                              <th>Integrations</th>
                              <th>Methodology</th>
                              <th>Certifications</th>
                              <th>Package</th>
                              <th>Remark</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.solutions.map((s, i) => (
                              <tr key={i}>
                                <td>{s.solutionName}</td>
                                <td>{s.customCategory || s.category}</td>
                                <td>{s.customIndustry || s.industryServed}</td>
                                <td>{s.teamSize}</td>
                                <td>{s.customService || s.servicesProvided}</td>
                                <td>{s.projectsCompleted}</td>
                                <td>{s.ongoingProjects}</td>
                                <td>{s.customersCount}</td>
                                <td>{s.majorClients}</td>
                                <td>{s.toolsUsed}</td>
                                <td>{s.integrations}</td>
                                <td>{s.customMethodology || s.methodology}</td>
                                <td>{s.certifications}</td>
                                <td>{s.package?.join(", ")}</td>
                                <td>{s.remark}</td>
                                <td>
                                  <button
                                    className="btn-remove"
                                    onClick={() => removeSolution(i)}
                                  >
                                    X
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </>
              );
            })()}

            <div className="button-group">
              <button className="btn-back" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="btn-primary" onClick={() => {
  if (validateStep()) setStep(4);
}}>
                Next
              </button>
            </div>

            <div className="disclaimer-box">
  <p>
    <strong>Disclaimer:</strong> If the company does not achieve the required
    score during evaluation, no certification will be granted. In such cases,
    only verification support will be provided. No refunds will be issued under
    any circumstances once the application process has begun.
  </p>

  <label className="disclaimer-check">
    <input
  type="checkbox"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>
    I have read and agree to the above terms.
  </label>
  {errors.agreed && (
  <span className="error">{errors.agreed}</span>
)}
</div>
          </>
        )}

        {/* ================= SECTION 4 ================= */}
        {step === 4 && (
          <>
            <h3>Evidence & Documents</h3>

            <div className="file-row">
              <span>Company Profile</span>
              <input
  type="file"
  name="companyProfile"
  onChange={handleFileChange}
/>
{errors.companyProfile && (
  <span className="error">{errors.companyProfile}</span>
)}
            </div>

            <div className="file-row">
              <span>Pitch Deck</span>
              <input
  type="file"
  name="pitchDeck"
  onChange={handleFileChange}
/>
{errors.pitchDeck && (
  <span className="error">{errors.pitchDeck}</span>
)}
            </div>

            <div className="gst-block">
              <label>Do you have any other certifications?</label>

              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="otherCert"
                    value="yes"
                    onChange={(e) => setHasOtherCert(e.target.value)}
                  />
                  Yes
                </label>

                <label>
                  <input
                    type="radio"
                    name="otherCert"
                    value="no"
                    onChange={(e) => setHasOtherCert(e.target.value)}
                  />
                  No
                </label>
              </div>
            </div>
           {hasOtherCert === "yes" && (
  <div className="file-row">
    <span>Upload Certifications</span>
    <input
      type="file"
      name="certifications"
      multiple
      onChange={handleFileChange}
    />
    {errors.certifications && (
      <span className="error">{errors.certifications}</span>
    )}
  </div>
)}
            <div className="button-group">
              <button className="btn-back" onClick={() => setStep(3)}>
                Back
              </button>
             onClick={() => {
  if (validateStep()) {
    handleSubmitFinal();
  }
}}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CompanyApplication;