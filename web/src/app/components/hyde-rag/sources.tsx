import { Skeleton } from "@/app/components/skeleton";
import { Wrapper } from "@/app/components/wrapper";
import { Source } from "@/app/interfaces/source";
import { BookText } from "lucide-react";
import { FC } from "react";

const SourceItem: FC<{ source: Source }> = ({
  source,
}) => {
  const { id, score, metadata } = source;
  
  return (
    <div
      className="relative text-xs py-3 px-3 bg-zinc-400 hover:bg-zinc-300 rounded-lg flex flex-col gap-2 max-w-full"
      key={id}
    >
      <div className="font-medium text-zinc-950 text-ellipsis overflow-hidden break-words">
        {id} - {score}
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex-1 overflow-hidden">
          <div className="text-ellipsis break-all text-zinc-600 overflow-hidden w-full">
            {metadata.text}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Sources: FC<{ sources: string | null }> = ({ sources }) => {
  let parsedSources: Source[] = typeof sources === 'string' ? JSON.parse(sources) : sources;
  
  return (
    <Wrapper
      title={
        <>
          <BookText></BookText> Sources
        </>
      }
      content={
        <div className="grid gap-2">
          {parsedSources && parsedSources.length > 0 ? (
            parsedSources.map((item) => (
              <SourceItem
                key={item.title}
                source={item}
              ></SourceItem>
            ))
          ) : (
            <div className="max-w-screen-xl"> {/* Changed from max-w-screen-lg to max-w-screen-xl */}
              <Skeleton className="h-16 bg-zinc-200/80"></Skeleton>
              <Skeleton className="h-16 bg-zinc-200/80 mt-2"></Skeleton>
              <Skeleton className="h-16 bg-zinc-200/80 mt-2"></Skeleton>
              <Skeleton className="h-16 bg-zinc-200/80 mt-2"></Skeleton>
            </div>
          )}
        </div>
      }
    ></Wrapper>
  );
};