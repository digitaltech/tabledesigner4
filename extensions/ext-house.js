/*
 * ext-house.js
 *
 */

// Dependencies:
// 1) units.js
// 2) everything else

svgEditor.addExtension('house', function() {
	
	return {
		name: 'house',
		svgicons: 'extensions/house-icon.xml',
		buttons: [{
			id: 'house',
			type: "context",
			panel: 'editor_panel',
			title: 'Manage venues and events',
			events: {
				click: function() {
					//$('#house').toggleClass('push_button_pressed tool_button');
					var page1 = svgEditor.path() + "/grid_venues.php";
					var page2 = svgEditor.path() + "/grid_events.php";
					var $dialog = $('#dialog_box')
									.html('<table id="grid_venues"><tr><td/></tr></table><div id="pager_venues"></div><br/><table id="grid_events"><tr><td/></tr></table><div id="pager_events"></div>')
					               .dialog({
					                   autoOpen: false,
					                   modal: true,
					                   resizable: false,
					                   width:600,
					                   height:600,
					                   title: "Venues & Events",
					                   open: function(){
					                	   
					                   },
					                   buttons: {
											"Cancel": function(){
				   								$(this).dialog("close");
				   							}
					                   }
					               });
					$('#grid_venues').jqGrid({ 
		                url: page1, 
		                editurl: page1,
		                datatype: 'json', 
		                mtype: 'POST', 
		                colNames:['id','name'], 
		                colModel :[ 
		                    {name:'id', index:'id', width:1, hidden: true , editable:false, edittype:'text'}, 
		                    {name:'name', index:'name', width:100, editable:true, edittype:'text'}, 
		                ],
		                pager: '#pager_venues', 
		                altRows: true,
		                rownumbers: true,
		                rowNum:20, 
		                width: 560, 
		                rowList:[10,20,50], 
		                sortname: 'name', 
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
		                caption: 'All venues', 
		                onSelectRow: function(id){ 
		                }, 
		                gridComplete:function(){ 
		                    return true; 
		                } 
		            });
					$("#grid_venues").jqGrid("navGrid", "#pager_venues",
						    {add: true, edit: true, del: true, search: true, refresh: true, refreshstate: "current", alertzIndex: 1005},
						    {reloadAfterSubmit: true},
						    {reloadAfterSubmit: true},
						    {reloadAfterSubmit: true});
					$('#grid_events').jqGrid({ 
		                url: page2, 
		                editurl: page2,
		                datatype: 'json', 
		                mtype: 'POST', 
		                colNames:['id','name'], 
		                colModel :[ 
		                    {name:'id', index:'id', width:1, hidden: true , editable:false, edittype:'text'}, 
		                    {name:'name', index:'name', width:100, editable:true, edittype:'text'}, 
		                ], 
		                pager: '#pager_events', 
		                altRows: true,
		                rownumbers: true,
		                rowNum:20, 
		                width: 560, 
		                rowList:[10,20,50], 
		                sortname: 'name', 
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
		                caption: 'All events', 
		                onSelectRow: function(id){ 
		                },
		                gridComplete:function(){ 
		                    return true; 
		                } 
		            });
					$("#grid_events").jqGrid("navGrid", "#pager_events",
						    {add: true, edit: true, del: true, search: true, refresh: true, refreshstate: "current",alertzIndex: 1006},
						    {reloadAfterSubmit: true},
						    {reloadAfterSubmit: true},
						    {reloadAfterSubmit: true});

					$dialog.dialog('open');
				}
			}
		}]
	};
});
