const {
  loginUser,
  getAuthenticatedUser,
} = require("../services/auth.service");
const { registerAuditLog } = require("../services/audit.service");

const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    await registerAuditLog({
      req,
      user: result.user,
      action: "LOGIN",
      entity: "AUTH",
      entityId: result.user.id,
      description: `Inicio de sesión correcto para ${result.user.email}.`,
      previousData: null,
      newData: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        lastAccessAt: result.user.lastAccessAt,
      },
    });

    res.status(200).json({
      success: true,
      message: "Inicio de sesión correcto.",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

const profile = async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  profile,
};
