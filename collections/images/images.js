//Set Cache Control headers so we don't overload our meteor server with http requests
FS.HTTP.setHeadersForGet([
    ['Cache-Control', 'public, max-age=31536000']
    
]);

// Set the base URL for file: http://domain.com/baseURL/files/images/
// I used 'depository' because... well who knows.
FS.HTTP.setBaseUrl('/depository');


//Create the master store
var masterStore = new FS.Store.FileSystem("master", {
    path: fileStoreImagePath
});

//Create a thumbnail store
var thumbnailStore = new FS.Store.FileSystem("thumbnail", {
    path: fileStoreImagePath,

    //Create the thumbnail as we save to the store.
    transformWrite: function(fileObj, readStream, writeStream) {
        createThumbnailImage(fileObj, readStream, writeStream);
    }
});


//Create globally scoped Images collection.
Images = new FS.Collection("images", {
    stores: [thumbnailStore, masterStore],
    filter: {
        maxSize: 50331648, //in bytes
        allow: {
            contentTypes: ['image/*'],
            extensions: ['png', 'jpg', 'jpeg', 'gif']
        },
        onInvalid: function(message) {
            if (Meteor.isClient) {
                alert(message);
            } else {
                console.warn(message);
            }
        }
    }
});


// Only allow inserting of images from a logged in user
Images.allow({
    insert: function(userId, file) {
        return userId;
    },
    update: function(userId, file, fields, modifier) {
        return false;
    },
    remove: function(userId, file) {
        return false;
    },
    download: function() {
        return true;
    }
});

// Publish and subscribe to Images
if (Meteor.isServer) {

    Meteor.publish('images', function() {
        return Images.find();
    });

} else {
    Meteor.subscribe('images');

}