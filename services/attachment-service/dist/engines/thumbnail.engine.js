"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.thumbnailEngine = exports.ThumbnailEngine = void 0;
const sharp_1 = __importDefault(require("sharp"));
const env_1 = require("../config/env");
class ThumbnailEngine {
    async generate(source) {
        try {
            return await (0, sharp_1.default)(source)
                .rotate()
                .resize(env_1.env.thumbnailMaxWidth, env_1.env.thumbnailMaxHeight, {
                fit: 'inside',
                withoutEnlargement: true,
            })
                .jpeg({ quality: 80 })
                .toBuffer();
        }
        catch {
            return null;
        }
    }
}
exports.ThumbnailEngine = ThumbnailEngine;
exports.thumbnailEngine = new ThumbnailEngine();
//# sourceMappingURL=thumbnail.engine.js.map