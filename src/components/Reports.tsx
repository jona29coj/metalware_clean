import React, { useEffect, useState } from "react";

const MONTH_ORDER: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

// Report filenames carry their date as a month name + year (no numeric
// YYYY-MM), so the API's directory-listing order is effectively random.
// Parse it out for a proper newest-first sort.
const reportSortKey = (filename: string) => {
  const match = filename.match(/Metalware_Report_([A-Za-z]+)_(\d{4})/);
  if (!match) return 0;
  const [, month, year] = match;
  return new Date(parseInt(year, 10), MONTH_ORDER[month] ?? 0).getTime();
};

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
        {[...fileList].sort((a, b) => reportSortKey(b) - reportSortKey(a)).map((file) => {
          // Strip "Metalware_Report_" prefix and replace underscores with spaces
          const displayName = file
            .replace(/^Metalware_Report_/, "")
            .replace(/_/g, " ");

          return (
            <div
              key={file}
              className="bg-white rounded-lg shadow-md p-4 w-64 min-w-0 flex flex-col overflow-hidden"
            >
              <p className="font-semibold text-sm text-gray-800 break-all whitespace-normal min-w-0 flex-1">
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
