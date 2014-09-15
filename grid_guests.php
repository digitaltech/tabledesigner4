<?php
include './config.php';
function doLog($log){
	if (!file_exists(LOG) and !is_dir(LOG)) {
		mkdir(LOG);
	}	
	$file = LOG.'/grid_guests.log';
	// Write the contents back to the file
	//echo "do loging to $file";
	file_put_contents($file, "$log\n", FILE_APPEND | LOCK_EX);
}
// connect to pgsql
$page = $_GET['page']; // get the requested page
$limit = $_GET['rows']; // get how many rows we want to have into the grid
$sidx = $_GET['sidx']; // get index row - i.e. user click to sort
$sord = $_GET['sord']; // get the direction
doLog("Parameters received : \n".
	"\tPage = ".$page."\n".
	"\tLimit = ".$limit."\n".
	"\tSort idx = ".$sidx."\n".
	"\tSortDirection = ".$sord."\n".
	"\tHost = ".DB_HOST."\n".
	"\tPort = ".DB_PORT."\n".
	"\tDBName = ".DB_NAME."\n".
	"\tUser = ".DB_USER."\n".
	"\tPwd = ".DB_PASSWORD
);
if (!$sidx) $sidx =1; // connect to the database

doLog("Preparing the reponse");
header("Content-type: application/json;charset=utf-8");
$response->page = 1;
$response->total = 1;
$response->records = 6;

$response->d[0]=array("name"=>"ages");
$response->d[1]=array("name"=>"meals");
$response->d[2]=array("name"=>"requests");
$response->d[3]=array("name"=>"genders");
$response->d[4]=array("name"=>"rsvps");
$response->d[5]=array("name"=>"titles");
$response->d[5]=array("name"=>"groups");

doLog(json_encode($response));
echo json_encode($response);
?>
