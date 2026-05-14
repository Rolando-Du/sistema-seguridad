const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const corsOptions = require("./config/cors");
const apiRoutes = require("./routes");

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    status: "online",
    message: "Servidor Sistema de Seguridad Nacional activo.",
    version: "1.0.0",
    endpoints: {
      api: "/api",
      health: "/api/health",
    },
  });
});

app.use("/api", apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error("❌ Error global:", error.message);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Error interno del servidor.",
  });
});

module.exports = app;
