import { BadRequestException } from '@nestjs/common';
import { parseValidateTrainingRecordQuery } from './parse-validate-training-record-query';

describe('parseValidateTrainingRecordQuery', () => {
  it('returns empty object when no query keys', () => {
    expect(parseValidateTrainingRecordQuery({})).toEqual({});
  });

  it('parses expectedWorkerId', () => {
    expect(
      parseValidateTrainingRecordQuery({ expectedWorkerId: '42' }),
    ).toEqual({ expectedWorkerId: 42 });
  });

  it('throws when expectedWorkerId is not an integer', () => {
    expect(() =>
      parseValidateTrainingRecordQuery({ expectedWorkerId: 'x' }),
    ).toThrow(BadRequestException);
  });

  it('ignores blank optional strings', () => {
    expect(
      parseValidateTrainingRecordQuery({
        expectedWorkerId: '',
        expectedCompanyId: '',
        expectedTrainingType: '',
        expectedCertificateNumber: '',
        expectedProvider: '',
      }),
    ).toEqual({});
  });

  it('passes through optional string params', () => {
    expect(
      parseValidateTrainingRecordQuery({
        expectedTrainingType: 'FP-101',
        expectedCertificateNumber: 'CERT-1',
        expectedProvider: 'Acme Safety',
      }),
    ).toEqual({
      expectedTrainingType: 'FP-101',
      expectedCertificateNumber: 'CERT-1',
      expectedProvider: 'Acme Safety',
    });
  });

  it('parses expectedCompanyId', () => {
    expect(
      parseValidateTrainingRecordQuery({ expectedCompanyId: '12' }),
    ).toEqual({ expectedCompanyId: 12 });
  });

  it('throws when expectedCompanyId is not an integer', () => {
    expect(() =>
      parseValidateTrainingRecordQuery({ expectedCompanyId: 'x' }),
    ).toThrow(BadRequestException);
  });
});
