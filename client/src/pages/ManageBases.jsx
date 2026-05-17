import {
  Building2,
  Eye,
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createBase,
  deleteBase,
  getBases,
  updateBase,
  updateBaseStatus,
} from "../services/baseService";
import BaseTypeBadge from "../components/features/bases/BaseTypeBadge";

const initialFilters = {
  includeInactive: true,
  province: "",
  department: "",
  city: "",
  neighborhood: "",
  baseType: "TODOS",
};

const initialForm = {
  name: "",
  address: "",
  province: "Neuquén",
  department: "",
  city: "",
  neighborhood: "",
  baseType: "BASE_OPERATIVA",
  latitude: "",
  longitude: "",
  active: true,
};

const baseTypeOptions = [
  { value: "TODOS", label: "Todos" },
  { value: "COMISARIA", label: "Comisaría" },
  { value: "DESTACAMENTO", label: "Destacamento" },
  { value: "BASE_OPERATIVA", label: "Base Operativa" },
  { value: "PUESTO_POLICIAL", label: "Puesto Policial" },
  { value: "OTRO", label: "Otro" },
];

const editableBaseTypeOptions = baseTypeOptions.filter(
  (baseType) => baseType.value !== "TODOS",
);


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

const buildGoogleMapsUrl = (base) => {
  const latitude = Number(base?.latitude);
  const longitude = Number(base?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

const buildFormFromBase = (base) => ({
  name: base?.name || "",
  address: base?.address || "",
  province: base?.province || "Neuquén",
  department: base?.department || "",
  city: base?.city || "",
  neighborhood: base?.neighborhood || "",
  baseType: base?.baseType || "BASE_OPERATIVA",
  latitude: base?.latitude ?? "",
  longitude: base?.longitude ?? "",
  active: base?.active ?? true,
});

const ManageBases = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [bases, setBases] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingBase, setEditingBase] = useState(null);
  const [selectedBase, setSelectedBase] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const loadBases = async (customFilters = filters) => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await getBases(customFilters);

      if (response.success) {
        setBases(response.data || []);
        setTotal(response.total || 0);
      } else {
        setBases([]);
        setTotal(0);
        setMessage({
          text: "No se pudieron cargar las bases operativas.",
          type: "error",
        });
      }
    } catch (error) {
      setBases([]);
      setTotal(0);
      setMessage({
        text: error.message || "Error al cargar bases operativas.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getBases(initialFilters)
      .then((response) => {
        if (cancelled) return;

        if (response.success) {
          setBases(response.data || []);
          setTotal(response.total || 0);
          return;
        }

        setBases([]);
        setTotal(0);
        setMessage({
          text: "No se pudieron cargar las bases operativas.",
          type: "error",
        });
      })
      .catch((error) => {
        if (cancelled) return;

        setBases([]);
        setTotal(0);
        setMessage({
          text: error.message || "Error al cargar bases operativas.",
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
      total: bases.length,
      active: bases.filter((base) => base.active).length,
      inactive: bases.filter((base) => !base.active).length,
      cities: new Set(bases.map((base) => base.city)).size,
    };
  }, [bases]);

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadBases(filters);
  };

  const handleClearFilters = async () => {
    setFilters(initialFilters);
    await loadBases(initialFilters);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "active" ? value === "true" : value,
    }));

    setMessage({ text: "", type: "" });
  };

  const openCreateModal = () => {
    setEditingBase(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (base) => {
    setEditingBase(base);
    setFormData(buildFormFromBase(base));
    setModalOpen(true);
  };

  const openDetailModal = (base) => {
    setSelectedBase(base);
    setDetailOpen(true);
  };

  const closeModals = () => {
    setModalOpen(false);
    setDetailOpen(false);
    setEditingBase(null);
    setSelectedBase(null);
    setFormData(initialForm);
  };

  const validateForm = () => {
    if (formData.name.trim().length < 2) {
      return "El nombre de la base es obligatorio.";
    }

    if (formData.address.trim().length < 2) {
      return "La dirección es obligatoria.";
    }

    if (formData.province.trim().length < 2) {
      return "La provincia es obligatoria.";
    }

    if (formData.city.trim().length < 2) {
      return "La localidad es obligatoria.";
    }

    if (formData.neighborhood.trim().length < 2) {
      return "El barrio/zona es obligatorio.";
    }

    if (!Number.isFinite(Number(formData.latitude))) {
      return "La latitud debe ser un número válido.";
    }

    if (!Number.isFinite(Number(formData.longitude))) {
      return "La longitud debe ser un número válido.";
    }

    return null;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setMessage({
        text: validationError,
        type: "error",
      });
      return;
    }

    setSaving(true);
    setMessage({ text: "", type: "" });

    const payload = {
      ...formData,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      active: Boolean(formData.active),
    };

    try {
      if (editingBase) {
        await updateBase(editingBase.id, payload);

        setMessage({
          text: "Base operativa actualizada correctamente.",
          type: "success",
        });
      } else {
        await createBase(payload);

        setMessage({
          text: "Base operativa creada correctamente.",
          type: "success",
        });
      }

      closeModals();
      await loadBases(filters);
    } catch (error) {
      setMessage({
        text: error.message || "No se pudo guardar la base operativa.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (base) => {
    const nextStatus = !base.active;

    const confirmed = window.confirm(
      nextStatus
        ? `¿Querés activar la base "${base.name}"?`
        : `¿Querés desactivar la base "${base.name}"?`,
    );

    if (!confirmed) return;

    setMessage({ text: "", type: "" });

    try {
      await updateBaseStatus(base.id, nextStatus);

      setMessage({
        text: nextStatus
          ? "Base operativa activada correctamente."
          : "Base operativa desactivada correctamente.",
        type: "success",
      });

      await loadBases(filters);
    } catch (error) {
      setMessage({
        text: error.message || "No se pudo cambiar el estado de la base.",
        type: "error",
      });
    }
  };

  const handleDelete = async (base) => {
    const confirmed = window.confirm(
      `¿Seguro que querés dar de baja lógica la base "${base.name}"?`,
    );

    if (!confirmed) return;

    setMessage({ text: "", type: "" });

    try {
      await deleteBase(base.id);

      setMessage({
        text: "Base operativa dada de baja correctamente.",
        type: "success",
      });

      await loadBases(filters);
    } catch (error) {
      setMessage({
        text: error.message || "No se pudo dar de baja la base.",
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
            <Building2 className="h-7 w-7 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Bases Operativas
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Administración de comisarías, destacamentos y puestos operativos
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => loadBases(filters)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all hover:bg-slate-700 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Recargar
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Nueva base
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Total filtrado
          </p>
          <p className="mt-3 text-4xl font-black text-white">{total}</p>
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-400">
            Activas
          </p>
          <p className="mt-3 text-4xl font-black text-green-300">
            {summary.active}
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
            Inactivas
          </p>
          <p className="mt-3 text-4xl font-black text-red-300">
            {summary.inactive}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Localidades
          </p>
          <p className="mt-3 text-4xl font-black text-blue-300">
            {summary.cities}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
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
            placeholder="Barrio/zona..."
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <select
            name="baseType"
            value={filters.baseType}
            onChange={handleFilterChange}
            className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-blue-500"
          >
            {baseTypeOptions.map((baseType) => (
              <option key={baseType.value} value={baseType.value}>
                {baseType.label}
              </option>
            ))}
          </select>

          <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <input
              type="checkbox"
              name="includeInactive"
              checked={filters.includeInactive}
              onChange={handleFilterChange}
              className="h-4 w-4 accent-blue-600"
            />
            Incluir inactivas
          </label>
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
            Bases registradas
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-slate-950 text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-5 py-3">Dependencia</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Ubicación</th>
                <th className="px-5 py-3">Coordenadas</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-xs font-bold uppercase tracking-widest text-slate-600"
                  >
                    Cargando bases operativas...
                  </td>
                </tr>
              ) : bases.length > 0 ? (
                bases.map((base) => (
                  <tr
                    key={base.id}
                    className="border-t border-slate-800 text-slate-300 hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-5 align-middle">
                      <div className="max-w-[360px]">
                        <p className="text-sm font-black uppercase leading-5 text-white">
                          {base.name}
                        </p>
                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
                          {base.address}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-5 align-middle">
                      <BaseTypeBadge type={base.baseType} />
                    </td>

                    <td className="px-5 py-5 align-middle">
                      <div className="max-w-[240px]">
                        <p className="font-black text-slate-100">{base.city}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {base.neighborhood} · {base.department || "Sin depto."}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                          {base.province}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-5 align-middle">
                      <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                        <p className="font-mono text-[11px] font-bold text-slate-300">
                          {Number(base.latitude).toFixed(5)}
                        </p>
                        <p className="font-mono text-[11px] font-bold text-slate-500">
                          {Number(base.longitude).toFixed(5)}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-5 align-middle">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          base.active
                            ? "border-green-500/40 bg-green-500/10 text-green-400"
                            : "border-red-500/40 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {base.active ? "Activa" : "Inactiva"}
                      </span>
                    </td>

                    <td className="px-5 py-5 align-middle">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openDetailModal(base)}
                          className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300 hover:border-blue-500 hover:text-blue-400"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {buildGoogleMapsUrl(base) && (
                          <a
                            href={buildGoogleMapsUrl(base)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300 hover:border-green-500 hover:text-green-400"
                            title="Abrir en Google Maps"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditModal(base)}
                          className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300 hover:border-yellow-500 hover:text-yellow-300"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(base)}
                          className={`rounded-lg border p-2 ${
                            base.active
                              ? "border-red-500/40 bg-red-950/30 text-red-300 hover:bg-red-600 hover:text-white"
                              : "border-green-500/40 bg-green-950/30 text-green-300 hover:bg-green-600 hover:text-white"
                          }`}
                          title={base.active ? "Desactivar" : "Activar"}
                        >
                          <Power className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(base)}
                          className="rounded-lg border border-red-500/40 bg-red-950/30 p-2 text-red-300 hover:bg-red-600 hover:text-white"
                          title="Baja lógica"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
                    No se encontraron bases operativas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {detailOpen && selectedBase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h3 className="text-xl font-black uppercase italic text-white">
                Detalle de base operativa
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
                <BaseTypeBadge type={selectedBase.baseType} />
                <p className="mt-3 text-xl font-black uppercase text-white">
                  {selectedBase.name}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {selectedBase.address}
                </p>

                {buildGoogleMapsUrl(selectedBase) && (
                  <a
                    href={buildGoogleMapsUrl(selectedBase)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green-300 transition-all hover:bg-green-500 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir ubicación en Google Maps
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ["Provincia", selectedBase.province],
                  ["Departamento", selectedBase.department || "Sin dato"],
                  ["Localidad", selectedBase.city],
                  ["Barrio/Zona", selectedBase.neighborhood],
                  ["Latitud", selectedBase.latitude],
                  ["Longitud", selectedBase.longitude],
                  ["Estado", selectedBase.active ? "Activa" : "Inactiva"],
                  ["Fecha creación", formatDateTime(selectedBase.createdAt)],
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

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-xl font-black uppercase italic text-white">
                  {editingBase ? "Editar base operativa" : "Nueva base operativa"}
                </h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Acción administrativa auditada
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

            <form onSubmit={handleSave} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Nombre de la base"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

                <select
                  name="baseType"
                  value={formData.baseType}
                  onChange={handleFormChange}
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                >
                  {editableBaseTypeOptions.map((baseType) => (
                    <option key={baseType.value} value={baseType.value}>
                      {baseType.label}
                    </option>
                  ))}
                </select>

                <input
                  name="province"
                  value={formData.province}
                  onChange={handleFormChange}
                  required
                  placeholder="Provincia"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

                <input
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  placeholder="Departamento"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

                <input
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  required
                  placeholder="Localidad"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

                <input
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleFormChange}
                  required
                  placeholder="Barrio/Zona"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

                <input
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  required
                  placeholder="Dirección"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500 md:col-span-2"
                />

                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleFormChange}
                  required
                  placeholder="Latitud"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleFormChange}
                  required
                  placeholder="Longitud"
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

                <select
                  name="active"
                  value={String(formData.active)}
                  onChange={handleFormChange}
                  className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="true">Activa</option>
                  <option value="false">Inactiva</option>
                </select>
              </div>

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
                  {saving ? "Guardando..." : "Guardar base"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">
        <MapPin className="h-4 w-4 text-blue-400" />
        Las bases activas son usadas por el backend para calcular la base más cercana a un incidente.
      </div>
    </section>
  );
};

export default ManageBases;
