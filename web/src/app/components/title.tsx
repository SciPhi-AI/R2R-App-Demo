"use client";
import { getSearchUrl } from "@/app/utils/get-search-url";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export const Title = ({ query, userId }: { query: string; userId: string }) => {
  const router = useRouter();

  return (
    <div className="flex items-center pb-4 mb-6 border-b gap-4">
      <div className="flex-1">
        <label className="pr-2 block mb-1 text-zinc-400 text-left">
          Query:
        </label>
        <div
          className=" text-zinc-200 text-ellipsis overflow-hidden whitespace-nowrap"
          title={query}
        >
          {query}
        </div>

        <div className="flex-1"></div>
      </div>
      <div className="flex-none flex">
        <button
          onClick={() => {
            router.push(getSearchUrl(encodeURIComponent(query)));
          }}
          type="button"
          className="rounded flex gap-2 items-center bg-transparent px-2 py-1 text-md font-semibold text-blue-500 hover:bg-zinc-900"
        >
          <RefreshCcw size={12}></RefreshCcw>Rewrite
        </button>
      </div>
    </div>
  );
};
