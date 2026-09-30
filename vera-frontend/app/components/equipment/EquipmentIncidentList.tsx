export function EquipmentIncidentList({ incidents }: any) {
    if (!incidents || incidents.length === 0) {
      return <p className="text-gray-500">No incidents</p>;
    }
  
    return (
      <ul className="space-y-2">
        {incidents.map((i: any) => (
          <li key={i.id} className="p-3 bg-red-100 rounded shadow">
            {i.description}
          </li>
        ))}
      </ul>
    );
  }
  