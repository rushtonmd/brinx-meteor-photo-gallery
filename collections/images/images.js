

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


// After the thumbnail image is stored, add the height and width to the metadata
Images.on("stored", Meteor.bindEnvironment(function(f, s) {
    if (s == 'thumbnail') setImageMetaSize(f, s);
}, function(e) {
    console.log('Failed to bind environment:' + e);
}));


// Only allow Insert for logged in users, deny everything else.
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