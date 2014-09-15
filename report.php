<?php
include './config.php';
function doLog($log){
	if (!file_exists(LOG) and !is_dir(LOG)) {
		mkdir(LOG);
	}	
	$file = LOG.'/report.log';
	// Write the contents back to the file
	//echo "do loging to $file";
	file_put_contents($file, "$log\n", FILE_APPEND | LOCK_EX);
}
$l = $_POST['l']; // get the requested page
$e = $_POST['e']; // get the requested page
$v = $_POST['v']; // get the requested page
doLog("Parameters received : \n".		
	"\te = ".$e."\n".
	"\tv = ".$v."\n".
	"\tl = ".$l."\n".
	"\tHost = ".DB_HOST."\n".
	"\tPort = ".DB_PORT."\n".
	"\tDBName = ".DB_NAME."\n".
	"\tUser = ".DB_USER."\n".
	"\tPwd = ".DB_PASSWORD
);
// connect to pgsql
$connection = pg_Connect(DSN) or die ("Could not connect to server\n");
pg_query($connection,"set names 'utf8'");	
$query = "select t.title_name, g.guest_firstname, g.guest_lastname, g.guest_display, s.seating_id, cast(substr(s.seating_id,5) as integer)
from ".DB_SCHEMA.".seatings s,  ".DB_SCHEMA.".guests g, ".DB_SCHEMA.".titles t
where s.guest_id = g.guest_id
and g.title_id = t.title_id
and s.event_id = " . $e . "
and s.layout_id = (select layout_id from ".DB_SCHEMA.".layouts where layout_name='" . $l . "' and venue_id=" . $v .") order by 6 asc";
doLog($query);
$result = pg_query($connection,$query);
if ($result) {
	while($row = pg_fetch_array($result)) {
		$response[] = $row;
	}
	header("Content-type: application/json;charset=utf-8");
	doLog(json_encode($response));
	echo json_encode($response);	
} else {
	doLog("Failed to execute the query : " . pg_last_error($connection));
	die("Cannot execute query: $query\n");	
}
?>