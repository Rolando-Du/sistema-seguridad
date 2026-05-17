import {
  Eye,
  FileText,
  Pencil,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  deleteIncident,
  getIncidents,
  updateIncident,
  updateIncidentStatus,
} from "../services/incidentService";

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
};

const statusOptions = [
  { value: "TODOS", label: "Todos" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_INVESTIGACION", label: "En investigación" },
  { value: "RESUELTO", label: "Resuelto" },
  { value: "ARCHIVADO", label: "Archivado" },
];

const editableStatusOptions = statusOptions.filter(
  (status) => status.value !== "TODOS",
);

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

const formatDate = (date) => {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
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

const normalizeDateForInput = (date) => {
  if (!date) return "";

  return new Date(date).toISOString().split("T")[0];
};

const buildEditForm = (incident) => ({
  crimeType: incident?.crimeType || "",
  description: incident?.description || "",
  incidentDate: normalizeDateForInput(incident?.incidentDate),
  province: incident?.province || "",
  department: incident?.department || "",
  city: incident?.city || "",
  neighborhood: incident?.neighborhood || "",
  address: incident?.address || "",
  latitude: incident?.latitude ?? "",
  longitude: incident?.longitude ?? "",
  involvedGender: incident?.involvedGender || "",
  ageRange: incident?.ageRange || "",
  status: incident?.status || "PENDIENTE",
});

const ManageIncidents = () => {
  const { canOperate, isAdmin } = useAuth();

  const [filters, setFilters] = useState(initialFilters);
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(buildEditForm(null));

  const loadIncidents = async (customFilters = filters) => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await getIncidents(customFilters);

      if (response.success) {
        setIncidents(response.data || []);
        setTotal(response.total || 0);
      } else {
        setIncidents([]);
        setTotal(0);
        setMessage({
          text: "No se pudieron cargar los incidentes.",
          type: "error",
        });
      }
    } catch (error) {
      setIncidents([]);
      setTotal(0);
      setMessage({
        text: error.message || "Error al cargar incidentes.",
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
          setTotal(response.total || 0);
          return;
        }

        setIncidents([]);
        setTotal(0);
        setMessage({
          text: "No se pudieron cargar los incidentes.",
          type: "error",
        });
      })
      .catch((error) => {
        if (cancelled) return;

        setIncidents([]);
        setTotal(0);
        setMessage({
          text: error.message || "Error al cargar incidentes.",
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
      total: incidents.length,
      pendientes: incidents.filter((item) => item.status === "PENDIENTE")
        .length,
      investigacion: incidents.filter(
        (item) => item.status === "EN_INVESTIGACION",
      ).length,
      resueltos: incidents.filter((item) => item.status === "RESUELTO").length,
      archivados: incidents.filter((item) => item.status === "ARCHIVADO")
        .length,
    };
  }, [incidents]);

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

  const openDetail = (incident) => {
    setSelectedIncident(incident);
    setDetailOpen(true);
  };

  const openEdit = (incident) => {
    setSelectedIncident(incident);
    setEditForm(buildEditForm(incident));
    setEditOpen(true);
  };

  const closeModals = () => {
    setSelectedIncident(null);
    setDetailOpen(false);
    setEditOpen(false);
    setEditForm(buildEditForm(null));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!selectedIncident) return;

    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      await updateIncident(selectedIncident.id, {
        ...editForm,
        latitude: Number(editForm.latitude),
        longitude: Number(editForm.longitude),
      });

      await updateIncidentStatus(selectedIncident.id, editForm.status);

      setMessage({
        text: "Incidente actualizado correctamente.",
        type: "success",
      });

      closeModals();
      await loadIncidents(filters);
    } catch (error) {
      setMessage({
        text: error.message || "No se pudo actualizar el incidente.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeStatus = async (incident, status) => {
    setMessage({ text: "", type: "" });

    try {
      await updateIncidentStatus(incident.id, status);

      setMessage({
        text: "Estado actualizado correctamente.",
        type: "success",
      });

      await loadIncidents(filters);
    } catch (error) {
      setMessage({
        text: error.message || "No se pudo cambiar el estado.",
        type: "error",
      });
    }
  };

  const handleDelete = async (incident) => {
    const confirmed = window.confirm(
      `¿Seguro que querés eliminar el incidente "${incident.crimeType}"?`,
    );

    if (!confirmed) return;

    setMessage({ text: "", type: "" });

    try {
      await deleteIncident(incident.id);

      setMessage({
        text: "Incidente eliminado correctamente.",
        type: "success",
      });

      await loadIncidents(filters);
    } catch (error) {
      setMessage({
        text: error.message || "No se pudo eliminar el incidente.",
        type: "error",
      });
    }
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
            <FileText className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Gestión de Incidentes
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Listado, filtros, detalle, edición y control de estado
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadIncidents(filters)}
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

        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-yellow-300">
            Pendientes
          </p>
          <p className="mt-3 text-4xl font-black text-yellow-300">
            {summary.pendientes}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            En investigación
          </p>
          <p className="mt-3 text-4xl font-black text-blue-400">
            {summary.investigacion}
          </p>
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-400">
            Resueltos
          </p>
          <p className="mt-3 text-4xl font-black text-green-400">
            {summary.resueltos}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Archivados
          </p>
          <p className="mt-3 text-4xl font-black text-slate-300">
            {summary.archivados}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
      >
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

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500 active:scale-95"
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
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-5 py-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">
            Incidentes registrados
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-275 text-left text-sm">
            <thead className="bg-slate-950 text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Ubicación</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Creado por</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-xs font-bold uppercase tracking-widest text-slate-600"
                  >
                    Cargando incidentes...
                  </td>
                </tr>
              ) : incidents.length > 0 ? (
                incidents.map((incident) => (
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
                      {formatDate(incident.incidentDate)}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-200">
                        {incident.city}
                      </p>
                      <p className="text-xs text-slate-500">
                        {incident.neighborhood} · {incident.province}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {canOperate ? (
                        <select
                          value={incident.status}
                          onChange={(event) =>
                            handleChangeStatus(incident, event.target.value)
                          }
                          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest outline-none ${getStatusClass(
                            incident.status,
                          )}`}
                        >
                          {editableStatusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusClass(
                            incident.status,
                          )}`}
                        >
                          {statusLabel[incident.status] || incident.status}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-200">
                        {incident.createdBy?.name || "Sin usuario"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(incident.createdAt)}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openDetail(incident)}
                          className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300 hover:border-blue-500 hover:text-blue-400"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {canOperate && (
                          <button
                            type="button"
                            onClick={() => openEdit(incident)}
                            className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300 hover:border-yellow-500 hover:text-yellow-300"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(incident)}
                            className="rounded-lg border border-red-500/40 bg-red-950/30 p-2 text-red-300 hover:bg-red-600 hover:text-white"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-xs font-bold uppercase tracking-widest text-slate-600"
                  >
                    No se encontraron incidentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {detailOpen && selectedIncident && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h3 className="text-xl font-black uppercase italic text-white">
                Detalle del incidente
              </h3>

              <button
                type="button"
                onClick={closeModals}
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                  {selectedIncident.crimeType}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {selectedIncident.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ["Fecha", formatDate(selectedIncident.incidentDate)],
                  ["Estado", statusLabel[selectedIncident.status]],
                  ["Provincia", selectedIncident.province],
                  ["Departamento", selectedIncident.department || "Sin dato"],
                  ["Localidad", selectedIncident.city],
                  ["Barrio", selectedIncident.neighborhood],
                  ["Dirección", selectedIncident.address || "Sin dato"],
                  [
                    "Coordenadas",
                    `${selectedIncident.latitude}, ${selectedIncident.longitude}`,
                  ],
                  [
                    "Género involucrado",
                    selectedIncident.involvedGender || "Sin dato",
                  ],
                  ["Rango etario", selectedIncident.ageRange || "Sin dato"],
                  [
                    "Creado por",
                    selectedIncident.createdBy?.name || "Sin usuario",
                  ],
                  ["Fecha registro", formatDateTime(selectedIncident.createdAt)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-200">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {editOpen && selectedIncident && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-xl font-black uppercase italic text-white">
                  Editar incidente
                </h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Modificación auditada
                </p>
              </div>

              <button
                type="button"
                onClick={closeModals}
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  name="crimeType"
                  value={editForm.crimeType}
                  onChange={handleEditChange}
                  required
                  placeholder="Tipo de delito"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                />

                <input
                  type="date"
                  name="incidentDate"
                  value={editForm.incidentDate}
                  onChange={handleEditChange}
                  required
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                />

                <input
                  name="province"
                  value={editForm.province}
                  onChange={handleEditChange}
                  required
                  placeholder="Provincia"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                />

                <input
                  name="department"
                  value={editForm.department}
                  onChange={handleEditChange}
                  placeholder="Departamento"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                />

                <input
                  name="city"
                  value={editForm.city}
                  onChange={handleEditChange}
                  required
                  placeholder="Localidad"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                />

                <input
                  name="neighborhood"
                  value={editForm.neighborhood}
                  onChange={handleEditChange}
                  required
                  placeholder="Barrio"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                />

                <input
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  placeholder="Dirección"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                />

                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                >
                  {editableStatusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={editForm.latitude}
                  onChange={handleEditChange}
                  required
                  placeholder="Latitud"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                />

                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={editForm.longitude}
                  onChange={handleEditChange}
                  required
                  placeholder="Longitud"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                />

                <input
                  name="involvedGender"
                  value={editForm.involvedGender}
                  onChange={handleEditChange}
                  placeholder="Género involucrado"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                />

                <input
                  name="ageRange"
                  value={editForm.ageRange}
                  onChange={handleEditChange}
                  placeholder="Rango etario"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                required
                rows="4"
                placeholder="Descripción"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />

              <div className="flex flex-col justify-end gap-3 border-t border-slate-800 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={closeModals}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg border border-blue-500 bg-blue-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!canOperate && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">
          <ShieldAlert className="h-4 w-4 text-blue-400" />
          Tu rol permite consultar incidentes, pero no editar ni cambiar estados.
        </div>
      )}
    </section>
  );
};

export default ManageIncidents;
