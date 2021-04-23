<html>
<head>
<title>MSSQL接続テスト・AP名称</title>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta http-equiv="Pragma" content="no-cache">
</head>
<body>
<?php
                $w_str = strtotime("2021/03/31");
                $w_end = strtotime("2021/04/01");
                $nissu_s = ($w_str - $str_day_t) / (60 * 60 * 24);
                $nissu_e = ($w_end - $w_str) / (60 * 60 * 24);
    // echo file_get_contents("http://nsearch.leopalace21.com/taskman/updatetask.php?target=".
    //     (substr($_SERVER["SERVER_NAME"],0,8) === "mywwwdev" ? "taskman_dev" : "taskman"));

?>