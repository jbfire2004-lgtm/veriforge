import { Injectable } from '@nestjs/common';
import { ORIENTATION_LOCALES } from './orientation.constants';

@Injectable()
export class OrientationTranslationService {
  /** Extend package languages; copies EN blocks with locale prefix until real MT is wired. */
  translateSections(
    sections: Record<string, unknown[]>,
    targetLocales: string[],
  ): Record<string, unknown[]> {
    const en = sections.en ?? [];
    const out = { ...sections };
    for (const locale of targetLocales) {
      if (
        !ORIENTATION_LOCALES.includes(
          locale as (typeof ORIENTATION_LOCALES)[number],
        )
      ) {
        continue;
      }
      if (out[locale]?.length) continue;
      out[locale] = en.map((block) => {
        const b = block as {
          id: string;
          title: string;
          body: string;
          type: string;
        };
        return {
          ...b,
          title: locale === 'en' ? b.title : `[${locale}] ${b.title}`,
        };
      });
    }
    return out;
  }
}
