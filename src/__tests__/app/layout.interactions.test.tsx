import AppLayout from "@/app/(app)/layout";
import { fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";

const sidebarSpy = jest.fn();
const topBarSpy = jest.fn();

jest.mock("@/components/AuthGuard", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="auth-guard">{children}</div>,
}));

jest.mock("@/components/Sidebar", () => ({
  __esModule: true,
  default: (props: any) => {
    sidebarSpy(props);
    return (
      <div data-testid={props.plain ? "sidebar-plain" : "sidebar-default"}>
        <button onClick={() => props.onCollapse?.(!props.collapsed)} data-testid="sidebar-collapse">
          collapse
        </button>
        <button onClick={() => props.onNavigate?.()} data-testid="sidebar-navigate">
          navigate
        </button>
      </div>
    );
  },
}));

jest.mock("@/components/TopBar", () => ({
  __esModule: true,
  default: (props: any) => {
    topBarSpy(props);
    return (
      <div data-testid="topbar">
        <button onClick={() => props.onOpenMobile?.()} data-testid="topbar-open-mobile">
          open
        </button>
        <button onClick={() => props.onToggleSidebar?.()} data-testid="topbar-toggle-sidebar">
          toggle
        </button>
      </div>
    );
  },
}));

jest.mock("antd", () => ({
  Drawer: ({ children, open, onClose }: any) =>
    open ? (
      <aside data-testid="drawer-open">
        <button onClick={onClose} data-testid="drawer-close">
          close
        </button>
        {children}
      </aside>
    ) : null,
}));

describe("app layout interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("opens mobile drawer, closes drawer and toggles sidebar", () => {
    render(
      <AppLayout>
        <div data-testid="page-child">content</div>
      </AppLayout>,
    );

    expect(screen.getAllByTestId("page-child").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByTestId("topbar-open-mobile")[0]);
    fireEvent.click(screen.getAllByTestId("topbar-open-mobile")[1]);
    expect(screen.getByTestId("drawer-open")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("drawer-close"));
    expect(screen.queryByTestId("drawer-open")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByTestId("topbar-toggle-sidebar")[0]);
    fireEvent.click(screen.getAllByTestId("topbar-toggle-sidebar")[1]);
    fireEvent.click(screen.getAllByTestId("sidebar-collapse")[0]);
    expect(sidebarSpy).toHaveBeenCalled();
    expect(topBarSpy).toHaveBeenCalled();
  });

  it("closes drawer when mobile sidebar navigate callback is triggered", () => {
    render(
      <AppLayout>
        <div>content</div>
      </AppLayout>,
    );

    fireEvent.click(screen.getAllByTestId("topbar-open-mobile")[0]);
    expect(screen.getByTestId("drawer-open")).toBeInTheDocument();
    const drawer = screen.getByTestId("drawer-open");
    fireEvent.click(within(drawer).getByTestId("sidebar-navigate"));
    expect(screen.queryByTestId("drawer-open")).not.toBeInTheDocument();
  });
});
