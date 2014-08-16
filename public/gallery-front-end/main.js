
(function(brinx, $, undefined){
    
    var currentPosition = 0;
    var scrollAmount = 1;
    var scrollSpeed = 30;
    var pauseDuration = 4000;
    var pauseThisTime = pauseDuration;
    brinx.imageList = [];

    $(function(){
        scrollWindow();
    });

    function showImageCaption() {
      alert( "Handler for .click() called." );
    };

    $(window).resize(function() {
      var imageRowDiv = $("#image-container").empty();
      loadAllImages(brinx.imageList);
    });

    function scrollWindow(){
        if (window.pageYOffset != currentPosition){
            pauseThisTime = pauseDuration;
            currentPosition = window.pageYOffset;
        }
        else {
            window.scroll(0,currentPosition + scrollAmount);
            currentPosition = currentPosition + scrollAmount;
            pauseThisTime = 0;
        }
        
        setTimeout(function(){scrollWindow();}, scrollSpeed + pauseThisTime);

    };

    brinx.retrieveImageList = function(root) {
        var feed = root.feed;
        var entries = feed.entry || [];
        var html = ['<ul>'];

        var rowCount = 0;
        for (var i = 0; i < entries.length; i = i + 4) {
          var image_url = entries[i];
          var image_width = entries[i+1];
          var image_height = entries[i+2];
          var image_caption = entries[i+3];
          var imageEntry = {};

          imageEntry.url_n = image_url.content.$t;
          imageEntry.width_n = (image_width.content.type == 'html') ? image_width.content.$t : escape(image_width.content.$t);
          imageEntry.height_n = (image_height.content.type == 'html') ? image_height.content.$t : escape(image_height.content.$t);
          imageEntry.caption_n = image_caption.content.$t;

          brinx.imageList.push(imageEntry);
        }

        loadAllImages(brinx.imageList);

    }

    function loadAllImages(iList){

        if (iList.length <= 0) return;

        currentImage = 0;

        brinx.loadImageInterval = setInterval(function(){getImageCountForRow()}, 2000);

    };

    var currentImage = 0;
    var targetHeight = getRandomInt(250, 350);

    function getImageCountForRow(){

        if (currentImage >= brinx.imageList.length){
            clearInterval(brinx.loadImageInterval);
            return;
        };

        var imageRowDiv = $("#image-container").eq(0);
        var targetWidth = imageRowDiv.innerWidth();

        var totalImageWidth = 0

        var imageCount = 0;


        // Loop through images, scaling them to the target height
        for (var i=currentImage;i<brinx.imageList.length;i++) { 
            
            var photo = brinx.imageList[i];

            totalImageWidth += (photo.width_n * targetHeight / photo.height_n);

            imageCount++;

            if (totalImageWidth > targetWidth) {
                i = brinx.imageList.length;
            };
        };

        addXImageToRow(imageCount);

    };

    function getRandomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function addXImageToRow(imageCount){
        // Loop through image array and add a particular amount of images
        var iWidth = 0;
        var iHeight = 0;

        var imageContainer = $("#image-container");
        var imageRowDiv = $('<div/>', {class: "photo-row"});
        imageContainer.append(imageRowDiv);
        var targetWidth = imageContainer.innerWidth();

        var totalImageWidth = 0
        var totalWidthDelta = 0;

        // get the total length of the scaled images
        for (var i=0;i<imageCount;i++) { 
            var photo = brinx.imageList[currentImage + i];
            totalImageWidth += (photo.width_n * targetHeight / photo.height_n);
        };

        // Calculate the delta
        totalWidthDelta = targetWidth - totalImageWidth;

        for (var i=0; i<imageCount;i++){

            var photo = brinx.imageList[currentImage + i];
            var imageWidthDelta = (photo.width_n * targetHeight / photo.height_n) / totalImageWidth * totalWidthDelta;

            var multiplier = (((targetHeight / photo.height_n) * photo.width_n) + imageWidthDelta) / photo.width_n;

            (function() {
                var imgDiv = $('<div/>', {class:"delayImageDiv", width: photo.width_n * multiplier, height: photo.height_n * multiplier});
                var img = $('<img/>', {class: "delayImg", target:"_blank", src2: "",src: photo.url_n, width: photo.width_n * multiplier, height: photo.height_n * multiplier});
                var url = photo.url_n;
                img.popover({title: "Notes...", content:photo.caption_n, placement:"top",html:true});
                img.click(function(){
                    setTimeout(function(){
                        img.popover('hide');
                        }, 5000);
                });
                imgDiv.append(img);
                imageRowDiv.append(imgDiv);
            })();
        };

        currentImage += imageCount;

        setTimeout(function(){imageRowDiv.animate({opacity: 1}, 2000);},1000);
    };

}( window.brinx = window.brinx || {}, jQuery ));