export const browserLogger = {
  info: (message, meta = {}) => {
    console.info(`[INFO] ${message}`, meta);
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${message}`, meta);
  },
  error: (message, error = null, meta = {}) => {
    console.error(`[ERROR] ${message}`, { error, ...meta });
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  },
};
