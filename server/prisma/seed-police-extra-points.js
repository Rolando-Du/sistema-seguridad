const prismaModule = require("../src/config/prisma");

const prisma = prismaModule.prisma || prismaModule.default || prismaModule;

const policeExtraPoints = [
  {
    name: "Policía del Neuquén - Dependencia policial SMA - Punto Maps 1",
    address: "Ubicación Google Maps validada por usuario - dirección exacta a completar",
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Zona a validar",
    baseType: "BASE_OPERATIVA",
    latitude: -40.129590,
    longitude: -71.226295,
    active: true,
  },
  {
    name: "Policía del Neuquén - Dependencia policial SMA - Punto Maps 2",
    address: "Ubicación Google Maps validada por usuario - dirección exacta a completar",
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Zona a validar",
    baseType: "BASE_OPERATIVA",
    latitude: -40.146224,
    longitude: -71.325532,
    active: true,
  },
];

const seedPoliceExtraPoints = async () => {
  console.log("🌱 Iniciando carga extra de dependencias policiales...");

  let created = 0;
  let updated = 0;

  for (const base of policeExtraPoints) {
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
      continue;
    }

    await prisma.operationalBase.create({
      data: base,
    });

    created += 1;
    console.log(`✅ Creada: ${base.name}`);
  }

  console.log("");
  console.log("✅ Carga extra finalizada.");
  console.log(`Nuevas: ${created}`);
  console.log(`Actualizadas: ${updated}`);
  console.log(`Total procesadas: ${policeExtraPoints.length}`);
};

seedPoliceExtraPoints()
  .catch((error) => {
    console.error("❌ Error cargando puntos extra de policía:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
