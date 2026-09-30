"use strict";
/**
 * VeriHub Industry Safety Intelligence — privacy & normalization contracts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.INDUSTRIES = exports.HECA_CATEGORIES = exports.COMPANY_SUBTYPES = exports.PROJECT_SUBTYPES = exports.HOURS_DENOMINATOR = exports.MIN_SAMPLE = void 0;
exports.MIN_SAMPLE = 5;
exports.HOURS_DENOMINATOR = 200000;
exports.PROJECT_SUBTYPES = [
    "transmission",
    "distribution",
    "substation",
    "civil",
    "industrial",
    "renewable",
];
exports.COMPANY_SUBTYPES = [
    "utility",
    "epc",
    "contractor",
    "engineering_firm",
    "maintenance_provider",
];
exports.HECA_CATEGORIES = [
    "gravity",
    "electrical",
    "mechanical",
    "pressure",
    "chemical",
    "thermal",
    "radiation",
    "biological",
    "other",
];
exports.INDUSTRIES = [
    "construction",
    "energy",
    "manufacturing",
    "transportation",
    "mining",
    "utilities",
    "other",
];
