"use client";

import { useMemo, useState } from "react";
import { OrientationLanguageSwitcher } from "./OrientationLanguageSwitcher";
import { Card, CardContent } from "@/components/ui";

type Section = { id: string; type: string; title: string; body: string };

type Props = {
  languages: string[];
  sections: Record<string, Section[]>;
  defaultLanguage?: string;
  onLanguageChange?: (code: string) => void;
};

export function OrientationViewer({
  languages,
  sections,
  defaultLanguage = "en",
  onLanguageChange,
}: Props) {
  const [lang, setLang] = useState(defaultLanguage);

  function handleLangChange(code: string) {
    setLang(code);
    onLanguageChange?.(code);
  }
  const blocks = useMemo(
    () => sections[lang] ?? sections.en ?? [],
    [sections, lang],
  );

  return (
    <div className="space-y-4">
      <OrientationLanguageSwitcher
        languages={languages.length ? languages : ["en"]}
        value={lang}
        onChange={handleLangChange}
      />
      <div className="space-y-3">
        {blocks.map((block) => (
          <Card key={block.id} className="border-[#2A2E33]/10">
            <CardContent className="pt-6">
              <h3 className="text-base font-semibold text-[#2A2E33]">{block.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#5a6b7c]">
                {block.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
