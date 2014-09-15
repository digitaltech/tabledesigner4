/*
 * ext-tablessettings.js
 *
 */

// Dependencies:
// 1) units.js
// 2) everything else
var tablePaintBox = {fill: null, stroke:null, name: null};
var seatPaintBox = {fill: null, stroke:null, name: null};

svgEditor.addExtension('tablessettings', function() {

	var curConfig = {
			initFill: {
				//'FFFFFF',
				color: svgEditor.curConfig['initFill'].color,  
				//1
				opacity: svgEditor.curConfig['initFill'].opacity 
			},
			initStroke: {
				//1,
				width: svgEditor.curConfig['initStroke'].width, 
				//'000000', // solid black
				color: svgEditor.curConfig['initStroke'].color, 
				//1
				opacity: svgEditor.curConfig['initStroke'].opacity 
			},
			//'jgraduate/images/'
			jGraduatePath: svgEditor.curConfig['jGraduatePath'] 
	};

	function serialize2storage(obj,objectName){
		var name = 'svgedit-' + svgCanvas.canvasName + '-' + objectName;
		var j = JSON.stringify(obj);
		window.localStorage.setItem(name, j);
	};
	
	function loadFromStorage(objectName){
		var name = 'svgedit-' + svgCanvas.canvasName + '-' + objectName;
		var j  = window.localStorage.getItem(name);
		if (j !== "undefined") {
			var jobj = $.parseJSON(j);
			var type = Function.prototype.call.bind( Object.prototype.toString );
			if (type( jobj ) === '[object Object]') { //we handle objects only !
				return jobj;				
			} else {
				return null;
			}			
		} else {
			return null;
		}
	};
	
	var PaintBox = function(container, type, paint) {
		var cur = curConfig[type === 'fill' ? 'initFill' : 'initStroke'];
		var name = $(container).attr('id').indexOf('table') > -1 ? 'table' : 'seat';
		// set up gradients to be used for the buttons
		var svgdocbox = new DOMParser().parseFromString(
			'<svg xmlns="http://www.w3.org/2000/svg"><rect width="50" height="50"\
			fill="#' + cur.color + '" opacity="' + cur.opacity + '"/>\
			<defs><linearGradient id="gradbox_"/></defs></svg>', 'text/xml');
		var docElem = svgdocbox.documentElement;
		
		docElem = $(container)[0].appendChild(document.importNode(docElem, true));
		docElem.setAttribute('width',50);

		this.rect = docElem.firstChild;
		this.defs = docElem.getElementsByTagName('defs')[0];
		this.grad = this.defs.firstChild;
		this.paint = new $.jGraduate.Paint((paint) ? paint : {solidColor: cur.color});
		this.type = type;
		this.name = name;
		this.setPaint = function(paint, apply) {
			this.paint = paint;

			var fillAttr = 'none';
			var ptype = paint.type;
			var opac = paint.alpha / 100;

			switch ( ptype ) {
				case 'solidColor':
					fillAttr = (paint[ptype] != 'none') ? '#' + paint[ptype] : paint[ptype];
					break;
				case 'linearGradient':
				case 'radialGradient':
					this.defs.removeChild(this.grad);
					this.grad = this.defs.appendChild(paint[ptype]);
					var id = this.grad.id = 'gradbox_' + this.name + "_" + this.type;
					fillAttr = 'url(#' + id + ')';
			}

			this.rect.setAttribute('fill', fillAttr);
			this.rect.setAttribute('opacity', opac);

		};
	};

	var colorPicker = function(elem) {
		var picker = elem.attr('id').indexOf('stroke') > -1 ? 'stroke' : 'fill';
		var type = elem.attr('id').indexOf('table') > -1 ? 'table' : 'seat';
		var paint = (type == 'table') ? tablePaintBox[picker].paint : seatPaintBox[picker].paint;
		var title = (picker == 'stroke' ? 'Pick a Stroke Paint and Opacity' : 'Pick a Fill Paint and Opacity');
		var pos = elem.offset();
		$('#color_picker')
			.draggable({cancel: '.jGraduate_tabs, .jGraduate_colPick, .jGraduate_gradPick, .jPicker', containment: 'window'})
			.css(curConfig.colorPickerCSS || {'left': pos.left-140, 'bottom': 40, 'z-index': 1800})
			.jGraduate(
			{
				paint: paint,
				window: { pickerTitle: title },
				images: { clientPath: curConfig.jGraduatePath },
				newstop: 'inverse'
			},
			function(p) {
				paint = new $.jGraduate.Paint(p);
				if (type == 'table') {
					tablePaintBox[picker].setPaint(paint);
				} else {
					//change all seats stroke to new stroke when it is not 00FF00
					//$('circle[name*="seat"][stroke*="' + seatPaintBox.stroke.paint.solidColor + '"]').each(function () {
					$('circle[name*="seat"]:not([stroke*="00FF00"])').each(function () {
							$(this).attr('stroke','#'+paint.solidColor);
					});
					seatPaintBox[picker].setPaint(paint);
				}
				//add the color in the layout.
				svgCanvas.setDocumentSeatStroke(seatPaintBox.stroke.paint.solidColor);
				$('#color_picker').hide();
			},
			function() {
				$('#color_picker').hide();
			}).find("li[class*='grad']").hide();
			//}).find((picker == 'stroke') ? "li[class*='grad']" : "").hide();
	};

	return {
		name: 'tablessettings',
		svgicons: 'extensions/tablessettings-icon.xml',
		buttons: [{
			id: 'tablessettings',
			type: "context",
			panel: 'editor_panel',
			title: 'Configure tables colors',
			events: {
				click: function() {
					$('#colors_settings_box').dialog('open');	
				}
			}
		}],
		callback: function(){			
			$("body").append("<div id='colors_settings_box' />");
			$dialog = $('#colors_settings_box')
			.html('<table class="ui-state-default" id="tables_colors" style="text-align:center; padding: 15px; width:100%;"><tr><td>Tables fill</td><td>Seats fill</td></tr><tr><td><div id="tablesfill_color" /></td><td><div id="seatsfill_color" /></td></tr><tr><td>Tables stroke</td><td>Seats stroke</td></tr><tr><td><div id="tablesstroke_color" /></td><td><div id="seatsstroke_color" /></td></tr></table>')
           .dialog({
               autoOpen: false,
               modal: true,
               resizable: false,
               width:400,
               height:340,
               title: "Tables Colors Settings",
               buttons: {													
					"Ok": function(){
							$(this).dialog("close");
						}
               },
               open: function(){
            	   $('.ui-widget-overlay').addClass('custom-overlay');
            	   $('#colors_settings_box').css('overflow','hidden');
            	   $('#tablesfill_color').css('width',50);
            	   $('#tablesfill_color').css('height',50);
            	   $('#tablesfill_color').css('border','1px solid black');
            	   $('#tablesfill_color').css('display','block');
            	   $('#tablesfill_color').css('margin','0 auto');
            	   $('#tablesstroke_color').css('width',50);
            	   $('#tablesstroke_color').css('height',50);
            	   $('#tablesstroke_color').css('border','1px solid black');
            	   $('#tablesstroke_color').css('display','block');
            	   $('#tablesstroke_color').css('margin','0 auto');
            	   $('#seatsfill_color').css('width',50);
            	   $('#seatsfill_color').css('height',50);
            	   $('#seatsfill_color').css('border','1px solid black');
            	   $('#seatsfill_color').css('display','block');
            	   $('#seatsfill_color').css('margin','0 auto');
            	   $('#seatsstroke_color').css('width',50);
            	   $('#seatsstroke_color').css('height',50);
            	   $('#seatsstroke_color').css('border','1px solid black');
            	   $('#seatsstroke_color').css('display','block');
            	   $('#seatsstroke_color').css('margin','0 auto');
            	   if (!tablePaintBox.fill & !seatPaintBox.fill) {
            		   //check if we have something in the local storage
           				if (!!tablePaintBox_fill && !!tablePaintBox_stroke && !!seatPaintBox_fill && !!seatPaintBox_stroke) {
           				}
            	   }
					$('#tablesfill_color').click(function() {
						colorPicker($('#tablesfill_color'));	           				
					});
					$('#tablesstroke_color').click(function() {
					   colorPicker($('#tablesstroke_color'));	           				
					});
					$('#seatsfill_color').click(function() {
					   colorPicker($('#seatsfill_color'));	           				
					});
					$('#seatsstroke_color').click(function() {
						colorPicker($('#seatsstroke_color'));	           				
					});
               }
           });
			tablePaintBox_fill = loadFromStorage('tablePaintBox_fill');
			tablePaintBox_stroke = loadFromStorage('tablePaintBox_stroke');
			seatPaintBox_fill = loadFromStorage('seatPaintBox_fill');
			seatPaintBox_stroke = loadFromStorage('seatPaintBox_stroke');
			if (!!tablePaintBox_fill && !!tablePaintBox_stroke && !!seatPaintBox_fill && !!seatPaintBox_stroke) {
				if (svgCanvas.getDocumentSeatStroke() !== "") {
					seatPaintBox_stroke.solidColor = svgCanvas.getDocumentSeatStroke();
				}
				tablePaintBox.fill = new PaintBox('#tablesfill_color', 'fill', tablePaintBox_fill);
				tablePaintBox.stroke = new PaintBox('#tablesstroke_color', 'stroke', tablePaintBox_stroke);	                		              					
				seatPaintBox.fill = new PaintBox('#seatsfill_color', 'fill', seatPaintBox_fill);
				seatPaintBox.stroke = new PaintBox('#seatsstroke_color', 'stroke', seatPaintBox_stroke);
   				tablePaintBox['fill'].setPaint(tablePaintBox_fill);
   				tablePaintBox['stroke'].setPaint(tablePaintBox_stroke);
   				seatPaintBox['fill'].setPaint(seatPaintBox_fill);
   				seatPaintBox['stroke'].setPaint(seatPaintBox_stroke);               								
			} else {
   				//nothing so we set a new paintbox
   				seatPaintBox.fill = new PaintBox('#seatsfill_color', 'fill', null);
   				seatPaintBox.stroke = new PaintBox('#seatsstroke_color', 'stroke', null);
   				tablePaintBox.fill = new PaintBox('#tablesfill_color', 'fill', null);
   				tablePaintBox.stroke = new PaintBox('#tablesstroke_color', 'stroke', null);	                		              					
			}
		}, //end callback
		onBeforeUnload: function(){
			if (tablePaintBox.fill.paint) { serialize2storage(tablePaintBox.fill.paint,'tablePaintBox_fill'); }
			if (seatPaintBox.fill.paint) { serialize2storage(seatPaintBox.fill.paint,'seatPaintBox_fill'); } 
			if (tablePaintBox.stroke.paint) { serialize2storage(tablePaintBox.stroke.paint,'tablePaintBox_stroke'); }
			if (seatPaintBox.stroke.paint) { serialize2storage(seatPaintBox.stroke.paint,'seatPaintBox_stroke'); } 
		}, // end beforeunload
		onNewDocument: function(){				
			//set the default stroke color in the layout
			svgCanvas.setDocumentSeatStroke(seatPaintBox.stroke.paint.solidColor);
		}, // end new doc
		onDBOpen: function(){
			//set the seat stroke color
			if (svgCanvas.getDocumentSeatStroke() !== "") {
				seatPaintBox_stroke.solidColor = svgCanvas.getDocumentSeatStroke();
   				seatPaintBox['stroke'].setPaint(seatPaintBox_stroke);               								
			}
		}, // end onDBOpen
	};
});
