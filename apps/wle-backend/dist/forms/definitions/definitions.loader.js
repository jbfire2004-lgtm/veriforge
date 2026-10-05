"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefinitionsLoader = void 0;
const common_1 = require("@nestjs/common");
const catalog_1 = require("./catalog");
let DefinitionsLoader = class DefinitionsLoader {
    constructor() {
        this.byId = new Map();
        for (const def of catalog_1.SAFETY_FORM_CATALOG) {
            this.byId.set(def.id, def);
        }
    }
    all() {
        return [...this.byId.values()];
    }
    get(id) {
        return this.byId.get(id);
    }
    byCategory(category) {
        return this.all().filter((d) => d.category === category);
    }
};
exports.DefinitionsLoader = DefinitionsLoader;
exports.DefinitionsLoader = DefinitionsLoader = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DefinitionsLoader);
//# sourceMappingURL=definitions.loader.js.map