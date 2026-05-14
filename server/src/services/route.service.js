const prisma = require("../config/prisma");

const RESPONSE_SPEEDS_KMH = {
  EMERGENCIA: 60,
  PATRULLERO_NORMAL: 40,
  A_PIE: 5,
};

const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

const calculateDistanceKm = (origin, destination) => {
  const earthRadiusKm = 6371;

  const lat1 = toRadians(origin.latitude);
  const lon1 = toRadians(origin.longitude);
  const lat2 = toRadians(destination.latitude);
  const lon2 = toRadians(destination.longitude);

  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((earthRadiusKm * c).toFixed(2));
};

const calculateEstimatedMinutes = (distanceKm, speedKmh) => {
  if (!distanceKm || !speedKmh) return 0;

  const hours = distanceKm / speedKmh;
  return Number((hours * 60).toFixed(1));
};

const buildResponseTimes = (distanceKm) => {
  return {
    emergency: {
      mode: "Emergencia",
      speedKmh: RESPONSE_SPEEDS_KMH.EMERGENCIA,
      estimatedMinutes: calculateEstimatedMinutes(
        distanceKm,
        RESPONSE_SPEEDS_KMH.EMERGENCIA
      ),
    },
    patrol: {
      mode: "Patrullero normal",
      speedKmh: RESPONSE_SPEEDS_KMH.PATRULLERO_NORMAL,
      estimatedMinutes: calculateEstimatedMinutes(
        distanceKm,
        RESPONSE_SPEEDS_KMH.PATRULLERO_NORMAL
      ),
    },
    walking: {
      mode: "A pie",
      speedKmh: RESPONSE_SPEEDS_KMH.A_PIE,
      estimatedMinutes: calculateEstimatedMinutes(
        distanceKm,
        RESPONSE_SPEEDS_KMH.A_PIE
      ),
    },
  };
};

const getIncidentOrFail = async (incidentId) => {
  const incident = await prisma.incident.findUnique({
    where: {
      id: incidentId,
    },
  });

  if (!incident) {
    const error = new Error("Incidente no encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return incident;
};

const getActiveBases = async () => {
  return prisma.operationalBase.findMany({
    where: {
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getNearestBaseForIncident = async (incidentId) => {
  const incident = await getIncidentOrFail(incidentId);
  const activeBases = await getActiveBases();

  if (activeBases.length === 0) {
    const error = new Error("No hay bases operativas activas disponibles.");
    error.statusCode = 404;
    throw error;
  }

  const incidentPoint = {
    latitude: incident.latitude,
    longitude: incident.longitude,
  };

  const basesWithDistance = activeBases
    .map((base) => {
      const basePoint = {
        latitude: base.latitude,
        longitude: base.longitude,
      };

      const distanceKm = calculateDistanceKm(basePoint, incidentPoint);

      return {
        base,
        distanceKm,
        responseTimes: buildResponseTimes(distanceKm),
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const nearest = basesWithDistance[0];
  const alternatives = basesWithDistance.slice(1, 4);

  return {
    incident: {
      id: incident.id,
      crimeType: incident.crimeType,
      description: incident.description,
      incidentDate: incident.incidentDate,
      province: incident.province,
      department: incident.department,
      city: incident.city,
      neighborhood: incident.neighborhood,
      address: incident.address,
      latitude: incident.latitude,
      longitude: incident.longitude,
      status: incident.status,
    },
    nearestBase: {
      ...nearest.base,
      distanceKm: nearest.distanceKm,
      responseTimes: nearest.responseTimes,
    },
    alternatives: alternatives.map((item) => ({
      ...item.base,
      distanceKm: item.distanceKm,
      responseTimes: item.responseTimes,
    })),
    totalActiveBasesAnalyzed: activeBases.length,
  };
};

module.exports = {
  getNearestBaseForIncident,
  calculateDistanceKm,
  buildResponseTimes,
};
