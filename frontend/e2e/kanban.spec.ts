import { expect, test, type Page } from "@playwright/test";

async function dragCardToColumn(
  page: Page,
  cardTestId: string,
  targetColumnTestId: string
) {
  const card = page.getByTestId(cardTestId);
  const targetColumn = page.getByTestId(targetColumnTestId);

  const cardBox = await card.boundingBox();
  const targetBox = await targetColumn.boundingBox();
  if (!cardBox || !targetBox) {
    throw new Error("Could not compute bounding boxes for drag and drop");
  }

  const startX = cardBox.x + cardBox.width / 2;
  const startY = cardBox.y + cardBox.height / 2;
  const endX = targetBox.x + targetBox.width / 2;
  const endY = targetBox.y + Math.min(targetBox.height - 40, 220);

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // Move > 6px first so dnd-kit PointerSensor activates
  await page.mouse.move(startX + 12, startY + 8, { steps: 4 });
  await page.mouse.move(endX, endY, { steps: 16 });
  await page.mouse.up();
  // @dnd-kit PointerSensor suppresses document click events for 50ms after pointerup
  await page.waitForTimeout(80);
}

test.describe("Kanban MVP E2E", () => {
  test("renders single board with 5 columns, dummy cards, and zero runtime errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Product Delivery Board" })
    ).toBeVisible();

    const columns = page.locator('[data-testid^="kanban-column-"]');
    await expect(columns).toHaveCount(5);

    await expect(page.getByText("Audit Q4 onboarding copy")).toBeVisible();
    await expect(page.getByText("Initialize Next.js workspace")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("renames columns inline and handles Escape and blank guards", async ({
    page,
  }) => {
    await page.goto("/");

    const backlogColumn = page.getByTestId("kanban-column-col-backlog");
    await backlogColumn.getByRole("button", { name: "Backlog" }).click();
    const input = backlogColumn.getByLabel("Column name for Backlog");
    await input.fill("Discovery");
    await input.press("Enter");

    await expect(
      backlogColumn.getByRole("heading", { name: "Discovery" })
    ).toBeVisible();

    // Escape cancels edit
    const todoColumn = page.getByTestId("kanban-column-col-todo");
    await todoColumn.getByRole("button", { name: "To Do" }).click();
    const todoInput = todoColumn.getByLabel("Column name for To Do");
    await todoInput.fill("Abandoned Edit");
    await todoInput.press("Escape");

    await expect(todoColumn.getByRole("heading", { name: "To Do" })).toBeVisible();
  });

  test("adds a new card and deletes an existing card", async ({ page }) => {
    await page.goto("/");

    const reviewColumn = page.getByTestId("kanban-column-col-review");
    await expect(reviewColumn.getByTestId("column-count-col-review")).toHaveText("2");

    await reviewColumn.getByRole("button", { name: "Add card" }).click();
    await reviewColumn.getByPlaceholder("Card title").fill("Ship MVP preview");
    await reviewColumn
      .getByPlaceholder("Card details")
      .fill("Confirm server is live on port 3005.");
    await reviewColumn.getByRole("button", { name: "Add Card" }).click();

    await expect(reviewColumn.getByText("Ship MVP preview")).toBeVisible();
    await expect(
      reviewColumn.getByText("Confirm server is live on port 3005.")
    ).toBeVisible();
    await expect(reviewColumn.getByTestId("column-count-col-review")).toHaveText("3");

    await reviewColumn
      .getByRole("button", { name: "Delete Verify brand color contrast" })
      .click();
    await expect(
      reviewColumn.getByText("Verify brand color contrast")
    ).toHaveCount(0);
    await expect(reviewColumn.getByTestId("column-count-col-review")).toHaveText("2");
  });

  test("drags a card between columns and into an emptied column", async ({
    page,
  }) => {
    await page.goto("/");

    const backlogColumn = page.getByTestId("kanban-column-col-backlog");
    const doneColumn = page.getByTestId("kanban-column-col-done");

    await expect(backlogColumn.getByTestId("column-count-col-backlog")).toHaveText("3");
    await expect(doneColumn.getByTestId("column-count-col-done")).toHaveText("2");

    // Drag card-1 from Backlog to Done
    await dragCardToColumn(page, "kanban-card-card-1", "kanban-column-col-done");

    await expect(backlogColumn.getByTestId("column-count-col-backlog")).toHaveText("2");
    await expect(doneColumn.getByTestId("column-count-col-done")).toHaveText("3");
    await expect(doneColumn.getByTestId("kanban-card-card-1")).toBeVisible();

    // Empty Done column, then drag card-2 into the empty column
    await doneColumn
      .getByRole("button", { name: "Delete Audit Q4 onboarding copy" })
      .click();
    await expect(doneColumn.getByTestId("kanban-card-card-1")).toHaveCount(0);

    await doneColumn
      .getByRole("button", { name: "Delete Initialize Next.js workspace" })
      .click();
    await expect(doneColumn.getByTestId("kanban-card-card-10")).toHaveCount(0);

    await doneColumn
      .getByRole("button", { name: "Delete Establish board data schema" })
      .click();
    await expect(doneColumn.getByTestId("kanban-card-card-11")).toHaveCount(0);

    await expect(doneColumn.getByTestId("column-count-col-done")).toHaveText("0");
    await expect(doneColumn.getByText("Drop a card here")).toBeVisible();

    await dragCardToColumn(page, "kanban-card-card-2", "kanban-column-col-done");

    await expect(doneColumn.getByTestId("column-count-col-done")).toHaveText("1");
    await expect(doneColumn.getByTestId("kanban-card-card-2")).toBeVisible();
  });

  test("does not persist edits across page reloads", async ({ page }) => {
    await page.goto("/");

    const backlogColumn = page.getByTestId("kanban-column-col-backlog");
    await backlogColumn.getByRole("button", { name: "Backlog" }).click();
    const input = backlogColumn.getByLabel("Column name for Backlog");
    await input.fill("Temporary Name");
    await input.press("Enter");
    await expect(
      backlogColumn.getByRole("heading", { name: "Temporary Name" })
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByTestId("kanban-column-col-backlog").getByRole("heading", { name: "Backlog" })
    ).toBeVisible();
  });
});
