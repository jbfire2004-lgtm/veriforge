"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEquipmentCoreDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_equipment_core_dto_1 = require("./create-equipment-core.dto");
class UpdateEquipmentCoreDto extends (0, mapped_types_1.PartialType)(create_equipment_core_dto_1.CreateEquipmentCoreDto) {
}
exports.UpdateEquipmentCoreDto = UpdateEquipmentCoreDto;
//# sourceMappingURL=update-equipment-core.dto.js.map