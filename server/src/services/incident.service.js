const incidentRepository = require("../repositories/incident.repository");

const statusMap = {
  PENDIENTE: "PENDIENTE",
  "EN INVESTIGACION": "EN_INVESTIGACION",
  "EN INVESTIGACIÓN": "EN_INVESTIGACION",
  EN_INVESTIGACION: "EN_INVESTIGACION",
  RESUELTO: "RESUELTO",
  ARCHIVADO: "ARCHIVADO",
};

const normalizeText = (value) => String(value || "").trim();

const normalizeOptionalText = (value) => {
  const cleanValue = normalizeText(value);
  return cleanValue || null;
};

const normalizeStatus = (status = "PENDIENTE") => {
  const cleanStatus = normalizeText(status).toUpperCase();

  if (!cleanStatus || cleanStatus === "TODOS") {
    return "TODOS";
  }

  if (!statusMap[cleanStatus]) {
    const error = new Error(
      "Estado inválido. Valores permitidos: TODOS, PENDIENTE, EN_INVESTIGACION, RESUELTO, ARCHIVADO."
    );
    error.statusCode = 400;
    throw error;
  }

  return statusMap[cleanStatus];
};

const parseCoordinate = (value, fieldName) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    const error = new Error(`${fieldName} debe ser un número válido.`);
    error.statusCode = 400;
    throw error;
  }

  return numberValue;
};

const validateIncidentPayload = (payload, { partial = false } = {}) => {
  const data = {};

  if (!partial || payload.crimeType !== undefined) {
    const crimeType = normalizeText(payload.crimeType);

    if (crimeType.length < 2 || crimeType.length > 80) {
      const error = new Error("El tipo de delito debe tener entre 2 y 80 caracteres.");
      error.statusCode = 400;
      throw error;
    }

    data.crimeType = crimeType;
  }

  if (!partial || payload.description !== undefined) {
    const description = normalizeText(payload.description);

    if (description.length < 5 || description.length > 1000) {
      const error = new Error("La descripción debe tener entre 5 y 1000 caracteres.");
      error.statusCode = 400;
      throw error;
    }

    data.description = description;
  }

  if (!partial || payload.incidentDate !== undefined) {
    if (!payload.incidentDate) {
      const error = new Error("La fecha del hecho es obligatoria.");
      error.statusCode = 400;
      throw error;
    }

    const incidentDate = new Date(payload.incidentDate);

    if (Number.isNaN(incidentDate.getTime())) {
      const error = new Error("La fecha del hecho no es válida.");
      error.statusCode = 400;
      throw error;
    }

    data.incidentDate = incidentDate;
  }

  if (!partial || payload.province !== undefined) {
    const province = normalizeText(payload.province);

    if (province.length < 2 || province.length > 80) {
      const error = new Error("La provincia debe tener entre 2 y 80 caracteres.");
      error.statusCode = 400;
      throw error;
    }

    data.province = province;
  }

  if (payload.department !== undefined) {
    data.department = normalizeOptionalText(payload.department);
  }

  if (!partial || payload.city !== undefined) {
    const city = normalizeText(payload.city);

    if (city.length < 2 || city.length > 100) {
      const error = new Error("La localidad debe tener entre 2 y 100 caracteres.");
      error.statusCode = 400;
      throw error;
    }

    data.city = city;
  }

  if (!partial || payload.neighborhood !== undefined) {
    const neighborhood = normalizeText(payload.neighborhood);

    if (neighborhood.length < 2 || neighborhood.length > 100) {
      const error = new Error("El barrio debe tener entre 2 y 100 caracteres.");
      error.statusCode = 400;
      throw error;
    }

    data.neighborhood = neighborhood;
  }

  if (payload.address !== undefined) {
    data.address = normalizeOptionalText(payload.address);
  }

  if (!partial || payload.latitude !== undefined) {
    data.latitude = parseCoordinate(payload.latitude, "La latitud");
  }

  if (!partial || payload.longitude !== undefined) {
    data.longitude = parseCoordinate(payload.longitude, "La longitud");
  }

  if (payload.involvedGender !== undefined) {
    data.involvedGender = normalizeOptionalText(payload.involvedGender);
  }

  if (payload.ageRange !== undefined) {
    data.ageRange = normalizeOptionalText(payload.ageRange);
  }

  if (payload.status !== undefined) {
    data.status = normalizeStatus(payload.status);
  }

  return data;
};

const normalizeFilters = (query = {}) => {
  return {
    crimeType: normalizeText(query.crimeType || query.tipo),
    status: query.status ? normalizeStatus(query.status) : "TODOS",
    province: normalizeText(query.province || query.provincia),
    department: normalizeText(query.department || query.departamento),
    city: normalizeText(query.city || query.localidad),
    neighborhood: normalizeText(query.neighborhood || query.barrio),
    address: normalizeText(query.address || query.direccion),
    startDate: normalizeText(query.startDate || query.inicio),
    endDate: normalizeText(query.endDate || query.fin),
    limit: query.limit || 100,
  };
};

const listIncidents = async (query = {}) => {
  const filters = normalizeFilters(query);

  const [data, total] = await Promise.all([
    incidentRepository.findAllIncidents(filters),
    incidentRepository.countIncidents(filters),
  ]);

  return {
    filters,
    total,
    data,
  };
};

const getIncidentById = async (id) => {
  const incident = await incidentRepository.findIncidentById(id);

  if (!incident) {
    const error = new Error("Incidente no encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return incident;
};

const createSystemIncident = async (payload, currentUser) => {
  const data = validateIncidentPayload(payload);

  return incidentRepository.createIncident({
    ...data,
    status: data.status || "PENDIENTE",
    createdById: currentUser?.id || null,
  });
};

const updateSystemIncident = async (id, payload) => {
  const previousIncident = await getIncidentById(id);
  const data = validateIncidentPayload(payload, { partial: true });

  const updatedIncident = await incidentRepository.updateIncident(id, data);

  return {
    previousIncident,
    updatedIncident,
  };
};

const changeIncidentStatus = async (id, status) => {
  const previousIncident = await getIncidentById(id);

  const updatedIncident = await incidentRepository.updateIncident(id, {
    status: normalizeStatus(status),
  });

  return {
    previousIncident,
    updatedIncident,
  };
};

const removeSystemIncident = async (id) => {
  const previousIncident = await getIncidentById(id);
  const deletedIncident = await incidentRepository.deleteIncident(id);

  return {
    previousIncident,
    deletedIncident,
  };
};

module.exports = {
  listIncidents,
  getIncidentById,
  createSystemIncident,
  updateSystemIncident,
  changeIncidentStatus,
  removeSystemIncident,
};
