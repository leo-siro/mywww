<?php
// このファイルはExcelから呼び出されるAPIです。
$my = new MyClass();
if (!method_exists($my,$_GET["func"])) exit;
$my->$_GET["func"]();
class MyClass {
    // データ読込
    function getHoliday() {
        if (isset($_GET["syori"]) === false) {
            exit;
        }
        $end_day = date("Y/m/t",strtotime($_GET["syori"]));
        $ret["holiday"] = array();
        require_once "pdo_connect.php";
        $con = new pdoConnect("schedule");

        $sql = "SELECT holiday FROM holiday 
                WHERE holiday between '{$_GET["syori"]}' AND '{$end_day}'";
        $ds = $con->pdo->query($sql);
        while ($row = $ds->fetch()) {
            $ix = date("j",strtotime($row["holiday"])) - 1;
            $ret["holiday"][] = $ix;
        }        

        $ret["code"] = "OK";
        echo json_encode($ret);
    }
    function getNippo() {
        if (isset($_GET["syori"]) === false || isset($_GET["syaincd"]) === false) {
            exit;
        }
        $end_day = date("Y/m/t",strtotime($_GET["syori"]));
        $ret["nippo"] = array();
        require_once "pdo_connect.php";
        $con = new pdoConnect("taskman");

        $sql = "SELECT
                    k.sinseino,
                    n.work_syori,
                    SUM(n.work_time) AS work_time
                FROM kadai AS k
                    INNER JOIN stories AS s ON s.keynum = k.keynum
                    INNER JOIN tasks AS t ON t.keynum = k.keynum AND t.storyno = s.storyno
                    INNER JOIN nippo AS n ON n.keynum = k.keynum AND n.storyno = s.storyno AND n.taskno = t.taskno
                WHERE s.syaincd = '{$_GET["syaincd"]}' AND n.work_syori between '{$_GET["syori"]}' AND '{$end_day}'
                GROUP BY k.sinseino,n.work_syori";
        $ds = $con->pdo->query($sql);
        // echo $sql;
        while ($row = $ds->fetch()) {
            $ix = date("j",strtotime($row["work_syori"]));
            $ret["nippo"][] = array(
                "sinseino" => $row["sinseino"],
                "work_time" => $row["work_time"],
                "dd" => $ix
            );
        }        

        $ret["code"] = "OK";
        echo json_encode($ret);
    }
}
?>