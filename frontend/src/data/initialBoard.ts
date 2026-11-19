import type { BoardColumns } from "@/types/kanban";

export const INITIAL_COLUMNS: BoardColumns = [
  {
    id: "col-backlog",
    title: "Backlog",
    cards: [
      {
        id: "card-1",
        title: "Audit Q4 onboarding copy",
        details: "Review welcome screens and trim redundant helper labels across all entry views.",
      },
      {
        id: "card-2",
        title: "Define component spacing scale",
        details: "Standardize 4px/8px/16px rhythm across board headers, columns, and cards.",
      },
      {
        id: "card-3",
        title: "Document keyboard shortcuts",
        details: "Add concise keyboard navigation notes for moving cards and editing titles.",
      },
    ],
  },
  {
    id: "col-todo",
    title: "To Do",
    cards: [
      {
        id: "card-4",
        title: "Design empty column drop state",
        details: "Ensure empty columns display a clear visual target when dragging cards over them.",
      },
      {
        id: "card-5",
        title: "Refine card hover actions",
        details: "Keep delete controls subtle at rest and crisp on hover or keyboard focus.",
      },
    ],
  },
  {
    id: "col-in-progress",
    title: "In Progress",
    cards: [
      {
        id: "card-6",
        title: "Implement drag overlay preview",
        details: "Render a lifted card preview with subtle elevation while dragging between columns.",
      },
      {
        id: "card-7",
        title: "Build inline column renaming",
        details: "Allow clicking any column title to rename it and confirm with Enter or blur.",
      },
    ],
  },
  {
    id: "col-review",
    title: "Review",
    cards: [
      {
        id: "card-8",
        title: "Verify brand color contrast",
        details: "Check Dark Navy headings and Gray Text labels against light card surfaces.",
      },
      {
        id: "card-9",
        title: "Cross-browser drag testing",
        details: "Validate pointer and keyboard drag behavior in Chromium via Playwright.",
      },
    ],
  },
  {
    id: "col-done",
    title: "Done",
    cards: [
      {
        id: "card-10",
        title: "Initialize Next.js workspace",
        details: "Configured TypeScript, Tailwind CSS v4, and ESLint in the frontend directory.",
      },
      {
        id: "card-11",
        title: "Establish board data schema",
        details: "Locked single-board 5-column structure with title and details fields per card.",
      },
    ],
  },
];
