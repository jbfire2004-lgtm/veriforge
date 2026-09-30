export function TrainingExpiryBadge({ expiresAt }: { expiresAt: string }) {
    if (!expiresAt) return null;
  
    const expired = new Date(expiresAt) <= new Date();
    const daysLeft = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  
    let color = "bg-green-600";
    if (daysLeft < 30) color = "bg-yellow-500";
    if (expired) color = "bg-red-600";
  
    return (
      <span
        className={`px-3 py-1 rounded text-white text-sm font-semibold ${color}`}
      >
        {expired ? "Expired" : `${daysLeft} days left`}
      </span>
    );
  }
  