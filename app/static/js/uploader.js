function uploadModal(){
	var hdr = $("<div class='modal-header'/>");
	$("<button type='button' class='close' data-dismiss='modal'/>").html("&times;").appendTo(hdr);
	$("<h4 class='modal-title'/>").text("Upload Timetable").appendTo(hdr);
	var content = $("<div class='modal-content'/>").html(hdr); 

	var close = $("<button type='button' class='btn btn-default' data-dismiss='modal'/>");
	var footer = $("<div class='modal-footer'/>").append(close.text("Close"));

	var body = $("<div id='ubody' class='modal-body'/>");
	var sams = "https://sams.sutd.edu.sg/";
	var gbl = sams + "psc/CSPRD/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL";
	var instr = [ "Login to <a target='_blank' href='"+sams+"'>"+sams+"</a> with your school login (ignore the warning).", "Visit <a target='_blank' href='"+gbl+"'>this page</a> with the same session and save it.", "Upload the .html below." ];
	var ilist = $("<ol/>"); $.each( instr, function(i,v){ $("<li/>").html(v).appendTo(ilist); });
	body.html(ilist).append( $("<div id='uploadstatus' role='alert' style='display:none'/>") );

	var ubar = $("<div id='ubar' role='progressbar' style='width: 0%'/>");
	ubar.attr({'class':'progress-bar progress-bar-striped active'});
	body.append( $("<div id='uprog' class='progress' style='display:none'/>").html( ubar ) );

	var igroup = $("<div class='input-group'/>");

	var browsebutt = $("<span class='btn btn-primary btn-file'/>").html("Browse&hellip; ");
	$("<input type='file' id='loader'>").appendTo( browsebutt );
	$("<div class='input-group-btn'/>").html( browsebutt ).appendTo( igroup );
	$("<input type='text' id='fname' class='form-control' readonly>").appendTo( igroup );

	var ubutt = $("<button type='button' id='ubutt' class='btn btn-primary'/>");
	$("<i id='spinner'/>").attr({style:'display:none'}).appendTo(ubutt);
	$("<span id='buttext' class='text'/>").html("Upload").appendTo(ubutt);
	$("<div class='input-group-btn'/>").html( ubutt ).appendTo( igroup );

	body.append( igroup );

	$("#uploader").html($("<div class='modal-dialog'/>").html(content.append(body).append(footer)));
}

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

function addLoaderEvents(){
	$("#loader").on('change',function(e){ loadFile(e.target.files[0]); });
	$("#ubutt").click(function(e){ sendData( JSON.parse( localStorage.processed ) ); });
}
