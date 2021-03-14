import sinon from "sinon";
import * as optionsModule from "@pontoon-addon/commons/src/Options";

describe("index.js", () => {
  it("renders", async () => {
    const optionsStub = sinon.stub(optionsModule, "Options");
    sinon
      .stub(optionsModule.Options, "create")
      .callsFake(async () => optionsStub);

    const reactDomRender = await require(".");
    const panelSection = await reactDomRender.default;

    expect(panelSection.constructor.name).toBe("TourPage");
  });
});
