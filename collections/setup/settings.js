//Set Cache Control headers so we don't overload our meteor server with http requests
FS.HTTP.setHeadersForGet([
    ['Cache-Control', 'public, max-age=31536000']

]);

// Set the base URL for file: http://domain.com/baseURL/files/images/
// I used 'depository' because... well who knows.
FS.HTTP.setBaseUrl('/depository');

// Set the FS.debug flag to true for verbose console output
//FS.debug = true;

// Helper function to get a value from Meteor.settings

ServerSettingsValue = function(key) {
    return typeof Meteor.settings != 'undefined' && Meteor.settings[key];
};

ClientSettingsValue = function(key) {
    return typeof Meteor.settings != 'undefined' && Meteor.settings.public[key];
};

