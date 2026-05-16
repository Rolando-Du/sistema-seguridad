import { Shield } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <Shield className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Dashboard Operativo
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Resumen general del sistema
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
          Usuario autenticado
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
              Nombre
            </p>
            <p className="mt-2 font-bold text-white">{user?.name}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
              Email
            </p>
            <p className="mt-2 font-bold text-white">{user?.email}</p>
          </div>

          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-blue-300">
              Rol
            </p>
            <p className="mt-2 font-black text-blue-300">{user?.role}</p>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Dashboard;
