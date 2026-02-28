import { downloadCsv } from "@/lib/csv";

describe("downloadCsv", () => {
  const createObjectURL = jest.fn(() => "blob:test");
  const revokeObjectURL = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global.URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(global.URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
  });

  it("does nothing for empty rows", () => {
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click");

    downloadCsv("empty.csv", []);

    expect(createObjectURL).not.toHaveBeenCalled();
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("creates and clicks download link for rows", () => {
    const appendSpy = jest.spyOn(document.body, "appendChild");
    const removeSpy = jest.spyOn(document.body, "removeChild");
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click");

    downloadCsv("report.csv", [
      { id: 1, name: 'A "quoted" value' },
      { id: 2, name: "Beta" },
    ]);

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});
