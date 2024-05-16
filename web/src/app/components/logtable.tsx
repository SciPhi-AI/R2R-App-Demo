import React, { useState, useEffect } from 'react';
import { R2RClient } from "../../r2r-js-client";

export function LogTable({apiUrl, logFetchID} : {apiUrl: string, logFetchID: string}) {
  const [collapsedStates, setCollapsedStates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLogs, setSelectedLogs] = useState('ALL');
  const [logs, setLogs] = useState([]);
  const logsPerPage = 1;

  const fetchLogs = (client: R2RClient) => {
    if (selectedLogs === "ALL") {
      client.getLogs().then((data) => {
        setLogs(data);
      });
    } else {
      client.getLogs(selectedLogs.toLowerCase()).then((data) => {
        setLogs(data);
      });
    }
  };

  useEffect(() => {
    const client = new R2RClient(apiUrl);
    setCurrentPage(1);
    fetchLogs(client);    
  }, [selectedLogs]);

  console.log('logFetchID = ', logFetchID)
  useEffect(() => {
    const client = new R2RClient(apiUrl);
    setCurrentPage(1);
    fetchLogs(client);    
  }, [logFetchID]);



  const toggleCollapse = (logIndex, entryIndex) => {
    const key = `${logIndex}-${entryIndex}`;
    setCollapsedStates(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  };

  const formatLogEntry = (log, logIndex) => {
    if (log.entries) {
      return log.entries.map((entry, entryIndex) => {
        const key = `${logIndex}-${entryIndex}`;
        const isCollapsed = collapsedStates[key];
        const contentHeight = entry.key === 'search_results' ? 'auto' : 'inherit';

        return (
          <React.Fragment key={entryIndex}>
            <tr className="border-t border-gray-600">
              <td className="px-4 py-2 text-white break-all align-top" style={{ width: '200px' }}>{entry.key.toUpperCase()}</td>
              <td className="px-4 py-2 text-white break-all" style={{ maxHeight: contentHeight, overflow: 'hidden' }}>
                {entry.key === 'search_results'  ? (
                  <>
                    <div style={{ maxHeight: isCollapsed ? 'none' : '125px', overflow: 'hidden' }}>
                      <ul className="no-list-style">
                        {entry.value.length > 0 ? (
                          entry.value.map((result, idx) => (
                            <li key={idx} className={idx > 0 ? "pt-2" : ""}>
                              {result?.metadata?.title && <p className="text-zinc-200"><strong>[{idx + 1}] </strong> Title: {result?.metadata?.title}</p>}
                              {result?.metadata?.text && <p className="text-zinc-300">{result?.metadata?.text} {isCollapsed ? "": " ..."} </p>}
                            </li>
                          ))
                        ) : (
                          <p>No search results found.</p>
                        )}
                      </ul>
                    </div>
                    <button
                      onClick={() => toggleCollapse(logIndex, entryIndex)}
                      className="text-blue-500 hover:underline mt-2"
                    >
                      {isCollapsed ? 'Show Less' : 'Show More'}
                    </button>
                  </>
                ) : (
                  typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value, null, 2)
                )}
              </td>
            </tr>
          </React.Fragment>
        );
      });
    }
    return null;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(logs.length / logsPerPage);
  const currentLogs = logs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  return (
      <div className="mt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-blue-500 pl-4">Logs</h3>
          <div className="flex space-x-4 pr-2">
            {['ALL', 'RAG', 'INGESTION'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedLogs(tab)}
                className={`px-4 py-2 rounded ${selectedLogs === tab ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
              >
                {tab}
              </button>
            ))}
          </div>
      </div>

      <div className="flex justify-center mb-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 mx-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div className="overflow-auto max-h-96 mt-4">
        <table className="min-w-full bg-zinc-800 border border-gray-600">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="px-4 py-2 text-left text-white" style={{ width: '200px' }}>Key</th>
              <th className="px-4 py-2 text-left text-white">Value</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs && currentLogs.length > 0 ? (
              currentLogs.map((log, logIndex) => (
                <React.Fragment key={logIndex}>
                  <tr className="bg-zinc-900 border-t border-gray-600">
                    <td colSpan="2" className="px-4 py-2 text-blue-400">
                      Run ID: {log.run_id} (Type: {log.run_type.toUpperCase()})
                    </td>
                  </tr>
                  {formatLogEntry(log, logIndex)}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-4 py-2 text-center text-white">
                  No logs available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}