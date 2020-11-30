const winston = require("winston");
const colorizer = winston.format.colorize();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "stx-generate" },
  transports: [
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple(),
        winston.format.printf((msg) =>
          colorizer.colorize(
            msg.level,
            `${msg.timestamp} - ${msg.level}: ${msg.message}`
          )
        )
      ),
    })
  );

  winston.addColors({
    error: "red",
    warn: "yellow",
    info: "cyan",
    debug: "green",
  });
}

module.exports = logger;
