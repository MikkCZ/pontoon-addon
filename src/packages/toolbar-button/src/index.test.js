import sinon from "sinon";
import * as optionsModule from "@pontoon-addon/commons/src/Options";

describe("index.js", () => {
  afterEach(() => {
    browser.flush();
  });

  it("renders", async () => {
    const optionsStub = sinon.stub(optionsModule, "Options");
    optionsStub.get = sinon.stub(optionsStub, "get");
    sinon
      .stub(optionsModule.Options, "create")
      .callsFake(async () => optionsStub);
    optionsStub.get.resolves({
      toolbar_button_popup_always_hide_read_notifications: false,
      locale_team: "cs",
    });

    browser.storage.local.get.resolves({
      notificationsData: {},
      teamsList: {
        cs: { name: "Czech", code: "cs", strings: {} },
      },
      latestTeamsActivity: {},
    });

    const reactDomRender = await require(".");
    const rootFragment = await reactDomRender.default;

    expect(rootFragment.constructor.name).toBe("NotificationsList");
    // TODO: check TeamInfo too
  });
});
