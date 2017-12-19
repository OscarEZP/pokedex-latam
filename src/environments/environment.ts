export const environment = {
    production: false,
    envName: 'staging',
    apiUrl: 'https://staging.moc.maintenix.aero',
    paths: {
        confirmForgotPassword: '/api/security/users/_confirmforgotpassword',
        contingencyList: '/api/v1/contingencies',
        dateTime: '/api/security/currentdatetime',
        forgotPassword: '/api/security/users/_forgotpassword',
        login: '/api/security/users/_login',
        safetyEvent: '/api/v1/contingencies/configurations/safetyEvents',
        aircrafts: '/api/v1/contingencies/configurations/aircrafts',
        flights: '/api/v1/contingencies/configurations/flights',
        locations: '/api/v1/contingencies/configurations/locations',
        types: '/api/v1/contingencies/configurations/types',
        close: '/api/v1/contingencies/_close',
        followUp: '/api/v1/contingencies/_followUp',
    }
};
