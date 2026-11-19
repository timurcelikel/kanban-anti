import type { BoardColumns, Card, Column } from "@/types/kanban";

function createCardId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `card-${crypto.randomUUID()}`;
  }
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function findColumnByCardOrColumnId(
  columns: BoardColumns,
  id: string
): Column | undefined {
  return columns.find(
    (column) => column.id === id || column.cards.some((card) => card.id === id)
  );
}

export function renameColumn(
  columns: BoardColumns,
  columnId: string,
  newTitle: string
): BoardColumns {
  const trimmed = newTitle.trim();
  if (!trimmed) {
    return columns;
  }

  return columns.map((column) =>
    column.id === columnId ? { ...column, title: trimmed } : column
  ) as BoardColumns;
}

export function addCard(
  columns: BoardColumns,
  columnId: string,
  title: string,
  details: string
): BoardColumns {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return columns;
  }

  const newCard: Card = {
    id: createCardId(),
    title: trimmedTitle,
    details: details.trim(),
  };

  return columns.map((column) =>
    column.id === columnId
      ? { ...column, cards: [...column.cards, newCard] }
      : column
  ) as BoardColumns;
}

export function deleteCard(
  columns: BoardColumns,
  columnId: string,
  cardId: string
): BoardColumns {
  return columns.map((column) =>
    column.id === columnId
      ? { ...column, cards: column.cards.filter((card) => card.id !== cardId) }
      : column
  ) as BoardColumns;
}

export function moveCard(
  columns: BoardColumns,
  activeCardId: string,
  overId: string
): BoardColumns {
  if (activeCardId === overId) {
    return columns;
  }

  const sourceColumn = findColumnByCardOrColumnId(columns, activeCardId);
  const targetColumn = findColumnByCardOrColumnId(columns, overId);

  if (!sourceColumn || !targetColumn) {
    return columns;
  }

  const activeCard = sourceColumn.cards.find((card) => card.id === activeCardId);
  if (!activeCard) {
    return columns;
  }

  if (sourceColumn.id === targetColumn.id) {
    const oldIndex = sourceColumn.cards.findIndex((card) => card.id === activeCardId);
    const newIndex =
      overId === targetColumn.id
        ? sourceColumn.cards.length - 1
        : sourceColumn.cards.findIndex((card) => card.id === overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return columns;
    }

    const reordered = [...sourceColumn.cards];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    return columns.map((column) =>
      column.id === sourceColumn.id ? { ...column, cards: reordered } : column
    ) as BoardColumns;
  }

  const nextSourceCards = sourceColumn.cards.filter((card) => card.id !== activeCardId);
  const overIndex =
    overId === targetColumn.id
      ? targetColumn.cards.length
      : targetColumn.cards.findIndex((card) => card.id === overId);
  const insertIndex = overIndex === -1 ? targetColumn.cards.length : overIndex;

  const nextTargetCards = [...targetColumn.cards];
  nextTargetCards.splice(insertIndex, 0, activeCard);

  return columns.map((column) => {
    if (column.id === sourceColumn.id) {
      return { ...column, cards: nextSourceCards };
    }
    if (column.id === targetColumn.id) {
      return { ...column, cards: nextTargetCards };
    }
    return column;
  }) as BoardColumns;
}
