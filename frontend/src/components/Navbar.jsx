import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/navbar.css";
import SidebarDrawer from "./SidebarDrawer";
import logo from "../assets/cio-logo.png";


function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    setIsLoggedIn(!!token);
    setUser(storedUser);
  }, [location]);

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
           <img src={logo} alt="logo" className="logo-image" />
          </a>
        </div>

        <nav className="nav-links">
          <a href="https://cioverified.com">Home</a>
          <a href="https://cioverified.com/about">About Us</a>
          <a href="https://cioverified.com/certified-companies">
            Certified Companies
          </a>
          <a href="https://cioverified.com/blogs">Blogs</a>
          <a href="https://cioverified.com/contact-us">Contact Us</a>

          {isLoggedIn && (
            <button className="nav-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>

        {/* 🔥 Avatar trigger */}
       {isLoggedIn && (
  <div className="avatar" onClick={() => setOpenDrawer(true)}>
    {user?.username?.charAt(0)?.toUpperCase() || "U"}
  </div>
)}
      </div>

      {/* 🔥 Drawer */}
      <SidebarDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      />
    </header>
  );
}

export default Navbar;