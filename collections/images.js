//Set Cache Control headers so we don't overload our meteor server with http requests
FS.HTTP.setHeadersForGet([
    ['Cache-Control', 'public, max-age=31536000']
]);

//Create the master store
var masterStore = new FS.Store.FileSystem("master", {
    path: "~/uploads/master"
});

//Create a thumbnail store
var thumbnailStore = new FS.Store.FileSystem("thumbnail", {
    path: "~/uploads/thumbnails",
    //Create the thumbnail as we save to the store.
    transformWrite: function(fileObj, readStream, writeStream) {
        /* Use graphicsmagick to create a 300x300 square thumbnail at 100% quality,
         * orient according to EXIF data if necessary and then save by piping to the
         * provided writeStream */
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



Images.on("stored", Meteor.bindEnvironment(function(f, s) {
    if (s == 'thumbnail') setImageMetaSize(f, s);
}, function(e) {
    console.log('Failed to bind environment:' + e);
}));



MediaItems = new Meteor.Collection('mediaItems');

MediaItems.allow({
    insert: function(userId, file) {
        return true;
    },
    update: function(userId, file, fields, modifier) {
        return true;
    },
    remove: function(userId, file) {
        return false;
    }
});


//Use allow to control insert, update, remove and download. In this case we will just allow them all.
Images.allow({
    insert: function(userId, file) {
        return true;
    },
    update: function(userId, file, fields, modifier) {
        return true;
    },
    remove: function(userId, file) {
        return false;
    },
    download: function() {
        return true;
    }
});



//If we're on the server publish the collection, otherwise we are on the client and we should subscribe to the publication.
if (Meteor.isServer) {

    Meteor.publish('mediaItems', function(limit) {
        return MediaItems.find({}, {
            'limit': limit,
            'sort': {
                rank: -1
            },
            'deleted': {
                '$ne': true
            }
        });
    });

    Meteor.publish('images', function() {
        return Images.find();
    });

} else {
    Meteor.subscribe('images');

    ITEMS_INCREMENT = 15;
    Session.setDefault('itemsLimit', ITEMS_INCREMENT);
    Deps.autorun(function() {
        Meteor.subscribe('mediaItems', Session.get('itemsLimit'));
    });

    // Template.infiniteExample.items = function() {
    //     return items.find();
    // }
}