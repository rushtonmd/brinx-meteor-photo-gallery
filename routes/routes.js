Router.configure({
    //layoutTemplate: 'mediaItems',
    loadingTemplate: 'Loading',
    notFoundTemplate: '404'
});

Router.map(function() {
    this.route('mediaItems', {
        path: '/',
        onBeforeAction: function(pause) {
            // render the login template but keep the url in the browser the same
            AccountsEntry.signInRequired(this);

            // Set the size of the page. i.e. how many items to return from the Media Items collection
            Session.set('itemsLimit', Session.get("adminPageSize"));
        },
        waitOn: function() {
            // return one handle, a function, or an array
            var limit = Session.get('itemsLimit') || Session.get('adminPageSize'); 
            return Meteor.subscribe('mediaItems', limit, false);
        }
    });
    this.route('deletedMediaItems', {
        path: '/trash',
        onBeforeAction: function(pause) {
            // render the login template but keep the url in the browser the same
            AccountsEntry.signInRequired(this);

            // Set the size of the page. i.e. how many items to return from the Media Items collection
            Session.set('itemsLimit', Session.get("trashPageSize"));
        },
        waitOn: function() {
            // return one handle, a function, or an array
            var limit = Session.get('itemsLimit') || Session.get('trashPageSize'); 
            return Meteor.subscribe('mediaItems', limit, true);
        }
    });
    this.route('allGalleryMediaItems', {
        path: '/api/media-items',
        where: 'server',
        action: function() {

            // Reject anything but GET request
            if (this.request.method != 'GET') {
                this.response.end("Nope.");
                return 0;
            };

            // GET, POST, PUT, DELETE
            var requestMethod = this.request.method;
            // Data from a POST request
            var requestData = this.request.body;

            var allItems = MediaItems.find({
                'deleted': {
                    '$ne': true
                }
            }, {
                sort: {
                    rank: -1
                }
            }).fetch();
            var returnData = {
                description: "All images for gallery.",
                mediaItems: []
            };
            _.each(allItems, function(mediaItem) {

                var mediaItemDescription = String(mediaItem.description).replace(/(?:\r\n|\r|\n)/g, '<br />');

                var mediaItemFileRecord = Images.findOne(mediaItem.imageID);


                var mediaItemWidth = mediaItemFileRecord.metadata ? mediaItemFileRecord.metadata.width : 1;
                var mediaItemHeight = mediaItemFileRecord.metadata ? mediaItemFileRecord.metadata.height : 1;
                var mediaItemMasterUrl = mediaItemFileRecord.url ? mediaItemFileRecord.url({
                    store: 'master',
                    auth: false
                }) : "";
                var mediaItemThumbnailUrl = mediaItemFileRecord.url ? mediaItemFileRecord.url({
                    store: 'thumbnail',
                    auth: false
                }) : "";

                //var url = mediaItem.file.getFileRecord().url("thumbnail");
                var mItem = {
                    title: mediaItem.title,
                    description: mediaItemDescription,
                    rank: mediaItem.rank,
                    width: mediaItemWidth,
                    height: mediaItemHeight,
                    masterUrl: mediaItemMasterUrl,
                    thumbnailUrl: mediaItemThumbnailUrl
                };
                returnData.mediaItems.push(mItem);
                //console.log(url);
            });


            this.response.statusCode = 200;
            this.response.setHeader("Content-Type", "application/json");
            this.response.setHeader("Access-Control-Allow-Origin", "*");
            this.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            this.response.end(EJSON.stringify(returnData));
        }
    });
    // this.route('404', {
    //     path: '/*'
    // });
});