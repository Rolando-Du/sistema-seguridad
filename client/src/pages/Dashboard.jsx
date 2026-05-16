import {
  AlertTriangle,
  BarChart3,
  Building2,
  FileText,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDashboardSummary } from "../services/dashboardService";

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("es-AR");
};

const formatDateTime = (date) => {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusLabel = {
  PENDIENTE: "Pendiente",
  EN_INVESTIGACION: "En investigación",
  RESUELTO: "Resuelto",
  ARCHIVADO: "Archivado",
};

const getStatusClass = (status) => {
  const classes = {
    PENDIENTE: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
    EN_INVESTIGACION: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    RESUELTO: "border-green-500/40 bg-green-500/10 text-green-400",
    ARCHIVADO: "border-slate-500/40 bg-slate-500/10 text-slate-400",
  };

  return classes[status] || "border-slate-500/40 bg-slate-500/10 text-slate-400";
};

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await getDashboardSummary();

      if (response.success) {
        setDashboard(response.data);
      } else {
        setMessage("No se pudo cargar el dashboard.");
      }
    } catch (error) {
      setMessage(error.message || "Error al cargar el dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const usersByRole = useMemo(() => {
    return dashboard?.usersByRole || [];
  }, [dashboard]);

  const rankings = dashboard?.rankings || {};
  const totals = dashboard?.totals || {};
  const monthlyAnalysis = dashboard?.monthlyAnalysis || {};
  const latestIncidents = dashboard?.latestIncidents || [];

  const trendIsUp = monthlyAnalysis.trend === "ASCENDENTE";
  const trendIsDown = monthlyAnalysis.trend === "DESCENDENTE";

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">
            Cargando dashboard operativo...
          </p>
        </div>
      </main>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/40">
            <Shield className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Dashboard Operativo
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Resumen general, zonas críticas y últimos incidentes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Recargar
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-400">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Total incidentes
            </p>
            <FileText className="h-5 w-5 text-blue-400" />
          </div>

          <p className="mt-4 text-4xl font-black text-white">
            {formatNumber(totals.incidents)}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              Incidentes del mes
            </p>
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>

          <p className="mt-4 text-4xl font-black text-blue-300">
            {formatNumber(totals.currentMonthIncidents)}
          </p>

          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Mes anterior: {formatNumber(totals.previousMonthIncidents)}
          </p>
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-400">
              Bases activas
            </p>
            <Building2 className="h-5 w-5 text-green-400" />
          </div>

          <p className="mt-4 text-4xl font-black text-green-300">
            {formatNumber(totals.activeBases)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Tendencia
            </p>
            {trendIsDown ? (
              <TrendingDown className="h-5 w-5 text-green-400" />
            ) : (
              <TrendingUp
                className={`h-5 w-5 ${
                  trendIsUp ? "text-red-400" : "text-slate-400"
                }`}
              />
            )}
          </div>

          <p
            className={`mt-4 text-4xl font-black ${
              trendIsUp
                ? "text-red-400"
                : trendIsDown
                  ? "text-green-400"
                  : "text-slate-300"
            }`}
          >
            {monthlyAnalysis.variationPercentage ?? 0}%
          </p>

          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {monthlyAnalysis.trend || "ESTABLE"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
            Delito crítico
          </p>

          <p className="mt-3 text-xl font-black uppercase text-white">
            {rankings.criticalCrimeType?.name || "Sin datos"}
          </p>

          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            {formatNumber(rankings.criticalCrimeType?.total)} casos registrados
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Localidad crítica
          </p>

          <p className="mt-3 text-xl font-black uppercase text-white">
            {rankings.criticalCity?.city || "Sin datos"}
          </p>

          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            {formatNumber(rankings.criticalCity?.total)} incidentes
          </p>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">
            Barrio crítico
          </p>

          <p className="mt-3 text-xl font-black uppercase text-white">
            {rankings.criticalNeighborhood?.neighborhood || "Sin datos"}
          </p>

          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            {rankings.criticalNeighborhood?.city || "Sin localidad"} ·{" "}
            {formatNumber(rankings.criticalNeighborhood?.total)} casos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-300" />
            <h3 className="text-lg font-black uppercase italic text-white">
              Últimos incidentes
            </h3>
          </div>

          <div className="space-y-4">
            {latestIncidents.length > 0 ? (
              latestIncidents.map((incident) => (
                <article
                  key={incident.id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 transition-all hover:border-blue-500/40"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="text-sm font-black uppercase text-white">
                        {incident.crimeType}
                      </p>

                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {incident.city} · {incident.neighborhood}
                      </p>

                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                        {incident.description}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 md:items-end">
                      <span
                        className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${getStatusClass(
                          incident.status,
                        )}`}
                      >
                        {statusLabel[incident.status] || incident.status}
                      </span>

                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                        {formatDateTime(incident.createdAt)}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs font-bold uppercase tracking-widest text-slate-600">
                Sin incidentes recientes.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-black uppercase italic text-white">
              Usuarios por rol
            </h3>
          </div>

          <div className="space-y-3">
            {usersByRole.map((item) => (
              <div
                key={item.role}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
              >
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                  {item.role}
                </span>

                <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-300">
                  {formatNumber(item.total)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-5 text-lg font-black uppercase italic text-white">
            Ranking por tipo de delito
          </h3>

          <div className="space-y-3">
            {(rankings.byCrimeType || []).map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  #{index + 1} · {item.name}
                </span>

                <span className="font-black text-blue-400">
                  {formatNumber(item.total)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-5 text-lg font-black uppercase italic text-white">
            Ranking por barrio
          </h3>

          <div className="space-y-3">
            {(rankings.byNeighborhood || []).map((item, index) => (
              <div
                key={`${item.neighborhood}-${item.city}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    #{index + 1} · {item.neighborhood}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    {item.city}
                  </p>
                </div>

                <span className="font-black text-orange-300">
                  {formatNumber(item.total)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default Dashboard;
