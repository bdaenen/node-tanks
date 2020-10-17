const { createLogger, format, transports } = require('winston');
const { cli } = format;

module.exports = createLogger({
  transports: [
    new transports.Console({
        format: cli(),
    }),
  ]
});