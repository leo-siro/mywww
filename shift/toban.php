<?php
// ★★　これを修正する場合は必ずshift.phpのtoban()も修正をし同期して下さい
require_once "pdo_connect.php";
$data = array("code"=>"ERROR","msg"=>"?");
$con = new pdoConnect("schedule");

$syori_ym = date("Y-m-01");
$wdate = new DateTime($syori_ym);

// 当月データが無い人のデータを初期化する
try {
    $con->pdo->beginTransaction();
    $fill = array_fill(0,$wdate->format("t"),"0");
    $sql = "SELECT l.syaincd 
            FROM syain_list AS l 
                INNER JOIN common.syain_t AS st on st.syaincd = l.syaincd
                LEFT JOIN schedule AS s ON s.syaincd = l.syaincd AND s.schdule_ym = '{$syori_ym}'
            WHERE s.syaincd IS NULL AND l.toban_flg > 0 AND l.del_flg = 0";
    $ds = $con->pdo->query($sql);
    while ($row = $ds->fetch()) {
        $sql ="INSERT INTO schedule (syaincd,schdule_ym,yotei_var,yotei_memo)
                VALUES('{$row["syaincd"]}','{$syori_ym}','".implode(",",$fill)."','')";
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
            WHERE holiday between '{$syori_ym}' AND '{$end_day}'";
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
    $wdate = date("Y-m-d",strtotime($syori_ym." -12 MONTH"));  // 過去1年分を基本とする
    $sql = "SELECT y.syaincd,y.schdule_ym,y.yotei_var FROM syain_list AS l
                INNER JOIN schedule AS y ON y.syaincd = l.syaincd
            WHERE l.toban_flg = 1 AND y.schdule_ym BETWEEN '{$wdate}' AND '{$syori_ym}' AND l.del_flg = 0
            ORDER BY y.schdule_ym DESC";
    $ds = $con->pdo->query($sql);
    while ($row = $ds->fetch()) {
        if ($row["yotei_var"] !== "") {
            $var = explode(",",$row["yotei_var"]);
            if ($row["schdule_ym"] === $syori_ym) {
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
    // データ書き込み
    foreach ($w as $wkey => $wval) {
        $sql = "UPDATE schedule SET yotei_var = '".implode(",",$wval["var"])."'
                WHERE syaincd = '{$wkey}' AND schdule_ym = '{$syori_ym}'";
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
var_dump($data);    

function chk_tou($in,$toban_1) {
    return (strlen($in) === 2 && substr($in,0,1) === $toban_1);
}
?>