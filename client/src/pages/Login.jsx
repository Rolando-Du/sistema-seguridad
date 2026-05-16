import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    email: "admin@seguridad.com",
    password: "Admin123",
  });

  const from = location.state?.from?.pathname || "/";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      setMessage(error.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/40">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Acceso Operativo
            </h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
              Sistema Seguridad Nacional
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-400">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="h-12 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-blue-500"
              placeholder="admin@seguridad.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              Contraseña
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="h-12 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 pr-12 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-blue-500"
                placeholder="********"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`h-12 w-full rounded-lg border px-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all ${
              loading
                ? "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-500"
                : "border-blue-500 bg-blue-600 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-900/40 active:scale-95"
            }`}
          >
            {loading ? "Verificando..." : "Ingresar al sistema"}
          </button>
        </form>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-[9px] font-bold uppercase leading-relaxed tracking-widest text-slate-600">
            Acceso restringido. Toda operación puede quedar registrada para
            auditoría interna.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
