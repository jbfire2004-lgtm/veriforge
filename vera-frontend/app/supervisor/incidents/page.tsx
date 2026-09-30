import Link from "next/link";

/**
 * Incidents hub — entry to reporting, list, map, and workflow detail routes.
 */
export default function IncidentsHubPage() {
  const cards = [
    {
      href: "/supervisor/incidents/new",
      title: "New report",
      desc: "Log a near miss, injury, or unsafe condition with optional GPS and signatures.",
      tone: "border-[#174F86] bg-[#1E6FB8] hover:bg-[#1A63A6] text-[#F4F6F8]",
    },
    {
      href: "/supervisor/incidents/list",
      title: "List & workflow",
      desc: "See every incident, open status, and advance the safety workflow.",
      tone: "border-[#2A2E33] bg-[#3B3F45] hover:bg-[#454A51] text-[#F4F6F8]",
    },
    {
      href: "/supervisor/incidents/map",
      title: "Map",
      desc: "Geotagged incidents on an OpenStreetMap view.",
      tone: "border-[#3D8F58] bg-[#4FAF6F] hover:bg-[#45A064] text-[#0F1A12]",
    },
  ];

  return (
    <main className="p-6 space-y-8 max-w-lg mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Incidents</h1>
        <p className="text-slate-600 text-sm">
          Field reporting tied to the API: create → triage → corrective action →
          close, with optional investigations.
        </p>
      </div>

      <ul className="space-y-4">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className={`block rounded-[3px] border px-5 py-4 shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px ${c.tone}`}
            >
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="mt-1 text-sm opacity-90">{c.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
