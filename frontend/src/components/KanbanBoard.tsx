"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useRef, useState } from "react";
import { KanbanCard } from "@/components/KanbanCard";
import { KanbanColumn } from "@/components/KanbanColumn";
import { INITIAL_COLUMNS } from "@/data/initialBoard";
import {
  addCard,
  deleteCard,
  findColumnByCardOrColumnId,
  moveCard,
  renameColumn,
} from "@/lib/boardState";
import type { BoardColumns, Card } from "@/types/kanban";

type DragSession = {
  columnsSnapshot: BoardColumns;
  crossColumnMoved: boolean;
};

export function KanbanBoard() {
  const [columns, setColumns] = useState<BoardColumns>(INITIAL_COLUMNS);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const columnsRef = useRef(columns);
  const dragSessionRef = useRef<DragSession | null>(null);
  columnsRef.current = columns;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeCard: Card | null = activeCardId
    ? columns
        .flatMap((column) => column.cards)
        .find((card) => card.id === activeCardId) ?? null
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveCardId(String(event.active.id));
    dragSessionRef.current = {
      columnsSnapshot: columnsRef.current,
      crossColumnMoved: false,
    };
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    setColumns((prev) => {
      const sourceCol = findColumnByCardOrColumnId(prev, activeId);
      const targetCol = findColumnByCardOrColumnId(prev, overId);

      if (!sourceCol || !targetCol || sourceCol.id === targetCol.id) {
        return prev;
      }

      if (dragSessionRef.current) {
        dragSessionRef.current.crossColumnMoved = true;
      }

      return moveCard(prev, activeId, overId);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCardId(null);
    const session = dragSessionRef.current;
    dragSessionRef.current = null;

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) {
      return;
    }

    setColumns((prev) => {
      if (session?.crossColumnMoved) {
        return prev;
      }

      const sourceCol = findColumnByCardOrColumnId(prev, activeId);
      const targetCol = findColumnByCardOrColumnId(prev, overId);

      if (!sourceCol || !targetCol) {
        return prev;
      }

      return moveCard(prev, activeId, overId);
    });
  }

  function handleDragCancel() {
    setActiveCardId(null);
    const session = dragSessionRef.current;
    dragSessionRef.current = null;
    if (session) {
      setColumns(session.columnsSnapshot);
    }
  }

  function handleRenameColumn(columnId: string, newTitle: string) {
    setColumns((prev) => renameColumn(prev, columnId, newTitle));
  }

  function handleAddCard(columnId: string, title: string, details: string) {
    setColumns((prev) => addCard(prev, columnId, title, details));
  }

  function handleDeleteCard(columnId: string, cardId: string) {
    setColumns((prev) => deleteCard(prev, columnId, cardId));
  }

  const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xs">
        <div className="h-1 w-full bg-yellow" />
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2.5 w-2.5 rounded-xs bg-yellow" />
              <h1 className="text-xl font-bold tracking-tight text-navy">
                Product Kanban Board
              </h1>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Click any column title to rename it, or drag cards across stages.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-muted">
            <span className="rounded-full bg-surface px-3 py-1 ring-1 ring-slate-200/90">
              5 Columns
            </span>
            <span className="rounded-full bg-blue/10 px-3 py-1 font-semibold text-blue">
              {totalCards} Cards
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 overflow-x-auto px-6 py-6">
        <DndContext
          id="kanban-dnd-context"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid min-w-[1120px] grid-cols-5 gap-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onRename={handleRenameColumn}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeCard ? <KanbanCard card={activeCard} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
