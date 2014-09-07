//Set Cache Control headers so we don't overload our meteor server with http requests
FS.HTTP.setHeadersForGet([
    ['Cache-Control', 'public, max-age=31536000']
]);

// Set the base URL for file: http://domain.com/baseURL/files/images/
// I used 'depository' because... well who knows.
FS.HTTP.setBaseUrl('/depository');


// Helper function to get a value from Meteor.settings
getDefaultSettingsValue = function(key){
	return typeof Meteor.settings != 'undefined' && Meteor.settings[key];
};

// Global value for the path where the images are saved. 
fileStoreImagePath = getDefaultSettingsValue('image_file_path') || "~/uploads/thumbnails";