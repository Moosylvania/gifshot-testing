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

    $(document.body).on('click', '#create', function(e){
        e.preventDefault();
        $(this).hide();
        $('.preview').hide();
        if(state == 0){
            $('#myvideo').show();
            $('.prep').show();
            gifshot.createGIF({
                keepCameraOn:true,
                webcamVideoElement: $('#myvideo')[0],
                gifWidth: 400,
                gifHeight: 400,
                numFrames:2
            }, function(obj) {

                stream = obj.cameraStream;

                gifshot.createGIF({
                    'video': ['fireworks.mp4', 'fireworks.ogv'],
                    gifWidth: 400,
                    gifHeight: 400,
                    keepCameraOn:true,
                    webcamVideoElement: $('#myvideo')[0],
                    cameraStream:stream,
                    saveRenderingContexts:true,
                    numFrames:30
                }, function(obj){
                    $('.prep').hide();
                    gifs.push(obj.savedRenderingContexts);
                    state++;
                    link.text('Create your first GIF');
                    link.show();
                });
            });
        }
        else if(state > 0 && state < 3){
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
                    link.text('Create your second GIF');
                    link.show();
                }
                if(state == 3){
                    link.text('Create your final GIF');
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

            for(var i = 0; i < 30; i++){
                frames.push(gifs[1][i]);
            }

            for(var i = 0; i < 30; i++){
                frames.push(gifs[0][i]);
            }

            for(var i = 0; i < 30; i++){
                frames.push(gifs[2][i]);
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
                    $( "#progressbar" ).progressbar( "option", "value", captureProgress*100 );
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
