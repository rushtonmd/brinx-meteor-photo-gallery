

// Helper function to get a value from Meteor.settings
getDefaultSettingsValue = function(key){
	return typeof Meteor.settings != 'undefined' && Meteor.settings[key];
};

// Global value for the path where the images are saved. 
thumbnailStoreImagePath = getDefaultSettingsValue('thumbnail_image_file_path');
masterStoreImagePath = getDefaultSettingsValue('master_image_file_path');