export function SupervisorStatsPanel({ stats }: any) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow text-center">
          <h3 className="font-bold text-lg">Workers</h3>
          <p className="text-2xl font-semibold">{stats.workers}</p>
        </div>
  
        <div className="p-4 bg-white rounded shadow text-center">
          <h3 className="font-bold text-lg">Equipment</h3>
          <p className="text-2xl font-semibold">{stats.equipment}</p>
        </div>
  
        <div className="p-4 bg-white rounded shadow text-center">
          <h3 className="font-bold text-lg">Incidents</h3>
          <p className="text-2xl font-semibold">{stats.incidents}</p>
        </div>
      </div>
    );
  }
