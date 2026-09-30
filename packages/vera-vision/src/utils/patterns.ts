export const DATE_PATTERNS = [
  /\b(\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/g,
  /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/g,
  /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gi,
];

export const STANDARD_PATTERNS: { code: string; re: RegExp }[] = [
  { code: "CSA-Z462", re: /CSA\s*Z\s*462|electrical\s+safety/i },
  { code: "CSA-W117", re: /CSA\s*W\s*117|welding/i },
  { code: "CSA-B335", re: /CSA\s*B\s*335|lift\s+truck|forklift/i },
  { code: "OHS-WHMIS", re: /WHMIS|GHS/i },
  { code: "OHS-FALL", re: /fall\s+protection|working\s+at\s+heights/i },
  { code: "ANSI-A10", re: /ANSI\s*A10/i },
];

export const CERT_FIELD_PATTERNS: Record<string, RegExp[]> = {
  workerName: [/participant[:\s]+(.+)/i, /name[:\s]+(.+)/i, /trainee[:\s]+(.+)/i],
  courseName: [/course[:\s]+(.+)/i, /program[:\s]+(.+)/i, /training[:\s]+(.+)/i],
  providerName: [/provider[:\s]+(.+)/i, /training\s+provider[:\s]+(.+)/i, /issued\s+by[:\s]+(.+)/i],
  instructorName: [/instructor[:\s]+(.+)/i, /trainer[:\s]+(.+)/i],
  certificateId: [/certificate\s*(?:#|no\.?|number)[:\s]*([A-Z0-9-]+)/i, /cert\s*id[:\s]*([A-Z0-9-]+)/i],
  location: [/location[:\s]+(.+)/i, /site[:\s]+(.+)/i],
};

export const SERIAL_PATTERNS = [
  /\bS\/N[:\s]*([A-Z0-9-]+)/i,
  /\bserial\s*(?:#|no\.?)?[:\s]*([A-Z0-9-]+)/i,
  /\bmodel[:\s]*([A-Z0-9-]+)/i,
];
