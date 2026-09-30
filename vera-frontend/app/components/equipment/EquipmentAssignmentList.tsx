export function EquipmentAssignmentList({ assignments }: any) {
    if (!assignments || assignments.length === 0) {
      return <p className="text-gray-500">No workers assigned</p>;
    }
  
    return (
      <ul className="space-y-2">
        {assignments.map((a: any) => (
          <li key={a.id} className="p-3 bg-white rounded shadow">
            {a.worker?.name}
          </li>
        ))}
      </ul>
    );
  }
  