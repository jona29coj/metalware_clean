import React, { useEffect, useState } from 'react';
const Reports = () => {
  const [fileList, setFileList] = useState([]);
  const [error, setError] = useState(null);
  const fileBaseUrl = "https://mw.elementsenergies.com/reports/";
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("https://mw.elementsenergies.com/api/list-reports");
        if (!res.ok) throw new Error("Failed to fetch report list.");
        const files = await res.json();
        setFileList(files);
      } catch (err) {
        console.error("Error fetching file list:", err);
        setError("Could not load report list.");
      }
    };
    fetchFiles();
  }, []);
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Monthly Reports</h2>
      {error && <p className="text-red-600">{error}</p>}
      {fileList.length === 0 && !error && (
        <p className="text-gray-500">No reports found.</p>
      )}
      <div className="flex flex-wrap gap-4">
        {fileList.map(file => (
          <div
            key={file}
            className="bg-white p-4 rounded shadow w-64 flex flex-col"
          >
            <p className="font-semibold text-sm mb-1">File:</p>
            <p className="break-words text-sm text-gray-700 mb-2">{file}</p>
            
              href={`https://mw.elementsenergies.com/api/download-report/${file}`}
              download={file}
              className="mt-auto inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-center"
            >
              ⬇️ Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Reports;
