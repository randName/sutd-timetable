function parseTimetable( soup )
{
	function getLoc( loc ){
		for ( var k in window.locations ){
			if ( window.locations[k].indexOf(loc) !== -1 ) return k;
			if ( loc.indexOf(window.locations[k]) !== -1 ) return k;
		}
		console.log(loc);
		return loc;
	}

	function parseTime( match )
	{
		var time = [ parseInt(match[1]), parseInt(match[2]) ];
		if ( match[3] == "PM" && time[0] != 12 ) time[0]+=12;
		return time.join('.');
	}

	window.loadchecked = [];
	var nw = (new Date()).toISOString().slice(0,10).replace(/-/g,"/");
	var processed=[], pg=$("<div/>").html( soup.replace(/<img[^>]*>/g,"") );
	var weekdays = {'Mo': 1, 'Tu': 2, 'We': 3, 'Th': 4, 'Fr': 5};
	$.each( pg.find("div[id^='win0divDERIVED_REGFRM1_DESCR20']"), function(k,s){
		var class_number, comp, section;
		var mod = $(s).find(".PAGROUPDIVIDER").text().split(' - ');
		var code = mod[0].replace(' ','');
		var module = { code:code, title:mod[1], sections:{} };
		$.each( $(s).find("tr[id^='trCLASS_MTG_VW']"), function(k,v){
			var iz = {}, treg = /(\d+):(\d+)(AM|PM)?/g;
			$.each( $(v).find("span[id^='MTG']"), function(k,i){
				var ij = $(i); iz[ij.attr('id').split('$')[0]] = ij.text();
			});
			var cn = $(v).find("span[id^='DERIVED_CLS_DTL_CLASS_NBR']").text();
			if ( cn != '\xa0' ){
				class_number = parseInt(cn);
				if ( iz.MTG_SECTION ) section = iz.MTG_SECTION;
				module.sections[class_number] = { name:section, schedule:[] };
				window.loadchecked.push(cn);
			}
			if ( iz.MTG_COMP != '\xa0' ) comp = iz.MTG_COMP;
			var item = {
				c:comp, l:getLoc(iz.MTG_LOC),
				s:parseTime(treg.exec(iz.MTG_SCHED)), e:parseTime(treg.exec(iz.MTG_SCHED))
			}
			var d, wd = weekdays[iz.MTG_SCHED.split(' ')[0]];
			var dates = iz.MTG_DATES.split(' - ').map(function(d){return moment(d, 'DD/MM/YYYY')});
			if( dates[0].day() != wd ) dates[0].day(wd);
			for( d=dates[0]; d <= dates[1]; d.add(7,'d') ){
				module.sections[class_number].schedule.push($.extend({d:d.format('DD.MM.YYYY')}, item));
			}
		});
		processed.push( module )
	});
	return processed;
}

function loadFile( f ){
	$("#uploadstatus").attr({style:'display:none'});
	if ( f )
	{
		$("#fname").attr({value:f.name});
		if ( f.type != "text/html" ){
			showAlert('warning','<strong>Error:</strong> Not a HTML file.');
		} else if ( f.size > 1000000 ){
			showAlert('warning','<strong>Error:</strong> File too large.');
		} else {
			var r = new FileReader();
			r.onload = function(e){
				var processed = parseTimetable( e.target.result );
				if ( processed.length > 0 ){
					console.log( processed );
					localStorage.processed = JSON.stringify( processed );
				} else {
					showAlert('warning','<strong>Error:</strong> No entries found.');
				}
			}
			r.readAsText( f.slice(0,1024*1024) );
		}
	}
}

function sendData( data ){

	if ( data.length == 0 ) return 0;

	$("#spinner").attr({style:'','class':'fa fa-spinner fa-pulse'});
	$("#buttext").html(" Loading&hellip; ");

	var promises = [], maxv = data.length, curv = 1;
	$("#ubar").attr({style:'width: 1%'}); $("#uprog").attr({style:''});

	$.each( data, function(i,v){
		promises.push( $.ajax( '/upload', {
			type: 'POST', contentType: 'application/json',
			data: JSON.stringify( v ),
			success: function(r){
				$("#ubar").attr({style:'width: '+100*curv/maxv+'%'}).text( r.loaded[0] );
				curv++;
			},
			error: function(){ console.log(r); }
		}));
	});

	$.when.apply(null, promises).done(function(){
		setTimeout(function(){
			$.getJSON( "modules", loadModules );
			$("#uprog").attr({style:'display:none'});
			$("#ualert").addClass("hidden");
		}, 1000);
		$("#spinner").attr({'class':'fa fa-check-circle-o'});
		$("#buttext").html(" Done!");
		showAlert('success','<strong>Success!</strong> Thank you for your submission.');
	});

	localStorage.processed = "[]";

	//$("#spinner").attr({style:'','class':'fa fa-exclamation-triangle'});
	//$("#buttext").html(" Error! Try again");
	//showAlert('warning','<strong>Error:</strong> Upload did not complete.');
}

function showAlert( style, message ){
	$("#uploadstatus").html(message).attr({style:'','class':'alert alert-'+style});
}

function attachUploader(){
	$("#uploader").load( "/static/form.html", "", function(){
		$("#loader").on("change", function(e){ loadFile(e.target.files[0]); });
		$("#ubutt").click(function(e){ sendData( JSON.parse( localStorage.processed ) ); });
	});
}
