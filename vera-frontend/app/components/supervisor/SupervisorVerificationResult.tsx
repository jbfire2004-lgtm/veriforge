export function SupervisorVerificationResult({ result }: any) {
    if (!result) return null;
  
    const isSafe = result?.ruleResult?.result === "SAFE";
  
    return (
      <div className="p-4 bg-gray-50 rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Verification Result</h2>
  
        <div
          className={`p-3 rounded text-white font-semibold ${
            isSafe ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {isSafe ? "SAFE" : "NOT SAFE"}
        </div>
  
        {result.entityType && (
          <p className="text-gray-700">
            Type: <strong>{result.entityType}</strong>
          </p>
        )}
  
        {result.entity && (
          <div className="p-3 bg-white rounded shadow">
            <h3 className="font-bold">{result.entity.name}</h3>
            {result.entity.serialNumber && (
              <p>Serial: {result.entity.serialNumber}</p>
            )}
          </div>
        )}
  
        {!isSafe && (
          <div className="bg-red-100 p-3 rounded">
            <h3 className="font-semibold mb-2">Issues</h3>
            <ul className="list-disc ml-6">
              {result.ruleResult?.reasons?.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  