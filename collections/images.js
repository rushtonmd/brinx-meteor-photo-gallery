
THUMBNAIL_STORE_IMAGE_PATH = ServerSettingsValue('thumbnail_image_file_path') || undefined;
MASTER_STORE_IMAGE_PATH = ServerSettingsValue('master_image_file_path') || undefined;

//Create the master store
var masterStore = new FS.Store.FileSystem("master", {
    path: MASTER_STORE_IMAGE_PATH,

    //Create the thumbnail as we save to the store.
    transformWrite: function(fileObj, readStream, writeStream) {
        readStream.pipe(writeStream);
    }
});

//Create a thumbnail store
var thumbnailStore = new FS.Store.FileSystem("thumbnail", {
    path: THUMBNAIL_STORE_IMAGE_PATH,

    beforeWrite: function(fileObj) {
        // We return an object, which will change the
        // filename extension and type for this store only.
        return {
            extension: 'jpg',
            type: 'image/jpg'
        };
    },

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

        // This is to check whether or not CollectionFS is trying
        // to update the Image
        var validCFSUpdate = _.intersection(fields, ['chunkSize', 'chunkCount', 'chunkSize']).length > 0

        // Only allow logged in users and CollectionFS to update the Image
        return userId && validCFSUpdate;
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