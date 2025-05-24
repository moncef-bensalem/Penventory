// Utilitaire de journalisation pour l'application
// Permet de centraliser et standardiser les logs dans l'application

// Niveaux de log
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

// Configuration par défaut
const config = {
  level: process.env.LOG_LEVEL || LOG_LEVELS.INFO,
  enableConsole: process.env.NODE_ENV !== 'production',
  enableFile: process.env.NODE_ENV === 'production',
  logFilePath: './logs/app.log',
};

// Fonction pour formater le message de log
function formatLogMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level}] ${message} ${metaString}`.trim();
}

// Fonction pour déterminer si un niveau de log doit être affiché
function shouldLog(level) {
  const levels = Object.values(LOG_LEVELS);
  const configLevelIndex = levels.indexOf(config.level);
  const currentLevelIndex = levels.indexOf(level);
  
  return currentLevelIndex <= configLevelIndex;
}

// Fonctions de log par niveau
export function error(message, meta = {}) {
  if (!shouldLog(LOG_LEVELS.ERROR)) return;
  
  const formattedMessage = formatLogMessage(LOG_LEVELS.ERROR, message, meta);
  
  if (config.enableConsole) {
    console.error(formattedMessage);
  }
  
  // Ici, on pourrait ajouter la logique pour écrire dans un fichier
  // ou envoyer à un service de monitoring externe
}

export function warn(message, meta = {}) {
  if (!shouldLog(LOG_LEVELS.WARN)) return;
  
  const formattedMessage = formatLogMessage(LOG_LEVELS.WARN, message, meta);
  
  if (config.enableConsole) {
    console.warn(formattedMessage);
  }
}

export function info(message, meta = {}) {
  if (!shouldLog(LOG_LEVELS.INFO)) return;
  
  const formattedMessage = formatLogMessage(LOG_LEVELS.INFO, message, meta);
  
  if (config.enableConsole) {
    console.info(formattedMessage);
  }
}

export function debug(message, meta = {}) {
  if (!shouldLog(LOG_LEVELS.DEBUG)) return;
  
  const formattedMessage = formatLogMessage(LOG_LEVELS.DEBUG, message, meta);
  
  if (config.enableConsole) {
    console.debug(formattedMessage);
  }
}

// Fonction pour logger les requêtes API
export function logApiRequest(req, extra = {}) {
  const meta = {
    method: req.method,
    url: req.url,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    ...extra
  };
  
  info(`API Request`, meta);
}

// Fonction pour logger les réponses API
export function logApiResponse(req, res, responseTime, extra = {}) {
  const meta = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ...extra
  };
  
  info(`API Response`, meta);
}

// Fonction pour logger les erreurs API
export function logApiError(req, err, extra = {}) {
  const meta = {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    ...extra
  };
  
  error(`API Error`, meta);
}

// Exporter la configuration pour permettre sa modification
export const logConfig = config;

// Exporter les niveaux de log
export const logLevels = LOG_LEVELS;

// Exporter un objet logger par défaut pour compatibilité
const logger = {
  error,
  warn,
  info,
  debug,
  logApiRequest,
  logApiResponse,
  logApiError,
  config: logConfig,
  levels: logLevels
};

export default logger;
