Router.map(function() {
    // this.route('gallery', {
    //     path: '/',
    //     onBeforeAction: function(pause) {
    //         brinx.retrieveImagesListAPI();
    //         brinx.startScrolling();
    //     }
    // });
    this.route('mediaItems', {
        path: '/',
        onBeforeAction: function(pause) {
            // render the login template but keep the url in the browser the same
            AccountsEntry.signInRequired(this);
            brinx.stopScrolling();
        }
    });
    this.route('methodExample', { //TODO Add allow methods of GET only : Access-Control-Allow-Methods : if(this.request.method == 'GET') {
        path: '/api/media-items',
        where: 'server',
        action: function() {
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
            	var mediaItemFileRecord = mediaItem.file ? mediaItem.file.getFileRecord() : {};
            	var mediaItemWidth = mediaItemFileRecord.metadata ? mediaItemFileRecord.metadata.width : 1;
            	var mediaItemHeight = mediaItemFileRecord.metadata ? mediaItemFileRecord.metadata.height : 1;
            	var mediaItemMasterUrl = mediaItemFileRecord.url ? mediaItemFileRecord.url({store: 'master', auth:false}) : "";
            	var mediaItemThumbnailUrl = mediaItemFileRecord.url ? mediaItemFileRecord.url({store: 'thumbnail', auth:false}) : "";

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
    this.route('404', {
        path: '/*'
    });
});