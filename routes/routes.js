Router.map(function() {
    this.route('gallery', {
        path: '/'
    });
    this.route('mediaItems', {
        path: '/admin'
    });
    this.route('methodExample', {
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

                //var url = mediaItem.file.getFileRecord().url("thumbnail");
                var mItem = {
                    title: mediaItem.title,
                    description: mediaItem.description,
                    rank: mediaItem.rank,
                    masterUrl: mediaItem.file.getFileRecord().url("master"),
                    thumbnailUrl: mediaItem.file.getFileRecord().url("thumbnail")
                };
                returnData.mediaItems.push(mItem);
                //console.log(url);
            });
            // MediaItems.findOne().file.getFileRecord().url("thumbnail")
            //console.log(EJSON.stringify(returnData));
            //return EJSON.stringify(returnData);


            // Could be, e.g. application/xml, etc.
            this.response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            this.response.end(EJSON.stringify(returnData));
        }
    });
    this.route('404', {
        path: '*'
    });
});