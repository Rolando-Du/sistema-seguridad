import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoadingScreen from "../components/common/LoadingScreen";
import PrivateLayout from "../components/layout/PrivateLayout";
import ProtectedRoute from "./ProtectedRoute";

const Audit = lazy(() => import("../pages/Audit"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const HeatMapPage = lazy(() => import("../pages/HeatMapPage"));
const Login = lazy(() => import("../pages/Login"));
const ManageBases = lazy(() => import("../pages/ManageBases"));
const ManageIncidents = lazy(() => import("../pages/ManageIncidents"));
const ManageUsers = lazy(() => import("../pages/ManageUsers"));
const OperationalMap = lazy(() => import("../pages/OperationalMap"));
const RegisterIncident = lazy(() => import("../pages/RegisterIncident"));
const Reports = lazy(() => import("../pages/Reports"));

const withLayout = (children, allowedRoles) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <PrivateLayout>{children}</PrivateLayout>
  </ProtectedRoute>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={withLayout(<Dashboard />, [
              "ADMIN",
              "OPERADOR",
              "LECTOR",
            ])}
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
            element={withLayout(<RegisterIncident />, [
              "ADMIN",
              "OPERADOR",
            ])}
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
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
