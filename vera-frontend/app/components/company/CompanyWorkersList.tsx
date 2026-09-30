export function CompanyWorkersList({ workers }: any) {
    if (!workers || workers.length === 0) {
      return <p className="text-gray-500">No workers</p>;
    }
  
    return (
      <ul className="space-y-2">
        {workers.map((w: any) => (
          <li key={w.id} className="p-3 bg-white rounded shadow">
            {w.name}
          </li>
        ))}
      </ul>
    );
  }
