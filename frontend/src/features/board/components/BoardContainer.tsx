import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { BoardColumn } from "./BoardColumn";
import type { BoardColumnViewModel } from "../model/types.ts";
import { TaskCardDragPreview } from "./TaskCard";

type BoardContainerProps = {
  columns: BoardColumnViewModel[];
  isMovingTask?: boolean;
  onTaskMove: (
    taskId: string,
    columnId: string,
    position: number,
  ) => Promise<void>;
};

export function BoardContainer({
  columns,
  isMovingTask = false,
  onTaskMove,
}: BoardContainerProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const activeTask =
    columns.flatMap((column) => column.tasks).find((task) => task.id === activeTaskId) ??
    null;

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTaskId(null);

    const taskId = String(event.active.id);
    const targetColumnId = event.over ? String(event.over.id) : null;

    if (!targetColumnId) {
      return;
    }

    const sourceColumn = columns.find((column) =>
      column.tasks.some((task) => task.id === taskId),
    );
    const targetColumn = columns.find((column) => column.id === targetColumnId);

    if (!sourceColumn || !targetColumn) {
      return;
    }

    if (sourceColumn.id === targetColumn.id) {
      // Same-column reorder is intentionally skipped for now.
      // The current MVP only supports moving tasks between columns.
      return;
    }

    void onTaskMove(taskId, targetColumn.id, targetColumn.tasks.length);
  }

  return (
    <DndContext
      onDragCancel={() => setActiveTaskId(null)}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <div className="min-h-[560px]">
        <div className="flex gap-4">
          {columns.map((column) => (
            <BoardColumn
              activeTaskId={activeTaskId}
              column={column}
              isMovingTask={isMovingTask}
              key={column.id}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeTask ? <TaskCardDragPreview task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
