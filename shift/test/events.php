<?php
    ignore_user_abort(true);
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-store');
    // クロスドメイン許可↓でもダメ
    // header("Access-Control-Allow-Origin: *");
    // header("Access-Control-Allow-Headers:Content-Type");
    // session_start();
    require_once "../pdo_connect.php";
    $con = new pdoConnect("schedule");
    while(!connection_aborted()) {
        $dtStr = date("Y-m-d H:i:s")." ".microtime(true)."  "; // . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
        // $txt = file_get_contents("test.txt");
        $sql = "SELECT max(upd_date) AS upd_date FROM schedule";
        $ds = $con->pdo->query($sql);
        $row = $ds->fetch();
        $txt = $row["upd_date"];
        $dtEnd = date("Y-m-d H:i:s")." ".microtime(true); // . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
        printf("data: %s\n\n", json_encode(array(
            'time' => $txt." ".$dtStr,
            'word' => $dtEnd,
		)));
        ob_end_flush();
        flush();
        sleep(10);
    }
    file_put_contents("test.txt",date("Y-m-d H:i:s"));
?>