const baseRepository = require("../repositories/base.repository");

const baseTypeMap = {
  COMISARIA: "COMISARIA",
  COMISARÍA: "COMISARIA",
  DESTACAMENTO: "DESTACAMENTO",
  BASE_OPERATIVA: "BASE_OPERATIVA",
  "BASE OPERATIVA": "BASE_OPERATIVA",
  PUESTO_POLICIAL: "PUESTO_POLICIAL",
  "PUESTO POLICIAL": "PUESTO_POLICIAL",
  OTRO: "OTRO",
};

const normalizeText = (value) => String(value || "").trim();

const normalizeOptionalText = (value) => {
  const cleanValue = normalizeText(value);
  return cleanValue || null;
};

const normalizeBaseType = (baseType = "BASE_OPERATIVA") => {
  const cleanBaseType = normalizeText(baseType).toUpperCase();

  if (!baseTypeMap[cleanBaseType]) {
    const error = new Error(
      "Tipo de base inválido. Valores permitidos: COMISARIA, DESTACAMENTO, BASE_OPERATIVA, PUESTO_POLICIAL, OTRO."
    );
    error.statusCode = 400;
    throw error;
  }

  return baseTypeMap[cleanBaseType];
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

const validateBasePayload = (payload, { partial = false } = {}) => {
  const data = {};

  if (!partial || payload.name !== undefined || payload.nombre !== undefined) {
    const name = normalizeText(payload.name || payload.nombre);

    if (name.length < 2 || name.length > 120) {
      const error = new Error("El nombre debe tener entre 2 y 120 caracteres.");
      error.statusCode = 400;
      throw error;
    }

    data.name = name;
  }

  if (!partial || payload.address !== undefined || payload.direccion !== undefined) {
    const address = normalizeText(payload.address || payload.direccion);

    if (address.length < 2 || address.length > 180) {
      const error = new Error("La dirección debe tener entre 2 y 180 caracteres.");
      error.statusCode = 400;
      throw error;
    }

    data.address = address;
  }

  if (!partial || payload.province !== undefined || payload.provincia !== undefined) {
    const province = normalizeText(payload.province || payload.provincia);

    if (province.length < 2 || province.length > 80) {
      const error = new Error("La provincia debe tener entre 2 y 80 caracteres.");
      error.statusCode = 400;
      throw error;
    }

    data.province = province;
  }

  if (payload.department !== undefined || payload.departamento !== undefined) {
    data.department = normalizeOptionalText(payload.department || payload.departamento);
  }

  if (!partial || payload.city !== undefined || payload.localidad !== undefined) {
    const city = normalizeText(payload.city || payload.localidad);

    if (city.length < 2 || city.length > 100) {
      const error = new Error("La localidad debe tener entre 2 y 100 caracteres.");
      error.statusCode = 400;
      throw error;
    }

    data.city = city;
  }

  if (!partial || payload.neighborhood !== undefined || payload.barrio !== undefined) {
    const neighborhood = normalizeText(payload.neighborhood || payload.barrio);

    if (neighborhood.length < 2 || neighborhood.length > 100) {
      const error = new Error("El barrio/zona debe tener entre 2 y 100 caracteres.");
      error.statusCode = 400;
      throw error;
    }

    data.neighborhood = neighborhood;
  }

  if (payload.baseType !== undefined || payload.tipo_base !== undefined || payload.tipoBase !== undefined) {
    data.baseType = normalizeBaseType(
      payload.baseType || payload.tipo_base || payload.tipoBase
    );
  }

  if (!partial || payload.latitude !== undefined || payload.latitud !== undefined) {
    data.latitude = parseCoordinate(payload.latitude ?? payload.latitud, "La latitud");
  }

  if (!partial || payload.longitude !== undefined || payload.longitud !== undefined) {
    data.longitude = parseCoordinate(payload.longitude ?? payload.longitud, "La longitud");
  }

  if (payload.active !== undefined || payload.activa !== undefined) {
    data.active = Boolean(payload.active ?? payload.activa);
  }

  return data;
};

const normalizeFilters = (query = {}) => {
  return {
    includeInactive:
      query.includeInactive === "true" ||
      query.incluirInactivas === "true" ||
      query.includeInactive === true,
    province: normalizeText(query.province || query.provincia),
    department: normalizeText(query.department || query.departamento),
    city: normalizeText(query.city || query.localidad),
    neighborhood: normalizeText(query.neighborhood || query.barrio),
    baseType:
      query.baseType || query.tipo_base || query.tipoBase
        ? normalizeBaseType(query.baseType || query.tipo_base || query.tipoBase)
        : "TODOS",
  };
};

const listBases = async (query = {}) => {
  const filters = normalizeFilters(query);
  const data = await baseRepository.findAllBases(filters);

  return {
    filters,
    total: data.length,
    data,
  };
};

const getBaseById = async (id) => {
  const base = await baseRepository.findBaseById(id);

  if (!base) {
    const error = new Error("Base operativa no encontrada.");
    error.statusCode = 404;
    throw error;
  }

  return base;
};

const createOperationalBase = async (payload) => {
  const data = validateBasePayload(payload);

  return baseRepository.createBase({
    ...data,
    baseType: data.baseType || "BASE_OPERATIVA",
    active: data.active ?? true,
  });
};

const updateOperationalBase = async (id, payload) => {
  const previousBase = await getBaseById(id);
  const data = validateBasePayload(payload, { partial: true });

  const updatedBase = await baseRepository.updateBase(id, data);

  return {
    previousBase,
    updatedBase,
  };
};

const changeBaseStatus = async (id, active) => {
  if (typeof active !== "boolean") {
    const error = new Error("El estado active debe ser true o false.");
    error.statusCode = 400;
    throw error;
  }

  const previousBase = await getBaseById(id);

  const updatedBase = await baseRepository.updateBase(id, {
    active,
  });

  return {
    previousBase,
    updatedBase,
  };
};

const deactivateOperationalBase = async (id) => {
  const previousBase = await getBaseById(id);

  const updatedBase = await baseRepository.updateBase(id, {
    active: false,
  });

  return {
    previousBase,
    updatedBase,
  };
};

module.exports = {
  listBases,
  getBaseById,
  createOperationalBase,
  updateOperationalBase,
  changeBaseStatus,
  deactivateOperationalBase,
};
