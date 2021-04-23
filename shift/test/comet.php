<?php
    ignore_user_abort(true);
    set_time_limit(0);
    // session_start();
    require_once "../pdo_connect.php";
    $con = new pdoConnect("schedule");
    $wtime = date("H:i:s",strtotime("+30 sec"));
    while($wtime > date("H:i:s") && !connection_aborted()) {
        sleep(10);
    }
    file_put_contents("test.txt",date("Y-m-d H:i:s"));
    echo json_encode(array("code"=>"OK"));
?>