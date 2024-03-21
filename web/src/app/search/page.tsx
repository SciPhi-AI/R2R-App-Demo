"use client";
import { Result } from "@/app/components/result";
import { Search } from "@/app/components/search";
import { Title } from "@/app/components/title";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function SearchPage() {
  const searchParams = useSearchParams();
  //@ts-ignore
  const query = decodeURIComponent(searchParams.get("q") || "");
  //@ts-ignore
  const rid = decodeURIComponent(searchParams.get("rid") || "");

  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [userId, setUserId] = useState("");
  // const [availableUserIds, setAvailableUserIds] = useState([]);
  const [availableUserIds, setAvailableUserIds] = useState(() => {
    // Initialize state from localStorage if available
    const localData = localStorage.getItem("availableUserIds");
    return localData ? JSON.parse(localData) : [];
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Update localStorage when availableUserIds changes
    localStorage.setItem("availableUserIds", JSON.stringify(availableUserIds));
  }, [availableUserIds]);


  useEffect(() => {
    if (availableUserIds.length === 0) {
      // Only generate and set a new user ID if there are no available users
      const newUserId = uuidv4();
      setUserId(newUserId);
      setAvailableUserIds([newUserId]);
    } else {
      // If there are available users, use the first one as the current user
      setUserId(availableUserIds[0]);
    }
  }, [availableUserIds]);

  useEffect(() => {

    // Fetch user's documents from the API
    const fetchUserDocuments = async () => {
      try {
        if (userId === "") return;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/get_user_documents/?user_id=${userId}`
        );
        console.log('userId = ', userId)
        const data = await response.json();
        console.log('data = ', data)
        setUploadedDocuments(data.document_ids);
      } catch (error) {
        console.error("Error fetching user documents:", error);
      }
    };

    fetchUserDocuments();
  }, [userId]);

  const handleUserIdChange = async (selectedUserId) => {
    if (selectedUserId === "new") {
      const newUserId = uuidv4();
      setUserId(newUserId);
      setAvailableUserIds([...availableUserIds, newUserId]);
    } else {
      setUserId(selectedUserId);
    }

    // Fetch user's documents from the API when user ID changes
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/get_user_documents/?user_id=${selectedUserId}`
      );
      const data = await response.json();
      setUploadedDocuments(data.document_ids);
    } catch (error) {
      console.error("Error fetching user documents:", error);
    }
  };

  const handleDocumentUpload = async (event) => {
    event.preventDefault();
    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("document_id", file.name);
    formData.append("file", file);
    // Include the user_id in the metadata
    const metadata = {
      user_id: userId,
    };
    formData.append("metadata", JSON.stringify(metadata));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload_and_process_file/`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setUploadedDocuments([...uploadedDocuments, file.name]);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="absolute inset-0 bg-zinc-900">
      <div className="mx-auto max-w-6xl absolute inset-4 md:inset-8 flex">
        {/* Sidebar */}
        <div className="w-64 bg-zinc-800 p-3 rounded-l-2xl border-2 border-zinc-600">
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
                className="pl-2 pr-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Upload File
              </button>
            </form>
          </div>
          <div className="border-t border-white-600 mb-2"></div>
          <ul>
            {uploadedDocuments.map((document, index) => (
              <li key={index} className="text-zinc-300 mt-2">
                {document}
              </li>
            ))}
          </ul>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-zinc-800 rounded-r-2xl relative overflow-hidden border-2 border-zinc-600">
          <div className="h-20 pointer-events-none w-full backdrop-filter absolute top-0"></div>
          <div className="px-4 md:px-8 pt-6 pb-24 h-full overflow-auto">
            <Title
              query={query}
              userId={userId}
              availableUserIds={availableUserIds}
              onUserIdChange={handleUserIdChange}
            ></Title>
            <Result key={rid} query={query} rid={rid} userId={userId}></Result>
          </div>
          <div className="h-80 pointer-events-none w-full backdrop-filter absolute bottom-0 bg-gradient-to-b from-transparent to-zinc-900 [mask-image:linear-gradient(to_top,zinc-800,transparent)]"></div>
          <div className="absolute inset-x-0 bottom-6 px-4 md:px-8">
            <div className="w-full">
              <Search></Search>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}