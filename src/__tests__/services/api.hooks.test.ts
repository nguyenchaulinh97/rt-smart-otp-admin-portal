import { useMutation, useQuery } from "@tanstack/react-query";
import { useApiMutation, useApiQuery } from "@/services/api";

jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

describe("services/api hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("wraps useQuery with expected key and executes queryFn", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ ok: true })),
    }) as any;
    (useQuery as jest.Mock).mockReturnValue({ data: "ok" });

    useApiQuery(["k1"], "/path", { method: "GET" });

    const args = (useQuery as jest.Mock).mock.calls[0][0];
    await expect(args.queryFn()).resolves.toEqual({ ok: true });
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["k1"],
        queryFn: expect.any(Function),
      }),
    );
  });

  it("wraps useMutation with method and executes mutationFn", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ saved: true })),
    }) as any;
    (useMutation as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() });

    useApiMutation("/items", "PATCH");

    const args = (useMutation as jest.Mock).mock.calls[0][0];
    await expect(args.mutationFn({ id: 1 })).resolves.toEqual({ saved: true });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify({ id: 1 }), method: "PATCH" }),
    );
    expect(useMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationFn: expect.any(Function),
      }),
    );
  });

  it("omits body when mutation payload is null", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("{}"),
    }) as any;
    (useMutation as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() });

    useApiMutation("/items", "DELETE");

    const args = (useMutation as jest.Mock).mock.calls[0][0];
    await args.mutationFn(null);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: undefined, method: "DELETE" }),
    );
  });
});
