(function($, window, undefined) {

    var state = 0;
    var gifState = [];
    var link = $('#create');
    var stream = null;

    $('#progressbar').progressbar({
        value: 0,
        max: 100
    });

    $('#progressbar').hide();

    var loadImages = function(sources, callback) {
        var images = {};
        var loadedImages = 0;
        var numImages = 0;
        // get num of sources
        for (var src in sources) {
            numImages++;
        }
        for (var src in sources) {
            images[src] = new Image();
            images[src].onload = function() {
                if (++loadedImages >= numImages) {
                    callback(images);
                }
            };
            images[src].src = sources[src];
        }
    };

    var sources = {
        sapporo: '/sapporo-frames.png',
    };

    var drawText = function(context, pos, text, width, height) {
        var fontSize = 100;
        context.textAlign = "center";
        context.fillStyle = "#fff";
        context.strokeStyle = "#000";
        context.lineWidth = 6;

        while(1) {
            context.font = "bold " + fontSize + "px Impact";
            if( (context.measureText(text).width < (width-15)) && (fontSize < height/10) ) {
                break;
            }
            fontSize-=2;
        }

        var y;
        if(pos == "top") {
            y = height - 65 - fontSize;
        } else if(pos == "bottom") {
            y = height - 60;
        }

        context.strokeText(text, width/2, y);
        context.fillText(text, width/2, y);
        return context;
    };

    $(document.body).on('click', '#create', function(e) {
        e.preventDefault();
        $(this).hide();
        $('.preview').hide();
        if (state == 0) {
            $('.prep').show();
            $('#myvideo').show();
            gifshot.createGIF({
                keepCameraOn: true,
                webcamVideoElement: $('#myvideo')[0],
                gifWidth: 300,
                gifHeight: 300,
                numFrames: 1,
                interval: 0.1
            }, function(obj) {
                stream = obj.cameraStream;
                $('.prep').hide();
                state++;
                link.text('Create your first GIF');
                link.show();
            });
        } else if (state == 1) {
            $('#myvideo').show();
            gifshot.createGIF({
                gifWidth: 300,
                gifHeight: 300,
                numFrames: 20,
                interval: 0.1,
                saveRenderingContexts: true,
                keepCameraOn: true,
                webcamVideoElement: $('#myvideo')[0],
                cameraStream: stream,
                numWorkers: 2,
                progressCallback: function(captureProgress) {
                    $("#progressbar").show();
                    $("#progressbar").progressbar("option", "value", captureProgress * 100);
                    if (captureProgress == 1) {
                        $('#myvideo').hide();
                        $("#progressbar").progressbar("option", "value", false);
                    }
                }
            }, function(obj) {
                $("#progressbar").hide();
                state++;
                if (state == 2) {
                    link.text('Create Final Gif');
                    link.show();
                }
                if (!obj.error) {
                    gifState = obj.savedRenderingContexts;
                    var img = document.createElement('img');
                    img.src = obj.image;
                    $('.preview div').before(img);
                    $('.preview').show();
                } else {
                    console.log(obj.error);
                }
            });
        } else {
            var frames = [];
            var canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 300;
            var context = canvas.getContext('2d');

            loadImages(sources, function(images) {
                for(var i = 0; i<20; i++){
                    context.putImageData(gifState[i], 0, 0);
                    if(i == 0){
                        context.drawImage(images.sapporo, 0, 0);
                    } else if(i < 10){
                        context.drawImage(images.sapporo, 0, ((i)*-300));
                    } else if(i < 18){
                        context.drawImage(images.sapporo, 0, ((19-i)*-300));
                    } else {
                        context.drawImage(images.sapporo, 0, 0);
                    }

                    context = drawText(context, "top", "WTF", 300, 300);
                    context = drawText(context, "bottom", "IT WORKS!", 300, 300);

                    frames.push(context.getImageData(0,0,300,300));
                }

                gifshot.createGIF({
                    gifWidth: 300,
                    gifHeight: 300,
                    numFrames: frames.length,
                    interval:0.1,
                    saveRenderingContexts: true,
                    savedRenderingContexts: frames,
                    numWorkers: 2,
                    progressCallback: function(captureProgress) {
                        $("#progressbar").show();
                        $("#progressbar").progressbar("option", "value", captureProgress * 100);
                        if (captureProgress == 1) {
                            $('#myvideo').hide();
                            $("#progressbar").progressbar("option", "value", false);
                        }
                    }
                }, function(obj) {
                    console.log(obj);
                    $("#progressbar").hide();
                    var img = document.createElement('img');
                    img.src = obj.image;
                    $('.preview').empty().append(img);
                    $('.preview').show();
                });

            });
        }
    });
})(jQuery, window);
