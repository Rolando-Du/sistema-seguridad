import {
  Activity,
  CalendarDays,
  Database,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAuditLogs } from "../services/auditService";

const initialFilters = {
  action: "TODAS",
  entity: "TODAS",
  user: "",
  startDate: "",
  endDate: "",
  limit: 100,
};

const actionOptions = [
  { value: "TODAS", label: "Todas" },
  { value: "LOGIN", label: "Login" },
  { value: "CREAR", label: "Crear" },
  { value: "EDITAR", label: "Editar" },
  { value: "CAMBIAR_ESTADO", label: "Cambiar estado" },
  { value: "ELIMINAR", label: "Eliminar" },
  { value: "ACTIVAR", label: "Activar" },
  { value: "DESACTIVAR", label: "Desactivar" },
  { value: "EXPORTAR", label: "Exportar" },
];

const entityOptions = [
  { value: "TODAS", label: "Todas" },
  { value: "AUTH", label: "Autenticación" },
  { value: "USUARIO", label: "Usuario" },
  { value: "INCIDENTE", label: "Incidente" },
  { value: "BASE_OPERATIVA", label: "Base operativa" },
];

const actionLabel = {
  LOGIN: "Login",
  CREAR: "Crear",
  EDITAR: "Editar",
  CAMBIAR_ESTADO: "Cambiar estado",
  ELIMINAR: "Eliminar",
  ACTIVAR: "Activar",
  DESACTIVAR: "Desactivar",
  EXPORTAR: "Exportar",
};

const entityLabel = {
  AUTH: "Autenticación",
  USUARIO: "Usuario",
  INCIDENTE: "Incidente",
  BASE_OPERATIVA: "Base operativa",
};

