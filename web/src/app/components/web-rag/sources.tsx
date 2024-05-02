import { Skeleton } from "@/app/components/skeleton";
import { Wrapper } from "@/app/components/wrapper";
import { Source } from "@/app/interfaces/source";
import { BookText } from "lucide-react";
import { FC } from "react";

const SourceItem: FC<{ source: Source; index: number }> = ({
  source,
  index,
}) => {
  const { title, metadata } = source;

  // Check if the source is from the web or local database by checking for 'link' or 'text'
  const isWebSource = 'link' in metadata;
  const isLocalSource = 'text' in metadata;
  if (isWebSource && (metadata.link === null || metadata.link === "" || metadata.link === undefined)) {
    return null;
  }
  // Render web source
  if (isWebSource) {
    return (
      <div className="relative text-xs py-3 px-3 bg-zinc-400 hover:bg-zinc-300 rounded-lg flex flex-col gap-2" key={title}>
        <a href={metadata.link} target="_blank" className="absolute inset-0"></a>
        <div className="font-medium text-zinc-950 text-ellipsis overflow-hidden whitespace-nowrap break-words">
          {index + 1} - {title}
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex-1 overflow-hidden">
            <div className="text-ellipsis whitespace-nowrap break-all text-indigo-700 overflow-hidden w-full">
              {metadata.link}
            </div>
            <br/>
            <div>
              <span className="text-zinc-600">{metadata.snippet}</span>
            </div>
          </div>
          <div className="flex-none flex items-center">
            <img
              className="h-3 w-3"
              alt={metadata.link}
              src={`https://www.google.com/s2/favicons?domain=${metadata.link}&sz=${16}`}
            />
          </div>
        </div>
      </div>
    );
  }

  // Render local database source
  if (isLocalSource) {
    return (
      <div className="relative text-xs py-3 px-3 bg-zinc-400 hover:bg-zinc-300 rounded-lg flex flex-col gap-2" key={metadata.document_id}>
        <div className="font-medium text-zinc-950 text-ellipsis overflow-hidden whitespace-nowrap break-words">
          {index + 1} - {title}
        </div>
        <div className="text-ellipsis whitespace-nowrap break-all text-indigo-700 overflow-hidden w-full">
          Document: {metadata.document_id}, Page: {metadata.page_number}
        </div>
        <br/>
        <div>
          <span className="text-zinc-600">{metadata.text}</span>
        </div>
      </div>
    );
  }

  return null;
};

export const Sources: FC<{ sources: string | null }> = ({ sources }) => {
  let parsedSources:Source[]   = typeof sources === 'string' ? JSON.parse(sources) : sources;
  return (
    <Wrapper
      title={
        <>
          <BookText></BookText> Sources
        </>
      }
      content={
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {parsedSources && parsedSources.length > 0 ? (
            parsedSources.map((item, index) => (
              <SourceItem
                key={item.title}
                index={index}
                source={item}
              ></SourceItem>
            ))
          ) : (
            <>
              <Skeleton className="max-w-sm h-16 bg-zinc-200/80"></Skeleton>
              <Skeleton className="max-w-sm h-16 bg-zinc-200/80"></Skeleton>
              <Skeleton className="max-w-sm h-16 bg-zinc-200/80"></Skeleton>
              <Skeleton className="max-w-sm h-16 bg-zinc-200/80"></Skeleton>
            </>
          )}
        </div>
      }
    ></Wrapper>
  );
};