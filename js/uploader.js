function upload_modal(){
	var modal = $("<div class='modal-dialog'/>");

	var header = $("<div class='modal-header'/>");
	header.html($("<button type='button' class='close' data-dismiss='modal'>&times;</button>"));
	$("<h4 class='modal-title'>Upload Timetable</h4>").appendTo(header);
	var content = $("<div class='modal-content'/>").html(header) 

	var uformbuttons = [[{type:'submit','class':'btn btn-primary'},"Upload"],[{type:'button','class':'btn btn-default','data-dismiss':'modal'},"Close"]];
	var uform = $("<form id='uform' enctype='multipart/form-data'/>");
	$("<span class='btn btn-default'><input type='file' name='timetable'></span>").appendTo(uform);
	$.each( uformbuttons, function(i,v){ $("<button/>").attr(v[0]).text(v[1]).appendTo(uform); } );
	var footer = $("<div class='modal-footer'/>").html(uform);
	var body = $("<div id='umodal' class='modal-body'/>"); upload_modal_body( body );
	$("#uploader").append( content.append(body).append(footer).appendTo(modal) );
}

function upload_modal_body( body )
{
	var sams = "https://sams.sutd.edu.sg/";
	var gbl = sams + "psc/CSPRD/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL";
	var instr = [ "Login to <a target='_blank' href='"+sams+"'>"+sams+"</a> with your school login (ignore the warning).", "Visit <a target='_blank' href='"+gbl+"'>this page</a> with the same session and save it.", "Upload the .html below." ];
	var ilist = $("<ol/>"); $.each( instr, function(i,v){ $("<li/>").html(v).appendTo(ilist); });
	body.html( ilist ).prepend( $("<div id='uploadstatus'/>") );
}

$(document).ready(function(){
	upload_modal();
	$("#uform").submit(function(e){
		e.preventDefault();
		var fd = new FormData($(this)[0]);
		$.ajax({
			url: "/upload", type: "POST", data: fd,
			processData: false, contentType: false,
			success: function(r){
				if ( r.success ){
					var mlist = $("<ul/>");
					$.each( r.processed, function(i,v){
						$("<li/>").text(v[0]+' (Section: '+v[1]+')').appendTo(mlist);
					});
					$("#umodal").html($("<p/>").text(r.message+' Processed entries:'));
					$("#umodal").append(mlist);
				}
				else
				{
					var al = $("<div class='alert alert-warning' role='alert'/>");
					al.html('<strong>Error:</strong> '+r.message).appendTo( $("#uploadstatus") );
				}
		   }
	   })
	})
});
