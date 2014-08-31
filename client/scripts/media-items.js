Template.mediaItems.events({
    'change #fileInput': function(event) {

        FS.Utility.eachFile(event, function(file) {

            Images.insert(file, function(err, fileObj) {
                Meteor.call('createMediaItem', fileObj);
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



        console.log("deleting " + mediaID);

        $("div.media-item[media-id='" + mediaID + "']").fadeOut(function() {
            Meteor.call('deleteMediaItem', mediaID);
        });

    }

});


Template.mediaItems.mediaItems = function() {
    // We need to sort on the client side so that the newest item is inserted
    // and shows at the top of the list prior to syncing with the server
    return MediaItems.find({}, {
        sort: {
            rank: -1
        }
    });
};

Template.mediaItem.image = function() {
    //return this.file.getFileRecord();
    return Images.findOne(this.file._id);
};

Template.mediaItems.moreResults = function() {
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
    var threshold, target = $(".show-more-results");
    if (!target.length) return;

    threshold = $(window).scrollTop() + $(window).height();

    if (target.offset().top < threshold) {

        // Increase the number of items returned
        Session.set("itemsLimit", Session.get("itemsLimit") + ITEMS_INCREMENT);
    };

};

SimpleRationalRanks = {
    beforeFirst: function(firstRank) {
        return firstRank + 1;
    },
    between: function(beforeRank, afterRank) {
        return (beforeRank + afterRank) / 2;
    },
    afterLast: function(lastRank) {
        return lastRank - 1;
    }
};

Template.mediaItems.rendered = function() {

    this.$('#media-list').sortable({
        handle: ".handle",
        stop: function(event, ui) { // fired when an item is dropped
            var el = ui.item.get(0),
                before = ui.item.prev().get(0),
                after = ui.item.next().get(0);

            el2 = el;

            var newRank;
            if (!before) { // moving to the top of the list
                newRank = SimpleRationalRanks.beforeFirst(UI.getElementData(after).rank);

            } else if (!after) { // moving to the bottom of the list
                newRank = SimpleRationalRanks.afterLast(UI.getElementData(before).rank);

            } else {
                newRank = SimpleRationalRanks.between(
                    UI.getElementData(before).rank,
                    UI.getElementData(after).rank);
            }

            Meteor.call('setNewOrderOnMediaItem', UI.getElementData(el)._id, newRank);

        }
    });
};