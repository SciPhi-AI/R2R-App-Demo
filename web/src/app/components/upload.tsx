"use client";
import { useState, useRef } from "react";
import { R2RClient } from '../../r2r-js-client';

export const UploadButton = ({ userId, apiUrl, uploadedDocuments, setUploadedDocuments }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

    
  const handleDocumentUpload = async (event) => {
    event.preventDefault();
    if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files.length) {
      setIsUploading(true);
      const files = fileInputRef.current.files;
      try {
        if (!apiUrl) {
          throw new Error('API URL is not defined');
        }
        const client = new R2RClient(apiUrl);
        const uploadedFiles: string[] = [];
        for (const file of files) {
          if (!file) continue;
          const name = file.name;
          if (!name) continue;
          const metadata = { user_id: userId };
          await client.uploadFile(name, file, metadata);
          uploadedFiles.push(name);
        }
        setUploadedDocuments([...uploadedDocuments, ...uploadedFiles]);
        alert("Success");
      } catch (error) {
        console.error("Error uploading files:", error);
        alert("Failed to upload files. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUploadButtonClick = () => {
    if (fileInputRef.current){
        fileInputRef.current.click();
    }
  };

  return (
    <>
      <form onSubmit={handleDocumentUpload}>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleDocumentUpload}
        />
        <button
          type="button"
          onClick={handleUploadButtonClick}
          disabled={isUploading}
          className={`pl-2 pr-2 text-white py-2 px-4 rounded ${
            isUploading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload File(s)"}
        </button>
      </form>
    </>
  );
};