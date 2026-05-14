const prisma = require("../config/prisma");

const createAuditLog = async (data) => {
  return prisma.auditLog.create({
    data,
  });
};

const findAuditLogs = async ({
  action,
  entity,
  user,
  startDate,
  endDate,
  limit = 100,
}) => {
  const where = {};

  if (action && action !== "TODAS") {
    where.action = action;
  }

  if (entity && entity !== "TODAS") {
    where.entity = entity;
  }

  if (user) {
    const cleanUser = String(user).trim();

    where.OR = [
      {
        userName: {
          contains: cleanUser,
          mode: "insensitive",
        },
      },
      {
        userEmail: {
          contains: cleanUser,
          mode: "insensitive",
        },
      },
    ];

    const upperUser = cleanUser.toUpperCase();

    if (["ADMIN", "OPERADOR", "LECTOR"].includes(upperUser)) {
      where.OR.push({
        userRole: upperUser,
      });
    }
  }

  if (startDate || endDate) {
    where.createdAt = {};

    if (startDate) {
      where.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      where.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  const safeLimit = Number.isInteger(Number(limit))
    ? Math.min(Math.max(Number(limit), 1), 500)
    : 100;

  return prisma.auditLog.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: safeLimit,
  });
};

module.exports = {
  createAuditLog,
  findAuditLogs,
};
