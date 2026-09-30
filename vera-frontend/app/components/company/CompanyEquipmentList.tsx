export function CompanyEquipmentList({ equipment }: any) {
    if (!equipment || equipment.length === 0) {
      return <p className="text-gray-500">No equipment</p>;
    }
  
    return (
      <ul className="space-y-2">
        {equipment.map((e: any) => (
          <li key={e.id} className="p-3 bg-white rounded shadow">
            {e.name}
          </li>
        ))}
      </ul>
    );
  }
  