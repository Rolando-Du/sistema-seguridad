const prismaModule = require("../src/config/prisma");

const prisma = prismaModule.prisma || prismaModule.default || prismaModule;

const operationalBases = [
  {
    name: "Policía del Neuquén - Comisaría 23° San Martín de los Andes",
    address: "San Martín de los Andes, Neuquén",
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Centro",
    baseType: "COMISARIA",
    latitude: -40.1579,
    longitude: -71.3534,
    active: true,
  },
  {
    name: "Policía del Neuquén - Comisaría 43° El Arenal",
    address: "Av. Damián Elorriaga, Barrio El Arenal, San Martín de los Andes",
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "El Arenal",
    baseType: "COMISARIA",
    latitude: -40.1458,
    longitude: -71.3119,
    active: true,
  },
  {
    name: "Policía del Neuquén - Comisaría 25° Junín de los Andes",
    address: "Junín de los Andes, Neuquén",
    province: "Neuquén",
    department: "Huiliches",
    city: "Junín de los Andes",
    neighborhood: "Centro",
    baseType: "COMISARIA",
    latitude: -39.9504,
    longitude: -71.0692,
    active: true,
  },
  {
    name: "Policía del Neuquén - Dirección Seguridad Interior Junín de los Andes",
    address: "Junín de los Andes, Neuquén",
    province: "Neuquén",
    department: "Huiliches",
    city: "Junín de los Andes",
    neighborhood: "Centro",
    baseType: "BASE_OPERATIVA",
    latitude: -39.9498,
    longitude: -71.0705,
    active: true,
  },
  {
    name: "Gendarmería Nacional - Escuadrón 33 San Martín de los Andes",
    address: "San Martín de los Andes, Neuquén",
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Centro",
    baseType: "BASE_OPERATIVA",
    latitude: -40.1568,
    longitude: -71.3544,
    active: true,
  },
  {
    name: "Gendarmería Nacional - Sección Junín de los Andes",
    address: "Junín de los Andes, Neuquén",
    province: "Neuquén",
    department: "Huiliches",
    city: "Junín de los Andes",
    neighborhood: "Centro",
    baseType: "DESTACAMENTO",
    latitude: -39.9512,
    longitude: -71.071,
    active: true,
  },
  {
    name: "Prefectura Naval Argentina - Prefectura San Martín de los Andes",
    address: "San Martín de los Andes, Neuquén",
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Lácar",
    baseType: "BASE_OPERATIVA",
    latitude: -40.1605,
    longitude: -71.3597,
    active: true,
  },
  {
    name: "Policía de Seguridad Aeroportuaria - UOSP San Martín de los Andes",
    address: "Aeropuerto Aviador Carlos Campos, Chapelco, Neuquén",
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Aeropuerto Chapelco",
    baseType: "BASE_OPERATIVA",
    latitude: -40.0754,
    longitude: -71.1373,
    active: true,
  },
  {
    name: "Policía Federal Argentina - Delegación San Martín de los Andes",
    address: "Av. San Martín 915, San Martín de los Andes, Neuquén",
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Centro",
    baseType: "BASE_OPERATIVA",
    latitude: -40.1572,
    longitude: -71.3528,
    active: true,
  },
];

const seedOperationalBases = async () => {
  console.log("🌱 Iniciando seed de bases operativas...");

  let created = 0;
  let updated = 0;

  for (const base of operationalBases) {
    const existingBase = await prisma.operationalBase.findFirst({
      where: {
        name: base.name,
        city: base.city,
      },
    });

    if (existingBase) {
      await prisma.operationalBase.update({
        where: {
          id: existingBase.id,
        },
        data: base,
      });

      updated += 1;
      console.log(`♻️ Actualizada: ${base.name}`);
    } else {
      await prisma.operationalBase.create({
        data: base,
      });

      created += 1;
      console.log(`✅ Creada: ${base.name}`);
    }
  }

  console.log("");
  console.log("✅ Seed de bases operativas finalizado.");
  console.log(`Nuevas: ${created}`);
  console.log(`Actualizadas: ${updated}`);
  console.log(`Total procesadas: ${operationalBases.length}`);
};

seedOperationalBases()
  .catch((error) => {
    console.error("❌ Error ejecutando seed de bases operativas:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
