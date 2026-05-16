const prismaModule = require("../src/config/prisma");

const prisma = prismaModule.prisma || prismaModule.default || prismaModule;

const bases = [
  {
    name: "Policía Federal Argentina - Delegación San Martín de los Andes",
    aliases: ["Policía Federal Argentina - Delegación San Martín de los Andes"],
    data: {
      address: "Av. San Martín 915, Q8370 San Martín de los Andes, Neuquén",
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
  {
    name: "Policía del Neuquén - Comisaría 23° San Martín de los Andes",
    aliases: ["Policía del Neuquén - Comisaría 23° San Martín de los Andes"],
    data: {
      address: "Belgrano 601-699, Q8370 San Martín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Lácar",
      city: "San Martín de los Andes",
      neighborhood: "Centro",
      baseType: "COMISARIA",
      latitude: -40.1549,
      longitude: -71.3541,
      active: true,
    },
  },
  {
    name: "Policía del Neuquén - Comisaría 43° El Arenal",
    aliases: [
      "Policía del Neuquén - Comisaría 43° El Arenal",
      "Policía del Neuquén - Dependencia policial SMA - Punto Maps 2",
    ],
    data: {
      address: "Av. Damián Elorriaga, San Martín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Lácar",
      city: "San Martín de los Andes",
      neighborhood: "El Arenal",
      baseType: "COMISARIA",
      latitude: -40.146224,
      longitude: -71.325532,
      active: true,
    },
  },
  {
    name: "Policía del Neuquén - Comisaría de la Mujer, Niñez y Adolescencia",
    aliases: ["Policía del Neuquén - Comisaría de la Mujer, Niñez y Adolescencia"],
    data: {
      address: "A Paso Hua Hum, San Martín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Lácar",
      city: "San Martín de los Andes",
      neighborhood: "A validar",
      baseType: "COMISARIA",
      latitude: -40.1499,
      longitude: -71.3248,
      active: true,
    },
  },
  {
    name: "Policía del Neuquén - Destacamento Policial Cordones del Chapelco",
    aliases: [
      "Policía del Neuquén - Destacamento Policial Cordones del Chapelco",
      "Policía del Neuquén - Dependencia policial SMA - Punto Maps 1",
    ],
    data: {
      address: "Cordones del Chapelco, Neuquén",
      province: "Neuquén",
      department: "Lácar",
      city: "San Martín de los Andes",
      neighborhood: "Cordones del Chapelco",
      baseType: "DESTACAMENTO",
      latitude: -40.129590,
      longitude: -71.226295,
      active: true,
    },
  },
  {
    name: "Policía del Neuquén - Comisaría 25° Junín de los Andes",
    aliases: ["Policía del Neuquén - Comisaría 25° Junín de los Andes"],
    data: {
      address: "Gral. Lamadrid 189, Q8371 Junín de los Andes, Neuquén",
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
    name: "Policía del Neuquén - División Tránsito Junín de los Andes",
    aliases: ["Policía del Neuquén - División Tránsito Junín de los Andes"],
    data: {
      address: "División Tránsito Junín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Huiliches",
      city: "Junín de los Andes",
      neighborhood: "Zona urbana",
      baseType: "BASE_OPERATIVA",
      latitude: -39.912759781472026,
      longitude: -71.06968056411085,
      active: true,
    },
  },
  {
    name: "Gendarmería Nacional - Escuadrón 33 San Martín de los Andes",
    aliases: ["Gendarmería Nacional - Escuadrón 33 San Martín de los Andes"],
    data: {
      address: "Gral. Roca 901, Q8370 San Martín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Lácar",
      city: "San Martín de los Andes",
      neighborhood: "Centro",
      baseType: "BASE_OPERATIVA",
      latitude: -40.1558,
      longitude: -71.3517,
      active: true,
    },
  },
  {
    name: "Gendarmería Nacional - Sección Junín de los Andes",
    aliases: ["Gendarmería Nacional - Sección Junín de los Andes"],
    data: {
      address: "República de Chile 340, Q8371 Junín de los Andes, Neuquén",
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
    name: "Prefectura Naval Argentina - Prefectura San Martín de los Andes",
    aliases: ["Prefectura Naval Argentina - Prefectura San Martín de los Andes"],
    data: {
      address: "Cap. Drury 649, San Martín de los Andes, Neuquén",
      province: "Neuquén",
      department: "Lácar",
      city: "San Martín de los Andes",
      neighborhood: "Zona Lacustre",
      baseType: "BASE_OPERATIVA",
      latitude: -40.1612,
      longitude: -71.3636,
      active: true,
    },
  },
  {
    name: "Policía de Seguridad Aeroportuaria - UOSP San Martín de los Andes",
    aliases: ["Policía de Seguridad Aeroportuaria - UOSP San Martín de los Andes"],
    data: {
      address: "Aeropuerto Chapelco - Aviador Carlos Campos, Neuquén",
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
];

const upsertByAliases = async ({ name, aliases, data }) => {
  const existingBase = await prisma.operationalBase.findFirst({
    where: {
      OR: aliases.map((alias) => ({ name: alias })),
    },
  });

  if (existingBase) {
    await prisma.operationalBase.update({
      where: {
        id: existingBase.id,
      },
      data: {
        name,
        ...data,
      },
    });

    return "updated";
  }

  await prisma.operationalBase.create({
    data: {
      name,
      ...data,
    },
  });

  return "created";
};

const removeDuplicatedGenericPoints = async () => {
  await prisma.operationalBase.deleteMany({
    where: {
      name: {
        in: [
          "Policía del Neuquén - Dependencia policial SMA - Punto Maps 1",
          "Policía del Neuquén - Dependencia policial SMA - Punto Maps 2",
        ],
      },
    },
  });
};

const run = async () => {
  console.log("🔧 Iniciando actualización validada por Google Maps...");

  let created = 0;
  let updated = 0;

  for (const base of bases) {
    const result = await upsertByAliases(base);

    if (result === "created") {
      created += 1;
      console.log(`✅ Creada: ${base.name}`);
    } else {
      updated += 1;
      console.log(`♻️ Actualizada: ${base.name}`);
    }
  }

  await removeDuplicatedGenericPoints();

  console.log("");
  console.log("✅ Actualización validada finalizada.");
  console.log(`Creadas: ${created}`);
  console.log(`Actualizadas: ${updated}`);
  console.log("Duplicados genéricos eliminados si existían.");
};

run()
  .catch((error) => {
    console.error("❌ Error actualizando bases operativas:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
