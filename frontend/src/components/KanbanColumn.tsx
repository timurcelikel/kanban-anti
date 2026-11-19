"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AddCardForm } from "@/components/AddCardForm";
import { KanbanCard } from "@/components/KanbanCard";
import type { Column } from "@/types/kanban";

interface KanbanColumnProps {
  column: Column;
  onRename: (columnId: string, newTitle: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
}

export function KanbanColumn({
  column,
  onRename,
  onAddCard,
  onDeleteCard,
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(column.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function startEditing() {
    setDraftTitle(column.title);
    setIsEditing(true);
  }

  function commitRename() {
    const trimmed = draftTitle.trim();
    if (trimmed) {
      onRename(column.id, trimmed);
    }
    setIsEditing(false);
  }

  function cancelRename() {
    setIsEditing(false);
  }

  return (
    <section
      ref={setNodeRef}
      data-testid={`kanban-column-${column.id}`}
      aria-label={column.title}
      className={[
        "flex h-full min-h-[460px] flex-col rounded-2xl border bg-column/85 transition-colors",
        isOver
          ? "border-yellow bg-yellow/5 ring-2 ring-yellow/35"
          : "border-slate-200/80",
      ].join(" ")}
    >
      <div
        className={[
          "h-1.5 w-full rounded-t-2xl transition-colors",
          isOver ? "bg-yellow" : isEditing ? "bg-blue" : "bg-navy",
        ].join(" ")}
      />

      <header className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-3">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            aria-label={`Column name for ${column.title}`}
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitRename();
              } else if (event.key === "Escape") {
                cancelRename();
              }
            }}
            className="w-full rounded-lg border border-blue bg-white px-2 py-1 text-sm font-bold text-navy focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            title="Click to rename column"
            className="group/title flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-blue"
          >
            <h2 className="truncate text-sm font-bold tracking-tight text-navy">
              {column.title}
            </h2>
            <Pencil className="h-3 w-3 shrink-0 text-blue opacity-0 transition-opacity group-hover/title:opacity-100" />
          </button>
        )}

        <span
          data-testid={`column-count-${column.id}`}
          className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-white px-2 text-xs font-semibold text-muted shadow-2xs ring-1 ring-slate-200/80"
        >
          {column.cards.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-2.5 px-3 pb-3">
        <SortableContext
          items={column.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {column.cards.map((card) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  onDelete={(cardId) => onDeleteCard(column.id, cardId)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300/80 bg-white/40 px-4 py-8 text-center text-xs text-muted">
              Drop a card here
            </div>
          )}
        </SortableContext>

        <div className="mt-auto pt-1">
          <AddCardForm
            columnTitle={column.title}
            onAdd={(title, details) => onAddCard(column.id, title, details)}
          />
        </div>
      </div>
    </section>
  );
}
