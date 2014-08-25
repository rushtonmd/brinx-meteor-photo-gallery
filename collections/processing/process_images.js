if (Meteor.isServer) {

    ImageProcessingQueue = new PowerQueue({
        isPaused: false
    });

    ImageProcessingQueue.run();

    createThumbnailImage = function(fileObj, readStream, writeStream) {

        ImageProcessingQueue.add(function(done) {
            var moreDone = Meteor.bindEnvironment(function() {
                done();
            }, function(e) {
                throw e;
            });
            useGMToCreateThumbnail(moreDone, fileObj, readStream, writeStream);
        });

    };

    setImageMetaSize = function(fileObj, store){
        var readStream = fileObj.createReadStream('thumbnail');
        gm(readStream)
            .size({
                bufferStream: true
            }, FS.Utility.safeCallback(
                function(err, size) {
                    if (!err) {
                        fileObj.update({
                            $set: {
                                "metadata.width": size.width,
                                "metadata.height": size.height
                            }
                        });
                    }
                },
                function(error) {
                    console.log("Error in bindEnvironment:", error);
                }));
    };

    useGMToCreateThumbnail = function(done, fileObj, readStream, writeStream) {

        gm(readStream, fileObj.name())
            .autoOrient().resize(1000).quality(75)
            .stream(function(err, stdout, stderr) {
                if (err) return err;
                stdout.pipe(writeStream);
                stdout.on('end', done);
            });
    };




}