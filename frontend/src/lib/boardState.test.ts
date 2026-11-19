import { describe, expect, it } from "vitest";
import { INITIAL_COLUMNS } from "@/data/initialBoard";
import {
  addCard,
  deleteCard,
  findColumnByCardOrColumnId,
  moveCard,
  renameColumn,
} from "@/lib/boardState";
import type { BoardColumns } from "@/types/kanban";

function cloneInitial(): BoardColumns {
  return structuredClone(INITIAL_COLUMNS);
}

describe("boardState", () => {
  it("keeps exactly 5 columns in initial data", () => {
    expect(INITIAL_COLUMNS).toHaveLength(5);
  });

  describe("findColumnByCardOrColumnId", () => {
    it("finds a column by its own id or by a card id inside it", () => {
      const board = cloneInitial();
      expect(findColumnByCardOrColumnId(board, "col-todo")?.id).toBe("col-todo");
      expect(findColumnByCardOrColumnId(board, "card-4")?.id).toBe("col-todo");
      expect(findColumnByCardOrColumnId(board, "missing-id")).toBeUndefined();
    });
  });

  describe("renameColumn", () => {
    it("renames the target column and trims surrounding whitespace", () => {
      const board = cloneInitial();
      const updated = renameColumn(board, "col-backlog", "  Ideas Queue  ");

      expect(updated[0].title).toBe("Ideas Queue");
      expect(board[0].title).toBe("Backlog");
    });

    it("ignores empty or whitespace-only titles", () => {
      const board = cloneInitial();
      const updated = renameColumn(board, "col-backlog", "   ");
      expect(updated).toBe(board);
    });
  });

  describe("addCard", () => {
    it("adds a new card with trimmed title and details to the specified column", () => {
      const board = cloneInitial();
      const initialCount = board[1].cards.length;
      const updated = addCard(
        board,
        "col-todo",
        "  Write release checklist  ",
        "  Verify build and smoke tests  "
      );

      expect(updated[1].cards).toHaveLength(initialCount + 1);
      const created = updated[1].cards[updated[1].cards.length - 1];
      expect(created.title).toBe("Write release checklist");
      expect(created.details).toBe("Verify build and smoke tests");
      expect(created.id).toBeTruthy();
      expect(board[1].cards).toHaveLength(initialCount);
    });

    it("ignores cards with empty or whitespace-only titles", () => {
      const board = cloneInitial();
      const updated = addCard(board, "col-todo", "   ", "Some details");
      expect(updated).toBe(board);
    });
  });

  describe("deleteCard", () => {
    it("removes the target card from the specified column without mutating input", () => {
      const board = cloneInitial();
      const updated = deleteCard(board, "col-todo", "card-4");

      expect(updated[1].cards.map((c) => c.id)).toEqual(["card-5"]);
      expect(board[1].cards.map((c) => c.id)).toEqual(["card-4", "card-5"]);
    });
  });

  describe("moveCard", () => {
    it("reorders cards within the same column", () => {
      const board = cloneInitial();
      const updated = moveCard(board, "card-1", "card-3");

      expect(updated[0].cards.map((c) => c.id)).toEqual([
        "card-2",
        "card-3",
        "card-1",
      ]);
      expect(board[0].cards.map((c) => c.id)).toEqual([
        "card-1",
        "card-2",
        "card-3",
      ]);
    });

    it("moves a card across columns onto another card", () => {
      const board = cloneInitial();
      const updated = moveCard(board, "card-1", "card-4");

      expect(updated[0].cards.map((c) => c.id)).toEqual(["card-2", "card-3"]);
      expect(updated[1].cards.map((c) => c.id)).toEqual([
        "card-1",
        "card-4",
        "card-5",
      ]);
    });

    it("moves a card into an empty column when dropped on the column id", () => {
      let board = cloneInitial();
      board = deleteCard(board, "col-done", "card-10");
      board = deleteCard(board, "col-done", "card-11");
      expect(board[4].cards).toHaveLength(0);

      const updated = moveCard(board, "card-8", "col-done");
      expect(updated[3].cards.map((c) => c.id)).toEqual(["card-9"]);
      expect(updated[4].cards.map((c) => c.id)).toEqual(["card-8"]);
    });

    it("returns the original board if ids match or do not exist", () => {
      const board = cloneInitial();
      expect(moveCard(board, "card-1", "card-1")).toBe(board);
      expect(moveCard(board, "missing", "col-done")).toBe(board);
      expect(moveCard(board, "card-1", "missing")).toBe(board);
    });
  });
});
