import PolicyCreatePage from "@/app/(app)/policies/new/page";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";

const pushMock = jest.fn();
const confirmMock = jest.fn();
const toastMock = jest.fn();

const policyFormSpy = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/useI18n", () => ({
  useI18n: () => ({ t: (key: string) => key, locale: "en" }),
}));

jest.mock("@/hooks/useConfirm", () => ({ useConfirm: jest.fn() }));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));

jest.mock("@/components/PolicyForm", () => ({
  __esModule: true,
  default: (props: any) => {
    policyFormSpy(props);
    return (
      <div>
        <button data-testid="cancel" onClick={props.onCancel}>
          cancel
        </button>
        <button data-testid="submit" onClick={() => props.onSubmit()}>
          submit
        </button>
      </div>
    );
  },
}));

describe("PolicyCreatePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useConfirm as jest.Mock).mockReturnValue(confirmMock);
    (useToast as jest.Mock).mockReturnValue(toastMock);
  });

  it("passes expected props to PolicyForm", () => {
    render(<PolicyCreatePage />);

    const firstCallProps = policyFormSpy.mock.calls[0][0];
    expect(firstCallProps.title).toBe("policies.createTitle");
    expect(firstCallProps.initialValues).toEqual({
      name: "",
      type: "TOTP",
      digits: "6",
      stepSeconds: "30",
      window: "1",
      algorithm: "SHA1",
      status: "Draft",
    });
  });

  it("handles cancel action", () => {
    render(<PolicyCreatePage />);
    fireEvent.click(screen.getByTestId("cancel"));
    expect(pushMock).toHaveBeenCalledWith("/policies");
  });

  it("does not navigate or toast when confirm is rejected", async () => {
    confirmMock.mockResolvedValueOnce(false);
    render(<PolicyCreatePage />);

    fireEvent.click(screen.getByTestId("submit"));

    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    expect(toastMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalledWith("/policies");
  });

  it("toasts and navigates when confirm is accepted", async () => {
    confirmMock.mockResolvedValueOnce(true);
    render(<PolicyCreatePage />);

    fireEvent.click(screen.getByTestId("submit"));

    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    expect(toastMock).toHaveBeenCalledWith({ variant: "success", message: "ui.toastSaved" });
    expect(pushMock).toHaveBeenCalledWith("/policies");
  });
});
