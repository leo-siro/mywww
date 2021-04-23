<?php
ini_set("display_errors", 1);
error_reporting(E_ALL);
$my = new MyClass();
if (!method_exists($my,$_GET["func"])) exit;
session_start();
$my->$_GET["func"]();    //各ファンクションのコール
// -----------------------------------------------------------------------------------------
class MyClass {
    // 初期処理
    function initLoad() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("schedule");

        $data = array();
        $syzokucd = $_SESSION["taskman"]["syozokucd"];
        if (isset($_SESSION["taskman"]["findsyain"])) {
            $sql = "SELECT
                        syozokucd
                    FROM v_member
                    WHERE syaincd = '{$_SESSION["taskman"]["findsyain"]}'";
            $ds = $con->pdo->query($sql) or die($sql);
            if ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
                $syzokucd = $row["syozokucd"];
                $data["find_syain"] = $_SESSION["taskman"]["findsyain"];
                $data["find_syozoku"] = $syzokucd;
            }
        }
        $sql = "SELECT
                    z.DEPT_CD AS syozokucd,
                    z.DEPT_NAME AS syozokunm
                FROM syain_list AS l
                INNER JOIN common.syain_t AS s ON s.syaincd = l.syaincd
                LEFT JOIN common.idinfo_syozoku AS z ON z.EMP_ID = s.syaincd
                WHERE LENGTH(l.syozokucd) = 6
                AND EXISTS(SELECT * FROM syain_list WHERE syozokucd = z.DEPT_CD)
                GROUP BY z.DEPT_CD,z.DEPT_NAME
                ORDER BY l.sortno";
        $ds = $con->pdo->query($sql) or die($sql);
        // $data["syozoku"][] = array("value"=>"0","label"=>"全て");
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["syozoku"][] = array(
                "value" => $row["syozokucd"],
                "label" => $this->getSyozokunm($row["syozokunm"])
            );
        }    
        $data["same_group"] = $this->getSyain($con,$syzokucd);
        $data["code"] = "OK";
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
    function getSyain($con,$syozokucd) {
        $ret = array();
        $sql = "SELECT
                    l.syaincd,
                    l.user_name
                FROM schedule.v_member AS l
                WHERE l.syozokucd LIKE '{$syozokucd}%'
                ORDER BY l.msort,l.sortno";
        $ds = $con->pdo->query($sql) or die($sql);
        $ret[] = array("value"=>"0","label"=>"全て");
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $ret[] = array(
                "value" => $row["syaincd"],
                "label" => $row["user_name"]
            );
        }
        return $ret;
    }
    // -----------------------------------------------------------------------------------------
    // ここから作業進捗
    // -----------------------------------------------------------------------------------------
    function loadBoard() {
        $result =  file_get_contents("http://nsearch.leopalace21.com/taskman/updatetask.php?target=".
                        (substr($_SERVER["SERVER_NAME"],0,8) === "mywwwdev" ? "taskman_dev" : "taskman").
                        "&super={$_POST["super_reload"]}");

        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        // $working = array("-1"=>"0","0"=>"0","1"=>"1","2"=>"2");
        $data = array();
        $syain_where = "";
        $syozoku_join = "";
        if ($_POST["syaincd"] !== "0") {
            $syain_where = 
                "AND k.keynum IN (SELECT k.keynum FROM kadai AS k INNER JOIN stories AS s ON s.keynum = k.keynum WHERE s.syaincd = '{$_POST["syaincd"]}' GROUP BY k.keynum)";
                // "AND s.syaincd = '{$_POST["syaincd"]}'";
                // "AND (s.syaincd = '{$_POST["syaincd"]}' OR k.syutantou LIKE '%{$_POST["syainnm"]}%')";
            $sort = "k.sortno,";
        } elseif ($_POST["dept_cd"] !== "0" && trim($_POST["dept_cd"]) !== "") {
            $data["syain_list"] = $this->getSyain($con,$_POST["dept_cd"]);
            $syozoku_join = 
                "INNER JOIN (
                    SELECT CONCAT('%',CASE DEPT_LEVEL WHEN 2 THEN LV2NM WHEN 3 THEN LV3NM WHEN 4 THEN LV4NM WHEN 5 THEN LV5NM ELSE '' END,'%') AS DEPT_NAME 
                    FROM common.idinfo_soshiki WHERE DEPT_CD LIKE '{$_POST["dept_cd"]}%'
                ) AS X ON k.tantouka collate utf8_unicode_ci like X.DEPT_NAME";
            $sort = "k.sortnoka,";
        } else {
            $sort = "";
        }
        if (isset($_SESSION["taskman"]["syainkbn"]) && $_SESSION["taskman"]["syainkbn"] === '0') {
            $syain_where .= " AND k.personaluse IS NULL";
        }
        $sql = "SELECT 
                    k.keynum,
                    k.task1,
                    CASE k.jyotai WHEN 1 THEN 'main' WHEN 2 THEN 'right' ELSE 'left' END AS setdiv,
                    k.jyotai,
                    k.progress AS kadai_progress,
                    CASE k.important WHEN 3 THEN '緊急' WHEN 2 THEN '高' WHEN 1 THEN '中' ELSE '低' END AS important,
                    CASE k.important WHEN 3 THEN 'red' WHEN 2 THEN 'orange' WHEN 1 THEN 'blue' ELSE 'green' END AS important_css,
                    k.start_yotei AS kadai_start_yotei,
                    k.end_yotei AS kadai_end_yotei,
                    -- k.syutantou,
                    k.sinseino,
                    k.col,
                    k.colx,
                    s.storyno,
                    s.title AS story_title,                
                    s.color,
                    s.syaincd,
                    s.progress AS story_progress,
                    s.ration AS story_ration,
                    s.ration_auto AS story_ration_auto,
                    s.start_yotei AS story_start_yotei,
                    s.end_yotei AS story_end_yotei,
                    s.bikou AS story_bikou,
                    m.user_name,
                    t.taskno,
                    t.title AS task_title,
                    t.progress AS task_progress,
                    t.ration AS task_ration,
                    t.ration_auto AS task_ration_auto,
                    t.bikou AS task_bikou
                FROM kadai AS k
                    LEFT JOIN stories AS s ON s.keynum = k.keynum
                    LEFT JOIN tasks AS t ON t.keynum = k.keynum AND t.storyno = s.storyno
                    LEFT JOIN schedule.v_member AS m ON m.syaincd = s.syaincd
                    {$syozoku_join}         
                WHERE k.jyotai < 8
                {$syain_where}
                AND (k.end_jisseki > DATE_SUB( CURDATE(),INTERVAL 4 WEEK ) OR k.end_jisseki IS NULL)
                ORDER BY {$sort}k.important DESC,k.keynum, k.jyotai, IF(s.progress=100,1,0), s.sortno, s.storyno, IF(t.progress=100,1,0), t.sortno, t.taskno";

        $oldkeynum = 0;
        $cnt = array("left0"=> 0,"main0"=>0,"main1"=>0,"main2"=>0,"main3"=>0,"main4"=>0,"main5"=>0,"right0"=>0);
        $data["sql"] = $sql;
        $ds = $con->pdo->query($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            if ($oldkeynum !== $row["keynum"]) {
                $yk = "";
                if ($row["kadai_start_yotei"] !== null || $row["kadai_end_yotei"] !== null) {
                    $yk = "～";
                }
                if ($row["colx"] === "") {
                    $col = $row["col"];
                } else {
                    $colx = json_decode($row["colx"],true);
                    if (isset($colx[$_POST["dept_cd"]])) {
                        $col = $colx[$_POST["dept_cd"]];
                    } else {
                        $col = $row["col"];
                    }
                }
                $column = $row["setdiv"] === "main" ? intval($col) : 0;
                $kadaiix = $row["setdiv"].$column;
                // $syutantou = explode("\n",$row["syutantou"]);
                if ($column > 0 && isset($data["data_".$row["setdiv"]][$column]) === false) {
                    // 0から順番に配列を作成しないと、連想配列になるのを防ぐ
                    for ($i=0; $i<$column; $i++) {
                        if (isset($data["data_".$row["setdiv"]][$i]) === false) {
                            $data["data_".$row["setdiv"]][$i] = array();
                        }
                    }
                }
                $data["data_".$row["setdiv"]][$column]["board_kadai"][$cnt[$kadaiix]] = array(
                    "jyotai" => $row["jyotai"],
                    "keynum" => $row["keynum"],
                    "kadai_title" => $row["task1"],
                    "kadai_progress" => $row["kadai_progress"],
                    "important" => $row["important"],
                    "important_css" => $row["important_css"],
                    "kadai_kikan" => ($row["kadai_start_yotei"] === null ? "" : date("m/d",strtotime($row["kadai_start_yotei"]))).$yk.
                                    ($row["kadai_end_yotei"] === null ? "" : date("m/d",strtotime($row["kadai_end_yotei"]))),
                    "kadai_syotei" => ($row["kadai_start_yotei"] === null ? "" : date("Y/m/d",strtotime($row["kadai_start_yotei"]))),
                    "kadai_eyotei" => ($row["kadai_end_yotei"] === null ? "" : date("Y/m/d",strtotime($row["kadai_end_yotei"]))),
                    "sinseino" => $row["sinseino"] === null ? "" :  $row["sinseino"],
                    "board_comp_show" => "",
                    "board_comp_cnt" => 0
                    // "syutantou" => $syutantou[0]
                );
                $cnt[$kadaiix]++;
                $oldkeynum = $row["keynum"];
                $oldstoryno = 0;
                $scnt = 0;
                $kadai_progress = 0;            
            }
            if ($row["storyno"] !== null && $oldstoryno !== $row["storyno"]) {
                $data["data_".$row["setdiv"]][$column]["board_kadai"][$cnt[$kadaiix]-1]["board_story"][$scnt] = array(
                    "storyno" => $row["storyno"],
                    "story_hide" => $row["story_progress"] === "100" ? "story_hide" : "",
                    "story_comp" => $row["story_progress"] === "100" ? "comp" : "",
                    "story_title" => $row["story_title"],
                    "story_progress" => $row["story_progress"],
                    "story_ration" => $row["story_ration"],
                    "story_ration_auto" => $row["story_ration_auto"],
                    "story_kikan" => date("m/d",strtotime($row["story_start_yotei"]))."～".date("m/d",strtotime($row["story_end_yotei"])),
                    "story_syotei" => date("Y/m/d",strtotime($row["story_start_yotei"])),
                    "story_eyotei" => date("Y/m/d",strtotime($row["story_end_yotei"])),
                    "story_bikou" => $row["story_bikou"],
                    "tantou" => $row["user_name"],
                    "color" => $row["color"],
                    "syain" => $row["syaincd"]
                );
                if ($data["data_".$row["setdiv"]][$column]["board_kadai"][$cnt[$kadaiix]-1]["board_comp_show"] === "" && $row["story_progress"] === "100") {
                    $data["data_".$row["setdiv"]][$column]["board_kadai"][$cnt[$kadaiix]-1]["board_comp_show"] = "board_comp_show";
                }
                $data["data_".$row["setdiv"]][$column]["board_kadai"][$cnt[$kadaiix]-1]["board_comp_cnt"] += ($row["story_progress"] === "100" ? 1 : 0);
                $scnt++;
                $oldstoryno = $row["storyno"];
                $tcnt = 0;
                $story_progress = 0;
            }
            if ($row["taskno"] !== null) {
                $data["data_".$row["setdiv"]][$column]["board_kadai"][$cnt[$kadaiix]-1]["board_story"][$scnt-1]["board_task"][$tcnt] = array(
                    "taskno" => $row["taskno"],
                    "task_comp" => ($row["task_progress"] === "100" ? "comp":""),
                    "task_title" => $row["task_title"],
                    "task_progress" => $row["task_progress"],
                    "task_ration" => $row["task_ration"],
                    "task_ration_auto" => $row["task_ration_auto"],
                    "task_bikou" => $row["task_bikou"]
                );
                // $kadai_progress += $row["task_progress"] * ($row["task_ration"] / 100) * ($row["story_ration"] / 100);
                // $story_progress += $row["task_progress"] * ($row["task_ration"] / 100);
                // $data["data_".$row["setdiv"]][$column]["board_kadai"][$cnt[$kadaiix]-1]["kadai_progress"] = floor($kadai_progress+0.01)."%";
                // $data["data_".$row["setdiv"]][$column]["board_kadai"][$cnt[$kadaiix]-1]["kadai_progress"] = (floor($kadai_progress + 0.01) - floor($kadai_progress + 0.01) % 5)."%";
                // $data["data_".$row["setdiv"]][$column]["board_kadai"][$cnt[$kadaiix]-1]["board_story"][$scnt-1]["story_progress"] = floor($story_progress+0.01)."%";
                // if (floor($story_progress+0.01) >= 100) {
                //     $data["data_".$row["setdiv"]][$column]["board_kadai"][$cnt[$kadaiix]-1]["board_story"][$scnt-1]["story_comp"] = "comp";
                // }
                $tcnt++;
            }
        }
        if (strlen($_POST["dept_cd"]) === 6) {
            $sql = "SELECT title1,title2,title3,title4,title5,title6 FROM board_title WHERE syozokucd = '{$_POST["dept_cd"]}'";
            $ds = $con->pdo->query($sql);
            if ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
                $data["title"] = array($row["title1"],$row["title2"],$row["title3"],$row["title4"],$row["title5"],$row["title6"]);
            } else {
                $data["title"] = array("","","","","","");
            }
        } else {
            $data["title"] = array("","","","","","");
        }
        if ($_POST["syaincd"] !== "0" && $oldkeynum === 0) {
            // 初期値が個人になっているのでデータが無い場合、課題一覧が見えなくなるのを防ぐ
            $_POST["syaincd"] = "0";
            $this->loadBoard();
        } else {
            $data["code"] = "OK";
            echo json_encode($data);
        }
    }
    function loadKadaiInfo() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");

        $sql = "SELECT 
                    k.kihyo_date,
                    k.irai_tan,
                    k.kbn,
                    k.tantouka,
                    k.syutantou,
                    k.task2,
                    k.sinseino,
                    k.yoteikosu,
                    SUM(n.work_time) AS jissekikosu,
                    k.dev_tan,
                    k.start_yotei,
                    k.end_yotei,
                    MIN(n.work_syori) AS start_jisseki,
                    IF(MAX(n.work_syori)=MIN(n.work_syori),NULL,MAX(n.work_syori)) AS end_jisseki,
                    k.bikou,
                    k.add_date,
                    a.name AS add_syain,
                    k.upd_date,
                    u.name AS upd_syain
                FROM kadai AS k
                LEFT JOIN nippo AS n ON n.keynum = k.keynum
                LEFT JOIN common.syain_t AS a ON a.syaincd = k.add_syain_no
                LEFT JOIN common.syain_t AS u ON u.syaincd = k.add_syain_no
                WHERE k.keynum = {$_POST["keynum"]}";
        $ds = $con->pdo->query($sql);
        if ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"] = array(
                "kihyo_date" => str_replace("-","/",$row["kihyo_date"]),
                "irai_tan" => $row["irai_tan"] === null ? "" : $row["irai_tan"],
                "kbn" => $row["kbn"] === null ? "" : $row["kbn"],
                "tantouka" => $row["tantouka"] === null ? "" : $row["tantouka"],
                "syutantou" => $row["syutantou"] === null ? "" : $row["syutantou"],
                "task2" => $row["task2"] === null ? "" : $row["task2"],
                "sinseino" => $row["sinseino"] === null ? "" : $row["sinseino"],
                "yoteikosu" => $row["yoteikosu"] === null ? "" : $row["yoteikosu"],
                "jissekikosu" => $row["jissekikosu"] === null ? "" : $row["jissekikosu"],
                "dev_tan" => $row["dev_tan"] === null ? "" : $row["dev_tan"],
                "start_yotei" => $row["start_yotei"] === null ? "" : str_replace("-","/",$row["start_yotei"]),
                "end_yotei" => $row["end_yotei"] === null ? "" : str_replace("-","/",$row["end_yotei"]),
                "start_jisseki" => $row["start_jisseki"] === null ? "" : str_replace("-","/",$row["start_jisseki"]),
                "end_jisseki" => $row["end_jisseki"] === null ? "" : str_replace("-","/",$row["end_jisseki"]),
                "bikou" => $row["bikou"] === null ? "" : $row["bikou"],
                "add_date" => $row["add_date"] === null ? "" : str_replace("-","/",substr($row["add_date"],0,10)),
                "add_syain" => $row["add_syain"] === null ? "" : $row["add_syain"],
                "upd_date" => $row["upd_date"] === null ? "" : str_replace("-","/",substr($row["add_date"],0,10)),
                "upd_syain" => $row["upd_syain"] === null ? "" : $row["upd_syain"]
            );
            $data["code"] = "OK";
        } else {
            $data["code"] = "ERROR";
        }               
        echo json_encode($data);
    }
    // タイトル変更
    function changeTitle() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        try {
            $con->pdo->beginTransaction();
            $sql = 
                "INSERT INTO board_title (syozokucd,title{$_POST["ix"]}) 
                    VALUES('{$_POST["syozokucd"]}','{$_POST["title"]}')
                 ON DUPLICATE KEY UPDATE
                    title{$_POST["ix"]} = '{$_POST["title"]}'";
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
            $con->pdo->commit();
            $data = array("code"=>"OK","msg"=>$sql);
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);    
    }
    // 状態（作業前・中・完了）の更新＋並び替えの更新
    function changeJyotai() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        try {
            $sql = "SELECT colx FROM kadai WHERE keynum = {$_POST["keynum"]}";
            $ds = $con->pdo->query($sql);
            $row = $ds->fetch(PDO::FETCH_ASSOC);
            $colx = array();
            if ($row["colx"] !== "") {
                $colx = json_decode($row["colx"],true);
            }
            $colx[$_POST["dept_cd"]] = $_POST["column"];
            $con->pdo->beginTransaction();
            $sql = 
                "UPDATE kadai SET
                    jyotai = {$_POST["jyotai"]},
                    col = {$_POST["column"]},
                    colx = '".json_encode($colx)."'
                WHERE keynum = {$_POST["keynum"]}";
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
            if (count($_POST["orderkey"]) > 1) {
                // 並び替え更新
                $keynum = implode(",",$_POST["orderkey"]);
                $sql = "SET @sortno:=0;
                        UPDATE kadai SET 
                            sortno{$_POST["sortkey"]} = @sortno:=@sortno+1
                        WHERE keynum IN({$keynum})
                        ORDER BY FIELD(keynum,{$keynum})";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
            }
            $con->pdo->commit();
            $data = array("code"=>"OK","msg"=>$sql);
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);    
    }
    // ストーリー並び替え更新
    function orderStory() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        try {
            $con->pdo->beginTransaction();
            for ($i=0; $i<count($_POST["storyno"]); $i++) {
                $sql = 
                    "UPDATE stories SET
                        sortno = {$i}
                    WHERE keynum = {$_POST["keynum"]}
                    AND storyno = {$_POST["storyno"][$i]}";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
            }
            $con->pdo->commit();
            $data = array("code"=>"OK","msg"=>$sql);
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);    
    }
    // タスク並び替え更新
    function orderTask() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        try {
            $con->pdo->beginTransaction();
            for ($i=0; $i<count($_POST["taskno"]); $i++) {
                $sql = 
                    "UPDATE tasks SET
                        sortno = {$i}
                    WHERE keynum = {$_POST["keynum"]}
                    AND storyno = {$_POST["storyno"]}
                    AND taskno = {$_POST["taskno"][$i]}";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
            }
            $con->pdo->commit();
            $data = array("code"=>"OK","msg"=>$sql);
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);    
    }
    // タスク進捗の更新
    function setTaskProgress() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        try {
            $con->pdo->beginTransaction();
            $sql = 
                "UPDATE tasks SET
                    progress = {$_POST["value"]}
                WHERE keynum = {$_POST["keynum"]}
                AND storyno = {$_POST["storyno"]}
                AND taskno = {$_POST["taskno"]}";
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
            $this->updateProgress($con);
            $con->pdo->commit();
            $data = array("code"=>"OK","msg"=>$sql);
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);    
    }
    // ストーリー担当者変更
    function updateTantou() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        try {
            $con->pdo->beginTransaction();
            $sql = 
                "UPDATE stories SET
                    syaincd = '{$_POST["syaincd"]}'
                WHERE keynum = {$_POST["keynum"]}
                AND storyno = {$_POST["storyno"]}";
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
            $con->pdo->commit();
            $data = array("code"=>"OK","msg"=>$sql);
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);    
    }
    // ストーリー登録・更新
    function storyReg() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        try {
            $con->pdo->beginTransaction();
            if ($_POST["storyno"] === "0") {
                $sql = "SELECT 
                            IFNULL(MAX(storyno),0)+1 AS newno,
                            IFNULL(MAX(sortno)+1,0) AS sortno
                        FROM stories 
                        WHERE keynum = {$_POST["keynum"]}";
                $ds = $con->pdo->query($sql) or die($sql);
                $row = $ds->fetch(PDO::FETCH_ASSOC);            
                $sql = "INSERT INTO stories (
                            keynum,
                            storyno,
                            sortno,
                            title,
                            color,
                            syaincd,
                            start_yotei,
                            end_yotei,
                            ration_auto,
                            ration,
                            bikou
                        ) VALUES (
                            {$_POST["keynum"]},
                            {$row["newno"]},
                            {$row["sortno"]},
                            '{$_POST["title"]}',
                            {$_POST["color"]},
                            '{$_POST["syaincd"]}',
                            '{$_POST["start_yotei"]}',
                            '{$_POST["end_yotei"]}',
                            {$_POST["ration_auto"]},
                            {$_POST["ration"]},
                            '{$_POST["bikou"]}'
                        )";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
                $sql = "INSERT INTO tasks (
                            keynum,
                            storyno,
                            title,
                            syaincd
                        ) VALUES (
                            {$_POST["keynum"]},
                            {$row["newno"]},
                            'NONAME',
                            '{$_POST["syaincd"]}'
                        )";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
                $newno = $row["newno"];
            } else {
                $sql = "UPDATE stories SET
                            title = '{$_POST["title"]}',
                            start_yotei = '{$_POST["start_yotei"]}',
                            end_yotei = '{$_POST["end_yotei"]}',
                            color = {$_POST["color"]},
                            syaincd = '{$_POST["syaincd"]}',
                            ration_auto = {$_POST["ration_auto"]},
                            ration = {$_POST["ration"]},
                            bikou = '{$_POST["bikou"]}'
                        WHERE keynum = {$_POST["keynum"]}
                        AND storyno = {$_POST["storyno"]}";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
                // $newno = $_POST["storyno"];
            }
            $data["ration"] = $this->updateRationStory($con);
            if (isset($newno)) {
                $sql = "SELECT 
                            s.storyno,
                            s.title AS story_title,                
                            s.color,
                            '0%' AS story_progress,
                            s.ration AS story_ration,
                            s.ration_auto AS story_ration_auto,
                            s.start_yotei AS story_start_yotei,
                            s.end_yotei AS story_end_yotei,
                            s.bikou AS story_bikou,
                            s.syaincd,
                            m.user_name,
                            t.taskno,
                            t.title AS task_title,
                            t.progress AS task_progress,
                            t.ration AS task_ration,
                            t.ration_auto AS task_ration_auto,
                            t.bikou AS task_bikou
                        FROM stories AS s
                            LEFT JOIN tasks AS t ON t.keynum = s.keynum AND t.storyno = s.storyno
                            LEFT JOIN schedule.v_member AS m ON m.syaincd = s.syaincd
                        WHERE s.keynum = {$_POST["keynum"]}
                        AND s.storyno = {$newno}";
                $ds = $con->pdo->query($sql) or die($sql);
                if ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
                    $data["data"]["board_story"][0] = array(
                        "storyno" => $row["storyno"],
                        "story_comp" => "",
                        "story_title" => $row["story_title"],
                        "story_progress" => $row["story_progress"],
                        "story_ration" => $row["story_ration"],
                        "story_ration_auto" => $row["story_ration_auto"],
                        "story_kikan" => date("m/d",strtotime($row["story_start_yotei"]))."～".date("m/d",strtotime($row["story_end_yotei"])),
                        "story_syotei" => date("Y/m/d",strtotime($row["story_start_yotei"])),
                        "story_eyotei" => date("Y/m/d",strtotime($row["story_end_yotei"])),
                        "story_bikou" => $row["story_bikou"],
                        "tantou" => $row["user_name"],
                        "color" => $row["color"],
                        "syain" => $row["syaincd"]
                    );
                    $data["data"]["board_story"][0]["board_task"][0] = array(
                        "taskno" => $row["taskno"],
                        "task_comp" => "",
                        "task_title" => $row["task_title"],
                        "task_progress" => $row["task_progress"],
                        "task_ration" => $row["task_ration"],
                        "task_ration_auto" => $row["task_ration_auto"],
                        "task_bikou" => $row["task_bikou"]
                    );
                }
            }
            $con->pdo->commit();
            $data["code"] = "OK";
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);    
    }
    // ストーリーの自動進捗割合更新
    function updateRationStory($con) {
        $sql = "UPDATE stories AS m
                INNER JOIN (
                    SELECT 
                        {$_POST["keynum"]} AS keynum,
                        SUM(IF(ration_auto=0,ration,0)) AS ration_sum,
                        SUM(IF(ration_auto=1,1,0)) AS ration_cnt
                    FROM stories
                    WHERE keynum = {$_POST["keynum"]}) AS g ON g.keynum = m.keynum
                SET m.ration = IF(g.ration_cnt = 0,m.ration,(100 - g.ration_sum) / g.ration_cnt)
                WHERE m.keynum = {$_POST["keynum"]} AND m.ration_auto = 1";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $this->updateProgress($con);
        $sql = "SELECT ration FROM stories
                WHERE keynum = {$_POST["keynum"]} AND ration_auto = 1 LIMIT 1";
        $ds = $con->pdo->query($sql) or die($sql);
        if ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            return $row["ration"];
        }
        return 0;
    }
    // タスク登録・更新
    function taskReg() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        try {
            $con->pdo->beginTransaction();
            if ($_POST["taskno"] === "0") {
                $sql = "SELECT 
                            IFNULL(MAX(taskno),0)+1 AS newno,
                            IFNULL(MAX(sortno)+1,0) AS sortno
                        FROM tasks 
                        WHERE keynum = {$_POST["keynum"]}
                        AND storyno = {$_POST["storyno"]}";
                $ds = $con->pdo->query($sql) or die($sql);
                $row = $ds->fetch(PDO::FETCH_ASSOC);            
                $sql = "INSERT INTO tasks (
                            keynum,
                            storyno,
                            taskno,
                            sortno,
                            title,
                            syaincd,
                            ration_auto,
                            ration,
                            progress,
                            bikou
                        ) VALUES (
                            {$_POST["keynum"]},
                            {$_POST["storyno"]},
                            {$row["newno"]},
                            {$row["sortno"]},
                            '{$_POST["title"]}',
                            '{$_SESSION["taskman"]["user"]}',
                            {$_POST["ration_auto"]},
                            {$_POST["ration"]},
                            {$_POST["progress"]},
                            '{$_POST["bikou"]}'
                        )";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
                if ($_POST["work_time"] !== "0") {
                    $sql = "INSERT INTO nippo (
                                keynum,
                                storyno,
                                taskno,
                                work_syori,
                                work_time,
                                memo
                            ) VALUES (
                                {$_POST["keynum"]},
                                {$_POST["storyno"]},
                                {$row["newno"]},
                                '{$_POST["work_syori"]}',
                                '{$_POST["work_time"]}',
                                '{$_POST["memo"]}'
                            ) ON DUPLICATE KEY UPDATE
                                work_time = '{$_POST["work_time"]}'";
                    if ($con->pdo->exec($sql) === false) {
                        throw new Exception($sql);
                    }                
                }
                $newno = $row["newno"];
            } else {
                $sql = "UPDATE tasks SET
                            title = '{$_POST["title"]}',
                            ration_auto = {$_POST["ration_auto"]},
                            ration = {$_POST["ration"]},
                            progress = {$_POST["progress"]},
                            bikou = '{$_POST["bikou"]}'
                        WHERE keynum = {$_POST["keynum"]}
                        AND storyno = {$_POST["storyno"]}
                        AND taskno = {$_POST["taskno"]}";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
                // $newno = $_POST["taskno"];
                if ($_POST["nippo"] === "1") {
                    $sql = "INSERT INTO nippo (
                                keynum,
                                storyno,
                                taskno,
                                work_syori,
                                work_time,
                                memo
                            ) VALUES (
                                {$_POST["keynum"]},
                                {$_POST["storyno"]},
                                {$_POST["taskno"]},
                                '{$_POST["work_syori"]}',
                                '{$_POST["work_time"]}',
                                '{$_POST["memo"]}'
                            ) ON DUPLICATE KEY UPDATE
                                work_time = '{$_POST["work_time"]}',
                                memo = '{$_POST["memo"]}'";
                    if ($con->pdo->exec($sql) === false) {
                        throw new Exception($sql);
                    }                
                }
            }
            $data["ration"] = $this->updateRationTask($con);
            if (isset($newno)) {
                $sql = "SELECT 
                            taskno,
                            title AS task_title,
                            progress AS task_progress,
                            ration AS task_ration,
                            ration_auto AS task_ration_auto,
                            bikou AS task_bikou
                        FROM tasks
                        WHERE keynum = {$_POST["keynum"]}
                        AND storyno = {$_POST["storyno"]}
                        AND taskno = {$newno}";
                $ds = $con->pdo->query($sql) or die($sql);
                if ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
                    $data["data"]["board_task"][0] = array(
                        "taskno" => $row["taskno"],
                        "task_comp" => ($_POST["progress"] === "100" ? "comp":""),
                        "task_title" => $row["task_title"],
                        "task_progress" => $row["task_progress"],
                        "task_ration" => $row["task_ration"],
                        "task_ration_auto" => $row["task_ration_auto"],
                        "task_bikou" => $row["task_bikou"]
                    );
                }
                if ($row["task_ration_auto"] === "1") {
                    $data["ration"] = $row["task_ration"];
                }
            }
            $con->pdo->commit();
            $data["code"] = "OK";
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);    
    }
    // タスクの自動進捗割合更新
    function updateRationTask($con) {
        $sql = "UPDATE tasks AS m
                    INNER JOIN (
                        SELECT 
                            {$_POST["keynum"]} AS keynum,
                            {$_POST["storyno"]} AS storyno,
                            SUM(IF(ration_auto=0,ration,0)) AS ration_sum,
                            SUM(IF(ration_auto=1,1,0)) AS ration_cnt
                        FROM tasks
                        WHERE keynum = {$_POST["keynum"]}
                            AND storyno = {$_POST["storyno"]} 
                    ) AS g ON g.keynum = m.keynum
                SET m.ration = IF(g.ration_cnt = 0,m.ration,(100 - g.ration_sum) / g.ration_cnt)
                WHERE m.keynum = {$_POST["keynum"]} 
                    AND m.storyno = {$_POST["storyno"]} 
                    AND m.ration_auto = 1";
        if ($con->pdo->exec($sql) === false) {
            throw new Exception($sql);
        }
        $this->updateProgress($con);
        $sql = "SELECT ration FROM tasks
                WHERE keynum = {$_POST["keynum"]} 
                  AND storyno = {$_POST["storyno"]}
                  AND ration_auto = 1 LIMIT 1";
        $ds = $con->pdo->query($sql) or die($sql);
        if ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            return $row["ration"];
        }
        return 0;
    }
    // プログレス更新
    function updateProgress($con) {
        $sql = "SELECT progress FROM kadai WHERE keynum = {$_POST["keynum"]}";
        $ds = $con->pdo->query($sql) or die($sql);
        $row = $ds->fetch(PDO::FETCH_ASSOC);
        $old_progress = intval($row["progress"]);
        if (isset($_POST["taskno"])) {
            $sql = "UPDATE stories AS s
                        INNER JOIN (
                            SELECT keynum,storyno,SUM(progress*(ration/100)) AS progress FROM tasks WHERE keynum = {$_POST["keynum"]} AND storyno = {$_POST["storyno"]}
                        ) AS t ON t.keynum = s.keynum AND t.storyno = s.storyno
                    SET s.progress = t.progress
                    WHERE s.keynum = {$_POST["keynum"]} 
                    AND s.storyno = {$_POST["storyno"]}";
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }            
        }
        $sql = "SELECT FLOOR(SUM(progress*(ration/100))+0.01) - FLOOR(SUM(progress*(ration/100))+0.01) % 5 AS progress FROM stories WHERE keynum = {$_POST["keynum"]}";
        $ds = $con->pdo->query($sql) or die($sql);
        $row = $ds->fetch(PDO::FETCH_ASSOC);
        $new_progress = intval($row["progress"]);
        if ($old_progress !== $new_progress) {
            $sql = "UPDATE kadai
                    SET progress = {$new_progress}
                    WHERE keynum = {$_POST["keynum"]}";
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
            $result = file_get_contents("http://nsearch.leopalace21.com/taskman/update_t_kadai.php?func=updateProgress".
                            "&dev=".(substr($_SERVER["SERVER_NAME"],0,8) === "mywwwdev" ? "1" : "0").
                            "&keynum={$_POST["keynum"]}".
                            "&progress={$new_progress}");
            if ($result !== "OK") {
                throw new Exception($result);
            }
        }
    }
    // ストーリー削除
    function deleteStory() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        $sql = "SELECT keynum FROM nippo
                WHERE keynum = {$_POST["keynum"]} 
                    AND storyno = {$_POST["storyno"]} LIMIT 1";
        $ds = $con->pdo->query($sql) or die($sql);
        if ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data = array("code"=>"NIPPO");
        } else {
            try {
                $con->pdo->beginTransaction();
                $sql = "DELETE FROM tasks
                        WHERE keynum = {$_POST["keynum"]}
                        AND storyno = {$_POST["storyno"]}";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
                $sql = "DELETE FROM stories
                        WHERE keynum = {$_POST["keynum"]}
                        AND storyno = {$_POST["storyno"]}";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
                $data["ration"] = $this->updateRationStory($con);
                $con->pdo->commit();
                $data["code"] = "OK";
            } catch (Exception $e) {
                $con->pdo->rollBack();
                $data = array("code"=>"ERROR","msg"=>$e->getMessage());
            }
        }
        echo json_encode($data);    
    }
    // タスク削除
    function deleteTask() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        $sql = "SELECT keynum FROM nippo
                WHERE keynum = {$_POST["keynum"]} 
                AND storyno = {$_POST["storyno"]}
                AND taskno = {$_POST["taskno"]} LIMIT 1";
        $ds = $con->pdo->query($sql) or die($sql);
        if ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data = array("code"=>"NIPPO");
        } else {
            try {
                $con->pdo->beginTransaction();
                $sql = "DELETE FROM tasks
                        WHERE keynum = {$_POST["keynum"]}
                        AND storyno = {$_POST["storyno"]}
                        AND taskno = {$_POST["taskno"]}";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
                $data["ration"] = $this->updateRationTask($con);
                $con->pdo->commit();
                $data["code"] = "OK";
            } catch (Exception $e) {
                $con->pdo->rollBack();
                $data = array("code"=>"ERROR","msg"=>$e->getMessage());
            }
        }
        echo json_encode($data);    
    }
    // 日報情報ゲット
    function nippoGet() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        $data = array("work_time"=>"0","memo"=>"");
        $sql = "SELECT work_time,memo FROM nippo
                WHERE keynum = {$_POST["keynum"]} 
                AND storyno = {$_POST["storyno"]}
                AND taskno = {$_POST["taskno"]}
                AND work_syori = '{$_POST["work_syori"]}'";
        $ds = $con->pdo->query($sql) or die($sql);
        if ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data = array(
                "work_time" => $row["work_time"],
                "memo" => $row["memo"]
            );
        }
        echo json_encode($data);    
    }
    // -----------------------------------------------------------------------------------------
    // ここから日報入力
    // -----------------------------------------------------------------------------------------
    function loadSchdule() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");

        $data["data"] = array();
        $str_day = date("Y/m/d",strtotime($_POST["syori_ym"]." -1 month"));
        $end_day = date("Y/m/t",strtotime($_POST["syori_ym"]." 1 month"));
        $snissu = date("t",strtotime($str_day));
        $mnissu = date("t",strtotime($_POST["syori_ym"]));
        $enissu = date("t",strtotime($end_day));
        $data["daycnt"] = $snissu + $mnissu + $enissu;
        // 祝祭日テーブル読込
        $sql = "SELECT holiday,holiday_biko,toban FROM schedule.holiday 
                WHERE holiday between '{$str_day}' AND '{$end_day}'";
        $ds = $con->pdo->query($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["holiday"][date("md",strtotime($row["holiday"]))] = "1";
        }
        $syain_where = "";
        $syozoku_join = "";
        if ($_POST["syaincd"] !== "0") {
            $syain_where = 
                "AND s.syaincd = '{$_POST["syaincd"]}'";
                // "AND (s.syaincd = '{$_POST["syaincd"]}' OR k.syutantou LIKE '%{$_POST["syainnm"]}%')";
            $sort = "k.sortno,";
        } elseif ($_POST["dept_cd"] !== "0" && trim($_POST["dept_cd"]) !== "") {
            $data["syain_list"] = $this->getSyain($con,$_POST["dept_cd"]);
            $syozoku_join = 
                "INNER JOIN (
                    SELECT CONCAT('%',CASE DEPT_LEVEL WHEN 2 THEN LV2NM WHEN 3 THEN LV3NM WHEN 4 THEN LV4NM WHEN 5 THEN LV5NM ELSE '' END,'%') AS DEPT_NAME 
                    FROM common.idinfo_soshiki WHERE DEPT_CD LIKE '{$_POST["dept_cd"]}%'
                ) AS X ON k.tantouka collate utf8_unicode_ci like X.DEPT_NAME";
            $sort = "k.sortnoka,";
        } else {
            $sort = "";
        }
        if (isset($_SESSION["taskman"]["syainkbn"]) && $_SESSION["taskman"]["syainkbn"] === '0') {
            $syain_where .= " AND k.personaluse IS NULL";
        }
        $sql = "SELECT 
                    k.keynum,
                    k.task1,
                    k.sinseino,
                    k.progress AS kadai_progress,
                    s.storyno,
                    s.title AS story_title,
                    s.start_yotei,
                    s.end_yotei,
                    s.color,
                    s.syaincd,
                    s.progress AS story_progress,
                    m.user_name,
                    t.taskno,
                    t.title AS task_title,
                    t.progress AS task_progress,
                    DATE_FORMAT(n.work_syori,'%Y/%m/%d') AS work_syori,
                    n.work_time,
                    n.memo,
                    y.yotei,
                    y.schdule_ym
                FROM kadai AS k
                    INNER JOIN stories AS s ON s.keynum = k.keynum
                    INNER JOIN tasks AS t ON t.keynum = k.keynum AND t.storyno = s.storyno
                    LEFT JOIN nippo AS n ON n.keynum = k.keynum AND n.storyno = s.storyno AND n.taskno = t.taskno
                    LEFT JOIN schedule.v_member AS m ON m.syaincd = s.syaincd
                    LEFT JOIN (
                        SELECT syaincd,group_concat(yotei_var) AS yotei,group_concat(schdule_ym) AS schdule_ym
                        FROM schedule.schedule WHERE schdule_ym between '{$str_day}' AND '{$end_day}' GROUP BY syaincd
                        ) AS y ON y.syaincd = s.syaincd
                    {$syozoku_join}         
                WHERE k.jyotai IN (1,2)
                AND s.end_yotei > '{$str_day}' 
                AND s.start_yotei < '{$end_day}'
                {$syain_where}
                ORDER BY k.important DESC,IF(k.progress=100,1,0), k.keynum, IF(s.progress=100,1,0), s.sortno, s.storyno, IF(t.progress=100,1,0), t.sortno, t.taskno";
        $data["sql"] = $sql;
        $oldkeynum = 0;
        $kcnt = 0;
        $data["data"]["monthkei"] = 0;
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            if ($oldkeynum !== $row["keynum"]) {
                $data["data"]["kadai"][$kcnt] = array(
                    "keynum" => $row["keynum"],
                    "kadai_title" => $row["task1"],
                    "kadai_kei" => 0,
                    "sinseino" => $row["sinseino"] === null ? "" : "［".$row["sinseino"]."］",
                    "kadai_comp" => ($row["kadai_progress"] === "100" ? "comp2":""),
                    // "important" => $row["important"],
                    // "important_css" => $row["important_css"]
                );
                $kcnt++;
                $oldkeynum = $row["keynum"];
                $oldstoryno = 0;
                $scnt = 0;
            }
            if ($row["storyno"] !== null && $oldstoryno !== $row["storyno"]) {
                $yotei = array_fill(0, $data["daycnt"], 1);
                if ($row["yotei"] !== null) {
                    $wyotei = explode(",",$row["yotei"]);
                    $schdule_ym = explode(",",str_replace("-","/",$row["schdule_ym"]));
                    $si = $schdule_ym[0] === $str_day ? 0 : ($schdule_ym[0] === $_POST["syori_ym"] ? $snissu : $snissu + $mnissu);
                    for ($i=0; $i<count($wyotei); $i++) {
                        $yotei[$si] = (($wyotei[$i] >= "100" && $wyotei[$i] <= "103") || $wyotei[$i] === "107" || $wyotei[$i] === "108" || $wyotei[$i] === "112" || $wyotei[$i] === "114") ? 1 : 0;
                        $si++;
                    }
                }
                $data["data"]["kadai"][$kcnt-1]["schdule_story"][$scnt] = array(
                    "storyno" => $row["storyno"],
                    "story_title" => $row["story_title"],
                    "start_yotei" => str_replace("-","/",$row["start_yotei"]),
                    "end_yotei" => str_replace("-","/",$row["end_yotei"]),
                    "color" => $row["color"],
                    "story_kei" => 0,
                    "kyuka" => $yotei,
                    "user_name" => "［".$row["user_name"]."］",
                    "story_comp" => ($row["story_progress"] === "100" ? "comp2":""),
                );
                $scnt++;
                $oldstoryno = $row["storyno"];
                $oldtaskno = 0;
                $tcnt = 0;
            }
            if ($row["taskno"] !== null && $oldtaskno !== $row["taskno"]) {
                $data["data"]["kadai"][$kcnt-1]["schdule_story"][$scnt-1]["schdule_task"][$tcnt] = array(
                    "taskno" => $row["taskno"],
                    "task_title" => $row["task_title"],
                    "task_comp" => ($row["task_progress"] === "100" ? "comp2":""),
                    "task_kei" => 0
                );
                $oldtaskno = $row["taskno"];
                $tcnt++;
            }
            if ($row["work_syori"] !== null) {
                if ($str_day <= $row["work_syori"] && $end_day >= $row["work_syori"]) {
                    $data["data"]["kadai"][$kcnt-1]["schdule_story"][$scnt-1]["schdule_task"][$tcnt-1]["nippo"][$row["work_syori"]] = $row["work_time"] === "0.0" ? "" : $row["work_time"];
                    $data["data"]["kadai"][$kcnt-1]["schdule_story"][$scnt-1]["schdule_task"][$tcnt-1]["memo"][$row["work_syori"]] = $row["memo"];
                }
                // 当月の工数合計
                if (substr($row["work_syori"],0,7) === substr($_POST["syori_ym"],0,7)) {
                    if (isset($_POST["syaincd"]) && $_POST["syaincd"] !== "0") {
                        if ($_POST["syaincd"] === $row["syaincd"]) {
                            $data["data"]["monthkei"] += $row["work_time"];
                        }
                    } else {
                        $data["data"]["monthkei"] += $row["work_time"];
                    }
                }
                $data["data"]["kadai"][$kcnt-1]["kadai_kei"] += $row["work_time"];
                $data["data"]["kadai"][$kcnt-1]["schdule_story"][$scnt-1]["story_kei"] += $row["work_time"];
                $data["data"]["kadai"][$kcnt-1]["schdule_story"][$scnt-1]["schdule_task"][$tcnt-1]["task_kei"] += $row["work_time"];
            }
        }
        $data["code"] = "OK";
        echo json_encode($data);
    }
    // 作業時間・メモ更新
    function cellUpdate() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        if ($_POST["work_time"] === "") {
            $_POST["work_time"] = "0";
        }
        try {
            $con->pdo->beginTransaction();
            if ($_POST["work_time"] === "0" && $_POST["memo"] === "") {
                $sql = "DELETE FROM nippo
                        WHERE keynum = {$_POST["keynum"]}
                          AND storyno = {$_POST["storyno"]}
                          AND taskno = {$_POST["taskno"]}
                          AND work_syori = '{$_POST["work_syori"]}'
                        ";
            } else {
                $sql = "INSERT INTO nippo (
                            keynum,
                            storyno,
                            taskno,
                            work_syori,
                            work_time,
                            memo
                        ) VALUES (
                            {$_POST["keynum"]},
                            {$_POST["storyno"]},
                            {$_POST["taskno"]},
                            '{$_POST["work_syori"]}',
                            {$_POST["work_time"]},
                            '{$_POST["memo"]}'
                        ) ON DUPLICATE KEY UPDATE
                            work_time = {$_POST["work_time"]},
                            memo = '{$_POST["memo"]}'";
            }
            if ($con->pdo->exec($sql) === false) {
                throw new Exception($sql);
            }
            $con->pdo->commit();
            $data["code"] = "OK";
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);    
    }
    // CSV
    function createCSV() {
        $ex_tmp_path = $_SERVER["DOCUMENT_ROOT"] ."/tmp/";
        $fname = $_SESSION["taskman"]["user"]."_work{$_POST["csv_type"]}_".str_replace("/","",$_POST["datef"])."-".str_replace("/","",$_POST["datet"]).".csv";
        // フォルダ内ＣＳＶファイルの削除
        $dir = glob($ex_tmp_path.$_SESSION["taskman"]["user"]."*.csv");
        foreach ($dir as $file){
            @unlink($file);
        }
        $tmp_file = fopen($ex_tmp_path.$fname,"w+");//保存ファイルを開く
        $data = array("code"=>"ERROR");
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        
        $syain_where = "";
        $syozoku_join = "";
        if (isset($_POST["syaincd"]) && $_POST["syaincd"] !== "0") {
            $syain_where = 
                "AND s.syaincd = '{$_POST["syaincd"]}'";
            $sort = "k.sortno,";
        } elseif (isset($_POST["dept_cd"]) && $_POST["dept_cd"] !== "0") {
            $data["syain_list"] = $this->getSyain($con,$_POST["dept_cd"]);
            $syozoku_join = 
                "INNER JOIN (
                    SELECT CONCAT('%',CASE DEPT_LEVEL WHEN 2 THEN LV2NM WHEN 3 THEN LV3NM WHEN 4 THEN LV4NM WHEN 5 THEN LV5NM ELSE '' END,'%') AS DEPT_NAME 
                    FROM common.idinfo_soshiki WHERE DEPT_CD LIKE '{$_POST["dept_cd"]}%'
                ) AS X ON k.tantouka collate utf8_unicode_ci like X.DEPT_NAME";
            $sort = "k.sortnoka,";
        } else {
            $sort = "";
        }
        $cnt = 0;
        if ($_POST["csv_type"] === "1") {
            $herder="申請No,プロジェクト名,担当者名,開始日,終了日,稼働日,作業区分,時間,本数,結果";
            $herder = mb_convert_encoding($herder,"SJIS-win","UTF-8")."\r\n";//shift-jisへエンコード
            fwrite($tmp_file,$herder);//ヘッダを書き込む
    
            $sql = "SELECT 
                        k.system_no,
                        i.system_item,
                        m.user_name,
                        DATE_FORMAT(i.kaishi,'%Y/%m/%d') AS kaishi,
                        DATE_FORMAT(i.kanryo,'%Y/%m/%d') AS kanryo,
                        DATE_FORMAT(i.kado,'%Y/%m/%d') AS kado,
                        i.skbn,
                        SUM(n.work_time) AS work_time,
                        0,
                        '〇'
                    FROM kadai AS k
                        INNER JOIN stories AS s ON s.keynum = k.keynum
                        INNER JOIN tasks AS t ON t.keynum = k.keynum AND t.storyno = s.storyno
                        INNER JOIN nippo AS n ON n.keynum = k.keynum AND n.storyno = s.storyno AND n.taskno = t.taskno
                        INNER JOIN it_system AS i ON i.system_no = k.system_no
                        LEFT JOIN schedule.v_member AS m ON m.syaincd = s.syaincd
                        {$syozoku_join}         
                    WHERE k.jyotai < 8
                    AND n.work_syori between '{$_POST["datef"]}' AND '{$_POST["datet"]}'
                    {$syain_where}
                    GROUP BY k.keynum,s.syaincd
                    ORDER BY {$sort} k.important DESC,k.keynum, k.jyotai";
            $ds = $con->pdo->query($sql) or die($sql);
            while ($row = $ds->fetch(PDO::FETCH_NUM)) {
                mb_convert_variables("SJIS-win","UTF-8",$row);
                fputcsv($tmp_file,$row);
                $cnt++;
            }
        } else {
            $sql = "SELECT k.system_no 
                    FROM kadai AS k
                        INNER JOIN stories AS s ON s.keynum = k.keynum
                        INNER JOIN tasks AS t ON t.keynum = k.keynum AND t.storyno = s.storyno
                        INNER JOIN nippo AS n ON n.keynum = k.keynum AND n.storyno = s.storyno AND n.taskno = t.taskno
                        LEFT JOIN schedule.v_member AS m ON m.syaincd = s.syaincd
                        {$syozoku_join}         
                    WHERE k.jyotai < 8
                    AND n.work_syori between '{$_POST["datef"]}' AND '{$_POST["datet"]}'
                    {$syain_where}
                    GROUP BY k.system_no
                    ORDER BY k.keynum";
            $ds = $con->pdo->query($sql) or die($sql);
            $sel = "";
            $title = "";
            while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
                if ($sel !== "") {
                    $sel .= ",";
                    $title .= ",";
                }
                $sel .= "IFNULL(SUM(IF(k.system_no = '{$row["system_no"]}',n.work_time,0)),0)";
                $title .= $row["system_no"];
            }
            if ($title === "") {
                echo json_encode(array("cnt"=>0));
                exit;
            }
            $herder="日付,".$title;
            $herder = mb_convert_encoding($herder,"SJIS-win","UTF-8")."\r\n";//shift-jisへエンコード
            fwrite($tmp_file,$herder);//ヘッダを書き込む

            for ($wdate = strtotime($_POST["datef"]); $wdate <= strtotime($_POST["datet"]); $wdate = strtotime(date("Y/m/d",$wdate)." +1 Day")) {
                $sql = "SELECT
                            '".date("Y/m/d",$wdate)."',
                            {$sel}
                        FROM kadai AS k
                            INNER JOIN stories AS s ON s.keynum = k.keynum
                            INNER JOIN tasks AS t ON t.keynum = k.keynum AND t.storyno = s.storyno
                            INNER JOIN nippo AS n ON n.keynum = k.keynum AND n.storyno = s.storyno AND n.taskno = t.taskno
                            LEFT JOIN schedule.v_member AS m ON m.syaincd = s.syaincd
                            {$syozoku_join}         
                        WHERE k.jyotai < 8
                        AND n.work_syori = '".date("Y/m/d",$wdate)."'
                        {$syain_where}
                        
                        ";
                $ds = $con->pdo->query($sql) or die($sql);
                if ($row = $ds->fetch(PDO::FETCH_NUM)) {
                    mb_convert_variables("SJIS-win","UTF-8",$row);
                    fputcsv($tmp_file,$row);
                }
                $cnt++;
            }
        }
        fclose($tmp_file);
        $data = array(
            "code"=>"OK",
            "filename"=>"../tmp/".$fname,
            "cnt"=>$cnt
        );
        echo json_encode($data);        
    }
    // -----------------------------------------------------------------------------------------
    // ここから課題一覧
    // -----------------------------------------------------------------------------------------
    function loadKadai() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");

        $data["data"] = array();
        $str_day = $_POST["str_day"];
        $str_day_t = strtotime($str_day);
        $end_day = $_POST["end_day"];
        $end_day_t = strtotime($end_day);
        if ($_POST["sel_month"] === "1") {
            // 祝祭日テーブル読込
            $sql = "SELECT holiday,holiday_biko,toban FROM schedule.holiday 
                    WHERE holiday between '{$str_day}' AND '{$end_day}'";
            $ds = $con->pdo->query($sql);
            $data["holiday"] = array_fill(0,substr($end_day,-2),0);
            while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
                $data["holiday"][date("d",strtotime($row["holiday"]))-1] = 1;
            }
        }
        $syain_where = "";
        $syozoku_join = "";
        if ($_POST["syaincd"] !== "0") {
            $syain_where = 
                "AND (s.syaincd = '{$_POST["syaincd"]}' OR k.syutantou LIKE '%{$_POST["syainnm"]}%')";
        } elseif ($_POST["dept_cd"] !== "0" && trim($_POST["dept_cd"]) !== "") {
            $data["syain_list"] = $this->getSyain($con,$_POST["dept_cd"]);
            $syozoku_join = 
                "INNER JOIN (
                    SELECT CONCAT('%',CASE DEPT_LEVEL WHEN 2 THEN LV2NM WHEN 3 THEN LV3NM WHEN 4 THEN LV4NM WHEN 5 THEN LV5NM ELSE '' END,'%') AS DEPT_NAME 
                    FROM common.idinfo_soshiki WHERE DEPT_CD LIKE '{$_POST["dept_cd"]}%'
                ) AS X ON k.tantouka collate utf8_unicode_ci like X.DEPT_NAME";
        }
        if (isset($_SESSION["taskman"]["syainkbn"]) && $_SESSION["taskman"]["syainkbn"] === '0') {
            $syain_where .= " AND k.personaluse IS NULL";
        }
        $sql = "SELECT 
                    k.keynum,
                    k.task1,
                    k.sinseino,
                    k.progress,
                    CASE k.important WHEN 3 THEN '緊急' WHEN 2 THEN '高' WHEN 1 THEN '中' ELSE '低' END AS important,
                    CASE k.important WHEN 3 THEN 'red' WHEN 2 THEN 'orange' WHEN 1 THEN 'blue' ELSE 'green' END AS important_css,
                    DATE_FORMAT(k.start_yotei,'%Y/%m/%d') AS start_yotei,
                    DATE_FORMAT(k.end_yotei,'%Y/%m/%d') AS end_yotei,
                    -- DATE_FORMAT(MIN(n.work_syori),'%y/%m/%d') AS kadai_start_jisseki,
                    -- DATE_FORMAT((IF(MAX(n.work_syori)=MIN(n.work_syori),NULL,MAX(n.work_syori))),'%y%m/%d') AS kadai_end_jisseki,
                    k.status,
                    -- DATE_FORMAT((SELECT MIN(work_syori) FROM nippo WHERE keynum = k.keynum),'%m/%d') AS kadai_start_jisseki,
                    -- DATE_FORMAT((SELECT IF(MAX(work_syori)=MIN(work_syori),NULL,MAX(work_syori)) FROM nippo WHERE keynum = k.keynum),'%m/%d') AS kadai_end_jisseki,
                    SUM(n.work_time) AS work_time
                FROM kadai AS k
                    LEFT JOIN stories AS s ON s.keynum = k.keynum
                    LEFT JOIN tasks AS t ON t.keynum = k.keynum AND t.storyno = s.storyno
                    LEFT JOIN nippo AS n ON n.keynum = k.keynum AND n.storyno = s.storyno AND n.taskno = t.taskno
                    {$syozoku_join}         
                WHERE k.jyotai < 2
                AND (k.end_yotei > '{$str_day}' OR k.end_yotei IS NULL)
                AND (k.start_yotei < '{$end_day}' OR k.start_yotei IS NULL)
                {$syain_where}
                GROUP BY k.keynum
                ORDER BY k.important DESC,IF(k.progress=100,1,0),k.keynum";
        $data["data"]["monthkei"] = 0;
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $yk = "";
            if ($row["start_yotei"] !== null || $row["end_yotei"] !== null) {
                $yk = "～";
            }            
            $data["data"]["head"][] = array(
                "keynum" => $row["keynum"],
                "kadai_title" => $row["task1"],
                "sinseino" => $row["sinseino"] === null ? "" : $row["sinseino"],
                "important" => $row["important"],
                "important_css" => $row["important_css"],
                "kikan" => ($row["start_yotei"] === null ? "" : $row["start_yotei"]).$yk.
                                    ($row["end_yotei"] === null ? "" : $row["end_yotei"]),
                "progress" => $row["progress"]."%",
                "status" => $row["status"],
                "color" => ($row["end_yotei"] !== null && $row["end_yotei"] < date("Y/m/d")
                            ? "fred"
                            : ($row["end_yotei"] !== null && $row["end_yotei"] < date("Y/m/d",strtotime("1 week"))
                                ? "fblue"
                                : ""))
            );
            $left = 0;
            $width = 0;
            if ($row["start_yotei"] !== null && $row["end_yotei"] !== null) {
                $w_str = strtotime($row["start_yotei"]);
                $w_end = strtotime($row["end_yotei"]);
                $nissu_s = ($w_str - $str_day_t) / (60 * 60 * 24);
                $nissu_e = ($w_end - $w_str) / (60 * 60 * 24) + 1;
                $left = ($nissu_s * $_POST["width"])."%";
                $width = ($nissu_e * $_POST["width"])."%";
            }
            $data["data"]["body"][] = array(
                "progress" => $row["progress"]."%",
                "left" => $left,
                "width" => $width
            );
        }
        $data["code"] = "OK";
        echo json_encode($data);
    }
}
?>