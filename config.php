<?php
error_reporting(E_ERROR);
//define('DB_HOST','localhost');
define('DB_HOST','192.168.27.3');
define('DB_PORT','5432');
//define('PATH', '/OnlineTablesDesigner');
define('PATH', '/tabledesigner4');

//Online
/*
define('DB_NAME','keyconce_onlinedesigner');
define('DB_USER', 'keyconce_pguser');
define('DB_PASSWORD', '8Fq{3o3Apc?e');
define('LOG', '/home/keyconce/public_html/tables/logs');
 * */

//Offline
define('DB_NAME','tableplanner');
//define('DB_NAME','onlinetablesdesigner');
define('DB_SCHEMA', 'public');
//define('DB_USER', 'tpuser');
define('DB_USER', 'postgres');
//define('DB_PASSWORD', '1234');
define('DB_PASSWORD', 'kakdela');
//define('LOG', '/home/frinckw/SourceCode/www/OnlineTablesDesigner/logs');
define('LOG', '/var/log/serendipity/tabledesginer/');


define('DSN',"host=".DB_HOST." port=".DB_PORT." dbname=".DB_NAME." user=".DB_USER." password=".DB_PASSWORD);
//define('DSN',"host=".DB_HOST." port=".DB_PORT." dbname=".DB_NAME);
define('ABSPATH', dirname(__FILE__).'/');
?>
