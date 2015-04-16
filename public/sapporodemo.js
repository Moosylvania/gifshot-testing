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

    var getRandomArbitrary = function(min, max) {
        return Math.random() * (max - min) + min;
    }

    var sourcetype = Math.round(getRandomArbitrary(0,2));

    var disco = '/standard.png';
    var tokyo = '/spritesheet-toyko.png';
    var ball = '/disco.png';
    var beyonce = '/diva.png';
    var sources = {};

    switch(sourcetype){
        case 0:
            sources.sapporo = disco;
            break;
        case 1:
            sources.sapporo = ball;
            break;
        case 2:
            sources.sapporo = beyonce;
            break;
    }

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
            var counttime = 3;
            var theinterval = setInterval(function(){
                if(counttime == 0){
                    $('.counter').hide();
                    clearInterval(theinterval);
                    gifshot.createGIF({
                        gifWidth: 300,
                        gifHeight: 300,
                        numFrames: 10,
                        interval: 0.1,
                        saveRenderingContexts: true,
                        keepCameraOn: true,
                        webcamVideoElement: $('#myvideo')[0],
                        cameraStream: stream,
                        numWorkers: 6,
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
                        if (!obj.error) {
                            gifState = obj.savedRenderingContexts;
                            var frames = [];
                            var canvas = document.createElement('canvas');
                            canvas.width = 300;
                            canvas.height = 300;
                            var context = canvas.getContext('2d');

                            loadImages(sources, function(images) {
                                for(var i = 0; i<10; i++){
                                    context.putImageData(gifState[i], 0, 0);

                                    context.drawImage(images.sapporo, 0, ((i)*-300));

                                    switch(sourcetype){
                                        case 0:
                                            context = drawText(context, "top", "WOAH", 300, 300);
                                            context = drawText(context, "bottom", "IT WORKS!", 300, 300);
                                            break;
                                        case 1:
                                            context = drawText(context, "top", "DISCO ISN'T", 300, 300);
                                            context = drawText(context, "bottom", "DEAD!", 300, 300);
                                            break;
                                        case 2:
                                            context = drawText(context, "top", "HEY LOOK", 300, 300);
                                            context = drawText(context, "bottom", "I'M BEYONCE", 300, 300);
                                            break;
                                    }

                                    frames.push(context.getImageData(0,0,300,300));
                                }

                                var finalframes = frames.slice(0);

                                frames.reverse();
                                finalframes = finalframes.concat(frames);

                                gifshot.createGIF({
                                    gifWidth: 300,
                                    gifHeight: 300,
                                    numFrames: finalframes.length,
                                    interval:0.1,
                                    saveRenderingContexts: true,
                                    savedRenderingContexts: finalframes,
                                    numWorkers: 6,
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
                                    var img = document.createElement('img');
                                    img.src = obj.image;
                                    $('.preview').empty().append(img);
                                    $('.preview').show();
                                    $(img).css('cursor', 'pointer');
                                    $.post('http://sapporogifs.appsbuiltby.us/newgif/', {gif:img.src, name:'tester', email:'email@email.com', state:'MO', isEntry:true}, function(response){
                                        console.log(response);
                                    });

                                    img.onclick = function() {
                                        // atob to base64_decode the data-URI
                                        var image_data = atob(img.src.split(',')[1]);
                                        // Use typed arrays to convert the binary data to a Blob
                                        var arraybuffer = new ArrayBuffer(image_data.length);
                                        var view = new Uint8Array(arraybuffer);
                                        for (var i=0; i<image_data.length; i++) {
                                            view[i] = image_data.charCodeAt(i) & 0xff;
                                        }
                                        try {
                                            // This is the recommended method:
                                            var blob = new Blob([arraybuffer], {type: 'application/octet-stream'});
                                        } catch (e) {
                                            // The BlobBuilder API has been deprecated in favour of Blob, but older
                                            // browsers don't know about the Blob constructor
                                            // IE10 also supports BlobBuilder, but since the `Blob` constructor
                                            //  also works, there's no need to add `MSBlobBuilder`.
                                            var bb = new (window.WebKitBlobBuilder || window.MozBlobBuilder);
                                            bb.append(arraybuffer);
                                            var blob = bb.getBlob('application/octet-stream'); // <-- Here's the Blob
                                        }

                                        // Use the URL object to create a temporary URL
                                        var url = (window.webkitURL || window.URL).createObjectURL(blob);
                                        location.href = url; // <-- Download!
                                    };
                                });

                            });
                        } else {
                            console.log(obj.error);
                        }
                    });
                } else {
                    $('.counter').text('Starting in: '+counttime);
                    counttime--;
                }
            }, 1000);
        }
    });
})(jQuery, window);
