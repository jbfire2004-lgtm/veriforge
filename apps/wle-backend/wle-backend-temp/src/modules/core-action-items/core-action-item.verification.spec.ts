import { HttpException, HttpStatus } from '@nestjs/common';
import { CoreActionItemVerification } from './core-action-item.verification';

describe('CoreActionItemVerification', () => {
  it('assertDueAtNotAncient passes for recent date', () => {
    const iso = new Date().toISOString();
    expect(() =>
      CoreActionItemVerification.assertDueAtNotAncient(iso),
    ).not.toThrow();
  });

  it('assertDueAtNotAncient throws for invalid iso', () => {
    expect(() =>
      CoreActionItemVerification.assertDueAtNotAncient('not-a-date'),
    ).toThrow(HttpException);
    try {
      CoreActionItemVerification.assertDueAtNotAncient('not-a-date');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect((e as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
    }
  });

  it('assertDueAtNotAncient throws for ancient date', () => {
    expect(() =>
      CoreActionItemVerification.assertDueAtNotAncient(
        '1990-01-01T00:00:00.000Z',
      ),
    ).toThrow(HttpException);
  });

  it('isOverdueOpen is true when OPEN and due in past', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(CoreActionItemVerification.isOverdueOpen('OPEN', past)).toBe(true);
  });

  it('isOverdueOpen is false when DONE', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(CoreActionItemVerification.isOverdueOpen('DONE', past)).toBe(false);
  });

  it('validateCreatePayload throws on empty title', () => {
    expect(() =>
      CoreActionItemVerification.validateCreatePayload({
        title: '   ',
      } as never),
    ).toThrow(HttpException);
  });
});
