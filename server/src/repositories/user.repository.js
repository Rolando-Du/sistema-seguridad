const prisma = require("../config/prisma");

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  lastAccessAt: true,
  createdAt: true,
  updatedAt: true,
};

const findAllUsers = async () => {
  return prisma.user.findMany({
    select: userSelect,
    orderBy: {
      createdAt: "desc",
    },
  });
};

const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
};

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const createUser = async (data) => {
  return prisma.user.create({
    data,
    select: userSelect,
  });
};

const updateUser = async (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
};

module.exports = {
  findAllUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
};
