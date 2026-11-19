"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

interface AddCardFormProps {
  columnTitle: string;
  onAdd: (title: string, details: string) => void;
}

export function AddCardForm({ columnTitle, onAdd }: AddCardFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  function handleReset() {
    setTitle("");
    setDetails("");
    setIsOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    onAdd(title, details);
    handleReset();
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white/60 px-3 py-2 text-xs font-semibold text-navy/80 transition-colors hover:border-blue hover:bg-white hover:text-blue focus-visible:outline-2 focus-visible:outline-blue"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add card</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          handleReset();
        }
      }}
      className="rounded-xl border border-blue/40 bg-white p-3 shadow-sm"
    >
      <label className="sr-only" htmlFor={`new-title-${columnTitle}`}>
        Card title
      </label>
      <input
        id={`new-title-${columnTitle}`}
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Card title"
        autoFocus
        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-navy placeholder:text-muted/75 focus:border-blue focus:outline-none"
      />

      <label className="sr-only" htmlFor={`new-details-${columnTitle}`}>
        Card details
      </label>
      <textarea
        id={`new-details-${columnTitle}`}
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        placeholder="Card details"
        rows={2}
        className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-navy placeholder:text-muted/75 focus:border-blue focus:outline-none"
      />

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-lg bg-purple px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
        >
          Add Card
        </button>

        <button
          type="button"
          onClick={handleReset}
          aria-label="Cancel adding card"
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-slate-100 hover:text-navy"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
