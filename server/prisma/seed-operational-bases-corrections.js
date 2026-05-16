const prismaModule = require("../src/config/prisma");

const prisma = prismaModule.prisma || prismaModule.default || prismaModule;

const corrections = [
  {
    currentName: "Policía del Neuquén - Comisaría 23° San Martín de los Andes",
    data: {
      address: "Belgrano 611, San Martín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Lácar",
      city: "San Martín de los Andes",
      neighborhood: "Centro",
      baseType: "COMISARIA",
      latitude: -40.1576,
      longitude: -71.3536,
      active: true,
    },
  },
  {
    currentName: "Policía del Neuquén - Comisaría 43° El Arenal",
    data: {
      address: "Los Saucos 204, San Martín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Lácar",
      city: "San Martín de los Andes",
      neighborhood: "El Arenal",
      baseType: "COMISARIA",
      latitude: -40.1458,
      longitude: -71.3119,
      active: true,
    },
  },
  {
    currentName: "Policía del Neuquén - Comisaría 25° Junín de los Andes",
    data: {
      address: "Gral. Lamadrid 189, Junín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Huiliches",
      city: "Junín de los Andes",
      neighborhood: "Centro",
      baseType: "COMISARIA",
      latitude: -39.9501,
      longitude: -71.0694,
      active: true,
    },
  },
  {
    currentName: "Policía del Neuquén - Dirección Seguridad Interior Junín de los Andes",
    data: {
      address: "Junín de los Andes, Neuquén - dirección exacta a validar",
      province: "Neuquén",
      department: "Huiliches",
      city: "Junín de los Andes",
      neighborhood: "Centro",
      baseType: "BASE_OPERATIVA",
      latitude: -39.9501,
      longitude: -71.0694,
      active: false,
    },
  },
  {
    currentName: "Gendarmería Nacional - Escuadrón 33 San Martín de los Andes",
    data: {
      address: "Tte. Gral. Roca 901 / Gral. Roca 965, San Martín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Lácar",
      city: "San Martín de los Andes",
      neighborhood: "Centro",
      baseType: "BASE_OPERATIVA",
      latitude: -40.1549,
      longitude: -71.3542,
      active: true,
    },
  },
  {
    currentName: "Gendarmería Nacional - Sección Junín de los Andes",
    data: {
      address: "Chile 340, Junín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Huiliches",
      city: "Junín de los Andes",
      neighborhood: "Centro",
      baseType: "DESTACAMENTO",
      latitude: -39.9504,
      longitude: -71.071,
      active: true,
    },
  },
  {
    currentName: "Prefectura Naval Argentina - Prefectura San Martín de los Andes",
    data: {
      address: "Capitán Drury 64, San Martín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Lácar",
      city: "San Martín de los Andes",
      neighborhood: "Centro / Zona Lacustre",
      baseType: "BASE_OPERATIVA",
      latitude: -40.1594,
      longitude: -71.359,
      active: true,
    },
  },
  {
    currentName: "Policía de Seguridad Aeroportuaria - UOSP San Martín de los Andes",
    data: {
      address: "Aeropuerto Aviador Carlos Campos / Chapelco, Neuquén",
      province: "Neuquén",
      department: "Lácar",
      city: "San Martín de los Andes",
      neighborhood: "Aeropuerto Chapelco",
      baseType: "BASE_OPERATIVA",
      latitude: -40.0754,
      longitude: -71.1373,
      active: true,
    },
  },
  {
    currentName: "Policía Federal Argentina - Delegación San Martín de los Andes",
    data: {
      address: "Av. San Martín 915, San Martín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Lácar",
      city: "San Martín de los Andes",
      neighborhood: "Centro",
      baseType: "BASE_OPERATIVA",
      latitude: -40.1575,
      longitude: -71.3528,
      active: true,
    },
  },
];

const runCorrections = async () => {
  console.log("🔧 Iniciando corrección fina de bases operativas...");

  let updated = 0;
  let notFound = 0;

  for (const item of corrections) {
    const base = await prisma.operationalBase.findFirst({
      where: {
        name: item.currentName,
      },
    });

    if (!base) {
      notFound += 1;
      console.log(`⚠️ No encontrada: ${item.currentName}`);
      continue;
    }

    await prisma.operationalBase.update({
      where: {
        id: base.id,
      },
      data: item.data,
    });

    updated += 1;
    console.log(`✅ Actualizada: ${item.currentName}`);
  }

  console.log("");
  console.log("✅ Corrección fina finalizada.");
  console.log(`Actualizadas: ${updated}`);
  console.log(`No encontradas: ${notFound}`);
};

runCorrections()
  .catch((error) => {
    console.error("❌ Error corrigiendo bases operativas:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
