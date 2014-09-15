/*
 * ext-ems-dbopen.js
 *
 */

svgEditor.addExtension("server_ems_dbopen", function (){
	
	return	{
		
		callback: function() {
			var page1 = svgEditor.path() + "/grid_load.php";
			var selectedrow = -1;
			// Create load div (hidden)
			var target = $('<div id="load_box">').hide().appendTo('body').html('<table id="grid_load"><tr><td/></tr></table><div id="pager_load"></div>')
							.css('zIndex',9999)
							.dialog({
							autoOpen: false,
							modal: true,
							resizable: false,
							width:600,
							height:600,
							title: "Select a project",
							open: function(){
				        	   	//
				           },
				           buttons: {
								"Load": function(){
									if (selectedrow !== -1) {
										var theid = $('#grid_load').getCell(selectedrow,2);
										var theid2 = $('#grid_load').getCell(selectedrow,3);
										var theh = $('#grid_load').getCell(selectedrow,9);
										var thew = $('#grid_load').getCell(selectedrow,8);
										var thetitle = $('#grid_load').getCell(selectedrow,7);
										var theevent = $('#grid_load').getCell(selectedrow,4);
										$('#grid_load').jqGrid('GridUnload');
						            	$(this).dialog("close");
						            	// get relevant data
						            	// clear the selected row
						            	selectedrow = -1;
										//ajax call to get the layout selected
						            	//set title, event, venue
										var $data = {
												"oper": 'get',
												"id": theid,
												"id2": theid2
										};
										$.ajax({
											url: svgEditor.path() + "/grid_load.php",
											type: "POST",
											async: false,
											data: $data,
											success: function(response){
												if (response && response.status === 1) {
									    	    	$.alert('Error:' + response.responseText); 
									    	    } else {
							        				//load svg
									    	    	svgCanvas.setResolution(thew, theh);
									    	    	svgCanvas.setDocumentTitle(thetitle);				
													svgCanvas.setDocumentEvent(theevent);				
													svgCanvas.setDocumentVenue(theid2);
													cleanupXml = svgedit.utilities.decode64(response.d).replace(/\\"/g, '"');
													//var adom = tryParseXML(cleanupXml);
													var xmlstr = "";
													if (/^(?:[A-Za-z/0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(cleanupXml)) {
														xmlstr = svgedit.utilities.decode64(cleanupXml);
													} else {
														xmlstr = cleanupXml;
													}
													svgCanvas.clear();
													svgCanvas.setSvgString(xmlstr);
													svgEditor.updateCanvas();													
													svgCanvas.runExtensions('onDBOpen',xmlstr);
											    }
											},
											error: function (XMLHttpRequest, textStatus, errorThrown) {
												$.alert('Error:' + errorThrown);
											}
										}).always(function(output, status, xhr) {
									        //console.log(xhr);
									        //console.log(output);
									        //console.log(status);
								        });;	
									} else {
										$.alert('Please select a row if you want to load a layout.');
									}
								},
								"Cancel": function(){
									$('#grid_load').jqGrid('GridUnload');
					            	// clear the selected row
					            	selectedrow = -1;
									$(this).dialog("close");
								}
				           }
				       });
		
			svgEditor.setCustomHandlers({
				open: function(win, data) {
					var svg = "<?xml version=\"1.0\"?>\n" + data;				
					$('#grid_load').jqGrid({ 
			            url: page1, 
			            editurl: page1,
			            datatype: 'json', 
			            mtype: 'POST', 
			            colNames:['id','layout_id','event_id','venue_id','venue_name','event_name','layout_name','layout_width','layout_height'], 
			            colModel :[ 
			                       {name:'id', index:'id', width:1, hidden: true , editable:false, edittype:'text'}, 
			                       {name:'layout_id', index:'layout_id', width:1, hidden: true , editable:false, edittype:'text'}, 
			                       {name:'venue_id', index:'venue_id', width:1, hidden: true , editable:false, edittype:'text'}, 
			                       {name:'event_id', index:'event_id', width:1, hidden: true , editable:false, edittype:'text'}, 
			                       {name:'venue', index:'venue_name', width:100, editable:false, edittype:'text'}, 
			                       {name:'event', index:'event_name', width:100, editable:false, edittype:'text'}, 
			                       {name:'layout', index:'layout_name', width:100, editable:false, edittype:'text'}, 
			                       {name:'width', index:'layout_width', width:50, editable:false, edittype:'float'}, 
			                       {name:'height', index:'layout_height', width:50, editable:false, edittype:'float'}, 
			            ], 
			            pager: '#pager_load', 
			            altRows: true,
			            rownumbers: true,
			            rowNum:20, 
			            width: 560, 
			            height: 380, 
			            rowList:[10,20,50], 
			            rowNum:1000, 			                
						sortname: 'venue_name', 
			            //sortorder: 'asc', 
			            viewrecords: true, 
			            gridview: true, 
			            jsonReader : { 
			                page: 'page', 
			                total: 'total', 
			                records: 'records', 
			                root:'d', 
			                repeatitems: false, 
			                id: 'id' 
			            }, 
			            caption: 'All layouts', 
			            onSelectRow: function(id){		            	
			            	// remember the selected row
			            	selectedrow = id;
			            },
			            loadError : function(xhr,st,err) {
		                	alert(err);
		                },
			        });
					$("#grid_load").jqGrid("navGrid", "#pager_load",
						    	{add: false, edit: false, del: true, search: false, refresh: true, refreshstate: "current",alertzIndex: 1006},
						    	{ //add								
								},
							    { //edit
							    },
							    { //del
							    		reloadAfterSubmit: true, 
							    		zIndex: 9999,
								    	onclickSubmit: function (options, rowId) {										    		
								    		options.delData.layoutid = $('#grid_load').getCell(rowId, 'layout_id');
			                            	return {};
						                }
							    }
						    );	
					target.dialog('open');
				}
			});
			
			
		}	
	}; 

});

