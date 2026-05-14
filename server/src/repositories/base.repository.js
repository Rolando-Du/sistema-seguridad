const prisma = require("../config/prisma");

const baseSelect = {
  id: true,
  name: true,
  address: true,
  province: true,
  department: true,
  city: true,
  neighborhood: true,
  baseType: true,
  latitude: true,
  longitude: true,
  active: true,
  createdAt: true,
  updatedAt: true,
};

const buildBaseWhere = (filters = {}) => {
  const where = {};

  if (!filters.includeInactive) {
    where.active = true;
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

  if (filters.baseType && filters.baseType !== "TODOS") {
    where.baseType = filters.baseType;
  }

  return where;
};

const findAllBases = async (filters = {}) => {
  return prisma.operationalBase.findMany({
    where: buildBaseWhere(filters),
    select: baseSelect,
    orderBy: [
      {
        active: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
};

const findBaseById = async (id) => {
  return prisma.operationalBase.findUnique({
    where: { id },
    select: baseSelect,
  });
};

const createBase = async (data) => {
  return prisma.operationalBase.create({
    data,
    select: baseSelect,
  });
};

const updateBase = async (id, data) => {
  return prisma.operationalBase.update({
    where: { id },
    data,
    select: baseSelect,
  });
};

module.exports = {
  findAllBases,
  findBaseById,
  createBase,
  updateBase,
};
