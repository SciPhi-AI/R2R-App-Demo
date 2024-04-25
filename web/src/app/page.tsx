import React from 'react';
import Link from 'next/link';

const Index: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-zinc-900 flex flex-col justify-center items-center space-y-8">
      <h1 className="text-xl text-white font-bold">Available Demos</h1>
      <div className="flex flex-row space-x-4">
        {/* Link to rag-qna */}
        <Link href="/rag-qna" className="btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Q&A RAG
        </Link>
        {/* Link to web-rag */}
        <Link href="/web-rag" className="btn bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Web RAG
        </Link>
        {/* Link to rag-chatbot */}
        <Link href="/rag-chatbot" className="btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          RAG Chatbot
        </Link>
        </div>
    </div>
  );
};

export default Index;