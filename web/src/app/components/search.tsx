import React, { FC, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSearchUrl } from "@/app/utils/get-search-url";
import { ArrowRight } from "lucide-react";

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export const Search: FC = () => {
  const [value, setValue] = useState("");
  const router = useRouter();

  const navigateToSearch = useCallback(debounce((searchValue) => {
    router.push(getSearchUrl(encodeURIComponent(searchValue)));
  }, 50), [router]); // Adjust the delay as needed
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      navigateToSearch(value.trim());
      setValue(""); // Consider moving this line to after navigation if the field clears too early for your liking
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label
        className="relative border-zinc-700 bg-zinc-800 flex items-center justify-center border py-2 px-2 rounded-lg gap-2 focus-within:border-zinc-500 ring-8 ring-zinc-700/20"
        htmlFor="search-bar"
      >
        <input
          id="search-bar"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          placeholder="Ask SciPhi AI anything ..."
          className="px-2 pr-6 w-full rounded-md flex-1 outline-none bg-zinc-800 text-zinc-200"
        />
        <button
          type="submit"
          className="w-auto py-1 px-2 bg-zinc-400 border-black text-black fill-white active:scale-95 border overflow-hidden relative rounded-xl hover:bg-zinc-200"
        >
          <ArrowRight size={16} />
        </button>
      </label>
    </form>
  );
};
