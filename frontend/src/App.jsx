import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import CompanyDashboard from "./pages/CompanyDashboard";
import ApplyCertification from "./pages/ApplyCertification";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyOtp from "./pages/VerifyOtp";
function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <CompanyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/apply" element={
          <ProtectedRoute>
            <ApplyCertification />
          </ProtectedRoute>
        } />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;