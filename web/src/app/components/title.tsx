"use client";
import { getSearchUrl } from "@/app/utils/get-search-url";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export const Title = ({
  query,
  userId,
  availableUserIds,
  onUserIdChange,
}: {
  query: string;
  userId: string;
  availableUserIds: string[];
  onUserIdChange: (userId: string) => void;
}) => {
  const router = useRouter();

  const handleUserIdChange = (event) => {
    const selectedUserId = event.target.value;
    onUserIdChange(selectedUserId);
  };

  return (
    <div className="flex items-center pb-4 mb-6 border-b gap-4">
    <div className="flex-1">
      <label htmlFor="userIdSelect" className="pl-2 block mb-1 text-zinc-400">
        User ID:
      </label>
      <div className="flex items-center">
        <select
          id="userIdSelect"
          value={userId}
          onChange={handleUserIdChange}
          className="rounded bg-zinc-800 text-zinc-200 text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableUserIds.map((availableUserId) => (
            <option key={availableUserId} value={availableUserId}>
              {availableUserId}
            </option>
          ))}
          <option value="new">Generate new user ID</option>
        </select>
      </div>
    </div>

    <div className="flex-1">
      <label className="pr-2 block mb-1 text-zinc-400 text-left">Query:</label>
      <div
        className=" text-zinc-200 text-ellipsis overflow-hidden whitespace-nowrap"
        title={query}
      >
        `{query}`
      </div>
    </div>
      <div className="flex-none flex">
        <button
          onClick={() => {
            router.push(getSearchUrl(encodeURIComponent(query)));
          }}
          type="button"
          className="rounded flex gap-2 items-center bg-transparent px-2 py-1 text-xs font-semibold text-blue-500 hover:bg-zinc-900"
        >
          <RefreshCcw size={12}></RefreshCcw>Rewrite
        </button>
      </div>
    </div>
  );
};