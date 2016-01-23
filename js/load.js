$.getJSON( "data/modules", function(r){
	var mc = [];
	$.each( r, function(k,s){ var t=k.split('.')[0]; if ( mc.indexOf(t) == -1 ) mc.push(t); } );
	$.each( mc.sort(), function(i,v){
		$("#modulelist").append($("<div class='panel-group col-sm-6 col-lg-4'/>").attr('id','l'+v));
	});
	localStorage.modules = JSON.stringify( r );
	displayModules( r );
});

$.getJSON( "data/SUTD_locations", function(r){ localStorage.locations = JSON.stringify(r); });

$(document).ready(function(){
    uploadModal();
    addLoaderEvents();
});
