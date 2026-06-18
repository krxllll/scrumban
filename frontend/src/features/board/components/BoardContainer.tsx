import { BoardColumn } from "./BoardColumn";
import type { BoardColumnViewModel } from "../model/types.ts";

type BoardContainerProps = {
  columns: BoardColumnViewModel[];
};

export function BoardContainer({ columns }: BoardContainerProps) {
  return (
    <div className="min-h-[560px]">
      <div className="flex gap-4">
        {columns.map((column) => (
          <BoardColumn column={column} key={column.id} />
        ))}
      </div>
    </div>
  );
}
