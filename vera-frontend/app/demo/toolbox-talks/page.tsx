"use client";

import { useState } from "react";
import ToolboxTalksPanel, {
  type ToolboxTalkListItem,
} from "../../components/safety/ToolboxTalksPanel";

const MOCK_TALKS: ToolboxTalkListItem[] = [
  {
    id: 2,
    siteId: 1,
    title: "Fall protection refresher",
    topic: "Harness inspection & anchor points",
    notes:
      "Reviewed inspection checklist. Team questions on retractable lifelines.",
    conductedAt: new Date(Date.now() - 86400000).toISOString(),
    facilitator: { firstName: "Jamie", lastName: "Rivera" },
  },
  {
    id: 1,
    siteId: 1,
    title: "Heat stress awareness",
    topic: null,
    notes: null,
    conductedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    facilitator: null,
  },
];

export default function ToolboxTalksDemoPage() {
  const [logged, setLogged] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ToolboxTalksPanel — demo
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Static mock data. Open this route while running{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
            npm run dev
          </code>{" "}
          in <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">vera-frontend</code>.
        </p>
      </div>

      {logged ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          {logged}
        </p>
      ) : null}

      <ToolboxTalksPanel
        siteName="North Yard (demo)"
        talks={MOCK_TALKS}
        onScheduleNew={() =>
          setLogged('Button clicked — hook up to "Log toolbox talk" flow.')
        }
      />

      <section className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-800">Try UI states</p>
        <p className="mt-2">
          This page uses the full component with data. To test loading/error,
          temporarily edit the component usage or add Storybook later.
        </p>
      </section>
    </div>
  );
}
