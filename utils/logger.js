module.exports = {
    logs: function (message) {
        console.log(`[LOGS] - [${new Date().toLocaleString()}] ${message}`);
    },
    error: function (message) {
        console.error(`[ERROR] - [${new Date().toLocaleString()}] ${message}`);
    },
    warn: function (message) {
        console.warn(`[WARN] - [${new Date().toLocaleString()}] ${message}`);
    },
    debug: function (message) {
        console.debug(`[DEBUG] - [${new Date().toLocaleString()}] ${message}`);
    }
}