const reportRepository = require("../repositories/report.repository");
const { generateIncidentsCsv } = require("./csv.service");

const statusMap = {
  PENDIENTE: "PENDIENTE",
  "EN INVESTIGACION": "EN_INVESTIGACION",
  "EN INVESTIGACIÓN": "EN_INVESTIGACION",
  EN_INVESTIGACION: "EN_INVESTIGACION",
  RESUELTO: "RESUELTO",
  ARCHIVADO: "ARCHIVADO",
};

const normalizeText = (value) => String(value || "").trim();

const normalizeStatus = (status) => {
  if (!status || status === "TODOS") return "TODOS";

  const cleanStatus = normalizeText(status).toUpperCase();

  if (!statusMap[cleanStatus]) {
    const error = new Error(
      "Estado inválido. Valores permitidos: PENDIENTE, EN_INVESTIGACION, RESUELTO, ARCHIVADO."
    );
    error.statusCode = 400;
    throw error;
  }

  return statusMap[cleanStatus];
};

const normalizeFilters = (query = {}) => {
  return {
    crimeType: normalizeText(query.crimeType || query.tipo),
    status: normalizeStatus(query.status || query.estado || "TODOS"),
    province: normalizeText(query.province || query.provincia),
    department: normalizeText(query.department || query.departamento),
    city: normalizeText(query.city || query.localidad),
    neighborhood: normalizeText(query.neighborhood || query.barrio),
    address: normalizeText(query.address || query.direccion),
    startDate: normalizeText(query.startDate || query.inicio),
    endDate: normalizeText(query.endDate || query.fin),
    limit: query.limit || 500,
  };
};

const countBy = (items, getKey, emptyValue = "Sin dato") => {
  const accumulated = {};

  items.forEach((item) => {
    const key = getKey(item) || emptyValue;
    accumulated[key] = (accumulated[key] || 0) + 1;
  });

  return Object.entries(accumulated)
    .map(([name, total]) => ({
      name,
      total,
    }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
};

const countNeighborhoods = (items) => {
  const accumulated = {};

  items.forEach((item) => {
    const neighborhood = item.neighborhood || "Sin barrio";
    const city = item.city || "Sin localidad";
    const key = `${neighborhood}__${city}`;

    if (!accumulated[key]) {
      accumulated[key] = {
        neighborhood,
        city,
        total: 0,
      };
    }

    accumulated[key].total += 1;
  });

  return Object.values(accumulated).sort(
    (a, b) => b.total - a.total || a.neighborhood.localeCompare(b.neighborhood)
  );
};

const countByDate = (items) => {
  const accumulated = {};

  items.forEach((item) => {
    const date = item.incidentDate
      ? new Date(item.incidentDate).toISOString().split("T")[0]
      : "Sin fecha";

    accumulated[date] = (accumulated[date] || 0) + 1;
  });

  return Object.entries(accumulated)
    .map(([date, total]) => ({
      date,
      total,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const buildReportSummary = (incidents = []) => {
  const byStatus = countBy(incidents, (item) => item.status, "Sin estado");
  const byCrimeType = countBy(incidents, (item) => item.crimeType, "Sin tipo");
  const byCity = countBy(incidents, (item) => item.city, "Sin localidad");
  const byNeighborhood = countNeighborhoods(incidents);
  const byDate = countByDate(incidents);

  return {
    total: incidents.length,
    byStatus,
    byCrimeType,
    byCity,
    byNeighborhood,
    byDate,
    criticalStatus: byStatus[0] || null,
    criticalCrimeType: byCrimeType[0] || null,
    criticalCity: byCity[0] || null,
    criticalNeighborhood: byNeighborhood[0] || null,
  };
};

const getOperationalReport = async (query = {}) => {
  const filters = normalizeFilters(query);

  const [incidents, total] = await Promise.all([
    reportRepository.findReportIncidents(filters),
    reportRepository.countReportIncidents(filters),
  ]);

  const summary = buildReportSummary(incidents);

  return {
    filters,
    total,
    summary,
    data: incidents,
  };
};

const exportOperationalReportCsv = async (query = {}) => {
  const report = await getOperationalReport({
    ...query,
    limit: query.limit || 2000,
  });

  const csv = generateIncidentsCsv(report.data);
  const date = new Date().toISOString().split("T")[0];

  return {
    filename: `reporte_operativo_${date}.csv`,
    csv,
    total: report.total,
    filters: report.filters,
  };
};

module.exports = {
  getOperationalReport,
  exportOperationalReportCsv,
};
