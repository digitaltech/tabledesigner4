/*
 * ext-guestssettings.js
 *
 */

// Dependencies:
// 1) units.js
// 2) everything else

svgEditor.addExtension('guestssettings', function() {
	
	return {
		name: 'guestssettings',
		svgicons: 'extensions/guestssettings-icon.xml',
		buttons: [{
			id: 'guestssettings',
			type: "context",
			panel: 'editor_panel',
			title: 'Configure ages, genders, meals, rsvps, titles, groups',
			events: {
				click: function() {
					var x = $(window).width()-180;
					var page1 = svgEditor.path() + "/grid_guests.php";
					var page2 = svgEditor.path() + "/grid_guests_subgrid.php";							
					var $dialog = $('#dialog_box')
									.html('<table id="grid_selector"><tr><td/></tr></table><br/><table id="grid_details"><tr><td/></tr></table><div id="pager"></div>')
					               .dialog({
					                   autoOpen: false,
					                   modal: true,
					                   resizable: false,
					                   width:580,
					                   height:560,
					                   title: "Guests Settings",
					                   buttons: {													
											"Cancel": function(){
				   								$(this).dialog("close");
				   							}
					                   },
					                   open: function(){
					                	   $('.ui-widget-overlay').addClass('custom-overlay');
					                   }
					               });
		            $('#grid_selector').jqGrid({ 
		                url: page1, 
		                datatype: 'json', 
		                mtype: 'GET', 
		                colNames:['name'], 
		                colModel :[ 
		                    {name:'name', index:'name', width:'100%', editable:true}, 
		                ], 
		                rowNum:6, 
		                caption: "Select a category",
		                width: 540, 
		                height: 150,
		                scrollOffset: 0, 
		                sortname: 'name',
		                loadonce:true, 
		                jsonReader : { 
		                    page: 'page', 
		                    total: 'total', 
		                    records: 'records', 
		                    root:'d', 
		                    repeatitems: false, 
		                    id: 'id' 
		                },
		                onSelectRow: function(id){ 
		                	var data = $(this).jqGrid('getRowData', id);
		                	$('#grid_details').jqGrid('setCaption', data.name);
		                	if (data.name === "groups") {
			                	$('#grid_details').jqGrid().setGridParam(
			                    		{
			                    			url : page2 + "?table=" + data.name,
			                    			editurl : page2 + "?table=" + data.name,				                    			
			                    			datatype: 'json',
				                    		shrinkToFit: false
			                    		}
			                    		).showCol("note").trigger("reloadGrid");
		                	} else {
			                	$('#grid_details').jqGrid().setGridParam(
			                    		{
			                    			url : page2 + "?table=" + data.name,
			                    			editurl : page2 + "?table=" + data.name,				                    			
			                    			datatype: 'json',
			                    			shrinkToFit: false
			                    		}
			                    		).hideCol("note").trigger("reloadGrid");				                		
		                	}
		                }, 
		                gridComplete:function(){ 
		                    return true; 
		                }
		            }); 
					$('#grid_selector').parents("div.ui-jqgrid-view").children("div.ui-jqgrid-hdiv").hide();
					$('#grid_details').jqGrid({ 
		                url: page2, 
		                editurl: page2,
		                datatype: 'json', 
		                mtype: 'GET', 
		                colNames:['id','name', 'note'], 
		                colModel :[ 
		                    {name:'id', index:'id', width:55, hidden: true , editable:false, edittype:'text'}, 
		                    {name:'name', index:'name', width:90, editable:true, edittype:'text'}, 
		                    {name:'note', index:'note', hidden: true, editable:true, edittype:'text'}, 
		                ], 
		                pager: '#pager',
		                altRows: true,
		                rownumbers: true,
		                rowNum:10, 
		                width: 540,
		                height: 150,
		                shrinkToFit: false,
		                rowList:[10,20,30], 
		                //sortname: 'id', 
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
		                caption: 'Select a category', 
		                onSelectRow: function(id){ 
		                }, 
		                gridComplete:function(){ 
		                    return true; 
		                }
		            });
					$("#grid_details").jqGrid("navGrid", "#pager",
						    {add: true, edit: true, del: true, search: false, refresh: true, refreshstate: "current", alertzIndex: 1005},
						    {	//edit
						    	reloadAfterSubmit: true,
						    	recreateForm:true,
						    	beforeInitData: function(formid) {
						    		var id = $('#grid_selector').jqGrid('getGridParam', 'selrow');
						    		var data = $("#grid_selector").jqGrid('getCell', id, 'name');								    		
						    		if (data === "groups") {
						                $("#grid_details").jqGrid('setColProp','note',{editable:true});							    			
						    		} else {
						                $("#grid_details").jqGrid('setColProp','note',{editable:false});								    			
						    		}
					            },
						    	afterSubmit: function (response) {	
						    		var res = $.parseJSON(response.responseText);
						    	    if (res && res.status === 1) {
						    	        return [false, res.responseText];
						    	    } else {
						    	    	return [true, ""];
						    	    }
						    	}
						    }, 
						    {	//add
						    	reloadAfterSubmit: true,								    	
						    	afterSubmit: function (response) {	
						    		var res = $.parseJSON(response.responseText);
						    	    if (res && res.status === 1) {
						    	        return [false, res.responseText];
						    	    } else {
						    	    	return [true, ""];
						    	    }
						    	}   
						    },
						    {reloadAfterSubmit: true, 
						    	afterSubmit: function (response) {	
						    		var res = $.parseJSON(response.responseText);
						    	    if (res && res.status === 1) {
						    	        return [false, res.responseText];
						    	    } else {
						    	    	return [true, ""];
						    	    }
						    	}
						    });		
					$dialog.dialog('open');		
				}
			}
		}]
	};
});
