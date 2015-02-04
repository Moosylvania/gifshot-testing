(function($, window, undefined){

    var state = 0;
    var gifs = [];
    var link = $('#create');
    var stream = null;

    $('#progressbar').progressbar({
      value: 0,
      max:100
    });

    $('#progressbar').hide();

    var processGreenscreen = function(frames, next){
        for(var i in frames){
            var data = frames[i].data;
            var start = {
                red: data[0],
                green: data[1],
                blue: data[2]
            };

            var tolerance = 150;
            for(var j = 0, n = data.length; j < n; j += 4) {
                var diff = Math.abs(data[j] - data[0]) + Math.abs(data[j+1] - data[1]) + Math.abs(data[j+2] - data[2]);
                if(diff < tolerance) {
                    data[j + 3] = 0;
                }
            }

            frames[i].data = data;
        }

        gifs.push(frames);
        next();
    };

    $(document.body).on('click', '#create', function(e){
        e.preventDefault();
        $(this).hide();
        $('.preview').hide();
        if(state == 0){
            $('#myvideo').show();
            gifshot.createGIF({
                keepCameraOn:true,
                webcamVideoElement: $('#myvideo')[0],
                gifWidth: 400,
                gifHeight: 400,
                numFrames:2
            }, function(obj) {

                stream = obj.cameraStream;

                gifshot.createGIF({
                    'video': ['knife.mp4', 'knife.ogv'],
                    gifWidth: 400,
                    gifHeight: 400,
                    keepCameraOn:true,
                    webcamVideoElement: $('#myvideo')[0],
                    cameraStream:stream,
                    saveRenderingContexts:true,
                    numFrames:30
                }, function(obj){
                    processGreenscreen(obj.savedRenderingContexts, function(){
                        state++;
                        link.text('Create your First Gif');
                        link.show();
                    });
                });
            });
        }
        else if(state == 1){
            $('#myvideo').show();
            gifshot.createGIF({
                gifWidth: 400,
                gifHeight: 400,
                numFrames:30,
                saveRenderingContexts:true,
                keepCameraOn:true,
                webcamVideoElement: $('#myvideo')[0],
                cameraStream:stream,
                numWorkers:5,
                progressCallback: function(captureProgress) {
                    $( "#progressbar" ).show();
                    $( "#progressbar" ).progressbar( "option", "value", captureProgress*100 );
                    if(captureProgress == 1){
                        $('#myvideo').hide();
                        $( "#progressbar" ).progressbar( "option", "value", false );
                    }
                }
            }, function(obj) {
                $( "#progressbar" ).hide();
                state++;
                if(state == 2){
                    link.text('Create Final Gif');
                    link.show();
                }
                if(!obj.error) {
                    gifs.push(obj.savedRenderingContexts);
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
            canvas.width=400;
            canvas.height=400;
            var context = canvas.getContext('2d');

            for(var i = 0; i < 30; i++){
                for(var j = 0, n = gifs[1][i].data.length; j < n; j += 4) {
                    if(gifs[0][i].data[j+3] > 0){
                        gifs[1][i].data[j] = gifs[0][i].data[j];
                        gifs[1][i].data[j+1] = gifs[0][i].data[j+1];
                        gifs[1][i].data[j+2] = gifs[0][i].data[j+2];
                        gifs[1][i].data[j+3] = gifs[0][i].data[j+3];
                    }
                }
                frames.push(gifs[1][i]);
                context.putImageData(gifs[1][i], 0, 0);
            }



            gifshot.createGIF({
                gifWidth: 400,
                gifHeight: 400,
                numFrames:frames.length,
                saveRenderingContexts:true,
                savedRenderingContexts:frames,
                numWorkers:5,
                progressCallback: function(captureProgress) {
                    $( "#progressbar" ).show();
                    $( "#progressbar" ).progressbar( "option", "value", captureProgress*10 );
                    if(captureProgress == 1){
                        $('#myvideo').hide();
                        $( "#progressbar" ).progressbar( "option", "value", false );
                    }
                }
            }, function(obj){
                console.log(obj);
                $( "#progressbar" ).hide();
                var img = document.createElement('img');
                img.src = obj.image;
                $('.preview').empty().append(img);
                $('.preview').show();
            });
        }
    });
})(jQuery, window);


/*gifshot.createGIF({
    gifWidth: 800,
    gifHeight: 600,
    numFrames:10,
    saveRenderingContexts:true,
    savedRenderingContexts:obj.savedRenderingContexts
}, function(iobj){
    console.log(iobj);
    img2.attr('src', iobj.image);
});
*/
