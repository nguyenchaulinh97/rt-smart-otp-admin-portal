import { STATUS_LABEL_KEYS } from "@/constants/status";

describe("constants/status", () => {
  it("maps known statuses to translation keys", () => {
    expect(STATUS_LABEL_KEYS.Active).toBe("status.active");
    expect(STATUS_LABEL_KEYS.Locked).toBe("status.locked");
    expect(STATUS_LABEL_KEYS.SUCCESS).toBe("status.success");
    expect(STATUS_LABEL_KEYS.FAIL).toBe("status.fail");
  });
});
