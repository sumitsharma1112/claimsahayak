import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResumeBanner } from "@/components/wizard/ResumeBanner";

afterEach(cleanup);

const noop = () => undefined;

describe("ResumeBanner", () => {
  it("renders nothing when not visible", () => {
    const { container } = render(
      <ResumeBanner
        visible={false}
        locale="en"
        onResume={noop}
        onStartNew={noop}
        onClearPrevious={noop}
      />,
    );
    expect(container.textContent).toBe("");
  });

  it("renders all three actions and invokes the right callback for each", () => {
    const onResume = vi.fn();
    const onStartNew = vi.fn();
    const onClearPrevious = vi.fn();
    render(
      <ResumeBanner
        visible
        locale="en"
        onResume={onResume}
        onStartNew={onStartNew}
        onClearPrevious={onClearPrevious}
      />,
    );
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByText("Resume previous claim?")).toBeTruthy();

    screen.getByRole("button", { name: "Resume" }).click();
    expect(onResume).toHaveBeenCalledTimes(1);

    screen.getByRole("button", { name: "Start New" }).click();
    expect(onStartNew).toHaveBeenCalledTimes(1);

    screen.getByRole("button", { name: "Clear Previous" }).click();
    expect(onClearPrevious).toHaveBeenCalledTimes(1);
  });
});
