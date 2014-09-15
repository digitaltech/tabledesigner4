<?php
include './config.php';
function doLog($log){
	if (!file_exists(LOG) and !is_dir(LOG)) {
		mkdir(LOG);
	}	
	$file = LOG.'/get_simpledata.log';
	// Write the contents back to the file
	//echo "do loging to $file";
	file_put_contents($file, "$log\n", FILE_APPEND | LOCK_EX);
}
if(	isset($_POST['data'])){
	$data = $_POST['data'];
	$name = $data['table']; // get the name
	$sfields = $data['selfields']; // get fields to select
	$sum = $data['sum'];
	$where = $data['where']; //
							// [
							//	"column" = "name"
							//	"condition" = "="
							//	"value"		= "pierre"
							// ]
	$sidx = $data['sidx']; // get fields order
	$sord = $data['sord']; // get fields order
} else {
	die("Error");
}
doLog("Parameters received : \n".
	"\ttable = ".$name."\n".
	"\tFields = ".$sfields."\n".
	"\tHost = ".DB_HOST."\n".
	"\tPort = ".DB_PORT."\n".
	"\tDBName = ".DB_NAME."\n".
	"\tUser = ".DB_USER."\n".
	"\tPwd = ".DB_PASSWORD);
	
$hfield = substr(strtolower($name),0,-1); //header for fields
// connect to pgsql
$connection = pg_Connect(DSN);
if ($connection) {
	$response->status = 1;
	$response->responseText = "Unable to process the data.";	
	pg_query($connection,"set names 'utf8'");
	$fields = explode(",",$sfields);
	$farray = array();
	foreach ($fields as $key => $val) {
		if (strpos($val,'_') === false) { // the table header is not set
			$farray[$val] = $hfield."_".$val;
			doLog("Reformated keys : $val => ".$hfield."_".$val);
		} else {
			$farray[$val] = $val;
			doLog("Reformated keys : $val => $val");
		}
	}
	doLog("Field Array : ".print_r($farray,true));
	if (!$sum) {
		$query = "select ".join($farray,',')." from ".DB_SCHEMA.".$name";
	} else {
		if (strpos($sum,'_') === false) { // header not set
			$query = "select count(".$hfield."_".$sum.") as count from ".DB_SCHEMA.".$name ";
		} else {
			$query = "select count(".$sum.") as count from ".DB_SCHEMA.".$name where";
		}
	}
	if ($where){
		$query .= " WHERE ";
		foreach ($where as $cond) {
			$query .= $farray[$cond['column']]." ";
			$query .= $cond['condition']." ";
			$query .= "'".pg_escape_string($cond['value'])."'";
			$query .= " AND ";
		}
		
		//$query = substr($query,0, -5);
		
		//$query .= " AND ";
		
		$query .= " deleted = 0";
		
		doLog("Query after where : ".$query);
	}
	if ($sidx && $sord){
		$query .= " order by ".$hfield."_".$sidx." $sord";
	}
	doLog("Executing :".$query);
	$result = pg_query($connection,$query);
	if ($result) {
		$response->status = 0;
		$response->responseText = "Query execution Successful.";
		doLog("Query successfully executed.");
		$response->d = array();
		while($row = pg_fetch_assoc($result)) {
			doLog("Row Array : ".print_r($row,true));
			$a = array();
			if ($sum){
				$a[] = $row["count"];
			} else {
				foreach ($farray as $key => $val) {
					//remove brackets for the current field if there where
					$tmp = preg_replace('/\(.*/', '', $val);
					doLog("Storing ". $tmp);
					$a[] = $row[$tmp];
				}
			}
			$response->d[] = $a;
		}
		doLog("Data parsed successfully.");
	} else {
		$response->status = 1;
		$response->responseText = "Cannot execute query, Error ".pg_last_error($connection);
		doLog("Failed to execute the query.");
	}
} else {
	$response->status = 1;
	$response->responseText = "Connection Failed, Error ".pg_last_error($connection);
	doLog("Connection Failed.");
}
doLog("Preparing the reponse");
header("Content-type: application/json;charset=utf-8");
doLog(json_encode($response));
echo json_encode($response);
?>