import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/lib/theme";
import { BrandProvider } from "@/lib/brandContext";
import Layout from "@/components/Layout";

import Dashboard from "@/pages/Dashboard";
import Mentions from "@/pages/Mentions";
import MentionDetail from "@/pages/MentionDetail";
import Insights from "@/pages/Insights";
import ResponseCenter from "@/pages/ResponseCenter";
import Alerts from "@/pages/Alerts";
import Reports from "@/pages/Reports";
import SettingsPage from "@/pages/Settings";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute
            unauthenticatedElement={<Navigate to="/login" replace />}
          />
        }
      >
        <Route
          element={
            <BrandProvider>
              <Layout />
            </BrandProvider>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/mentions" element={<Mentions />} />
          <Route path="/mentions/:id" element={<MentionDetail />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/responses" element={<ResponseCenter />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
