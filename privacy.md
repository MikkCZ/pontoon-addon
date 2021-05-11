**Pontoon Add-on**:

- **Does not** collect any personally identifiable data.
- **Does not** communicate with its author.
- **Does** download data from external servers, which are necessary to provide its functionality as described below.
- **Does** store the download data locally as described below.

## Communication with external servers

Pontoon Add-on communicates with the selected Pontoon server (default is pontoon.mozilla.org for Mozilla projects). To provide its functionality, Pontoon Add-on requires access to authentication cookies issued by the selected Pontoon server. In case authentication is required, such cookies are sent by Pontoon Add-on along its HTTPS requests to the selected Pontoon server.

When communicating with the selected Pontoon server, Pontoon Add-on adds `utm_source` parameters to the URL addresses, with a generic value common to all users to distinguish automatically generated traffic.

Apart from the selected Pontoon server, Pontoon Add-on downloads data from the following servers in non-identifiable manner:

- flod.org

More detailed information about the data downloaded by Pontoon Add-on can be found on the [Data sources](https://github.com/MikkCZ/pontoon-addon/wiki/Data) page. You are also welcome to read the [terms and policies](https://pontoon.mozilla.org/terms/) of the default Pontoon server.

## Storing data

Pontoon Add-on fetches data from the selected Pontoon server and other servers mentioned above. To limit communication with the server, data is stored (cached) locally inside the designated browser storage. This data is only used for presentation purposes or to provide the related functionality to the user, and never leaves your browser.

## Requested permissions

- *Access your data for all websites* & *Access browser tabs*: to download data from the selected Pontoon server and to display contextual information on localizable Mozilla websites.
- *Display notifications to you*: to display notifications from the selected Pontoon server.
