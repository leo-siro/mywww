<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<?php
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");

    try {
        $con->pdo->beginTransaction();
        $sql = "DELETE FROM schedule_dev.syain_list";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $sql = "INSERT INTO schedule_dev.syain_list 
                SELECT * FROM schedule.syain_list;";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $sql = "DELETE FROM schedule_dev.haken_list";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $sql = "INSERT INTO schedule_dev.haken_list 
                SELECT * FROM schedule.haken_list;";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $sql = "DELETE FROM schedule_dev.holiday";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $sql = "INSERT INTO schedule_dev.holiday 
                SELECT * FROM schedule.holiday;";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $sql = "DELETE FROM schedule_dev.stamps";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }        
        $sql = "INSERT INTO schedule_dev.stamps 
                SELECT * FROM schedule.stamps;";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }        
        $sql = "DELETE FROM schedule_dev.schedule";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $sql = "INSERT INTO schedule_dev.schedule 
                SELECT * FROM schedule.schedule;";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $con->pdo->commit();
        echo "コピー完了！";
    } catch (Exception $e) {
        $con->pdo->rollBack();
        echo "エラーの為、中断します";
    } 
?>
    </body>
</html>
