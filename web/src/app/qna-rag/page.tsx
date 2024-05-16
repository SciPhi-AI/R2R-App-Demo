"use client";
import { Result } from "@/app/components/qna-rag/result";
import { Search } from "@/app/components/search";
import { Sidebar } from "@/app/components/sidebar";
import { Title } from "@/app/components/title";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { R2RClient } from "../../r2r-js-client";
import { LogTable } from "@/app/components/logtable";


export default function QnaPage() {
  const searchParams = useSearchParams();
  //@ts-ignore
  const query = decodeURIComponent(searchParams.get("q") || "");
  //@ts-ignore
  const apiUrl = localStorage?.getItem("apiUrl");

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [userId, setUserId] = useState("");
  const [availableUserIds, setAvailableUserIds] = useState(() => {
    const localData = localStorage?.getItem("availableUserIds");
    return localData ? JSON.parse(localData) : [];
  });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (apiUrl) {
      const client = new R2RClient(apiUrl);
      client.getLogs().then((data) => {
        console.log('logs = ', data);
        setLogs(data); // Store logs in the state
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("availableUserIds", JSON.stringify(availableUserIds));
  }, [availableUserIds]);

  useEffect(() => {
    if (availableUserIds.length === 0) {
      const newUserId = "063edaf8-3e63-4cb9-a4d6-a855f36376c3";
      setUserId(newUserId);
      setAvailableUserIds([newUserId]);
    } else {
      setUserId(availableUserIds[0]);
    }
  }, [availableUserIds]);


  const handleUserIdChange = async (selectedUserId) => {
    if (selectedUserId === "new") {
      const newUserId = uuidv4();
      setUserId(newUserId);
      setAvailableUserIds([...availableUserIds, newUserId]);
    } else {
      setUserId(selectedUserId);
    }
  };

  return (
    <div className="absolute inset-0 bg-zinc-900">
      
      <div className="mx-auto max-w-6xl mt-4 mb-12 absolute inset-4 md:inset-8">
        <div className="flex items-center justify-start">
          <button
            onClick={() => window.location.href = "/"}
            className="flex items-center mt-5 text-white py-2 px-4 rounded-2xl bg-slate-600 hover:bg-slate-700"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            // Add your onClick handler for deployment logic here
            onClick={() => window.location.href = 'https://app.sciphi.ai/deploy'}
            className="flex items-center mt-5 mr-2 text-white py-2 px-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 ml-3"
          >
            Deploy New Pipeline
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>

          </button>
          <div className="flex-grow">
            <label htmlFor="apiUrl" className="block text-sm font-medium text-zinc-300">
              Pipeline Deployment URL
              <span
                className="inline-block ml-1 relative cursor-pointer"
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {tooltipVisible && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
              )}
              </span>

            </label>
            <input
              type="text"
              id="apiUrl"
              name="apiUrl"
              value={apiUrl}
              disabled={true}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-not-allowed"
            />
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-6xl absolute inset-4 md:inset-8 flex mt-20">
        <div className="w-64 bg-zinc-800 p-3 rounded-l-2xl border-2 border-zinc-600 mt-4">
          <Sidebar apiUrl={apiUrl} userId={userId} uploadedDocuments={uploadedDocuments} setUploadedDocuments={setUploadedDocuments}/>
        </div>

        <div className="flex-1 bg-zinc-800 rounded-r-2xl relative overflow-hidden border-2 border-zinc-600 mt-4">
          <div className="h-20 pointer-events-none w-full backdrop-filter absolute top-0"></div>
          <div className="px-4 md:px-8 pt-6 pb-24 h-full overflow-auto">
            <Title
              query={query}
              userId={userId}
              availableUserIds={availableUserIds}
              onUserIdChange={handleUserIdChange}
            ></Title>
            <Result
              query={query}
              userId={userId}
              apiUrl={apiUrl}
              uploadedDocuments={uploadedDocuments}
              setUploadedDocuments={setUploadedDocuments}
            ></Result>
          </div>
          <div className="h-80 pointer-events-none w-full backdrop-filter absolute bottom-0 bg-gradient-to-b from-transparent to-zinc-900 [mask-image:linear-gradient(to_top,zinc-800,transparent)]"></div>
          <div className="absolute inset-x-0 bottom-6 px-4 md:px-8">
            <div className="w-full">
              <Search ></Search>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl mt-4 mb-12 absolute inset-4 md:inset-8" style={{ top: 'calc(95vh)' }}>

        <div className="bg-zinc-800 rounded-2xl relative overflow-hidden border-2 border-zinc-600">
          <LogTable logs={logs} />
        </div>
      </div>
    </div>
  );
}
