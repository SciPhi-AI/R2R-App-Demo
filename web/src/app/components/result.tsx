import { Answer } from "@/app/components/answer";
import { Sources } from "@/app/components/sources";
import { parseStreaming } from "@/app/utils/parse-streaming";
import { Annoyed } from "lucide-react";
import { FC, useEffect, useState } from "react";

export const Result: FC<{ query: string; rid: string; userId: string }> = ({ query, rid, userId }) => {
  const [sources, setSources] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const [error, setError] = useState<number | null>(null);
  let timeout: NodeJS.Timeout;

  useEffect(() => {
    const controller = new AbortController();

    const debouncedParseStreaming = () => {
      clearTimeout(timeout); // Clear any existing timeout
      timeout = setTimeout(() => {
        parseStreaming(controller, query, userId, setSources, setMarkdown, setError); // Pass userId to parseStreaming
      }, 500); // Adjust the delay time as needed
    };

    debouncedParseStreaming();

    return () => {
      controller.abort();
      clearTimeout(timeout); // Clear the timeout on unmount
    };
  }, [query, userId]); // Include userId in the dependency array

  return (
    <div className="flex flex-col gap-8">
      <Answer markdown={markdown} sources={sources}></Answer>
      <Sources sources={sources}></Sources>
      {error && (
        <div className="absolute inset-4 flex items-center justify-center bg-white/40 backdrop-blur-sm">
          <div className="p-4 bg-white shadow-2xl rounded text-blue-500 font-medium flex gap-4">
            <Annoyed></Annoyed>
            {error === 429
              ? "Sorry, you have made too many requests recently, try again later."
              : "Sorry, we might be overloaded, try again later."}
          </div>
        </div>
      )}
    </div>
  );
};