import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DashboardLayout from "./pages/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import SiteAudits from "./pages/SiteAudits";
import SecurityAudit from "./pages/SecurityAudit";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="site-audits" element={<SiteAudits />} />
        <Route path="audit" element={<SecurityAudit />} />
      </Route>
    </Routes>
  );
}

export default App;
