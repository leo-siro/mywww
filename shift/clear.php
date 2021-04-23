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

    if (isset($_GET["ym"]) === false) {
        echo "使い方　/clear.php?ym=2020/11";
        exit;
    }
    try {
        $ok = false;
        $con->pdo->beginTransaction();
        $sql = "SELECT syaincd,schdule_ym,yotei_var 
                FROM schedule_dev.schedule 
                WHERE schdule_ym = '{$_GET["ym"]}/01'";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch()) {
            $var = explode(",",$row["yotei_var"]);
            foreach ($var as $key => $val) {
                // 当番ｘをクリアする。
                if (strlen($val) === 2 && (substr($val,0,1) == "1" || substr($val,0,1) == "3")) {
                    $var[$key] = substr($val,1,1);
                }
            }
            $yotei_var = implode(",",$var);
            $sql = "UPDATE schedule_dev.schedule SET 
                        yotei_var = '{$yotei_var}'
                    WHERE syaincd = '{$row["syaincd"]}'
                    AND schdule_ym = '{$row["schdule_ym"]}'";
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
            $ok = true;
        }
        $con->pdo->commit();
        if ($ok) {
            echo "当番クリアー完了！";
        } else {
            echo "対象データが存在しません、日付指定を確認して下さい！　/clear.php?ym=2020/11";
        }
    } catch (Exception $e) {
        $con->pdo->rollBack();
        echo "エラーの為、中断します";
    } 
?>
    </body>
</html>
