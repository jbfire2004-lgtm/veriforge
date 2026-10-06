import { BadRequestException } from '@nestjs/common';
import {
  finitePositiveInt,
  parseCombinedUrlIds,
  parseEquipmentPathId,
  parseTypedJsonQr,
  parseWorkerPathId,
} from './qr-parse.util';

describe('qr-parse.util', () => {
  describe('finitePositiveInt', () => {
    it('accepts sane integers', () => {
      expect(finitePositiveInt(5)).toBe(5);
      expect(finitePositiveInt('12')).toBe(12);
    });
    it('rejects invalid', () => {
      expect(finitePositiveInt(0)).toBeNull();
      expect(finitePositiveInt(-1)).toBeNull();
      expect(finitePositiveInt('0')).toBeNull();
      expect(finitePositiveInt('x')).toBeNull();
    });
  });

  describe('parseWorkerPathId', () => {
    it('parses canonical worker URLs', () => {
      expect(parseWorkerPathId('https://app.example/scan/worker/42/path')).toBe(
        42,
      );
      expect(parseWorkerPathId('https://x/wallet/99')).toBe(99);
      expect(parseWorkerPathId('/verify/7')).toBe(7);
      expect(parseWorkerPathId('/verify/equipment?id=3')).toBeNull();
    });
  });

  describe('parseEquipmentPathId', () => {
    it('parses equipment verify and scan aliases', () => {
      expect(
        parseEquipmentPathId('https://app.example/verify/equipment?id=9'),
      ).toBe(9);
      expect(parseEquipmentPathId('https://x/scan/equipment/12')).toBe(12);
    });

    it('returns null when no equipment marker', () => {
      expect(parseEquipmentPathId('https://evil.com/other/3')).toBeNull();
    });
  });

  describe('parseWorkerPathId edge cases', () => {
    it('returns null when no marker', () => {
      expect(parseWorkerPathId('https://evil.com/other/3')).toBeNull();
    });
  });

  describe('parseTypedJsonQr', () => {
    it('parses equipment', () => {
      expect(parseTypedJsonQr('{"type":"equipment","id":3}')).toEqual({
        kind: 'equipment',
        id: 3,
      });
    });

    it('throws on malformed JSON object', () => {
      expect(() => parseTypedJsonQr('{oops')).toThrow(BadRequestException);
    });

    it('throws on unsupported type', () => {
      expect(() => parseTypedJsonQr('{"type":"other","id":1}')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('parseCombinedUrlIds', () => {
    it('parses worker+equipment params', () => {
      expect(
        parseCombinedUrlIds(
          'https://x/scan/combined?worker=1&equipment=2&extra=z',
        ),
      ).toEqual({ workerId: 1, equipmentId: 2 });
    });

    it('returns null without both IDs', () => {
      expect(parseCombinedUrlIds('https://x/y?worker=1')).toBeNull();
    });
  });
});
