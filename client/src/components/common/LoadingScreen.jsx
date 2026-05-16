const LoadingScreen = ({ message = "Cargando módulo..." }) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

        <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">
          {message}
        </p>
      </div>
    </main>
  );
};

export default LoadingScreen;
