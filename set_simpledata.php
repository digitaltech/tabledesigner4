<?php
include './config.php';
function doLog($log){
	if (!file_exists(LOG) and !is_dir(LOG)) {
		mkdir(LOG);
	}	
	$file = LOG.'/set_simpledata.log';
	// Write the contents back to the file
	//echo "do loging to $file";
	file_put_contents($file, "$log\n", FILE_APPEND | LOCK_EX);
}
if(	isset($_POST['data'])){
	$data = $_POST['data'];
	$name = $data['table']; // get the name
	$sfields = $data['setfields']; // fields to set
	$svalues = $data['setvalues']; // values to set
	$where = $data['where']; //
							// [
							//	"column" = "name"
							//	"condition" = "="
							//	"value"		= "pierre"
							// ]
} else {
	die("Error");
}
doLog("Parameters received : \n".
	"\ttable = ".$name."\n".
	"\tFields = ".$sfields."\n".
	"\tValues = ".$svalues."\n".
	"\tHost = ".DB_HOST."\n".
	"\tPort = ".DB_PORT."\n".
	"\tDBName = ".DB_NAME."\n".
	"\tUser = ".DB_USER."\n".
	"\tPwd = ".DB_PASSWORD
);
$hfield = substr(strtolower($name),0,-1); //header for fields
// connect to pgsql
$connection = pg_Connect(DSN) or die ("Could not connect to server\n");
pg_query($connection,"set names 'utf8'");
$fields = explode(",",$sfields);
$farray = array();
$setstring = "";
foreach ($fields as $key => $val) {
	if (strpos($val,'_') === false) { // the table header is not set
		$setstring .= $hfield."_".$val;
		$farray[$val] = $setstring;
		doLog("Reformated keys : $val => ".$hfield."_".$val);
	} else {
		$setstring .= $val;
		$farray[$val] = $val;
		doLog("Reformated keys : $val => $val");
	}
	$setstring .= ",";
}
$setstring = substr($setstring,0,-1);
//create params
$values = array();
$i=1;
foreach ($svalues as $key => $val) {
	$values[$key] = '$'.$i;
	$i++;
}
$query = "UPDATE ".DB_SCHEMA.".$name SET (" .$setstring.") = (".join($values,',').") ";
doLog("Query : ".$query);
if ($where){
	$query .= " WHERE ";
	foreach ($where as $cond) {		
		$query .= $farray[$cond['column']]." ";
		$query .= $cond['condition']." ";
		$query .= "'".pg_escape_string($cond['value'])."'";		
		$query .= " AND ";
	}
	$query = substr($query,0, -5);
	doLog("Query after where : ".$query);
}
pg_prepare($connection, "otd_update", $query);
doLog("Executing :".$query);
$result = pg_execute($connection, "otd_update", $svalues );
if ($result) {
	$response->status = 0;
	$response->responseText = "Successful.";
	doLog("Query successfully executed.");
} else {
	$response->status = 1;
	$response->responseText = "Cannot execute query, Error ".pg_last_error($connection);
	doLog("Failed to execute the query.");
}
doLog("Preparing the reponse");
header("Content-type: application/json;charset=utf-8");
doLog(json_encode($response));
echo json_encode($response);
?>