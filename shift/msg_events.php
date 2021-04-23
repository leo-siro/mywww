<?php
// SSE(Server-sent events)によるメッセージイベント（push）処理 
// 2020/11/06現在未実装
// SSEがテスト環境だと動くが何故かportalサイト内だと正常に動作しない・・・
    ignore_user_abort(true);
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-store');
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    $max_upd = date("Y-m-d H:i:s");
    $sql = "INSERT INTO sc_log (syaincd, start_time)
                VALUES('{$_GET["syaincd"]}',now())";
    $con->pdo->exec($sql);
    $id = $con->pdo->lastInsertId();
    while (!connection_aborted()) {
        $sql = "SELECT max(upd_date) AS upd_date FROM schedule WHERE upd_date > '{$max_upd}'";
        $ds = $con->pdo->query($sql);
        $row = $ds->fetch();
        printf("data: %s\n\n", json_encode(array(
            'max_upd' => ($row["upd_date"] === null ? '' : $row["upd_date"]),
            'log_id' => $id
        )));            
        ob_end_flush();    
        flush();
        sleep(5);
        if ($row["upd_date"] !== null) {
            $max_upd = $row["upd_date"];
        }
    }
    $sql = "DELETE FROM sc_log WHERE id = {$id}";
    $con->pdo->exec($sql);
?>