"use client";
import { useEffect } from "react";
import { UploadButton } from "./upload"; // Import the new component

export function Sidebar({userId, apiUrl, uploadedDocuments, setUploadedDocuments}) {

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


  const abbreviateFileName = (name, maxLength = 48) => {
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength - 3)}...`;
  };

  return (
    <>
        <div 
        className="flex items-center justify-between mb-6 pt-4"
        >
            <h2 className="text-lg text-ellipsis font-bold text-blue-500">
                Documents
            </h2>
            <UploadButton userId={userId} apiUrl={apiUrl} uploadedDocuments={uploadedDocuments} setUploadedDocuments={setUploadedDocuments} />
        </div>
        <div className="border-t border-white-600 mb-2"></div>
        <div className="flex-grow overflow-auto max-h-[calc(100vh-260px)]">
          <ul className="">
            {uploadedDocuments?.map((document, index) => (
              <li key={index} className="flex justify-between items-center text-zinc-300 mt-2">
                <span className="truncate">{abbreviateFileName(document)}</span>
                <button
                  onClick={() => deleteDocument(document)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
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
