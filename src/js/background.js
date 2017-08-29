'use-strict';

var options = new Options();
var localeTeamOptionKey = 'options.locale_team';
options.get([localeTeamOptionKey], function(items) {
    var remotePontoon = new RemotePontoon(items[localeTeamOptionKey]);
    var toolbarButton = new ToolbarButton(options, remotePontoon);
});
