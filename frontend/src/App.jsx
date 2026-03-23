import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import CompanyDashboard from "./pages/CompanyDashboard";
import ApplyCertification from "./pages/ApplyCertification";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyOtp from "./pages/VerifyOtp";
import InternalLogin from "./pages/InternalLogin";

// Internal
import OperationsDashboard from "./pages/Internal/operations/OperationsDashboard";
import ApplicationsList from "./pages/Internal/operations/ApplicationsList";
import ApplicationDetails from "./pages/Internal/operations/ApplicationDetails";

import SuperAdminDashboard from "./pages/Internal/superadmin/SuperAdminDashboard";
import CreateUser from "./pages/Internal/superadmin/CreateUser";
import UserList from "./pages/Internal/superadmin/UserList";
import ManagePermissions from "./pages/Internal/superadmin/ManagePermissions"; // ✅ NEW

import InternalLayout from "./components/InternalLayout";
import AdminDashboard from "./pages/Internal/admin/AdminDashboard";
import ProfileSetup from "./pages/Internal/profile/ProfileSetup";

/* ========================= */
function AppContent() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* COMPANY */}
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

        {/* INTERNAL LOGIN */}
        <Route path="/internal-login" element={<InternalLogin />} />

        {/* ================= SUPER ADMIN ================= */}

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

        {/* ✅ NEW: MANAGE PERMISSIONS */}
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

        {/* ================= PROFILE SETUP ================= */}

        <Route
          path="/internal/profile-setup"
          element={
            <ProtectedRoute roles={["SUPERADMIN", "ADMIN", "OPERATIONS"]}>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />

        {/* ❌ REMOVED OLD USER PERMISSIONS ROUTE (OPTIONAL) */}
        {/* 
        <Route
          path="/internal/superadmin/permissions/:id"
          element={<UserPermissions />}
        /> 
        */}

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