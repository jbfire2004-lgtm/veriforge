"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrientationTranslationService = void 0;
const common_1 = require("@nestjs/common");
const orientation_constants_1 = require("./orientation.constants");
let OrientationTranslationService = class OrientationTranslationService {
    translateSections(sections, targetLocales) {
        var _a, _b;
        const en = (_a = sections.en) !== null && _a !== void 0 ? _a : [];
        const out = Object.assign({}, sections);
        for (const locale of targetLocales) {
            if (!orientation_constants_1.ORIENTATION_LOCALES.includes(locale)) {
                continue;
            }
            if ((_b = out[locale]) === null || _b === void 0 ? void 0 : _b.length)
                continue;
            out[locale] = en.map((block) => {
                const b = block;
                return Object.assign(Object.assign({}, b), { title: locale === 'en' ? b.title : `[${locale}] ${b.title}` });
            });
        }
        return out;
    }
};
exports.OrientationTranslationService = OrientationTranslationService;
exports.OrientationTranslationService = OrientationTranslationService = __decorate([
    (0, common_1.Injectable)()
], OrientationTranslationService);
//# sourceMappingURL=orientation-translation.service.js.map