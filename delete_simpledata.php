<?php
include './config.php';
function doLog($log){
	if (!file_exists(LOG) and !is_dir(LOG)) {
		mkdir(LOG);
	}
	$file = LOG.'/delete_simpledata.log';
	// Write the contents back to the file
	//echo "do loging to $file";
	file_put_contents($file, "$log\n", FILE_APPEND | LOCK_EX);
}
if(	isset($_POST['data'])){
	$data = $_POST['data'];
	$name = $data['table']; // get the name
	$sfields = $data['setfields']; // fields to set
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
foreach ($fields as $key => $val) {
	if (strpos($val,'_') === false) { // the table header is not set
		$farray[$val] = $hfield."_".$val;
		doLog("Reformatted keys : $val => ".$hfield."_".$val);
	} else {
		$farray[$val] = $val;
		doLog("Reformatted keys : $val => $val");
	}
	$setstring .= ",";
}
//$query = "DELETE FROM ".DB_SCHEMA.".$name";
$query = "Update ".DB_SCHEMA.".$name set deleted = 1";
doLog("Query : ".$query);
$query .= " WHERE ";
foreach ($where as $cond) {		
	$query .= $farray[$cond['column']]." ";
	$query .= $cond['condition']." ";
	if (is_numeric($cond['value'])) {
		doLog("Where value contains an integer.");
		$query .= pg_escape_string($cond['value']);
	} else {
		//check the value is a SQL query
		// a solution can be to use php-sql-parser but no time to implement that
		if (preg_match("/^\(select.*\)$/i",$cond['value'])){
			//this is a query
			doLog("Where value contains a select query.");
			$query .= $cond['value'];
		} else if (is_Array($cond['value']) && $cond['condition'] === "in") {
			doLog("Where value contains an array.");
			$val = "";
			$a = $cond['value'];
			for ($i=0; $i<sizeof($a); $i++){
				$val .= "'" . pg_escape_string($a[$i]) . "',";
			}
			$val = substr($val,0,-1);
			$query .= "(".$val.")";				
		} else {
			doLog("Where value contains a string.");
			$query .= "'".pg_escape_string($cond['value'])."'";				
		}
	}
	$query .= " AND ";
}
$query = substr($query,0, -5);
doLog("Query after where : ".$query);
$result = pg_query($connection, $query);
if ($result) {
	$response->status = 0;
	$response->responseText = "Successful.";
	doLog("Query successfully executed.");
} else {
	$response->status = 1;
	$response->responseText = "Cannot execute query, Error ".pg_last_error($connection);
	doLog("Failed to execute the query.");
}
doLog("Preparing the response");
header("Content-type: application/json;charset=utf-8");
doLog(json_encode($response));
echo json_encode($response);
?>