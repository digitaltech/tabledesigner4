<?php
include './config.php';
function doLog($log){
	if (!file_exists(LOG) and !is_dir(LOG)) {
		mkdir(LOG);
	}	
	$file = LOG.'/guests_create.log';
	// Write the contents back to the file
	//echo "do loging to $file";
	file_put_contents($file, "$log\n", FILE_APPEND | LOCK_EX);
}
// connect to pgsql
$table = "guests";
$fields = Array("MEAL_ID",
			"AGE_ID",
			"TITLE_ID",
			"GENDER_ID",
			"REQUEST_ID",
			"RSVP_ID",
			"GUEST_FIRSTNAME",
			"GUEST_LASTNAME",
			"GUEST_IDENTIFIER",
			"GUEST_NOTE",
			"GUEST_DISPLAY",
			"GUEST_VIP");
if (!$_POST['data']) { die("error"); }
$data = $_POST['data'];
$guest_title 		= $data['guest_title']; // get the guest_title
$guest_firstname 	= $data['guest_firstname']; // get the guest_firstname
$guest_lastname 	= $data['guest_lastname']; // get the guest_lastname
$guest_identifier 	= $data['guest_identifier']; // get the guest_lastname
$guest_displayname 	= $data['guest_displayname']; // get the guest_displayname
$guest_gender 		= $data['guest_gender']; // get the guest_gender
$guest_age 			= $data['guest_age']; // get the guest_age
$guest_meal 		= $data['guest_meal']; // get the guest_meal
$guest_req 			= $data['guest_req']; // get the guest_req
$guest_note 		= $data['guest_note']; // get the guest_note
$guest_vip 			= $data['guest_vip']; // get the guest_vip
$guest_rsvp 		= $data['guest_rsvp']; // get the guest_rsvp
$values = Array(
			$guest_meal,		//0
			$guest_age,			//1
			$guest_title,		//2
			$guest_gender,		//3
			$guest_req,			//4
			$guest_rsvp,		//5
			$guest_firstname,	//6
			$guest_lastname,	//7
			$guest_identifier,	//8
			$guest_note,		//9
			$guest_displayname,	//10
			$guest_vip			//11
		);
doLog("Parameters received : \n".
	"\tguest_title = ".$guest_title."\n".
	"\tguest_firstname = ".$guest_firstname."\n".
	"\tguest_lastname = ".$guest_lastname."\n".
	"\tguest_identifier = ".$guest_identifier."\n".
	"\tguest_displayname = ".$guest_displayname."\n".
	"\tguest_gender = ".$guest_gender."\n".
	"\tguest_age = ".$guest_age."\n".
	"\tguest_meal = ".$guest_meal."\n".
	"\tguest_req = ".$guest_req."\n".
	"\tguest_note = ".$guest_note."\n".
	"\tguest_vip = ".$guest_vip."\n".
	"\tguest_rsvp = ".$guest_rsvp."\n".
	"\tHost = ".DB_HOST."\n".
	"\tPort = ".DB_PORT."\n".
	"\tDBName = ".DB_NAME."\n".
	"\tUser = ".DB_USER."\n".
	"\tPwd = ".DB_PASSWORD
);
$connection = pg_Connect(DSN) or die ("Could not connect to server\n");
pg_query($connection,"set names 'utf8'");
doLog("Get the layout id for the venue");

$sql = "INSERT INTO ".DB_SCHEMA.".$table (".join($fields,",").") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING guest_id";
doLog("Entering insert mode with query ".$sql);
pg_prepare($connection, "otd_insert", $sql);
doLog("Executing above query.");
$result = pg_execute($connection, "otd_insert", $values );// or die("Cannot execute query, Error ".pg_last_error($connection)."\n");
$error = pg_last_error($connection);
if (!$result) {
	doLog("Query failed, no guest id returned.". $error);				
	//die("no id returned");
	$response->gid = -1;
	$response->error = $error;
} else {
	doLog("Query successfully executed.");				
	$arr = pg_fetch_array($result, 0, PGSQL_NUM);
	$gid = $arr[0];
	doLog("Query returned id :".$gid);
	doLog("Preparing the reponse");
	$response->gid = $gid;
	$response->error = "";
}
header("Content-type: application/json;charset=utf-8");
doLog(json_encode($response));
echo json_encode($response);

?>