const prisma = require("../config/prisma");

const buildReportWhere = (filters = {}) => {
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

const findReportIncidents = async (filters = {}) => {
  const limit = Number(filters.limit || 500);

  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 2000)
    : 500;

  return prisma.incident.findMany({
    where: buildReportWhere(filters),
    take: safeLimit,
    orderBy: {
      incidentDate: "desc",
    },
    select: {
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
    },
  });
};

const countReportIncidents = async (filters = {}) => {
  return prisma.incident.count({
    where: buildReportWhere(filters),
  });
};

module.exports = {
  findReportIncidents,
  countReportIncidents,
};
