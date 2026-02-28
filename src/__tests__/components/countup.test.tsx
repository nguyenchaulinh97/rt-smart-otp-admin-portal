import CountUp from "@/components/CountUp";
import { render, screen, waitFor } from "@testing-library/react";

describe("CountUp", () => {
  const originalRaf = global.requestAnimationFrame;
  const originalCancel = global.cancelAnimationFrame;

  beforeEach(() => {
    jest.useFakeTimers();
    let tick = 0;
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      tick += 100;
      setTimeout(() => cb(tick), 0);
      return tick;
    }) as typeof requestAnimationFrame;
    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    global.requestAnimationFrame = originalRaf;
    global.cancelAnimationFrame = originalCancel;
  });

  it("animates numeric value and supports format callback", async () => {
    render(<CountUp end={100} duration={200} format={(v) => `v:${v}`} />);
    jest.runAllTimers();
    await waitFor(() => expect(screen.getByText("v:100")).toBeInTheDocument());
  });

  it("handles string end value and keeps formatted output", async () => {
    render(<CountUp end="1,000" duration={200} />);
    jest.runAllTimers();
    await waitFor(() => expect(screen.getByText("1,000")).toBeInTheDocument());
  });
});
