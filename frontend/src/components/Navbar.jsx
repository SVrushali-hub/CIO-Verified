import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/navbar.css";


function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]); // 🔥 re-check whenever route changes

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <header className="granuler-navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <a href="https://cioverified.com/">
            
            {/* <img src="./assets/CIO Logo.png" alt="CIO Verified Logo" className="logo-image" /> */}
            
<img src="/assets/CIOLogo.png" alt="logo" width={250} height={95} />
          </a>
           {/* <a href="https://cioverified.com/" className="logo-text">
            CIO Verified
          </a> */}
        </div>

        <nav className="nav-links">
          <a href="https://cioverified.com">Home</a>
           <a href="https://cioverified.com/about">About Us</a>
          <a href="https://cioverified.com/certified-companies">Certified Companies</a>
          <a href="https://cioverified.com/blogs">Blogs</a>
          <a href="https://cioverified.com/contact-us">Contact Us</a>

          {isLoggedIn && (
            <button className="nav-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;