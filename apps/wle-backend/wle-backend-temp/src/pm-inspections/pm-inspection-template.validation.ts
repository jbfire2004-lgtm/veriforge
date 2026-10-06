import { BadRequestException } from '@nestjs/common';
import type {
  ChecklistItemDef,
  ShowIfCondition,
} from './pm-inspections.constants';

export type RequiredSignatureDef = { role: string; label?: string };

export type TemplateScoringRules = {
  failThresholdPercent?: number;
  reviewThresholdRisk?: number;
};

function isLeafShowIf(
  condition: ShowIfCondition,
): condition is { itemId: string; equals: unknown } {
  return 'itemId' in condition && typeof condition.itemId === 'string';
}

function collectShowIfParentIds(condition: ShowIfCondition): string[] {
  if ('all' in condition && Array.isArray(condition.all)) {
    return condition.all.flatMap(collectShowIfParentIds);
  }
  if ('any' in condition && Array.isArray(condition.any)) {
    return condition.any.flatMap(collectShowIfParentIds);
  }
  if (isLeafShowIf(condition)) return [condition.itemId];
  return [];
}

export function validateChecklistItems(items: ChecklistItemDef[]): void {
  if (!Array.isArray(items) || !items.length) {
    throw new BadRequestException(
      'Template must include at least one checklist item',
    );
  }

  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id?.trim()) {
      throw new BadRequestException('Each checklist item requires an id');
    }
    if (!item.label?.trim()) {
      throw new BadRequestException(
        `Checklist item ${item.id} requires a label`,
      );
    }
    if (ids.has(item.id)) {
      throw new BadRequestException(`Duplicate checklist item id: ${item.id}`);
    }
    ids.add(item.id);
  }

  items.forEach((item, index) => {
    if (!item.showIf) return;
    for (const parentId of collectShowIfParentIds(item.showIf)) {
      const parentIndex = items.findIndex((row) => row.id === parentId);
      if (parentIndex < 0) {
        throw new BadRequestException(
          `showIf references unknown item "${parentId}" on "${item.label}"`,
        );
      }
      if (parentIndex >= index) {
        throw new BadRequestException(
          `showIf on "${item.label}" must reference an earlier checklist item`,
        );
      }
    }
  });
}

export function validateRequiredSignatures(
  signatures: unknown,
): RequiredSignatureDef[] {
  if (!signatures) return [];
  if (!Array.isArray(signatures)) {
    throw new BadRequestException('requiredSignatures must be an array');
  }
  const roles = new Set<string>();
  for (const row of signatures) {
    if (
      !row ||
      typeof row !== 'object' ||
      typeof (row as RequiredSignatureDef).role !== 'string'
    ) {
      throw new BadRequestException('Each required signature needs a role');
    }
    const role = (row as RequiredSignatureDef).role.trim();
    if (!role) throw new BadRequestException('Signature role cannot be empty');
    if (roles.has(role)) {
      throw new BadRequestException(`Duplicate signature role: ${role}`);
    }
    roles.add(role);
  }
  return signatures as RequiredSignatureDef[];
}

export function validateScoringRules(rules: unknown): TemplateScoringRules {
  if (!rules || typeof rules !== 'object') return {};
  const row = rules as TemplateScoringRules;
  if (
    row.failThresholdPercent != null &&
    (row.failThresholdPercent < 0 || row.failThresholdPercent > 100)
  ) {
    throw new BadRequestException(
      'failThresholdPercent must be between 0 and 100',
    );
  }
  if (
    row.reviewThresholdRisk != null &&
    (row.reviewThresholdRisk < 0 || row.reviewThresholdRisk > 100)
  ) {
    throw new BadRequestException(
      'reviewThresholdRisk must be between 0 and 100',
    );
  }
  return row;
}

export function normalizeChecklistItems(
  items: ChecklistItemDef[],
): ChecklistItemDef[] {
  return items.map((item) => ({
    ...item,
    id: item.id.trim(),
    label: item.label.trim(),
    required: Boolean(item.required),
    critical: Boolean(item.critical),
    weight:
      item.type === 'pass_fail' || item.type === 'numeric'
        ? item.weight ?? 1
        : item.weight,
  }));
}
