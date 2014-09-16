// database migrations
Migrations = new Meteor.Collection('migrations');

Meteor.startup(function() {
    if (!Migrations.findOne({
        name: "storeFileIDInsteadOfEJSONObject"
    })) {
    	console.log("Running migration to set the imageID of all MediaItems.")
        MediaItems.find().forEach(function(mediaItem) {
            if (mediaItem.file && mediaItem.file.getFileRecord()) {

                // Update mediaItem.imageID with the ID of
                // the file._id
                var fileID = mediaItem.file.getFileRecord()._id;

                console.log('UPDATING: ' + mediaItem.title + " : " + fileID);

                MediaItems.update(mediaItem._id, {
                    $set: {
                        imageID: fileID
                    }
                });
            };


        });
        Migrations.insert({
            name: "storeFileIDInsteadOfEJSONObject"
        });
    }
});