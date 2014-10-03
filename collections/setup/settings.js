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
if (Meteor.isServer) {


} else {

    // ClientSettingsValue = function(key) {
    //     return typeof Meteor.settings.public != 'undefined' && Meteor.settings.public[key];
    // };

    // ADMIN_PAGE_SIZE = ClientSettingsValue('admin_page_size');
    // TRASH_PAGE_SIZE = ClientSettingsValue('trash_page_size');
};

ServerSettingsValue = function(key) {
    return typeof Meteor.settings != 'undefined' && Meteor.settings[key];
};

ClientSettingsValue = function(key) {
    return typeof Meteor.settings.public != 'undefined' && Meteor.settings.public[key];
};

// Global value for the path where the images are saved. 
// THUMBNAIL_STORE_IMAGE_PATH = ServerSettingsValue('thumbnail_image_file_path');
// MASTER_STORE_IMAGE_PATH = ServerSettingsValue('master_image_file_path');
// BRINX_SIGNUP_CODE = ServerSettingsValue('brinx_signup_code');