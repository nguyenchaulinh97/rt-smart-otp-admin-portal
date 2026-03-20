import { adminService } from "@/services/adminService";
import { request } from "@/services/http";

jest.mock("@/services/http", () => ({
  request: jest.fn(),
}));

describe("adminService", () => {
  beforeEach(() => {
    (request as jest.Mock).mockReset();
  });

  it("builds correct list URL", async () => {
    await adminService.list(20, 10);
    expect(request).toHaveBeenCalledWith("/admin?limit=20&offset=10");
  });

  it("encodes IDs and usernames", async () => {
    await adminService.get("a/b");
    await adminService.getByUsername("name with space");
    expect(request).toHaveBeenNthCalledWith(1, "/admin/a%2Fb");
    expect(request).toHaveBeenNthCalledWith(2, "/admin/username/name%20with%20space");
  });

  it("sends create/update/delete correctly", async () => {
    await adminService.create({ username: "u", password: "p", created_by: "system" });
    await adminService.update("1", { password: "new" });
    await adminService.remove("1");

    expect(request).toHaveBeenNthCalledWith(
      1,
      "/admin",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "u", password: "p", created_by: "system" }),
      }),
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      "/admin/1",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ password: "new" }) }),
    );
    expect(request).toHaveBeenNthCalledWith(
      3,
      "/admin/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