const actionClass = {
  LOGIN: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  CREAR: "border-green-500/40 bg-green-500/10 text-green-300",
  EDITAR: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  CAMBIAR_ESTADO: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  ELIMINAR: "border-red-500/40 bg-red-500/10 text-red-300",
  ACTIVAR: "border-green-500/40 bg-green-500/10 text-green-300",
  DESACTIVAR: "border-red-500/40 bg-red-500/10 text-red-300",
  EXPORTAR: "border-purple-500/40 bg-purple-500/10 text-purple-300",
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

const formatJson = (value) => {
  if (!value) return "Sin datos";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const Audit = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [auditLogs, setAuditLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadAuditLogs = async (customFilters = filters) => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await getAuditLogs(customFilters);

      if (response.success) {
        setAuditLogs(response.data || []);
        setTotal(response.total || 0);
      } else {
        setAuditLogs([]);
        setTotal(0);
        setMessage({
          text: "No se pudo cargar la auditoría.",
          type: "error",
        });
      }
    } catch (error) {
      setAuditLogs([]);
      setTotal(0);
      setMessage({
        text: error.message || "Error al cargar auditoría.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getAuditLogs(initialFilters)
      .then((response) => {
        if (cancelled) return;

        if (response.success) {
          setAuditLogs(response.data || []);
          setTotal(response.total || 0);
          return;
        }

        setAuditLogs([]);
        setTotal(0);
        setMessage({
          text: "No se pudo cargar la auditoría.",
          type: "error",
        });
      })
      .catch((error) => {
        if (cancelled) return;

        setAuditLogs([]);
        setTotal(0);
        setMessage({
          text: error.message || "Error al cargar auditoría.",
          type: "error",
        });
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    return {
      total: auditLogs.length,
      login: auditLogs.filter((log) => log.action === "LOGIN").length,
      create: auditLogs.filter((log) => log.action === "CREAR").length,
      edit: auditLogs.filter((log) => log.action === "EDITAR").length,
      export: auditLogs.filter((log) => log.action === "EXPORTAR").length,
    };
  }, [auditLogs]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadAuditLogs(filters);
  };

  const handleClearFilters = async () => {
    setFilters(initialFilters);
    await loadAuditLogs(initialFilters);
  };

  const openDetail = (log) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setSelectedLog(null);
    setDetailOpen(false);
  };

  const messageClass =
    message.type === "success"
      ? "border-green-500/40 bg-green-500/10 text-green-400"
      : "border-red-500/40 bg-red-500/10 text-red-400";

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/40">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Auditoría del Sistema
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Registro de acciones críticas, usuarios y entidades afectadas
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadAuditLogs(filters)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Recargar
        </button>
      </div>

      {message.text && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-widest ${messageClass}`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Total filtrado
          </p>
          <p className="mt-3 text-4xl font-black text-white">{total}</p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
            Logins
          </p>
          <p className="mt-3 text-4xl font-black text-blue-300">
            {summary.login}
          </p>
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-300">
            Creaciones
          </p>
          <p className="mt-3 text-4xl font-black text-green-300">
            {summary.create}
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-yellow-300">
            Ediciones
          </p>
          <p className="mt-3 text-4xl font-black text-yellow-300">
            {summary.edit}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-purple-300">
            Exportaciones
          </p>
          <p className="mt-3 text-4xl font-black text-purple-300">
            {summary.export}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <select
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-blue-500"
          >
            {actionOptions.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>

          <select
            name="entity"
            value={filters.entity}
            onChange={handleFilterChange}
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-blue-500"
          >
            {entityOptions.map((entity) => (
              <option key={entity.value} value={entity.value}>
                {entity.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="user"
            value={filters.user}
            onChange={handleFilterChange}
            placeholder="Usuario, email o rol..."
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-blue-500"
          />

          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-blue-500"
          />

          <select
            name="limit"
            value={filters.limit}
            onChange={handleFilterChange}
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value={50}>50 registros</option>
            <option value={100}>100 registros</option>
            <option value={250}>250 registros</option>
            <option value={500}>500 registros</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500 active:scale-95"
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className="h-11 rounded-lg border border-slate-700 bg-slate-800 px-4 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-slate-700"
          >
            Limpiar
          </button>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-5 py-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">
            Registros de auditoría
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-287.5 text-left text-sm">
            <thead className="bg-slate-950 text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Entidad</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Detalle</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-10 text-center text-xs font-bold uppercase tracking-widest text-slate-600"
                  >
                    Cargando auditoría...
                  </td>
                </tr>
              ) : auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-slate-800 text-slate-300 hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          actionClass[log.action] ||
                          "border-slate-500/40 bg-slate-500/10 text-slate-300"
                        }`}
                      >
                        {actionLabel[log.action] || log.action}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-200">
                        {entityLabel[log.entity] || log.entity}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-slate-600">
                        {log.entityId || "Sin ID"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <UserRound className="mt-0.5 h-4 w-4 text-blue-400" />
                        <div>
                          <p className="font-bold text-slate-200">
                            {log.userName || "Sistema"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {log.userEmail || "Sin email"} ·{" "}
                            {log.userRole || "Sin rol"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="line-clamp-2 max-w-md text-xs leading-relaxed text-slate-400">
                        {log.description}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-mono text-xs text-slate-400">
                        {log.ipAddress || "Sin IP"}
                      </p>
                      <p className="mt-1 line-clamp-1 max-w-xs text-[10px] text-slate-600">
                        {log.userAgent || "Sin agente"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CalendarDays className="h-4 w-4 text-slate-500" />
                        {formatDateTime(log.createdAt)}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openDetail(log)}
                        className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300 hover:border-blue-500 hover:text-blue-400"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-10 text-center text-xs font-bold uppercase tracking-widest text-slate-600"
                  >
                    No se encontraron registros de auditoría.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {detailOpen && selectedLog && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-blue-400" />

                <div>
                  <h3 className="text-xl font-black uppercase italic text-white">
                    Detalle de auditoría
                  </h3>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {selectedLog.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDetail}
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  ["Acción", actionLabel[selectedLog.action] || selectedLog.action],
                  ["Entidad", entityLabel[selectedLog.entity] || selectedLog.entity],
                  ["Fecha", formatDateTime(selectedLog.createdAt)],
                  ["Usuario", selectedLog.userName || "Sistema"],
                  ["Email", selectedLog.userEmail || "Sin email"],
                  ["Rol", selectedLog.userRole || "Sin rol"],
                  ["Entidad ID", selectedLog.entityId || "Sin ID"],
                  ["IP", selectedLog.ipAddress || "Sin IP"],
                  ["User Agent", selectedLog.userAgent || "Sin agente"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                      {label}
                    </p>
                    <p className="mt-2 wrap-break-word text-sm font-bold text-slate-200">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-600">
                  Descripción
                </p>
                <p className="text-sm leading-7 text-slate-300">
                  {selectedLog.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-400" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                      Datos previos
                    </p>
                  </div>

                  <pre className="max-h-80 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-6 text-slate-300">
                    {formatJson(selectedLog.previousData)}
                  </pre>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                      Datos nuevos
                    </p>
                  </div>

                  <pre className="max-h-80 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-6 text-slate-300">
                    {formatJson(selectedLog.newData)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Audit;
