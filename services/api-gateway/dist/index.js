"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
async function main() {
    const app = (0, app_1.createApp)();
    app.listen(env_1.env.port, () => {
        logger_1.logger.info('vera api gateway listening', {
            port: env_1.env.port,
            routesConfig: env_1.env.routesConfigPath,
        });
    });
}
main().catch((err) => {
    logger_1.logger.error('fatal', { error: err instanceof Error ? err.message : String(err) });
    process.exit(1);
});
//# sourceMappingURL=index.js.map