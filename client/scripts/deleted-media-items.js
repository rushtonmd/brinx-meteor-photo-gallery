Template.deletedMediaItems.events({
    'change #fileInput': function(event, template) {

        FS.Utility.eachFile(event, function(file) {
            Images.insert(file, function(err, fileObj) {
                if (err) throw err;
                Meteor.call('createMediaItem', {
                    name: fileObj.name(),
                    _id: fileObj._id
                });
            });
        });

    },

    'click .flip-dimensions': function(event) {
        var newWidth = $("input.image-width").val();
        var newHeight = $("input.image-height").val();

        $("input.image-width").val(newHeight);
        $("input.image-height").val(newWidth);
    },

    'click .save-changes-to-media': function(event) {

        var options = {};
        options.mediaID = $("button.save-changes-to-media").attr('media-id');
        options.newDescription = $(".modal-body .media-description").val();
        options.newTitle = $(".modal-header .media-title").val();
        options.newWidth = $("input.image-width").val();
        options.newHeight = $("input.image-height").val();

        Meteor.call('updateMediaItem', options);

        $('#myModal').modal('hide');
    },

    'click .edit-image': function(event) {
        var mediaID = $(event.currentTarget).attr('media-id');
        $("button.save-changes-to-media").attr('media-id', mediaID);
        var newTitle = $("div.media-item[media-id='" + mediaID + "']").find(".media-heading").html();
        $(".modal-header .media-title").val(newTitle);
        var newBody = $("div.media-item[media-id='" + mediaID + "']").find(".media-body p").html();
        $(".modal-body .media-description").val(newBody);
        var thumbnailSource = $("div.media-item[media-id='" + mediaID + "']").find("div.thumbnail").attr('thumbnail_src');
        $(".modal-body img.media-object").attr('src', thumbnailSource);
        var masterSource = $("div.media-item[media-id='" + mediaID + "']").find("div.thumbnail").attr('full_size_src');
        $(".modal-body a.media-object").attr('href', masterSource);
        var metaWidth = $("div.media-item[media-id='" + mediaID + "']").find("div.thumbnail").attr('meta_width');
        var metaHeight = $("div.media-item[media-id='" + mediaID + "']").find("div.thumbnail").attr('meta_height');
        /* $(".modal-body span.height-width").html(metaWidth + " x " + metaHeight);*/
        $("input.image-width").val(metaWidth);
        $("input.image-height").val(metaHeight);

    },

    'click .delete-image': function(event) {
        var mediaID = $(event.currentTarget).attr('media-id');
        $("button.delete-media-item").attr('media-id', mediaID);

        var newTitle = $("div.media-item[media-id='" + mediaID + "']").find(".media-heading").html();

        $("#deleteModalLabel span").html(newTitle);

    },

    'click .delete-media-item': function(event) {
        // Get the media ID
        var mediaID = $(event.currentTarget).attr('media-id');

        $("div.media-item[media-id='" + mediaID + "']").fadeOut(function() {
            Meteor.call('deleteMediaItem', mediaID);
        });

    }

});

Template.deletedMediaItem.helpers({
    thumbnailReady: function() {
        // Determine if the thumbnail has indeed been fully created
        return this.isUploaded() && this.url({
            store: 'thumbnail'
        }) && (typeof this.metadata != 'undefined') && this.metadata.finishedProcessing;
    },
});


Template.deletedMediaItems.created = function() {
    Meteor.Loader.loadJs("/external-libraries/jquery.ui.touch-punch.min.js");
};


Template.deletedMediaItems.deletedMediaItems = function() {
    var limit = Session.get('itemsLimit');
    return MediaItems.find({
        'deleted': {
            '$exists': true
        }
    }, {
        'limit': limit,
        'sort': {
            rank: -1
        }
    });
};

Template.deletedMediaItem.image = function() {
    // backwards compatability 
    var fileID = this.imageID || this.file._id;
    return Images.findOne(fileID);
};

Template.deletedMediaItems.moreResults = function() {
    // If, once the subscription is ready, we have less rows than we
    // asked for, we've got all the rows in the collection.
    return !(MediaItems.find().count() < Session.get("itemsLimit"));
}


// Every 3 seconds, see if more items need to be loaded.
// We could do this based on scroll, but for mobile browsers it doesn't work so hawt.
$(function() {
    setInterval(function() {
        showMoreVisible();
    }, 3000);
});

// whenever #showMoreResults becomes visible, retrieve more results
function showMoreVisible() {
    var threshold, target = $(".show-more-deleted-results");
    if (!target.length) return;

    threshold = $(window).scrollTop() + $(window).height();

    if (target.offset().top < threshold) {

         var newLimit = Session.get("itemsLimit") + Session.get("trashPageSize");

        // Increase the number of items returned
        Session.set("itemsLimit", newLimit);
    };

};