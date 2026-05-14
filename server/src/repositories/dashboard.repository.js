const prisma = require("../config/prisma");

const countIncidents = async (where = {}) => {
  return prisma.incident.count({
    where,
  });
};

const getLatestIncidents = async (limit = 6) => {
  return prisma.incident.findMany({
    take: limit,
    orderBy: {
      createdAt: "desc",
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
      status: true,
      createdAt: true,
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

const groupByStatus = async () => {
  return prisma.incident.groupBy({
    by: ["status"],
    _count: {
      _all: true,
    },
  });
};

const groupByCrimeType = async () => {
  return prisma.incident.groupBy({
    by: ["crimeType"],
    _count: {
      _all: true,
    },
  });
};

const groupByCity = async () => {
  return prisma.incident.groupBy({
    by: ["city"],
    _count: {
      _all: true,
    },
  });
};

const groupByNeighborhood = async () => {
  return prisma.incident.groupBy({
    by: ["neighborhood", "city"],
    _count: {
      _all: true,
    },
  });
};

const countActiveBases = async () => {
  return prisma.operationalBase.count({
    where: {
      active: true,
    },
  });
};

const countUsersByRole = async () => {
  return prisma.user.groupBy({
    by: ["role"],
    _count: {
      _all: true,
    },
  });
};

module.exports = {
  countIncidents,
  getLatestIncidents,
  groupByStatus,
  groupByCrimeType,
  groupByCity,
  groupByNeighborhood,
  countActiveBases,
  countUsersByRole,
};
