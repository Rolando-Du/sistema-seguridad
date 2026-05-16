import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  exportOperationalReportCsv,
  getOperationalReport,
} from "../services/reportService";

const initialFilters = {
  crimeType: "",
  status: "TODOS",
  province: "",
  department: "",
  city: "",
  neighborhood: "",
  address: "",
  startDate: "",
  endDate: "",
  limit: 500,
};

const statusOptions = [
  { value: "TODOS", label: "Todos" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_INVESTIGACION", label: "En investigación" },
  { value: "RESUELTO", label: "Resuelto" },
  { value: "ARCHIVADO", label: "Archivado" },
];

const statusLabel = {
  PENDIENTE: "Pendiente",
  EN_INVESTIGACION: "En investigación",
  RESUELTO: "Resuelto",
  ARCHIVADO: "Archivado",
};

const chartColors = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
];

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("es-AR");
};

const normalizeStatusData = (items = []) => {
  return items.map((item) => ({
    ...item,
    name: statusLabel[item.name] || item.name,
  }));
};

const downloadCsvFile = (csvContent, filename = "reporte_operativo.csv") => {
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


const ChartFrame = ({ height = 320, children }) => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = containerRef.current;

    if (!element) return undefined;

    const updateWidth = () => {
      const nextWidth = Math.floor(element.getBoundingClientRect().width);

      if (nextWidth > 0) {
        setWidth(nextWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full min-w-0"
      style={{ height }}
    >
      {width > 0 ? (
        children({ width, height })
      ) : (
        <div className="flex h-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold uppercase tracking-widest text-slate-600">
          Preparando gráfico...
        </div>
      )}
    </div>
  );
};

const Reports = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const loadReport = async (customFilters = filters) => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await getOperationalReport(customFilters);

      if (response.success) {
        setReport(response);
      } else {
        setReport(null);
        setMessage({
          text: "No se pudo cargar el reporte operativo.",
          type: "error",
        });
      }
    } catch (error) {
      setReport(null);
      setMessage({
        text: error.message || "Error al cargar reportes.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(initialFilters);
  }, []);

  const summary = report?.summary || {};
  const data = report?.data || [];

  const chartData = useMemo(() => {
    return {
      byCrimeType: summary.byCrimeType || [],
      byStatus: normalizeStatusData(summary.byStatus || []),
      byCity: summary.byCity || [],
      byNeighborhood: summary.byNeighborhood || [],
      byDate: summary.byDate || [],
    };
  }, [summary]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadReport(filters);
  };

  const handleClearFilters = async () => {
    setFilters(initialFilters);
    await loadReport(initialFilters);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    setMessage({ text: "", type: "" });

    try {
      const csv = await exportOperationalReportCsv(filters);
      const date = new Date().toISOString().split("T")[0];

      downloadCsvFile(csv, `reporte_operativo_${date}.csv`);

      setMessage({
        text: "Reporte CSV exportado correctamente.",
        type: "success",
      });

      await loadReport(filters);
    } catch (error) {
      setMessage({
        text: error.message || "No se pudo exportar el reporte.",
        type: "error",
      });
    } finally {
      setExporting(false);
    }
  };

  const messageClass =
    message.type === "success"
      ? "border-green-500/40 bg-green-500/10 text-green-400"
      : "border-red-500/40 bg-red-500/10 text-red-400";

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">
            Cargando reportes operativos...
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
            <BarChart3 className="h-7 w-7 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Reportes Operativos
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Indicadores, rankings, evolución y exportación CSV
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => loadReport(filters)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all hover:bg-slate-700 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Recargar
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-500 bg-green-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:bg-green-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exportando..." : "Exportar CSV"}
          </button>
        </div>
      </div>

      {message.text && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-widest ${messageClass}`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
      >
        <div className="mb-4 flex items-center gap-3">
          <Filter className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">
            Filtros del reporte
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            type="text"
            name="crimeType"
            value={filters.crimeType}
            onChange={handleFilterChange}
            placeholder="Tipo de delito..."
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="province"
            value={filters.province}
            onChange={handleFilterChange}
            placeholder="Provincia..."
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <input
            type="text"
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
            placeholder="Departamento..."
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
            placeholder="Localidad..."
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <input
            type="text"
            name="neighborhood"
            value={filters.neighborhood}
            onChange={handleFilterChange}
            placeholder="Barrio..."
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <input
            type="text"
            name="address"
            value={filters.address}
            onChange={handleFilterChange}
            placeholder="Dirección..."
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
            <option value={100}>100 registros</option>
            <option value={500}>500 registros</option>
            <option value={1000}>1000 registros</option>
            <option value={2000}>2000 registros</option>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Total filtrado
          </p>
          <p className="mt-3 text-4xl font-black text-white">
            {formatNumber(summary.total)}
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-300">
            Tipo crítico
          </p>
          <p className="mt-3 text-xl font-black uppercase text-white">
            {summary.criticalCrimeType?.name || "Sin datos"}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            {formatNumber(summary.criticalCrimeType?.total)} casos
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
            Localidad crítica
          </p>
          <p className="mt-3 text-xl font-black uppercase text-white">
            {summary.criticalCity?.name || "Sin datos"}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            {formatNumber(summary.criticalCity?.total)} casos
          </p>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">
            Barrio crítico
          </p>
          <p className="mt-3 text-xl font-black uppercase text-white">
            {summary.criticalNeighborhood?.neighborhood || "Sin datos"}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            {summary.criticalNeighborhood?.city || "Sin localidad"} ·{" "}
            {formatNumber(summary.criticalNeighborhood?.total)} casos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-black uppercase italic text-white">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Incidentes por tipo
          </h3>

          <ChartFrame height={320}>
            {({ width, height }) => (
              <BarChart width={width} height={height} data={chartData.byCrimeType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ChartFrame>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-black uppercase italic text-white">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Evolución por fecha
          </h3>

          <ChartFrame height={320}>
            {({ width, height }) => (
              <LineChart width={width} height={height} data={chartData.byDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            )}
          </ChartFrame>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-black uppercase italic text-white">
            <FileSpreadsheet className="h-5 w-5 text-purple-400" />
            Estados
          </h3>

          <ChartFrame height={288}>
            {({ width, height }) => (
              <PieChart width={width} height={height}>
                <Pie
                  data={chartData.byStatus}
                  dataKey="total"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  label
                >
                  {chartData.byStatus.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            )}
          </ChartFrame>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-5 text-lg font-black uppercase italic text-white">
            Ranking por localidad
          </h3>

          <div className="space-y-3">
            {chartData.byCity.length > 0 ? (
              chartData.byCity.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    #{index + 1} · {item.name}
                  </span>

                  <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-300">
                    {formatNumber(item.total)}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs font-bold uppercase tracking-widest text-slate-600">
                Sin datos disponibles.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="mb-5 text-lg font-black uppercase italic text-white">
          Ranking por barrio
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {chartData.byNeighborhood.length > 0 ? (
            chartData.byNeighborhood.map((item, index) => (
              <div
                key={`${item.neighborhood}-${item.city}`}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                  #{index + 1}
                </p>
                <p className="mt-2 font-black uppercase text-white">
                  {item.neighborhood}
                </p>
                <p className="mt-1 text-xs text-slate-500">{item.city}</p>
                <p className="mt-3 text-2xl font-black text-orange-300">
                  {formatNumber(item.total)}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs font-bold uppercase tracking-widest text-slate-600 md:col-span-2 xl:col-span-3">
              Sin datos disponibles.
            </p>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-5 py-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">
            Incidentes incluidos en el reporte
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-950 text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Ubicación</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Creado por</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((incident) => (
                  <tr
                    key={incident.id}
                    className="border-t border-slate-800 text-slate-300 hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-black uppercase text-white">
                        {incident.crimeType}
                      </p>
                      <p className="mt-1 line-clamp-1 max-w-xs text-xs text-slate-500">
                        {incident.description}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {statusLabel[incident.status] || incident.status}
                    </td>

                    <td className="px-4 py-4">
                      {new Date(incident.incidentDate).toLocaleDateString(
                        "es-AR",
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-200">
                        {incident.city}
                      </p>
                      <p className="text-xs text-slate-500">
                        {incident.neighborhood} · {incident.province}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-400">
                      {incident.address || "Sin dirección"}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-200">
                        {incident.createdBy?.name || "Sin usuario"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {incident.createdBy?.email || "Sin email"}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-xs font-bold uppercase tracking-widest text-slate-600"
                  >
                    No hay incidentes para el reporte seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default Reports;
