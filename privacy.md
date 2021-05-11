**Pontoon Add-on**
- **does not** collect any personally identifiable data
- **does not** communicate with its author
- **does** download data from external servers, which are necessary to provide its functionality as described below
- **does** store the download data locally as described below

## Communication with external servers

Pontoon Add-on communicates with the selected Pontoon server (default is pontoon.mozilla.org for Mozilla projects). To provide its functionality, Pontoon Add-on requires access to authentication cookies issued by the selected Pontoon server. In case authentication is required, such cookies are sent by Pontoon Add-on along its HTTPS requests to the selected Pontoon server.

When communicating with the selected Pontoon server, Pontoon Add-on adds `utm_source` parameter to the URL addresses, with a generic value common to all users to distinguish the automatically generated traffic.

Apart from the selected Pontoon server, Pontoon Add-on downloads data from the following servers in non-identifiable manner:
- flod.org

More detailed information about the data downloaded by Pontoon Add-on can be found on the [Data sources](Data) page. You are also welcome to read the [terms and policies](https://pontoon.mozilla.org/terms/) of the default Pontoon server.

## Storing data

Pontoon Add-on fetches data from the selected Pontoon server and other servers mentioned above. To limit communication with the servers, the data are stored (cached) locally inside the designated browser storage. These data are only used to present them or provide the related functionality for the user and they never leave your browser.

## Requested permissions

- Access your data for all websites & Access browser tabs: to download data from the selected Pontoon server and to display contextual information on localizable Mozilla websites
- Display notifications to you: to display notifications from the selected Pontoon server
