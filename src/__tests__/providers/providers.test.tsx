import AppProviders from "@/providers/AppProviders";
import LanguageProvider, { LanguageContext } from "@/providers/LanguageProvider";
import ThemeProvider, { ThemeContext } from "@/providers/ThemeProvider";
import UiProvider from "@/providers/UiProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React, { useContext } from "react";

describe("providers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("ThemeProvider resolves initial theme from storage and toggles", async () => {
    localStorage.setItem("ui:theme", "dark");

    function Probe() {
      const ctx = useContext(ThemeContext);
      if (!ctx) return null;
      return (
        <button onClick={ctx.toggleTheme} data-testid="toggle-theme">
          {ctx.theme}
        </button>
      );
    }

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("toggle-theme")).toHaveTextContent("dark");
    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark"),
    );

    fireEvent.click(screen.getByTestId("toggle-theme"));
    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-theme")).toBe("light"),
    );
  });

  it("ThemeProvider resolves dark theme from matchMedia and setTheme works", async () => {
    localStorage.removeItem("ui:theme");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation(() => ({ matches: true })),
    });

    function Probe() {
      const ctx = useContext(ThemeContext);
      if (!ctx) return null;
      return (
        <div>
          <span data-testid="theme-value">{ctx.theme}</span>
          <button data-testid="set-light" onClick={() => ctx.setTheme("light")}>
            set-light
          </button>
        </div>
      );
    }

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
    fireEvent.click(screen.getByTestId("set-light"));
    await waitFor(() => expect(screen.getByTestId("theme-value")).toHaveTextContent("light"));
  });

  it("LanguageProvider reads locale and updates t()/setLocale", async () => {
    Object.defineProperty(window.navigator, "language", {
      value: "vi-VN",
      configurable: true,
    });

    function Probe() {
      const ctx = useContext(LanguageContext);
      if (!ctx) return null;
      return (
        <div>
          <span data-testid="locale">{ctx.locale}</span>
          <span data-testid="translated">{ctx.t("login.title")}</span>
          <span data-testid="translated-fallback">{ctx.t("unknown.key")}</span>
          <button onClick={() => ctx.setLocale("en")} data-testid="set-en">
            set
          </button>
        </div>
      );
    }

    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    expect(screen.getByTestId("locale")).toHaveTextContent("vi");
    expect(screen.getByTestId("translated").textContent).not.toBe("login.title");
    expect(screen.getByTestId("translated-fallback")).toHaveTextContent("unknown.key");

    fireEvent.click(screen.getByTestId("set-en"));
    await waitFor(() => expect(localStorage.getItem("admin:locale")).toBe("en"));
  });

  it("UiProvider exposes toast and confirm actions", async () => {
    function Probe() {
      const toast = useToast();
      const confirm = useConfirm();
      return (
        <div>
          <button
            data-testid="show-toast"
            onClick={() => toast({ variant: "success", message: "saved", title: "ok" })}
          >
            toast
          </button>
          <button
            data-testid="ask-confirm"
            onClick={async () => {
              await confirm({ message: "continue?" });
            }}
          >
            confirm
          </button>
        </div>
      );
    }

    render(
      <ThemeProvider>
        <LanguageProvider>
          <UiProvider>
            <Probe />
          </UiProvider>
        </LanguageProvider>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByTestId("show-toast"));
    expect(screen.getByText("saved")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("ask-confirm"));
    expect(screen.getByText("continue?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Xác nhận|ui.confirm/i }));
  });

  it("UiProvider handles toast without title and confirm cancel path", async () => {
    function Probe() {
      const toast = useToast();
      const confirm = useConfirm();
      return (
        <div>
          <button
            data-testid="show-info-toast"
            onClick={() => toast({ variant: "info", message: "just-info" })}
          >
            toast
          </button>
          <button
            data-testid="ask-cancel"
            onClick={async () => {
              await confirm({
                title: "Delete",
                message: "sure?",
                cancelLabel: "No",
                confirmLabel: "Yes",
                variant: "danger",
              });
            }}
          >
            confirm
          </button>
        </div>
      );
    }

    render(
      <ThemeProvider>
        <LanguageProvider>
          <UiProvider>
            <Probe />
          </UiProvider>
        </LanguageProvider>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByTestId("show-info-toast"));
    expect(screen.getByText("just-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("ask-cancel"));
    expect(screen.getByText("sure?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "No" }));
    await waitFor(() => expect(screen.queryByText("sure?")).not.toBeInTheDocument());
  });

  it("AppProviders renders child tree", () => {
    render(
      <AppProviders>
        <div data-testid="app-providers-child">ok</div>
      </AppProviders>,
    );

    expect(screen.getByTestId("app-providers-child")).toBeInTheDocument();
  });

  it("LanguageProvider handles storage event updates", async () => {
    localStorage.setItem("admin:locale", "en");

    function Probe() {
      const ctx = useContext(LanguageContext);
      if (!ctx) return null;
      return <span data-testid="locale-live">{ctx.locale}</span>;
    }

    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    expect(screen.getByTestId("locale-live")).toHaveTextContent("en");
    act(() => {
      localStorage.setItem("admin:locale", "vi");
      window.dispatchEvent(new Event("storage"));
    });
    await waitFor(() => expect(screen.getByTestId("locale-live")).toHaveTextContent("vi"));
  });
});
