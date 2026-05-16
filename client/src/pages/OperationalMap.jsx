import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Building2,
  Crosshair,
  FileText,
  MapPinned,
  Navigation,
  RefreshCw,
  Route,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { getBases } from "../services/baseService";
import { getIncidents } from "../services/incidentService";
import { getNearestBaseByIncident } from "../services/routeService";

const mapCenter = [-40.155, -71.35];

const statusLabel = {
  PENDIENTE: "Pendiente",
  EN_INVESTIGACION: "En investigación",
  RESUELTO: "Resuelto",
  ARCHIVADO: "Archivado",
};

const createMarkerIcon = ({ type, active = true }) => {
  const color =
    type === "incident"
      ? "#ef4444"
      : active
        ? "#2563eb"
        : "#64748b";

  const symbol = type === "incident" ? "!" : "B";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 10px 25px rgba(0,0,0,0.45);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 13px;
        font-family: Arial, sans-serif;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

const formatDate = (date) => {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("es-AR");
};

const OperationalMap = () => {
  const [incidents, setIncidents] = useState([]);
  const [bases, setBases] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [routeResult, setRouteResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const incidentIcon = useMemo(
    () =>
      createMarkerIcon({
        type: "incident",
      }),
    [],
  );

  const activeBaseIcon = useMemo(
    () =>
      createMarkerIcon({
        type: "base",
        active: true,
      }),
    [],
  );

  const inactiveBaseIcon = useMemo(
    () =>
      createMarkerIcon({
        type: "base",
        active: false,
      }),
    [],
  );

  const loadMapData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const [incidentResponse, baseResponse] = await Promise.all([
        getIncidents({
          status: "TODOS",
          limit: 500,
        }),
        getBases({
          includeInactive: true,
          baseType: "TODOS",
        }),
      ]);

      setIncidents(incidentResponse.data || []);
      setBases(baseResponse.data || []);
    } catch (error) {
      setMessage({
        text: error.message || "No se pudieron cargar los datos del mapa.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const handleSelectIncident = async (incident) => {
    setSelectedIncident(incident);
    setRouteResult(null);
    setCalculatingRoute(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await getNearestBaseByIncident(incident.id);

      if (response.success) {
        setRouteResult(response.data);
      } else {
        setMessage({
          text: "No se pudo calcular la base más cercana.",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: error.message || "No se pudo calcular la base más cercana.",
        type: "error",
      });
    } finally {
      setCalculatingRoute(false);
    }
  };

  const routeLine = useMemo(() => {
    if (!routeResult?.incident || !routeResult?.nearestBase) return null;

    return [
      [routeResult.nearestBase.latitude, routeResult.nearestBase.longitude],
      [routeResult.incident.latitude, routeResult.incident.longitude],
    ];
  }, [routeResult]);

  const activeBases = bases.filter((base) => base.active);
  const inactiveBases = bases.filter((base) => !base.active);

  const messageClass =
    message.type === "success"
      ? "border-green-500/40 bg-green-500/10 text-green-400"
      : "border-red-500/40 bg-red-500/10 text-red-400";

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/40">
            <MapPinned className="h-7 w-7 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Mapa Operativo
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Incidentes, bases activas y cálculo de respuesta operativa
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadMapData}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500 active:scale-95"
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-300">
            Incidentes
          </p>
          <p className="mt-3 text-4xl font-black text-red-300">
            {formatNumber(incidents.length)}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
            Bases activas
          </p>
          <p className="mt-3 text-4xl font-black text-blue-300">
            {formatNumber(activeBases.length)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Bases inactivas
          </p>
          <p className="mt-3 text-4xl font-black text-slate-300">
            {formatNumber(inactiveBases.length)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="border-b border-slate-800 px-5 py-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">
              Visualización territorial
            </h3>
          </div>

          <div className="h-[620px] bg-slate-950">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">
                    Cargando mapa...
                  </p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={11}
                scrollWheelZoom
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {bases.map((base) => (
                  <Marker
                    key={base.id}
                    position={[base.latitude, base.longitude]}
                    icon={base.active ? activeBaseIcon : inactiveBaseIcon}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <strong>{base.name}</strong>
                        <p>{base.address}</p>
                        <p>
                          {base.city} · {base.neighborhood}
                        </p>
                        <p>{base.active ? "Activa" : "Inactiva"}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {incidents.map((incident) => (
                  <Marker
                    key={incident.id}
                    position={[incident.latitude, incident.longitude]}
                    icon={incidentIcon}
                  >
                    <Popup>
                      <div className="space-y-2">
                        <strong>{incident.crimeType}</strong>
                        <p>{incident.description}</p>
                        <p>
                          {incident.city} · {incident.neighborhood}
                        </p>
                        <p>Estado: {statusLabel[incident.status]}</p>
                        <button
                          type="button"
                          onClick={() => handleSelectIncident(incident)}
                          style={{
                            width: "100%",
                            border: "none",
                            borderRadius: "8px",
                            padding: "8px 10px",
                            background: "#2563eb",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: 800,
                            fontSize: "11px",
                            textTransform: "uppercase",
                          }}
                        >
                          Calcular base cercana
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {routeLine && (
                  <Polyline
                    positions={routeLine}
                    pathOptions={{
                      color: "#22c55e",
                      weight: 5,
                      opacity: 0.85,
                    }}
                  />
                )}
              </MapContainer>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Crosshair className="h-5 w-5 text-red-400" />
              <h3 className="text-lg font-black uppercase italic text-white">
                Incidente seleccionado
              </h3>
            </div>

            {selectedIncident ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-300">
                    {selectedIncident.crimeType}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {selectedIncident.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <InfoCard label="Fecha" value={formatDate(selectedIncident.incidentDate)} />
                  <InfoCard label="Localidad" value={selectedIncident.city} />
                  <InfoCard label="Barrio" value={selectedIncident.neighborhood} />
                  <InfoCard
                    label="Estado"
                    value={statusLabel[selectedIncident.status] || selectedIncident.status}
                  />
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-xs font-bold uppercase leading-6 tracking-widest text-slate-600">
                Seleccioná un incidente en el mapa para calcular la base
                operativa más cercana.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Route className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-black uppercase italic text-white">
                Respuesta operativa
              </h3>
            </div>

            {calculatingRoute ? (
              <p className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-xs font-bold uppercase tracking-widest text-blue-400">
                Calculando base más cercana...
              </p>
            ) : routeResult?.nearestBase ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-300">
                    Base más cercana
                  </p>

                  <p className="mt-3 text-lg font-black uppercase text-white">
                    {routeResult.nearestBase.name}
                  </p>

                  <p className="mt-2 text-xs leading-6 text-slate-400">
                    {routeResult.nearestBase.address}
                  </p>

                  <p className="mt-3 text-3xl font-black text-green-300">
                    {routeResult.nearestBase.distanceKm} km
                  </p>
                </div>

                <ResponseTimeCard
                  title="Emergencia"
                  icon={<ShieldAlert className="h-5 w-5" />}
                  data={routeResult.nearestBase.responseTimes.emergency}
                />

                <ResponseTimeCard
                  title="Patrullero normal"
                  icon={<Navigation className="h-5 w-5" />}
                  data={routeResult.nearestBase.responseTimes.patrol}
                />

                <ResponseTimeCard
                  title="A pie"
                  icon={<FileText className="h-5 w-5" />}
                  data={routeResult.nearestBase.responseTimes.walking}
                />

                {routeResult.alternatives?.length > 0 && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Alternativas
                    </p>

                    <div className="space-y-2">
                      {routeResult.alternatives.map((base) => (
                        <div
                          key={base.id}
                          className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
                        >
                          <span className="text-xs font-bold text-slate-300">
                            {base.name}
                          </span>
                          <span className="text-xs font-black text-blue-300">
                            {base.distanceKm} km
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-xs font-bold uppercase leading-6 tracking-widest text-slate-600">
                Todavía no hay cálculo operativo seleccionado.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-black uppercase italic text-white">
                Leyenda
              </h3>
            </div>

            <div className="space-y-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              <LegendItem color="bg-red-500" text="Incidente" />
              <LegendItem color="bg-blue-600" text="Base activa" />
              <LegendItem color="bg-slate-500" text="Base inactiva" />
              <LegendItem color="bg-green-500" text="Ruta aproximada" />
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
};

const InfoCard = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
};

const ResponseTimeCard = ({ title, icon, data }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-blue-300">
          {icon}
          <p className="text-[10px] font-black uppercase tracking-widest">
            {title}
          </p>
        </div>

        <p className="text-lg font-black text-white">
          {data?.estimatedMinutes ?? 0} min
        </p>
      </div>

      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
        Velocidad estimada: {data?.speedKmh ?? 0} km/h
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

export default OperationalMap;
