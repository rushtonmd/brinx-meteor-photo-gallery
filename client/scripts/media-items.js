Template.mediaItems.events({
    'change #fileInput': function(event) {
        FS.Utility.eachFile(event, function(file) {
            var insertedPhoto = Images.insert(file, function(err, fileObj) {
                //Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
                //var readStream = fileObj.createReadStream('master');
                //SetImageSize(insertedPhoto);
            });
            MediaItems.insert({
                title: insertedPhoto.name(),
                description: '(no description)',
                rank: new Date().getTime(),
                file: insertedPhoto
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

        var mediaID = $("button.save-changes-to-media").attr('media-id');
        var newDescription = $(".modal-body .media-description").val();
        var newTitle = $(".modal-header .media-title").val();
        var newWidth = $("input.image-width").val();
        var newHeight = $("input.image-height").val();

        MediaItems.update({
            "_id": mediaID
        }, {
            $set: {
                "description": newDescription,
                "title": newTitle
            }
        });

        var imageID = MediaItems.findOne({
            "_id": mediaID
        }).file._id;

        Images.update({
            "_id": imageID
        }, {
            $set: {
                'metadata.width': newWidth,
                'metadata.height': newHeight
            }
        });

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
            MediaItems.update({
                "_id": mediaID
            }, {
                $set: {
                    "deleted": true
                }
            });
        });

    }

});

// Template.images.images = function() {
//     return Images.find({}, {
//         sort: {
//             rank: -1
//         }
//     });
// };

Template.mediaItems.mediaItems = function() {
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

// whenever #showMoreResults becomes visible, retrieve more results
function showMoreVisible() {
    var threshold, target = $(".show-more-results");
    if (!target.length) return;
 
    threshold = $(window).scrollTop() + $(window).height() - target.height();
 
    if (target.offset().top < threshold) {
        if (!target.data("visible")) {
            // console.log("target became visible (inside viewable area)");
            target.data("visible", true);
            Session.set("itemsLimit",
                Session.get("itemsLimit") + ITEMS_INCREMENT);
        }
    } else {
        if (target.data("visible")) {
            // console.log("target became invisible (below viewable arae)");
            target.data("visible", false);
        }
    }        
}

// run the above func every time the user scrolls
$(window).scroll(showMoreVisible);


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

            console.log(newRank);
            MediaItems.update(UI.getElementData(el)._id, {
                $set: {
                    rank: newRank
                }
            });
        }
    });
};