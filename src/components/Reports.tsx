import React, { useEffect, useState } from "react";

const Reports = () => {
  const [fileList, setFileList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/list-reports`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch report list.");
        }

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
      <h2 className="text-xl font-bold mb-6 text-center">
        Monthly Reports
      </h2>

      {error && (
        <p className="text-red-600 text-center">
          {error}
        </p>
      )}

      {!error && fileList.length === 0 && (
        <p className="text-gray-500 text-center">
          No reports found.
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-6">
        {fileList.map((file) => {
          // Strip "Metalware_Report_" prefix and replace underscores with spaces
          const displayName = file
            .replace(/^Metalware_Report_/, "")
            .replace(/_/g, " ");

          return (
            <div
              key={file}
              className="bg-white rounded-lg shadow-md p-4 w-64 min-w-0 flex flex-col overflow-hidden"
            >
              <p className="font-semibold text-sm mb-2">
                File:
              </p>

              <p className="text-sm text-gray-700 break-all whitespace-normal min-w-0 flex-1">
                {displayName}
              </p>

              <a
                href={`${import.meta.env.VITE_API_BASE_URL}/api/download-report/${encodeURIComponent(
                  file
                )}`}
                download={file}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded transition"
              >
                ⬇ Download
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;
