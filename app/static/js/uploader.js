function uploadModal(){
	var hdr = $("<div class='modal-header'/>");
	$("<button type='button' class='close' data-dismiss='modal'/>").text('&times;').appendTo(hdr);
	$("<h4 class='modal-title'/>").text("Upload Timetable").appendTo(hdr);
	var content = $("<div class='modal-content'/>").html(hdr); 

	var ubutt = $("<span class='btn btn-primary btn-file'/>");
	$("<i id='spinner'/>").attr({style:'display:none'}).appendTo(ubutt);
	$("<span id='buttext' class='text'/>").text("Browse...").appendTo(ubutt);
	$("<input type='file' id='loader' name='timetable'>").appendTo(ubutt);
	var close = $("<button type='button' class='btn btn-default' data-dismiss='modal'/>");
	var footer = $("<div class='modal-footer'/>").append( ubutt ).append(close.text("Close"));

	var body = $("<div id='ubody' class='modal-body'/>");
	var sams = "https://sams.sutd.edu.sg/";
	var gbl = sams + "psc/CSPRD/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL";
	var instr = [ "Login to <a target='_blank' href='"+sams+"'>"+sams+"</a> with your school login (ignore the warning).", "Visit <a target='_blank' href='"+gbl+"'>this page</a> with the same session and save it.", "Upload the .html below." ];
	var ilist = $("<ol/>"); $.each( instr, function(i,v){ $("<li/>").html(v).appendTo(ilist); });
	body.html(ilist).append( $("<div id='uploadstatus' role='alert' style='display:none'/>") );

	$("#uploader").html($("<div class='modal-dialog'/>").html(content.append(body).append(footer)));
}

function handleFile( f )
{
	if ( f )
	{
		var ustatus = $("#uploadstatus");
		var r = new FileReader();
		r.onload = function(e){
			var processed = parseTimetable( e.target.result );
			if ( processed.length > 0 ){
				var sst = ['fa fa-spinner fa-pulse','fa fa-check-circle-o'];
				$.ajax( '/upload', {
					type: 'POST', contentType: 'application/json',
					data: JSON.stringify( processed ),
					beforeSend: function(){
						$("#spinner").attr({style:'','class':sst[0]});
						$("#buttext").text(" Loading...");
					},
					success: function(r){
						ustatus.html('<strong>Success!</strong> Thank you for your submission.');
						var ilist = $("<ul/>");
						$.each( r.loaded, function(i,v){ $("<li/>").html(v).appendTo(ilist); });
						ustatus.append(ilist).attr({style:'','class':'alert alert-success'});
					},
					complete: function(){
						$("#spinner").attr({'class':sst[1]});
						$("#buttext").text(" Done!");
					}
				});
			} else {
				ustatus.html('<strong>Error:</strong> No entries found.');
				ustatus.attr({style:'','class':'alert alert-warning'});
			}
		}
		r.readAsText( f.slice(0,1024*1024) );
	}
}

function addLoaderEvents(){
	// $("#dropzone").click(function(e){ $("#loader")[0].click(); });
	/*
	$("#dropzone")[0].addEventListener('dragover',function(e){
		e.stopPropagation(); e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
	}, false);
	$("#dropzone")[0].addEventListener('drop',function(e){
		e.preventDefault(); handleFile(e.dataTransfer.files[0]);
	}, false);
	*/
	$("#loader").change(function(e){handleFile(e.target.files[0]);});
}
