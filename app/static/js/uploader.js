function uploadModal(){
	var modal = $("<div class='modal-dialog'/>");

	var header = $("<div class='modal-header'/>");
	header.html($("<button type='button' class='close' data-dismiss='modal'>&times;</button>"));
	$("<h4 class='modal-title'>Upload Timetable</h4>").appendTo(header);
	var content = $("<div class='modal-content'/>").html(header); 

	var close = $("<button type='button' class='btn btn-default' data-dismiss='modal'/>");
	var footer = $("<div class='modal-footer'/>").append( close.text("Close") );

	var body = $("<div id='ubody' class='modal-body'/>");
	var sams = "https://sams.sutd.edu.sg/";
	var gbl = sams + "psc/CSPRD/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL";
	var instr = [ "Login to <a target='_blank' href='"+sams+"'>"+sams+"</a> with your school login (ignore the warning).", "Visit <a target='_blank' href='"+gbl+"'>this page</a> with the same session and save it.", "Upload the .html below." ];
	var ilist = $("<ol/>"); $.each( instr, function(i,v){ $("<li/>").html(v).appendTo(ilist); });
	body.html( ilist ); body.append( $("<div id='uploadstatus'/>") );

	var fileinput = $("<input type='file' id='loader' name='timetable'>");
	$("<div id='dropzone' class='well'/>").append( fileinput ).appendTo(body);

	$("#uploader").append( content.append(body).append(footer).appendTo(modal) );
}

function handleFile( f )
{
	if ( f )
	{
		var r = new FileReader();
		r.onload = function(e){
			var processed = parseTimetable( e.target.result );
			if ( processed.length > 0 ){
				var ld = $("<div/>");
				$("<span id='loading' class='glyphicon glyphicon-upload'/>").appendTo(ld);
				$("#ubody").append(ld);

				$.ajax( '/upload', {
					type: 'POST', contentType: 'application/json',
					data: JSON.stringify( processed ),
					success: function(r){ $("#loading").attr({'class':'glyphicon glyphicon-ok'}); }
				});
			} else {
				var al = $("<div class='alert alert-warning' role='alert'/>");
				al.html('<strong>Error:</strong> No entries found.').appendTo("#uploadstatus");
			}
		}
		r.readAsText( f.slice(0,1024*1024) );
	}
}

function addLoaderEvents(){
	// $("#dropzone").click(function(e){ $("#loader")[0].click(); });
	$("#dropzone")[0].addEventListener('dragover',function(e){
		e.stopPropagation(); e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
	}, false);
	$("#dropzone")[0].addEventListener('drop',function(e){
		e.preventDefault(); handleFile(e.dataTransfer.files[0]);
	}, false);
	$("#loader").change(function(e){handleFile(e.target.files[0]);});
}
