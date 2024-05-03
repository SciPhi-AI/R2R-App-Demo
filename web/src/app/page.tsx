"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from "next/navigation";
import { Loader } from 'lucide-react';

const Index: React.FC = () => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [demo, setDemoType] = useState('');
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams) {
      // Get the demoType from the URL search parameters
      const demoTypePassed = searchParams.get("demo-type");
      if (demoTypePassed) {
        setDemoType(demoTypePassed);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams) {
      let localApiUrl = localStorage?.getItem("apiUrl") || '';
      localApiUrl = searchParams.get("host-url") || localApiUrl;
      if (localApiUrl) {
        setApiUrl(localApiUrl);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem("apiUrl", apiUrl);
  }, [apiUrl]);
  
  const handleApiUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiUrl = e.target.value;
    setApiUrl(newApiUrl);
    localStorage.setItem("apiUrl", newApiUrl);
  };

  // Navigate to the appropriate route based on the demo type or fetch the demo type if not provided
  const navigateToDemo = async () => {
    setLoading(true); // Start loading

    let navDemo = demo;
    try {
      if (demo === '') {
          const response = await fetch(`${apiUrl}/get_rag_pipeline_var/`);
          console.log('response = ', response);
          const data = await response.json();
          navDemo = data.rag_pipeline;

      } 
      console.log('navDemo = ', navDemo)
      
      switch (navDemo) {
        case 'qna-rag':
        case 'web-rag':
        case 'hyde-rag':
          // Navigate to the corresponding route
          window.location.href = `/${navDemo}`;
          break;
        case 'qna':
        case 'web':
        case 'hyde':
          // Navigate to the corresponding route
          window.location.href = `/${navDemo}-rag`;
          break;
        default:
          alert('Invalid pipeline deployment for demo was provided.');
      }
     } catch (error) {
        console.error('Error during navigation:', error);
        alert('An error occurred while trying to navigate.');
      } finally {
        setLoading(false); // Stop loading regardless of outcome
      }
  };

  // const buttonStyle = `absolute inset-y-0 right-0 px-4 py-2 border border-transparent text-sm font-medium rounded-r-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''} min-w-[100px]`;
  const buttonStyle = `flex justify-center items-center absolute inset-y-0 right-0 px-4 border border-transparent text-sm font-medium rounded-r-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''} min-w-[100px]`;

  return (
    <div className="flex h-screen bg-zinc-900 justify-center items-center">
      <div className="w-full max-w-[950px] px-4">
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
              <div style={{ width: '350px' }} className="absolute left-6 -top-2 bg-zinc-800 text-zinc-200 px-2 py-1 rounded text-xs z-10 pb-2 pt-2">
                Enter the URL where your pipeline is deployed. This is the URL where the R2R API is running.<br/><br/>To deploy a compatible pipeline, click on the "Deploy New Pipeline" button and select `Q&A RAG`, `Web RAG`, or `HyDE RAG`.
              </div>
            )}
          </span>
        </label>
        <div className="mt-1 relative rounded-2xl shadow-sm">
          <input
            type="text"
            id="apiUrl"
            name="apiUrl"
            value={apiUrl}
            onChange={handleApiUrlChange}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-2xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            type="button"
            className={buttonStyle}
            onClick={navigateToDemo}
            disabled={loading}
          >
            {loading ? <Loader className="animate-spin" /> : 'Continue'}
            
          </button>

        </div>
      </div>
    </div>
  );
};

export default Index;