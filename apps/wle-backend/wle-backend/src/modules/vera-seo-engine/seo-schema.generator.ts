import { absoluteUrl } from './seo.utils';

export type ArticleSchemaInput = {
  slug: string;
  title: string;
  excerpt?: string | null;
  metaDescription?: string | null;
  authorName?: string | null;
  imageUrl?: string | null;
  publishedAt: string;
  readMinutes: number;
  tagSlugs?: string[];
  canonicalUrl?: string | null;
};

export type JobSchemaInput = {
  slug: string;
  title: string;
  companyName: string;
  description?: string | null;
  summary?: string | null;
  location?: string | null;
  locationCity?: string | null;
  locationRegion?: string | null;
  trade?: string | null;
  payMin?: number | null;
  payMax?: number | null;
  payPeriod?: string | null;
  payRange?: string | null;
  experienceLevel?: string | null;
  publishedAt: string;
  ticketNames?: string[];
};

export type ProfileSchemaInput = {
  path: string;
  displayName: string;
  headline?: string | null;
  bio?: string | null;
  trade?: string | null;
  profileType: 'expert' | 'worker';
};

export type QaSchemaInput = {
  slug: string;
  title: string;
  body: string;
  createdAt: string;
  answerCount: number;
  anonymous: boolean;
  authorName?: string;
  answers: {
    body: string;
    voteScore: number;
    createdAt: string;
    authorName: string;
    isAccepted: boolean;
  }[];
};

export function articleJsonLd(input: ArticleSchemaInput, base?: string) {
  const url = input.canonicalUrl ?? absoluteUrl(`/safety/${input.slug}`, base);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.metaDescription ?? input.excerpt ?? input.title,
    author: input.authorName
      ? { '@type': 'Person', name: input.authorName }
      : { '@type': 'Organization', name: 'VERA Safety' },
    datePublished: input.publishedAt,
    image: input.imageUrl ?? undefined,
    url,
    timeRequired: `PT${input.readMinutes}M`,
    keywords: input.tagSlugs?.join(', '),
  };
}

export function jobPostingJsonLd(input: JobSchemaInput, base?: string) {
  const url = absoluteUrl(`/jobs/${input.slug}`, base);
  const locality =
    input.locationCity && input.locationRegion
      ? `${input.locationCity}, ${input.locationRegion}`
      : input.location;
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: input.title,
    description: input.description ?? input.summary ?? input.title,
    datePosted: input.publishedAt,
    hiringOrganization: { '@type': 'Organization', name: input.companyName },
    jobLocation: locality
      ? {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: input.locationCity ?? locality,
            addressRegion: input.locationRegion ?? undefined,
            addressCountry: 'CA',
          },
        }
      : undefined,
    employmentType: 'CONTRACTOR',
    occupationalCategory: input.trade ?? undefined,
    qualifications: input.ticketNames?.length
      ? input.ticketNames.join(', ')
      : undefined,
    experienceRequirements: input.experienceLevel ?? undefined,
    url,
    baseSalary:
      input.payMin != null
        ? {
            '@type': 'MonetaryAmount',
            currency: 'CAD',
            value: {
              '@type': 'QuantitativeValue',
              minValue: input.payMin,
              maxValue: input.payMax ?? input.payMin,
              unitText: input.payPeriod === 'annual' ? 'YEAR' : 'HOUR',
            },
          }
        : input.payRange
        ? { '@type': 'MonetaryAmount', currency: 'CAD', value: input.payRange }
        : undefined,
  };
}

export function profileJsonLd(input: ProfileSchemaInput, base?: string) {
  const url = absoluteUrl(input.path, base);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: input.displayName,
      description: input.headline ?? input.bio ?? undefined,
      jobTitle: input.trade ?? undefined,
      url,
    },
    url,
  };
}

export function qaPageJsonLd(input: QaSchemaInput, base?: string) {
  const accepted = input.answers.find((a) => a.isAccepted);
  const suggested = input.answers.filter((a) => !a.isAccepted).slice(0, 3);
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: input.title,
      text: input.body,
      answerCount: input.answerCount,
      dateCreated: input.createdAt,
      author: input.anonymous
        ? { '@type': 'Person', name: 'Anonymous' }
        : input.authorName
        ? { '@type': 'Person', name: input.authorName }
        : undefined,
      acceptedAnswer: accepted
        ? {
            '@type': 'Answer',
            text: accepted.body,
            upvoteCount: accepted.voteScore,
            dateCreated: accepted.createdAt,
            author: { '@type': 'Person', name: accepted.authorName },
          }
        : undefined,
      suggestedAnswer: suggested.map((a) => ({
        '@type': 'Answer',
        text: a.body,
        upvoteCount: a.voteScore,
        dateCreated: a.createdAt,
        author: { '@type': 'Person', name: a.authorName },
      })),
    },
    url: absoluteUrl(`/experts/questions/${input.slug}`, base),
  };
}
