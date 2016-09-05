function displayModules( mods ){
	$.each( mods, function(k,s){
		var t=k.split('.'),l=k.replace('.','-');
		var panel = $("<div class='panel panel-primary'/>");
		var phead = $("<div class='panel-heading'/>");
		var ptitle = $("<h3 class='panel-title'/>");
		var ahead=$("<a data-toggle='collapse'/>").attr({'data-parent':'#l'+t[0],'href':'#m'+l});

		var sc = $("<ul class='list-group'/>");
		$.each( s.sections, function(k,v){
			var li = $("<li class='list-group-item list-group-item-info'/>");
			var cb = $("<input type='checkbox'>").attr('value',k);
			var dt = (new Date(v[1]*1000)).toISOString().slice(0,10);
			var lz = $("<label/>").text(v[0]+' (Updated: '+dt+')').prepend(cb);
			sc.append( li.append( $("<div class='checkbox'/>").html(lz) ) );
		});

		panel.html(phead.html(ptitle.html(ahead.text(k+' - '+s.title))));
		$("<div class='panel-collapse collapse'/>").attr('id','m'+l).html(sc).appendTo(panel);
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
	$.getJSON( 'groups', function(r){
		window.groups = r;
		var sl=$("<select/>").append($("<option>None</option>"));
		$.each( r, function(k,v){ if (k[0]=='F') $("<option>"+k+"</option>").appendTo(sl); });
		sl.change( function(e){ selectGroup( e.target.value ); } );
		$("#freshy").append(sl).removeClass('hidden');
	});
	window.sources = {};
	window.checked = [];
}

function handleCheckbox(){
	toggleSection( $(this).is(':checked'), this.value );
	$("#modlink").html( window.checked.sort().join(',') );
}

function selectGroup( group ){
	if ( group in window.groups ){
		var ck = window.groups[group];
		$("#modlink").html( group );
	}
	$(":checkbox").each( function(){
		var kk = ck ? ( $.inArray( this.value, ck ) != -1 ) : false;
		toggleSection( kk, this.value ); $(this).prop( "checked", kk );
	});
}

function toggleSection( action, section ){
	var sc = $.inArray( section, window.checked );
	if ( action != ( sc == -1 ) ) return;
	if ( action ){
		window.checked.push( section );
	} else {
		window.checked.splice( sc, 1 );
	}
	if ( section in window.sources ){
		toggleEventSource( action, section );
	} else {
		$.getJSON( 'section/' + section, function(r){
			if ( r.status == 'error' ) return;
			window.sources[section] = r;
			toggleEventSource( action, section );
		});
	}
}

function toggleEventSource( action, section ){
	action = ( action ? 'add' : 'remove' ) + 'EventSource';
	$("#calendar").fullCalendar( action, window.sources[section] );
}

function handleEventRender( evt, element ){
	$("<span class='text'/>").text( evt.description ).appendTo( element );
}
