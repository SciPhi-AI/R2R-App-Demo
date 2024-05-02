"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from "next/navigation";

const Index: React.FC = () => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [demo, setDemoType] = useState('');
  console.log('demo = ', demo)
  console.log('apiUrl = ', apiUrl)
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the demoType from the URL search parameters
    const demoTypePassed = searchParams.get("demo-type");
    if (demoTypePassed) {
      setDemoType(demoTypePassed);
    }
  }, [searchParams]);

  useEffect(() => {
    let localApiUrl = localStorage?.getItem("apiUrl") || '';
    localApiUrl = searchParams.get("host-url") || localApiUrl;
    if (localApiUrl) {
      setApiUrl(localApiUrl);
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
    if (demo) {
      switch (demo) {
        case 'qna-rag':
        case 'web-rag':
        case 'hyde-rag':
          // Navigate to the corresponding route
          window.location.href = `/${demo}`;
          break;
        case 'qna':
        case 'web':
        case 'hyde':
          // Navigate to the corresponding route
          window.location.href = `/${demo}-rag`;
          break;
        default:
          throw new Error('Invalid demo type provided.');
      }
    } else {
      try {
        console.log('apiUrl = ', apiUrl)
        const response = await fetch(`${apiUrl}/get_rag_pipeline_var/`);
        console.log('response = ', response);
        const data = await response.json();
        const fetchedDemoType = data.rag_pipeline;
        if (fetchedDemoType) {
          setDemoType(fetchedDemoType);
        } else {
          throw new Error('No demo type found.');
        }
      } catch (error) {
        console.error('Error fetching demo type:', error);
      }
    }
  };

  
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
            {/* Tooltip SVG and content here */}
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
            className="absolute inset-y-0 right-0 px-4 py-2 border border-transparent text-sm font-medium rounded-r-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={navigateToDemo}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;