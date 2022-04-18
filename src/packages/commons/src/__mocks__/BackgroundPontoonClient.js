export class BackgroundPontoonClient {
    constructor() {
        this.getBaseUrl = jest.fn();

        this.getNotificationsUrl = jest.fn();
    
        this.getSettingsUrl = jest.fn();
    
        this.getTeamPageUrl = jest.fn();
    
        this.getTeamProjectUrl = jest.fn();
    
        this.getStringsWithStatusSearchUrl = jest.fn();
    
        this.getSignInURL = jest.fn();
    
        this.updateTeamsList = jest.fn();
    
        this.getTeamFromPontoon = jest.fn();
    
        this.getPontoonProjectForTheCurrentTab = jest.fn();
    
        this.pageLoaded = jest.fn();
    
        this.markAllNotificationsAsRead = jest.fn();
    
        this.subscribeToNotificationsChange = jest.fn();
    
        this.unsubscribeFromNotificationsChange = jest.fn();
    }
}
