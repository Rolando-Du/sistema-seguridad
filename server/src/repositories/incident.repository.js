const prisma = require("../config/prisma");

const incidentSelect = {
  id: true,
  crimeType: true,
  description: true,
  incidentDate: true,
  province: true,
  department: true,
  city: true,
  neighborhood: true,
  address: true,
  latitude: true,
  longitude: true,
  involvedGender: true,
  ageRange: true,
  status: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
};

const buildIncidentWhere = (filters = {}) => {
  const where = {};

  if (filters.crimeType && filters.crimeType !== "TODOS") {
    where.crimeType = {
      contains: filters.crimeType,
      mode: "insensitive",
    };
  }

  if (filters.status && filters.status !== "TODOS") {
    where.status = filters.status;
  }

  if (filters.province) {
    where.province = {
      contains: filters.province,
      mode: "insensitive",
    };
  }

  if (filters.department) {
    where.department = {
      contains: filters.department,
      mode: "insensitive",
    };
  }

  if (filters.city) {
    where.city = {
      contains: filters.city,
      mode: "insensitive",
    };
  }

  if (filters.neighborhood) {
    where.neighborhood = {
      contains: filters.neighborhood,
      mode: "insensitive",
    };
  }

  if (filters.address) {
    where.address = {
      contains: filters.address,
      mode: "insensitive",
    };
  }

  if (filters.startDate || filters.endDate) {
    where.incidentDate = {};

    if (filters.startDate) {
      where.incidentDate.gte = new Date(`${filters.startDate}T00:00:00.000Z`);
    }

    if (filters.endDate) {
      where.incidentDate.lte = new Date(`${filters.endDate}T23:59:59.999Z`);
    }
  }

  return where;
};

const findAllIncidents = async (filters = {}) => {
  const limit = Number(filters.limit || 100);

  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 500)
    : 100;

  return prisma.incident.findMany({
    where: buildIncidentWhere(filters),
    select: incidentSelect,
    orderBy: {
      createdAt: "desc",
    },
    take: safeLimit,
  });
};

const countIncidents = async (filters = {}) => {
  return prisma.incident.count({
    where: buildIncidentWhere(filters),
  });
};

const findIncidentById = async (id) => {
  return prisma.incident.findUnique({
    where: { id },
    select: incidentSelect,
  });
};

const createIncident = async (data) => {
  return prisma.incident.create({
    data,
    select: incidentSelect,
  });
};

const updateIncident = async (id, data) => {
  return prisma.incident.update({
    where: { id },
    data,
    select: incidentSelect,
  });
};

const deleteIncident = async (id) => {
  return prisma.incident.delete({
    where: { id },
    select: incidentSelect,
  });
};

module.exports = {
  findAllIncidents,
  countIncidents,
  findIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
};
