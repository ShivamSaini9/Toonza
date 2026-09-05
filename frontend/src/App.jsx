import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ImageGeneration from "./pages/ImageGeneration";
import BlogGeneration from "./pages/BlogGeneration";
import PublicRoute from "./auth/PublicRoute";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminRoute from "./auth/AdminRoute";
import MainLayout from "./components/MainLayout";
import { Toaster } from "react-hot-toast";
import VoiceGeneration from "./pages/VoiceGeneration";
import ImageEnhancer from "./pages/ImageEnhancer";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import DialogueSeparator from "./pages/DialogueSeparator";
import AssetLibrary from "./pages/AssetLibrary";
import AdminLayout from "./admin/AdminLayout";
import AdminOverview from "./admin/pages/AdminOverview";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminSubscriptions from "./admin/pages/AdminSubscriptions";
import AdminAssets from "./admin/pages/AdminAssets";
import AdminCommunity from "./admin/pages/AdminCommunity";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#020617",
            color: "#fff",
            border: "1px solid #1e293b",
          },
        }}
      />

      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />

        {/* Member home requires authentication */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
        </Route>

        {/* Auth pages (no sidebar) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/app/pricing"
          element={
            <PublicRoute>
              <Pricing />
            </PublicRoute>
          }
        />
        {/* Protected App Shell (same sidebar, logout only) */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="image-generation" element={<ImageGeneration />} />
          <Route path="image-enhancer" element={<ImageEnhancer />} />
          <Route path="voice-generation" element={<VoiceGeneration />} />
          <Route path="dialogue-separator" element={<DialogueSeparator />} />
          <Route path="asset-library" element={<AssetLibrary />} />
        </Route>

        {/* Admin Panel — separate shell, role-gated */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="assets" element={<AdminAssets />} />
          <Route path="community" element={<AdminCommunity />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
