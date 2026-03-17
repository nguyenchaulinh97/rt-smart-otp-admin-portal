import { applicationService } from "@/services/applicationService";
import { request } from "@/services/http";

jest.mock("@/services/http", () => ({
  request: jest.fn(),
}));

describe("applicationService", () => {
  beforeEach(() => {
    (request as jest.Mock).mockReset();
  });

  it("builds correct list URL", async () => {
    await applicationService.list(50, 0);
    expect(request).toHaveBeenCalledWith("/application?limit=50&offset=0");
  });

  it("encodes IDs", async () => {
    await applicationService.get("id/with/slash");
    expect(request).toHaveBeenCalledWith("/application/id%2Fwith%2Fslash");
  });

  it("sends create/update/delete correctly", async () => {
    await applicationService.create({ version: "1.0.0", aid_type: "web", status: "active" });
    await applicationService.update("x", { status: "inactive" });
    await applicationService.remove("x");

    expect(request).toHaveBeenNthCalledWith(
      1,
      "/application",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ version: "1.0.0", aid_type: "web", status: "active" }),
      }),
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      "/application/x",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ status: "inactive" }) }),
    );
    expect(request).toHaveBeenNthCalledWith(
      3,
      "/application/x",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
