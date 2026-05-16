const RegisterIncident = () => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-2xl font-black uppercase italic text-white">
        Registrar Incidente
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Próximo paso: crear formulario conectado a POST /api/incidents.
      </p>
    </section>
  );
};

export default RegisterIncident;
