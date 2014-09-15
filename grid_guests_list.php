<?php
include './config.php';
function doLog($log){
	if (!file_exists(LOG) and !is_dir(LOG)) {
		mkdir(LOG);
	}	
	$file = LOG.'/grid_guests_list.log';
	// Write the contents back to the file
	//echo "do loging to $file";
	file_put_contents($file, "$log\n", FILE_APPEND | LOCK_EX);
}
// connect to pgsql
$page = $_POST['page']; // get the requested page
$limit = $_POST['rows']; // get how many rows we want to have into the grid
$sidx = $_POST['sidx']; // get index row - i.e. user click to sort
$sord = $_POST['sord']; // get the direction
$oper = $_POST['oper']; // get the operation
$id = $_POST['id']; // get the operation
$event = $_POST['event']; // get the name
$venue = $_POST['venue']; // get the name
$layoutid = $_POST['layoutid']; // get the layid
$layout = $_POST['layout']; // get the name
$firstname = $_POST['firstname']; // get the name
$lastname = $_POST['lastname']; // get the name
$title = $_POST['title']; // get the title
$group = $_POST['group']; // get the group
$display = $_POST['display']; // get the display name
$meal = $_POST['meal']; // get the meal
$age = $_POST['age']; // get the meal
$request = $_POST['request']; // get the req
$gender = $_POST['gender']; // get the gender
$vip = $_POST['VIP']; // get the vip
$rsvp = $_POST['RSVP']; // get the rsvp
$search = $_POST['_search']; // get the search param
$searchOper = $_POST['searchOper'];
$searchField = $_POST['searchField'];
$searchString = $_POST['searchString'];

doLog("Parameters received : \n".
	"\tPage = ".$page."\n".
	"\tLimit = ".$limit."\n".
	"\tSort idx = ".$sidx."\n".
	"\tSortDirection = ".$sord."\n".
	"\tOper = ".$oper."\n".
	"\tId = ".$id."\n".
	"\tFirstName = ".$firstname."\n".
	"\tLastName = ".$lastname."\n".
	"\tTitle = ".$title."\n".
	"\tGroup = ".$group."\n".
	"\tEvent = ".$event."\n".
	"\tVenue = ".$venue."\n".
	"\tLayout = ".$layout."\n".
	"\tHost = ".DB_HOST."\n".
	"\tPort = ".DB_PORT."\n".
	"\tDBName = ".DB_NAME."\n".
	"\tUser = ".DB_USER."\n".
	"\tPwd = ".DB_PASSWORD
);
if (!$sidx) $sidx =1;
$table_guests = "guests";
$table_groups = "groups";
$table_titles = "titles";
$table_ages = "ages";
$table_meals = "meals";
$table_requests = "requests";
$table_genders = "genders";
$table_guestsingroup = "guestsingroup";
$table_seatings = "seatings";
$table_layouts = "layouts";
$table_venues = "venues";
$table_events = "events";

$table_rsvps = "rsvps";
$hfield_guests = substr(strtolower($table_guests),0,-1);
$hfield_titles = substr(strtolower($table_titles),0,-1);
$hfield_groups = substr(strtolower($table_groups),0,-1);
$hfield_ages = substr(strtolower($table_ages),0,-1);
$hfield_requests = substr(strtolower($table_requests),0,-1);
$hfield_meals = substr(strtolower($table_meals),0,-1);
$hfield_genders = substr(strtolower($table_genders),0,-1);
$hfield_rsvps = substr(strtolower($table_rsvps),0,-1);
$hfield_seatings = substr(strtolower($table_seatings),0,-1);
$hfield_layouts = substr(strtolower($table_layouts),0,-1);
$hfield_venues = substr(strtolower($table_venues),0,-1);
$hfield_events = substr(strtolower($table_events),0,-1);

