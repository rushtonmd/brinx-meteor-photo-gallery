

// Helper function to get a value from Meteor.settings
getDefaultSettingsValue = function(key){
	return typeof Meteor.settings != 'undefined' && Meteor.settings[key];
};

// Global value for the path where the images are saved. 
fileStoreImagePath = getDefaultSettingsValue('image_file_path') || "~/uploads/thumbnails";