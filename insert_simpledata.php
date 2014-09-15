<?php
include './config.php';
function doLog($log){
	if (!file_exists(LOG) and !is_dir(LOG)) {
		mkdir(LOG);
	}	
	$file = LOG.'/insert_simpledata.log';
	// Write the contents back to the file
	//echo "do loging to $file";
	file_put_contents($file, "$log\n", FILE_APPEND | LOCK_EX);
}
if(	isset($_POST['data'])){
	$data = $_POST['data'];
	$name = $data['table']; // get the name
	$sfields = $data['setfields']; // fields to set
	$svalues = $data['setvalues']; // values to set
	$returning = $data['return'];
} else {
	die("Error");
}
doLog("Parameters received : \n".
	"\ttable = ".$name."\n".
	"\tReturning = ".$returning."\n".
	"\tFields = ".$sfields."\n".
	"\tValues = ".join(',',$svalues)."\n".
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
foreach ($fields as $key => $val) {
	if (strpos($val,'_') === false) { // the table header is already set
		$fields[$key] = $hfield."_".$val;
	} else {
		$fields[$key] = $val;
		doLog("Reformated keys : $key => $val");
	}
}
//create params
$values = array();
$i=1;
foreach ($svalues as $key => $val) {
	$values[$key] = '$'.$i;
	$i++;
}
if ($returning) {
	$query = "INSERT INTO ".DB_SCHEMA.".$name (" .join($fields,',').") VALUES (".join($values,',').") RETURNING ".$returning;
} else {
	$query = "INSERT INTO ".DB_SCHEMA.".$name (" .join($fields,',').") VALUES (".join($values,',').") ";
}
doLog("Executing :".$query);

pg_prepare($connection, "otd_insert", $query);
$result = pg_execute($connection, "otd_insert", $svalues );
if ($result) {
	$response->status = 0;
	$response->responseText = "Successful.";
	$response->d = array();
	if ($returning) {
		while($row = pg_fetch_assoc($result)) {
			$a = array();
			//foreach ($farray as $key => $val) {
			//	$a[] = $row[$val];
				$a[] = $row[$returning];
			//}
			$response->d[] = $a;
		}
	}
	doLog("Query successfully executed.");
} else {
	$response->status = 1;
	$response->responseText = "Cannot execute query, ".pg_last_error($connection);
	doLog("Failed to execute the query.");
}
doLog("Preparing the reponse");
header("Content-type: application/json;charset=utf-8");
doLog(json_encode($response));
echo json_encode($response);
?>