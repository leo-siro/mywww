<?php
// このファイルはExcel版公休予定表から呼び出されるAPIです。

    if (!function_exists($_GET["func"])) exit;
    $_GET["func"]();    //各ファンクションのコール
// -----------------------------------------------------------------------------------------
// 初期読込
    function initData() {
        getData(true);
    }
// -----------------------------------------------------------------------------------------
// データ読込
    function getData($call = false) {
        // if (isset($_GET["syori"]) === false || isset($_GET["kakutei"]) === false) {
        if (isset($_GET["syori"]) === false) {
            exit;
        }
        $end_day = date("Y/m/t",strtotime($_GET["syori"]));
        $ret["holiday"] = array_fill(0,date("j",strtotime($end_day)),"");
        require_once "pdo_connect.php";
        $con = new pdoConnect("schedule");

        $ret["Admin"] = "0";
        if (isset($_GET["user"])) {
            $sql = "SELECT admin_user FROM setting WHERE admin_user LIKE '%{$_GET["user"]}%'";
            $ds = $con->pdo->query($sql);
            if ($row = $ds->fetch()) {
                $ret["Admin"] = "1";
            }
        }
        $sql = "SELECT holiday FROM holiday 
                WHERE holiday between '{$_GET["syori"]}' AND '{$end_day}'";
        $ds = $con->pdo->query($sql);
        while ($row = $ds->fetch()) {
            $ix = date("j",strtotime($row["holiday"])) - 1;
            $ret["holiday"][$ix] = "1";
        }        

        $sql = "SELECT id,type,tx,btn,title,color FROM stamps";
        $ds = $con->pdo->query($sql);
        while ($row = $ds->fetch()) {
            $stamps[$row["id"]] = array(
                "type" => $row["type"],
                "tx" => $row["tx"],
                "btn" => $row["btn"],
                "title" => $row["title"],
                "color" => $row["color"]
            );
        }
        // $scitem = $_GET["kakutei"] == "0" ? "y.yotei_var" : "y.kakutei_var";
        // データ読込
        $sql = "SELECT 
                    l.syaincd,
                    l.user_name,
                    l.syozokucd,
                    l.syozokunm,
                    l.itemnm,
                    y.yotei_var AS scvar,
                    l.msort
                FROM v_member AS l
                    LEFT JOIN schedule AS y ON y.syaincd = l.syaincd AND y.schdule_ym = '{$_GET["syori"]}'
                ";
        if (isset($_GET["syozoku"]) && $_GET["syozoku"] !== "") {
            $sql .= " WHERE l.syozokucd LIKE '{$_GET["syozoku"]}%'";
        }
        $ds = $con->pdo->query($sql) or die($sql);

        $i = 0;
        while ($row = $ds->fetch()) {
            $ret["qdata"][$i] = array(
                "syaincd" => $row["syaincd"],
                "syainnm" => $row["user_name"],
                "syozokucd" => $row["syozokucd"],
                "syozokunm" => getSyozokunm($row["syozokunm"]),
                "itemnm" => $row["itemnm"] === "社員" ? "" : $row["itemnm"]
            );
            $day = $row["scvar"] == "" ? array_fill(0,date("j",strtotime($end_day)),"") : explode(",",$row["scvar"]);
            $ret["qdata"][$i]["items"] = getItem($day,$stamps);
            $i++;
        }
        if ($call) {
            $ret["syozoku"] = array();
            $sql = "SELECT DISTINCT
                        CASE WHEN s.dept_cd IS NULL THEN l.syozokucd ELSE '' END AS syozokucd,
                        k.DEPT_NAME AS syozokunm
                    FROM syain_list AS l
                    LEFT JOIN common.idinfo_soshiki AS k ON k.DEPT_CD = l.syozokucd
                    LEFT JOIN setting AS s ON s.dept_cd = l.syozokucd
                    ORDER BY l.sortno
                    ";
            $ds = $con->pdo->query($sql) or die($sql);
            while ($row = $ds->fetch()) {
                $ret["syozoku"][] = array(
                    "syozokucd" => $row["syozokucd"],
                    "syozokunm" => getSyozokunm($row["syozokunm"])
                );
            }        
        }
        $ret += array("code"=>"OK");
        echo json_encode($ret);
    }
    function getSyozokunm($inname) {
        $syozokunm = explode(" ",$inname);
        $syozokunm = $syozokunm[count($syozokunm)-1];
        if ($syozokunm != "情報システム部") {
            $syozokunm = str_replace("情報システム部","",$syozokunm);
        }
        return $syozokunm;
    } 
    function getItem($day,$stamps) {
        for ($j=0; $j<count($day); $j++) {
            if ($day[$j] !== "") {
                if ($day[$j] > 9 && $day[$j] < 100) {
                    $id = $day[$j] % 10;
                    $id2 = intval($day[$j] / 10) * 10;
                } else {
                    $id = $day[$j];
                    $id2 = $day[$j];
                }
               $item[$j] = array("vl"=>($id !== $id2 ? $stamps[$id]["tx"] : "").$stamps[$id2]["tx"],"bg"=>$stamps[$id]["color"]===""?0:intval($stamps[$id]["color"]));
            } else {
               $item[$j] = array("vl"=>"","bg"=>0);
            }
        }
        return $item;
    }
?>