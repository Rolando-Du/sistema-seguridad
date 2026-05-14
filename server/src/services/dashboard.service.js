const dashboardRepository = require("../repositories/dashboard.repository");

const getMonthRange = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));

  return {
    start,
    end,
  };
};

const getPreviousMonthRange = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));

  return {
    start,
    end,
  };
};

const calculateVariation = (current, previous) => {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0 && current > 0) return 100;

  return Number((((current - previous) / previous) * 100).toFixed(2));
};

const getTrend = (variation) => {
  if (variation > 0) return "ASCENDENTE";
  if (variation < 0) return "DESCENDENTE";
  return "ESTABLE";
};

const normalizeGroupResult = (items, keyName, outputName = "name") => {
  return items
    .map((item) => ({
      [outputName]: item[keyName] || "Sin dato",
      total: item._count._all,
    }))
    .sort((a, b) => b.total - a.total || String(a[outputName]).localeCompare(String(b[outputName])));
};

const normalizeNeighborhoodRanking = (items) => {
  return items
    .map((item) => ({
      neighborhood: item.neighborhood || "Sin barrio",
      city: item.city || "Sin localidad",
      total: item._count._all,
    }))
    .sort((a, b) => b.total - a.total || a.neighborhood.localeCompare(b.neighborhood));
};

const getDashboardSummary = async () => {
  const currentMonth = getMonthRange();
  const previousMonth = getPreviousMonthRange();

  const [
    totalIncidents,
    currentMonthIncidents,
    previousMonthIncidents,
    activeBases,
    statusGroups,
    crimeTypeGroups,
    cityGroups,
    neighborhoodGroups,
    usersByRole,
    latestIncidents,
  ] = await Promise.all([
    dashboardRepository.countIncidents(),
    dashboardRepository.countIncidents({
      incidentDate: {
        gte: currentMonth.start,
        lt: currentMonth.end,
      },
    }),
    dashboardRepository.countIncidents({
      incidentDate: {
        gte: previousMonth.start,
        lt: previousMonth.end,
      },
    }),
    dashboardRepository.countActiveBases(),
    dashboardRepository.groupByStatus(),
    dashboardRepository.groupByCrimeType(),
    dashboardRepository.groupByCity(),
    dashboardRepository.groupByNeighborhood(),
    dashboardRepository.countUsersByRole(),
    dashboardRepository.getLatestIncidents(6),
  ]);

  const variation = calculateVariation(
    currentMonthIncidents,
    previousMonthIncidents
  );

  const incidentsByStatus = normalizeGroupResult(statusGroups, "status");
  const incidentsByCrimeType = normalizeGroupResult(crimeTypeGroups, "crimeType");
  const incidentsByCity = normalizeGroupResult(cityGroups, "city", "city");
  const incidentsByNeighborhood = normalizeNeighborhoodRanking(neighborhoodGroups);

  return {
    totals: {
      incidents: totalIncidents,
      currentMonthIncidents,
      previousMonthIncidents,
      activeBases,
    },
    monthlyAnalysis: {
      currentMonth: {
        start: currentMonth.start,
        end: currentMonth.end,
        total: currentMonthIncidents,
      },
      previousMonth: {
        start: previousMonth.start,
        end: previousMonth.end,
        total: previousMonthIncidents,
      },
      variationPercentage: variation,
      trend: getTrend(variation),
    },
    rankings: {
      byStatus: incidentsByStatus,
      byCrimeType: incidentsByCrimeType,
      byCity: incidentsByCity,
      byNeighborhood: incidentsByNeighborhood,
      criticalCity: incidentsByCity[0] || null,
      criticalNeighborhood: incidentsByNeighborhood[0] || null,
      criticalCrimeType: incidentsByCrimeType[0] || null,
    },
    usersByRole: normalizeGroupResult(usersByRole, "role", "role"),
    latestIncidents,
  };
};

module.exports = {
  getDashboardSummary,
};
