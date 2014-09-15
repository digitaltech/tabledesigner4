<?php
include './config.php';
function doLog($log){
	if (!file_exists(LOG) and !is_dir(LOG)) {
		mkdir(LOG);
	}	
	$file = LOG.'/grid_venues.log';
	// Write the contents back to the file
	//echo "do loging to $file";
	file_put_contents($file, "$log\n", FILE_APPEND | LOCK_EX);
}
$table = "venues";
$hfield = substr(strtolower($table),0,-1);
$page = $_POST['page']; // get the requested page
$limit = $_POST['rows']; // get how many rows we want to have into the grid
$sidx = $_POST['sidx']; // get index row - i.e. user click to sort
$sord = $_POST['sord']; // get the direction
$oper = $_POST['oper']; // get the operation
$id = $_POST['id']; // get the operation
$name = $_POST['name']; // get the name
doLog("Parameters received : \n".
	"\tPage = ".$page."\n".
	"\tLimit = ".$limit."\n".
	"\tSort idx = ".$sidx."\n".
	"\tSortDirection = ".$sord."\n".
	"\tOper = ".$oper."\n".
	"\tId = ".$id."\n".
	"\tName = ".$name."\n".
	"\tHost = ".DB_HOST."\n".
	"\tPort = ".DB_PORT."\n".
	"\tDBName = ".DB_NAME."\n".
	"\tUser = ".DB_USER."\n".
	"\tPwd = ".DB_PASSWORD
);
if (!$sidx) $sidx =1;
// connect to pgsql
$connection = pg_Connect(DSN) or die ("Could not connect to server\n");
pg_query($connection,"set names 'utf8'");	
switch ($oper) {
	case "add":
		doLog("Entering Add mode with query INSERT INTO ".DB_SCHEMA.".$table (".$hfield."_name) VALUES ($1)");			
		pg_prepare($connection, "otd_insert", "INSERT INTO ".DB_SCHEMA.".$table (".$hfield."_name) VALUES ($1)");
		doLog("Executing above query.");				
		pg_execute($connection, "otd_insert", array($name) ) or die("Cannot execute query, Error ".pg_last_error($connection)."\n");
		doLog("Query successfully executed.");				
		break;
	case "del":
		//doLog("Entering Del mode with query DELETE FROM ".DB_SCHEMA.".$table WHERE ".$hfield."_id = $1");			
		//pg_prepare($connection, "otd_delete", "DELETE FROM ".DB_SCHEMA.".$table WHERE ".$hfield."_id = $1");
		doLog("Entering Del mode with query UPDATE ".DB_SCHEMA.".$table set deleted = 1 WHERE ".$hfield."_id = $1");			
		pg_prepare($connection, "otd_delete", "UPDATE ".DB_SCHEMA.".$table SET DELETED = 1 WHERE ".$hfield."_id = $1");
		doLog("Executing above query.");
		pg_execute($connection, "otd_delete", array($id) ) or die("Cannot execute query, Error ".pg_last_error($connection)."\n");
		doLog("Query successfully executed.");				
		break;
	case "edit":
		doLog("Entering Edit mode with query UPDATE ".DB_SCHEMA.".$table SET ".$hfield."_name = $1 WHERE ".$hfield."_id = $2");			
		pg_prepare($connection, "otd_update", "UPDATE ".DB_SCHEMA.".$table SET ".$hfield."_name = $1 WHERE ".$hfield."_id = $2");
		doLog("Executing above query.");
		pg_execute($connection, "otd_update", array($name, $id) ) or die("Cannot execute query, Error ".pg_last_error($connection)."\n");
		doLog("Query successfully executed.");				
		break;
	default:
		//$query = "SELECT COUNT(*) AS count FROM ".DB_SCHEMA.".$table";
		$query = "SELECT COUNT(*) AS count FROM ".DB_SCHEMA.".$table where deleted = 0";
		doLog("Executing :".$query);
		$result = pg_query($connection,$query) or die("Cannot execute query: $query, Error".pg_last_error($connection)."\n");
		doLog("Query ".$query." successful.");
		$row = pg_fetch_array($result);
		$count = $row['count'];
		if( $count > 0 && $limit > 0) {
			$total_pages = ceil($count/$limit);
		}
		else {
			$total_pages = 0;
		}
		if ($page > $total_pages) $page=$total_pages;
		$start = $limit*$page - $limit; // do not put $limit*($page - 1)
		if ($start<0) $start = 0;
		//$query = "select * from ".DB_SCHEMA.".$table order by ".$hfield."_$sidx $sord  LIMIT $limit OFFSET $start";
		$query = "select * from ".DB_SCHEMA.".$table where deleted = 0 order by ".$hfield."_$sidx $sord  LIMIT $limit OFFSET $start";
		doLog("Executing :".$query);
		$result = pg_query($connection,$query) or die("Cannot execute query: $query\n");
		$response->page = $page;
		$response->total = $total_pages;
		$response->records = $count;
		$i=0;
		while($row = pg_fetch_assoc($result)) {
			$response->d[$i]=array('id'=>$row[$hfield.'_id'],"name"=>$row[$hfield.'_name']);
			doLog("id=>".$row[$hfield.'_id']." name=>".$row[$hfield.'_name']);
			$i++;
		}			
}
doLog("Preparing the reponse");
header("Content-type: application/json;charset=utf-8");
doLog(json_encode($response));
echo json_encode($response);
?>