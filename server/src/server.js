const app = require("./app");
const env = require("./config/env");

const server = app.listen(env.port, () => {
  console.log("====================================");
  console.log("🚀 Servidor iniciado correctamente");
  console.log(`🌐 URL: http://localhost:${env.port}`);
  console.log(`🩺 Health: http://localhost:${env.port}/api/health`);
  console.log(`🧩 Entorno: ${env.nodeEnv}`);
  console.log("====================================");
});

const closeServer = () => {
  console.log("\n🛑 Cerrando servidor...");

  server.close(() => {
    console.log("✅ Servidor cerrado correctamente.");
    process.exit(0);
  });
};

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
