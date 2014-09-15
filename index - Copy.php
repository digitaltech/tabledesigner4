<?php
include './config.php';
ini_set("log_errors", 1);
ini_set("error_log", LOG."/php-error.log");
parse_str(file_get_contents('php://input'), $_POST);
function doLog($log){
	if (!file_exists(LOG) and !is_dir(LOG)) {
		mkdir(LOG);
	}	
	$file = LOG.'/index_php.log';
	// Write the contents back to the file
	file_put_contents($file, "$log\n", FILE_APPEND | LOCK_EX);
}
doLog("Start process");
//$page = $_POST['page']; // get the requested page
//$limit = $_POST['rows']; // get how many rows we want to have into the grid
//$oper = $_POST['oper']; // get the operation
//$sidx = $_POST['sidx']; // get index row - i.e. user click to sort
//$sord = $_POST['sord']; // get the direction
//$id = $_POST['id']; // get the id
//$id2 = $_POST['id2']; // get the id2
//$layoutid = $_POST['layoutid']; // get the id
$layoutid = $_GET['layoutid']; // get the id
//$name = $_POST['name']; // get the name
doLog("Parameters received : \n".
	"\tlayoutid = ".$layoutid."\n".
	//"\tLimit = ".$limit."\n".
	//"\tope = ".$oper."\n".
	//"\tSort idx = ".$sidx."\n".
	//"\tSortDirection = ".$sord."\n".
	//"\tId = ".$id."\n".
	//"\tId2 = ".$id2."\n".
	//"\tName = ".$name."\n".
	"\tHost = ".DB_HOST."\n".
	"\tPort = ".DB_PORT."\n".
	"\tDBName = ".DB_NAME."\n".
	"\tUser = ".DB_USER."\n".
	"\tPwd = ".DB_PASSWORD);
if (!$sidx) $sidx =1;
// connect to pgsql

$pagecontents = file_get_contents("index.html");

if (isset($layoutid))
{

	doLog("Connecting...");

	$connection = pg_connect(DSN) or die ("Could not connect to server\n");
	pg_query($connection,"set names 'utf8'");	
	
	$query = 	"select
	distinct
		case when e.event_id > 0 
					then
						cast(l.layout_id as text) || 
						cast(v.venue_id as text) || 
						cast(e.event_id as text) || 
						cast(l.layout_name as text) 
					else 
						cast(l.layout_id as text) || 
						cast(v.venue_id as text) || 
						'NA' || 
						cast(l.layout_name as text) 
					end 
					as id, 
					l.layout_id, v.venue_id, e.event_id, l.layout_name, v.venue_name, e.event_name, l.layout_width, l.layout_height
	from
	".DB_SCHEMA.".layouts l
	left join ".DB_SCHEMA.".seatings s on s.layout_id = l.layout_id
	left join ".DB_SCHEMA.".events e on  e.event_id = s.event_id
	join ".DB_SCHEMA.".venues v on l.venue_id = v.venue_id
	where l.deleted = 0 and l.layout_id = $layoutid";
	doLog("Executing :".$query);
	$result = pg_query($connection,$query) or doLog("Cannot execute query: $query\n");
	
	$res_id = "";
	$res_layout_id = $layoutid;
	$res_venue_id = "";
	$res_event_id = 0;
	$res_layout = "";
	$res_venue = "";
	$res_event = "";
	$res_width = 0;
	$res_height = 0;
	
	$i=0;
	while($row = pg_fetch_array($result)) {
			$res_id = $row[0];
			$res_venue_id = $row[2];
			$res_event_id = $row[3];
			$res_layout = $row[4];
			$res_venue = $row[5];
			$res_event = ($row[6] === null ? "NA" : $row[6]);
			$res_width = $row[7];
			$res_height = $row[8];

		$i++;
	}
	doLog("Layout is $res_id");
	
	if 	($res_id != "")
	{	
		//$pagecontents = str_replace("<script src=\"extensions/ext-dbopen.js\"></script>", " <script src=\"extensions/ext-dbopen.js\"></script>
		//			<script src=\"extensions/ext-ems-dbopen.js\"></script>", $pagecontents);
				
				
		//$pagecontents = str_replace("<!--phpcode-->", " <script>$( document ).ready(function() {console.log( \"document loaded\" );});$( window ).load(function() {console.log( \"window loaded\" );});</script>", $pagecontents);
		
		$pagecontents = str_replace("<!--phpcode-->", '
		
		<script>$( document ).ready(function() {
		
		svgEditor.addExtension("server_ems_dbopen", function (){
		
			var theid = \''.$res_layout_id.'\';
			var theid2 = \''.$res_venue_id.'\';
			var theh = \''.$res_height.'\';
			var thew = \''.$res_width.'\';
			var thetitle = \''.$res_layout.'\';
			var theevent = \''.$res_event_id.'\';
			//$(\'#grid_load\').jqGrid(\'GridUnload\');
			
			var $data = {
					"oper": \'get\',
					"id": theid,
					"id2": theid2
			};
			$.ajax({
				url: "grid_load.php",
				type: "POST",
				async: false,
				data: $data,
				success: function(response){
					if (response && response.status === 1) {
						$.alert(\'Error:\' + response.responseText); 
					} else {
						//load svg		
						//svgCanvas.setResolution(thew, theh);
						//svgCanvas.setDocumentTitle(thetitle);				
						//svgCanvas.setDocumentEvent(theevent);				
						//svgCanvas.setDocumentVenue(theid2);
						//cleanupXml = svgedit.utilities.decode64(response.d).replace(/\\"/g, \'"\');
						//var xmlstr = "";
						//if (/^(?:[A-Za-z/0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(cleanupXml)) {
						//	xmlstr = svgedit.utilities.decode64(cleanupXml);
						//} else {
						//	xmlstr = cleanupXml;
						//}
						//svgCanvas.clear();
						//console.log(xmlstr);
						//svgCanvas.setSvgString(xmlstr);
						//svgEditor.updateCanvas();													
						//svgCanvas.runExtensions(\'onDBOpen\',xmlstr);
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					$.alert(\'Error:\' + errorThrown);
				}
			}).always(function(output, status, xhr) {
				//console.log(xhr);
				//console.log(output);
				//console.log(status);
			});;
		}
		);
		});
		</script>', $pagecontents);
	}
}	
   echo $pagecontents;

?>
