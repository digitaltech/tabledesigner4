/*
 * ext-guests.js
 *
*/

/* 
	It adds the guests management buttons in the top panel. 
	Click on the button will show the management interface to add guests.
*/

svgEditor.addExtension("Guests", function(S) {
		var status = "list";
		var working = 0;
		var over = null;
		var color_over = "#FF0000";
		var color_select = "#00FF00";
		var color_overout = "#"+svgEditor.curConfig['initStroke'].color;
		var group_users = 0;
		var form_template = "<form id='add_guest_form' name='add_guest_form'>" +
		"   <div class='wrap'>" +
		"		<div class='left ui-state-focus'>" +
		"		<div class='editor_left'>" +
		"			<label for='guest_title'>Title:</label> "+
		"			<select name='guest_title' id='guest_title'></select>"+
		"		</div>" +
		"		<div class='editor_left'>" +
		"			<label for='guest_firstname'>First name:</label> "+
		"			<input type='text' name='guest_firstname' id='guest_firstname' value='' />"+
		"		</div>" +
		"		<div class='editor_left'>" +
		"			<label for='guest_lastname'>Last name:</label> "+
		"			<input type='text' name='guest_lastname' id='guest_lastname' value='' /><br/>"+
		"		</div>" +
		"		<div class='editor_left'>" +
		"			<label for='guest_displayname'>Display name:</label> "+
		"			<input type='text' name='guest_displayname' id='guest_displayname' value='' /><br/>"+
		"		</div>" +
		"		<div class='editor_left'>" +
		"			<label for='guest_age'>Age:</label> "+
		"			<select name='guest_age' id='guest_age'></select><br/>"+
		"		</div>" +
		"		<div class='editor_left'>" +
		"			<label for='guest_gender'>Gender:</label> "+
		"			<select name='guest_gender' id='guest_gender'></select>"+
		"		</div>" +
		"		</div>" +
		"		<div class='right ui-state-focus'>" +
		"		<div class='editor_left'>" +
		"			<label for='guest_identifier'>Identifier:</label> "+
		"			<input disabled='true' type='text' name='guest_identifier' id='guest_identifier' value='' /><br/>"+
		"		</div>" +
		"		<div class='editor_left'>" +
		"			<label for='guest_meal'>Meal:</label> "+
		"			<select name='guest_meal' id='guest_meal'></select>"+
		"		</div>" +
		"		<div class='editor_left'>" +
		"			<label for='guest_req'>Special req:</label> "+
		"			<select name='guest_req' id='guest_req'></select><br/>"+
		"		</div>" +
		"		<div class='editor_left'>" +
		"			<label for='guest_rsvp'>RSVP:</label> "+
		"			<select name='guest_rsvp' id='guest_rsvp'></select>"+
		"		</div>" +
		"		<div class='editor_left'>" +
		"			<label for='guest_vip'>VIP:</label> "+
		"			<input type='checkbox' name='guest_vip' id='guest_vip' /><br/>"+
		"		</div>" +
		"		<div class='editor_left'>" +
		"			<label for='guest_note'>Notes:</label> "+
		"			<textarea name='guest_note' id='guest_note' value='' rows='4' cols='32' /><br/>"+
		"		</div>" +
		"		</div>" +
		"	</div>" +	
		"</form>" ;
		var guest_form =    "<div id='guests_forms'></div>";
		var group_form = 	"<div id='group_form' class='ui-state-default'>"+
							"	<div class='ui-widget-header'>" +
							"<a href='#' id='minus'><span class='ui-widget-content ui-icon ui-icon-circle-minus' style='position: relative; top:1px; float:left; display:inline-block;'></span></a>" +
							"<span id='value' style='float:left; display:inline-block;'>0</span>" +
							"<a href='#' id='plus'><span class='ui-widget-content ui-icon ui-icon-circle-plus' style='position: relative; top:1px; float:left; display:inline-block;'></span></a>" +
							"Guest(s)" +
							"</div>" +
							"<div style='float:left; width:100%;'>"+
							"<form id='add_group_form' name='add_group_form'>"+
							"	<label for='group_name'>Group Name:</label> "+
							"	<input type='text' name='group_name' id='group_name' value='' /><br />"+
							"	<label for='group_note'>Note:</label> "+
							"	<textarea name='group_note' id='group_note' value='' rows='4' cols='40' />"+
							"</form>"+
							"	<div class='div_separator'></div>" +
							"	<div id='guests_forms'></div>" +
							"</div>" +
							"</div>";

		/**************************
		 * Ajax calls functions   *
		 **************************/	

		function ajax_assignGroup2Guest(guestid, gid) {
			var $data = {
					"table": 'guestsingroup', 
					"setfields": 'guest_id,group_id',
					"setvalues": [
					              guestid,
					              gid
					              ]
			};
			return $.ajax({
				url: svgEditor.path() + "/insert_simpledata.php",
				type: "POST",
				async: false,
				beforeSend: function (){
            		$('#myoverlay').removeClass('hidden');
            		$('#myoverlay').addClass('ajaxloader');
			    },
				data: {data: $data},
				success: function(response){
					//no need
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
            		$('#myoverlay').removeClass('ajaxloader');
            		$('#myoverlay').addClass('hidden');
            		$.alert('Error:' + errorThrown);
				}
			});
		};

		function ajax_guestcreate(user) {
			return svgEditor.getSelectDataFromAjax(svgEditor.path() + "/guests_create.php",
					user,
					function (response) {
						//no need
					}
			);
		};
		
		function ajax_checkgroupexist(name){
			var $countgroupdata = {
					"table": 'groups', 
					"selfields": 'id,name',
					"where": [{
			           			"column": "name",
			           			"condition": "=",
			           			"value": name
							}]					
				};
			return svgEditor.getSelectDataFromAjax(svgEditor.path() + "/get_simpledata.php",
					$countgroupdata,
					function (response) {
						//no need
			});				
		};
		
		function ajax_creategroup(name,note){
			var $data = {
					"table": 'groups', 
					"setfields": 'name,note', 
					"setvalues": [
					              name,
					              note
					              ],
					"return": 'group_id'
			};
			return $.ajax({
				url: svgEditor.path() + "/insert_simpledata.php",
				type: "POST",
				beforeSend: function (){
            		$('#myoverlay').removeClass('hidden');
            		$('#myoverlay').addClass('ajaxloader');
			    },
				data: {data: $data},
				success: function(response){
					//no need
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					console.log("CreateGroup: Failed.");    		
            		$('#myoverlay').removeClass('ajaxloader');
            		$('#myoverlay').addClass('hidden');
					$.alert('Error:' + errorThrown);
				}
			});
		};

		function ajax_title(){
			// get the selects
			var $data = {
					"table": 'titles', 
					"selfields": 'id,name',
					"sidx": 'name',
					"sord": 'asc'
				};
			
			return svgEditor.getSelectDataFromAjax(svgEditor.path() + "/get_simpledata.php",
					$data,
					function (response) {
						//no need
					}						 
				);				
		};
		function ajax_requests(){
			$data = {
					"table": 'requests', 
					"selfields": 'id,name',
					"sidx": 'name',
					"sord": 'asc'
				};
			return svgEditor.getSelectDataFromAjax(svgEditor.path() + "/get_simpledata.php",
					$data,
					function (response) {
						//no need
					});
		};
		function ajax_rsvps(){
			$data = {
					"table": 'rsvps', 
					"selfields": 'id,name',
					"sidx": 'name',
					"sord": 'asc'
				};
			return svgEditor.getSelectDataFromAjax(svgEditor.path() + "/get_simpledata.php",
					$data,
					function (response) {
						//no need
					});									
		};
		function ajax_ages(){
			$data = {
					"table": 'ages', 
					"selfields": 'id,name',
					"sidx": 'name',
					"sord": 'asc'
				};
			return svgEditor.getSelectDataFromAjax(svgEditor.path() + "/get_simpledata.php",
					$data,
					function (response) {
						//no need
					});
		};
		function ajax_genders(){
			$data = {
					"table": 'genders', 
					"selfields": 'id,name',
					"sidx": 'name',
					"sord": 'asc'
				};
			return svgEditor.getSelectDataFromAjax(svgEditor.path() + "/get_simpledata.php",
					$data,
					function (response) {
						//no need
					});				
		};
		function ajax_meals(){
			$data = {
					"table": 'meals', 
					"selfields": 'id,name',
					"sidx": 'name',
					"sord": 'asc'
				};
			return svgEditor.getSelectDataFromAjax(svgEditor.path() + "/get_simpledata.php",
					$data,
					function (response) {
						//
					});
		};
		function ajax_maxguests(){
			var $maxguestdata = {
					"table": 'guests', 
					"selfields": 'max(guest_identifier)',
				};
			return svgEditor.getSelectDataFromAjax(svgEditor.path() + "/get_simpledata.php",
					$maxguestdata,
					function (response) {
						//
					});					
		};

		function ajax_getlayoutid(title,venue_id){
			var $data = {
					"table": 'layouts', 
					"selfields": 'id,name,venue_id',
					//"sum": "id",
					"where": [{
					           	"column": "name",
					           	"condition": "=",
					           	"value": title
								},
					          {
					           	"column": "venue_id",
					           	"condition": "=",
					           	"value": venue_id
					          }
					         ]
				};
			return svgEditor.getSelectDataFromAjax(svgEditor.path() + "/get_simpledata.php",
							$data,
							function (response) {
								//no need
							});
		};		
		
		function ajax_clearseat(guest_id, seat_id, event_id, layout_id){
	    	$data = {
					"table": 'seatings', 
					"setfields": 'id,guest_id,event_id,layout_id', 					
					"where": [{
			           	"column": "guest_id",
			           	"condition": "=",
			           	"value": guest_id
						},
						{
				           	"column": "id",
				           	"condition": "=",
				           	"value": seat_id
						},
			          {
			           	"column": "event_id",
			           	"condition": "=",
			           	"value": event_id
			          },
			          {
			           	"column": "layout_id",
			           	"condition": "=",
			           	"value": layout_id 
			          }
			         ]
			};
			return $.ajax({
				url: svgEditor.path() + "/delete_simpledata.php",
				type: "POST",
				data: {data: $data},
				success: function(response){
					//no need
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					$.alert('Error:' + errorThrown);
				}
			});
		};

		function ajax_assignseat(guest_id, n, event_id, layout_id){
			var $data = {
					"table": 'seatings', 
					"setfields": 'guest_id,id,event_id,layout_id', 
					"setvalues": [
					              guest_id,
					              n,
					              event_id,
					              layout_id
					              ]
			};
			return $.ajax({
				url: svgEditor.path() + "/insert_simpledata.php",
				type: "POST",
				data: {data: $data},
				success: function(response){
					//no need
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
            		$('#myoverlay').removeClass('ajaxloader');
            		$('#myoverlay').addClass('hidden');
					$.alert('Error:' + errorThrown);
				}
			});
		};
		
		/**************************
		 *   Standard functions   *
		 **************************/	
		
		function updateColors(){
			color_overout  = (!!seatPaintBox.stroke && !!seatPaintBox.stroke.paint) ? "#"+seatPaintBox.stroke.paint.solidColor : color_overout;
		};

		// handle jqGrid multiselect => thanks to solution from Byron Cobb on http://goo.gl/UvGku
		var handleMultiSelect = function (rowid, e) {
		    var grid = $(this);
		    if (!e.ctrlKey && !e.shiftKey) {
		        //grid.jqGrid('resetSelection');
		    }
		    else if (e.shiftKey) {
		        var initialRowSelect = grid.jqGrid('getGridParam', 'selrow');

		        grid.jqGrid('resetSelection');

		        var CurrentSelectIndex = grid.jqGrid('getInd', rowid);
		        var InitialSelectIndex = grid.jqGrid('getInd', initialRowSelect);
		        var startID = "";
		        var endID = "";
		        if (CurrentSelectIndex > InitialSelectIndex) {
		            startID = initialRowSelect;
		            endID = rowid;
		        }
		        else {
		            startID = rowid;
		            endID = initialRowSelect;
		        }
		        var shouldSelectRow = false;
		        $.each(grid.getDataIDs(), function (_, id) {
		            if ((shouldSelectRow = id == startID || shouldSelectRow) && (id != rowid)) {
		                grid.jqGrid('setSelection', id, false);
		            }
		            return id != endID;
		        });
		    }
		    return true;
		};

		function unassignInDatabase(l, e, v, t) {
			$data = {
					"table": 'seatings', 
					"setfields": 'id,guest_id,event_id,layout_id', 					
					"where": [
						{
				           	"column": "id",
				           	"condition": "in",
				           	"value": l
						},
			          {
			           	"column": "event_id",
			           	"condition": "=",
			           	"value": e
			          },
			          {
			           	"column": "layout_id",
			           	"condition": "=",
			           	"value": svgCanvas.getDocumentId()
			          }
			         ]
			};
			$.ajax({
				url: svgEditor.path() + "/delete_simpledata.php",
				type: "POST",
				async: false,
				data: {data: $data},
				success: function(response){
					if (response && response.status === 1) {
		    	    	$.alert('Error:' + response.responseText); 
		    	    } else {
        				// deleted from db
		    	    }
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					$.alert('Error:' + errorThrown);
				}
			});	
		};
		function getBB(all_elements) {
			var i = all_elements.length;
			var x = 0,y = 0, maxwidth = 0, maxheight = 0;
			while (i--) {
				var elem = all_elements[i];
				if (elem) {
					var bb = svgedit.utilities.getBBox(elem);
					if (bb) {
						if ( x==0 || bb.x < x ) {
							x = bb.x;
						}
						if ( y==0 || bb.y < y ) {
							y = bb.y; 
						}
						//maxwidth in the current space
						if ( maxwidth < (bb.x + bb.width) ){
							maxwidth = bb.x + bb.width;
						}
						if ( maxheight < (bb.y + bb.height) ){
							maxheight = bb.y + bb.height;
						}										
					}
				}
			}
			//return width/height of the elements translated based on x/y 
			return [x,y,maxwidth-x,maxheight-y];
		};
		
		function getRotatedBB(angle,x1,x2,y1,y2,rx0, ry0) {
			radians = angle * Math.PI / 180;
			/*
			 *  (x1,y1)-----------------------------(x2,y1)
			 *  	|									|
			 *  	|			(x0,y0)					|
			 *  	|									|
			 *  (x1,y2)-----------------------------(x2,y2)
			 */
	        var x11 = rx0 + (x1 - rx0) * Math.cos(radians) + (y1-ry0) * Math.sin(radians),
	            y11 = ry0 - (x1 - rx0) * Math.sin(radians) + (y1-ry0) * Math.cos(radians),
	            x21 = rx0 + (x2 - rx0) * Math.cos(radians) + (y2-ry0) * Math.sin(radians),
	            y21 = ry0 - (x2 - rx0) * Math.sin(radians) + (y2-ry0) * Math.cos(radians);
	
	        var x_min = Math.min(x11,x21),
	            x_max = Math.max(x11,x21);
	
	        var y_min = Math.min(y11,y21);
	            y_max = Math.max(y11,y21);
	
	        return [x_min,y_min,x_max-x_min,y_max-y_min];
        };
		
		function assignment(theValue,table) {
			var i = 0;	
			var assigned = new Array();
			var remain = new Array();
			var newtable = false;
			var aseat = null;
			var display = "";
			var event_id = svgCanvas.getDocumentEvent();
			var venue_id = svgCanvas.getDocumentVenue();
			var title = svgCanvas.getDocumentTitle();
			function displaySeat(seat,displayname){
				n = seat.attr("name");
				theparent = seat[0].parentNode;
				rect = seat[0].getBBox();
				//Display the seat green
				seat[0].setAttribute("stroke",color_select); 
				//Put the guest name in a text box on top of the selected circle.
		    	var t = S.addSvgElementFromJson({
	                "element": "g",
	                "attr": {
	                        "x": rect.x,
	                        "y": rect.y,
	                        "id": "text_" + S.getNextId(),
	                        "name": "text_" + n
		                }
	    	    });
	    	    textFlow(displayname,t,rect.width-5,rect.x+rect.width/2,rect.y+10,8,false,6);	
	    	    theparent.appendChild(t);
			};
			var i = 0;
			var values = new Array();
			function iteration(layout_id,table){
			    if (i === 0 && !table){
					// first assignment
					seat = $('circle[name="' + over.getAttribute("name") + '"]');
					$.when(ajax_assignseat(values[i].guest_id, seat.attr("name"), event_id, layout_id)).done(function(b1){
						response = b1;
						if (response && response.status === 1) {
			    	    	$.alert('Error:' + response.responseText);
			    	    } else {
							displaySeat(seat,values[i].display);
				    		assigned.push(values[i].guest_id);
				    		i++;
			 		    	if (values.length - i > 0) {
			 		            setTimeout(iteration(layout_id, seat.parent().attr('id')), 10); // Wait 10 ms to let the UI update.	 		    		
			 		    	} else {
			 		    		$('#guests_list_grid').trigger("reloadGrid");
			 		    		$('#guests_list_grid tbody').fadeTo(0,1);	                         
		                		$('#myoverlay').removeClass('ajaxloader');
		                		$('#myoverlay').addClass('hidden');			 		    		
			 		    	}
			    	    };
					});
			    } else {
			    	var aseat = nextSeat(over,table);  //jquery object
			    	//if aseat is on a different table
			    	//	ask the user to confirm or choose another table
			    	//	if the user confirm, continue with normal process
			    	//	if the user choose another table, recall nextseat with that table name
			    	if (aseat[0]){
			    		if (table && aseat.parent().attr('id') === table) {
			    			over = aseat[0];
					    	$.when(ajax_assignseat(values[i].guest_id, aseat.attr("name"), event_id, layout_id)).done(function(b1){
								response = b1;
								if (response && response.status === 1) {
					    	    	$.alert('Error:' + response.responseText);
					    	    } else {
									displaySeat(aseat,values[i].display);
						    		assigned.push(values[i].guest_id);
						    		i++;
					 		    	if (values.length - i > 0) {
					 		            setTimeout(iteration(layout_id,table), 10); // Wait 10 ms to let the UI update.	 		    		
					 		    	} else {
					 		    		$('#guests_list_grid').trigger("reloadGrid");
					 		    		$('#guests_list_grid tbody').fadeTo(0,1);	                         
				                		$('#myoverlay').removeClass('ajaxloader');
				                		$('#myoverlay').addClass('hidden');			 		    		
					 		    	}
					    	    };				    	    
							});
			    		} else {
			    			//prompt for table
	                		$('#myoverlay').removeClass('ajaxloader');
	                		$('#myoverlay').addClass('hidden');
			    			opts = new Array();
			    			$("g:has(> circle[name*='seat'])").each(function () {
			    				opts.push($(this).attr('id'));
			    			});
			    			$.select("Please confirm the table assignment, or choose another one",
			    				//options
			    				opts,
			    				function (val){
			    					//callback
			    					if (val === false) {
			    						//click cancel
			    						//Abort								        													
			    					} else {
			    						// get seat for that table
				                		$('#myoverlay').removeClass('hidden');
				                		$('#myoverlay').addClass('ajaxloader');			 		    		
			    						setTimeout(iteration(layout_id,val), 10); // Wait 10 ms to let the UI update.	
			    					}					
			    				},
			    				null,
			    				aseat.parent().attr('id'));
			    		}
			    	} else {
			    		//no more seat on the plan
	 		    		$('#guests_list_grid').trigger("reloadGrid");
	 		    		$('#guests_list_grid tbody').fadeTo(0,1);	                         
                		$('#myoverlay').removeClass('ajaxloader');
                		$('#myoverlay').addClass('hidden');			 		    					    		
			    	}
			    }				
			};
			$body = $("body");
			for (var key in theValue) {
				values.push({guest_id : key, display: theValue[key]});
			}
			//set the overlay here
			$.when(ajax_getlayoutid(title,venue_id)).done(function(a1){
				var layout_id = -1;
				response = a1;
				if (response.status === 0) {
					// selection is successful
					if (response.d.length > 0) {
						//returned something
						layout_id = response.d[0][0];		    							
					};
				}
				if (layout_id !== -1) {
					iteration(layout_id);   
				}
			});
		}
		
		function promptNextAssignment(theValue, aseat, display ){
			//get all tables
			opts = new Array();
			$("g:has(> circle[name*='seat'])").each(function () {
				opts.push($(this).attr('id'));
			});
			$.select("Please confirm the table assignment, or choose another one",
				//options
				opts,
				function (val){
					//callback
					if (val === false) {
						//click cancel
						//Abort								        													
					} else {
						// get seat for that table
        			    assignment(theValue,val);
					}					
				},
				null,
				aseat.parent().attr('id'));
		};
		
		function add2Group(name,note,users) {
			var i = 0;
			function iteration(group_id){				
	 				console.log("add2group: start guest " + i);    		
	 				var uid = -1;
	 				$.when(ajax_guestcreate(users[i])).done(function(a1){
	 					response = a1;
		 				if (response['gid']>0){									
							console.log("Guest create: Success.");
							uid = response['gid']; 
						} else {
							console.log("Guest create: Failed." + response.responseText);    		
						}	 					
						if (uid > 0 && group_id > 0) {
							$.when(ajax_assignGroup2Guest(uid, group_id)).done(function(b1){
								response = b1;
								if (response && response.status === 1) {
									console.log("assignGroup2Guest: Failed. " + uid + "->" + group_id + " " + response.responseText);						
					    	    } else {
									console.log("assignGroup2Guest: " + uid + "->" + group_id + " Success.");						
					    	    }						
							});
			 				console.log("add2group: done guest " + i);    		
						}
						i++;
		 		    	if (users.length - i > 0) {
		 		            setTimeout(iteration(group_id), 10); // Wait 10 ms to let the UI update.	 		    		
		 		    	} else {
							$('#myoverlay').removeClass("ajaxloader");
							$('#myoverlay').addClass("hidden");
							console.log("assignGroup2Guest: Last.");						
							console.log($('#myoverlay'));						
							$('#guests_list_grid').jqGrid().trigger("reloadGrid",[{current:true}]);
		 		    	}
	 				});
			}
			console.log("In add2group.");    		
			$('#myoverlay').removeClass("hidden");
			$('#myoverlay').addClass("ajaxloader");
			$.when(ajax_checkgroupexist(name)).done(function(a1){
				response = a1;
				console.log(a1);
				if (response.d.length == 0) {													
					$.when(ajax_creategroup(name,note)).done(function(a1){
						response = a1;
						if (response && response.status === 1) {
							console.log("CreateGroup: Failed.");    		
	                		$('#myoverlay').removeClass('ajaxloader');
	                		$('#myoverlay').addClass('hidden');
							$.alert('Error:' + response.responseText); 
			    	    } else {
	    					console.log("CreateGroup: Success.");    		
	    					iteration(response.d[0][0]);
			    	    }
					});
				} else {
					iteration(parseInt(response.d[0][0]));
				}
			});
			console.log("Out add2group.");    					
		};
		
		function createGuest(id,gid,cb){
			//console.log("createGuest: " + id +","+ gid +","+ cb);
			$data = {
					'guest_title' : $("#guest_title"+id).val(),
					'guest_identifier' : $("#guest_identifier"+id).val(),
					'guest_firstname' : $("#guest_firstname"+id).val(),
					'guest_lastname' : $("#guest_lastname"+id).val(),
					'guest_displayname' : $("#guest_displayname"+id).val(),
					'guest_gender' : $("#guest_gender"+id).val(),
					'guest_age' : $("#guest_age"+id).val(),
					'guest_meal' : $("#guest_meal"+id).val(),
					'guest_req' : $("#guest_req"+id).val(),
					'guest_note' : $("#guest_note"+id).val(),
					'guest_vip' : $("#guest_vip"+id).val(),
					'guest_rsvp' : $("#guest_rsvp"+id).val()
				};
			var lastid = -1;
			svgEditor.getSelectDataFromAjax(svgEditor.path() + "/guests_create.php",
					$data,
					function (response) {
						if (response['gid']>0){
							lastid = response['gid'];
							var $countguestdata = {
									"table": 'guests', 
									"selfields": 'id,name',
									"sum": "id"
								};
							svgEditor.getSelectDataFromAjax(svgEditor.path() + "/get_simpledata.php",
									$countguestdata,
									function (response) {
										if (response.d.length > 0) {													
											//set default value for guest firstname
											num = parseInt(response.d[0][0])+1;
											$("#guest_firstname"+id).val("Guest_"+num);
											$("#guest_identifier"+id).val(num);
											if (cb) { cb(lastid,gid); }
					                		$('#myoverlay').removeClass('ajaxloader');
					                		$('#myoverlay').addClass('hidden');
										}
									});			
						} else {
	                		$('#myoverlay').removeClass('ajaxloader');
	                		$('#myoverlay').addClass('hidden');
							$.alert("The guest '" + $("#guest_firstname"+id).val() + "' is already registered or an error occured.");
						}
					});
			return lastid;
		};
		
	    function incrementValue(e){
	    	$('#value').text(Math.max(parseInt($('#value').text()) + e.data.increment, 0)).change();
	        return false;
	    };
	    
	    function resizeLabels(){
	        var max = 0;
    	    $("label").each(function(){
    	        if ($(this).width() > max)
    	            max = $(this).width();
    	    });
    	    $("label").width(max);
    	    $("label").css("display", "inline-block");	
    	    return max;
	    };
	    
	    function resizeGuest(){
	    	resizeLabels();
    		var p = $("input[name='guest_firstname']").offset();
			var p1 = $("input[name='guest_lastname']").offset();
			$("input[name='guest_displayname']").offset( { left: p.left } );
			$("input[name='guest_displayname']").width( p1.left + $("input[name='guest_lastname']").width() - p.left );
			$("input[name='guest_note']").width( p1.left + $("input[name='guest_lastname']").width() - p.left );
			$("select").width($("input[name='guest_firstname']").width()-10); //10px for the up down button
	    };
	    
		//This function is for pre-filling all elements of the form
		function generateForm(id){
			var newform = form_template;
			var num = "";
			function updateNewForm(regexpattern, updateto) {
				newform = newform.replace(regexpattern,"$1" + updateto + "$2");
			};
			function parseResponse(response) {
				var $html = "";
				if (!!response && response.d.length > 0) {													
					var len = response.d.length;
					for (var i = 0; i< len; i++) {
						$html += '<option value="' + response.d[i][0] + '">' + response.d[i][1] + '</option>';
					}
					return $html;
					//$('#guest_req').append($html);
				}
				return $html;
			}
			/*
			add_guest_form
			guest_title + select
			guest_firstname
			guest_lastname
			guest_displayname
			guest_gender + select
			guest_age + select
			guest_meal + select
			guest_req + select
			guest_note
			guest_vip
			guest_rsvp + select
			*/

			$.when(ajax_title(),ajax_requests(),ajax_rsvps(),ajax_ages(),ajax_genders(),ajax_meals(),ajax_maxguests()).done(function(a1, a2, a3, a4, a5, a6, a7){
			    // the code here will be executed when all four ajax requests resolve.
			    // a1, a2, a3 and a4 are lists of length 3 containing the response text,
			    // status, and jqXHR object for each of the four ajax calls respectively.
				var $html = parseResponse(a1[0]);				
				updateNewForm(/(<select .*guest_title.+?>+?)(<\/select>)/,$html);
				$html = parseResponse(a2[0]);				
				updateNewForm(/(<select .*guest_req.+?>+?)(<\/select>)/,$html);
				$html = parseResponse(a3[0]);				
				updateNewForm(/(<select .*guest_rsvp.+?>+?)(<\/select>)/,$html);
				$html = parseResponse(a4[0]);				
				updateNewForm(/(<select .*guest_age.+?>+?)(<\/select>)/,$html);
				$html = parseResponse(a5[0]);				
				updateNewForm(/(<select .*guest_gender.+?>+?)(<\/select>)/,$html);
				$html = parseResponse(a6[0]);				
				updateNewForm(/(<select .*guest_meal.+?>+?)(<\/select>)/,$html);
				response = a7[0];
				if (!!response && response.d.length > 0) {													
					//set default value for guest firstname
					num = parseInt(response.d[0][0]) || 0;
					num = num + 1;
					//get previous identifier to present it in the form
					//use jquery to get the value
					var prev = -1; 
					$('input[id*="guest_identifier"]').each(function(){
						if(prev < $(this).val()){
							prev = $(this).val();
						}
					});
					if (prev > 0){
						num = parseInt(prev) + 1;
					}
					newform = newform.replace(/(input.*?guest_identifier.*?value=')/, "$1" + num +"'");	
					newform = newform.replace(/(input.*?guest_firstname.*?value=')/, "$1" + "Guest_"+num +"'");
				}
				newform = newform.replace("id='add_guest_form'", "id='add_guest_form"+id+"'");
				newform = newform.replace("id='guest_title'", "id='guest_title"+id+"'");
				newform = newform.replace("id='guest_firstname'", "id='guest_firstname"+id+"'");
				newform = newform.replace("id='guest_identifier'", "id='guest_identifier"+id+"'");
				newform = newform.replace("id='guest_lastname'", "id='guest_lastname"+id+"'");
				newform = newform.replace("id='guest_displayname'", "id='guest_displayname"+id+"'");
				newform = newform.replace("id='guest_gender'", "id='guest_gender"+id+"'");
				newform = newform.replace("id='guest_age'", "id='guest_age"+id+"'");
				newform = newform.replace("id='guest_meal'", "id='guest_meal"+id+"'");
				newform = newform.replace("id='guest_req'", "id='guest_req"+id+"'");
				newform = newform.replace("id='guest_note'", "id='guest_note"+id+"'");
				newform = newform.replace("id='guest_vip'", "id='guest_vip"+id+"'");
				newform = newform.replace("id='guest_rsvp'", "id='guest_rsvp"+id+"'");		
				$('#guests_forms').append("<div id='guest_form" + id +"' style='padding:2px; background:#fff; margin-top:2px;'>" + newform + "</div>");
     		    resizeGuest();
     		    $("#add_guest_form"+$('#value').text()).validate({
						rules: {
							guest_firstname: {
								required: true,
							}
						}
     		    });
        		$('#myoverlay').removeClass('ajaxloader');
        		$('#myoverlay').addClass('hidden');
				return "<div id='guest_form" + id +"' style='padding:2px; background:#fff; margin-top:2px;'>" + newform + "</div>";				
			});
			
		};
		
		//This is for dragging a row to a seat.
		function makeGridRowsDraggable() {
	        var $searchResultsGrid  =   $('#guests_list_grid'),
	            $searchResultsRows =    $("#guests_list_grid .ui-row-ltr");
	        
	        //$searchResultsRows.css("cursor","move").draggable("destroy").draggable({
	        $searchResultsRows.css("cursor","move").draggable({
	    	    revert:     "false",
	            appendTo:   'body',
	            cursor:     "move",
	            cursorAt:   {
	                            top: 10,
	                            left: -5
	                        },
	            helper:     function(event) {
	                            //get a hold of the row id
	                            //var rowId = $(this).attr('id'); //works only for a single row drag	                           
	            				// set the current row to selection if no selection when starting drag
	            				if ($('#guests_list_grid').getGridParam('selarrrow').length === 0) {	            					
		            				$('#guests_list_grid').setSelection($(this).attr('id'));
	            				}
	                            var theValue = "";
	            				console.log($(this).attr('id'));
	            				console.log($('#guests_list_grid').getCell($(this).attr('id'),0) );
	            				if ($(this).attr('id').match(/gridghead/g) != null){
	            					//we drag a header
	            					//extract the value
	            					var matches = $('#guests_list_grid').getCell($(this).attr('id'),0).match(/<b>(.*) - .*$/);
	            					if (matches != null) {
	            						//get the group
	            						console.log(matches);
	            						var groupname = matches[1];
	            						if (groupname.trim() == '&nbsp;' || groupname.trim() == '') {
	            							$(this).data('rejected', true);
	            						} else {
	            							$(this).data('rejected', false); 
		            						//select all rows from that group in that page.
		            						var grid = $('#guests_list_grid');
		            					    grid.jqGrid('resetSelection');
		            					    var first = 1;
	            					        $.each(grid.getDataIDs(), function (_, id) {
	            					        	if (grid.getCell(id,2) === groupname) {
		            					                grid.jqGrid('setSelection', id, false);
		            					                first = 0;
		            					        } else {
		            					        	if (!first) {
		            					        		return true;
		            					        	}
		            					        }
	            					        	//return (!first && grid.getCell(id,2) != groupname);
		            					    });            					        	            							
	            						}
	            					}
	            				}
            					var selrow = getSelRows();
	            				//use the row id you found to get the column text; by using the getCell method as below, 
	                            //the 'unformatter' on that column is called; so, if value was formatted using a
	                            //formatter, this method will return the unformatted value 
	                            //(as long as you defined an unformatter/using a built-in formatter)
	                            var val = new Array();
	                            for (var i = 0 ; i < selrow.length ; i++){
	                            	rowId = selrow[i];
		                            //set the data on this to the value to grab when you drop into input box
	                            	fn = $('#guests_list_grid').getCell(rowId, 'firstname');
	                            	ln = $('#guests_list_grid').getCell(rowId, 'lastname');
		                            if (i === 0) {
		                            	// only for the first row
		                            	if ($.trim(ln) !== "") {		                            		
			                            	theValue = fn.charAt(0) + ". " + ln;		                            		
		                            	} else {
			                            	theValue = fn;
		                            	}
		                            }
		                            // select only rows that are not assigned to a seat.
		                            if (!$('#guests_list_grid').getCell(rowId, 'seat')){
		                            	if ($.trim(ln) !== "") {		                            		
		                            		val[rowId] = fn.charAt(0) + ". " + ln;		                            		
		                            	} else {
		                            		val[rowId] = fn;
		                            	}
		                            }
	                            }
	                            //$(this).data('colValue', theValue); //assign all values to current row
	                            //$(this).data('colSeat', $('#guests_list_grid').getCell(rowId, 'seat') );
	                            $(this).data('colValue', val); //assign all values to current row
	                            if (selrow.length > 1){
		                            theValue = selrow.length + " guest(s)";	                            	
	                            }
	            				return $("<div class='draggedValue ui-widget-header ui-corner-all'>" + theValue + "</div>");
	                        },
	            start:      function(event, ui) {
	            				updateColors();
	            				svgCanvas.setDragStarted(true);
	            				status = "assign";
	                            //fade the grid
	                            $(this).parent().fadeTo('fast', 0.5);	                         
	                        },
	            stop:       function(event, ui) {
	            				svgCanvas.setDragStarted(false);
	            				status = "list";
	            				if ($(this).data('rejected') === true) {
		            				over.setAttribute("stroke",color_overout);
		            				$('#guests_list_grid').trigger("reloadGrid");
		                            $(this).parent().fadeTo(0, 1);
	            					$.alert('This group is not draggable. Please select 1 or n users to drag.');
	            				} else {
		            				if (over !== null && over.getAttribute("stroke") !== color_select && !$(this).data('colSeat')){
		            					//Remove the over stroke
			            				over.setAttribute("stroke",color_overout);
			            				// Get the display name & selected row id
			            				var theValue = $(this).data('colValue');
			            				// this loop is critical.
			            				// as per the request of ron to be able to prompt the user once the auto assignment must move to another table
			            				// since javascript and confirm dialogs are async, the loop must be splited in 2 as there is no way to wait for the user input.
			            				
			            		    	//$(this).parent().fadeTo(0, 1);
			            			    assignment(theValue,null);

		            				} else {
		            					if (over !== null) {	            						
			            					if (over.getAttribute("stroke") !== color_select) {
				            					//Remove the over stroke
					            				over.setAttribute("stroke",color_overout);		            					            						
			            					} else {
			            						over.setAttribute("stroke",color_select);
			            					}
		            					}
			                            $(this).parent().fadeTo(0, 1);
										//Reload the grid
										$('#guests_list_grid').trigger("reloadGrid");
		            				} // end if over is null	            					
	            				}
	                        } //end stop drag
	        }); // end css draggable
	    }; // end makeGridRowsDraggable()
		
	    // function to get selected rows
	    function getSelRows(){
	    	return $('#guests_list_grid').getGridParam('selarrrow');
	    }

	    // function to clear all previously assigned seats in the layout, 
	    //			this function is there just to clean up the schema if there was some problem before
	    // parameters : none
	    function clearOrphanSeats(){
			updateColors();
			$("g[name='table']").each(function(){ 
				var t = $(this); 
				t.find("circle[name*='seat']").each(function(){ 
					var n = $(this).attr('name');
					var s = t.find('g[name*=' + n + ']');
					if(s.length > 0){
						s.remove();
				    	$(this).attr("stroke",color_overout);						
					}
				});
			});
	    }; // end clearOrphanSeats

	    // function to clear a seat of a guest, 
	    //			it delete the guest assignment in the database for one layout a venue and an event
	    // parameters : seat is the svg node, guest_id is the row id
	    function clearSeat(rowid){
	    	var rowData = $('#guests_list_grid').jqGrid('getRowData', rowid);
	    	var seat = $('circle[name = "' + rowData.seat + '"]'); 
			var event_id = svgCanvas.getDocumentEvent();
			var venue_id = svgCanvas.getDocumentVenue();
			var title = svgCanvas.getDocumentTitle();
			updateColors();
	    	// Get the layout id
			$.when(ajax_getlayoutid(title,venue_id)).done(function(a1){
				var layout_id = -1;
				response = a1;
				if (response.status === 0) {
					// selection is successful
					if (response.d.length > 0) {
						//returned something
						layout_id = response.d[0][0];		    							
					}
				}
				if (layout_id !== -1) {
					$.when(ajax_clearseat(rowData.id, rowData.seat, event_id, layout_id)).done(function(b1){
						response = b1;
						if (response && response.status === 1) {
			    	    	$.alert('Error:' + response.responseText); 
			    	    } else {
	        				// deleted from db
							$('g[name = "text_' + rowData.seat + '"]').remove();
					    	seat.attr("stroke",color_overout);
					    	rowData.seat = null;
				    		$('#guests_list_grid').jqGrid('setRowData', rowid, rowData);
	                		$('#myoverlay').removeClass('ajaxloader');
	                		$('#myoverlay').addClass('hidden');
			    	    }						
					});
				}
			});
	    }; // end clearseat	   

	    // function to find the closest seat based on a given one
	    // If the table parameter is given, it will search in that table only.
	    // parameters : seat is the svg node
	    //				table is the optional table to search in
	    function nextSeat(seat, table){	    
	    	// get list of seats
	    	// create an array with the association seat/table/floor of unassigned seats 
	    	//    a[seatid] = [ 
			//				'table' = 1,
			//				'floor' = 1,
			//				'x' = 20,
			//				'y' = 40,
	    	//				]
	    	var a = new Array();
	    	var i = 0;
	    	$('circle[name*="seat"][stroke="' + color_overout + '"]').each(function () {
	    		var b = {
	    				'seat': $(this).attr("name"),
	    				'table': $(this).parent().attr("id"),
	    				'floor': $(this).closest("g:has('title')").find("title")[0].childNodes[0].nodeValue, 				
	    				'x': $(this).attr("cx"),
	    				'y': $(this).attr("cy")	    		        
	    		};
	    		a[i] = b;
	    		i++;
	    	});
	    	// Pickup must follow priorities
	    	// priority 1 : same table
	    	// priority 2 : shortest distance
	    	// Algo is based on 2D distance calculation
	    	// note : it may need to revised and use a spiral search in case there are too many seats (>10000) 
	    	//        but in this case probably another problem will happen at the browser side
	    	// 
	    	// BestSeatSameTable = null
	    	// BestSeatDistant = null
	    	// Search for a seat at same table
	    	// 		Foreach (SearchCircle in a)
	    	// 	  		BaseCircle(X1,Y1) ;  SearchCircle(X2,Y2);
	    	//	  		DeltaX = SearchCircle(X2) - BaseCircle(X1);
	    	//	  		DeltaY = SearchCircle(Y2) - BaseCircle(Y1);
	    	//	  		Distance = Sqrt( Pow(DeltaX,2) + Pow(DeltaY,2);
	    	//    		If (SearchCircle is at same table) then
	    	//				// Seat is at same table, first prio
	    	//				If (ClosestDistancePrio1 > Distance) Then 
	    	//					ClosestDistancePrio1 = Distance;
	    	//					BestSeatSameTable = SearchCircle;
	    	//			Else
	    	//				// Not same, but lets keep this in case we dont find a seat at same table
	    	//				If (ClosestDistancePrio2 > Distance) Then 
	    	//					ClosestDistancePrio2 = Distance;
	    	//					BestSeatDistant = SearchCircle;
	    	var jqseat = $('circle[name="' + seat.attributes.name.nodeValue + '"]');
	    	var bx = jqseat.attr("cx");
	    	var by = jqseat.attr("cy");
	    	var bt = jqseat.parent().attr("id");
	    	var bf = jqseat.closest("g:has('title')").find("title")[0].childNodes[0].nodeValue;
	    	var ClosestDistancePrio1 = -1;
	    	var ClosestDistancePrio2 = -1;
	    	var BestSeatSameTable = null;
	    	var BestSeatDistant = null;
	    	for (var i=0; i<a.length;i++){
	    		var d = Math.sqrt(Math.pow( a[i]["x"] - bx,2) + Math.pow( a[i]["y"] - by,2));
	    		if (table && a[i]["table"] === table) {
	    			if ( (ClosestDistancePrio1 > d) || (ClosestDistancePrio1 === -1)){
	    				ClosestDistancePrio1 = d;
	    				BestSeatSameTable = a[i];
	    			}	    			
	    		} else {
		    		if (a[i]["table"] === bt && a[i]["floor"] === bf) { //same table same floor
		    			if ( (ClosestDistancePrio1 > d) || (ClosestDistancePrio1 === -1)){
		    				ClosestDistancePrio1 = d;
		    				BestSeatSameTable = a[i];
		    			}
		    		} else if (a[i]["table"] !== bt && a[i]["floor"] === bf) { //different table
		    			if ((ClosestDistancePrio2 > d) || (ClosestDistancePrio2 === -1)){
		    				ClosestDistancePrio2 = d;
		    				BestSeatDistant = a[i];
		    			}
		    		} else {
		    			// different floor
		    			// at this moment, we believe there is no need to assign to a different floor automatically
		    		}	    			
	    		}
	    	}
	    	//	if (BestSeatSameTable) then
	    	//		return BestSeatSameTable;
	    	//	else if BestSeatDistant then 
	    	//		return BestSeatDistant;
	    	//	else
	    	//		// we found nothing, the user needs to go to another floor
	    	//		return false;	    	
	    	if (BestSeatSameTable !== null) {
	    		return $('circle[name="' + BestSeatSameTable["seat"] + '"]');
	    	} else if (BestSeatDistant !== null) {
	    		return $('circle[name="' + BestSeatDistant["seat"] + '"]');
	    	} else {
	    		return false; // no seat available on this floor
	    	}	    	
	    }; // end nextSeat
	    
		function showPanel(on){
			svgEditor.setIcon('#tool_guests_add', "tool_guests_add");
			svgEditor.setIcon('#tool_guests_group', "tool_guests_group");
			svgEditor.setIcon('#tool_guests_manage', "tool_guests_manage");
			//svgEditor.setIcon('#tool_guests_settings', "tool_guests_settings");
			$('#guests_panel').toggle(on);
		};
		
		function isNullOrWhiteSpace(str){
		    return str === null || str.match(/^ *$/) !== null;
		};

		/**************************
		 *   Buttons management   *
		 **************************/		
		
		return {
			name: "Guests",
			svgicons: "extensions/guests_icons.svg",
			
			// Multiple buttons can be added in this array
			buttons: [
				{
					id: "tool_guests", 
					type: "mode", 
					title: "Guests", 
					events: {
						'click': function() {
							var t = svgCanvas.getDocumentTitle();
							var i = svgCanvas.getDocumentId();
							var e = svgCanvas.getDocumentEvent();
							var v = svgCanvas.getDocumentVenue();
							if (!isNullOrWhiteSpace(t) &&
								!isNullOrWhiteSpace(e)  &&
								!isNullOrWhiteSpace(v) 
								) {
								//saved the properties
								
								showPanel(true);
								svgCanvas.setMode("guests");
								svgCanvas.runExtensions('modeButtonStateUpdate');
								//load the users list box
								var $dialog = $('#floating_box')
								.html('<table id="guests_list_grid"><tr><td/></tr></table><div id="guests_list_pager"></div>')
				                .dialog({
				                   autoOpen: false,
				                   closeOnEscape: false,
				                   modal: false,
				                   hidegrid: false,
				                   resizable: true,
				                   position: [60, 60],
				                   width: 450,
				                   height: $(window).height()-150,
				                   title: "Guests",
				                   open: function(event, ui){
				                	   //$(this).parent().children().children('.ui-dialog-titlebar-close').hide();
				                	   gridParentWidth = $('#gbox_guests_list_grid').parent().width();
				                	   $('#guests_list_grid').jqGrid('setGridWidth',gridParentWidth);
				                   }
				                });
								//$dialog.dialog("widget").find(".ui-dialog-title").hide();
								$dialog.dialog("widget").find(".ui-dialog-titlebar-close").hide();
								$('#guests_list_grid').jqGrid({ 
									url: svgEditor.path() + "/grid_guests_list.php", 
									editurl: svgEditor.path() + "/grid_guests_list.php", 
									postData: {
												venue: v,
												event: e,
												layout: t,
												layoutid: i
												},
					                datatype: 'json', 
					                caption: '', 
					                forcefit: false, shrinktofit:false, autowidth: true,
					                multiselect: true,
					                colNames:['id', 
					                          'Group', 
					                          'Seat', 
					                          'VIP',
					                          'Title',
					                          'FirstName', 
					                          'LastName',
					                          'Display',
					                          'Gender',
					                          'Age',
					                          'Meal',
					                          'Request',
					                          'RSVP'
					                          ], 
					                colModel :[ 
					                           	{name:'id',index:'guest_id', hidden:true,key:true, editable:false, sortable: false},
					                           	{name:'group', index:'group_name', width:'25', editable:true, sortable: true,
							                    	edittype: 'select',
							                    	editoptions: {
							                            dataUrl: svgEditor.path() + '/get_select.php?t=groups',
							                            buildSelect: function (data) {
							                                var response = jQuery.parseJSON(data);
							                                var s = '<select>';
							                                if (response && response.length) {
							                                    for (var i = 0, l = response.length; i < l; i++) {
							                                        var ri = response[i];
							                                        s += '<option value="' + ri[0] + '">' + ri[1] + '</option>';
							                                    }
							                                }
					                                        s += '<option value="-1"></option>';
							                                return s + "</select>";
							                            }			                           		
							                    	}
							                    },
							                    {name:'seat', index:'seating_id', width:'20', editable:false, sortable: false},
							                    {name:'VIP', index:'guest_vip', width:'20', align: 'center', edittype:'checkbox',
							                    	editable:true, sortable: true,
							                    	editoptions: { value: "1:0" },
							                    	formatter: "checkbox" },
							                    {name:'title', index:'title_name', width:'10', editable:true, sortable: true,
							                    	edittype: 'select',
							                    	editoptions: {
							                            dataUrl: svgEditor.path() + '/get_select.php?t=titles',
							                            buildSelect: function (data) {
							                                var response = jQuery.parseJSON(data);
							                                var s = '<select>';
							                                if (response && response.length) {
							                                    for (var i = 0, l = response.length; i < l; i++) {
							                                        var ri = response[i];
							                                        s += '<option value="' + ri[0] + '">' + ri[1] + '</option>';
							                                    }
							                                }
							                                return s + "</select>";
							                            }
							                    	}
							                    },
							                    {name:'firstname', index:'guest_firstname', width:'50', editable:true, sortable: true},
							                    {name:'lastname', index:'guest_lastname', width:'50', editable:true, sortable: true},
							                    {name:'display', index:'guest_display', width:'80', editable:true, sortable: true},
							                    {name:'gender', index:'gender_name', width:'20', editable:true, sortable: true,
							                    	edittype: 'select',
							                    	editoptions: {
							                            dataUrl: svgEditor.path() + '/get_select.php?t=genders',
							                            buildSelect: function (data) {
							                                var response = jQuery.parseJSON(data);
							                                var s = '<select>';
							                                if (response && response.length) {
							                                    for (var i = 0, l = response.length; i < l; i++) {
							                                        var ri = response[i];
							                                        s += '<option value="' + ri[0] + '">' + ri[1] + '</option>';
							                                    }
							                                }
							                                return s + "</select>";
							                            }
							                    	}
							                    },
							                    {name:'age', index:'age_name', width:'20', editable:true, sortable: true,
							                    	edittype: 'select',
							                    	editoptions: {
							                            dataUrl: svgEditor.path() + '/get_select.php?t=ages',
							                            buildSelect: function (data) {
							                                var response = jQuery.parseJSON(data);
							                                var s = '<select>';
							                                if (response && response.length) {
							                                    for (var i = 0, l = response.length; i < l; i++) {
							                                        var ri = response[i];
							                                        s += '<option value="' + ri[0] + '">' + ri[1] + '</option>';
							                                    }
							                                }
							                                return s + "</select>";
							                            }
							                    	}
							                    },
							                    {name:'meal', index:'meal_name', width:'20', editable:true, sortable: true,
							                    	edittype: 'select',
							                    	editoptions: {
							                            dataUrl: svgEditor.path() + '/get_select.php?t=meals',
							                            buildSelect: function (data) {
							                                var response = jQuery.parseJSON(data);
							                                var s = '<select>';
							                                if (response && response.length) {
							                                    for (var i = 0, l = response.length; i < l; i++) {
							                                        var ri = response[i];
							                                        s += '<option value="' + ri[0] + '">' + ri[1] + '</option>';
							                                    }
							                                }
							                                return s + "</select>";
							                            }
							                    	}
							                    },
							                    {name:'request', index:'request_name', width:'20', editable:true, sortable: true,
							                    	edittype: 'select',
							                    	editoptions: {
							                            dataUrl: svgEditor.path() + '/get_select.php?t=requests',
							                            buildSelect: function (data) {
							                                var response = jQuery.parseJSON(data);
							                                var s = '<select>';
							                                if (response && response.length) {
							                                    for (var i = 0, l = response.length; i < l; i++) {
							                                        var ri = response[i];
							                                        s += '<option value="' + ri[0] + '">' + ri[1] + '</option>';
							                                    }
							                                }
							                                return s + "</select>";
							                            }
							                    	}
							                    },
							                    {name:'RSVP', index:'rsvp_name', width:'25', editable:true, sortable: true,
							                    	edittype: 'select',
							                    	editoptions: {
							                            dataUrl: svgEditor.path() + '/get_select.php?t=rsvps',
							                            buildSelect: function (data) {
							                                var response = jQuery.parseJSON(data);
							                                var s = '<select>';
							                                if (response && response.length) {
							                                    for (var i = 0, l = response.length; i < l; i++) {
							                                        var ri = response[i];
							                                        s += '<option value="' + ri[0] + '">' + ri[1] + '</option>';
							                                    }
							                                }
							                                return s + "</select>";
							                            }
							                    	}
							                    },
					                ], 
					                viewrecords: true,
					                grouping:true,
					                groupingView : { 
					                	groupField : ['group'], 
					                	groupColumnShow : [true], 
					                	groupText : ['<b>{0} - {1} Guest(s)</b>'], 
					                	groupCollapse : true, 
					                	groupOrder: ['desc'] 
					                },					                
					                mtype: "POST",
					                width: 400, 
					                sortname: 'group_name',
					                pager: '#guests_list_pager', 		
					                altRows: true,
					                rownumbers: true,
					                rowNum:1000, 
					                jsonReader : { 
					                    page: 'page', 
					                    total: 'total', 
					                    records: 'records', 
					                    root:'d', 
					                    repeatitems: false, 
					                    id: 'id' 
					                },
					                /*
					                onSelectRow: function(rowid,status,e){
					                	//alert(rowid);
					                	grid.jqGrid('setSelection', rowid, false);
					                },*/
					                gridComplete:function(){ 
					                	makeGridRowsDraggable();
					                    return true; 
					                },
					                loadError : function(xhr,st,err) {
					                	alert(err);
					                },
					                beforeSelectRow: handleMultiSelect, // handle multi select					                
					                loadComplete: function() {
					                    $("tr.jqgrow", this).contextMenu('myMenu1', {
					                        bindings: {
					                            'cleargroupassign': function(trigger) {
					                                // trigger is the DOM element ("tr.jqgrow") which are triggered
					                                //alert(trigger.id);
					                            	var selrow = getSelRows();
					                            	var allrows = $('#guests_list_grid').getRowData();
					                            	for (var i = 0 ; i < selrow.length ; i++){
						                            	rowId = selrow[i];
						                            	group = $('#guests_list_grid').getCell(rowId, 'group');
						                            	for (var i=0; i<allrows.length; i++){
						                            		if (allrows[i].group === group && allrows[i].seat !== ""){
							                            		clearSeat(allrows[i].id);						                            			
						                            		}
						                            	}							                            							                         
					                            	}
					                            },
					                            'clearguestassign': function(trigger) {
					                                //alert(trigger.id);
					                            	clearSeat(trigger.id);					                            	
					                            },
					                            'clearall': function(trigger) {
					                                // trigger is the DOM element ("tr.jqgrow") which are triggered
					                            	//clear all really assigned seats
					                            	var allrows = $('#guests_list_grid').getRowData();
					                            	for (var i=0; i<allrows.length; i++){
					                            		clearSeat(allrows[i].id);						                            								                            		
					                            	}
					                            	//clear remaining circles that could have been kept by mistake
					                            	clearOrphanSeats();
					                            }
					                        },
					                        onContextMenu: function(event/*, menu*/) {					                        	
					                            //var rowId = $(event.target).closest("tr.jqgrow").attr("id");
					                            //if (!$('#guests_list_grid').find("#" + rowId ).hasClass("ui-state-highlight") ){
						                        //    $('#guests_list_grid').setSelection(rowId);					                            	
					                            //}
					                            /*
					                            // disable menu for rows with even rowids
					                            $('#del').attr("disabled",Number(rowId)%2 === 0);
					                            if (Number(rowId)%2 === 0) {
					                                $('#del').attr("disabled","disabled").addClass('ui-state-disabled');
					                            } else {
					                                $('#del').removeAttr("disabled").removeClass('ui-state-disabled');
					                            }
					                            */
					                            return true;
					                        }
					                    });
					                }
					            });
								$("#guests_list_grid").jqGrid("navGrid", "#guests_list_pager",
									    {
											add: false, 
											edit: true, 
											del: true, 
											search: true, 
											refresh: true, 
											refreshstate: "current", 
											zIndex: 9999},
									    { //add
											reloadAfterSubmit: true,
											recreateForm: true,
											zIndex: 9999
										},
									    { //edit
									    	reloadAfterSubmit: true,
									    	recreateForm: true,
									    	zIndex: 9999							            
									    },
									    { //del
									    		reloadAfterSubmit: true, 
									    		zIndex: 9999,
									    		 errorTextFormat:function (data) {
									    		        if (data.responseText.substr(0, 6) == "<html ") {
									    		            return jQuery(data.responseText).html();
									    		        }
									    		        else {
									    		        	var re = new RegExp('X-Error-Message:(.*)');
											    			$res = data.getAllResponseHeaders().match(re);
											    			if (!!$res) {
										    		            return "Status: '" + $res[1] + "'. Error code: " + data.status;
											    			} else {
										    		            return "Status: '" + data.statusText + "'. Error code: " + data.status;
											    			}
									    		        }
									    		},
										    	onclickSubmit: function (options, rowId) {										    		
										    		var selrow = getSelRows();
										    		options.delData.layout = svgCanvas.getDocumentTitle();
										    		options.delData.layoutid = svgCanvas.getDocumentId();
										    		options.delData.event = svgCanvas.getDocumentEvent();
										    		options.delData.venue = svgCanvas.getDocumentVenue();
										    		options.delData.group = "";
										    		for(var i=0; i<selrow.length;i++){
						                            	rowId = selrow[i];
						                            	options.delData.group += $('#guests_list_grid').getCell(rowId, 'group') + ",";
										    		}
					                            	options.delData.group = options.delData.group.replace(/,$/,"");
					                            	return {};
								                },
								                afterSubmit: function(response, postdata) {
								                    // if multiselect is true we need to parse all selected id
										    		var selrow = getSelRows();
										    		for(var i=0; i<selrow.length;i++){
						                            	clearSeat(selrow[i]);										    			
										    		}
										    		return [true,"Successfully deleted guests."];
								                }
									    },
						                { //search
						                    caption: "Search...",
						                    Find: "Find",
						                    Reset: "Reset",
						                    sopt : ['eq','ne','lt','le','gt','ge','bw','bn','ew','en','cn','nc','nu','nn'],
						                    zIndex: 9999
						                }
								);	

								$(":checkbox").attr("autocomplete", "off");
								$(window).resize(function(){
								    gridId = "guests_list_grid";
								    gridWidth = $('#gbox_' + gridId).parent().width();
								    gridHeight = $('#gbox_' + gridId).parent().height();
								    
								    $('#' + gridId).jqGrid('setGridWidth',gridWidth);
								    if(gridHeight < 110){  //Height of five rows in grid is 110 pixels.
								    	gridHeight = 110;
								        $('#'+ gridId).jqGrid('setGridHeight',gridHeight-60);
								        $('#gbox_' + gridId).parent().height(gridHeight);
								    }
								    else {
								        $('#'+ gridId).jqGrid('setGridHeight',gridHeight-60);
								    }
								});
								$('.td input:checkbox').on('click', function (e)
								        {
								            //e.stopPropagation();
								});
								$dialog.dialog('open');
								
								gridId = "guests_list_grid";
							    gridWidth = $('#gbox_' + gridId).parent().width();
							    gridHeight = $('#gbox_' + gridId).parent().height();
								$('#' + gridId).jqGrid('setGridHeight',gridHeight-60);
								$('#' + gridId).jqGrid('setGridWidth',gridWidth);							    
								$('#gbox_guests_list_grid').css("left","-15px");
								$('#gbox_guests_list_grid').css("width",$(".ui-dialog-titlebar").width());
							} else {
								$.alert("Please fill the document properties (Menu->'Document Properties')\nVenue, Event, Title...");
							}
						}
					}
				}],
			context_tools: [
				{
					id: 'tool_guests_add', 
					title: 'Add Guests',
					panel: 'guests_panel',
					type: 'push_button', 
					events: {
						'click': function() {							
							//load the creation box							
							$dialog = $('#dialog_box')
							.html(guest_form)
							//.html("")
			                .dialog({
			                   autoOpen: false,
			                   modal: true,
			                   resizable: false,
			                   width: 850,
			                   height: 500,
			                   title: "New guest",
			                   open: function(){
			                	   generateForm("");
			                	   /*
			                	   //Get the number of guests already in DB and set a guest identifier, default guest name.
			                	   var $countguestdata = {
											"table": 'guests', 
											"selfields": 'id,name',
											"sum": "id"
										};
									svgEditor.getSelectDataFromAjax(svgEditor.path() + "/get_simpledata.php",
											$countguestdata,
											function (response) {
												//set default value for guest firstname
												if (response.d.length > 0) {
													num = parseInt(response.d[0][0])+1;
													$("#guest_firstname").val("Guest_"+num);
													$("#guest_identifier").val(num);
												}
											});
			                	    $('.ui-widget-overlay').addClass('custom-overlay');
			                	    //$('#guest_form').addClass('ui-state-focus'); //no need.
			                	    resizeGuest();
			                	    $("#add_guest_form").validate({
										rules: {
											guest_firstname: {
												required: true,
											}
										}
		                		   });
		                		   */
			                   },
			                   buttons: {
									"Create": function (event){
										if ($('#add_guest_form').valid()) {
											//ajax call to create a guest.
											createGuest("","");
											$('#guests_list_grid').jqGrid().trigger("reloadGrid",[{current:true}]);
										}
										$(this).dialog("close");
									},
									"Cancel": function(){
		   								$(this).dialog("close");
		   							}
			                   }
							});
							$dialog.dialog('open');
							$.extend($.jgrid.jqModal, {zIndex: 1105});
						}
					}
				},
				{
					id: "tool_guests_group", 
					panel: "guests_panel",
					type: "push_button", 
					title: "Add groups", 
					events: {
						'click': function() {
							//load the creation box							
							$dialog = $('#dialog_box')
							.html(group_form)
			                .dialog({
			                   autoOpen: false,
			                   modal: true,
			                   resizable: false,
			                   width: 850,
			                   height: 500,
			                   closeOnEscape: false,
			                   title: "Add a new group",
			                   open: function(){
		                		   resizeLabels();
			                	   //Get the number of guests		
			                	   $('#plus').bind('click', {increment: 1}, incrementValue);
			                	   $('#minus').bind('click', {increment: -1}, incrementValue);
			                	   $("#add_group_form").validate({
										rules: {
											group_name: {
												required: true,
											}
										}
		                		   });
			                	   $('#value').change(function(){
			                		   if (parseInt($('#value').text()) < group_users) {
			                			   //user decrease
			                			   $('#guest_form' + group_users).remove();
			                		   } else {
			                			   // user increase
			                			   generateForm($('#value').text());				                			
			                		   }
		                			   group_users = parseInt($('#value').text());
			                	   });
			                   },
			                   beforeClose: function(event,ui){ 
			                	   group_users = 0; 
			                   },
			                   buttons: {
									"Create": function (event){
										if ($('#add_group_form').valid() && group_users > 0){
											//Check all forms have the firstname filled
											var good = true;
											var gid = -1;
											var guestid = -1;
											$('form[id*="add_guest_form"]').each(function(){
												if (good && !$(this).valid()) {
													good = false;
												}				
											});
											//ajax call to create a guest.
											if (good) {		
						                		console.log("In dialog.");
												var users = new Array();
						                		$('form[id*="add_guest_form"]').each(function(){
													var name = $(this).attr('id');
													var id = name.replace(/(add_guest_form)([0-9]+)/,'\$2');
													$data = {
															'guest_title' : $("#guest_title"+id).val(),
															'guest_identifier' : $("#guest_identifier"+id).val(),
															'guest_firstname' : $("#guest_firstname"+id).val(),
															'guest_lastname' : $("#guest_lastname"+id).val(),
															'guest_displayname' : $("#guest_displayname"+id).val(),
															'guest_gender' : $("#guest_gender"+id).val(),
															'guest_age' : $("#guest_age"+id).val(),
															'guest_meal' : $("#guest_meal"+id).val(),
															'guest_req' : $("#guest_req"+id).val(),
															'guest_note' : $("#guest_note"+id).val(),
															'guest_vip' : $("#guest_vip"+id).val(),
															'guest_rsvp' : $("#guest_rsvp"+id).val()
														};
													users.push($data);
												});
						                		add2Group($('#group_name').val(),$('#group_note').val(),users);
						                		console.log("Close dialog.");
						                		$(this).dialog("close");
											}												
										}
									},
									"Cancel": function(){
		   								$(this).dialog("close");
		   								group_users = 0;
		   							}
			                   }
							});
							$dialog.dialog('open');							
						}
					}
				},
				{
					id: "tool_guests_manage", 
					panel: "guests_panel",
					type: "push_button", 
					title: "Guests and groups reporting", 
					events: {
						'click': function() {
             			   $body = $("body");
            			   $body.addClass("loading");
							if (!$('#c_report').length) {
								$('<canvas>', {id: 'c_report'}).hide().appendTo('body');
							}
							// Alias Namespace constants
							var NS = svgedit.NS;		
							//Init data array
							var layout = {
									title : svgCanvas.getDocumentTitle(),
									venue : svgCanvas.getDocumentVenue(),
									event : svgCanvas.getDocumentEvent(),
									floors : undefined,
									tables : undefined
											};
							// Retrieve all floors and convert to image
							/*
							 * floors['name'] = {
							 * 					svg : ""
							 * 					img : ""
							 * 					}
							 */
							var hiddenfloors = new Array();
							$('#svgcontent').children('g').each(function(){
								if (($(this).attr('display') !== null) && ($(this).attr('display') !== 'inline')) {
									$(this).attr('display','inline');
									hiddenfloors.push($(this));
								}
							});
							var floors = new Array();							
							$('#svgcontent').children('g').each(function (){								
								// Set the size for export
								$('#c_report')[0].width = svgCanvas.contentW;
								$('#c_report')[0].height = svgCanvas.contentH;
								var XMLS = new XMLSerializer(); 
								$svgstring = XMLS.serializeToString($(this)[0]);
								canvg('c_report','<svg>' + 
										$svgstring + '</svg>', {});
								var canvas = document.getElementById("c_report");
								floors[$(this).find('title')[0].childNodes[0].nodeValue] = {
									svg: $svgstring,
									img: canvas.toDataURL("image/png")
								};
							});
							layout.floors = floors;							
							//find all tables
							/*
							 * Tables['name'] = {
							 * 					seats_id : []
							 * 					floor : ""
							 * 					svg : ""
							 * 					}
							 * 
							 */
							var tables = new Array();
					    	var i = 0;
					    	$('circle[name*="seat"]').each(function () {
					    		var name = $(this).closest('[name="table"]').attr("id");
					    		if ( !(name in tables) ) { //table doesnt exist
					    			var currtable = $(this).closest('[name="table"]');
					    			var bb = getBB(currtable.children());
									//check if the object has been rotated.
									//then calculate the new coordinates
									if (!!currtable.attr('transform') && currtable.attr('transform').indexOf('rotate') > -1) {
										//we are rotated!
										$rotation = currtable.attr('transform');
										//x2 = x0+(x-x0)*cos(theta)+(y-y0)*sin(theta)
										//y2 = y0-(x-x0)*sin(theta)+(y-y0)*cos(theta)										
										var re = new RegExp('rotate\\(([0-9]*[.]*[0-9]*),*\\s([0-9]*[.]*[0-9]*),*\\s([0-9]*[.]*[0-9]*)\\)');
						    			$res = $rotation.match(re);
						    			$theta = parseFloat($res[1]);
						    			$x0 = parseFloat($res[2]);
						    			$y0 = parseFloat($res[3]);
						    			newbb = getRotatedBB($theta,bb[0],bb[0] + bb[2], bb[1],bb[1] + bb[3], $x0, $y0);						    			
						    			bb[0] = newbb[0];
						    			bb[1] = newbb[1];
						    			bb[2] = newbb[2];
						    			bb[3] = newbb[3];						    			
									} 
									// Set the size for export
									$('#c_report')[0].width = bb[2]+10;
									$('#c_report')[0].height = bb[3]+10;
									var translatex = bb[0]-5;
									var translatey = bb[1]-5;										
									var XMLS = new XMLSerializer(); 
									$svgstring = XMLS.serializeToString(currtable[0]);
									
									//get the bb for each elements and find the 
									canvg('c_report','<svg id="svgroot" xmlns="' + NS.SVG + '" xlinkns="' + NS.XLINK + '" >' + 
											'<g transform="translate(-' + translatex + ',-' + translatey +')">' + $svgstring + '</g></svg>', {});
									var canvas = document.getElementById("c_report");
						    		tables[name] = {
						    						seats_id : [],
						    						floor : $(this).closest("g:has('title')").find("title")[0].childNodes[0].nodeValue,
						    						svg : $svgstring,
						    						img : canvas.toDataURL("image/png")
						    						};
					    		}
					    		tables[name].seats_id.push($(this).attr("name"));
					    		i++;
					    	});
						   //hide what was hidden
					    	for(var i=0; i<hiddenfloors.length;i++){
					    		$(hiddenfloors[i]).attr('display','none');
					    	}					    	
					    	layout.tables = tables;
					    	//let s display our report
					    	//get all seats for the current layout
					    	var allseats = {};
					    	$.ajax({
								url: svgEditor.path() + "/report.php",
								type: "POST",
								async: false,
								data: { e : layout.event,
										v : layout.venue,
										l : layout.title
									},
								success: function(response){
									if (!!response) {
										allseats = response;										
									}
								},
								error: function (XMLHttpRequest, textStatus, errorThrown) {
									$.alert('Error:' + errorThrown);
									
								}
							});
					    	var head = "<head><link rel='stylesheet' type='text/css' media='screen' href='" + svgEditor.path() + "/themes/redmond/jquery-ui-custom.css' />";
					    	head += "<script src='" + svgEditor.path() + "/jquery-1.8.3.js'></script>";
					    	head += "<script src='" + svgEditor.path() + "/js/jquery.cookie.js'></script>";
					    	head += "<script src='" + svgEditor.path() + "/jquery-ui-1.9.2.custom.js'></script>";
					    	head += "<script src='" + svgEditor.path() + "/jquery-treeview/tree.jquery.js'></script>";
					    	head += '<script type="text/javascript"> function doSomething(d) { $("#treeview").tree({ data : d });} </script>';
					    	head += "<link rel='stylesheet' type='text/css' media='screen' href='" + svgEditor.path() + "/themes/ui.jqgrid.css' />";
					    	head += "<link rel='stylesheet' type='text/css' media='screen' href='" + svgEditor.path() + "/jquery-treeview/jqtree.css' />";
					    	head += "</head>";
						    var tpl = "<body>";
						    	tpl += "<div id='floors-report'>";
						    	tpl += "<div id='floors-report-title' class='ui-widget ui-widget-header' style='padding: .4em 1em;'>Floors report</div>";
						    	tpl += "</div>";
						    	tpl += "<div id='tables-report'>";
						    	tpl += "<div id='tables-report-title' class='ui-widget ui-widget-header' style='padding: .4em 1em;'>Tables report</div>";
						    	tpl += "</div>";
						    	tpl += "<div id='schematic-report'>";
						    	tpl += "<div id='schematic-report-title' class='ui-widget ui-widget-header' style='padding: .4em 1em;'>Schematic report</div>";
						    	tpl += "</div>";
						    	tpl += "<div id='eventsummary-report'>";
						    	tpl += "<div id='eventsummary-report-title' class='ui-widget ui-widget-header' style='padding: .4em 1em;'>Event summary</div>";
						    	tpl += "</div>";
						    	tpl += "<div id='guests-report'>";
						    	tpl += "<div id='guests-report-title' class='ui-widget ui-widget-header' style='padding: .4em 1em;'>Alphabetical List of all guests</div>";
						    	tpl += "</div>";
						    	tpl += "</body>";
							var newdoc = $('<body>');
					    	newdoc.html(tpl);
					    	for(key in layout.floors){
						    	newdoc.find('#floors-report').append("<div class='ui-widget-header' style='padding-left: 1em'>" + key + "</div><div class='ui-widget-content' style='padding-left: 1em'><table id='image_" + key + "' style='width=100%;'><tr><td><img style='display:block;' width='100%' height='100%' src='"+layout.floors[key].img+"' /></td></tr></table></div>");
					    	}
					    	var k = 0;
				    		var treeviewdata = new Array();
				    		var tables_details = new Array();
				    		var all_guests = new Array();
				    		var all_guests_table_n_seat = new Array();
					    	for(key in layout.tables){
						    	newdoc.find('#tables-report').append("<div class='ui-widget-header' style='padding-left: 1em'>" + key + 
						    										"</div><div class='ui-widget-content' style='padding-left: 1em'><img src='"+layout.tables[key].img + "' />" +
						    										"<div id='tables-report-guests" + k + "' style='margin-top:15px; margin-bottom:15px;' />" +
						    										"<table id='tables-report-seats" + k + "' class='ui-jqgrid-btable'>"+
						    										"<th class='ui-state-default ui-th-column'>Seat</th>" +
						    										"<th class='ui-state-default ui-th-column'>Title</th>" +
						    										"<th class='ui-state-default ui-th-column'>FirstName</th>" +
						    										"<th class='ui-state-default ui-th-column'>LastName</th>" +
						    										//"<th class='ui-state-default ui-th-column'>Display</th>" +
						    										"</table></div>");
						    	var guestsfound = 0;
						    	var children = new Array();
						    	var guests_details = new Array();
					    		for(var i=0;i<layout.tables[key].seats_id.length;i++){
					    			var s = layout.tables[key].seats_id[i];
					    			var notfound = 1;
					    			var j = allseats.length;
					    			while(notfound && j--){
					    				if (allseats[j].seating_id === s) {
					    					notfound = 0;
					    					guestsfound++;
					    					even  =  (guestsfound % 2) ? "ui-priority-secondary" : "";
					    					//fill table report
					    					newdoc.find('#tables-report-seats'+k).append("<tr class='ui-widget-content jqgrow " + even +"'><td>" + allseats[j][5] + "</td>"+
					    							"<td>" + allseats[j][0] + "</td>" +
					    							"<td>" + allseats[j][1] + "</td>" +
					    							"<td>" + allseats[j][2] + "</td>" +
					    							//"<td>" + allseats[j][3] + "</td>" +
					    							"</tr>");
					    					//Agreement from Craig to remove the "display" name
					    					//if (allseats[j][3] !== "") {
									    	//	children.push( { label: allseats[j][0] + " " + allseats[j][1] + " " + allseats[j][2] + " (" + allseats[j][3] + ")" } );					    						
					    					//} else {
									    		children.push( { label: allseats[j][0] + " " + allseats[j][1] + " " + allseats[j][2] } );
					    					//}
					    					// add the record for later use
					    					guests_details.push( {
					    						title: allseats[j][0],
					    						firstname: allseats[j][1],
					    						lastname: allseats[j][2],
					    						displayname: allseats[j][3]
					    					});
					    					$name = allseats[j][2] + " " + allseats[j][1];
					    					all_guests.push( $name.trim() );
					    					all_guests_table_n_seat[ $name.trim() ] = { seat: allseats[j][5], table: key };
					    				}
					    			}
					    		}
				    			if (guestsfound == 0) {
			    					newdoc.find('#tables-report-seats'+k).append("<tr class='ui-widget-content jqgrow' ><td colspan='5'>No guest assigned.</td></tr>");					    				
				    			} else {
			    					newdoc.find('#tables-report-guests'+k).append("# Guests : " + guestsfound );					    								    				
				    			}
					    		treeviewdata.push( { 
		    		            	  label: key, 
		    		            	  children: children 
		    		              } );
					    		tables_details.push({
					    			name: key,
					    			details: guests_details
					    		});
					    		k++;
						    }					    	
	    					//fill the schematic report
				    		newdoc.find('#schematic-report').append('<div class="ui-widget-content" style="padding-left: 1em"><div id="treeview" /></div>');
				    		//fill the table summary report 
				    		newdoc.find('#eventsummary-report').append('<div id="eventsummary-report-warea" class="ui-widget-content" style="padding-left: 1em"></div>');
				    		$html = "<table id='tables-eventsummary-report" + k + "' class='ui-jqgrid-btable' style='width:100%;'>";		
				    		$j = 1;
				    		$row = 0;
				    		for(var i=0;i<tables_details.length;i++){
			    				if ($j == 1) {
					    			$row++;
					    			$html += "<tr class='ui-widget-content jqgrow'>";
					    			$html += "	<td id='row"+ $row +"_col1' style='width:25%; vertical-align:top;'></td>";
					    			$html += "	<td id='row"+ $row +"_col2' style='width:25%; vertical-align:top;'></td>";
					    			$html += "	<td id='row"+ $row +"_col3' style='width:25%; vertical-align:top;'></td>";
					    			$html += "	<td id='row"+ $row +"_col4' style='width:25%; vertical-align:top;'></td>";
					    			$html += "</tr>";
			    				}
		    					$details = "<table style='width:100%;'>"; 
		    					$details += "<tr><th class='ui-state-default ui-th-column'>" + tables_details[i].name + "</th></tr>";
		    					$guests_num = 0;
				    			for(var k=0; k<tables_details[i].details.length;k++){
				    				even = (k%2 == 0) ? "ui-state-passive" : "ui-state-active";
				    				$write = "";
				    				$write += tables_details[i].details[k].title || "";
				    				$write += (tables_details[i].details[k].firstname) ? " " + tables_details[i].details[k].firstname : "";
				    				$write += (tables_details[i].details[k].lastname) ? " " + tables_details[i].details[k].lastname : "";
				    				//$write += (tables_details[i].details[k].display) ? " (" + tables_details[i].details[k].display + ")" : "";
				    				$details += "<tr><td class='" + even + "'>" + $write + "</td></tr>";
				    				$guests_num++;
								}
				    			if($guests_num == 0) {
				    				$details += "<tr><td class='ui-state-passive'>No guest assigned.</td></tr>";				    				
				    			}
		    					$details += "</table>";
				    			var re = new RegExp("(<td id='row[^>]*?_col" + $j + "[^>]*>)(<\/td>)");
				    			$html = $html.replace(re, "$1" + $details + "$2");
				    			if (($j % 4) == 0) {
				    				$j=1;
				    			} else {
				    				$j++;
				    			}
				    		}
				    		$html += "</table>";
				    		newdoc.find('#eventsummary-report-warea').append($html);
				    		//alphabetical order
			    			$j = 0;
			    			$first = 1;
				    		$row = 0;
				    		$prevletter = "";
				    		all_guests.sort();
				    		$maintable = $('<table></table>');
				    		$maintable.attr('id','tables-guests-report');
				    		$maintable.attr('class', 'ui-jqgrid-btable');
				    		$maintable.css('width','100%');		
				    		$obj = undefined;
				    		for(var i=0;i<all_guests.length;i++){
			    				if ($j == 0 || ($j % 5) == 0) {
					    			$row++;
					    			$html = "<tr class='ui-widget-content jqgrow'>";
					    			$html += "	<td id='letterrow"+ $row +"_col1' style='width:25%; vertical-align:top;'></td>";
					    			$html += "	<td id='letterrow"+ $row +"_col2' style='width:25%; vertical-align:top;'></td>";
					    			$html += "	<td id='letterrow"+ $row +"_col3' style='width:25%; vertical-align:top;'></td>";
					    			$html += "	<td id='letterrow"+ $row +"_col4' style='width:25%; vertical-align:top;'></td>";
					    			$html += "</tr>";
					    			$maintable.append($html);
					    			$j=1;
					    		}
			    				even = (i%2 == 0) ? "ui-state-passive" : "ui-state-active";
		    					$name = all_guests[i];
			    				if ($prevletter != all_guests[i].charAt(0)){
		    						//add header
			    					$prevletter = all_guests[i].charAt(0);
		    						$obj = $('<table></table>');
		    						$obj.attr('id',$prevletter);
		    						$obj.css('width','100%');
			    					$obj.append("<tr><th colspan='3' class='ui-state-default ui-th-column'>" + $prevletter + "</th></tr>");
			    					$maintable.find('#letterrow'+$row+'_col'+$j).append($('<div>').append($obj.clone()).html());
			    					$maintable.find('#letterrow'+$row+'_col'+$j+' > #'+$prevletter).append("<tr><td class='" + even + "'>" + $name + "</td><td class='" + even + "'>" + all_guests_table_n_seat[$name].table + "</td><td class='" + even + "'>" + all_guests_table_n_seat[$name].seat + "</td></tr>");
		    					} else {
		    						$maintable.find('#letterrow'+$row+'_col'+$j+' > #'+$prevletter).append("<tr><td class='" + even + "'>" + $name + "</td><td class='" + even + "'>" + all_guests_table_n_seat[$name].table + "</td><td class='" + even + "'>" + all_guests_table_n_seat[$name].seat + "</td></tr>");						    		
						    		if ($first) {
						    			$first = 0;
						    		} else {
						    			if (!!all_guests[i+1] && all_guests[i+1].charAt(0) != all_guests[i].charAt(0)) {
					    					$j++;						    									    				
						    			}
						    		}
		    					}
					    	}
					    	newdoc.find('#guests-report').append("<div class='ui-widget-content' style='padding-left: 1em'>" + $('<div>').append($maintable.clone()).html() + "</div>");
				    		
				    		//open the report
						    var w = window.open();
						    w.data = treeviewdata;
						    w.addEventListener('load', w.doSomething, true);
						    w.document.write('<html><head><title>Reporting</title>'+head+'<body>');
						    w.document.write(newdoc.html());
						    w.document.write('</body></html>');
						    w.document.close();
						    $(w).load(function(){						    	
						    	      w.doSomething(treeviewdata);
						    	    });
                		   $body.removeClass("loading"); 
						}
					}
				}
			],
			callback: function(){
				$('#guests_panel').hide();
				l  = svgCanvas.canvasName; //get the design title
				//colors				
				updateColors();
			},
			// This is triggered when the main mouse button is pressed down 
			// on the editor canvas (not the tool panels)
			mouseDown: function(opts) {
				// Check the mode on mousedown

				if(svgCanvas.getMode() == "guests") {
				    //alert( "user assigned to : " + opts.event.target.getAttribute("name"));
				    //status = "list";
					return {started: true};
				}
			},
			mouseMove: function(opts) {
				if ((svgCanvas.getMode() == "guests") && (status === "assign")) {
					var n = opts.event.target.getAttribute("name"),
						nodename = opts.event.target.nodeName;
					//console.log("Over: " + n);
					
					if (opts.event.target !== over && n !== "table" && nodename == "circle") {
						if (over !== null) {
							if (over.getAttribute("stroke") !== color_select) {
								over.setAttribute("stroke",color_overout); // return previous selection to black
								over = null;
							}
						}
						over = opts.event.target;
						if (over.getAttribute("stroke") !== color_select) {
								over.setAttribute("stroke",color_over);
						}
					}
					if (n === null && over !== null && over.getAttribute("stroke") !== color_select) {
						over.setAttribute("stroke",color_overout); 
						over = null;
					}
				}
			},
			// This is triggered from anywhere, but "started" must have been set
			// to true (see above). Note that "opts" is an object with event info
			mouseUp: function(opts) {
				//
			},
			onMainMenu: function(){
				if ($("#floating_box").hasClass('ui-dialog-content')) {
					$('#floating_box').dialog("close");
				}
				svgCanvas.clickSelect();
			},
			onDeleteLayer: function(layer) {
				// remove all assignment for the tables in the layer
				var alltables = $(layer).find('g:has(circle[name*="seat"])');
				var event_id = svgCanvas.getDocumentEvent();
				var venue_id = svgCanvas.getDocumentVenue();
				var title = svgCanvas.getDocumentTitle();
				if (event_id && venue_id && title) {
					var slist = new Array();
					var seats = alltables.find('circle[name*="seat"]');
					seats.each(function (){
						slist.push($(this).attr("name"));
					});
					if (slist.length > 0) {
						unassignInDatabase(slist,event_id,venue_id,title);										
					}
				}				
			},
			onDeleteElement: function(opts) {
				var event_id = svgCanvas.getDocumentEvent();
				var venue_id = svgCanvas.getDocumentVenue();
				var title = svgCanvas.getDocumentTitle();
				if (event_id && venue_id && title) {
					var elems = opts.selectedElements;
					var i = elems.length;
					var slist = new Array();
					while(i--){
						if (elems[i] != null){
							//unassign all seats if we remove a table
							// get the seats
							var seats = $('g[id="' + elems[i].id + '"] > circle[name*="seat"]');
							seats.each(function (){
								slist.push($(this).attr("name"));
							});
							//console.log(slist);
						}
					}
					if (slist.length > 0) {
						unassignInDatabase(slist,event_id,venue_id,title);										
					}
				}
			},
			toolButtonStateUpdate: function(opts) {
			},
			modeButtonStateUpdate: function() {
				if(svgCanvas.getMode() != "guests") {
					$('#guests_panel').hide();
					if ($("#floating_box").hasClass('ui-dialog-content')) {
						$('#floating_box').dialog("close");
					}
				}
				if(svgCanvas.getMode() == "guests") {
					svgCanvas.clearSelection();
				}
			}
		};
});

