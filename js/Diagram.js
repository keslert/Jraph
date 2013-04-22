var Line = function(id, data, properties) {
	this.id = id;
	this.data = data;
	this.properties = properties;
}

var Diagram = function(id, data, options) {
	this.canvasId = id;
	this.outerWrap = id + "-outer";
	this.innerWrap = id + "-inner";
	this.accordionId = id + "-accordion";
	this.chart = {};
	this.options = options;
	this.data = data;

	this.refreshTimer = null;
	this.wrap();
	this.refresh();
}

Diagram.prototype.wrap = function() {
	var me = this;
	$("#"+this.canvasId).wrap('<div id="'+ this.outerWrap +'" class="outerWrap" />');
	$("#"+this.canvasId).wrap('<div id="'+ this.innerWrap +'" class="innerWrap" />');
	$("#"+this.innerWrap).resizable().height('300px').width('500px');
	$("#"+this.innerWrap).resize(function(e){
		clearTimeout(me.refreshTimer);
		me.refreshTimer = setTimeout(function() { me.refresh() }, 300);
	});

	this.showDataPanel();
}

Diagram.prototype.printLines = function(data) {
	var str = "";
	for(var i = 0; i < data.datasets.length; i++) {
		str += data.datasets[i].data.join() + "\n";
	}
	return str;
}

Diagram.prototype.getLineNumber = function(textarea) {
	return (textarea.value.substr(0, textarea.selectionStart).split("\n").length - 1);
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

Diagram.prototype.showDataPanel = function() {
	var me = this;
	$("#"+this.outerWrap).append('<div class="accordion" id='+this.accordionId+'/>');
	// for(var i = 0; i < this.data.datasets.length; i++) {
	forEach(this.data.datasets, function(dataset, i){
		var group = $("#"+me.outerWrap + " .accordion").append('<div class="accordion-group navbar-inner">').find('div:last');
		group.append('<div class="accordion-heading"> \
						<a class="accordion-toggle" data-toggle="collapse" data-parent="#'+me.accordionId+'" href="#'+me.accordionId + i +'">Line '+ (i+1) +'</a> \
					  </div>');

		group.append('<div id="'+me.accordionId + i +'" class="accordion-body collapse"> </div>');
		
		var list = $("#"+me.accordionId + i).append('<ul class="form-horizontal" />').find('ul:last');
		// for(var key in dataset) {
		objForEach(dataset, function(value, key){
			var uid = me.canvasId + "-" + key + "-" + i;
			list.append('<li class="control-group"><label class="control-label" for="'+uid+'">'+me.splitAndCapitalize(key)+'</label> \
						<div class="controls"><input type="text" id="'+uid+'" value="'+value+'"  /></div></li>');

			$("#"+uid).change(function(){
				me.updateData(i, key, this.value);
				me.refresh();
			});
			
		});
	});
}
Diagram.prototype.bind = function(object) { 
	var method = this, oldArguments = arguments.slice.apply(arguments, [1]); 
	return function() { return method.apply(object, oldArguments); }; 
} 

Diagram.prototype.updateData = function(index, key, value) {
	var old = this.data.datasets[index][key];
	if(key == "data")
		value = value.split(",");
	this.data.datasets[index][key] = value;
}

Diagram.prototype.splitAndCapitalize = function(string) {
	string = string.charAt(0).toUpperCase() + string.slice(1);
	return string.match(/[A-Z][a-z]+/g).join(" ");
}

Diagram.prototype.hideDataPanel = function() {

}

Diagram.prototype.refresh = function () {
	var ctx = $("#"+this.canvasId)[0].getContext("2d");
	ctx.canvas.width = $("#"+this.canvasId).width();
	ctx.canvas.height = $("#"+this.canvasId).height();
	this.chart = new Chart(ctx).Line(this.data, this.options);
	$("#"+this.canvasId).height('100%');
	$("#"+this.canvasId).width('100%');
}

Diagram.prototype.parseLines = function() {
	var lines = $("#"+this.outerWrap + " textarea").val.split("\n");
	for(var i in box) {

	}
}

Diagram.prototype.rename = function() {

}

Diagram.prototype.resize = function() {

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