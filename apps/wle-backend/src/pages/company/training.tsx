import { useState } from "react";
import { api } from "~/utils/api";

export default function CompanyTrainingRequirementsPage() {
  const { data, isLoading } = api.company.getTrainingRequirements.useQuery();
  const update = api.company.updateTrainingRequirements.useMutation();

  const [requirements, setRequirements] = useState(
    data?.requirements ?? [{ courseName: "", expiresInDays: 365 }]
  );

  if (isLoading) return <div>Loading…</div>;

  const addRow = () =>
    setRequirements([...requirements, { courseName: "", expiresInDays: 365 }]);

  const save = () => update.mutate({ requirements });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Training Requirements</h1>

      <div className="space-y-3">
        {requirements.map((r, idx) => (
          <div key={idx} className="flex gap-3">
            <input
              className="border p-2 rounded w-64"
              placeholder="Course Name"
              value={r.courseName}
              onChange={(e) => {
                const copy = [...requirements];
                copy[idx].courseName = e.target.value;
                setRequirements(copy);
              }}
            />
            <input
              className="border p-2 rounded w-32"
              type="number"
              placeholder="Expiry Days"
              value={r.expiresInDays}
              onChange={(e) => {
                const copy = [...requirements];
                copy[idx].expiresInDays = Number(e.target.value);
                setRequirements(copy);
              }}
            />
          </div>
        ))}
      </div>

      <button onClick={addRow} className="px-4 py-2 bg-gray-200 rounded">
        Add Requirement
      </button>

      <button
        onClick={save}
        className="px-4 py-2 bg-blue-600 text-white rounded ml-3"
      >
        Save
      </button>
    </div>
  );
}