$op['eq']['ope'] = "=";
$op['eq']['before'] = "";
$op['eq']['after'] = "";
$op['ne']['ope'] = "<>";
$op['ne']['before'] = "";
$op['ne']['after'] = "";
$op['bw']['ope'] = "~";
$op['bw']['before'] = "^";
$op['bw']['after'] = "";
$op['bn']['ope'] = "!~";
$op['bn']['before'] = "^";
$op['bn']['after'] = "";
$op['ew']['ope'] = "~";
$op['ew']['before'] = "";
$op['ew']['after'] = "$";
$op['en']['ope'] = "!~";
$op['en']['before'] = "";
$op['en']['after'] = "$";
$op['cn']['ope'] = "~";
$op['cn']['before'] = ".*";
$op['cn']['after'] = ".*";
$op['nc']['ope'] = "!~";
$op['nc']['before'] = ".*";
$op['nc']['after'] = ".*";

$connection = pg_Connect(DSN) or die ("Could not connect to server\n");
pg_query($connection,"set names 'utf8'");
$custom_error = "";
$custom_status = 200;
switch ($oper) {
	case "del":
		//check the users are not assigned to another layout first.
		//$sql = "select * from ".DB_SCHEMA.".seatings s,".DB_SCHEMA.".layouts l where l.layout_id = s.layout_id and 
		//		l.layout_id <> $layoutid and guest_id in (".$id.")";
		
		$sql = "select * from ".DB_SCHEMA.".seatings s,".DB_SCHEMA.".layouts l where l.deleted = 0 and s.deleted = 0 and l.layout_id = s.layout_id and 
				l.layout_id <> $layoutid and guest_id in (".$id.")";
		
		doLog("Checking if there are seats assigned: $sql.");		
		$result = pg_query($sql);
		if ($result) {
			$i=0;
			$output = array();
			while($row = pg_fetch_assoc($result)) {
				$output[] = $row['layout_name'];
				$i++;
			}
			if ($i == 0) {
				//$sql = "DELETE FROM ".DB_SCHEMA.".$table_seatings WHERE ".
				//		$hfield_guests."_id IN (".$id.") and ".
				//		$hfield_events."_id = ".$event." and ".
				//		$hfield_layouts."_id = ".$layoutid;
				$sql = "UPDATE ".DB_SCHEMA.".$table_seatings SET DELETED = 1 WHERE ".
						$hfield_guests."_id IN (".$id.") and ".
						$hfield_events."_id = ".$event." and ".
						$hfield_layouts."_id = ".$layoutid;
				doLog("Unassign seats with SQL : $sql.");
				pg_query($sql);
				if ($group) {
					doLog("Unassign seats for this layout.");
					doLog("Unassign guest from groups ". $group .".");
					$arr_group = explode(",",$group);
					$group_string = "";
					for($i=0;$i<sizeof($arr_group);$i++) {
						doLog("Add group ".$arr_group[$i]." in search string.");
						$group_string .= "'".$arr_group[$i]."',";
					}
					$group_string = substr($group_string,0,-1);
					##$sql = "DELETE FROM ".DB_SCHEMA.".$table_guestsingroup WHERE ".
					##		$hfield_guests."_id = $1 and ".
					##		$hfield_groups."_id = ANY ( select group_id from ".DB_SCHEMA.".groups where group_name in ($group_string) )";
					$sql = "UPDATE ".DB_SCHEMA.".$table_guestsingroup SET DELETED = 1 WHERE ".
							$hfield_guests."_id = $1 and ".
							$hfield_groups."_id = ANY ( select group_id from ".DB_SCHEMA.".groups where group_name in ($group_string) and groups.deleted = 0)";
					doLog("Entering Del mode with query ".$sql);
					pg_prepare($connection, "otd_guestsingroup_delete", $sql);
					doLog("Executing above query.");
					$arr_id = explode(",",$id);
					for($i=0;$i<sizeof($arr_group);$i++) {
						$result = pg_execute($connection, "otd_guestsingroup_delete", array($arr_id[$i]) );
						if (!$result) {
							$response->status = 1;
							$response->responseText = "Cannot execute query, Error ".pg_last_error($connection);
							doLog("Failed to execute the query.");
							break;
						}
					}
				}
				##$sql = "DELETE FROM ".DB_SCHEMA.".$table_guests WHERE ".$hfield_guests."_id = $1";
				$sql = "UPDATE ".DB_SCHEMA.".$table_guests SET DELETED = 1 WHERE ".$hfield_guests."_id = $1";
				doLog("Entering Del mode with query ".$sql);
				pg_prepare($connection, "otd_delete", $sql);
				doLog("Executing above query.");
				$arr_id = explode(",",$id);
				for($i=0;$i<sizeof($arr_id);$i++) {
					$result = pg_execute($connection, "otd_delete", array($arr_id[$i]) );
				}
				if ($result) {
					$response->status = 0;
					$response->responseText = "Successful.";
					doLog("Query successfully executed.");
				} else {
					$response->status = 1;
					$response->responseText = "Cannot execute query, Error ".pg_last_error($connection);
					doLog("Failed to execute the query.");
				}				
			} else {
				$custom_status = 500;
				$custom_error = "1 or more guest(s) are still assigned to the layout(s)<br>".implode(',',array_unique($output)).". Please clear their seats first.";				
			}
		} else {
			$custom_status = 500;
			$custom_error = "Cannot execute the query. ".pg_last_error($connection);				
			$response->status = 1;
			$response->responseText = "Cannot execute query, Error ".pg_last_error($connection);
			doLog("Failed to execute the query.");				
		}
		break;
	case "edit":
		$sql = "UPDATE ".DB_SCHEMA.".$table_guests SET (".
											$hfield_titles."_id,".
											$hfield_ages."_id,".
											$hfield_genders."_id,".
											$hfield_meals."_id,".
											$hfield_requests."_id,".
											$hfield_rsvps."_id,".
											$hfield_guests."_vip,".
											$hfield_guests."_firstname,". 
											$hfield_guests."_lastname,".
											$hfield_guests."_display".
											") = ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)".
											" WHERE ".$hfield_guests."_id = $11";
											
		doLog("Entering Edit mode with query ".$sql);
		pg_prepare($connection, "otd_edit", $sql);
		doLog("Executing above query.");
		$result = pg_execute($connection, "otd_edit", array($title,$age,$gender,$meal,$request,$rsvp,$vip,$firstname,$lastname,$display,$id) ) or die("Cannot execute query, Error ".pg_last_error($connection)."\n");
		if ($result) {
			if ($group && $group > 0) {
				//check if user already assigned to a group
				//$sql = "SELECT count(*) AS count FROM ".DB_SCHEMA.".$table_guestsingroup WHERE ".$hfield_guests."_id = $1";
				$sql = "SELECT count(*) AS count FROM ".DB_SCHEMA.".$table_guestsingroup WHERE ".$hfield_guests."_id = $1 and deleted = 0";
				doLog("Entering Edit mode with query ".$sql);
				pg_prepare($connection, "otd_select", $sql);
				doLog("Executing above query.");
				$result = pg_execute($connection, "otd_select", array($id) ) or die("Cannot execute query, Error ".pg_last_error($connection)."\n");
				if ($result) {
					$row = pg_fetch_array($result);
					$count = $row['count'];
					if ($count > 0) {
						//if yes, update the record
						$query = "UPDATE ".DB_SCHEMA.".$table_guestsingroup SET (".$hfield_groups."_id) = ($1) WHERE ".$hfield_guests."_id = $2";
						doLog("Entering Edit mode with query ".$query);
						pg_prepare($connection, "otd_update", $query);
						doLog("Executing above query.");
						$result = pg_execute($connection, "otd_update", array($group,$id) ) or die("Cannot execute query, Error ".pg_last_error($connection)."\n");
					} else {
						//if not, insert a new record
						$query = "INSERT INTO ".DB_SCHEMA.".$table_guestsingroup (".$hfield_groups."_id, ".$hfield_guests."_id) VALUES ($1,$2) ";
						doLog("Entering Edit mode with query ".$query);
						pg_prepare($connection, "otd_insert", $query);
						doLog("Executing above query.");
						$result = pg_execute($connection, "otd_insert", array($group,$id) ) or die("Cannot execute query, Error ".pg_last_error($connection)."\n");						
					}				
					if ($result) {
						$response->status = 0;
						$response->responseText = "Successful.";
						doLog("Query successfully executed.");
					} else {
						$response->status = 1;
						$response->responseText = "Cannot execute query, Error ".pg_last_error($connection);
						doLog("Failed to execute the query.");
					}						
				} else {
					$response->status = 1;
					$response->responseText = "Cannot execute query, Error ".pg_last_error($connection);
					doLog("Failed to execute the query.");						
				}											
			} else {
				$response->status = 0;
				$response->responseText = "Successful.";
				doLog("Query successfully executed.");				
			}
		} else {
			$response->status = 1;
			$response->responseText = "Cannot execute query, Error ".pg_last_error($connection);
			doLog("Failed to execute the query.");
		}
		break;
	default:	
		//$query = "select COUNT(*) AS count
		//			from ".DB_SCHEMA.".".$table_guests." gu 
		//				left outer join ".DB_SCHEMA.".".$table_guestsingroup." gig on gu.guest_id = gig.guest_id
		//				left outer join ".DB_SCHEMA.".".$table_groups." gr on gr.group_id = gig.group_id";
		
		$query = "select COUNT(*) AS count
					from ".DB_SCHEMA.".".$table_guests." gu 
					left outer join ".DB_SCHEMA.".".$table_guestsingroup." gig on gu.guest_id = gig.guest_id
					left outer join ".DB_SCHEMA.".".$table_groups." gr on gr.group_id = gig.group_id
					where gu.deleted = 0 and gig.deleted = 0 and gr.deleted = 0";
		
		
		doLog("Executing :".$query);		
		$result = pg_query($connection,$query);
		if ($result){
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
			/* Limit guests to only unassigned one
			$query = "select  gu.".$hfield_guests."_id,".
							       $hfield_groups."_name,". 
							       $hfield_seatings."_id,". 
							       $hfield_titles."_name,".
							       $hfield_guests."_vip,".
							       $hfield_guests."_firstname,".
							       $hfield_guests."_lastname,".
							       $hfield_guests."_display,".
							       $hfield_genders."_name,".
							       $hfield_ages."_name,".
							       $hfield_meals."_name,".
							       $hfield_requests."_name,".						       
							       $hfield_rsvps."_name ".
							"from ".DB_SCHEMA.".".$table_guests." gu
							left outer join ".DB_SCHEMA.".".$table_guestsingroup." gig on gu.guest_id = gig.guest_id
							left outer join ".DB_SCHEMA.".".$table_seatings." seat on seat.guest_id = gu.guest_id
							left outer join ".DB_SCHEMA.".".$table_layouts." lay on lay.layout_id = seat.layout_id
							left outer join ".DB_SCHEMA.".".$table_groups." gr on gr.group_id = gig.group_id
							left outer join ".DB_SCHEMA.".".$table_titles." ti on ti.title_id = gu.title_id
							left outer join ".DB_SCHEMA.".".$table_genders." ge on ge.gender_id = gu.gender_id
							left outer join ".DB_SCHEMA.".".$table_ages." ag on ag.age_id = gu.age_id
							left outer join ".DB_SCHEMA.".".$table_meals." me on me.meal_id = gu.meal_id
							left outer join ".DB_SCHEMA.".".$table_requests." re on re.request_id = gu.request_id						
							left outer join ".DB_SCHEMA.".".$table_rsvps." rs on rs.rsvp_id = gu.rsvp_id 
							where 
								seat.seating_id is null or 
								(	seat.seating_id is not null and 
									seat.event_id = '".$event."' and
									lay.layout_id = (
													select layout_id 
													from ".DB_SCHEMA.".layouts 
													where 
														venue_id = '".$venue."' and 
														layout_name = '".$layout."')
								)";
								*/
			/*$query = "with data as (
		 select        
			case when ( lay.layout_id = $layoutid and venue_id = '".$venue."' and event_id = '".$event."' ) then cast(seat.seating_id as text) else cast(null as text) end as seating_id,
			lag(gu.guest_id) OVER (ORDER BY gu.guest_id) as lag,
			lead(gu.guest_id) OVER (ORDER BY gu.guest_id) as lead,
			gu.guest_id,
			 gr.group_name,
			 ti.title_name,
			 gu.guest_vip,
			 gu.guest_firstname,
			 gu.guest_lastname,
			 gu.guest_display,
			 ge.gender_name,
			 ag.age_name,
			 me.meal_name,
			 re.request_name,
			 rs.rsvp_name      
							from ".DB_SCHEMA.".".$table_guests." gu
							left outer join ".DB_SCHEMA.".".$table_guestsingroup." gig on gu.guest_id = gig.guest_id
							left outer join ".DB_SCHEMA.".".$table_seatings." seat on seat.guest_id = gu.guest_id
							left outer join ".DB_SCHEMA.".".$table_layouts." lay on lay.layout_id = seat.layout_id
							left outer join ".DB_SCHEMA.".".$table_groups." gr on gr.group_id = gig.group_id
							left outer join ".DB_SCHEMA.".".$table_titles." ti on ti.title_id = gu.title_id
							left outer join ".DB_SCHEMA.".".$table_genders." ge on ge.gender_id = gu.gender_id
							left outer join ".DB_SCHEMA.".".$table_ages." ag on ag.age_id = gu.age_id
							left outer join ".DB_SCHEMA.".".$table_meals." me on me.meal_id = gu.meal_id
							left outer join ".DB_SCHEMA.".".$table_requests." re on re.request_id = gu.request_id						
							left outer join ".DB_SCHEMA.".".$table_rsvps." rs on rs.rsvp_id = gu.rsvp_id 
			where
			 seat.seating_id is null or
			  ( 
			   seat.seating_id is not null and
			   seat.event_id = '".$event."' and
			   lay.layout_id = $layoutid
			  )
			 or     
			 ( 
			  seat.seating_id is not null and
			  ( seat.event_id <> '".$event."' or
				lay.layout_id <> $layoutid )
			 )
			order by guest_id, lag, seating_id LIMIT $limit OFFSET $start
		) select d.*
from data d 
where   seating_id is not null or
(      seating_id is null and guest_id not in (select guest_id from data where seating_id is not null)
)  and (guest_id <> d.lead or d.lead is null)  ";*/


$query = "WITH data as (
		 select        
			case when ( lay.layout_id = $layoutid and venue_id = '".$venue."' and seat.event_id = '".$event."' ) then cast(seat.seating_id as text) else cast(null as text) end as seating_id,
			lag(gu.guest_id) OVER (ORDER BY gu.guest_id) as lag,
			lead(gu.guest_id) OVER (ORDER BY gu.guest_id) as lead,
			gu.guest_id,
			 gr.group_name,
			 ti.title_name,
			 gu.guest_vip,
			 gu.guest_firstname,
			 gu.guest_lastname,
			 gu.guest_display,
			 ge.gender_name,
			 ag.age_name,
			 me.meal_name,
			 re.request_name,
			 rs.rsvp_name      
							from ".DB_SCHEMA.".".$table_guests." gu
							left outer join ".DB_SCHEMA.".".$table_guestsingroup." gig on gu.guest_id = gig.guest_id
							left outer join ".DB_SCHEMA.".".$table_seatings." seat on seat.guest_id = gu.guest_id
							left outer join ".DB_SCHEMA.".".$table_layouts." lay on lay.layout_id = seat.layout_id
							left outer join ".DB_SCHEMA.".".$table_groups." gr on gr.group_id = gig.group_id
							left outer join ".DB_SCHEMA.".".$table_titles." ti on ti.title_id = gu.title_id
							left outer join ".DB_SCHEMA.".".$table_genders." ge on ge.gender_id = gu.gender_id
							left outer join ".DB_SCHEMA.".".$table_ages." ag on ag.age_id = gu.age_id
							left outer join ".DB_SCHEMA.".".$table_meals." me on me.meal_id = gu.meal_id
							left outer join ".DB_SCHEMA.".".$table_requests." re on re.request_id = gu.request_id						
							left outer join ".DB_SCHEMA.".".$table_rsvps." rs on rs.rsvp_id = gu.rsvp_id 
			where 
			 gu.deleted = 0 and
			 (seat.seating_id is null or
			  ( 
			   seat.seating_id is not null and
			   seat.event_id = '".$event."' and
			   lay.layout_id = $layoutid
			  )
			 or     
			 ( 
			  seat.seating_id is not null and seat.deleted = 0 and
			  ( seat.event_id <> '".$event."' or
				lay.layout_id <> $layoutid )
			 ))
			order by guest_id, lag, seating_id LIMIT $limit OFFSET $start
		) select d.*
from data d 
where   seating_id is not null or
(      seating_id is null and guest_id not in (select guest_id from data where seating_id is not null)
)  and (guest_id <> d.lead or d.lead is null)  ";



				
			if ($search == "true") {
				//build search string
				$query .= " AND " . $searchField . " " . $op[$searchOper][ope] . " '" . $op[$searchOper][before] . $searchString . $op[$searchOper][after] . "'";
			}
			$query .= " order by $sidx $sord ";
			doLog($query);
			$result = pg_query($connection,$query);
			if ($result){
				$response->page = $page;
				$response->total = $total_pages;
				$response->records = $count;
				$i=0;
				while($row = pg_fetch_assoc($result)) {
					//doLog(print_r($row,true));
					$vip = ($row[$hfield_guests.'_vip'] === 'f' ? 0 : 1);
					$response->d[$i]=array(
											"id"=>$row[$hfield_guests.'_id'],
											"group"=>$row[$hfield_groups.'_name'],
											"seat"=>$row[$hfield_seatings.'_id'],
											"title"=>$row[$hfield_titles.'_name'],
											"VIP"=> $vip,
											"lastname"=>$row[$hfield_guests.'_lastname'],
											"firstname"=>$row[$hfield_guests.'_firstname'],
											"display"=>$row[$hfield_guests.'_display'],
											"gender"=>$row[$hfield_genders.'_name'],
											"age"=>$row[$hfield_ages.'_name'],
											"meal"=>$row[$hfield_meals.'_name'],
											"request"=>$row[$hfield_requests.'_name'],
											"RSVP"=>$row[$hfield_rsvps.'_name']
					);
					//doLog("data:".join($row,","));
					$i++;
				}
				$response->status = 0;
				$response->responseText = "Successful.";				
			} else {
				$response->status = 1;
				$response->responseText = "Cannot execute query: $query, Error".pg_last_error($connection);				
			}
		} else {
			$response->status = 1;			
			$response->responseText = "Cannot execute query: $query, Error".pg_last_error($connection);				
		}
}
doLog("Preparing the reponse");
if ($custom_status !== 200 ){
	header("Content-type: application/json;charset=utf-8");
	header('X-Error-Message: '.$custom_error, true, $custom_status);
	die;
} else {
	header("Content-type: application/json;charset=utf-8");
	header("HTTP/1.0 200 OK");
	//doLog(json_encode($response));
	echo json_encode($response);
}
	
?>
