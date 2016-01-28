function showAlert( style, message ){
	$("#uploadstatus").html(message).attr({style:'','class':'alert alert-'+style});
}

function loadFile( f ){
	$("#uploadstatus").attr({style:'display:none'});
	if ( f )
	{
		$("#fname").attr({value:f.name});
		if ( f.type != "text/html" ){
			showAlert('warning','<strong>Error:</strong> Not a HTML file.');
		} else if ( f.size > 1000000 ){
			showAlert('warning','<strong>Error:</strong> File too large.');
		} else {
			var r = new FileReader();
			r.onload = function(e){
				var processed = parseTimetable( e.target.result );
				if ( processed.length > 0 ){
					console.log( processed );
					localStorage.processed = JSON.stringify( processed );
				} else {
					showAlert('warning','<strong>Error:</strong> No entries found.');
				}
			}
			r.readAsText( f.slice(0,1024*1024) );
		}
	}
}

function sendData( data ){
	$("#spinner").attr({style:'','class':'fa fa-spinner fa-pulse'});
	$("#buttext").html(" Loading&hellip; ");

	var promises = [], maxv = data.length, curv = 1;
	$("#ubar").attr({style:'width: 1%'}); $("#uprog").attr({style:''});

	$.each( data, function(i,v){
		promises.push( $.ajax( '/upload', {
			type: 'POST', contentType: 'application/json',
			data: JSON.stringify( v ),
			success: function(r){
				$("#ubar").attr({style:'width: '+100*curv/maxv+'%'}).text( r.loaded[0] );
				curv++;
			},
			error: function(){ console.log(r); }
		}));
	});

	$.when.apply(null, promises).done(function(){
		setTimeout(function(){ $("#uprog").attr({style:'display:none'}); }, 1000);
		$("#spinner").attr({'class':'fa fa-check-circle-o'});
		$("#buttext").html(" Done!");
		showAlert('success','<strong>Success!</strong> Thank you for your submission.');
	});

	//$("#spinner").attr({style:'','class':'fa fa-exclamation-triangle'});
	//$("#buttext").html(" Error! Try again");
	//showAlert('warning','<strong>Error:</strong> Upload did not complete.');
}

function attachUploader(){
	$("#uploader").load( '/form', '', function(){
		$("#loader").on('change',function(e){ loadFile(e.target.files[0]); });
		$("#ubutt").click(function(e){ sendData( JSON.parse( localStorage.processed ) ); });
	});
}
