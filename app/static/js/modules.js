function loadModules(r){
	if ( $.isEmptyObject(r) ){ return; }
	var mc = [];
	$("#placeholder").hide();
	$("#modulelist").html("");
	$.each( r, function(k,s){ var t=k.split(".")[0]; if ( mc.indexOf(t) == -1 ) mc.push(t); } );
	$.each( mc.sort(), function(i,v){
		$("#modulelist").append($("<div class='panel-group col-sm-6 col-lg-4'/>").attr('id','l'+v));
		$("<button class='btn btn-default active'/>").attr('id','b'+v).text(v).click(function(){
			$(this).toggleClass('active');
			$("#l"+v).toggle();
		}).appendTo("#buttrow");
	});
	var selects = [];
	$.each( r, function(k,s){
		var t=k.split('.'),l=k.replace('.','-');
		var nm = [k, s.title], optg = { text: nm.join(' - '), children: [] };
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
			optg.children.push({
				id: k, section: nm[0]+' ('+v[0]+')', name: nm[1],
				text: nm.concat([v[0]]).join(' - ')
			});
		});
		panel.html(phead.html(ptitle.html(ahead.text(optg.text))));
		$("<div class='panel-collapse collapse'/>").attr('id','m'+l).html(sc).appendTo(panel);
		$('#l'+t[0]).append(panel);
		selects.push(optg);
	});
	$("#modsearch").select2({
		placeholder: "Search for modules...",
		data: selects,
		disabled: false,
		minimumInputLength: 2,
		templateResult: function(data){
			if ( data.loading ) return "Loading...";
			var t=$("<span/>").text(data.name).attr('class','pull-right');
			return $("<div/>").text(data.section).append(t);
		},
		templateSelection: function(data,c){ return data.section; }
	}).on("select2:select", handleSearchbox).on("select2:unselect", handleSearchbox);
	selectMultiple( window.loadchecked );
	$("#toggles").removeClass('hidden');
}

function loadGroups(r){
	window.groups = r;
	var sl=$("<select/>").append($("<option>None</option>"));
	$.each( r, function(k,v){ if (k[0]=='F') $("<option>"+k+"</option>").appendTo(sl); });
	sl.change( function(e){ selectGroup( e.target.value ); } );
	$("#freshy").append(sl).removeClass('hidden');
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
	$("#modlink").html( window.checked.sort().join(',') );
	history.pushState( null, null, "#"+window.checked.sort().join(',') );
}

function selectMultiple( sections ){
	$("#modsearch").val( sections ).trigger("change");
	$(":checkbox").each( function(){
		var kk = sections ? ( $.inArray( this.value, sections ) != -1 ) : false;
		toggleSection( kk, this.value ); $(this).prop( "checked", kk );
	});
}

function handleCheckbox(){
	var vs = $("#modsearch").val();
	if ( $(this).is(':checked') ){
		vs.push( this.value );
	} else {
		vs.splice( $.inArray( this.value, vs ), 1 );
	}
	$("#modsearch").val( vs ).trigger("change");
	toggleSection( $(this).is(':checked'), this.value );
}

function handleSearchbox(e){
	selectMultiple( $("#modsearch").val() );
}

function selectGroup( group ){
	if ( group in window.groups ){
		selectMultiple( window.groups[group] );
		$("#modlink").html( group );
	} else {
		selectMultiple( [] );
	}
}
