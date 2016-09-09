$.getJSON( "modules", loadModules );
$.getJSON( "groups", loadGroups );
$.getJSON( "locations", function(r){ window.locations = r; });

window.checked = [];

$(document).on( "change", ":checkbox", handleCheckbox );
$(document).ready(function(){
	attachUploader();
	attachCalendar();
	$("#howto").load( "/static/howto.html", "", function(){
		$("#howtotabs a").click(function(e){e.preventDefault();$(this).tab("show");});
	});
	$("#ualert").removeClass("hidden");
	$("#absurl").html( window.location.host );
	if ( window.location.host == "timetable.sutd.design" ){ $("#dalert").removeClass("hidden"); }
	window.loadchecked = window.location.search.substring(1).split(',');
});
