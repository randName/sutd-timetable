function parseTime( match )
{
	var time = [ parseInt(match[1]), parseInt(match[2]) ];
	if ( match[3] == "PM" && time[0] != 12 ) time[0]+=12;
	return time.join('.');
}

function parseTimetable( soup )
{
	var modules = JSON.parse( localStorage.modules );
	var locations = JSON.parse( localStorage.locations );

	function getLoc( loc ){
		for ( var k in locations ){ if(locations[k]==loc) return k; }
		return loc;
	}
	var nw = (new Date()).toISOString().slice(0,10).replace(/-/g,"/");
	var processed = [], pg = $("<div/>").html( soup.replace(/<img[^>]*>/g,"") );
	$.each( pg.find("div[id^='win0divDERIVED_REGFRM1_DESCR20']"), function(k,s){
		var comp, section, schedule = {};
		var mod = $(s).find(".PAGROUPDIVIDER").text().split(' - ');
		var code = mod[0].replace(' ','');
		$.each( $(s).find("tr[id^='trCLASS_MTG_VW']"), function(k,v){
			var iz = {}, treg = /(\d+):(\d+)(AM|PM)?/g;
			$.each( $(v).find("span[id^='MTG']"), function(k,i){
				var ij = $(i); iz[ij.attr('id').split('$')[0]] = ij.text();
			});
			if ( iz.MTG_SECTION ) section = iz.MTG_SECTION;
			if ( iz.MTG_COMP != '\xa0' ) comp = iz.MTG_COMP;
			var item = {
				c:comp, l:getLoc(iz.MTG_LOC), d:iz.MTG_DATES.split(' - ')[0].replace(/\//g,'.'),
				s:parseTime(treg.exec(iz.MTG_SCHED)), e:parseTime(treg.exec(iz.MTG_SCHED))
			}
			if ( section in schedule ){
				schedule[section].push(item);
			} else {
				schedule[section] = [item];
			}
		});

		var cur_sections = [];
	 	if ( code in modules ){
			$.each( modules[code].sections, function(i,z){ cur_sections.push(z[0]) });
		} else {
			modules[code] = { title: mod[1], sections: [] };
			processed.push({ module:code, title:mod[1] });
		}
		$.each( schedule, function(k,v){
			var id = $.inArray( k, cur_sections );
			if ( id == -1 ){
				modules[code].sections.push([k,nw]);
			} else {
				modules[code].sections[id][1] = nw;
			}
			$.each( v, function(i,l){ l.sub = code+'-'+k; processed.push(l); });
		});
	});
	processed.push({'block':'end'});
	localStorage.modules = JSON.stringify( modules );
	return processed;
}
