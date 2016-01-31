function displayModules( mods ){
	$.each( mods, function(k,s){
		var t=k.split('.');
		var panel = $("<div class='panel panel-primary'/>");
		var phead = $("<div class='panel-heading'/>");
		var ptitle = $("<h3 class='panel-title'/>");
		var ahead=$("<a data-toggle='collapse'/>").attr({'data-parent':'#l'+t[0],'href':'#m'+t[1]});

		var sc = $("<ul class='list-group'/>");
		$.each( s.sections, function(k,v){
			var li = $("<li class='list-group-item list-group-item-info'/>");
			var cb = $("<input type='checkbox'>").attr('value',k);
			var dt = (new Date(v[1]*1000)).toISOString().slice(0,10);
			var lz = $("<label/>").text(v[0]+' (Updated: '+dt+')').prepend(cb);
			sc.append( li.append( $("<div class='checkbox'/>").html(lz) ) );
		});

		panel.html(phead.html(ptitle.html(ahead.text(k+' - '+s.title))));
		$("<div class='panel-collapse collapse'/>").attr('id','m'+t[1]).html(sc).appendTo(panel);
		$('#l'+t[0]).append(panel);
	});
}

function attachCalendar(){
	$('#calendar').fullCalendar({
		header: { left: 'prev,next today', center: 'title', right:'month,agendaWeek' },
		businessHours: { start: '08:00', end: '20:00' },
		weekends: false, minTime: "08:00:00", maxTime: "20:00:00",
		contentHeight: 600,
		editable: false,
		defaultView: 'agendaWeek',
		eventRender: handleEventRender,
	});
	window.sources = {};
	window.checked = [];
	window.groups = {};
	window.activeGroups = [];
	$("#absurl").html( window.location.host );
}

function handleCheckbox(){
	var checked = $(this).is(':checked');
	if ( this.value in window.groups ){
		toggleGroup( checked, this.value );
	} else {
		toggleSection( checked, this.value );
	}
}

function toggleGroup( action, group ){
	if ( group in window.groups ){
		var gp = $.inArray( group, window.activeGroups );
		if ( action ){
			if ( gp == -1 ) window.activeGroups.push( group );
		} else {
			if ( gp != -1 ) window.activeGroups.splice( gp, 1 );
		}
		var ck = $.map( window.activeGroups, function(g){ return window.groups[g]; });
		$(":checkbox").each( function(){
			var kk = ( $.inArray( parseInt(this.value), ck ) != -1 );
			toggleSection( kk, this.value ); $(this).prop( "checked", kk );
		});
	}
}

function toggleSection( action, section ){
	if ( section in window.sources ){
		toggleEventSource( action, section );
	} else {
		$.getJSON( 'section/' + section, function(r){
			if ( r.status == 'error' ) return;
			window.sources[section] = r;
			toggleEventSource( action, section );
		});
	}
	updateLink( action, section );
}

function updateLink( action, section ){
	var sc = $.inArray( section, window.checked );
	if ( action ){
		if ( sc == -1 ) window.checked.push( section );
	} else {
		if ( sc != -1 ) window.checked.splice( sc, 1 );
	}
	$("#modlink").html( window.checked.sort().join(',') );
}

function toggleEventSource( action, section ){
	action = ( action ? 'add' : 'remove' ) + 'EventSource';
	$("#calendar").fullCalendar( action, window.sources[section] );
}

function handleEventRender( evt, element ){
	$("<span class='text'/>").text( evt.description ).appendTo( element );
}
