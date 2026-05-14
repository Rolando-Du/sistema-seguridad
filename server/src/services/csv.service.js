const escapeCsv = (value) => {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
};

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().split("T")[0];
};

const generateIncidentsCsv = (incidents = []) => {
  const headers = [
    "ID",
    "Fecha hecho",
    "Tipo delito",
    "Estado",
    "Provincia",
    "Departamento",
    "Localidad",
    "Barrio",
    "Direccion",
    "Genero involucrado",
    "Rango etario",
    "Latitud",
    "Longitud",
    "Descripcion",
    "Creado por",
    "Email creador",
  ];

  const rows = incidents.map((incident) => [
    escapeCsv(incident.id),
    escapeCsv(formatDate(incident.incidentDate)),
    escapeCsv(incident.crimeType),
    escapeCsv(incident.status),
    escapeCsv(incident.province),
    escapeCsv(incident.department),
    escapeCsv(incident.city),
    escapeCsv(incident.neighborhood),
    escapeCsv(incident.address),
    escapeCsv(incident.involvedGender),
    escapeCsv(incident.ageRange),
    escapeCsv(incident.latitude),
    escapeCsv(incident.longitude),
    escapeCsv(incident.description),
    escapeCsv(incident.createdBy?.name || ""),
    escapeCsv(incident.createdBy?.email || ""),
  ]);

  const csv = [
    headers.join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\n");

  return `\uFEFF${csv}`;
};

module.exports = {
  generateIncidentsCsv,
};
