"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormEngineService = void 0;
const common_1 = require("@nestjs/common");
const conditional_evaluator_1 = require("./conditional.evaluator");
let FormEngineService = class FormEngineService {
    getVisibleFields(definition, data) {
        return (0, conditional_evaluator_1.visibleFields)(definition.fields, data);
    }
    validate(definition, data, partial = false) {
        var _a, _b, _c;
        const errors = [];
        const visibilityCtx = Object.assign(Object.assign({}, data), { __requiresSupervisor: ((_a = definition.workflow) === null || _a === void 0 ? void 0 : _a.requiresSupervisor) === true });
        const fields = partial
            ? definition.fields
            : (0, conditional_evaluator_1.visibleFields)(definition.fields, visibilityCtx);
        for (const field of fields) {
            if (!(0, conditional_evaluator_1.isFieldVisible)(field, visibilityCtx) && !partial)
                continue;
            const value = data[field.id];
            const required = field.required === true;
            if (required &&
                (value === undefined ||
                    value === null ||
                    value === '' ||
                    (Array.isArray(value) && value.length === 0))) {
                errors.push({
                    fieldId: field.id,
                    message: `${field.label} is required`,
                });
                continue;
            }
            if (value == null || value === '')
                continue;
            const v = (_b = field.validation) !== null && _b !== void 0 ? _b : {};
            if (field.type === 'number' && typeof value === 'number') {
                const min = v.min;
                const max = v.max;
                if (min != null && value < min) {
                    errors.push({
                        fieldId: field.id,
                        message: `${field.label} must be at least ${min}`,
                    });
                }
                if (max != null && value > max) {
                    errors.push({
                        fieldId: field.id,
                        message: `${field.label} must be at most ${max}`,
                    });
                }
            }
            if ((field.type === 'select' || field.type === 'multiselect') &&
                ((_c = field.options) === null || _c === void 0 ? void 0 : _c.length)) {
                const allowed = field.options.map((o) => typeof o === 'string' ? o : o.value);
                if (field.type === 'multiselect' && Array.isArray(value)) {
                    for (const item of value) {
                        if (!allowed.includes(String(item))) {
                            errors.push({
                                fieldId: field.id,
                                message: `Invalid option in ${field.label}`,
                            });
                        }
                    }
                }
                else if (!allowed.includes(String(value))) {
                    errors.push({
                        fieldId: field.id,
                        message: `Invalid selection for ${field.label}`,
                    });
                }
            }
        }
        return errors;
    }
    evaluateFlags(definition, data) {
        var _a;
        const wf = (_a = definition.workflow) !== null && _a !== void 0 ? _a : {};
        let sifFlag = false;
        let hecaFlag = false;
        if (wf.autoFlagSIF) {
            sifFlag =
                data.sifPotential === true ||
                    data.sifPotential === 'yes' ||
                    data.severity === 'SIF' ||
                    data.energyType === 'gravity' ||
                    data.energyType === 'mechanical';
        }
        if (wf.autoFlagHECA) {
            hecaFlag =
                data.hecaCategory != null ||
                    data.hecaObservation === true ||
                    data.observationType === 'HECA' ||
                    data.atRisk === true;
        }
        return { sifFlag, hecaFlag };
    }
};
exports.FormEngineService = FormEngineService;
exports.FormEngineService = FormEngineService = __decorate([
    (0, common_1.Injectable)()
], FormEngineService);
//# sourceMappingURL=form-engine.service.js.map