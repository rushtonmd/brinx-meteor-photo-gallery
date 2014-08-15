UI.body.events({
    'change #fileInput': function(event) {
        FS.Utility.eachFile(event, function(file) {
            var insertedPhoto = Images.insert(file, function(err, fileObj) {
                //Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
                //var readStream = fileObj.createReadStream('master');
            });
            MediaItems.insert({
                title: insertedPhoto.name(),
                description: '(no description)',
                rank: new Date().getTime(),
                file: insertedPhoto
            });

        });

    },

    'click .save-changes-to-media': function(event) {

        var mediaID = $("button.save-changes-to-media").attr('media-id');
        var newDescription = $(".modal-body .media-description").val();
        var newTitle = $(".modal-header .media-title").val();


        console.log(newTitle);
        MediaItems.update({
            "_id": mediaID
        }, {
            $set: {
                "description": newDescription,
                "title": newTitle
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
        $(".modal-body span.height-width").html(metaWidth + " x " + metaHeight);
        console.log("w" + metaWidth);
    },

    'click .delete-image': function(event) {
        var mediaID = $(event.currentTarget).attr('media-id');
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

Template.images.images = function() {
    return Images.find({}, {
        sort: {
            rank: -1
        }
    });
};

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