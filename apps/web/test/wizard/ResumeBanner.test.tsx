import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResumeBanner } from "@/components/wizard/ResumeBanner";

afterEach(cleanup);

describe("ResumeBanner", () => {
  it("renders nothing when not visible", () => {
    const { container } = render(
      <ResumeBanner visible={false} locale="en" onResume={() => undefined} />,
    );
    expect(container.textContent).toBe("");
  });

  it("renders the banner and invokes onResume when visible", () => {
    const onResume = vi.fn();
    render(<ResumeBanner visible locale="en" onResume={onResume} />);
    expect(screen.getByRole("status")).toBeTruthy();
    screen.getByRole("button", { name: "Continue where you left off" }).click();
    expect(onResume).toHaveBeenCalledTimes(1);
  });
});
