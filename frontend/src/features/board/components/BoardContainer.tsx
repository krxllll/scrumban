import { boardColumns } from "../mockBoardData";
import { BoardColumn } from "./BoardColumn";

export function BoardContainer() {
  return (
    <div className="min-h-[560px]">
      <div className="flex gap-4">
        {boardColumns.map((column) => (
          <BoardColumn column={column} key={column.id} />
        ))}
      </div>
    </div>
  );
}
