function attachCalendar(){
	$('#calendar').fullCalendar({
		header: { left: 'prev,next today', center: 'title', right:'month,agendaWeek' },
		businessHours: { start: '08:00', end: '20:00' },
		weekends: false, minTime: "07:30:00", maxTime: "20:30:00",
		editable: false,
		defaultView: 'agendaWeek',
	});
}

function handleCheckbox()
{
	var action = ( $(this).is(':checked') ? 'add' : 'remove' ) + 'EventSource';
	var section = this.value;
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
	$("#calendar").fullCalendar( action, window.sources[section] );
}
