import {
BrowserRouter,
Routes,
Route,
Navigate,
useLocation
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyOtp from "./pages/VerifyOtp";
import InternalLogin from "./pages/InternalLogin";

// Organization
import CompanyDashboard from "./pages/Organization/CompanyDashboard";
import ApplyCertification from "./pages/Organization/ApplyCertification";
import CompanyProfile from "./pages/Organization/CompanyProfile";

// Assessor
import AssessorLogin from "./pages/Assessor/AssessorLogin";
// import AssessorDashboard from "./pages/Assessor/AssessorDashboard";
import AssessorProfile from "./pages/Assessor/AssessorProfile";

// Internal
import OperationsDashboard from "./pages/Internal/operations/OperationsDashboard";
import ApplicationsList from "./pages/Internal/operations/ApplicationsList";
import ApplicationDetails from "./pages/Internal/operations/ApplicationDetails";

import SuperAdminDashboard from "./pages/Internal/superadmin/SuperAdminDashboard";
import CreateUser from "./pages/Internal/superadmin/CreateUser";
import UserList from "./pages/Internal/superadmin/UserList";
import ManagePermissions from "./pages/Internal/superadmin/ManagePermissions";

import InternalLayout from "./components/InternalLayout";
import AdminDashboard from "./pages/Internal/admin/AdminDashboard";
import ProfileSetup from "./pages/Internal/profile/ProfileSetup";
import InviteAssessor from "./pages/Internal/admin/InviteAssessor";

/* ========================= */
function AppContent() {
const location = useLocation();

// 🔥 Hide navbar for external invite form
const hideNavbar = location.pathname === "/assessor-form";

return (
<>
{!hideNavbar && <Navbar />}

  <Routes>

    {/* PUBLIC */}
    <Route path="/" element={<Navigate to="/register" />} />
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/verify-otp" element={<VerifyOtp />} />

    {/* ================= COMPANY ================= */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute roles={["APPLICANT"]}>
          <CompanyDashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/dashboard/apply"
      element={
        <ProtectedRoute roles={["APPLICANT"]}>
          <ApplyCertification />
        </ProtectedRoute>
      }
    />

    <Route
      path="/dashboard/company-profile"
      element={
        <ProtectedRoute roles={["APPLICANT"]}>
          <CompanyProfile />
        </ProtectedRoute>
      }
    />

    {/* ================= ASSESSOR ================= */}

    <Route path="/assessor/login" element={<AssessorLogin />} />

    {/* <Route
      path="/assessor/dashboard"
      element={
        <ProtectedRoute roles={["AUDITOR", "REVIEWER"]}>
          <AssessorDashboard />
        </ProtectedRoute>
      }
    /> */}

    {/* 🔥 INVITE FORM (PUBLIC, NO PROTECTION) */}
    <Route path="/assessor-form" element={<AssessorProfile />} />

    {/* ================= INTERNAL LOGIN ================= */}
    <Route path="/internal-login" element={<InternalLogin />} />

    {/* ================= SUPERADMIN ================= */}
    <Route
      path="/internal/superadmin"
      element={
        <ProtectedRoute roles={["SUPERADMIN"]}>
          <InternalLayout>
            <SuperAdminDashboard />
          </InternalLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/internal/superadmin/create-user"
      element={
        <ProtectedRoute roles={["SUPERADMIN"]}>
          <InternalLayout>
            <CreateUser />
          </InternalLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/internal/superadmin/users"
      element={
        <ProtectedRoute roles={["SUPERADMIN"]}>
          <InternalLayout>
            <UserList />
          </InternalLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/internal/superadmin/manage-permissions"
      element={
        <ProtectedRoute roles={["SUPERADMIN"]}>
          <InternalLayout>
            <ManagePermissions />
          </InternalLayout>
        </ProtectedRoute>
      }
    />

    {/* ================= OPERATIONS ================= */}
    <Route
      path="/internal/operations"
      element={
        <ProtectedRoute roles={["OPERATIONS"]}>
          <InternalLayout>
            <OperationsDashboard />
          </InternalLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/internal/operations/applications"
      element={
        <ProtectedRoute roles={["OPERATIONS"]}>
          <InternalLayout>
            <ApplicationsList />
          </InternalLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/internal/operations/application/:id"
      element={
        <ProtectedRoute roles={["OPERATIONS"]}>
          <InternalLayout>
            <ApplicationDetails />
          </InternalLayout>
        </ProtectedRoute>
      }
    />

    {/* ================= ADMIN ================= */}
    <Route
      path="/internal/admin"
      element={
        <ProtectedRoute roles={["ADMIN"]}>
          <InternalLayout>
            <AdminDashboard />
          </InternalLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/internal/admin/invite-assessor"
      element={
        <ProtectedRoute roles={["ADMIN"]}>
          <InternalLayout>
            <InviteAssessor />
          </InternalLayout>
        </ProtectedRoute>
      }
    />

    {/* ================= PROFILE SETUP ================= */}
    <Route
      path="/internal/profile-setup"
      element={
        <ProtectedRoute roles={["SUPERADMIN", "ADMIN", "OPERATIONS"]}>
          <ProfileSetup />
        </ProtectedRoute>
      }
    />

  </Routes>
</>

);
}

/* ========================= */
function App() {
return (
<BrowserRouter>
<AppContent />
</BrowserRouter>
);
}

export default App;