$(document).ready(function(){
	$('#calendar').fullCalendar({
		header: { left: 'prev,next today', center: 'title', right:'month,agendaWeek' },
		businessHours: { start: '08:00', end: '20:00' },
		weekends: false, minTime: "06:00:00", maxTime: "22:00:00",
		editable: false,
		defaultView: 'agendaWeek',
		events: [
			{ title: 'test', start: '2016-01-25T09:00:00', end: '2016-01-25T11:00:00' },
		]
	});
});
