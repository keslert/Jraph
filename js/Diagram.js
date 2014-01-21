//TODO: Adjusting labels
//TODO: Import Graph from JSON
//TODO: Add new blank graph


var Diagram = function(id, type, data, properties) {
	this.canvasId = id;
	this.outerWrap = id + "-outer";
	this.innerWrap = id + "-inner";
	this.accordionId = id + "-accordion";
	this.type = type;
	this.chart = {};
	this.properties = properties;
	this.data = data;
	this.panel;
	this.panelOpen = "";

	this.refreshTimer = null;
	this.wrap();
	this.refresh();
}

Diagram.prototype.wrap = function() {
	var me = this;
	$("#"+this.canvasId).wrap('<div id="'+ this.outerWrap +'" class="outerWrap" />');
	$("#"+this.canvasId).wrap('<div id="'+ this.innerWrap +'" class="innerWrap" />');
	$("#"+this.innerWrap).resizable().height('300px').width('600px');
	$("#"+this.innerWrap).resize(function(e){
		clearTimeout(me.refreshTimer);
		me.refreshTimer = setTimeout(function() { me.refresh() }, 300);
	});

	this.createNavbar();
}

Diagram.prototype.createNavbar = function() {
	var me = this;
	var list = $("#"+this.outerWrap).append('<div class="options"><ul /></div>').find("ul");
	list.append('<li><a id="'+this.canvasId + '-data" href="#">Data</a></li>');
	$("#"+this.canvasId + "-data").click(function() {
		if(me.panelOpen == "data") {
			me.hidePanel();
			me.panelOpen = "";
		} else {
			me.showPanel(function() { me.showDataPanel() })
			me.panelOpen = "data";
		}
	});
	list.append('<li><a id="'+this.canvasId + '-props" href="#">Properties</a></li>');
	$("#"+this.canvasId + "-props").click(function() {
		if(me.panelOpen == "props") {
			me.hidePanel();
			me.panelOpen = "";
		} else {
			me.showPanel(function() { me.showPropertyPanel() })
			me.panelOpen = "props";
		}
	});
	list.append('<li><a id="'+this.canvasId + '-save" href="#">Download (PNG)</a></li>');
	$("#"+this.canvasId + "-save").click(function() {
		Canvas2Image.saveAsPNG(document.getElementById(me.canvasId));
	});
	list.append('<li><a id="'+this.canvasId + '-export" href="#">Export JSON</a></li>');
	$("#"+this.canvasId + "-export").click(function() {
		me.exportJSON();
	});

}

Diagram.prototype.showPanel = function(panel) {
	this.hidePanel();
	panel();
}

Diagram.prototype.hidePanel = function() {
	$(".data").remove();
}

Diagram.prototype.showPropertyPanel = function() {
	var me = this;

	var uid = this.canvasId+"-labels";
	var list = $("#"+this.outerWrap).append('<div class="data navbar-inner"><h5>Properties:</h5><ul class="form-horizontal" /></div>').find('ul:last');
	list.append('<li class="control-group"><label class="control-label" for="'+uid+'">X Axis Labels</label> \
					<div class="controls"><input type="text" id="'+uid+'" value="'+this.data.labels+'"  /></div></li>');
	$("#"+uid).change(function(){
		me.updateData(me.data, "labels", this.value);
	});
	objForEach(this.properties, function(value, key){
		var uid = me.canvasId + "-" + key;
		list.append('<li class="control-group"><label class="control-label" for="'+uid+'">'+me.splitAndCapitalize(key)+'</label> \
					<div class="controls"><input type="text" id="'+uid+'" value="'+value+'"  /></div></li>');

		$("#"+uid).change(function() {
			me.updateData(me.properties, key, this.value);
		});
	});
}

Diagram.prototype.showDataPanel = function() {
	var me = this;
	
	$("#"+this.outerWrap).append('<div class="data accordion" id='+this.accordionId+'/>');
	forEach(this.data.datasets, function(dataset, i){
		var group = $("#"+me.outerWrap + " .accordion").append('<div class="accordion-group navbar-inner">').find('div:last');
		group.append('<div class="accordion-heading"> \
						<a class="accordion-toggle" data-toggle="collapse" data-parent="#'+me.accordionId+'" href="#'+me.accordionId + i +'">Line '+ (i+1) +'</a> \
					  </div>');

		group.append('<div id="'+me.accordionId + i +'" class="accordion-body collapse"> </div>');
		
		var list = $("#"+me.accordionId + i).append('<ul class="form-horizontal" />').find('ul:last');

		objForEach(dataset, function(value, key){
			var uid = me.canvasId + "-" + key + "-" + i;
			list.append('<li class="control-group"><label class="control-label" for="'+uid+'">'+me.splitAndCapitalize(key)+'</label> \
						<div class="controls"><input type="text" id="'+uid+'" value="'+value+'"  /></div></li>');

			$("#"+uid).change(function(){
				me.updateData(me.data.datasets[i], key, this.value);
			});
		});
	});
}

Diagram.prototype.refreshDataPanel = function() {
	var me = this;
	forEach(this.data.datasets, function(dataset, i) {
		var uid = me.canvasId + "-" + "data-" + i;
		$("#"+uid)[0].value = dataset.data;
	});
}

Diagram.prototype.refreshPropertyPanel = function() {
	$("#"+this.canvasId+"-labels")[0].value = this.data.labels;
}

Diagram.prototype.updateData = function(map, key, value) {
	if(key == "data") {
		// TODO: Validate data
		map[key] = value.split(",");
		this.equalizeData();
		this.refreshDataPanel();
	} else if(key == "labels") {
		// TODO: Validate labels
		map[key] = value.split(",");
		this.equalizeData();
		this.refreshPropertyPanel();
	} else {
		if(value == "true") value = true;
		else if(value == "false") value = false;
		map[key] = value;
	}
	this.refresh();
}

Diagram.prototype.equalizeData = function() {
	var labels = this.data.labels;
	var datasets = this.data.datasets;

	var max = 0;
	forEach(datasets, function(dataset, i) {
		if(dataset.data.length > max)
			max = dataset.data.length;
	});

	for(var i = labels.length; i < max; i++)
		labels.push(i+1);

	forEach(datasets, function(dataset, i) {
		for(var i = dataset.data.length; i < labels.length; i++)
			dataset.data.push(0);
	});
}

Diagram.prototype.splitAndCapitalize = function(string) {
	string = string.charAt(0).toUpperCase() + string.slice(1);
	return string.match(/[A-Z][a-z]+/g).join(" ");
}

Diagram.prototype.refresh = function () {
	var ctx = $("#"+this.canvasId)[0].getContext("2d");
	ctx.canvas.width = $("#"+this.canvasId).width();
	ctx.canvas.height = $("#"+this.canvasId).height();
	this.chart = new Chart(ctx).Line(this.data, this.properties);
	$("#"+this.canvasId).height('100%');
	$("#"+this.canvasId).width('100%');
}

Diagram.prototype.exportJSON = function() {
	alert(json_encode({'properties':this.properties, 'data':this.data}));
}



Diagram.prototype.save = function() {

}

Diagram.prototype.defaultColors = function() {
	return colors = [
		{r:50, g:100, b:150},
		{r:100, g:150, b:50},
		{r:150, g:50, b:100},
		{r:100, g:100, b:100}
	];
}

var forEach = function(a,f){
	for(var i=0; i<a.length; i++){
		f(a[i],i);
	}
}

var objForEach = function(o, f){
	for(var key in o){
		f(o[key], key);
	}
}
