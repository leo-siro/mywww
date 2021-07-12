<?php
if (!function_exists($_GET["func"])) exit;
session_start();
if (isset($_SESSION["shift"]["user"]) === false) {
    butonLoad();
}
$_GET["func"]();    //各ファンクションのコール
// -----------------------------------------------------------------------------------------
// データ読込
function loadData() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");

    $data = array();
    $end_day = date("Y/m/t",strtotime($_POST["syori_ym"]));
    $days = intval(date("t",strtotime($_POST["syori_ym"])));
    $data["holiday"] = array_fill(0,date("j",strtotime($end_day)),"");
    $data["holiday_biko"] = array();
    // 当番数等のエラーチェックに利用する
    $kokyu = $data["holiday"];
    $wdate = strtotime($_POST["syori_ym"]);
    while (date("Y/m/d",$wdate) <= $end_day) {
        if (date("w",$wdate) === "0" || date("w",$wdate) === "6") {
            $kokyu[date("j",$wdate)-1] = "1";
        } else {
            $kokyu[date("j",$wdate)-1] = "0";
        }
        $wdate = strtotime('+1 day', $wdate);
    }
    $sql = "SELECT toban_suu,dept_cd
            FROM setting 
            WHERE id = 1";
    $top_cd = "47";
    $ds = $con->pdo->query($sql);
    if ($row = $ds->fetch()) {
        $toban_suu = intval($row["toban_suu"]);
        $top_cd = $row["dept_cd"];
    }
    // 祝祭日テーブル読込
    $sql = "SELECT holiday,holiday_biko,toban FROM holiday 
            WHERE holiday between '{$_POST["syori_ym"]}' AND '{$end_day}'";
    $ds = $con->pdo->query($sql);
    while ($row = $ds->fetch()) {
        $ix = date("j",strtotime($row["holiday"])) - 1;
        $data["holiday"][$ix] = "1";
        $data["holiday_biko"][$ix] = $row["holiday_biko"];
        //当番除外時は０クリアする
        $kokyu[$ix] = ($row["toban"] === "0" ? "1" : "2"); 
    }
    if (substr($_POST["syori_ym"],0,7) >= date("Y/m")) {
        // ログインしたユーザの当月データが無い場合はデータ作成
        $sql = "SELECT y.syaincd,l.msort FROM v_member AS l
                    LEFT JOIN schedule AS y ON y.syaincd = l.syaincd AND y.schdule_ym = '{$_POST["syori_ym"]}'
                WHERE l.syaincd = '{$_POST["syaincd"]}'";
        $ds = $con->pdo->query($sql);
        $row = $ds->fetch();
        if ($row && $row["syaincd"] === null) { // データ無し
            $var = $data["holiday"];
            $wdate = strtotime($_POST["syori_ym"]);
            $daycnt = 0;
            // 土日祭日をデフォルトで”100(公)”にする。
            while (date("Y/m/d",$wdate) <= $end_day) {
                if ((date("w",$wdate) === "0" || date("w",$wdate) === "6" || $var[$daycnt] === "1") && $row["msort"] !== "0") {
                    $var[$daycnt] = "100";
                } else {
                    $var[$daycnt] = "0";
                }
                $daycnt++;
                $wdate = strtotime('+1 day', $wdate);
            }
            try {
                $con->pdo->beginTransaction();
                $sql ="INSERT INTO schedule (syaincd,schdule_ym,yotei_var,yotei_memo)
                        VALUES('{$_POST["syaincd"]}','{$_POST["syori_ym"]}','".implode(",",$var)."','')";
                if ($con->pdo->exec($sql) === false) {
                    // echo $sql;  
                    throw new Exception($sql);
                }
                $con->pdo->commit();
            } catch (Exception $e) {
                $con->pdo->rollBack();
            } 
        }
    }
    // データ読込
    $prev_ym = date("Y/m/d",strtotime($_POST["syori_ym"]." -1 Month"));
    $sql = "SELECT 
                l.syaincd,
                l.user_name,
                l.syozokucd,
                l.syozokunm,
                l.itemnm,
                l.edit_flg,
                y.yotei_var,
                y.yotei_memo,
                y.kakutei_var,
                y.kakutei_memo,
                l.msort,
                y.upd_date,
                y2.yotei_var AS prev_yotei
            FROM v_member AS l
                LEFT JOIN schedule AS y ON y.syaincd = l.syaincd AND y.schdule_ym = '{$_POST["syori_ym"]}'
                LEFT JOIN schedule AS y2 ON y2.syaincd = l.syaincd AND y2.schdule_ym = '{$prev_ym}'
            ";
            // echo $sql; exit;
    $ds = $con->pdo->query($sql) or die($sql);
    $cnt = $ds->rowCount();
    for ($i=0; $i<3; $i++) {
        for ($j=0; $j<$days; $j++) {
            $kei["kei"][$i][$j] = 0;
            $kei["kei_k"][$i][$j] = 0;
        }
    }
    $i = 0;
    $data["max_upd"] = "";

    while ($row = $ds->fetch()) {
        // 先月の公休数をカウントする（社員のみ）
        $kokyu_cnt = 0;
        if ($row["msort"] === "0") {
            if ($row["prev_yotei"] === null) {
                // 先月データが無い場合はチェック不要になるよう２を設定
                $kokyu_cnt = 2;
            } else {
                $prev_var = explode(",",$row["prev_yotei"]);
                $wymd = strtotime($_POST["syori_ym"]." -1 Day");
                // 先月末の土（6）までの間
                while (date("w",$wymd) !== "6") {
                    // 公休（100）をカウントする。
                    if ($prev_var[intval(date("j",$wymd))-1] === "100") {
                        $kokyu_cnt++;
                    }
                    $wymd = strtotime(date("Y/m/d",$wymd)." -1 Day");
                }
            }
        }
        $row["itemnm"] = str_replace(array("社員","グループマネージャー"),array("","ＧＭ"),$row["itemnm"]);
        $data["head"][] = array(
            "syaincd" => $row["syaincd"],
            "syainnm" => $row["user_name"],
            "syozokucd" => $row["syozokucd"],
            "syozokunm" => getSyozokunm($row["syozokunm"]),
            "itemnm" => $row["itemnm"],
            "user_flg" => $row["msort"],
            "prev_kokyu_cnt" => $kokyu_cnt
        );
        // 通常データ取得
        $day = $row["yotei_var"] == "" ? array_fill(0,date("j",strtotime($end_day)),"") : explode(",",$row["yotei_var"]);
        $memo = $row["yotei_memo"] == "" ? array_fill(0,date("j",strtotime($end_day)),"") : explode(",",$row["yotei_memo"]);
        $data["item"][$i]["syaincd"] = $row["syaincd"];
        $data = setItem($data,$i,$day,$memo,"",$kei);
        // 確定データ取得
        $day = $row["kakutei_var"] == "" ? array_fill(0,date("j",strtotime($end_day)),"") : explode(",",$row["kakutei_var"]);
        $memo = $row["kakutei_memo"] == "" ? array_fill(0,date("j",strtotime($end_day)),"") : explode(",",$row["kakutei_memo"]);
        // $data["item_k"][$i]["syaincd"] = $row["syaincd"];
        $data = setItem($data,$i,$day,$memo,"_k",$kei);
        // 確定データがある場合
        if ($row["kakutei_var"] != "" && isset($data["kakutei"]) === false) {
            $data["kakutei"] = 1;
        }
        if ($_POST["syaincd"] === $row["syaincd"]) {
            $data["edit_flg"] = $row["edit_flg"];
            $data["syozokucd"] = $row["syozokucd"];
        }
        if ($data["max_upd"] < $row["upd_date"]) {
            $data["max_upd"] = $row["upd_date"];
        }
        $i++;
    }
    $sql = "SELECT
                z.DEPT_CD AS syozokucd,
                z.DEPT_NAME AS syozokunm
            FROM syain_list AS l
            INNER JOIN common.syain_t AS s ON s.syaincd = l.syaincd
            LEFT JOIN common.idinfo_syozoku AS z ON z.EMP_ID = s.syaincd
            WHERE l.syozokucd <> (SELECT dept_cd FROM setting WHERE id = 1)
              AND EXISTS(SELECT * FROM syain_list WHERE syozokucd LIKE CONCAT(z.DEPT_CD,'%'))
            GROUP BY z.DEPT_CD,z.DEPT_NAME
            ORDER BY l.sortno";
    $ds = $con->pdo->query($sql) or die($sql);
    while ($row = $ds->fetch()) {
        $data["syozoku"][] = array(
            "value" => $row["syozokucd"],
            "label" => getSyozokunm($row["syozokunm"])
        );
    }
    // 当番の合計枠を作成
    for ($i=$cnt; $i<($cnt+2); $i++) {
        $data["head"][$i] = array();
        $data["item"][$i] = array();
        $data["item_k"][$i] = array();
        $data["memo"][$i] = array();
        $data["memo_k"][$i] = array();
    }
    for ($i=$cnt-1; $i>0; $i--) {
        if ($data["head"][$i]["user_flg"] === "0") {
            break;
        }
        $data["head"][$i+2] = $data["head"][$i];
        $data["item"][$i+2] = $data["item"][$i];
        $data["item_k"][$i+2] = $data["item_k"][$i];
        $data["memo"][$i+2] = $data["memo"][$i];
        $data["memo_k"][$i+2] = $data["memo_k"][$i];
    }
    $cnt = $i+1;
    for ($i=$cnt; $i<($cnt+2); $i++) {
        $data["head"][$i] = array(
            "syaincd" => "",
            // "syainnm" => ($i===$cnt ? "当番　合計" : ($i===($cnt+1) ? "予備　合計" : "管理職合計")),
            "syainnm" => ($i===$cnt ? "当番　合計" : "管理職合計"),
            "syozokucd" => "",
            "syozokunm" => "",
            "itemnm" => "",
            "user_flg" => "",
            "prev_kokyu_cnt" => ""
        );    
        for ($j=0; $j<$days; $j++) {
            $data["item"][$i]["id{$j}"] = "";
            // $data["item"][$i]["add{$j}"] = ($i === $cnt && $kokyu[$j] === "1" && $kei["kei"][$i-$cnt][$j] < $toban_suu
            //                                     ? "boldred"
            //                                     : ($i === ($cnt + 1) && $kokyu[$j] === "0" && $kei["kei"][$i-$cnt][$j] < 1 
            //                                         ? "boldred"
            //                                         : ($i === ($cnt + 2) && $kokyu[$j] !== "2" && $kei["kei"][$i-$cnt][$j] === 0
            //                                             ? "boldred"
            //                                             : "" )));
            $data["item"][$i]["add{$j}"] = ($i === $cnt && $kokyu[$j] === "1" && $kei["kei"][$i-$cnt][$j] < $toban_suu
                                                ? "boldred"
                                                : ($i === ($cnt + 1) && $kokyu[$j] !== "2" && $kei["kei"][$i-$cnt][$j] === 0
                                                    ? "boldred"
                                                    : "" ));
            $data["item"][$i]["day{$j}"] = $kei["kei"][$i-$cnt][$j];
            $data["item"][$i]["memo{$j}"] = "";
            $data["item_k"][$i]["id{$j}"] = "";
            $data["item_k"][$i]["add{$j}"] = "";
            $data["item_k"][$i]["day{$j}"] = $kei["kei_k"][$i-$cnt][$j];
            $data["item_k"][$i]["memo{$j}"] = "";
        }
        $data["memo"][$i]["koucnt"] = "";
        $data["memo"][$i]["asacnt"] = "";
        $data["memo"][$i]["toucnt"] = "";
        $data["memo_k"][$i]["koucnt"] = "";
        $data["memo_k"][$i]["asacnt"] = "";
        $data["memo_k"][$i]["toucnt"] = "";
    }
    $data["code"] = "OK";
    echo json_encode($data);
}
function setItem($data,$i,$day,$memo,$kakutei,&$kei) {
    $kou = 0;
    $asa = 0;
    $tou = 0;
    for ($j=0; $j<count($day); $j++) {
        if ($day[$j] !== "") {
            if ($day[$j] > 9 && $day[$j] < 100) {
                $id = $day[$j] % 10;
                $id2 = intval($day[$j] / 10) * 10;
                $data["item".$kakutei][$i]["id{$j}"] = $day[$j];
            } else {
                $id = $day[$j];
                $id2 = $day[$j];
                $data["item".$kakutei][$i]["id{$j}"] = $id;
            }
            $data["item".$kakutei][$i]["add{$j}"] = $_SESSION["shift"]["stamps"][$id]["color"] === "0" ? "" : "bg{$_SESSION["shift"]["stamps"][$id]["color"]}";
            $data["item".$kakutei][$i]["day{$j}"] = ($id !== $id2 ? $_SESSION["shift"]["stamps"][$id]["tx"] : "").$_SESSION["shift"]["stamps"][$id2]["tx"];
            if ($_SESSION["shift"]["stamps"][$id2]["tx"] === "公" || $_SESSION["shift"]["stamps"][$id2]["tx"] === "計") {
                $kou++;
            }
            if ($_SESSION["shift"]["stamps"][$id2]["tx"] === "朝当") {
                $asa++;
            }
            if ($_SESSION["shift"]["stamps"][$id2]["tx"] === "当") {
                $tou++;
            }
            if ($_SESSION["shift"]["stamps"][$id2]["tx"] === "当") {
                $kei["kei".$kakutei][0][$j]++;
            }
            // if ($_SESSION["shift"]["stamps"][$id2]["tx"] === "予") {
            //     $kei["kei".$kakutei][1][$j]++;
            // }
            if ($data["head"][$i]["itemnm"] === "ＧＭ" || $data["head"][$i]["itemnm"] === "マネージャー") {
                if ($id < 100) {
                    // $kei["kei".$kakutei][2][$j]++;
                    $kei["kei".$kakutei][1][$j]++;
                }
            }
        } else {
            $data["item".$kakutei][$i]["id{$j}"] = "";
            $data["item".$kakutei][$i]["add{$j}"] = "";
            $data["item".$kakutei][$i]["day{$j}"] = "";
        }
        $data["item".$kakutei][$i]["memo{$j}"] = $memo[$j];
    }
    $data["memo".$kakutei][$i]["koucnt"] = $kou === 0 ? "" : $kou;
    $data["memo".$kakutei][$i]["asacnt"] = $asa === 0 ? "" : $asa;
    $data["memo".$kakutei][$i]["toucnt"] = $tou === 0 ? "" : $tou;

    return $data;
}
// データ保存
function regData() {
    require_once "pdo_connect.php";
    $data = array("code"=>"ERROR","msg"=>"?");
    $con = new pdoConnect("schedule");
    try {
        $con->pdo->beginTransaction();
        foreach ($_POST["para"] as $para) {
            $sql = 
                "INSERT INTO schedule(
                    syaincd,
                    schdule_ym,
                    yotei_var,
                    yotei_memo
                ) VALUES (
                    '{$para["syaincd"]}',
                    '{$_POST["syori_ym"]}',
                    '{$para["yotei_var"]}',
                    '{$para["yotei_memo"]}'
                ) ON DUPLICATE KEY UPDATE
                    yotei_var = '{$para["yotei_var"]}',
                    yotei_memo = '{$para["yotei_memo"]}'
                ";
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);    
}
// -----------------------------------------------------------------------------------------
// 当番割当処理
function toban() {
    // ini_set("display_errors", 1);
    // error_reporting(E_ALL);
    require_once "pdo_connect.php";
    $data = array("code"=>"ERROR","msg"=>"?");
    $con = new pdoConnect("schedule");

    $_POST["syori_ym"] = str_replace("/","-",$_POST["syori_ym"]);
    $wdate = new DateTime($_POST["syori_ym"]);

    // 当月データが無い人のデータを初期化する
    try {
        $con->pdo->beginTransaction();
        $fill = array_fill(0,$wdate->format("t"),"0");
        $sql = "SELECT l.syaincd 
                FROM syain_list AS l 
                    INNER JOIN common.syain_t AS st on st.syaincd = l.syaincd
                    LEFT JOIN schedule AS s ON s.syaincd = l.syaincd AND s.schdule_ym = '{$_POST["syori_ym"]}'
                WHERE s.syaincd IS NULL AND l.toban_flg > 0";
        $ds = $con->pdo->query($sql);
        while ($row = $ds->fetch()) {
            $sql ="INSERT INTO schedule (syaincd,schdule_ym,yotei_var,yotei_memo)
                    VALUES('{$row["syaincd"]}','{$_POST["syori_ym"]}','".implode(",",$fill)."','')";
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
        }
        $con->pdo->commit();
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        return;
    }
    // return;
    $sql = "SELECT toban_cd,yobi_cd,toban_suu
            FROM setting 
            WHERE id = 1";
    $ds = $con->pdo->query($sql);
    if (($row = $ds->fetch()) === false) {
        echo json_encode(array("code"=>"ERROR","msg"=>"設定データを読み込めませんでした。"));  
        return;
    }
    $kijyun = (int)$row["toban_suu"]; //当番数4人
    $toban_cd = $row["toban_cd"];
    $yobi_cd = $row["yobi_cd"];
    $hantei = 3; //当番可能判定CD 0:出勤 1:テレワーク 2:鍵当番は可能
    try {
        $con->pdo->beginTransaction();
        $end_day = $wdate->format("Y-m-t");
        // データ抽出（カレンダー情報）
        while ($wdate->format("Y-m-d") <= $end_day) {
            if ($wdate->format("w") === "0" || $wdate->format("w") === "6") {
                $holiday[(int)$wdate->format("j")-1] = 0;
            } else {
                $weekday[(int)$wdate->format("j")-1] = 0;
            }
            $wdate = $wdate->modify('+1 days');
        }
        $sql = "SELECT holiday,toban FROM holiday 
                WHERE holiday between '{$_POST["syori_ym"]}' AND '{$end_day}'";
        $ds = $con->pdo->query($sql);
        while ($row = $ds->fetch()) {
            $wdate = new DateTime($row["holiday"]);
            $i = (int)$wdate->format("j")-1;
            if ($row["toban"] === "0" ) {
                $holiday[$i] = 0;
            } elseif (isset($holiday[$i])) { // 当番不要
                unset($holiday[$i]);
            }
            if (isset($weekday[$i])) {  // 予備当番不要
                unset($weekday[$i]);
            }
        }
        ksort($holiday);
        // データ抽出（公休予定）
        $wdate = date("Y-m-d",strtotime($_POST["syori_ym"]." -12 MONTH"));  // 過去1年分を基本とする
        $sql = "SELECT y.syaincd,y.schdule_ym,y.yotei_var FROM syain_list AS l
                    INNER JOIN schedule AS y ON y.syaincd = l.syaincd
                WHERE l.toban_flg = 1 AND y.schdule_ym BETWEEN '{$wdate}' AND '{$_POST["syori_ym"]}'
                ORDER BY y.schdule_ym DESC";
        $ds = $con->pdo->query($sql);
        while ($row = $ds->fetch()) {
            if ($row["yotei_var"] !== "") {
                $var = explode(",",$row["yotei_var"]);
                if ($row["schdule_ym"] === $_POST["syori_ym"]) {
                    $w[$row["syaincd"]]["var"] = $var;
                    $ok = false;
                    foreach ($holiday as $key => $val) {
                        if (chk_tou($var[$key],substr($toban_cd,0,1))) {
                            $holiday[$key]++;
                        }
                        if ((int)$var[$key] < $hantei) {
                            $ok = true;
                        }
                    }
                    foreach ($weekday as $key => $val) {
                        if (chk_tou($var[$key],substr($yobi_cd,0,1))) {
                            $weekday[$key]++;
                        }
                    }
                    if ($ok && isset($x[$row["syaincd"]]) === false) {
                        $x[$row["syaincd"]] = 0;
                        $cnt[$row["syaincd"]] = 0;
                        $x2[$row["syaincd"]] = 0;
                        $mmcnt[$row["syaincd"]] = 0;
                    }
                } elseif (isset($x[$row["syaincd"]])) {
                    for ($i=0; $i<count($var); $i++) {
                        if (chk_tou($var[$i],substr($toban_cd,0,1))) {
                            $cnt[$row["syaincd"]]++;
                        }
                    }
                    $mmcnt[$row["syaincd"]]++;
                }
            }
        }
        // 1ヶ月当たりの当番数にする $mmcnt社員毎の月数　$x社員毎の当番数
        foreach ($cnt as $xkey => $xval) {
            if (isset($mmcnt[$xkey]) && $mmcnt[$xkey] > 0) {
                $x[$xkey] = $xval / $mmcnt[$xkey];
            }
        }
        // 自動割り当て処理
        $msg = "";
        asort($x);
        // var_dump($x);
        // exit;
        foreach ($holiday as $key => $val) {
            $svval = -1;
            $inival;
            $okcnt = 0;
            $taisho = array();
            foreach ($x as $xkey => $xval) {
                if ($svval === -1) {
                    $svval = $xval;
                    $inival = $xval;
                }
                if ($svval !== $xval && ($okcnt + $val) >= $kijyun) {
                    break;
                }
                if ($w[$xkey]["var"][$key] === "" || (int)$w[$xkey]["var"][$key] < $hantei) {
                    $taisho[$okcnt] = $xkey;
                    $okcnt++;
                }
                $svval = $xval;
            }
            if ($okcnt > 0) {
                for ($i=0; $i<($kijyun-$val); $i++) {
                    if ($inival === $svval) {
                        $j = rand(0,$okcnt-1);
                    } else {
                        $j = 0;
                    }
                    if (isset($taisho[$j])) {
                        $w[$taisho[$j]]["var"][$key] = ($w[$taisho[$j]]["var"][$key] === "" ? $toban_cd : substr($toban_cd,0,1).$w[$taisho[$j]]["var"][$key]);
                        if ($x[$taisho[$j]] === $svval) {
                            $inival = $svval;
                        }
                        $cnt[$taisho[$j]]++;
                        // $x[$taisho[$j]] = $cnt[$taisho[$j]] / $mmcnt[$taisho[$j]];
                        $x[$taisho[$j]]++;
                        $x2[$taisho[$j]]++;
                        array_splice($taisho,$j,1);
                        $okcnt--;
                    } else {
                        $msg .= ($msg !== "" ? ".":"").($key+1)."日";
                        break;
                    }
                }
                asort($x);
            } elseif ($val < $kijyun) {
                $msg .= ($msg !== "" ? ".":"").($key+1)."日";
            }
        }
        // 自動割り当て後の是正処理(多い人から少ない人へ移動）
        $x3 = $x2;
        arsort($x2);
        // var_dump($x2);
        // exit;

        $first = end($x2);
        $end = reset($x2);
        if (($first + 2) < $end) {
            foreach ($x2 as $x2key => $x2val) {
                if (($first + 2) < $x2val) {
                    asort($x3);
                    foreach ($holiday as $key => $val) {
                        if (strlen($w[$x2key]["var"][$key]) === 2 && substr($w[$x2key]["var"][$key],0,1) === "1") {
                            foreach ($x3 as $x3key => $x3val) {
                                if (($x3val + 1) < $x2val) {
                                    if ($w[$x3key]["var"][$key] === "" || (int)$w[$x3key]["var"][$key] < $hantei) {
                                        $w[$x3key]["var"][$key] = ($w[$x3key]["var"][$key] === "" ? $toban_cd : substr($toban_cd,0,1).$w[$x3key]["var"][$key]);
                                        $w[$x2key]["var"][$key] = substr($w[$x2key]["var"][$key],0,1);
                                        $x3[$x3key]++;
                                        $x2val--;
                                        $x2[$x2key]--;
                                        break;
                                    }
                                } else {
                                    break;
                                }
                            }                                    
                        }
                    }
                } else {
                    break;
                }
            }
        }
        // 予備作成
        // foreach ($weekday as $key => $val) {
        //     if ($val > 0) {
        //         continue;
        //     }
        //     $flg = 1;
        //     $okflg = false;
        //     while ($okflg === false && $flg < 3) {
        //         $taisho = array();
        //         foreach ($w as $wkey => $wval) {
        //             if (isset($w[$wkey]["flg"]) === false) {
        //                 $w[$wkey]["flg"] = 0;
        //             }
        //             if ($w[$wkey]["flg"] < $flg && ($wval["var"][$key] === "" || (int)$wval["var"][$key] < $hantei)) {
        //                 $taisho[] = $wkey;
        //             }
        //         }
        //         if (count($taisho) === 0) {
        //             $flg++;
        //         } else {
        //             $i = rand(0,count($taisho)-1);
        //             $w[$taisho[$i]]["var"][$key] = ($w[$taisho[$i]]["var"][$key] === "" ? $yobi_cd : substr($yobi_cd,0,1).$w[$taisho[$i]]["var"][$key]);
        //             $w[$taisho[$i]]["flg"]++;
        //             $okflg = true;
        //         }
        //     }
        // }
        // データ書き込み
        foreach ($w as $wkey => $wval) {
            $sql = "UPDATE schedule SET yotei_var = '".implode(",",$wval["var"])."'
                    WHERE syaincd = '{$wkey}' AND schdule_ym = '{$_POST["syori_ym"]}'";
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }            
        }
        $con->pdo->commit();
        if ($msg !== "") {
            $msg = "以下の日付は当番基準人数の割当が出来ませんでした\n".$msg;
        }
        $data = array("code"=>"OK","msg"=>$msg,"taisho"=>json_encode($x2));
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);    
}
function chk_tou($in,$toban_1) {
    return (strlen($in) === 2 && substr($in,0,1) === $toban_1);
}
// -----------------------------------------------------------------------------------------
// 確定処理
function Kakutei() {
    require_once "pdo_connect.php";
    $data = array("code"=>"ERROR","msg"=>"?");
    $con = new pdoConnect("schedule");
    $sql = "SELECT toban_x
            FROM setting 
            WHERE id = 1";
    $ds = $con->pdo->query($sql);
    if (($row = $ds->fetch()) === false) {
        echo json_encode(array("code"=>"ERROR","msg"=>"設定データを読み込めませんでした。"));  
        return;
    }
    $toban_x = substr($row["toban_x"],0,1);
    try {
        $con->pdo->beginTransaction();
        $sql = 
            "SELECT syaincd,yotei_var,yotei_memo FROM schedule
             WHERE schdule_ym = '{$_POST["syori_ym"]}'";
        $ds = $con->pdo->query($sql);
        while ($row = $ds->fetch()) {
            $var = explode(",",$row["yotei_var"]);
            foreach ($var as $key => $val) {
                // 当番ｘをクリアする。
                if (strlen($val) === 2 && substr($val,0,1) == $toban_x) {
                    $var[$key] = substr($val,1,1);
                }
            }
            $yotei_var = implode(",",$var);
            $sql = 
                "UPDATE schedule SET
                    yotei_var = '{$yotei_var}',
                    kakutei_var = '{$yotei_var}',
                    kakutei_memo = '{$row["yotei_memo"]}'
                WHERE schdule_ym = '{$_POST["syori_ym"]}'
                  AND syaincd = '{$row["syaincd"]}'
            ";
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);    
}
// -----------------------------------------------------------------------------------------
// 社員取得
function loadSyain($call = false) {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    $sql = "SELECT 
                l.syaincd,
                s.name,
                l.syozokucd,
                k.DEPT_NAME,
                s.itemnm,
                l.toban_flg,
                l.edit_flg
            FROM syain_list AS l
            INNER JOIN common.syain_t AS s ON s.syaincd = l.syaincd 
            LEFT JOIN common.idinfo_soshiki AS k ON k.DEPT_CD = l.syozokucd
            ORDER BY l.sortno";
    $ds = $con->pdo->query($sql) or die($sql);
    while ($row = $ds->fetch()) {
        $row["itemnm"] = str_replace(array("社員","グループマネージャー","マネージャー"),array("","ＧＭ","Ｍ"),$row["itemnm"]);
        $data["data"][] = array(
            "syaincd" => $row["syaincd"],
            "syainnm" => $row["name"],
            "syozokucd" => $row["syozokucd"],
            "syozokunm" => getSyozokunm($row["DEPT_NAME"]),
            "itemnm" => $row["itemnm"],
            "toban_flg" => $row["toban_flg"],
            "edit_flg" => $row["edit_flg"]
        );
    }
    if ($call === false && isset($data["data"]) === false) {
        $data = initSyain(true);
    } else {
        $data["code"] = "OK";
    }
    if ($call) {
        return $data;
    } 
    echo json_encode($data);
}
function getSyozokunm($inname) {
    $syozokunm = explode(" ",$inname);
    $syozokunm = $syozokunm[count($syozokunm)-1];
    if ($syozokunm != "情報システム部") {
        $syozokunm = str_replace("情報システム部","",$syozokunm);
    }
    return $syozokunm;
}
// 社員データ作成
function initSyain($call = false) {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    $sql = "SELECT dept_cd
            FROM setting 
            WHERE id = 1";
    $ds = $con->pdo->query($sql);
    $top_cd = "47";
    if ($row = $ds->fetch()) {
        $top_cd = $row["dept_cd"];
    }
    try {
        $con->pdo->beginTransaction();
        $sql = "SET @num=0;";
        $sql.= "INSERT INTO syain_list(syaincd,syozokucd,toban_flg,edit_flg,sortno)
                SELECT s.syaincd, s.syozokucd, 1, 0, @num:=@num+1
                FROM common.idinfo_soshiki AS k
                    INNER JOIN common.syain_t AS s ON s.syozokucd = k.DEPT_CD
                WHERE k.SCCD LIKE '% {$top_cd} %'
                ORDER BY s.syozokucd, s.rank, s.syainseq
                ON DUPLICATE KEY UPDATE
                    syozokucd = s.syozokucd
                ";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }            
    if ($call) {
        $data = loadSyain(true);
        return $data;
    } 
    echo json_encode($data);
}
// 社員データ登録
function regSyain() {
    require_once "pdo_connect.php";
    $data = array("code"=>"ERROR","msg"=>"?");
    $con = new pdoConnect("schedule");
    try {
        $con->pdo->beginTransaction();
        $i = 1;
        foreach ($_POST["para"] as $para) {
            if ($para["newcd"] === "1") {
                $sql = 
                    "INSERT INTO syain_list(
                        syaincd,
                        syozokucd,
                        toban_flg,
                        edit_flg,
                        sortno
                    ) VALUES (
                        '{$para["syaincd"]}',
                        '{$para["syozokucd"]}',
                        {$para["toban_flg"]},
                        {$para["edit_flg"]},
                        {$i}
                    )";
            } else {
                $sql = 
                    "UPDATE syain_list SET
                        syozokucd = '{$para["syozokucd"]}',
                        toban_flg = {$para["toban_flg"]},
                        edit_flg = {$para["edit_flg"]},
                        sortno = {$i}
                    WHERE syaincd = '{$para["syaincd"]}'
                    ";
            }
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
            $i++;
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);
}
// 社員データ削除
function delSyain() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    try {
        $con->pdo->beginTransaction();
        $sql = 
            "DELETE FROM syain_list 
             WHERE syaincd = '{$_POST["syaincd"]}'";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);
}
// 社員CD検索
function findSyain() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    $con->pdo->beginTransaction();
    $sql = 
        "SELECT syaincd FROM syain_list
            WHERE syaincd = '{$_POST["syaincd"]}'";    
    $ds = $con->pdo->query($sql) or die($sql);
    if ($row = $ds->fetch()) {
        $data = array("code" => "HIT");
    } else {
        $sql = 
            "SELECT name,itemnm FROM common.syain_t
                WHERE syaincd = '{$_POST["syaincd"]}'";
        $ds = $con->pdo->query($sql) or die($sql);
        if ($row = $ds->fetch()) {
            $data = array(
                "code" => "OK",
                "syaincd" => $_POST["syaincd"],
                "syainnm" => $row["name"],
                "itemnm" => $row["itemnm"]
            );
        } else {
            $data = array("code" => "ERROR");
        }
    }
    echo json_encode($data);
}
// -----------------------------------------------------------------------------------------
// 派遣社員取得
function loadHaken() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    $sql = "SELECT 
                l.syaincd,
                l.user_name,
                l.syozokucd,
                l.corp_name
            FROM haken_list AS l
            ORDER BY l.sortno";
    $ds = $con->pdo->query($sql) or die($sql);
    while ($row = $ds->fetch()) {
        $data["data"][] = array(
            "syaincd" => $row["syaincd"],
            "usernm" => $row["user_name"],
            "syozokucd" => $row["syozokucd"],
            "corpnm" => $row["corp_name"]
        );
    }
    $data["code"] = "OK";
    echo json_encode($data);
}
// 派遣社員データ登録
function regHaken() {
    require_once "pdo_connect.php";
    $data = array("code"=>"ERROR","msg"=>"?");
    $con = new pdoConnect("schedule");
    try {
        $con->pdo->beginTransaction();
        $i = 1;
        foreach ($_POST["para"] as $para) {
            if ($para["newcd"] === "1") {
                $sql = 
                    "INSERT INTO haken_list(
                        syaincd,
                        user_name,
                        syozokucd,
                        corp_name,
                        sortno
                    ) VALUES (
                        '{$para["syaincd"]}',
                        '{$para["user_name"]}',
                        '{$para["syozokucd"]}',
                        '{$para["corp_name"]}',
                        {$i}
                    )";
            } else {
                $sql = 
                    "UPDATE haken_list SET
                        user_name = '{$para["user_name"]}',
                        syozokucd = '{$para["syozokucd"]}',
                        corp_name = '{$para["corp_name"]}',
                        sortno = {$i}
                    WHERE syaincd = '{$para["syaincd"]}'
                    ";
            }
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
            $i++;
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);
}
// 派遣社員データ削除
function delHaken() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    try {
        $con->pdo->beginTransaction();
        $sql = 
            "DELETE FROM haken_list 
             WHERE syaincd = '{$_POST["syaincd"]}'";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);
}
// 派遣社員CD検索
function findHaken() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    $con->pdo->beginTransaction();
    $sql = 
        "SELECT syaincd FROM haken_list
            WHERE syaincd = '{$_POST["syaincd"]}'";    
    $ds = $con->pdo->query($sql) or die($sql);
    if ($row = $ds->fetch()) {
        $data = array("code" => "HIT");
    } else {
        $data = array("code" => "OK", "syaincd" => $_POST["syaincd"]);
    }
    echo json_encode($data);
}
// -----------------------------------------------------------------------------------------
// 新・中途社員取得
function loadTempsyain() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    $sql = "SELECT 
                t.syaincd,
                t.name,
                t.kana,
                t.itemnm,
                t.syozokucd,
                t.del_flg
            FROM temp_syain AS t
            ";
    $ds = $con->pdo->query($sql) or die($sql);
    while ($row = $ds->fetch()) {
        $data["data"][] = array(
            "syaincd" => $row["syaincd"],
            "name" => $row["name"],
            "kana" => $row["kana"],
            "itemnm" => $row["itemnm"],
            "syozokucd" => $row["syozokucd"],
            "status" => $row["del_flg"] === "1" ? "登録済" : "未"
        );
    }
    $data["code"] = "OK";
    echo json_encode($data);
}
// 新・中途社員データ登録
function regTempsyain() {
    require_once "pdo_connect.php";
    $data = array("code"=>"ERROR","msg"=>"?");
    $con = new pdoConnect("schedule");
    try {
        $con->pdo->beginTransaction();
        foreach ($_POST["para"] as $para) {
            if ($para["newcd"] === "1") {
                $sql = 
                    "INSERT INTO temp_syain(
                        syaincd,
                        name,
                        kana,
                        itemnm,
                        syozokucd,
                        syozokunm
                    ) VALUES (
                        '{$para["syaincd"]}',
                        '{$para["name"]}',
                        '{$para["kana"]}',
                        '{$para["itemnm"]}',
                        '{$para["syozokucd"]}',           
                        '{$para["syozokunm"]}'
                    )";
            } else {
                $sql = 
                    "UPDATE temp_syain SET
                        name = '{$para["name"]}',
                        kana = '{$para["kana"]}',
                        itemnm = '{$para["itemnm"]}',
                        syozokucd = '{$para["syozokucd"]}',
                        syozokunm = '{$para["syozokunm"]}'
                    WHERE syaincd = '{$para["syaincd"]}'
                    ";
            }
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
        }
        // 社員マスターには存在していなく、temp_syainにある社員データを登録する。社員マスターに登録する。
        $sql = "SELECT @seqno := IFNULL(MAX(syainseq),0) FROM common.syain_t WHERE syainseq < 700";
        $con->pdo->query($sql) or die($sql);
        $sql = "INSERT INTO common.syain_t (
                    syainseq,
                    syaincd,
                    name,
                    kana,
                    rank,
                    itemnm,
                    syozokucd,
                    syozokunm,
                    bu_cd,
                    ten_cd,
                    ka_cd
                )
                SELECT 
                    @seqno := @seqno + 1,
                    t.syaincd,
                    t.name,
                    t.kana,
                    0,
                    t.itemnm,
                    t.syozokucd,
                    t.syozokunm,
                    SUBSTRING(t.syozokucd,1,2),
                    SUBSTRING(t.syozokucd,3,2),
                    SUBSTRING(t.syozokucd,4,2)
                FROM temp_syain AS t
                LEFT JOIN common.syain_t AS s ON s.syaincd = t.syaincd 
                WHERE s.syaincd IS NULL AND t.del_flg = 0";            
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);
}
// 新・中途社員データ削除
function delTempsyain() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    try {
        $con->pdo->beginTransaction();
        $sql = 
            "DELETE FROM temp_syain 
             WHERE syaincd = '{$_POST["syaincd"]}'";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);
}
// 新・中途社員CD検索
function findTempsyain() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    $con->pdo->beginTransaction();
    $sql = 
        "SELECT syaincd FROM v_member
            WHERE syaincd = '{$_POST["syaincd"]}'";    
    $ds = $con->pdo->query($sql) or die($sql);
    if ($row = $ds->fetch()) {
        $data = array("code" => "HIT");
    } else {
        $sql = 
            "SELECT syaincd FROM temp_syain
                WHERE syaincd = '{$_POST["syaincd"]}'";    
        $ds = $con->pdo->query($sql) or die($sql);
        if ($row = $ds->fetch()) {
            $data = array("code" => "HIT");
        } else {
            $data = array("code" => "OK", "syaincd" => $_POST["syaincd"]);
        }
    }
    echo json_encode($data);
}
// -----------------------------------------------------------------------------------------
// 祝日取得
function loadHoliday() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    $from = "{$_POST["syori_yy"]}-04-01";
    $to = ($_POST["syori_yy"]+1)."-03-31";
    $sql = "SELECT holiday,holiday_biko,toban FROM holiday 
            WHERE holiday between '{$from}' AND '{$to}'";
    
    $ds = $con->pdo->query($sql);
    while ($row = $ds->fetch()) {
        $data["data"][] = array(
            "holiday" => str_replace("-","/",$row["holiday"]),
            "holiday_biko" => $row["holiday_biko"],
            "toban" => $row["toban"]
        );
    }
    if (isset($data["data"]) === false) {
        // データ無しの場合はgoogle APIで祝日を取得する
        $api_key = "AIzaSyDrGg3Nnx0lV0AuID6nLuMc1FGyl5TNoQM";
        $holidays_id = "japanese__ja@holiday.calendar.google.com";
        $start_date = "{$from}T00%3A00%3A00.000Z";
        $end_date = "{$to}T00%3A00%3A00.000Z";
        $holidays_url = sprintf(
            "https://www.googleapis.com/calendar/v3/calendars/%s/events?".
            "key=%s&timeMin=%s&timeMax=%s&maxResults=%d&orderBy=startTime&singleEvents=true",
            $holidays_id,
            $api_key,
            $start_date,
            $end_date,
            30  
        );
        $data["url"] = $holidays_url;
        if($results = file_get_contents($holidays_url, true)) {
            $results = json_decode($results);
            $holidays = array();
            foreach($results->items as $item) {
                $data["data"][] = array(
                    "holiday" => $item->start->date,
                    "holiday_biko" => $item->summary
                );
            }
        }
    }
    $data["code"] = "OK";
    echo json_encode($data);
}
// 祝日・休暇登録
function regHoliday() {
    require_once "pdo_connect.php";
    $data = array("code"=>"ERROR","msg"=>"?");
    $con = new pdoConnect("schedule");
    try {
        $con->pdo->beginTransaction();
        foreach ($_POST["para"] as $para) {
            $sql = 
                "INSERT INTO holiday (holiday,toban,holiday_biko) VALUES(
                    '{$para["holiday"]}',
                    {$para["toban"]},
                    '{$para["holiday_biko"]}'
                )
                ON DUPLICATE KEY UPDATE
                    toban = {$para["toban"]},
                    holiday_biko = '{$para["holiday_biko"]}'";
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);
}
// 祝日・休暇削除
function delHoliday() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    try {
        $con->pdo->beginTransaction();
        $sql = 
            "DELETE FROM holiday 
             WHERE holiday = '{$_POST["holiday"]}'";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);
}
// -----------------------------------------------------------------------------------------
// ボタン一覧取得
function loadButton() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");

    $sql = "SELECT id,type,tx,btn,title,color FROM stamps 
            ORDER BY sortno";
    
    $ds = $con->pdo->query($sql);
    while ($row = $ds->fetch()) {
        $data["data"][] = array(
            "id" => $row["id"],
            "type" => $row["type"],
            "tx" => $row["tx"],
            "btn" => $row["btn"],
            "title" => $row["title"],
            "color" => $row["color"]
        );
    }
    $data["code"] = "OK";
    echo json_encode($data);
}
// ボタン登録
function regButton() {
    require_once "pdo_connect.php";
    $data = array("code"=>"ERROR","msg"=>"?");
    $con = new pdoConnect("schedule");
    try {
        $con->pdo->beginTransaction();
        $no = 0;
        $data["stamp_s"] = array();
        foreach ($_POST["para"] as $para) {
            if ($para["id"] === 'New') {
                $x = ($para["type"] === "2" ? "10" : "1");
                $j = ($para["type"] === "0" ? "100" : ($para["type"] === "1" ? "0" : "10"));
                $sql = 
                    "SELECT
                        MIN(id + {$x}) AS id
                     FROM stamps
                     WHERE id >= {$j}
                       AND (id + {$x}) NOT IN (SELECT id FROM stamps)";
                $ds = $con->pdo->query($sql);
                $row = $ds->fetch();
                if (($para["type"] === "1" && $row["id"] > 9) 
                ||  ($para["type"] === "2" && $row["id"] > 90)) {
                    throw new Exception("番号が取得できない為、更新できません！");
                }
                $para["id"] = $row["id"];
                $sql = 
                    "INSERT INTO stamps (id,type,tx,btn,title,color,sortno) VALUES(
                        {$para["id"]},
                        {$para["type"]},
                        '{$para["tx"]}',
                        '{$para["btn"]}',
                        '{$para["title"]}',
                        {$para["color"]},
                        {$no}
                    )";
                // $data["id"][$no] = $row["id"];
            } else {
                $sql = 
                    "UPDATE stamps SET
                        tx = '{$para["tx"]}',
                        btn = '{$para["btn"]}',
                        title = '{$para["title"]}',
                        color = {$para["color"]},
                        sortno = {$no}
                    WHERE id = {$para["id"]}";
            }
            $data["stamps"][$para["id"]] = array(
                "type" => $para["type"],
                "tx" => $para["tx"],
                "btn" => $para["btn"],
                "title" => $para["title"],
                "color" => $para["color"]
            );
            $data["stamp_s"][] = $para["id"];
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
            $no++;
        }
        $_SESSION["shift"]["stamps"] = $data["stamps"];
        $_SESSION["shift"]["stamp_s"] = $data["stamp_s"];
        $con->pdo->commit();
        $data["code"] = "OK";
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);
}
// ボタン削除
function delButton() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    try {
        $con->pdo->beginTransaction();
        $sql = 
            "DELETE FROM stamps 
             WHERE id = {$_POST["id"]}";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    butonLoad();
    $data["stamps"] = $_SESSION["shift"]["stamps"];
    $data["stamp_s"] = $_SESSION["shift"]["stamp_s"];    
    echo json_encode($data);
}
function butonLoad() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");

    $_SESSION["shift"]["stamp_s"] = array();
    $sql = "SELECT id,type,tx,btn,title,color FROM stamps ORDER BY sortno";
    $ds = $con->pdo->query($sql);
    while ($row = $ds->fetch()) {
        $_SESSION["shift"]["stamps"][$row["id"]] = array(
            "type" => $row["type"],
            "tx" => $row["tx"],
            "btn" => $row["btn"],
            "title" => $row["title"],
            "color" => $row["color"]
        );
        $_SESSION["shift"]["stamp_s"][] = $row["id"];
    }
}
// -----------------------------------------------------------------------------------------
// 管理者設定取得
function loadAdmin() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    $data = array();
    $sql = "SELECT s.dept_cd,k.DEPT_NAME,s.admin_user,s.toban_cd,s.toban_x,s.yobi_cd,s.toi_cd,s.toban_suu
            FROM setting AS s
            LEFT JOIN common.idinfo_soshiki AS k ON k.DEPT_CD = s.dept_cd
            WHERE id = 1";
    
    $ds = $con->pdo->query($sql);
    if ($row = $ds->fetch()) {
        $data = array(
            "code" => "OK",
            "dept_cd" => $row["dept_cd"],
            "dept_nm" => $row["DEPT_NAME"],
            "admin_user" => $row["admin_user"],
            "toban_cd" => $row["toban_cd"],
            "toban_x" => $row["toban_x"],
            "yobi_cd" => $row["yobi_cd"],
            "toi_cd" => $row["toi_cd"],
            "toban_suu" => $row["toban_suu"]
        );
    }
    echo json_encode($data);
}
function regAdmin() {
    require_once "pdo_connect.php";
    $con = new pdoConnect("schedule");
    try {
        $con->pdo->beginTransaction();
        $sql = 
            "UPDATE setting SET
                admin_user = '{$_POST["admin_user"]}',
                dept_cd = '{$_POST["dept_cd"]}',
                toban_cd = '{$_POST["toban_cd"]}',
                toban_x = '{$_POST["toban_x"]}',
                yobi_cd = '{$_POST["yobi_cd"]}',
                toi_cd = '{$_POST["toi_cd"]}',
                toban_suu = {$_POST["toban_suu"]}
             WHERE id = 1";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $con->pdo->commit();
        $data = array("code"=>"OK");
    } catch (Exception $e) {
        $con->pdo->rollBack();
        $data = array("code"=>"ERROR","msg"=>$e->getMessage());
    }
    echo json_encode($data);
}

?>