// Basic logger utility
const logger = {
  getLogger: (name) => ({
    componentMount: () => console.log(`[${name}] Component mounted`),
    info: (msg, data) => console.log(`[${name}] INFO: ${msg}`, data),
    warn: (msg, data) => console.warn(`[${name}] WARN: ${msg}`, data),
    error: (msg, data) => console.error(`[${name}] ERROR: ${msg}`, data),
    componentUnmount: () => console.log(`[${name}] Component unmounted`)
  })
};

export default logger;