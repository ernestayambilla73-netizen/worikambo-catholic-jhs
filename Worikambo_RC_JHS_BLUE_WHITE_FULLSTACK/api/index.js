const app = require("../server");

module.exports = async (req, res) => {
  await app.locals.ready;
  return app(req, res);
};
