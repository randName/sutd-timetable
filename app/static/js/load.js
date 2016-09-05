function loadModules(r){
	if ( $.isEmptyObject(r) ){ return; } else { $('#placeholder').hide(); }
	var mc = [];
	$.each( r, function(k,s){ var t=k.split('.')[0]; if ( mc.indexOf(t) == -1 ) mc.push(t); } );
	$.each( mc.sort(), function(i,v){
		$("#modulelist").append($("<div class='panel-group col-sm-6 col-lg-4'/>").attr('id','l'+v));
	});
	localStorage.modules = JSON.stringify(r);
	displayModules( r );
}

$.getJSON( "modules", loadModules );

$.getJSON( "locations", function(r){ localStorage.locations = JSON.stringify(r); });

$(document).on( 'change', ':checkbox', handleCheckbox );

$(document).ready(function(){
	attachUploader();
	attachCalendar();
	$("#howto").load( '/static/howto.html', '', function(){
		$('#howtotabs a').click(function(e){e.preventDefault();$(this).tab('show');});
	});
	$("#ualert").removeClass("hidden");
	$("#absurl").html( window.location.host );
	if ( window.location.host == "timetable.sutd.design" ){ $("#dalert").removeClass("hidden"); }
});
