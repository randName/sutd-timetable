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
}

function handleEventRender( evt, element ){
	$("<span class='text'/>").text( evt.description ).appendTo( element );
}

function toggleEventSource( action, section ){
	action = ( action ? 'add' : 'remove' ) + 'EventSource';
	$("#calendar").fullCalendar( action, window.sources[section] );
}
