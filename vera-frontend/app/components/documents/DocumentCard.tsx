export function DocumentCard({ doc }: any) {
    return (
      <div className="p-4 bg-white rounded shadow flex justify-between items-center">
        <div>
          <h3 className="font-bold">{doc.name}</h3>
          <p className="text-gray-600 text-sm">{doc.type}</p>
          <p className="text-gray-500 text-xs">
            Uploaded: {doc.createdAt?.slice(0, 10)}
          </p>
        </div>
  
        <a
          href={doc.url}
          target="_blank"
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          View
        </a>
      </div>
    );
  }
  