//Set Cache Control headers so we don't overload our meteor server with http requests
FS.HTTP.setHeadersForGet([
    ['Cache-Control', 'public, max-age=31536000']
]);

//Create the master store
var masterStore = new FS.Store.FileSystem("master"); 

//Create a large store
var largeStore = new FS.Store.FileSystem("large", {
    //Create the thumbnail as we save to the store.
    transformWrite: function(fileObj, readStream, writeStream) {
        // Use graphicsmagick to create a 1200px image while maintaining the aspect ratio

        gm(readStream, fileObj.name)
            .resize(1200)
            .quality(80).autoOrient().stream().pipe(writeStream);
    }
});

//Create a thumbnail store
var thumbnailStore = new FS.Store.FileSystem("thumbnail", {
    //Create the thumbnail as we save to the store.
    transformWrite: function(fileObj, readStream, writeStream) {
        /* Use graphicsmagick to create a 300x300 square thumbnail at 100% quality,
         * orient according to EXIF data if necessary and then save by piping to the
         * provided writeStream */

        gm(readStream, fileObj.name)
            .size({
                bufferStream: true
            }, Meteor.bindEnvironment(
                function(err, size) {
                    if (!err) {
                        fileObj.update({
                            $set: {
                                'metadata.width': size.width,
                                'metadata.height': size.height
                            }
                        });
                    }
                },
                function(error) {
                    console.log('Error in bindEnvironment:', error);
                }))
            .resize(300, 300, "^").gravity('Center').crop(300, 300)
            .quality(75).autoOrient().stream().pipe(writeStream);
    }
});


//Create globally scoped Images collection.
Images = new FS.Collection("images", {
    stores: [thumbnailStore, largeStore, masterStore],
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

MediaItems = new Meteor.Collection('mediaItems');

MediaItems.allow({
    insert: function(userId, file) {
        return true;
    },
    update: function(userId, file, fields, modifier) {
        return true;
    },
    remove: function(userId, file) {
        return true;
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
        return true;
    },
    download: function() {
        return true;
    }
});




//If we're on the server publish the collection, otherwise we are on the client and we should subscribe to the publication.
if (Meteor.isServer) {

    // TODO: Create a query to return the right stuff for the api call
    HTTP.publish({
        name: 'api/images-list'
    }, function(data) {
        
        // this.userId, this.query, this.params
        return MediaItems.find({});
    });

    Meteor.publish('mediaItems', function() {
        return MediaItems.find({
            'deleted': {
                '$ne': true
            }
        });
    });
    Meteor.publish('images', function() {
        /*Uncomment this and comment out returning the cursor to see publication issue*/

        // var self = this;

        // var handle = Images.find().observe({
        //     added: function (document) {
        //         self.added('images', document._id, document);
        //     },
        //     changed: function (document) {
        //         self.changed('images', document._id, document);
        //     },
        //     removed: function (document) {
        //         self.removed('images', document._id);
        //     }
        // });

        // self.onStop(function () {
        //     handle.stop();
        // });

        /*Comment this out and Uncomment manual publishing to see publication issue*/

        return Images.find();

    });

} else {
    Meteor.subscribe('images');
    Meteor.subscribe('mediaItems');
}