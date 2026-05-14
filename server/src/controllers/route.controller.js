const { getNearestBaseForIncident } = require("../services/route.service");

const getNearestBase = async (req, res, next) => {
  try {
    const result = await getNearestBaseForIncident(req.params.incidentId);

    res.status(200).json({
      success: true,
      message: "Base operativa más cercana calculada correctamente.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearestBase,
};
