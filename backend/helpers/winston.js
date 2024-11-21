import winston from 'winston'

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      name: 'info-file',
      filename: 'logs/info.log',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}] ${message}`
        })
      )
    }),
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ level, message }) => {
          return `${level}: ${message}`
        })
      ),
      // Usa process.stdout.write en lugar de console._stdout.write
      handleExceptions: true, // Para manejar excepciones no capturadas
      silent: false // Para evitar silenciar las excepciones
    }),
    new winston.transports.File({
      name: 'error-file',
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}] ${message}`
        })
      )
    }),
    new winston.transports.Console({
      level: 'error',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ level, message }) => {
          return `${level}: ${message}`
        })
      )
    })
  ]
})

export default logger
