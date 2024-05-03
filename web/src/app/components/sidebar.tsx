"use client";
import { useState, useRef, useEffect } from "react";
import { R2RClient } from '../../r2r-js-client';

export function Sidebar({userId, apiUrl, uploadedDocuments, setUploadedDocuments}) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserDocuments = async () => {
      try {
        if (userId === "") return;
        const response = await fetch(
          `${apiUrl}/get_user_documents/?user_id=${userId}`
        );
        const data = await response.json();
        console.log('data.document_ids = ', data.document_ids);
        setUploadedDocuments(data.document_ids);
      } catch (error) {
        console.error("Error fetching user documents:", error);
      }
    };

    fetchUserDocuments();
  }, [userId]);

  console.log('uploadedDocuments = ', uploadedDocuments);
  const handleDocumentUpload = async (event) => {
    event.preventDefault();
      // @ts-ignore
      if (fileInputRef.current && fileInputRef.current.files.length) {
      // @ts-ignore
      const file = fileInputRef.current.files[0];
      const metadata = {
        user_id: userId,
      };
      setIsUploading(true);
      try {
        if (!apiUrl) {
          throw new Error('API URL is not defined');
        }
        const client = new R2RClient(apiUrl);
        await client.uploadFile(file.name, file, metadata);
        // @ts-ignore
        setUploadedDocuments([...uploadedDocuments, file.name]);
        alert("Success");
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  const deleteDocument = async (documentId) => {
    try {
      const encodedDocumentId = encodeURIComponent(documentId);
      const response = await fetch(`${apiUrl}/filtered_deletion/?key=document_id&value=${encodedDocumentId}`, {
          method: 'DELETE',
      });
        if (!response.ok) {
            throw new Error('Failed to delete the document');
        }
        // Update the state to remove the deleted document
        setUploadedDocuments(uploadedDocuments.filter(doc => doc !== documentId));
        alert("Document deleted successfully.");
    } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete document. Please try again.");
    }
};
  const handleUploadButtonClick = () => {
    // @ts-ignore
    fileInputRef.current.click();
  };

  return (
    <>
        <div className="flex items-center justify-between mb-6 pt-4">
            <h2 className="text-lg text-ellipsis font-bold text-blue-500">
                Documents
            </h2>
            <form onSubmit={handleDocumentUpload}>
                <input
                type="file"
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
                {isUploading ? "Uploading..." : "Upload File"}
                </button>
            </form>
        </div>
        <div className="border-t border-white-600 mb-2"></div>
        <div className="flex-grow overflow-auto max-h-[calc(100vh-260px)]">
            <ul className="">
            {uploadedDocuments?.map((document, index) => (
                <li key={index} className="text-zinc-300 mt-2">
                {document}
                <button
                  onClick={() => deleteDocument(document)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold pr-1 pl-1 rounded ml-1"
                  disabled={isUploading}
                  >
                    x
                </button>
                </li>
            ))}
            </ul>
        </div>
    </>
);
}
