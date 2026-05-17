import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Flame,
  Layers,
  MapPinned,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { getIncidents } from "../services/incidentService";

const mapCenter = [-40.155, -71.35];

const initialFilters = {
  crimeType: "",
  status: "TODOS",
  province: "",
  city: "",
  neighborhood: "",
  startDate: "",
  endDate: "",
  limit: 1000,
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

const createIncidentIcon = () => {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        background: #ef4444;
        border: 2px solid white;
        box-shadow: 0 8px 20px rgba(0,0,0,0.4);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("es-AR");
};

const formatDate = (date) => {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const HeatLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return undefined;

    let heatLayer = null;
    let cancelled = false;

    const loadHeatLayer = async () => {
      window.L = L;
      globalThis.L = L;

      await import("leaflet.heat");

      if (cancelled || !L.heatLayer) return;

      heatLayer = L.heatLayer(points, {
        radius: 32,
        blur: 24,
        maxZoom: 16,
        minOpacity: 0.35,
        gradient: {
          0.2: "#2563eb",
          0.45: "#22c55e",
          0.65: "#f59e0b",
          0.85: "#ef4444",
          1: "#7f1d1d",
        },
      }).addTo(map);
    };

    loadHeatLayer();

    return () => {
      cancelled = true;

      if (heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, points]);

  return null;
};

const HeatMapPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const incidentIcon = useMemo(() => createIncidentIcon(), []);

  const loadIncidents = async (customFilters = filters) => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await getIncidents(customFilters);

      if (response.success) {
        setIncidents(response.data || []);
      } else {
        setIncidents([]);
        setMessage({
          text: "No se pudieron cargar los incidentes del mapa de calor.",
          type: "error",
        });
      }
    } catch (error) {
      setIncidents([]);
      setMessage({
        text: error.message || "No se pudieron cargar los incidentes.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getIncidents(initialFilters)
      .then((response) => {
        if (cancelled) return;

        if (response.success) {
          setIncidents(response.data || []);
          return;
        }

        setIncidents([]);
        setMessage({
          text: "No se pudieron cargar los incidentes del mapa de calor.",
          type: "error",
        });
      })
      .catch((error) => {
        if (cancelled) return;

        setIncidents([]);
        setMessage({
          text: error.message || "No se pudieron cargar los incidentes.",
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

  const heatPoints = useMemo(() => {
    return incidents
      .filter((incident) =>
        Number.isFinite(Number(incident.latitude)) &&
        Number.isFinite(Number(incident.longitude)),
      )
      .map((incident) => [
        Number(incident.latitude),
        Number(incident.longitude),
        0.75,
      ]);
  }, [incidents]);

  const summary = useMemo(() => {
    const byCity = {};
    const byNeighborhood = {};
    const byCrimeType = {};

    incidents.forEach((incident) => {
      const city = incident.city || "Sin localidad";
      const neighborhood = incident.neighborhood || "Sin barrio";
      const crimeType = incident.crimeType || "Sin tipo";

      byCity[city] = (byCity[city] || 0) + 1;
      byNeighborhood[neighborhood] = (byNeighborhood[neighborhood] || 0) + 1;
      byCrimeType[crimeType] = (byCrimeType[crimeType] || 0) + 1;
    });

    const topCity =
      Object.entries(byCity)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)[0] || null;

    const topNeighborhood =
      Object.entries(byNeighborhood)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)[0] || null;

    const topCrimeType =
      Object.entries(byCrimeType)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)[0] || null;

    return {
      total: incidents.length,
      heatPoints: heatPoints.length,
      topCity,
      topNeighborhood,
      topCrimeType,
    };
  }, [incidents, heatPoints.length]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadIncidents(filters);
  };

  const handleClearFilters = async () => {
    setFilters(initialFilters);
    await loadIncidents(initialFilters);
  };

  const messageClass =
    message.type === "success"
      ? "border-green-500/40 bg-green-500/10 text-green-400"
      : "border-red-500/40 bg-red-500/10 text-red-400";

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 shadow-lg shadow-orange-900/40">
            <Flame className="h-7 w-7 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Mapa de Calor
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Concentración territorial de incidentes registrados
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadIncidents(filters)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-500 bg-orange-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:bg-orange-500 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Recargar mapa
        </button>
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
          <Layers className="h-5 w-5 text-orange-400" />
          <h3 className="text-sm font-black uppercase tracking-widest text-orange-300">
            Filtros de visualización
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            type="text"
            name="crimeType"
            value={filters.crimeType}
            onChange={handleFilterChange}
            placeholder="Tipo de delito..."
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
          />

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-orange-500"
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
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
          />

          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
            placeholder="Localidad..."
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
          />

          <input
            type="text"
            name="neighborhood"
            value={filters.neighborhood}
            onChange={handleFilterChange}
            placeholder="Barrio..."
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
          />

          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-orange-500"
          />

          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-orange-500"
          />

          <select
            name="limit"
            value={filters.limit}
            onChange={handleFilterChange}
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-orange-500"
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-orange-500 active:scale-95"
          >
            <Search className="h-4 w-4" />
            Aplicar filtros
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
            Incidentes filtrados
          </p>
          <p className="mt-3 text-4xl font-black text-white">
            {formatNumber(summary.total)}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">
            Puntos de calor
          </p>
          <p className="mt-3 text-4xl font-black text-orange-300">
            {formatNumber(summary.heatPoints)}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
            Localidad principal
          </p>
          <p className="mt-3 text-xl font-black uppercase text-white">
            {summary.topCity?.name || "Sin datos"}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            {formatNumber(summary.topCity?.total)} casos
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-300">
            Tipo principal
          </p>
          <p className="mt-3 text-xl font-black uppercase text-white">
            {summary.topCrimeType?.name || "Sin datos"}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            {formatNumber(summary.topCrimeType?.total)} casos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="border-b border-slate-800 px-5 py-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-orange-300">
              Concentración territorial
            </h3>
          </div>

          <div className="h-162.5 bg-slate-950">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-300">
                    Cargando mapa de calor...
                  </p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={12}
                scrollWheelZoom
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {heatPoints.length > 0 && <HeatLayer points={heatPoints} />}

                {incidents.map((incident) => (
                  <Marker
                    key={incident.id}
                    position={[incident.latitude, incident.longitude]}
                    icon={incidentIcon}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <strong>{incident.crimeType}</strong>
                        <p>{incident.description}</p>
                        <p>
                          {incident.city} · {incident.neighborhood}
                        </p>
                        <p>Fecha: {formatDate(incident.incidentDate)}</p>
                        <p>
                          Estado:{" "}
                          {statusLabel[incident.status] || incident.status}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center gap-3">
              <MapPinned className="h-5 w-5 text-orange-300" />
              <h3 className="text-lg font-black uppercase italic text-white">
                Lectura operativa
              </h3>
            </div>

            <div className="space-y-3">
              <InfoCard
                label="Barrio principal"
                value={summary.topNeighborhood?.name || "Sin datos"}
                detail={`${formatNumber(summary.topNeighborhood?.total)} casos`}
              />

              <InfoCard
                label="Localidad principal"
                value={summary.topCity?.name || "Sin datos"}
                detail={`${formatNumber(summary.topCity?.total)} casos`}
              />

              <InfoCard
                label="Tipo principal"
                value={summary.topCrimeType?.name || "Sin datos"}
                detail={`${formatNumber(summary.topCrimeType?.total)} casos`}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Flame className="h-5 w-5 text-orange-300" />
              <h3 className="text-lg font-black uppercase italic text-white">
                Intensidad
              </h3>
            </div>

            <div className="space-y-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              <LegendItem color="bg-blue-600" text="Baja concentración" />
              <LegendItem color="bg-green-500" text="Concentración media" />
              <LegendItem color="bg-yellow-500" text="Alta concentración" />
              <LegendItem color="bg-red-500" text="Zona crítica" />
            </div>
          </section>

          <section className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
            <div className="mb-3 flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-orange-300" />
              <h3 className="text-sm font-black uppercase tracking-widest text-orange-300">
                Nota
              </h3>
            </div>

            <p className="text-xs font-bold uppercase leading-6 tracking-widest text-slate-500">
              El mapa de calor muestra concentración por coordenadas cargadas.
              La interpretación operativa final debe complementarse con contexto
              territorial y datos actualizados.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
};

const InfoCard = ({ label, value, detail }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
        {label}
      </p>
      <p className="mt-2 text-sm font-black uppercase text-white">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-orange-300">
        {detail}
      </p>
    </div>
  );
};

const LegendItem = ({ color, text }) => {
  return (
    <div className="flex items-center gap-3">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span>{text}</span>
    </div>
  );
};

export default HeatMapPage;
