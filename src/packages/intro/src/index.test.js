import ReactDOM from "react-dom";
import sinon from "sinon";

import * as optionsModule from "@pontoon-addon/commons/src/Options";

const reactDomRender = jest.spyOn(ReactDOM, "render");

describe("index.js", () => {
  it("renders", async () => {
    const optionsStub = sinon.stub(optionsModule, "Options");
    sinon
      .stub(optionsModule.Options, "create")
      .callsFake(async () => optionsStub);

    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);

    await require(".");

    expect(reactDomRender).toHaveBeenCalledTimes(1);
    expect(reactDomRender.mock.calls[0][1]).toBe(rootDiv);
  });
});
