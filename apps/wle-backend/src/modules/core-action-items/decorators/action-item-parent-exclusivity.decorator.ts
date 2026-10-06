import { ValidationArguments, ValidateBy } from 'class-validator';

/**
 * Ensures `coreMeetingRecordId` and `coreDailyLogId` are not both set (create body).
 */
export function AssertActionItemParentExclusivity() {
  return ValidateBy({
    name: 'assertActionItemParentExclusivity',
    validator: {
      validate(_title: string, args: ValidationArguments) {
        const o = args.object as {
          coreMeetingRecordId?: number;
          coreDailyLogId?: number;
        };
        return !(o.coreMeetingRecordId != null && o.coreDailyLogId != null);
      },
      defaultMessage: () =>
        'coreMeetingRecordId and coreDailyLogId cannot both be set',
    },
  });
}
