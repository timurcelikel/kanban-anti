import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { KanbanBoard } from "@/components/KanbanBoard";

describe("KanbanBoard", () => {
  it("renders a single board with 5 fixed columns and initial dummy cards", () => {
    render(<KanbanBoard />);

    expect(
      screen.getByRole("heading", { name: "Product Delivery Board" })
    ).toBeInTheDocument();

    const columnHeadings = ["Backlog", "To Do", "In Progress", "Review", "Done"];
    for (const title of columnHeadings) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }

    expect(screen.getByText("Audit Q4 onboarding copy")).toBeInTheDocument();
    expect(screen.getByText("Initialize Next.js workspace")).toBeInTheDocument();
  });

  it("supports inline column renaming with Enter, Escape cancel, and blank guard", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    // Rename Backlog -> Ideas via Enter
    await user.click(screen.getByRole("button", { name: "Backlog" }));
    const backlogInput = screen.getByLabelText("Column name for Backlog");
    await user.clear(backlogInput);
    await user.type(backlogInput, "Ideas{enter}");
    expect(screen.getByRole("heading", { name: "Ideas" })).toBeInTheDocument();

    // Cancel rename with Escape
    await user.click(screen.getByRole("button", { name: "To Do" }));
    const todoInput = screen.getByLabelText("Column name for To Do");
    await user.clear(todoInput);
    await user.type(todoInput, "Should Not Save{escape}");
    expect(screen.getByRole("heading", { name: "To Do" })).toBeInTheDocument();

    // Ignore whitespace-only rename on blur
    await user.click(screen.getByRole("button", { name: "To Do" }));
    const todoInputAgain = screen.getByLabelText("Column name for To Do");
    await user.clear(todoInputAgain);
    await user.type(todoInputAgain, "   ");
    await user.tab();
    expect(screen.getByRole("heading", { name: "To Do" })).toBeInTheDocument();
  });

  it("adds a new card with title and details and prevents blank submissions", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const todoColumn = screen.getByTestId("kanban-column-col-todo");
    expect(within(todoColumn).getByTestId("column-count-col-todo")).toHaveTextContent("2");

    await user.click(within(todoColumn).getByRole("button", { name: "Add card" }));
    const submitButton = within(todoColumn).getByRole("button", { name: "Add Card" });
    expect(submitButton).toBeDisabled();

    await user.type(within(todoColumn).getByPlaceholderText("Card title"), "Draft QA plan");
    await user.type(
      within(todoColumn).getByPlaceholderText("Card details"),
      "Cover drag-and-drop and inline column edits."
    );
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(within(todoColumn).getByText("Draft QA plan")).toBeInTheDocument();
    expect(
      within(todoColumn).getByText("Cover drag-and-drop and inline column edits.")
    ).toBeInTheDocument();
    expect(within(todoColumn).getByTestId("column-count-col-todo")).toHaveTextContent("3");
  });

  it("deletes an existing card and updates the column count", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    const backlogColumn = screen.getByTestId("kanban-column-col-backlog");
    expect(within(backlogColumn).getByTestId("column-count-col-backlog")).toHaveTextContent("3");

    await user.click(
      within(backlogColumn).getByRole("button", {
        name: "Delete Audit Q4 onboarding copy",
      })
    );

    expect(
      within(backlogColumn).queryByText("Audit Q4 onboarding copy")
    ).not.toBeInTheDocument();
    expect(within(backlogColumn).getByTestId("column-count-col-backlog")).toHaveTextContent("2");
  });
});
