import { useState } from "react";
import "../styles/applyCertification.css";

function CompanyApplication() {
  const [step, setStep] = useState(1);

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

  /* ================= HANDLERS ================= */
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      companyDetails: { ...formData.companyDetails, [name]: value },
    });
  };

  const addOwner = () => {
    setFormData({
      ...formData,
      owners: [...formData.owners, {}],
    });
  };

  const removeOwner = (i) => {
    const updated = formData.owners.filter((_, index) => index !== i);
    setFormData({ ...formData, owners: updated });
  };

  const addPartner = () => {
    setFormData({
      ...formData,
      partners: [...formData.partners, {}],
    });
  };

  const removePartner = (i) => {
    const updated = formData.partners.filter((_, index) => index !== i);
    setFormData({ ...formData, partners: updated });
  };

  const [businessType, setBusinessType] = useState("");

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
      products: [...formData.products, productForm],
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
      solutions: [...formData.solutions, solutionForm],
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

            <input
              name="brandnName"
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
                onChange={handleCompanyChange}
              />
            </div>

            <input
              name="website"
              placeholder="Website"
              onChange={handleCompanyChange}
            />
            <input
              name="officialEmail"
              placeholder="Official Email"
              onChange={handleCompanyChange}
            />
            <input
              name="contactNumber"
              placeholder="Contact Number"
              onChange={handleCompanyChange}
            />

            <div className="grid">
              <input placeholder="Year of Incorporation" />
              <input placeholder="Company Size" />
            </div>

            <input placeholder="Industry" />

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
                </div>

                {/* FILE UPLOAD */}
                <div className="file-row">
                  <span>Incorporation Certificate</span>
                  <input type="file" />
                </div>
              </>
            )}
            {formData.companyDetails.hasGST === "no" && (
              <div className="file-row">
                <span>SEZ Document</span>
                <input type="file" />
              </div>
            )}

            <button className="btn-primary" onClick={() => setStep(2)}>
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
                  <input placeholder="Name" />
                  <input placeholder="Designation" />
                </div>

                <div className="grid">
                  <input placeholder="Email" />
                  <input placeholder="Phone" />
                </div>

                <div className="grid">
                  <input placeholder="Experience" />
                  <input placeholder="Aadhaar Number" />
                </div>

                <div className="file-row">
                  <span>Aadhaar File</span>
                  <input type="file" />
                </div>

                <input placeholder="PAN Number" />

                <div className="file-row">
                  <span>PAN File</span>
                  <input type="file" />
                </div>

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
                  <input placeholder="Name" />
                  <input placeholder="Role" />
                </div>

                <div className="grid">
                  <input placeholder="Email" />
                  <input placeholder="Phone" />
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
              <button className="btn-primary" onClick={() => setStep(3)}>
                Next
              </button>
            </div>
          </>
        )}

        {/* ================= SECTION 3 ================= */}
        {step === 3 && (
          <>
            <h3>Business Type</h3>

            <select onChange={(e) => setBusinessType(e.target.value)}>
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

                  {(businessType === "product" || businessType === "both") && (
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
                      <div className="checkbox-group">
                        {["Certification", "Verification", "Marketing"].map(
                          (pkg) => (
                            <label key={pkg}>
                              <input
                                type="checkbox"
                                value={pkg}
                                checked={productForm.package.includes(pkg)}
                                onChange={handleProductChange}
                              />
                              {pkg}
                            </label>
                          ),
                        )}
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
                  {(businessType === "solution" || businessType === "both") && (
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
                      <div className="checkbox-group">
                        {["Certification", "Verification", "Marketing"].map(
                          (pkg) => (
                            <label key={pkg}>
                              <input
                                type="checkbox"
                                value={pkg}
                                checked={solutionForm.package.includes(pkg)}
                                onChange={handleSolutionChange}
                              />
                              {pkg}
                            </label>
                          ),
                        )}
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
              <button className="btn-primary" onClick={() => setStep(4)}>
                Next
              </button>
            </div>
          </>
        )}

        {/* ================= SECTION 4 ================= */}
        {step === 4 && (
          <>
            <h3>Evidence & Documents</h3>

            <div className="file-row">
              <span>Company Profile</span>
              <input type="file" />
            </div>

            <div className="file-row">
              <span>Pitch Deck</span>
              <input type="file" />
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
                <input type="file" multiple />
              </div>
            )}

            <div className="button-group">
              <button className="btn-back" onClick={() => setStep(3)}>
                Back
              </button>
              <button className="btn-primary">Submit</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CompanyApplication;
