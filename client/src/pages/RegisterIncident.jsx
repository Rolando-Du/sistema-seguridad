import { ArrowLeft, MapPin, Save, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createIncident } from "../services/incidentService";

const initialForm = {
  crimeType: "Robo",
  description: "",
  incidentDate: new Date().toISOString().split("T")[0],
  province: "Neuquén",
  department: "",
  city: "San Martín de los Andes",
  neighborhood: "",
  address: "",
  latitude: "",
  longitude: "",
  involvedGender: "No especifica",
  ageRange: "Desconocido",
  status: "PENDIENTE",
};

const statusOptions = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_INVESTIGACION", label: "En investigación" },
  { value: "RESUELTO", label: "Resuelto" },
  { value: "ARCHIVADO", label: "Archivado" },
];

const crimeTypeOptions = [
  "Robo",
  "Siniestro Vial",
  "Narcotráfico",
  "Ciberdelito",
  "Violencia",
  "Daños",
  "Otro",
];

const RegisterIncident = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage({ text: "", type: "" });
  };

  const validateForm = () => {
    if (formData.crimeType.trim().length < 2) {
      return "El tipo de delito es obligatorio.";
    }

    if (formData.description.trim().length < 5) {
      return "La descripción debe tener al menos 5 caracteres.";
    }

    if (!formData.incidentDate) {
      return "La fecha del hecho es obligatoria.";
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

  const handleSubmit = async (event) => {
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

    try {
      await createIncident({
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });

      setMessage({
        text: "Incidente registrado correctamente.",
        type: "success",
      });

      setFormData(initialForm);

      setTimeout(() => {
        navigate("/incidentes");
      }, 700);
    } catch (error) {
      setMessage({
        text: error.message || "No se pudo registrar el incidente.",
        type: "error",
      });
    } finally {
      setSaving(false);
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
            <ShieldAlert className="h-7 w-7 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Registrar Incidente
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Alta operativa con registro de auditoría automático
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/incidentes")}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all hover:bg-slate-700 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
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
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
          <MapPin className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">
            Datos del hecho
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Tipo de delito
            </label>

            <select
              name="crimeType"
              value={formData.crimeType}
              onChange={handleChange}
              required
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
            >
              {crimeTypeOptions.map((crimeType) => (
                <option key={crimeType} value={crimeType}>
                  {crimeType}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Fecha del hecho
            </label>

            <input
              type="date"
              name="incidentDate"
              value={formData.incidentDate}
              onChange={handleChange}
              required
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Provincia
            </label>

            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
              placeholder="Neuquén"
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Departamento
            </label>

            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Lácar"
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Localidad
            </label>

            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="San Martín de los Andes"
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Barrio / zona
            </label>

            <input
              type="text"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              required
              placeholder="Centro"
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Dirección
            </label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Av. San Martín 850"
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Latitud
            </label>

            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              required
              placeholder="-40.155"
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Longitud
            </label>

            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              required
              placeholder="-71.35"
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Género involucrado
            </label>

            <input
              type="text"
              name="involvedGender"
              value={formData.involvedGender}
              onChange={handleChange}
              placeholder="No especifica"
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Rango etario
            </label>

            <input
              type="text"
              name="ageRange"
              value={formData.ageRange}
              onChange={handleChange}
              placeholder="Desconocido"
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Estado inicial
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Descripción
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Describí el hecho registrado..."
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-end gap-3 border-t border-slate-800 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={() => setFormData(initialForm)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all hover:bg-slate-700 active:scale-95"
          >
            Limpiar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Registrando..." : "Registrar incidente"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default RegisterIncident;
