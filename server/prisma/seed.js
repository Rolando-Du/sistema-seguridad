const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

const seedAdmin = async () => {
  const adminEmail = "admin@seguridad.com";
  const adminPassword = "Admin123";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      name: "Administrador General",
      role: "ADMIN",
      active: true,
    },
    create: {
      name: "Administrador General",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  });

  console.log("✅ Usuario ADMIN listo:");
  console.log({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    active: admin.active,
  });

  console.log("");
  console.log("🔐 Credenciales de prueba:");
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
};

const main = async () => {
  console.log("🌱 Iniciando seed de base de datos...");
  await seedAdmin();
  console.log("✅ Seed finalizado correctamente.");
};

main()
  .catch((error) => {
    console.error("❌ Error ejecutando seed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
