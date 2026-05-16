import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PrivateLayout from "../components/layout/PrivateLayout";
import Audit from "../pages/Audit";
import Dashboard from "../pages/Dashboard";
import HeatMapPage from "../pages/HeatMapPage";
import Login from "../pages/Login";
import ManageBases from "../pages/ManageBases";
import ManageIncidents from "../pages/ManageIncidents";
import ManageUsers from "../pages/ManageUsers";
import OperationalMap from "../pages/OperationalMap";
import RegisterIncident from "../pages/RegisterIncident";
import Reports from "../pages/Reports";
import ProtectedRoute from "./ProtectedRoute";

const withLayout = (children, allowedRoles) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <PrivateLayout>{children}</PrivateLayout>
  </ProtectedRoute>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={withLayout(<Dashboard />, ["ADMIN", "OPERADOR", "LECTOR"])}
        />

        <Route
          path="/incidentes"
          element={withLayout(<ManageIncidents />, [
            "ADMIN",
            "OPERADOR",
            "LECTOR",
          ])}
        />

        <Route
          path="/nuevo-incidente"
          element={withLayout(<RegisterIncident />, ["ADMIN", "OPERADOR"])}
        />

        <Route
          path="/mapa"
          element={withLayout(<OperationalMap />, [
            "ADMIN",
            "OPERADOR",
            "LECTOR",
          ])}
        />

        <Route
          path="/calor"
          element={withLayout(<HeatMapPage />, [
            "ADMIN",
            "OPERADOR",
            "LECTOR",
          ])}
        />

        <Route
          path="/reportes"
          element={withLayout(<Reports />, ["ADMIN", "OPERADOR"])}
        />

        <Route
          path="/bases"
          element={withLayout(<ManageBases />, ["ADMIN"])}
        />

        <Route
          path="/usuarios"
          element={withLayout(<ManageUsers />, ["ADMIN"])}
        />

        <Route
          path="/auditoria"
          element={withLayout(<Audit />, ["ADMIN"])}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
