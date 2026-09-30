export function CompanyComplianceBadge({ score }: { score: number }) {
    let color = "bg-green-600";
    if (score < 80) color = "bg-yellow-500";
    if (score < 60) color = "bg-red-600";
  
    return (
      <span
        className={`px-3 py-1 rounded text-white text-sm font-semibold ${color}`}
      >
        Compliance: {score}
      </span>
    );
  }
  