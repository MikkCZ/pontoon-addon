'use-strict';

var options = new Options();
var remotePontoon = new RemotePontoon();
var toolbarButton = new ToolbarButton(options, remotePontoon);
toolbarButton.init();