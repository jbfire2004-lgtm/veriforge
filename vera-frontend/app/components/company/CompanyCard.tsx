export function CompanyCard({ company }: any) {
    return (
      <div className="p-4 bg-white rounded shadow hover:shadow-md transition">
        <h3 className="font-bold text-lg">{company.name}</h3>
        <p className="text-gray-500">
          Workers: {company.workers?.length ?? 0} · Equipment:{" "}
          {company.equipment?.length ?? 0}
        </p>
      </div>
    );
  }
  