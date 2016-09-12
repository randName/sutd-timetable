$.getJSON( "modules", loadModules );
$.getJSON( "groups", loadGroups );
$.getJSON( "locations", function(r){ window.locations = r; });

window.checked = [];

$(document).on( "change", ":checkbox", handleCheckbox );
$(document).ready(function(){
	$("#modsearch").select2({ disabled: true, placeholder: "Loading modules..." });
	attachUploader();
	attachCalendar();
	$("#howto").load( "/static/howto.html", "", function(){
		$("#howtotabs a").click(function(e){e.preventDefault();$(this).tab("show");});
	});
	$("#ualert").removeClass("hidden");
	$("#absurl").html( window.location.host );
	if ( window.location.host == "timetable.sutd.design" ){ $("#dalert").removeClass("hidden"); }
	window.loadchecked = window.location.hash.substring(1).split(',');
	if ( window.loadchecked[0] == "" ){ window.loadchecked = [] };
});
