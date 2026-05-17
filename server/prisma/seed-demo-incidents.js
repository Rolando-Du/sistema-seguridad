const prismaModule = require("../src/config/prisma");

const prisma = prismaModule.prisma || prismaModule.default || prismaModule;

const demoIncidents = [
  {
    crimeType: "Robo",
    description: "Robo denunciado en zona céntrica durante la tarde.",
    incidentDate: new Date("2026-05-10T15:30:00.000Z"),
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Centro",
    address: "Av. San Martín 850",
    latitude: -40.155,
    longitude: -71.35,
    involvedGender: "No especifica",
    ageRange: "Desconocido",
    status: "PENDIENTE",
  },
  {
    crimeType: "Hurto",
    description: "Hurto reportado en sector comercial.",
    incidentDate: new Date("2026-05-11T18:10:00.000Z"),
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Centro",
    address: "Belgrano 600",
    latitude: -40.1549,
    longitude: -71.3541,
    involvedGender: "Masculino",
    ageRange: "18-30",
    status: "EN_INVESTIGACION",
  },
  {
    crimeType: "Disturbios",
    description: "Disturbios en vía pública con intervención preventiva.",
    incidentDate: new Date("2026-05-12T23:20:00.000Z"),
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "El Arenal",
    address: "Av. Damián Elorriaga",
    latitude: -40.146224,
    longitude: -71.325532,
    involvedGender: "No especifica",
    ageRange: "18-30",
    status: "RESUELTO",
  },
  {
    crimeType: "Violencia familiar",
    description: "Intervención por conflicto familiar denunciado.",
    incidentDate: new Date("2026-05-13T21:45:00.000Z"),
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Cordones del Chapelco",
    address: "Cordones del Chapelco",
    latitude: -40.12959,
    longitude: -71.226295,
    involvedGender: "Femenino",
    ageRange: "31-45",
    status: "EN_INVESTIGACION",
  },
  {
    crimeType: "Robo",
    description: "Robo reportado en zona residencial.",
    incidentDate: new Date("2026-05-14T02:15:00.000Z"),
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Chacra 30",
    address: "Chacra 30",
    latitude: -40.148,
    longitude: -71.31,
    involvedGender: "Masculino",
    ageRange: "31-45",
    status: "PENDIENTE",
  },
  {
    crimeType: "Daños",
    description: "Daños materiales en vehículo estacionado.",
    incidentDate: new Date("2026-05-15T04:30:00.000Z"),
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Vega Maipú",
    address: "Vega Maipú",
    latitude: -40.1405,
    longitude: -71.286,
    involvedGender: "No especifica",
    ageRange: "Desconocido",
    status: "ARCHIVADO",
  },
  {
    crimeType: "Hurto",
    description: "Hurto menor denunciado en zona turística.",
    incidentDate: new Date("2026-05-15T19:00:00.000Z"),
    province: "Neuquén",
    department: "Lácar",
    city: "San Martín de los Andes",
    neighborhood: "Costanera",
    address: "Zona Lago Lácar",
    latitude: -40.1609,
    longitude: -71.3619,
    involvedGender: "No especifica",
    ageRange: "Desconocido",
    status: "PENDIENTE",
  },
  {
    crimeType: "Contravención",
    description: "Contravención registrada en espacio público.",
    incidentDate: new Date("2026-05-09T22:40:00.000Z"),
    province: "Neuquén",
    department: "Huiliches",
    city: "Junín de los Andes",
    neighborhood: "Centro",
    address: "Gral. Lamadrid 189",
    latitude: -39.9501,
    longitude: -71.0694,
    involvedGender: "Masculino",
    ageRange: "18-30",
    status: "RESUELTO",
  },
  {
    crimeType: "Robo",
    description: "Robo denunciado en zona urbana de Junín de los Andes.",
    incidentDate: new Date("2026-05-10T01:25:00.000Z"),
    province: "Neuquén",
    department: "Huiliches",
    city: "Junín de los Andes",
    neighborhood: "Centro",
    address: "República de Chile 340",
    latitude: -39.9504,
    longitude: -71.071,
    involvedGender: "No especifica",
    ageRange: "31-45",
    status: "EN_INVESTIGACION",
  },
  {
    crimeType: "Accidente vial",
    description: "Intervención por accidente vial sin víctimas fatales.",
    incidentDate: new Date("2026-05-12T12:10:00.000Z"),
    province: "Neuquén",
    department: "Huiliches",
    city: "Junín de los Andes",
    neighborhood: "Zona urbana",
    address: "División Tránsito Junín de los Andes",
    latitude: -39.912759781472026,
    longitude: -71.06968056411085,
    involvedGender: "No especifica",
    ageRange: "31-45",
    status: "RESUELTO",
  },
  {
    crimeType: "Daños",
    description: "Daños denunciados en propiedad privada.",
    incidentDate: new Date("2026-05-13T03:00:00.000Z"),
    province: "Neuquén",
    department: "Huiliches",
    city: "Junín de los Andes",
    neighborhood: "Zona norte",
    address: "Zona norte Junín de los Andes",
    latitude: -39.938,
    longitude: -71.075,
    involvedGender: "No especifica",
    ageRange: "Desconocido",
    status: "PENDIENTE",
  },
  {
    crimeType: "Amenazas",
    description: "Denuncia por amenazas en contexto vecinal.",
    incidentDate: new Date("2026-05-16T20:30:00.000Z"),
    province: "Neuquén",
    department: "Huiliches",
    city: "Junín de los Andes",
    neighborhood: "Centro",
    address: "Centro Junín de los Andes",
    latitude: -39.951,
    longitude: -71.0685,
    involvedGender: "No especifica",
    ageRange: "46-60",
    status: "EN_INVESTIGACION",
  },
];

const seedDemoIncidents = async () => {
  console.log("🌱 Iniciando seed de incidentes demo...");

  const admin = await prisma.user.findFirst({
    where: {
      email: "admin@seguridad.com",
    },
  });

  if (!admin) {
    throw new Error(
      "No se encontró el usuario admin@seguridad.com. Ejecutá primero pnpm --filter server seed"
    );
  }

  let created = 0;
  let updated = 0;

  for (const incident of demoIncidents) {
    const existingIncident = await prisma.incident.findFirst({
      where: {
        crimeType: incident.crimeType,
        description: incident.description,
        address: incident.address,
        incidentDate: incident.incidentDate,
      },
    });

    const data = {
      ...incident,
      createdById: admin.id,
    };

    if (existingIncident) {
      await prisma.incident.update({
        where: {
          id: existingIncident.id,
        },
        data,
      });

      updated += 1;
      console.log(`♻️ Actualizado: ${incident.crimeType} - ${incident.city}`);
      continue;
    }

    await prisma.incident.create({
      data,
    });

    created += 1;
    console.log(`✅ Creado: ${incident.crimeType} - ${incident.city}`);
  }

  console.log("");
  console.log("✅ Seed de incidentes demo finalizado.");
  console.log(`Nuevos: ${created}`);
  console.log(`Actualizados: ${updated}`);
  console.log(`Total procesados: ${demoIncidents.length}`);
};

seedDemoIncidents()
  .catch((error) => {
    console.error("❌ Error ejecutando seed de incidentes demo:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
