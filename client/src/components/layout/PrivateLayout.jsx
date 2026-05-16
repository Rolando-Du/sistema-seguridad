import { BarChart3, FileText, Flame, Home, LogOut, Map, Shield, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const PrivateLayout = ({ children }) => {
  const { user, logout, isAdmin, canOperate } = useAuth();

  const navClass = ({ isActive }) =>
    `rounded-lg border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
      isActive
        ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-900/40"
        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-blue-500/50 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/40">
                <Shield className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-xl font-black uppercase italic tracking-tight">
                  Seguridad Nacional
                </h1>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
                  Sistema de Inteligencia Operativa
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <p className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Usuario: <span className="text-slate-200">{user?.name}</span>{" "}
                | Rol: <span className="text-blue-400">{user?.role}</span>
              </p>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-red-950/40 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-300 transition-all hover:bg-red-600 hover:text-white active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            <NavLink to="/" end className={navClass}>
              <span className="inline-flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </span>
            </NavLink>

            <NavLink to="/incidentes" className={navClass}>
              <span className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Incidentes
              </span>
            </NavLink>

            {canOperate && (
              <NavLink to="/nuevo-incidente" className={navClass}>
                Nuevo Incidente
              </NavLink>
            )}

            <NavLink to="/mapa" className={navClass}>
              <span className="inline-flex items-center gap-2">
                <Map className="h-4 w-4" />
                Mapa
              </span>
            </NavLink>

            <NavLink to="/calor" className={navClass}>
              <span className="inline-flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Calor
              </span>
            </NavLink>

            {canOperate && (
              <NavLink to="/reportes" className={navClass}>
                <span className="inline-flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Reportes
                </span>
              </NavLink>
            )}

            {isAdmin && (
              <>
                <NavLink to="/bases" className={navClass}>
                  Bases
                </NavLink>

                <NavLink to="/usuarios" className={navClass}>
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Usuarios
                  </span>
                </NavLink>

                <NavLink to="/auditoria" className={navClass}>
                  Auditoría
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
};

export default PrivateLayout;
