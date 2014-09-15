/*
 * ext-shapes.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Christian Tzurcanu
 * Copyright(c) 2010 Alexis Deveria
 *
 */

svgEditor.addExtension('shapes', function() {
	var current_d, cur_shape_id;
	var canv = svgEditor.canvas;
	var cur_shape;
	var start_x, start_y;
	var svgroot = canv.getRootElem();
	var lastBBox = {};

	// This populates the category list
	var categories = {
		//basic: 'Seat',
		
	};

	var library = {
		basic: {
			data: {
				'Seat': 'm1,170.00093l28.45646,-88.40318l74.49956,-54.63682l92.08794,0l74.50002,54.63682l28.45599,88.40318l-28.45599,88.40318l-74.50002,54.63681l-92.08794,0l-74.49956,-54.63681l-28.45646,-88.40318z',
				
				

			},
			buttons: []
		}
	};

	var cur_lib = library.basic;
	var mode_id = 'shapelib';
  var startClientPos = {};

	function loadIcons() {
		$('#shape_buttons').empty().append(cur_lib.buttons);
	}

	function loadLibrary(cat_id) {

		var lib = library[cat_id];

		if (!lib) {
			$('#shape_buttons').html('Loading...');
			$.getJSON('extensions/shapelib/' + cat_id + '.json', function(result) {
				cur_lib = library[cat_id] = {
					data: result.data,
					size: result.size,
					fill: result.fill
				};
				makeButtons(cat_id, result);
				loadIcons();
			});
			return;
		}
		cur_lib = lib;
		if (!lib.buttons.length) makeButtons(cat_id, lib);
		loadIcons();
	}

	function makeButtons(cat, shapes) {
		var size = cur_lib.size || 300;
		var fill = cur_lib.fill || false;
		var off = size * 0.05;
		var vb = [-off, -off, size + off*2, size + off*2].join(' ');
		var stroke = fill ? 0: (size/30);
		var shape_icon = new DOMParser().parseFromString(
			'<svg xmlns="http://www.w3.org/2000/svg"><svg viewBox="' + vb + '"><path fill="'+(fill?'#333':'none')+'" stroke="#000" stroke-width="' + stroke + '" /><\/svg><\/svg>',
			'text/xml');

		var width = 24;
		var height = 24;
		shape_icon.documentElement.setAttribute('width', width);
		shape_icon.documentElement.setAttribute('height', height);
		var svg_elem = $(document.importNode(shape_icon.documentElement,true));

		var data = shapes.data;

		cur_lib.buttons = [];

		for (var id in data) {
			var path_d = data[id];
			var icon = svg_elem.clone();
			icon.find('path').attr('d', path_d);

			var icon_btn = icon.wrap('<div class="tool_button">').parent().attr({
				id: mode_id + '_' + id,
				title: id
			});
			// Store for later use
			cur_lib.buttons.push(icon_btn[0]);
		}
	}

	return {
		svgicons: 'extensions/ext-shapes.xml',
		buttons: [{
			id: 'tool_shapelib',
			type: 'mode_flyout', // _flyout
			position: 6,
			title: 'Add a Seat',
			events: {
				click: function() {
					canv.setMode(mode_id);
				}
			}
		}],
		callback: function() {
			$('<style>').text('\
			#shape_buttons {\
				overflow: auto;\
				width: 180px;\
				max-height: 300px;\
				display: table-cell;\
				vertical-align: middle;\
			}\
			\
			#shape_cats {\
				min-width: 110px;\
				display: table-cell;\
				vertical-align: middle;\
				height: 300px;\
			}\
			#shape_cats > div {\
				line-height: 1em;\
				padding: .5em;\
				border:1px solid #B0B0B0;\
				background: #E8E8E8;\
				margin-bottom: -1px;\
			}\
			#shape_cats div:hover {\
				background: #FFFFCC;\
			}\
			#shape_cats div.current {\
				font-weight: bold;\
			}').appendTo('head');

			var btn_div = $('<div id="shape_buttons">');
			$('#tools_shapelib > *').wrapAll(btn_div);

			var shower = $('#tools_shapelib_show');

			loadLibrary('basic');
			$('#shape_buttons').css("overflow", "visible");
			// Do mouseup on parent element rather than each button
			$('#shape_buttons').mouseup(function(evt) {
				var btn = $(evt.target).closest('div.tool_button');

				if (!btn.length) return;

				var copy = btn.children().clone();
				shower.children(':not(.flyout_arrow_horiz)').remove();
				shower
					.append(copy)
					.attr('data-curopt', '#' + btn[0].id) // This sets the current mode
					.mouseup();
				canv.setMode(mode_id);

				cur_shape_id = btn[0].id.substr((mode_id+'_').length);
				current_d = cur_lib.data[cur_shape_id];

				$('.tools_flyout').fadeOut();
			});

			var shape_cats = $('<div id="shape_cats">');
			var cat_str = '';

			$.each(categories, function(id, label) {
				cat_str += '<div data-cat=' + id + '>' + label + '</div>';
			});

			shape_cats.html(cat_str).children().bind('mouseup', function() {
				var catlink = $(this);
				catlink.siblings().removeClass('current');
				catlink.addClass('current');

				loadLibrary(catlink.attr('data-cat'));
				// Get stuff
				return false;
			});

			shape_cats.children().eq(0).addClass('current');

			$('#tools_shapelib').append(shape_cats);

			shower.mouseup(function() {
				canv.setMode(current_d ? mode_id : 'select');
			});
			$('#tool_shapelib').remove();

			var h = $('#tools_shapelib').height();
			$('#tools_shapelib').css({
				'margin-top': -(h/2 - 15),
				'margin-left': 3
			});
		},
		mouseDown: function(opts) {
			var mode = canv.getMode();
			if (mode !== mode_id) return;

			var x = start_x = opts.start_x;
			var y = start_y = opts.start_y;
			var cur_style = canv.getStyle();
         
      startClientPos.x = opts.event.clientX;
      startClientPos.y = opts.event.clientY;

			cur_shape = canv.addSvgElementFromJson({
				'element': 'path',
				'curStyles': true,
				'attr': {
					'd': current_d,
					'id': canv.getNextId(),
					'opacity': cur_style.opacity / 2,
					'style': 'pointer-events:none'
				}
			});

			// Make sure shape uses absolute values
			if (/[a-z]/.test(current_d)) {
				current_d = cur_lib.data[cur_shape_id] = canv.pathActions.convertPath(cur_shape);
				cur_shape.setAttribute('d', current_d);
				canv.pathActions.fixEnd(cur_shape);
			}
			cur_shape.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(0.005) translate(' + -x + ',' + -y + ')');

			canv.recalculateDimensions(cur_shape);

			var tlist = canv.getTransformList(cur_shape);

			lastBBox = cur_shape.getBBox();

			return {
				started: true
			};
		},
		mouseMove: function(opts) {
			var mode = canv.getMode();
			if (mode !== mode_id) return;

			var zoom = canv.getZoom();
			var evt = opts.event;

			var x = opts.mouse_x/zoom;
			var y = opts.mouse_y/zoom;

			var tlist = canv.getTransformList(cur_shape),
				box = cur_shape.getBBox(),
				left = box.x, top = box.y, width = box.width,
				height = box.height;
			var dx = (x-start_x), dy = (y-start_y);

			var newbox = {
				'x': Math.min(start_x,x),
				'y': Math.min(start_y,y),
				'width': Math.abs(x-start_x),
				'height': Math.abs(y-start_y)
			};

			var tx = 0, ty = 0,
				sy = height ? (height+dy)/height : 1,
				sx = width ? (width+dx)/width : 1;

			sx = (newbox.width / lastBBox.width) || 1;
			sy = (newbox.height / lastBBox.height) || 1;

			// Not perfect, but mostly works...
			if (x < start_x) {
				tx = lastBBox.width;
			}
			if (y < start_y) ty = lastBBox.height;

			// update the transform list with translate,scale,translate
			var translateOrigin = svgroot.createSVGTransform(),
				scale = svgroot.createSVGTransform(),
				translateBack = svgroot.createSVGTransform();

			translateOrigin.setTranslate(-(left+tx), -(top+ty));
			if (!evt.shiftKey) {
				var max = Math.min(Math.abs(sx), Math.abs(sy));

				sx = max * (sx < 0 ? -1 : 1);
				sy = max * (sy < 0 ? -1 : 1);
			}
			scale.setScale(sx,sy);

			translateBack.setTranslate(left+tx, top+ty);
			tlist.appendItem(translateBack);
			tlist.appendItem(scale);
			tlist.appendItem(translateOrigin);

			canv.recalculateDimensions(cur_shape);

			lastBBox = cur_shape.getBBox();
		},
		mouseUp: function(opts) {
			var mode = canv.getMode();
			if (mode !== mode_id) return;
         
      var keepObject = (opts.event.clientX != startClientPos.x && opts.event.clientY != startClientPos.y);

			return {
				keep: keepObject,
				element: cur_shape,
				started: false
			};
		}
	};
});

