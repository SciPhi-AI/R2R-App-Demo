import { Skeleton } from "@/app/components/skeleton";
import { FC } from "react";
import { Wrapper } from "@/app/components/wrapper";
import { BookPlus } from "lucide-react";

const AnswerItem: FC<{ answer: string; index: number }> = ({ answer, index }) => {
  return (
    <div
      className="relative text-xs py-3 px-3 bg-zinc-400 hover:bg-zinc-300 rounded-lg flex flex-col gap-2 w-full" // Added w-full here
      key={index}
    >
      <div className="font-medium text-zinc-950 text-ellipsis overflow-hidden whitespace-nowrap break-words">
        {index + 1} - {answer}
      </div>
    </div>
  );
};
export const HyDE: FC<{ answers: string[] }> = ({ answers }) => {
  return (
    <Wrapper
      title={
        <>
          <BookPlus /> Hypothetical Answers
        </>
      }
      content={
        <div className="grid grid-cols-1  gap-2">
          {answers.length > 0 ? (
            answers.map((answer, index) => (
              <AnswerItem key={index} index={index} answer={answer} />
            ))
          ) : (
            // Skeleton loaders
            <>
              <Skeleton className="max-w-sm h-16 bg-zinc-200/80"></Skeleton>
              <Skeleton className="max-w-sm h-16 bg-zinc-200/80"></Skeleton>
              <Skeleton className="max-w-sm h-16 bg-zinc-200/80"></Skeleton>
            </>
          )}
        </div>
      }
    />
  );
};