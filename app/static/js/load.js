$.getJSON( "modules", function(r){
	var mc = [];
	$.each( r, function(k,s){ var t=k.split('.')[0]; if ( mc.indexOf(t) == -1 ) mc.push(t); } );
	$.each( mc.sort(), function(i,v){
		$("#modulelist").append($("<div class='panel-group col-sm-6 col-lg-4'/>").attr('id','l'+v));
	});
	localStorage.modules = JSON.stringify( r );
	displayModules( r );
});

$.getJSON( "locations", function(r){ localStorage.locations = JSON.stringify(r); });

$(document).on( 'change', ':checkbox', handleCheckbox );

$(document).ready(function(){
	window.sources = {};
	attachUploader();
	attachCalendar();
});
