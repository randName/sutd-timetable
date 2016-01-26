function parseTimetable( soup )
{
	var locations = JSON.parse( localStorage.locations );

	function getLoc( loc ){
		for ( var k in locations ){ if(locations[k]==loc) return k; }
		return loc;
	}

	function parseTime( match )
	{
		var time = [ parseInt(match[1]), parseInt(match[2]) ];
		if ( match[3] == "PM" && time[0] != 12 ) time[0]+=12;
		return time.join('.');
	}

	var nw = (new Date()).toISOString().slice(0,10).replace(/-/g,"/");
	var processed=[], pg=$("<div/>").html( soup.replace(/<img[^>]*>/g,"") );
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
			}
			if ( iz.MTG_COMP != '\xa0' ) comp = iz.MTG_COMP;
			var item = {
				c:comp, l:getLoc(iz.MTG_LOC), d:iz.MTG_DATES.split(' - ')[0].replace(/\//g,'.'),
				s:parseTime(treg.exec(iz.MTG_SCHED)), e:parseTime(treg.exec(iz.MTG_SCHED))
			}
			module.sections[class_number].schedule.push(item);
		});
		processed.push( module )
	});
	return processed;
}
