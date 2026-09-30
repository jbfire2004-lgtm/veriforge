export function EquipmentCard({ equipment }: any) {
    return (
      <div className="p-4 bg-white rounded shadow hover:shadow-md transition">
        <h3 className="font-bold text-lg">{equipment.name}</h3>
        <p className="text-gray-600">Serial: {equipment.serialNumber}</p>
        <p className="text-gray-600">Company: {equipment.company?.name}</p>
      </div>
    );
  }
  