"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { Card } from "@/types/kanban";

interface KanbanCardProps {
  card: Card;
  onDelete?: (cardId: string) => void;
  isOverlay?: boolean;
}

export function KanbanCard({ card, onDelete, isOverlay = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      data-testid={`kanban-card-${card.id}`}
      className={[
        "group relative flex items-start gap-2 rounded-xl border bg-white p-3.5 transition-[border-color,box-shadow,background-color] select-none",
        isOverlay
          ? "border-blue/60 shadow-xl ring-2 ring-blue/25 cursor-grabbing rotate-[0.8deg]"
          : isDragging
          ? "border-yellow/70 bg-yellow/5 opacity-40 shadow-none"
          : "border-slate-200/90 shadow-xs hover:border-blue/50 hover:shadow-md",
      ].join(" ")}
    >
      <div
        {...attributes}
        {...listeners}
        aria-label={`Drag ${card.title}`}
        className={[
          "flex min-w-0 flex-1 items-start gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-blue",
          isOverlay ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="mt-0.5 text-slate-300 transition-colors group-hover:text-blue"
        >
          <GripVertical className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-navy break-words">
            {card.title}
          </h3>
          {card.details ? (
            <p className="mt-1.5 text-xs leading-relaxed text-muted break-words">
              {card.details}
            </p>
          ) : null}
        </div>
      </div>

      {onDelete ? (
        <button
          type="button"
          aria-label={`Delete ${card.title}`}
          onClick={() => onDelete(card.id)}
          className="rounded-md p-1 text-muted/70 opacity-80 transition-colors hover:bg-slate-100 hover:text-navy focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-blue group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </article>
  );
}
