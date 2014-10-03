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

//If we're on the server publish the collection, otherwise we are on the client and we should subscribe to the publication.
if (Meteor.isServer) {

    Meteor.methods({
        // Create a new media item with an image file ID 
        createMediaItem: function(imageFile) {

            // Ensure user is logged in 
            if (!this.userId) return;
 
            
            MediaItems.insert({
                title: imageFile.name,
                description: '(no description)',
                rank: new Date().getTime(),
                imageID: imageFile._id
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
            }).imageID;

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

    // Publish the MediaItems to the client
    // limit [integer]: the number of items to return from the request (for pagination)
    // isDeleted [boolean]: 
    //          true: return items that have been marked as DELETED in the database
    //          false: return items that have not bee marked as DELETED
    //  
    Meteor.publish('mediaItems', function(limit, isDeleted) {
        console.log("LOG" + " : " + limit + " : " + isDeleted);
        return MediaItems.find({
            'deleted': {
                '$exists': isDeleted
            }
        }, {
            'limit': limit,
            'sort': {
                rank: -1
            }
        });
    });


} else {

    var adminPageSize = ClientSettingsValue('admin_page_size') || 5;
    var trashPageSize = ClientSettingsValue('trash_page_size') || 5;

    // Set the default values for the page sizes
    Session.setDefault('adminPageSize', adminPageSize);
    Session.setDefault('trashPageSize', trashPageSize);

}
