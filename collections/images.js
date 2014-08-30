//Set Cache Control headers so we don't overload our meteor server with http requests
FS.HTTP.setHeadersForGet([
    ['Cache-Control', 'public, max-age=31536000']
]);

//Create the master store
var masterStore = new FS.Store.FileSystem("master", {
    path: "~/uploads/thumbnails"
});

//Create a thumbnail store
var thumbnailStore = new FS.Store.FileSystem("thumbnail", {
    path: "~/uploads/thumbnails",

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



Images.on("stored", Meteor.bindEnvironment(function(f, s) {
    if (s == 'thumbnail') setImageMetaSize(f, s);
}, function(e) {
    console.log('Failed to bind environment:' + e);
}));



MediaItems = new Meteor.Collection('mediaItems');

MediaItems.allow({
    insert: function(userId, file) {
        return false;
    },
    update: function(userId, file, fields, modifier) {
        return false;
    },
    remove: function(userId, file) {
        return false;
    }
});


//Use allow to control insert, update, remove and download. In this case we will just allow them all.
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

//If we're on the server publish the collection, otherwise we are on the client and we should subscribe to the publication.
if (Meteor.isServer) {

    Meteor.methods({
        // options should include: title, description, x, y, public
        createMediaItem: function(imageFile) {

            // Ensure user is logged in 
            if (!this.userId) return;


            MediaItems.insert({
                title: imageFile.getFileRecord().name(),
                description: '(no description)',
                rank: new Date().getTime(),
                file: imageFile
            });
        },

        updateMediaItem: function(options) {

            // Ensure user is logged in 
            if (!this.userId) return;

            MediaItems.update({
                "_id": options.mediaID
            }, {
                $set: {
                    "description": options.newDescription,
                    "title": options.newTitle
                }
            });

            var imageID = MediaItems.findOne({
                "_id": options.mediaID
            }).file._id;

            Images.update({
                "_id": imageID
            }, {
                $set: {
                    'metadata.width': options.newWidth,
                    'metadata.height': options.newHeight
                }
            });
        },


        deleteMediaItem: function(mediaID) {

            // Ensure user is logged in 
            if (!this.userId) return;

            MediaItems.update({
                "_id": mediaID
            }, {
                $set: {
                    "deleted": true
                }
            });
        },

        setNewOrderOnMediaItem: function(mediaID, newRank) {

            // Ensure user is logged in 
            if (!this.userId) return;

            MediaItems.update(mediaID, {
                $set: {
                    rank: newRank
                }
            });
        }
    });

    Meteor.publish('mediaItems', function(limit) {
        return MediaItems.find({
            'deleted': {
                '$ne': true
            }
        }, {
            'limit': limit,
            'sort': {
                rank: -1
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

}