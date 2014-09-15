/*
 * ext-tables.js
 *

*/
    
/* 
	It adds the tables management buttons in the top panel. 
	Click on the button will show the management interface to add tables.
*/

svgEditor.addExtension("Tables", function(S) {

		// default and saved form values
		var tablefill = svgEditor.curConfig['initFill'].color;
		var tablestroke = svgEditor.curConfig['initStroke'].color;
		var seatfill = svgEditor.curConfig['initFill'].color;
		var seatstroke = svgEditor.curConfig['initStroke'].color;
		var table_type = "square";
		var local_seatradius = 10;
		var local_seats_across = 4;
		var local_seats_down = 4;
		var local_seats_horizontal_top=2;
		var local_seats_horizontal_bottom=2;
		var local_seats_vertical_left=2;
		var local_seats_vertical_right=2;
		var local_size_across = "";
		var local_size_down = "";
		var local_top_seats_horizontal_top = 5;    
		var local_spring_seats_vertical_left = 3;    
		var local_spring_seats_vertical_right = 3;
		var local_spring_seats_horizontal_bottom = 1;
		var local_top_size_across = "";
		var local_top_size_down = "";
		var local_spring_size_across = "";
		var local_spring_size_down = "";

		var $dialog;
		
		var opts;
		// keep track of assigned seats & created tables.
		// this array must be saved with the current layout
		var tables = new Array();
		var drawing = false;
		//var bb = null;
		var square_form = 	"<div id='square_form' style='padding:2px; background:#fff;'> " + 
								"<form id='create_square_table_form'>" +
								"<div id='div_table_name'>" +
    							"	<label for='table_name'>Name:</label> "+
    							"	<input type='text' name='table_name' id='table_name' value=''  />"+
								"</div>  "+
								"<fieldset id='field_seat' class='boxfields'> "+
								"	<div id='left' style='height:300px;' class='left ui-state-default'>" +
								"		<div id='table_seats' class='ui-widget-header'>Seats</div>" +
								"		<div id='div_seats'>" +
								"			<div class='div_separator'>" +
    							"				<label for='seats_across' id='label_seats_across'>Seats across:</label> "+
    							"				<input type='text' name='seats_across' id='seats_across' value=''/><br>"+
								"			</div>" +
    							"			<div id='seats_total'><div id='seats_total_name'># of seats per table: </div><div id='seats_total_value'>8</div></div>"+
    							"		</div>  "+
								"		<div id='table_size' class='ui-widget-header'>Table size</div>" +
								"		<div id='div_size'>" +
								"			<div class='div_separator'>" +
    							"				<label for='size_across' id='label_size_across'>Across:</label> "+
    							"				<input type='text' name='size_across' id='size_across' value=''  />"+
								"			</div>" +
    							"		</div>  "+
								"		<div id='div_note' class='boxdiv'>" +
    							"			<label for='note_text'>Notes:</label> "+
    							"			<textarea name='note_text' id='note_text' value='' rows='2' cols='30' />"+
    							"		</div>  "+
    							"	</div>  "+
								"</fieldset>"+
								"</form>" +
								"</div>"; // end square

		var rectangle_form = 	"<div id='rectangle_form' style='padding:2px; background:#fff;'> " + 
								"<form id='create_rectangle_table_form'>" +
								"<div id='div_table_name'>" +
    							"	<label for='table_name'>Name:</label> "+
    							"	<input type='text' name='table_name' id='table_name' value=''  />"+
								"</div>  "+
								"<fieldset id='field_seat' class='boxfields'> "+
								"	<div id='left' style='height:400px;' class='left ui-state-default'>" +
								"		<div id='table_seats' class='ui-widget-header'>Seats</div>" +
								"		<div id='div_seats'>" +
								"			<div class='div_separator'>" +
    							"				<label for='seats_across' id='label_seats_across'>Seats across (horizontal):</label> "+
    							"				<input type='text' name='seats_across' id='seats_across' value=''/><br>"+
								"			</div>" +
								"			<div class='div_separator'>" +
    							"				<label for='seats_down' id='label_seats_down'>Seats down (vertical):</label> "+
    							"				<input type='text' name='seats_down' id='seats_down' value=''/><br>"+
								"			</div>" +
    							"			<div id='seats_total'><div id='seats_total_name'># of seats per table: </div><div id='seats_total_value'>14</div></div>"+
    							"		</div>  "+
								"		<div id='table_size' class='ui-widget-header'>Table size</div>" +
								"		<div id='div_size'>" +
								"			<div class='div_separator'>" +
    							"				<label for='size_across' id='label_size_across'>Across:</label> "+
    							"				<input type='text' name='size_across' id='size_across' value=''  />"+
								"			</div>" +
								"			<div class='div_separator'>" +
    							"				<label for='size_down' id='label_size_down'>Down:</label> "+
    							"				<input type='text' name='size_down' id='size_down' value=''  />"+
								"			</div>" +
    							"		</div>  "+
								"		<div id='div_note' class='boxdiv'>" +
    							"			<label for='note_text'>Notes:</label> "+
    							"			<textarea name='note_text' id='note_text' value='' rows='2' cols='30' />"+
    							"		</div>  "+
    							"	</div>  "+
								"</fieldset>"+
								"</form>" +
								"</div>"; // end rectangle

		var custom_form = 	"<div id='custom_form' style='padding:5px; background:#fff;'> " + 
								"<form id='create_custom_table_form'>" +
								"<div id='div_table_name'>" +
								"	<label for='table_name'>Name:</label> "+
								"	<input type='text' name='table_name' id='table_name' value=''  />"+
								"</div>  "+
								"<fieldset id='field_seat' class='boxfields'> "+
								"	<div id='left' style='height:290px;' class='left ui-state-default'>" +
								"		<div id='table_seats' class='ui-widget-header'>Seats</div>" +
								"		<div id='div_seats'>" +
								"			<div class='div_separator'>" +
								"				<label for='seats_horizontal_top' id='label_seats_horizontal_top'>Seats across (horizontal top):</label> "+
								"				<input type='text' name='seats_horizontal_top' id='seats_horizontal_top' value=''/><br>"+
								"			</div>" +
								"			<div class='div_separator'>" +
								"				<label for='seats_horizontal_bottom' id='label_seats_horizontal_bottom'>Seats across (horizontal bottom):</label> "+
								"				<input type='text' name='seats_horizontal_bottom' id='seats_horizontal_bottom' value=''/><br>"+
								"			</div>" +
								"			<div class='div_separator'>" +
								"				<label for='seats_vertical_left' id='label_seats_vertical_left'>Seats down (vertical left):</label> "+
								"				<input type='text' name='seats_vertical_left' id='seats_vertical_left' value=''/><br>"+
								"			</div>" +
								"			<div class='div_separator'>" +
								"				<label for='seats_vertical_right' id='label_seats_vertical_right'>Seats down (vertical right):</label> "+
								"				<input type='text' name='seats_vertical_right' id='seats_vertical_right' value=''/><br>"+
								"			</div>" +
								"			<div id='seats_total'><div id='seats_total_name'># of seats per table: </div><div id='seats_total_value'>8</div></div>"+
								"		</div>  "+
								"	</div>  "+
								"	<div id='right' style='height:290px;' class='left ui-state-default'>" +
								"		<div id='table_size' class='ui-widget-header'>Table size</div>" +
								"		<div id='div_size'>" +
								"			<div class='div_separator'>" +
								"				<label for='size_across' id='label_size_across'>Across:</label> "+
								"				<input type='text' name='size_across' id='size_across' value=''  />"+
								"			</div>" +
								"			<div class='div_separator'>" +
								"				<label for='size_down' id='label_size_down'>Down:</label> "+
								"				<input type='text' name='size_down' id='size_down' value=''  />"+
								"			</div>" +
								"		</div>  "+
								"		<div id='div_note' class='boxdiv'>" +
								"			<label for='note_text'>Notes:</label> "+
								"			<textarea name='note_text' id='note_text' value='' rows='3' cols='30' />"+
								"		</div>  "+
								"	</div>  "+
								"</fieldset>"+
								"</form>" +
								"</div>"; // end custom
								
		var circle_form = 	"<div id='circle_form' style='padding:5px; background:#fff;'> " + 
								"<form id='create_circle_table_form'>" +
								"<div id='div_table_name'>" +
    							"	<label for='table_name'>Name:</label> "+
    							"	<input type='text' name='table_name' id='table_name' value=''  />"+
								"</div>  "+
								"<fieldset id='field_seat' class='boxfields'> "+
								"	<div id='left' style='height:290px;' class='left ui-state-default'>" +
								"		<div id='table_seats' class='ui-widget-header'>Seats</div>" +
								"		<div id='div_seats'>" +
								"			<div class='div_separator'>" +
    							"				<label for='seats_across' id='label_seats_across'>Seats around the table:</label> "+
    							"				<input type='text' name='seats_across' id='seats_across' value=''/><br>"+
								"			</div>" +
    							"		</div>  "+
								"		<div id='table_size' class='ui-widget-header'>Table size</div>" +
								"		<div id='div_size'>" +
								"			<div class='div_separator'>" +
    							"				<label for='size_across' id='label_size_across'>Diameter:</label> "+
    							"				<input type='text' name='size_across' id='size_across' value=''  />"+
								"			</div>" +
    							"		</div>  "+
								"		<div id='div_note' class='boxdiv'>" +
    							"			<label for='note_text'>Notes:</label> "+
    							"			<textarea name='note_text' id='note_text' value='' rows='2' cols='30' />"+
    							"		</div>  "+
    							"	</div>  "+
								"</fieldset>"+
								"</form>" +
								"</div>"; //end circle

		var oval_form = 	"<div id='oval_form' style='padding:10px; background:#fff;'> " + 
								"<form id='create_oval_table_form'>" +
								"<div id='div_table_name'>" +
    							"	<label for='table_name'>Name:</label> "+
    							"	<input type='text' name='table_name' id='table_name' value=''  />"+
								"</div>  "+
								"<fieldset id='field_seat' class='boxfields'> "+
								"	<div id='left' style='height:290px;' class='left ui-state-default'>" +
								"		<div id='table_seats' class='ui-widget-header'>Seats</div>" +
								"		<div id='div_seats'>" +
								"			<div class='div_separator'>" +
    							"				<label for='seats_across' id='label_seats_across'>Seats around the table:</label> "+
    							"				<input type='text' name='seats_across' id='seats_across' value=''/><br>"+
								"			</div>" +
    							"		</div>  "+
								"		<div id='table_size' class='ui-widget-header'>Table size (Mandatory)</div>" +
								"		<div id='div_size'>" +
								"			<div class='div_separator'>" +
    							"				<label for='size_across' id='label_size_across'>Height:</label> "+
    							"				<input type='text' name='size_across' id='size_across' value=''  />"+
								"			</div>" +
    							"		</div>  "+
								"		<div id='div_note' class='boxdiv'>" +
    							"			<label for='note_text'>Notes:</label> "+
    							"			<textarea name='note_text' id='note_text' value='' rows='2' cols='30' />"+
    							"		</div>  "+
    							"	</div>  "+
								"</fieldset>"+
								"</form>" +
								"</div>"; // end oval

		var seats_form = 	"<div id='seats_form' style='padding:10px; background:#fff;'> " + 
								"<form id='create_seats_table_form'>" +
								"<div id='div_table_name'>" +
								"	<label for='table_name'>Name:</label> "+
								"	<input type='text' name='table_name' id='table_name' value=''  />"+
								"</div>  "+
								"<fieldset id='field_seat' class='boxfields'> "+
								"	<div id='left' style='height:240px;' class='left ui-state-default'>" +
								"		<div id='table_seats' class='ui-widget-header'>Seats</div>" +
								"		<div id='div_seats'>" +
								"			<div class='div_separator'>" +
								"				<label for='seats_across' id='label_seats_across'>Seats:</label> "+
								"				<input type='text' name='seats_across' id='seats_across' value=''/><br>"+
								"			</div>" +
								"		</div>  "+
								"		<div id='table_size' class='ui-widget-header'>Table size</div>" +
								"		<div id='div_size'>" +
								"			<div class='div_separator'>" +
    							"				<label for='size_across' id='label_size_across'>Across:</label> "+
    							"				<input type='text' name='size_across' id='size_across' value=''  />"+
								"			</div>" +
    							"		</div>  "+
								"		<div id='div_note' class='boxdiv'>" +
								"			<label for='note_text'>Notes:</label> "+
								"			<textarea name='note_text' id='note_text' value='' rows='2' cols='30' />"+
								"		</div>  "+
								"	</div>" +
								"</fieldset>"+
								"</form>" +
								"</div>"; // end seats row
		
		var eshaped_form = 	"<div id='eshaped_form' style='padding:5px; background:#fff;'> " + 
		"<form id='create_eshaped_table_form'>" +
		"<div id='div_table_name'>" +
		"	<label for='table_name'>Name:</label> "+
		"	<input type='text' name='table_name' id='table_name' value=''  />"+
		"</div>  "+
		"<fieldset id='field_seat' class='boxfields'> "+
		"	<div id='left' style='height:370px;' class='left ui-state-default'>" +
		"		<div id='table_top_seats' class='ui-widget-header'>Top Table Seats</div>" +
		"		<div id='div_top_seats'>" +
		"			<div class='div_separator'>" +
		"				<label for='top_seats_horizontal_top' id='label_top_seats_horizontal_top'>Seats across (horizontal top):</label> "+
		"				<input type='text' name='top_seats_horizontal_top' id='top_seats_horizontal_top' value=''/><br>"+
		"			</div>" +
		"		</div>  "+
		"		<div id='table_spring_seats' class='ui-widget-header'>Spring Table Seats</div>" +
		"		<div id='div_spring_seats'>" +
		"			<div class='div_separator'>" +
		"				<label for='spring_seats_vertical_left' id='label_spring_seats_vertical_left'>Seats down (vertical left):</label> "+
		"				<input type='text' name='spring_seats_vertical_left' id='spring_seats_vertical_left' value=''/><br>"+
		"			</div>" +
		"			<div class='div_separator'>" +
		"				<label for='spring_seats_vertical_right' id='label_spring_seats_vertical_right'>Seats down (vertical right):</label> "+
		"				<input type='text' name='spring_seats_vertical_right' id='spring_seats_vertical_right' value=''/><br>"+
		"			</div>" +
		"			<div class='div_separator'>" +
		"				<label for='spring_seats_horizontal_bottom' id='label_spring_seats_horizontal_bottom'>Seats across (horizontal bottom):</label> "+
		"				<input type='text' name='spring_seats_horizontal_bottom' id='spring_seats_horizontal_bottom' value=''/><br>"+
		"			</div>" +
		"		</div>  "+
		"		<div id='seats_total'><div id='seats_total_name'># of seats per table: </div><div id='seats_total_value'>8</div></div>"+
		"	</div>" +
		"	<div id='right' style='height:370px;' class='right ui-state-default'>" +
		"		<div id='top_table_size' class='ui-widget-header'>Top Table size</div>" +
		"		<div id='div_top_size'>" +
		"			<div class='div_separator'>" +
		"				<label for='top_size_across' id='top_label_size_across'>Across:</label> "+
		"				<input type='text' name='top_size_across' id='top_size_across' value=''  />"+
		"			</div>" +
		"			<div class='div_separator'>" +
		"				<label for='top_size_down' id='top_label_size_down'>Down:</label> "+
		"				<input type='text' name='top_size_down' id='top_size_down' value=''  />"+
		"			</div>" +
		"		</div>  "+
		"		<div id='spring_table_size' class='ui-widget-header'>Spring Table size</div>" +
		"		<div id='div_spring_size'>" +
		"			<div class='div_separator'>" +
		"				<label for='spring_size_across' id='spring_label_size_across'>Across:</label> "+
		"				<input type='text' name='spring_size_across' id='spring_size_across' value=''  />"+
		"			</div>" +
		"			<div class='div_separator'>" +
		"				<label for='spring_size_down' id='spring_label_size_down'>Down:</label> "+
		"				<input type='text' name='spring_size_down' id='spring_size_down' value=''  />"+
		"			</div>" +
		"			<div class='div_separator'>" +
		"				<label for='note_text'>Notes:</label> "+
		"				<textarea name='note_text' id='note_text' value='' rows='2' cols='30' />"+
		"			</div>" +
		"		</div>  "+
		"	</div>" +
		"</fieldset>"+
		"</form>" +
		"</div>"; // end e-shaped
		
		Object.size = function(obj) {
		    var size = 0;
		    for (var key in obj) {
		        if (obj.hasOwnProperty(key)) size++;
		    }
		    return size;
		};
				
		function serialize2storage(obj,objectName){
			var name = 'svgedit-' + svgCanvas.canvasName + '-' + objectName;
			var j = JSON.stringify(obj);
			window.localStorage.setItem(name, j);
		};
		
		function loadFromStorage(objectName){
			var name = 'svgedit-' + svgCanvas.canvasName + '-' + objectName;
			var j  = window.localStorage.getItem(name);
			var jobj = $.parseJSON(j);
			var type = Function.prototype.call.bind( Object.prototype.toString );
			/*
		    var result = [];
		    var keys = Object.keys(jobj);
		    keys.forEach(function(key){
		        result.push(jobj[key]);
		    });
		    return result;
*/			
			if (!jobj || (type( jobj ) === '[object Object]')) {
				return [];
			} else {
				return jobj;				
			}
			//return $.parseJSON(j);
		};
		
		/*function updateColors(){
			tablefill = (!!tablePaintBox.fill && !!tablePaintBox.fill.paint) ? tablePaintBox.fill.paint.solidColor : tablefill;
			tablestroke = (!!tablePaintBox.stroke && !!tablePaintBox.stroke.paint) ? tablePaintBox.stroke.paint.solidColor : tablestroke;
			seatfill = (!!seatPaintBox.fill && !!seatPaintBox.fill.paint) ? seatPaintBox.fill.paint.solidColor : seatfill;
			seatstroke = (!!seatPaintBox.stroke && !!seatPaintBox.stroke.paint) ? seatPaintBox.stroke.paint.solidColor : tablestroke;
		};*/
		
		function resetLocals(){
			tables = new Array();
			local_seatradius = 10;
			local_seats_across = 4;
			local_seats_down = 4;
			local_seats_horizontal_top=2;
			local_seats_horizontal_bottom=2;
			local_seats_vertical_left=2;
			local_seats_vertical_right=2;
			local_size_across = "";
			local_size_down = "";
		};

		function loadTablesFromSVG(svgstr){
			var xmlDoc = $.parseXML(svgstr);
			$xml = $( xmlDoc );
			$xml.find('g[id*="Table"]').each(function () {
				addTable($(this).attr('id'));
			});
			
		};
		
		function isTableExist(name) {
			var found=false;
			var i=0;
			while(!found && i< tables.length){
				if (name === tables[i][0]){
					found=true;
				}
				i++;
			}
			return found; //true if key exist			
		};

		function addTable(name, seats) {
			//for (var i=0; i<seats;i++){
			//	if (name in tables) {
			//		tables[name][i]=null;
			//	} else {
					tables.push([name,new Array()]);
			//	}
			//}
			return tables;
		};

		function addseat(tablename) {
			// a[table1][0]
			// a[table1][1]
			// a[table1][2]
			
			// a[table3][6]
			// a[table3][7]
			// a[table3][8]		
			var seatsnumbers = new Array();
			// extract and sort all numbers
			for (var i=0; i<tables.length; i++){
				var seats = tables[i][1];
				for (var j=0; j<seats.length; j++){
					seatsnumbers.push(seats[j]);
				}
			}
			seatsnumbers.sort(function(a, b) {
				if (a < b) {
					return -1;
				} else if (a > b) {
					return 1;
				} else {
					return 0;
				}
			}); //sort by numbers
			// find missing numbers			
			var id = -1;
			var missingnumber=-1;
			var k=0;
			while (k<seatsnumbers.length && missingnumber === -1){				
				if (seatsnumbers[k] - id > 1 ) {
					missingnumber = id+1;
				}
				id = seatsnumbers[k];
				k++;
			}
			var i=0;
			var found=false;
			var sid = -1;
			while(i<tables.length && !found){
				if (tablename === tables[i][0]){
					//add our missing seat or new seat
					var seats = tables[i][1];
					if (missingnumber > -1) {
						sid = missingnumber;
						seats.push(sid);
						
					} else {
						sid = seatsnumbers.length;
						seats.push(sid);
						
					}	
					found = true;
				}	
				i++;
			}
			//sort the tables by seat number
			tables.sort(function(a, b) {
				if (a[1][0] < b[1][0]) {
					return -1;
				} else if (a[1][0] > b[1][0]) {
					return 1;
				} else {
					return 0;
				}
			});
			return sid;
		};
		
		function removeTable(name) {
			var i=tables.length-1;
			var found=false;
			while(i>=0 && !found){
				if (name === tables[i][0]){
					//add our missing seat or new seat
					tables.splice(i,1);
					found = true;
				}	
				i--;
			}
			return tables;
		};
		
		function showPanel(on){
	        $('#tables_panel').toggle(on);
	    };
	    
	    //********************************************************* //
	    //				Base Drawing functions						//
	    //********************************************************* //
	    
	    function drawBaseSquare(x1,y1,x2,y2,id,color,stroke) {
			//alert(S.getNextId());
			 comId = S.getNextId() ; //this comId will be used in circles in data- attribute
	        return S.addSvgElementFromJson({
	            "element": "rect",
	            "attr": {
	                "x": x1,
	                "y": y1,
	                "width": x2,
	                "height": y2,
	                "id": comId,
	                "name": id,
	                "opacity": 0.75,
	                "stroke": "#"+stroke,
	                "stroke-width": 1,
	                "fill": "#"+color,
					"data-comId" : comId //the draw square also uses this data attribute
	                }
	            });
				
	    };

	    function drawBaseEllipse(x1,y1,a,b,id,color,stroke) {	    	
	    	//<ellipse ry="155.76923" rx="400.96154" id="svg_69" cy="818.26929" cx="512.50004" stroke="#000000" fill="#FFFFFF"/>
	    	return S.addSvgElementFromJson({
                "element": "ellipse",
                "attr": {
                        "cx": x1,
                        "cy": y1,
                        "rx": a,
                        "ry": b,
                        "id": S.getNextId(),
                        "name": id,
                        "stroke": "#"+stroke,
                        "stroke-width": 1,
                        "opacity": 0.75,
		                "fill": "#"+color
	                }
    	    });
	    };
	    
	    function drawBaseCircle(x1,y1,r,id,color,stroke) {
				
			
	    	return S.addSvgElementFromJson({
                "element": "circle",
                "attr": {
                        "cx": x1,
                        "cy": y1,
                        "r": r,
                        "id": S.getNextId(),
                        "name": id,
                        "stroke": "#"+stroke,
                        "stroke-width": 1,
                        "opacity": 1,
		                "fill": "#"+color,
						"data-comId" : comId //assigning a common id to all the circles and also assign same to rectanle
	                }
    	    });
	    };
	    
	    //********************************************************* //
	    //			    Tables Drawing functions					//
	    //********************************************************* //

	    function drawRectangleTable(n,m,W,H,r,tablename, type) {
			//alert(n+":"+m+":"+W+":"+H+":"+r+":"+tablename+":"+type);
			//set the table size if W or H is empty
			
			if (type) { //rect
				if (isNaN(W)) {
					if (n > 0) {
						W = n*r*2;
					} else {
						W = r*2;
					}
				}
				if  (isNaN(H)) {
					if (m > 0) {
						H = m*r*2;
					} else {
						H = r*2;
					}
				}
			} else {
				if (isNaN(W)) {
					W = n*r*2;
					H = W;
				}
			}
			//Center the table based on click
            rectx1 = opts.start_x - (W/2);
            recty1 = opts.start_y - (H/2);

            rectx2 = opts.start_x + (W/2);
            recty2 = opts.start_y + (H/2);
            //alert(opts.start_y + (H/2));
            //pygame.draw.rect(window,color, ( int(rectx1), int(recty1), int(rectx2-rectx1), int(recty2-recty1) ), 1)
            var elems = new Array(1);
            elems.push(drawBaseSquare(rectx1,recty1,rectx2-rectx1,recty2-recty1,"table",tablefill,tablestroke));
            //position of circle on each sides
            hcspace = (rectx2-rectx1)/(n*2);
            vcspace = (recty2-recty1)/(m*2);
            var sid = 0;
            for (var i=1; i <= n*2; i = i + 2) { 
            //for i in range(1,n*2,2):
                    //pygame.draw.circle(window, color, (int(rectx1+(cspace*i)),int(recty1-r)), r,1);
            		sid = addseat(tablename) + 1;
		            elems.push(drawBaseCircle(rectx1+(hcspace*i),recty1-r,r,"seat"+sid,seatfill,seatstroke));
			        //pygame.draw.circle(window, color, (int(rectx1+(cspace*i)),int((recty1+H)+r)), r,1);
		            sid = addseat(tablename) + 1;
		            elems.push(drawBaseCircle(rectx1+(hcspace*i),recty2+r,r,"seat"+sid,seatfill,seatstroke));
            }
            for (i = 1; i <= m*2; i = i + 2) { 
                    //pygame.draw.circle(window, color, (int(rectx1-r),int(recty1+(cspace*i))), r,1);
            		sid = addseat(tablename) + 1;
		            elems.push(drawBaseCircle((rectx1-r),(recty1+(vcspace*i)),r,"seat"+sid,seatfill,seatstroke));
                    //pygame.draw.circle(window, color, (int(rectx1+W+r),int(recty1+(cspace*i))), r,1);
		            sid = addseat(tablename) + 1;
		            elems.push(drawBaseCircle((rectx1+W+r),(recty1+(vcspace*i)),r,"seat"+sid,seatfill,seatstroke));
		    }
		    var t; 
    	    //t.textContent = "This is a very very long text";
		    if (n == 0) {
		    	t = S.addSvgElementFromJson({
	                "element": "g",
	                "attr": {
	                        "x": rectx1,
	                        "y": recty1+15,
	                        "id": "text_" + S.getNextId()
		                }
	    	    });
	    	    textFlow(tablename,t,rectx2-rectx1,rectx1+(rectx2-rectx1)/2,recty1+15,15,false);	
		    } else {
		    	t = S.addSvgElementFromJson({
	                "element": "g",
	                "attr": {
	                        "x": rectx1+(rectx2-rectx1)/2,
	                        "y": recty1+15,
	                        "id": "text_" + S.getNextId()
		                }
	    	    });
	    	    textFlow(tablename,t,rectx2-rectx1,rectx1+(rectx2-rectx1)/2,recty1+15,15,false);		    			    	
		    }
    	    elems.push(t);
			S.groupElements(elems,tablename,undefined,"table");
    	    //move to top
			t.parentNode.appendChild(t);  
		}; // end drawRectangleTable
		
		function drawCustomTable(	n,			//#seats top
									m,			//#seats left
									o,			//#seats bottom
									p,			//#seats right
									W,			//horiz size
									H,			//vert size
									r,			//the seat radius
									tablename,	//the table name
									pos,			//defined position (option)
									tableid,		//the table id (option)
									type			//table type (option)
								) {
			if (isNaN(W)) {		//horizontal
				if ( (o > 0) && (n >= 0) && (n >= o) ) {			// both sides are more than 0 but top is larger than bottom
					W = n*r*2;
				} else if ( (o > 0) && (n > 0) && (o > n) ) {  	// both sides are more than 0 but bottom is larger than top
					W = o*r*2;					
				} else if ( (n == 0) && (o > 0) ) { 			// top is at 0 but bottom is more than 0
					W = o*r*2;										
				} else if ( (o == 0) && (n > 0) ) { 			// bottom is at 0 but top is more than 0
					W = n*r*2;										
				} else {										// both sides are set at 0 then need to set size to default 
					W = r*2;
				}
			}
			if  (isNaN(H)) {	//vertical
				if ( (p > 0) && (m > 0) && (m >= p) ) {			// both sides are more than 0 but left is larger than right
					H = m*r*2;
				} else if ( (p > 0) && (m > 0) && (p >= m) ) {  // both sides are more than 0 but right is larger than left
					H = p*r*2;					
				} else if ( (m == 0) && (p > 0) ) { 			// left is at 0 but right is more than 0
					H = p*r*2;										
				} else if ( (p == 0) && (m > 0) ) { 			// right is at 0 but left is more than 0
					H = m*r*2;										
				} else {										// both sides are set at 0 then need to set size to default 
					H = r*2;
				}
			}
			tableid = tableid || tablename;
			type = type || "";
			if (pos === undefined) {
				//Center the table based on click
	            rectx1 = opts.start_x - (W/2);
	            recty1 = opts.start_y - (H/2);
	            rectx2 = opts.start_x + (W/2);
	            recty2 = opts.start_y + (H/2);				
			} else {
				//use the given position
	            rectx1 = pos.start_x1;
	            recty1 = pos.start_y1;
	            rectx2 = pos.start_x2;
	            recty2 = pos.start_y2;				
			}
            //alert(opts.start_y + (H/2));
            //pygame.draw.rect(window,color, ( int(rectx1), int(recty1), int(rectx2-rectx1), int(recty2-recty1) ), 1)
            var elems = new Array(1);
            elems.push(drawBaseSquare(rectx1,recty1,rectx2-rectx1,recty2-recty1,"table",tablefill,tablestroke));
            //position of circle on each sides
            htcspace = (rectx2-rectx1)/(n*2);
            hbcspace = (rectx2-rectx1)/(o*2);
            vlcspace = (recty2-recty1)/(m*2);
            vrcspace = (recty2-recty1)/(p*2);
            var sid = 0;
            for (var i=1; i <= n*2; i = i + 2) { 
            	sid = addseat(tableid) + 1;
		        elems.push(drawBaseCircle(rectx1+(htcspace*i),recty1-r,r,"seat"+sid,seatfill,seatstroke));
            }
            for (var i=1; i <= o*2; i = i + 2) { 
            	sid = addseat(tableid) + 1;
        		elems.push(drawBaseCircle(rectx1+(hbcspace*i),recty2+r,r,"seat"+sid,seatfill,seatstroke));
            }
            for (i = 1; i <= m*2; i = i + 2) { 
            	sid = addseat(tableid) + 1;
        		elems.push(drawBaseCircle((rectx1-r),(recty1+(vlcspace*i)),r,"seat"+sid,seatfill,seatstroke));
		    }
            for (i = 1; i <= p*2; i = i + 2) { 
            	sid = addseat(tableid) + 1;
        		elems.push(drawBaseCircle((rectx1+W+r),(recty1+(vrcspace*i)),r,"seat"+sid,seatfill,seatstroke));
            }
		    var t; 
		    if ( (n == 0) && (o == 0) ) {
		    	t = S.addSvgElementFromJson({
	                "element": "g",
	                "attr": {
	                        "x": rectx1,
	                        "y": recty1+15,
	                        "id": "text_" + S.getNextId()
		                }
	    	    });
	    	    textFlow(tablename,t,rectx2-rectx1,rectx1+(rectx2-rectx1)/2,recty1+15,15,false);		    	
		    } else {
		    	t = S.addSvgElementFromJson({
	                "element": "g",
	                "attr": {
	                        "x": rectx1+(rectx2-rectx1)/2,
	                        "y": recty1+15,
	                        "id": "text_" + S.getNextId()
		                }
	    	    });
	    	    textFlow(tablename,t,rectx2-rectx1,rectx1+(rectx2-rectx1)/2,recty1+15,15,false);		    			    	
		    }
    	    elems.push(t);
			var g = S.groupElements(elems,tablename,undefined,type);
    	    //move text to top
			t.parentNode.appendChild(t);
			//return the group/table
			return g;
		};

		function drawEshapedTable(	n, 			//# horizontal top seats for the top table 
									m,			//# horizontal bottom seats for a spring table
									o,			//# vertical left seats for a spring table
									p,			//# vertical right seats for a spring table
									W1,			//horizontal size for the top table
									H1,			//vertical size for the top table
									W2,			//horizontal size for a spring table
									H2,			//vertical size for a spring table
									r,			//the seat radius
									tablename 	//the unique table name
								) {
			//define all length for both top and spring tables
			if (isNaN(W1)) {	//top horizontal is not set
				W1 = n*r*2;		//default is the 2r * number of seats
			}
			if  (isNaN(H1)) {	//top vertical is not set, default is 2r
				H1 = r*2;
			}
			if (isNaN(W2)) {	//spring horizontal is not set
				if ( m > 0 ) {	// bottom seats are more than 0
					W2 = m*r*2;
				} else {		// bottom sides are set at 0 then need to set size to default 
					W2 = r*2;
				}
			}
			if  (isNaN(H2)) {	//spring vertical is not set, default is 2r
				if ( (p > 0) && (o > 0) && (o >= p) ) {			// both sides are more than 0 but left is larger than right
					H2 = o*r*2;
				} else if ( (p > 0) && (o > 0) && (p >= o) ) {  // both sides are more than 0 but right is larger than left
					H2 = p*r*2;					
				} else if ( (o == 0) && (p > 0) ) { 			// left is at 0 but right is more than 0
					H2 = p*r*2;										
				} else if ( (p == 0) && (o > 0) ) { 			// right is at 0 but left is more than 0
					H2 = o*r*2;										
				} else {										// both sides are set at 0 then need to set size to default 
					H2 = r*2;
				}
			}
			var tpos = {start_x1 : 0, start_y1 : 0, start_x2 : 0, start_y2 : 0};
			var spos = {start_x1 : 0, start_y1 : 0, start_x2 : 0, start_y2 : 0};
			//define top table rectangle
			tpos.start_x1 = opts.start_x - (W1/2);
			tpos.start_y1  = opts.start_y - (H1/2);
			tpos.start_x2  = opts.start_x + (W1/2);
			tpos.start_y2  = opts.start_y + (H1/2);
			var elems = new Array(1);
			elems.push(drawCustomTable(n,0,0,0,W1,H1,r,tablename + " (top)",tpos,tablename));
			//calculate space between spring tables
			var space = (W1-W2*3)/2;
			for(var i=0; i<3; i++){
				//draw spring tables
				spos.start_x1 = tpos.start_x1 + (W2+space)*i;
				spos.start_y1 = tpos.start_y2;
				spos.start_x2 = spos.start_x1 + W2;
				spos.start_y2 = spos.start_y1 + H2;				
				elems.push(drawCustomTable(0,o,m,p,W2,H2,r,tablename + " ("+i+")",spos,tablename));
			}
			//group all those tables
			var g = S.groupElements(elems,tablename,undefined,"table");
		};
		
		function drawCircleTable(n,W,r,tablename) {
			
			tablename = $.trim(tablename);
			if (isNaN(W)) {
				W = Math.abs( (2*r) / (2*(Math.sin(Math.PI/n))) );
			}
			a = 360 / n;
            //mpos = pygame.mouse.get_pos();
            var elems = new Array(1);
            mx = opts.start_x;
            my = opts.start_y;
            var sid = 0;
            for (angle=1; angle<361; angle++){
                //theta = Math.radians(angle)
                theta = angle * Math.PI / 180;
                x = W * Math.cos(theta);
                y = W * Math.sin(theta);
                //print "Theta = "+str(theta)
                if (angle%parseInt(a) === 0) {
                	sid = addseat(tablename) + 1;
            		elems.push(drawBaseCircle(mx+x,my+y,r,"seat"+sid,seatfill,seatstroke));
                }
        	}
            var table = drawBaseCircle(mx,my,W-r,"table",tablefill,tablestroke); 
    		elems.push(table);    	    
		    var t = S.addSvgElementFromJson({
                "element": "g",
                "attr": {
                        "x": mx-W/2-r,
                        "y": my+W/2+r,
                        "id": "text_" + S.getNextId()
	                }
    	    });
    	    //t.textContent = "This is a very very long text";
    	    
    	    textFlow(tablename,t,W,mx,my,15,false);
    		elems.push(t);
			S.groupElements(elems,tablename,undefined,"table");
    	    //move to top
			t.parentNode.appendChild(t);  
		}; // end drawCircleTable

		function drawOvalTable(n,a,r,tablename) {
            var elems = new Array(1);
            //input handling (somewhat boilerplate code)
            mx = opts.start_x;
            my = opts.start_y;
            // a is on the Y, b is on the X
            b = 0; //updated in the loop, search the major axis based on minor axis
            for (angle=0; angle<361; angle++) {
			    theta = angle * Math.PI / 180;
				//ellipse equation is as following
			    x =  mx + 2*a * Math.cos(theta);
			    y =  my + a * Math.sin(theta);
			    if (y == my) { //y is the center of the ellipse
			        b = Math.abs(2*a * Math.cos(theta));
			    }
			}
		    //now we got a and b, lets draw our ellipse
            var table = drawBaseEllipse(mx,my,b,a,"table",tablefill,tablestroke); 
			elems.push(table);

			//to be able to draw the satellites, we need to find the foci
			//foci equation is x2/a2 + y2/b2 = 1
			//c2 = a2 - b2
			//c = sqrt(a2 - b2) //focus

			//find each point around the ellipse with equal distance to put the seats
			//---get the perimeter.
			//------- P = 2*pi*sqrt((a^2+b^2)/2)
			//p = 2*Math.PI*Math.sqrt( ( Math.pow(a,2) + Math.pow(b,2) ) / 2 ); //perimenter of one quadrant
			t  = Math.pow( ((a-b)/(a+b)), 2 );
			p = Math.PI*(a+b)*(1 + 3*t/(10 + Math.sqrt(4 - 3*t)));
			d = p/n; //distance around the ellipse between each circles
			//--- calculate new X & Y based on position (x=0,y=R)
			x = b;
			y = 0;
			length=0;
			prevlen=0;
			prevplot=0;
			first = 1;
			i = 1;
			//drawBaseCircle(mx+x,my+y,5,"con");
			var sid = 0;
			for (var angle=0 ; angle<361 ; angle++) { //Vary t
			    if (!first) {
			        t = angle * Math.PI / 180;
			        xx =  2 * a * Math.cos(t);
			        yy =  a * Math.sin(t);
			        //calculate delta x and delta y
			        dy = xx - x;
			        dx = yy - y;
			        length = length + Math.abs(Math.sqrt(1 + Math.pow((dy/dx),2) ) * dx);
			        if (((d*i) >= prevlen) && ((d*i)<=length)) {
			            i = i+1;
			            //drawBaseCircle(mx+x,my+y,5,"con");
			            //find the magnitude of the tangent line at this point
			            m = - ( Math.pow(a,2) * x ) / ( Math.pow(b,2) * y ) ;
			            // m1 is magnitude of the perpendicular line to the tangent
			            m1 = -1 / m;

			            // (x2−x1)2+(y2−y1)2=d2
			            // y - y0 = m1 * (x - x0)		            
			            //(y1 - y) / (x1 - x) = m1
			            //so if u = y1 - y and v = x1 - x and u2 + v2 = d2
			            // v = m1 * r / sqrt(m1^2 + 1)
			            // u = d / sqrt(m1^2 + 1)
			            // to find y1 can do y1  = m1 * r / sqrt(m1^2 + 1) + y
			            // to find x1 can do x1  = r / sqrt(m1^2 + 1) + x

			            // place the circle at a distance r on the perpendicular
			            if (x < 0 ) {
				            Y1 = - m1 * r / Math.sqrt(Math.pow(m1,2) + 1 ) + y;
				            X1 = - r / Math.sqrt(Math.pow(m1,2) + 1 ) + x;
			            } else {
				            Y1 = m1 * r / Math.sqrt(Math.pow(m1,2) + 1 ) + y;
				            X1 = r / Math.sqrt(Math.pow(m1,2) + 1 ) + x;
			            }		            	
			            sid = addseat(tablename) + 1;
		            	elems.push(drawBaseCircle(mx+X1,my+Y1,r,"seat"+sid,seatfill,seatstroke));
			        }
			        x=xx;
			        y=yy;
			        prevlen=length;
			    } else {
		            cy= my + 0;
			        cx = mx + x + r;
			        sid = addseat(tablename) + 1;
			        elems.push(drawBaseCircle(cx,cy,r,"seat"+sid,seatfill,seatstroke));
			        first = 0;
			    }
			}
		    var t = S.addSvgElementFromJson({
                "element": "g",
                "attr": {
                        "x": opts.start_x,
                        "y": opts.start_y,
                        "id": "text_" + S.getNextId()                        
	                }
    	    });
			textFlow(tablename,t,b,mx,my,15,false);
			elems.push(t);
    	    S.groupElements(elems,tablename,undefined,"table");
    	    //move to top
			t.parentNode.appendChild(t);  
		}; // end drawOvalTable
		
		function drawSeatsTable(n,W,r,tablename) {
			//set the table size if W or H is empty
			if (isNaN(W)) {
				W = n*r*2;
			}
			H = r*2*1.02;
			//Center the table based on click
            rectx1 = opts.start_x - (W/2);
            recty1 = opts.start_y - (H/2);

            rectx2 = opts.start_x + (W/2);
            recty2 = opts.start_y + (H/2);
            //alert(opts.start_y + (H/2));
            //pygame.draw.rect(window,color, ( int(rectx1), int(recty1), int(rectx2-rectx1), int(recty2-recty1) ), 1)
            var elems = new Array(1);
            //position of circles
            hcspace = (rectx2-rectx1)/(n*2);
            var sid = 0;
            for (var i=1; i <= n*2; i = i + 2) { 
                    //pygame.draw.circle(window, color, (int(rectx1+(cspace*i)),int(recty1-r)), r,1);
            	sid = addseat(tablename) + 1;
            	elems.push(drawBaseCircle(rectx1+(hcspace*i),recty1+r,r,"seat"+sid,seatfill,seatstroke));
            }
            elems.push(drawBaseSquare(rectx1-r,recty1,rectx2-rectx1+r*2,recty2-recty1,"table",tablefill,tablestroke));
            var t = S.addSvgElementFromJson({
                "element": "g",
                "attr": {
                        "x": opts.start_x,
                        "y": opts.start_y,
                        "id": "text_" + S.getNextId(),
	                }
    	    }); 
    	    //t.textContent = "This is a very very long text";
    	    textFlow(tablename,t,rectx2-rectx1,rectx1+(rectx2-rectx1)/2,recty1+15,15,false);
    	    elems.push(t);
			S.groupElements(elems,tablename,undefined,"table");			
		}; // end drawSeatsTable
		
		return {
			name: "Tables",
			svgicons: "extensions/tables_icons.svg",
			
			// Multiple buttons can be added in this array
			buttons: [
				{
					id: "tool_table_rectangle", 
					type: "mode_flyout",
					title: "Add a rectangle table", 
					
					events: {
						'click': function() {
							svgCanvas.setMode("tables");
							svgCanvas.runExtensions('modeButtonStateUpdate');
							showPanel(true);
							table_type = "rectangle";
						} 
					}
				}, // end rectangle
				{
					id: "tool_table_square", 
					type: "mode_flyout", 
					title: "Add a square table",
					includeWith: {
						button: '#tool_table_rectangle'

					},					
					events: {
						'click': function() {
							svgCanvas.setMode("tables");
							svgCanvas.runExtensions('modeButtonStateUpdate');
							showPanel(true);
							table_type = "square";							
						}
					}
				}, // end square
				
				{
					id: "tool_table_custom", 
					type: "mode_flyout",
					title: "Add a custom table", 
					includeWith: {
						button: '#tool_table_square'
						
					},
					events: {
						'click': function() {
							svgCanvas.setMode("tables");
							svgCanvas.runExtensions('modeButtonStateUpdate');
							showPanel(true);
							
							table_type = "custom";
						} 
					}
				}, // end custom
				{
					id: "tool_table_circle", 
					type: "mode_flyout",
					title: "Add a circle table", 
					includeWith: {
						button: '#tool_table_square'
					},
					events: {
						'click': function() {
							svgCanvas.setMode("tables");
							svgCanvas.runExtensions('modeButtonStateUpdate');
							showPanel(true);
							table_type = "circle";
						}
					}
				},
				{
					id: "tool_table_oval", 
					type: "mode_flyout",
					title: "Add an oval table", 
					includeWith: {
						button: '#tool_table_square'
					},
					events: {
						'click': function(){
							svgCanvas.setMode("tables");
							svgCanvas.runExtensions('modeButtonStateUpdate');
							showPanel(true);
							table_type = "oval";
						}
					}
				}, //end oval
				{
					id: "tool_table_seatsrow", 
					type: "mode_flyout",
					title: "Add a seats row", 
					includeWith: {
						button: '#tool_table_square'
					},
					events: {
						'click': function() {
							svgCanvas.setMode("tables");
							svgCanvas.runExtensions('modeButtonStateUpdate');

							showPanel(true);
							table_type = "seatsrow";
						}
					}
				}, //end seats row
				{
					id: "tool_table_eshaped", 
					type: "mode_flyout",
					title: "Add a e-shaped table", 
					includeWith: {
						button: '#tool_table_square'
					},
					events: {
						'click': function() {
							svgCanvas.setMode("tables");
							svgCanvas.runExtensions('modeButtonStateUpdate');
							showPanel(true);
							table_type = "eshaped";
						}
					}
				} //end eshaped
			],

			callback: function(){
				$('#tables_panel').hide();
				// re-load saved data
				tables = loadFromStorage('tables');
				local_seatradius = loadFromStorage('local_seatradius');
				local_seats_across = loadFromStorage('local_seats_across');
				local_seats_down = loadFromStorage('local_seats_down');
				local_seats_horizontal_top = loadFromStorage('local_seats_horizontal_top');
				local_seats_horizontal_bottom = loadFromStorage('local_seats_horizontal_bottom');
				local_seats_vertical_left = loadFromStorage('local_seats_vertical_left');
				local_seats_vertical_right = loadFromStorage('local_seats_vertical_right');
				local_size_across = loadFromStorage('local_size_across');
				local_size_down = loadFromStorage('local_size_down');
				// register a jquery method to check tables exists based on the name entered by the user
				jQuery.validator.addMethod("isTableExist", function(value, element) {
					alert(isTableExist(value));
    				return this.optional(element) || (isTableExist(value));
				}, "Must be a non existing table name");
				//var endChanges = function(){};
				//colors				
				//updateColors();
				//svgCanvas
				//unbind dblclick on canvas
				svgCanvas.dblclick = function (evt) {};
			},
			// This is triggered when the main mouse button is pressed down 
			// on the editor canvas (not the tool panels)
			mouseDown: function(localopts) {
				// Check the mode on mousedown
				opts = localopts;
				if(svgCanvas.getMode() == "tables" && table_type == "square") {
												drawing=true;
                                                //window.console.log("drawing rectangle");
                                                //addTable($("#table_name").val(), parseInt($("#seats_across").val()*2 + $("#seats_down").val()*2 ));
												var len = Object.size(tables)+1;
												$("#table_name").val("Table_" + len);
                                                addTable($("#table_name").val());
                                                drawRectangleTable(
                                                    parseInt(4), 
                                                    parseInt(4), 
                                                    parseFloat(100), 
                                                    parseFloat(100),
                                                    parseFloat(10),
                                                    $("#table_name").val(),
                                                    1
                                                    );
                                                drawing = false;
				
					$dialog = $('#dialog_box')
					.html(square_form)
	                .dialog({
	                   autoOpen: false,
	                   modal: true,
	                   resizable: false,
	                   width:460,
	                   height:530,
	                   title: "New Square Table Creation",
	                   open: function(){
	   							$('.ui-widget-overlay').addClass('custom-overlay');
	   							updateColors();
								var max = 0;
	    						$("label[id*='seats']").each(function(){
	    							//alert(this.id);
	        						if ($(this).width() > max)
	            						max = $(this).width();   
	    						});
	    						var len = Object.size(tables)+1;
	    						$("#table_name").val("Table_" + len);
	    						//save & restore user values
	    						$("#seats_across").val(local_seats_across);
	    						$("#seats_down").val(local_seats_down);
	    						$("#size_across").val(local_size_across);
	    						$("#seats_across").change(function(){
	    						    local_seats_across = $(this).val();    
	    						});
	    						$("#seats_down").change(function(){
	    						    local_seats_down = $(this).val();    
	    						});
	    						$("#size_across").change(function(){
	    						    local_size_across = $(this).val();
	    						});
	    						$("label").width(max);
	    						$("#create_square_table_form").validate({
	    							rules: {
	    								table_name: {
	    									required: true
	    								},
	    								seats_across: {
	    									required: true,
	    									digits: true
	    								},
	    								size_across: {
	    									number: true
	    								}
	    							},
	    							success: function(label) {
	    								$("#seats_total_value").text( parseInt($("#seats_across").val())*4 );
   									}
	    						});
								$("#seats_total_value").text( 	parseInt($("#seats_across").val())*4 );

							},
							buttons: [{
								text: "Create",
								click: function (event){  								
	   								if ($('#create_square_table_form').valid()) {
										if (isNaN($('#seatradius').val() / 1) == false) {
											if (!isTableExist($("#table_name").val())){
												$(this).dialog("close");
												if (!drawing) {
													drawing=true;
													//addTable($("#table_name").val(), parseInt($("#seats_across").val())*2 + parseInt($("#seats_across").val())*2 );
													addTable($("#table_name").val());
													drawRectangleTable(
														parseInt($("#seats_across").val()), 
														parseInt($("#seats_across").val()),
														parseFloat($("#size_across").val()),
														parseFloat($("#size_across").val()),
														parseFloat($("#seatradius").val()),
														$("#table_name").val(),
														0
														);
													drawing = false;
												}
											} else {
												alert("This table name is already used.");
											}
										} else {
											alert("Radius should be a numeric value. Please close this window and set the seat radius.");
										}
	   								}
	   							}
							},
							{
								text: "Cancel",
								click: function(){
	   								$(this).dialog("close");
	   							}
							}]
						}
	                );
					$dialog.dialog('open');
					return {started: true};
				}
				if(svgCanvas.getMode() == "tables" && table_type == "rectangle") {
							
									
                                                drawing=true;
                                                
                                                addTable($("#table_name").val());
                                                drawRectangleTable(
                                                    parseInt(2), 
                                                    parseInt(4), 
                                                    parseFloat(75), 
                                                    parseFloat(100),
                                                    parseFloat(10),
                                                    $("#table_name").val(),
                                                    1
                                                    );
                                                drawing = false;




					$dialog = $('#dialog_box')
					.html(rectangle_form)
	                .dialog({
	                   autoOpen: false,
	                   modal: true,
	                   resizable: false,
	                   width:460,
	                   height:630,
	                   title: "New Rectangle Table Creation",
	                   open: function(){
	   						$('.ui-widget-overlay').addClass('custom-overlay');
		                	updateColors();
	   						var max = 0;
	   						$("label[id*='seats']").each(function(){
								//alert(this.id);
	    						if ($(this).width() > max)
	        						max = $(this).width();   
							});
							var len = Object.size(tables)+1;
							$("#table_name").val("Table_" + len);
							//save & restore user values
							$("#seats_across").val(local_seats_across);
							$("#seats_down").val(local_seats_down);
							$("#size_across").val(local_size_across);
							$("#size_down").val(local_size_down);
    						$("#seats_across").change(function(){
    						    local_seats_across = $(this).val();    
    						});
    						$("#seats_down").change(function(){
    						    local_seats_down = $(this).val();    
    						});
							$("#size_across").change(function(){
							    local_size_across = $(this).val();
							});
							$("#size_down").change(function(){
							    local_size_down = $(this).val();
							});	
							$("label").width(max);
							$("#create_rectangle_table_form").validate({
								rules: {
									table_name: {
										required: true,
									},
									seats_across: {
										required: true,
										digits: true
									},
									seats_down: {
										required: true,
										digits: true
									},
									size_across: {
										number: true
									},
									size_down: {
										number: true
									}
								},
								success: function(label) {
									$("#seats_total_value").text( 	parseInt($("#seats_across").val())*2  + 
											parseInt($("#seats_down").val())*2
											);
								}
							});
							$("#seats_total_value").text( 	parseInt($("#seats_across").val())*2  + 
									parseInt($("#seats_down").val())*2
									);
	                   },
	                   buttons: {
							"Create": function (event){
								
							},
							"Cancel": function(){
   								$(this).dialog("close");
   							}
	                   }
					});
					$dialog.dialog('open');
					return {started: true};
				}

				if(svgCanvas.getMode() == "tables" && table_type == "custom") {
				drawing=true;
                                                //window.console.log("drawing rectangle");
                                                //addTable($("#table_name").val(), parseInt($("#seats_across").val()*2 + $("#seats_down").val()*2 ));
												var len = Object.size(tables)+1;
												$("#table_name").val("Table_" + len);
                                                addTable($("#table_name").val());
                                                drawCustomTable(
                                                  	parseInt(4), 
													parseInt(4), 
													parseInt(4), 
													parseInt(1), 														
													parseFloat(100), 
													parseFloat(100),
													parseFloat(10),
                                                    $("#table_name").val(),
													undefined,
													$("#table_name").val(),
													"table"
													);
                                                drawing = false;
					$dialog = $('#dialog_box')
					.html(custom_form)
	                .dialog({
	                   autoOpen: false,
	                   modal: true,
	                   resizable: false,
	                   width:860,
	                   height:530,
	                   title: "New Custom Table Creation",
	                   open: function(){
	                	   $('.ui-widget-overlay').addClass('custom-overlay');
	                	   updateColors();
	                	   var max = 0;
	                	   $("label[id*='seats']").each(function(){
								//alert(this.id);
	    						if ($(this).width() > max)
	        						max = $(this).width();   
							});
							var len = Object.size(tables)+1;
							$("#table_name").val("Table_" + len);
							//save & restore user values
							$("#seats_horizontal_top").val(local_seats_horizontal_top);
							$("#seats_horizontal_bottom").val(local_seats_horizontal_bottom);
							$("#seats_vertical_left").val(local_seats_vertical_left);
							$("#seats_vertical_right").val(local_seats_vertical_right);
							$("#size_across").val(local_size_across);
							$("#size_down").val(local_size_down);
							$("#seats_horizontal_top").change(function(){
								local_seats_horizontal_top = $(this).val();    
							});
							$("#seats_horizontal_bottom").change(function(){
								local_seats_horizontal_bottom = $(this).val();    
							});
							$("#seats_vertical_left").change(function(){
								local_seats_vertical_left = $(this).val();
							});
							$("#seats_vertical_right").change(function(){
								local_seats_vertical_right = $(this).val();
							});
							$("#size_across").change(function(){
							    local_size_across = $(this).val();
							});
							$("#size_down").change(function(){
							    local_size_down = $(this).val();
							});

							$("label").width(max);
							$("#create_custom_table_form").validate({
								rules: {
									table_name: {
										required: true,
									},
									seats_horizontal_top: {
										required: true,
										digits: true
									},
									seats_horizontal_bottom: {
										required: true,
										digits: true
									},
									seats_vertical_left: {
										required: true,
										digits: true
									},
									seats_vertical_right: {
										required: true,
										digits: true
									},
									size_across: {
										number: true
									},
									size_down: {
										number: true
									}
								},
								success: function(label) {
									$("#seats_total_value").text( 	parseInt($("#seats_horizontal_top").val())  + 
																	parseInt($("#seats_horizontal_bottom").val())  + 
																	parseInt($("#seats_vertical_left").val()) +
																	parseInt($("#seats_vertical_right").val())
																	);
									}
							});
							// update the seats
							$("#seats_total_value").text( 	parseInt($("#seats_horizontal_top").val())  + 
									parseInt($("#seats_horizontal_bottom").val())  + 
									parseInt($("#seats_vertical_left").val()) +
									parseInt($("#seats_vertical_right").val())
									);
	                   },
	                   buttons: {
							"Create": function (event){
								if ($('#create_custom_table_form').valid()) {
									if (isNaN($('#seatradius').val() / 1) == false) {
										if (!isTableExist($("#table_name").val())){
											$(this).dialog("close");
											if (!drawing) {
												drawing=true;
												//window.console.log("drawing rectangle");
												//addTable($("#table_name").val(), parseInt($("#seats_horizontal_top").val() + $("#seats_horizontal_bottom").val()  + $("#seats_vertical_left").val() + $("#seats_vertical_right").val() ));
												addTable($("#table_name").val());
												drawCustomTable(
													parseInt($("#seats_horizontal_top").val()), 
													parseInt($("#seats_vertical_left").val()), 
													parseInt($("#seats_horizontal_bottom").val()), 
													parseInt($("#seats_vertical_right").val()), 														
													parseFloat($("#size_across").val()), 
													parseFloat($("#size_down").val()),
													parseFloat($("#seatradius").val()),
													$("#table_name").val(),
													undefined,
													$("#table_name").val(),
													"table"
													);
												drawing = false;
											}
										} else {
											alert("This table name is already used.");
										}
									} else {
										alert("Radius should be a numeric value. Please close this window and set the seat radius.");
									}
								}
							},
							"Cancel": function(){
   								$(this).dialog("close");
   							}
	                   }
					});
					$dialog.dialog('open');
					return {started: true};
				}
				if(svgCanvas.getMode() == "tables" && table_type == "circle") {
												drawing=true;
												//window.console.log("drawing circle");
												//addTable($("#table_name").val(), parseInt($("#seats_across").val()));
												addTable($("#table_name").val());
												drawCircleTable(
													parseInt(4), 
													parseFloat(50), 
													parseFloat(15),
													$("#table_name").val()
													);
												drawing = false;
												
					$dialog = $('#dialog_box')
					.html(circle_form)
	                .dialog({
	                   autoOpen: false,
	                   modal: true,
	                   resizable: false,
	                   width:480,
	                   height:530,
	                   title: "New Circle Table Creation",
	                   open: function(){
	                	   	$('.ui-widget-overlay').addClass('custom-overlay');
	                	   	updateColors();
							var max = 0;
							$("label[id*='seats']").each(function(){
							//alert(this.id);
	    					if ($(this).width() > max)
	        						max = $(this).width();   
							});
							var len = Object.size(tables)+1;
							$("#table_name").val("Table_" + len);
							//save & restore user values
							$("#seats_across").val(local_seats_across);
							$("#size_across").val(local_size_across);
							$("#seats_across").change(function(){
								local_seats_across = $(this).val();
							});
							$("#size_across").change(function(){
							    local_size_across = $(this).val();
							});

							$("label").width(max);
							$("#create_circle_table_form").validate({
								rules: {
									table_name: {
										required: true,
									},
									seats_across: {
										required: true,
										digits: true
									},
									size_across: {
										number: true
									},
								},
								success: function(label) {
									$("#seats_total_value").text($("#seats_across").val()*4);
									}
							});
	                   },
	                   buttons: {
							"Create": function (event){
								if ($('#create_circle_table_form').valid()) {
									if (isNaN($('#seatradius').val() / 1) == false) {
										if (!isTableExist($("#table_name").val())){
											$(this).dialog("close");
											if (!drawing) {
												drawing=true;
												//window.console.log("drawing circle");
												//addTable($("#table_name").val(), parseInt($("#seats_across").val()));
												addTable($("#table_name").val());
												drawCircleTable(
													parseInt($("#seats_across").val()), 
													parseFloat($("#size_across").val()), 
													parseFloat($("#seatradius").val()),
													$("#table_name").val()
													);
												drawing = false;
											}
										} else {
											alert("This table name is already used.");
										}
									} else {
										alert("Radius should be a numeric value. Please close this window and set the seat radius.");
									}
								}
							},
							"Cancel": function(){
   								$(this).dialog("close");
   							}
	                   }
					});
					$dialog.dialog('open');
					return {started: true};
				}
				if(svgCanvas.getMode() == "tables" && table_type == "oval") {
												drawing=true;
												//window.console.log("drawing circle");
												//addTable($("#table_name").val(), parseInt($("#seats_across").val()));
												addTable($("#table_name").val());
												drawOvalTable(
													parseInt(6), 
													parseFloat(30), 
													parseFloat(10),
													$("#table_name").val()
													);
												drawing = false;
					$dialog = $('#dialog_box')
					.html(oval_form)
	                .dialog({
	                   autoOpen: false,
	                   modal: true,
	                   resizable: false,
	                   width:240,
	                   height:530,
	                   title: "New Oval Table Creation",
	                   open: function(){
	                	   $('.ui-widget-overlay').addClass('custom-overlay');
	                	   updateColors();
							var max = 0;
							$("label[id*='seats']").each(function(){
								//alert(this.id);
	    						if ($(this).width() > max)
	        						max = $(this).width();   
							});
							var len = Object.size(tables)+1;
							$("#table_name").val("Table_" + len);
							//save & restore user values
							$("#seats_across").val(local_seats_across);
							$("#size_across").val(local_size_across);
							$("#seats_across").change(function(){
								local_seats_across = $(this).val();
							});
							$("#size_across").change(function(){
							    local_size_across = $(this).val();
							});
							$("label").width(max);
							$("#create_oval_table_form").validate({
								rules: {
									table_name: {
										required: true,
									},
									seats_across: {
										required: true,
										digits: true
									},
									size_across: {
										number: true,
										required: true
									},
								},
								success: function(label) {
									$("#seats_total_value").text($("#seats_across").val());
									}
							});
	                   },
	                   buttons: {
							"Create": function (event){
								if ($('#create_oval_table_form').valid()) {
									if (isNaN($('#seatradius').val() / 1) == false) {
										if (!isTableExist($("#table_name").val())){
											$(this).dialog("close");
											if (!drawing) {
												drawing=true;
												//window.console.log("drawing circle");
												//addTable($("#table_name").val(), parseInt($("#seats_across").val()));
												addTable($("#table_name").val());
												drawOvalTable(
													parseInt($("#seats_across").val()), 
													parseFloat($("#size_across").val()), 
													parseFloat($("#seatradius").val()),
													$("#table_name").val()
													);
												drawing = false;
											}
										} else {
											alert("This table name is already used.");
										}
									} else {
										alert("Radius should be a numeric value. Please close this window and set the seat radius.");
									}
								}
							},
							"Cancel": function(){
   								$(this).dialog("close");
   							}
	                   }
					});
					$dialog.dialog('open');
					return {started: true};
				} // end oval click
				if(svgCanvas.getMode() == "tables" && table_type == "seatsrow") {
												drawing=true;
												//window.console.log("drawing circle");
												//addTable($("#table_name").val(), parseInt($("#seats_across").val()));
												addTable($("#table_name").val());
												drawSeatsTable(
													parseInt(2), 
													parseFloat(70),
													parseFloat(10),
													$("#table_name").val()
													);
												drawing = false;
					$dialog = $('#dialog_box')
					.html(seats_form)
	                .dialog({
	                   autoOpen: false,
	                   modal: true,
	                   resizable: false,
	                   width:480,
	                   height:480,
	                   title: "New Seats Row Creation",
	                   open: function(){
	                	   $('.ui-widget-overlay').addClass('custom-overlay');
	                	   updateColors();
							var max = 0;
							$("label[id*='seats']").each(function(){
								//alert(this.id);
	    						if ($(this).width() > max)
	        						max = $(this).width();   
							});
							var len = Object.size(tables)+1;
							$("#table_name").val("Table_" + len);
							//save & restore user values
							$("#seats_across").val(local_seats_across);
							$("#size_across").val(local_size_across);
							$("#seats_across").change(function(){
								local_seats_across = $(this).val();
							});
							$("#size_across").change(function(){
							    local_size_across = $(this).val();
							});

							$("label").width(max);
							$("#create_seats_table_form").validate({
								rules: {
									table_name: {
										required: true,
									},
									seats_across: {
										required: true,
										digits: true
									},
									size_across: {
										number: true	    									
									},
								},
								success: function(label) {
									$("#seats_total_value").text($("#seats_across").val());
									}
							});
	                   },
	                   buttons: {
							"Create": function (event){
								if ($('#create_seats_table_form').valid()) {
									if (isNaN($('#seatradius').val() / 1) == false) {
										if (!isTableExist($("#table_name").val())){
											$(this).dialog("close");
											if (!drawing) {
												drawing=true;
												//window.console.log("drawing circle");
												//addTable($("#table_name").val(), parseInt($("#seats_across").val()));
												addTable($("#table_name").val());
												drawSeatsTable(
													parseInt($("#seats_across").val()), 
													parseFloat($("#size_across").val()),
													parseFloat($("#seatradius").val()),
													$("#table_name").val()
													);
												drawing = false;
											}
										} else {
											alert("This table name is already used.");
										}
									} else {
										alert("Radius should be a numeric value. Please close this window and set the seat radius.");
									}
								}
							},
							"Cancel": function(){
   								$(this).dialog("close");
   							}
	                   }
					});
					$dialog.dialog('open');
					return {started: true};
				} // end seat row click
				if(svgCanvas.getMode() == "tables" && table_type == "eshaped") {
												drawing=true;
												//window.console.log("drawing rectangle");
												//addTable($("#table_name").val(), parseInt($("#seats_horizontal_top").val() + $("#seats_horizontal_bottom").val()  + $("#seats_vertical_left").val() + $("#seats_vertical_right").val() ));
												addTable($("#table_name").val());
												drawEshapedTable(
													parseInt(4), 
													parseInt(3), 
													parseInt(3), 
													parseInt(3), 														
													parseFloat(200), 
													parseFloat(50),
													parseFloat(50), 
													parseFloat(200),
													parseFloat(10),
													$("#table_name").val()
													);
												drawing = false;
				
					$dialog = $('#dialog_box')
					.html(eshaped_form)
	                .dialog({
	                   autoOpen: false,
	                   modal: true,
	                   resizable: false,
	                   width:900,
	                   height:600,
	                   title: "New e-Shaped Table Creation",
	                   open: function(){
	                	   $('.ui-widget-overlay').addClass('custom-overlay');
	                	   updateColors();
	                	   var max = 0;
	                	   $("label[id*='seats']").each(function(){
								//alert(this.id);
	    						if ($(this).width() > max)
	        						max = $(this).width();   
							});
							var len = Object.size(tables)+1;
							$("#table_name").val("Table_" + len);
							//save & restore user values
							$("#top_seats_horizontal_top").val(local_top_seats_horizontal_top);
							$("#spring_seats_vertical_left").val(local_spring_seats_vertical_left);							
							$("#spring_seats_vertical_right").val(local_spring_seats_vertical_right);
							$("#spring_seats_horizontal_bottom").val(local_spring_seats_horizontal_bottom);
							$("#top_size_across").val(local_top_size_across);
							$("#top_size_down").val(local_top_size_down);
							$("#spring_size_across").val(local_spring_size_across);
							$("#spring_size_down").val(local_spring_size_down);
							$("#top_seats_horizontal_top").change(function(){
								local_top_seats_horizontal_top = $(this).val();    
							});
							$("#spring_seats_vertical_left").change(function(){
								local_spring_seats_vertical_left = $(this).val();    
							});
							$("#spring_seats_vertical_right").change(function(){
								local_spring_seats_vertical_right = $(this).val();
							});
							$("#spring_seats_horizontal_bottom").change(function(){
								local_spring_seats_horizontal_bottom = $(this).val();
							});
							$("#top_size_across").change(function(){
								local_top_size_across = $(this).val();
							});
							$("#top_size_down").change(function(){
								local_top_size_down = $(this).val();
							});
							$("#spring_size_across").change(function(){
								local_spring_size_across = $(this).val();
							});
							$("#spring_size_down").change(function(){
								local_spring_size_down = $(this).val();
							});
							$("label").width(max);
							$("#create_eshaped_table_form").validate({
								rules: {
									table_name: {
										required: true,
									},
									top_seats_horizontal_top: {
										required: true,
										digits: true
									},
									spring_seats_horizontal_bottom: {
										required: true,
										digits: true
									},
									spring_seats_vertical_left: {
										required: true,
										digits: true
									},
									spring_seats_vertical_right: {
										required: true,
										digits: true
									},
									top_size_across: {
										number: true
									},
									top_size_down: {
										number: true
									},
									spring_size_across: {
										number: true
									},
									spring_size_down: {
										number: true
									}
								},
								success: function(label) {
									$("#seats_total_value").text( 	parseInt($("#top_seats_horizontal_top").val())  + 
																	(parseInt($("#spring_seats_horizontal_bottom").val())*3)  + 
																	(parseInt($("#spring_seats_vertical_left").val())*3) +
																	(parseInt($("#spring_seats_vertical_right").val())*3)
																	);
									}
							});
							// update the seats
							$("#seats_total_value").text( 	parseInt($("#top_seats_horizontal_top").val())  + 
									(parseInt($("#spring_seats_horizontal_bottom").val())*3)  + 
									(parseInt($("#spring_seats_vertical_left").val())*3) +
									(parseInt($("#spring_seats_vertical_right").val())*3)
									);
	                   },
	                   buttons: {
							"Create": function (event){
								if ($('#create_eshaped_table_form').valid()) {
									if (isNaN($('#seatradius').val() / 1) == false) {
										if (!isTableExist($("#table_name").val())){
											$(this).dialog("close");
											if (!drawing) {
												drawing=true;
												//window.console.log("drawing rectangle");
												//addTable($("#table_name").val(), parseInt($("#seats_horizontal_top").val() + $("#seats_horizontal_bottom").val()  + $("#seats_vertical_left").val() + $("#seats_vertical_right").val() ));
												addTable($("#table_name").val());
												drawEshapedTable(
													parseInt($("#top_seats_horizontal_top").val()), 
													parseInt($("#spring_seats_horizontal_bottom").val()), 
													parseInt($("#spring_seats_vertical_left").val()), 
													parseInt($("#spring_seats_vertical_right").val()), 														
													parseFloat($("#top_size_across").val()), 
													parseFloat($("#top_size_down").val()),
													parseFloat($("#spring_size_across").val()), 
													parseFloat($("#spring_size_down").val()),
													parseFloat($("#seatradius").val()),
													$("#table_name").val()
													);
												drawing = false;
											}
										} else {
											alert("This table name is already used.");
										}
									} else {
										alert("Radius should be a numeric value. Please close this window and set the seat radius.");
									}
								}
							},
							"Cancel": function(){
   								$(this).dialog("close");
   							}
	                   }
					});
					$dialog.dialog('open');
					return {started: true};
				} // end e-shaped click
			},
			// This is triggered from anywhere, but "started" must have been set
			// to true (see above). Note that "opts" is an object with event info
			mouseUp: function(opts) {
				// Check the mode on mouseup
				if(svgCanvas.getMode() == "tables") {
					//do something here if necessary
				}
			},
			onDeleteLayer: function(layer) {
				// remove all tables
				var alltables = $(layer).find('g:has(circle[name*="seat"])');
				alltables.each(function(){
					if ($(this).attr('id') != null){
						removeTable($(this).attr('id'));
					}
				});
			},
			onDeleteElement: function(opts) {				
				var elems = opts.selectedElements;
				var i = elems.length;
				while(i--){
					if (elems[i] != null){
						removeTable(elems[i].id);
					}
				}
			},
			onNewDocument: function(){				
				resetLocals();
			},
			onDBOpen: function(xmlstr){				
				resetLocals();
				loadTablesFromSVG(xmlstr);
			},
			onBeforeUnload: function(){
				serialize2storage(tables,'tables');
				serialize2storage(local_seatradius,'local_seatradius');
				serialize2storage(local_seats_across,'local_seats_across');
				serialize2storage(local_seats_down,'local_seats_down');
				serialize2storage(local_seats_horizontal_top,'local_seats_horizontal_top');
				serialize2storage(local_seats_horizontal_bottom,'local_seats_horizontal_bottom');
				serialize2storage(local_seats_vertical_left,'local_seats_vertical_left');
				serialize2storage(local_seats_vertical_right,'local_seats_vertical_right');
				serialize2storage(local_size_across,'local_size_across');
				serialize2storage(local_size_down,'local_size_down');
			},

			toolButtonStateUpdate: function(opts) {

			},

			modeButtonStateUpdate: function() {
				if(svgCanvas.getMode() != "tables") {
					showPanel(false);
				}
				if(svgCanvas.getMode() == "tables") {
					svgCanvas.clearSelection();
				}
			}
		};
});

