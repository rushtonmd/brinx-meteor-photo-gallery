if (Meteor.isServer) {


    // I created an image processing queue so that all the images don't try
    // to access graphicsmagick at the same time. I typically have a small
    // server that cannot handle more than a handful of simultaneous processes
    // at the same time. I found that when I tried to upload a bunch of images
    // at once, the server broked and all things went to hell. This queue 
    // keeps things calm and happy.
    var imageProcessingQueue = new PowerQueue({
        autotart: true,
        maxFailures: 3
    });

    // Reset the queue on restart
    imageProcessingQueue.reset();


    createThumbnailImage = function(fileObj, readStream, writeStream) {

        imageProcessingQueue.add(function(done) {
            var moreDone = Meteor.bindEnvironment(function(err) {
                if(err) {
                    console.log("Error in processing: " + err);
                    done();
                } else{
                    // Once the thumbnail has finished processing, 
                    // set the metadata sizes and set the flag
                    // to alert the front end that the image
                    // has finished processing
                    setImageMetaSize(done, fileObj, 'thumbnail');
                }
                
            }, function(e) {
                throw e;
            });

            useGMToCreateThumbnail(moreDone, fileObj, readStream, writeStream);

        });

    };

    setImageMetaSize = function(done, fileObj, store) {

        var readStream = fileObj.createReadStream(store);

        gm(readStream)
            .size({
                bufferStream: true
            }, FS.Utility.safeCallback(
                function(err, size) {
                    if (!err) {
                        fileObj.update({
                            $set: {
                                "metadata.width": size.width,
                                "metadata.height": size.height,
                                "metadata.finishedProcessing": true
                            }
                        }, function(){done();});
                    }
                    else{
                        console.log("Error in setting metadata: " + err);
                        done();
                    }
                },
                function(error) {
                    console.log("Error in bindEnvironment:", error);
                    done();
                }));
    };


    useGMToCreateThumbnail = function(done, fileObj, readStream, writeStream) {

        // Using Graphicsmagick, here we resize the original file to 
        // 1000px wide with a 75% quality rating. This keeps the images 
        // smaller and for faster loading. The autoOrient() is used
        // to save the image in the correct orientation 
        gm(readStream, fileObj.name())
            .autoOrient().resize(1000).quality(75)
            .stream(function(err, stdout, stderr) {
                if (err) {
                    done(err);
                    return err;
                }

                // Create a variable that is scoped to this stream function
                var dataError = false;

                // Pipe the processed stream to the writestream
                stdout.pipe(writeStream);

                // If there is an error in the data stream, 
                // set the dataError value to the error. This way
                // the 'close' callback will know if there was an
                // error while processing
                stderr.on('data', function(err){dataError = err;});
                stdout.on('close', function(){done(dataError);});
                
            });
    };


}