const app = require("../Worikambo_RC_JHS_BLUE_WHITE_FULLSTACK/server");

module.exports = async (req, res) => {
  await app.locals.ready;
  return app(req, res);
};
