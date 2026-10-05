"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_controller_1 = require("./app.controller");
describe('AppController', () => {
    let appController;
    beforeEach(async () => {
        const app = await testing_1.Test.createTestingModule({
            controllers: [app_controller_1.AppController],
        }).compile();
        appController = app.get(app_controller_1.AppController);
    });
    it('should be defined', () => {
        expect(appController).toBeDefined();
    });
});
//# sourceMappingURL=app.controller.spec.js.map