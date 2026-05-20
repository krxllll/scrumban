import { boardColumns } from "../mockBoardData";
import { BoardColumn } from "./BoardColumn";

export function BoardContainer() {
  return (
    <div className="min-h-[560px] overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3.5">
        {boardColumns.map((column) => (
          <BoardColumn column={column} key={column.id} />
        ))}
      </div>
    </div>
  );
}
