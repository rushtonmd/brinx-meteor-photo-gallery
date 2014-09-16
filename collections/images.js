//Set Cache Control headers so we don't overload our meteor server with http requests
FS.HTTP.setHeadersForGet([
    ['Cache-Control', 'public, max-age=31536000']
    
]);

// Set the base URL for file: http://domain.com/baseURL/files/images/
// I used 'depository' because... well who knows.
FS.HTTP.setBaseUrl('/depository');

//FS.debug = true;


//Create the master store
var masterStore = new FS.Store.FileSystem("master", {
    //path: masterStoreImagePath,

    //Create the thumbnail as we save to the store.
    transformWrite: function(fileObj, readStream, writeStream) {
        readStream.pipe(writeStream);
    }
});

//Create a thumbnail store
var thumbnailStore = new FS.Store.FileSystem("thumbnail", {
    //path: thumbnailStoreImagePath,
    //chunkSize: 1024 * 512

    // TODO: All the numbnails should be in JPG format
    // so I need to convert all of them to .jpg

    //Create the thumbnail as we save to the store.
    transformWrite: function(fileObj, readStream, writeStream) {
        createThumbnailImage(fileObj, readStream, writeStream);
    }
});

//Create globally scoped Images collection.
Images = new FS.Collection("images", {
    stores: [thumbnailStore, masterStore],
    chunkSize: 1024 * 1024, // Set chunk size to 1MB
    filter: {
        maxSize: 52428800, //50mb in bytes
        allow: {
            contentTypes: ['image/*'],
            extensions: ['png', 'jpg', 'jpeg', 'gif', 'tif', 'tiff']
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
        return userId;
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