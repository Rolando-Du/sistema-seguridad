import {
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createUser,
  getUsers,
  updateUser,
  updateUserStatus,
} from "../services/userService";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "LECTOR",
  active: true,
};

const roleOptions = [
  { value: "ADMIN", label: "Administrador" },
  { value: "OPERADOR", label: "Operador" },
  { value: "LECTOR", label: "Lector" },
];

const roleLabel = {
  ADMIN: "Administrador",
  OPERADOR: "Operador",
  LECTOR: "Lector",
};

const roleClass = {
  ADMIN: "border-red-500/40 bg-red-500/10 text-red-300",
  OPERADOR: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  LECTOR: "border-green-500/40 bg-green-500/10 text-green-300",
};

const formatDateTime = (date) => {
  if (!date) return "Sin acceso";

  return new Date(date).toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildFormFromUser = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  password: "",
  role: user?.role || "LECTOR",
  active: user?.active ?? true,
});

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await getUsers();

      if (response.success) {
        setUsers(response.data || []);
      } else {
        setUsers([]);
        setMessage({
          text: "No se pudieron cargar los usuarios.",
          type: "error",
        });
      }
    } catch (error) {
      setUsers([]);
      setMessage({
        text: error.message || "Error al cargar usuarios.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) return users;

    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(cleanQuery) ||
        user.email?.toLowerCase().includes(cleanQuery) ||
        user.role?.toLowerCase().includes(cleanQuery)
      );
    });
  }, [users, query]);

  const summary = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((user) => user.active).length,
      inactive: users.filter((user) => !user.active).length,
      admins: users.filter((user) => user.role === "ADMIN").length,
      operators: users.filter((user) => user.role === "OPERADOR").length,
      readers: users.filter((user) => user.role === "LECTOR").length,
    };
  }, [users]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(initialForm);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData(buildFormFromUser(user));
    setShowPassword(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData(initialForm);
    setShowPassword(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "active" ? value === "true" : value,
    }));

    setMessage({ text: "", type: "" });
  };

  const validateForm = () => {
    if (formData.name.trim().length < 3) {
      return "El nombre debe tener al menos 3 caracteres.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return "El email ingresado no es válido.";
    }

    if (!editingUser && formData.password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    if (editingUser && formData.password && formData.password.length < 6) {
      return "La nueva contraseña debe tener al menos 6 caracteres.";
    }

    if (!["ADMIN", "OPERADOR", "LECTOR"].includes(formData.role)) {
      return "El rol seleccionado no es válido.";
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

    try {
      if (editingUser) {
        const payload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          active: formData.active,
        };

        if (formData.password.trim()) {
          payload.password = formData.password;
        }

        await updateUser(editingUser.id, payload);

        setMessage({
          text: "Usuario actualizado correctamente.",
          type: "success",
        });
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          active: formData.active,
        });

        setMessage({
          text: "Usuario creado correctamente.",
          type: "success",
        });
      }

      closeModal();
      await loadUsers();
    } catch (error) {
      setMessage({
        text: error.message || "No se pudo guardar el usuario.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = !user.active;

    const confirmed = window.confirm(
      nextStatus
        ? `¿Querés activar al usuario "${user.name}"?`
        : `¿Querés desactivar al usuario "${user.name}"?`,
    );

    if (!confirmed) return;

    setMessage({ text: "", type: "" });

    try {
      await updateUserStatus(user.id, nextStatus);

      setMessage({
        text: nextStatus
          ? "Usuario activado correctamente."
          : "Usuario desactivado correctamente.",
        type: "success",
      });

      await loadUsers();
    } catch (error) {
      setMessage({
        text: error.message || "No se pudo cambiar el estado del usuario.",
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
            <Users className="h-7 w-7 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Gestión de Usuarios
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Administración de accesos, roles y estados
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadUsers}
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
            Nuevo usuario
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Total
          </p>
          <p className="mt-3 text-4xl font-black text-white">
            {summary.total}
          </p>
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-400">
            Activos
          </p>
          <p className="mt-3 text-4xl font-black text-green-300">
            {summary.active}
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
            Inactivos
          </p>
          <p className="mt-3 text-4xl font-black text-red-300">
            {summary.inactive}
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-300">
            Admin
          </p>
          <p className="mt-3 text-4xl font-black text-red-300">
            {summary.admins}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
            Operadores
          </p>
          <p className="mt-3 text-4xl font-black text-blue-300">
            {summary.operators}
          </p>
        </div>

        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-300">
            Lectores
          </p>
          <p className="mt-3 text-4xl font-black text-green-300">
            {summary.readers}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">
              Usuarios registrados
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Filtro visual por nombre, email o rol.
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar usuario..."
              className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-950 text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Último acceso</th>
                <th className="px-4 py-3">Creación</th>
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
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-slate-800 text-slate-300 hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-black uppercase text-white">
                        {user.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {user.email}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          roleClass[user.role] ||
                          "border-slate-500/40 bg-slate-500/10 text-slate-300"
                        }`}
                      >
                        {roleLabel[user.role] || user.role}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                          user.active
                            ? "border-green-500/40 bg-green-500/10 text-green-400"
                            : "border-red-500/40 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {user.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-400">
                      {formatDateTime(user.lastAccessAt)}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-400">
                      {formatDateTime(user.createdAt)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300 hover:border-yellow-500 hover:text-yellow-300"
                          title="Editar usuario"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`rounded-lg border p-2 ${
                            user.active
                              ? "border-red-500/40 bg-red-950/30 text-red-300 hover:bg-red-600 hover:text-white"
                              : "border-green-500/40 bg-green-950/30 text-green-300 hover:bg-green-600 hover:text-white"
                          }`}
                          title={user.active ? "Desactivar" : "Activar"}
                        >
                          <Power className="h-4 w-4" />
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
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-xl font-black uppercase italic text-white">
                  {editingUser ? "Editar usuario" : "Nuevo usuario"}
                </h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Acción administrativa auditada
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Nombre
                  </label>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Nombre completo"
                    className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="usuario@seguridad.com"
                    className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {editingUser
                      ? "Nueva contraseña opcional"
                      : "Contraseña"}
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!editingUser}
                      placeholder={
                        editingUser
                          ? "Dejar vacío para no cambiar"
                          : "Mínimo 6 caracteres"
                      }
                      className="h-12 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 pr-12 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
                      aria-label={
                        showPassword ? "Ocultar contraseña" : "Ver contraseña"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Rol
                  </label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Estado
                  </label>

                  <select
                    name="active"
                    value={String(formData.active)}
                    onChange={handleChange}
                    className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs font-bold uppercase tracking-widest text-blue-300">
                <ShieldCheck className="h-4 w-4" />
                Los permisos reales se validan siempre en el backend.
              </div>

              <div className="flex flex-col justify-end gap-3 border-t border-slate-800 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg border border-blue-500 bg-blue-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ManageUsers;
