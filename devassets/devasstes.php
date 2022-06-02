<?php
$my = new MyClass();
if (!method_exists($my,$_GET["func"])) exit;
session_start();
$my->$_GET["func"]();    //各ファンクションのコール
// -----------------------------------------------------------------------------------------
class MyClass {
    function init() {

        $data["code"] = "OK";
        echo json_encode($data);
    }
    // システム一覧読込
    function loadsystem() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    s.sys_key,
                    s.system_name,
                    s.gaiyo,
                    s.kado_jyokyo,
                    s.start_date,
                    s.end_date,
                    s.dev_busho,
                    s.dev_tanto,
                    s.unyo_busho,
                    s.unyo_tanto,
                    s.dev_env,
                    s.dev_lang,
                    s.dev_kbn,
                    s.url,
                    s.save_folder,
                    s.biko,
                    (SELECT group_concat(filename separator '\n') FROM t_system_file WHERE sys_key = s.sys_key) AS temp_file
                FROM t_system AS s
                WHERE s.del_flg = 0".
                (isset($_POST["sys_key"]) ? " AND s.sys_key = {$_POST["sys_key"]} " : " ").
                "ORDER BY s.sys_key DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "id" => $row["sys_key"],
                "system_name" => $row["system_name"],
                "gaiyo" => $row["gaiyo"],
                "kado_jyokyo" => $row["kado_jyokyo"],
                "start_date" => str_replace("-","/",$row["start_date"]),
                "end_date" => str_replace("-","/",$row["end_date"]),
                "dev_busho" => $row["dev_busho"],
                "dev_tanto" => $row["dev_tanto"],
                "unyo_busho" => $row["unyo_busho"],
                "unyo_tanto" => $row["unyo_tanto"],
                "dev_env" => $row["dev_env"] === "" ? "" : explode(",",$row["dev_env"]),
                "dev_lang" => $row["dev_lang"] === "" ? "" : explode(",",$row["dev_lang"]),
                "dev_kbn" => $row["dev_kbn"],
                "url" => $row["url"],
                "save_folder" => $row["save_folder"],
                "biko" => $row["biko"],
                "temp_file" => $row["temp_file"]
            );
        }
        echo json_encode($data);
    }
    // システム登録
    function systemReg() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            if ($_POST["sys_key"] === "新規")  {
                $sql =
                    "INSERT INTO t_system (
                        system_name,
                        gaiyo,
                        kado_jyokyo,
                        start_date,
                        end_date,
                        dev_busho,
                        dev_tanto,
                        unyo_busho,
                        unyo_tanto,
                        dev_env,
                        dev_lang,
                        dev_kbn,
                        url,
                        save_folder,
                        biko,
                        add_date,
                        add_tan,
                        upd_tan
                    ) VALUES (
                        :system_name,
                        :gaiyo,
                        :kado_jyokyo,
                        :start_date,
                        :end_date,
                        :dev_busho,
                        :dev_tanto,
                        :unyo_busho,
                        :unyo_tanto,
                        :dev_env,
                        :dev_lang,
                        :dev_kbn,
                        :url,
                        :save_folder,
                        :biko,
                        now(),
                        '{$_SESSION["devassets"]["user"]}',
                        '{$_SESSION["devassets"]["user"]}'
                    )";
                $sth = $con->pdo->prepare($sql);
            } else {
                $sql =
                    "UPDATE t_system SET
                        system_name = :system_name,
                        gaiyo = :gaiyo,
                        kado_jyokyo = :kado_jyokyo,
                        start_date = :start_date,
                        end_date = :end_date,
                        dev_busho = :dev_busho,
                        dev_tanto = :dev_tanto,
                        unyo_busho = :unyo_busho,
                        unyo_tanto = :unyo_tanto,
                        dev_env = :dev_env,
                        dev_lang = :dev_lang,
                        dev_kbn = :dev_kbn,
                        url = :url,
                        save_folder = :save_folder,
                        biko = :biko,
                        upd_tan = '{$_SESSION["devassets"]["user"]}'
                    WHERE sys_key = :sys_key";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':sys_key', $_POST["sys_key"], PDO::PARAM_INT);
            }
            $sth->bindValue(':system_name', $_POST["system_name"], PDO::PARAM_STR);
            $sth->bindValue(':gaiyo', $_POST["gaiyo"], PDO::PARAM_STR);
            $sth->bindValue(':kado_jyokyo', $_POST["kado_jyokyo"], PDO::PARAM_INT);
            $sth->bindValue(':start_date',  $_POST["start_date"] === "" ? null :date("Y-m-d", strtotime($_POST["start_date"])), PDO::PARAM_STR);
            $sth->bindValue(':end_date',  $_POST["end_date"] === "" ? null : date("Y-m-d", strtotime($_POST["end_date"])), PDO::PARAM_STR);
            $sth->bindValue(':dev_busho', $_POST["dev_busho"], PDO::PARAM_STR);
            $sth->bindValue(':dev_tanto', $_POST["dev_tanto"], PDO::PARAM_STR);
            $sth->bindValue(':unyo_busho', $_POST["unyo_busho"], PDO::PARAM_STR);
            $sth->bindValue(':unyo_tanto', $_POST["unyo_tanto"], PDO::PARAM_STR);
            $sth->bindValue(':dev_env', $_POST["dev_env"], PDO::PARAM_STR);
            $sth->bindValue(':dev_lang', $_POST["dev_lang"], PDO::PARAM_STR);
            $sth->bindValue(':dev_kbn', $_POST["dev_kbn"], PDO::PARAM_INT);
            $sth->bindValue(':url', $_POST["url"], PDO::PARAM_STR);
            $sth->bindValue(':save_folder', $_POST["save_folder"], PDO::PARAM_STR);
            $sth->bindValue(':biko', $_POST["biko"], PDO::PARAM_STR);
            if ($sth->execute() === false) {
                throw new Exception($sql);
            }
            if ($_POST["sys_key"] === "新規") {
                $sql = "SELECT last_insert_id() AS new_key FROM t_system";
                $ds = $con->pdo->query($sql) or die($sql);
                $row = $ds->fetch(PDO::FETCH_ASSOC);
                $data["sys_key"] = $row["new_key"];
                $_POST["sys_key"] = $row["new_key"];
            }
            // システムー＞サーバー一覧削除
            if ($_POST["sys_key"] !== "" && $_POST["sys_svr_del"] !== "") {
                $sys_svr_del = json_decode($_POST["sys_svr_del"]);
                $sql = "UPDATE t_system_server SET del_flg = 1
                        WHERE sys_key = {$_POST["sys_key"]}
                        AND svr_key IN (".implode(",",$sys_svr_del).")";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
            }
            if ($_POST["sys_svr"] !== "") {
                $sys_svr = json_decode($_POST["sys_svr"]);

                for ($i=0; $i<count($sys_svr); $i++) {
                    $val = (array) $sys_svr[$i];
                    $svr_key = (array) $val["svr_key"];
                    $val["db_memo"] = (array) $val["db_memo"];
                    $sql = "INSERT INTO t_system_server (
                                sys_key,
                                svr_key,
                                db_memo,
                                biko,
                                upd_date,
                                upd_tan
                            ) VALUES (
                                {$_POST["sys_key"]},
                                {$svr_key["value"]},
                                :db_memo,
                                :biko,
                                now(),
                                '{$_SESSION["devassets"]["user"]}'
                            ) ON DUPLICATE KEY UPDATE
                                db_memo = :db_memo,
                                biko = :biko,
                                upd_date = now(),
                                upd_tan = '{$_SESSION["devassets"]["user"]}',
                                del_flg = 0";
                    $sth = $con->pdo->prepare($sql);
                    $sth->bindValue(':db_memo', implode(",",$val["db_memo"]), PDO::PARAM_STR);
                    $sth->bindValue(':biko', $val["biko"], PDO::PARAM_STR);
                    if ($sth->execute() === false) {
                        throw new Exception($sql);
                    }
                }
            }
            // システムー＞リリース一覧削除
            if ($_POST["sys_key"] !== "" && $_POST["sys_rel_del"] !== "") {
                $sys_rel_del = json_decode($_POST["sys_rel_del"]);
                for ($i=0; $i<count($sys_rel_del); $i++) {
                    $sys_rel_del[$i] = intval(str_replace("R","",$sys_rel_del[$i]));
                }
                $sql = "UPDATE t_release SET del_flg = 1
                        WHERE sys_key = {$_POST["sys_key"]}
                        AND release_no IN (".implode(",",$sys_rel_del).")";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
                }
            }
            if ($_POST["sys_rel"] !== "[]") {
                $sys_rel = json_decode($_POST["sys_rel"]);
                for ($i=0; $i<count($sys_rel); $i++) {
                    $val = (array) $sys_rel[$i];
                    if ($val["release_no"] === "") {
                        $sql = "INSERT INTO t_release (
                                    sys_key,
                                    release_date,
                                    version,
                                    system_no,
                                    task1,
                                    naiyo,
                                    tanto,
                                    kakunin,
                                    biko,
                                    upd_tan
                                ) VALUES (
                                    :sys_key,
                                    :release_date,
                                    :version,
                                    :system_no,
                                    :task1,
                                    :naiyo,
                                    :tanto,
                                    :kakunin,
                                    :biko,
                                    '{$_SESSION["devassets"]["user"]}'
                                )";
                        $sth = $con->pdo->prepare($sql);
                    } else {
                        $release_no = intval(str_replace("R","",$val["release_no"]));
                        $sql = "UPDATE t_release SET
                                    sys_key = :sys_key,
                                    release_date = :release_date,
                                    version = :version,
                                    system_no = :system_no,
                                    task1 = :task1,
                                    naiyo = :naiyo,
                                    tanto = :tanto,
                                    kakunin = :kakunin,
                                    biko = :biko,
                                    upd_tan = '{$_SESSION["devassets"]["user"]}'
                                WHERE release_no = :release_no
                                ";
                        $sth = $con->pdo->prepare($sql);
                        $sth->bindValue(':release_no', $release_no, PDO::PARAM_INT);
                    }
                    $sth->bindValue(':sys_key', $_POST["sys_key"], PDO::PARAM_INT);
                    $sth->bindValue(':release_date',  $val["release_date"] === "" ? null : date("Y-m-d", strtotime($val["release_date"])), PDO::PARAM_STR);
                    $sth->bindValue(':version', $val["version"], PDO::PARAM_STR);
                    $sth->bindValue(':system_no', $val["system_no"], PDO::PARAM_STR);
                    $sth->bindValue(':task1', $val["task1"] === null ? "" : $val["task1"], PDO::PARAM_STR);
                    $sth->bindValue(':naiyo', $val["naiyo"], PDO::PARAM_STR);
                    $sth->bindValue(':tanto', $val["tanto"], PDO::PARAM_STR);
                    $sth->bindValue(':kakunin', $val["kakunin"], PDO::PARAM_STR);
                    $sth->bindValue(':biko', $val["biko"], PDO::PARAM_STR);
                    if ($sth->execute() === false) {
                        throw new Exception($sql);
                    }
                    if ($val["release_no"] === "") {
                        $sql = "SELECT last_insert_id() AS release_no FROM t_release";
                        $ds = $con->pdo->query($sql) or die($sql);
                        $row = $ds->fetch(PDO::FETCH_ASSOC);
                        $data["release_no"][] = array(
                            "no" => $i,
                            "release_no" => "R".str_pad($row["release_no"], 5, 0, STR_PAD_LEFT)
                        );
                    }
                }
            }
            if ($_POST["sys_trbl"] !== "[]") {
                $sys_trbl = json_decode($_POST["sys_trbl"]);
                for ($i=0; $i<count($sys_trbl); $i++) {
                    $val = (array) $sys_trbl[$i];
                    if ($val["trouble_no"] === "") {
                        $sql = "INSERT INTO t_trouble (
                                    sys_key,
                                    hassei_date,
                                    status,
                                    kihyo,
                                    level,
                                    genin_busho,
                                    naiyo,
                                    genin,
                                    taio_date,
                                    taio,
                                    taio_zantei,
                                    taio_kokyu,
                                    hokoku,
                                    biko,
                                    upd_tan
                                ) VALUES (
                                    :sys_key,
                                    :hassei_date,
                                    :status,
                                    :kihyo,
                                    :level,
                                    :genin_busho,
                                    :naiyo,
                                    :genin,
                                    :taio_date,
                                    :taio,
                                    :taio_zantei,
                                    :taio_kokyu,
                                    :hokoku,
                                    :biko,
                                    '{$_SESSION["devassets"]["user"]}'
                                )";
                        $sth = $con->pdo->prepare($sql);
                    } else {
                        $trouble_no = intval(str_replace("T","",$val["trouble_no"]));
                        $sql = "UPDATE t_trouble SET
                                    sys_key = :sys_key,
                                    hassei_date = :hassei_date,
                                    status = :status,
                                    kihyo = :kihyo,
                                    level = :level,
                                    genin_busho = :genin_busho,
                                    naiyo = :naiyo,
                                    genin = :genin,
                                    taio_date = :taio_date,
                                    taio = :taio,
                                    taio_zantei = :taio_zantei,
                                    taio_kokyu = :taio_kokyu,
                                    hokoku = :hokoku,
                                    biko = :biko,
                                    upd_tan = '{$_SESSION["devassets"]["user"]}'
                                WHERE trouble_no = :trouble_no
                                ";
                        $sth = $con->pdo->prepare($sql);
                        $sth->bindValue(':trouble_no', $trouble_no, PDO::PARAM_INT);
                    }
                    $sth->bindValue(':sys_key', $_POST["sys_key"], PDO::PARAM_INT);
                    $sth->bindValue(':hassei_date',  $val["hassei_date"] === "" ? null : date("Y-m-d", strtotime($val["hassei_date"])), PDO::PARAM_STR);
                    $sth->bindValue(':status', $val["status"], PDO::PARAM_INT);
                    $sth->bindValue(':kihyo', $val["kihyo"], PDO::PARAM_STR);
                    $sth->bindValue(':level', $val["level"], PDO::PARAM_INT);
                    $sth->bindValue(':genin_busho', $val["genin_busho"], PDO::PARAM_INT);
                    $sth->bindValue(':naiyo', $val["naiyo"], PDO::PARAM_STR);
                    $sth->bindValue(':genin', $val["genin"] === null ? "" : $val["genin"], PDO::PARAM_STR);
                    $sth->bindValue(':taio_date',  $val["taio_date"] === "" ? null : date("Y-m-d", strtotime($val["taio_date"])), PDO::PARAM_STR);
                    $sth->bindValue(':taio', $val["taio"], PDO::PARAM_STR);
                    $sth->bindValue(':taio_zantei', $val["taio_zantei"] === null ? "" : $val["taio_zantei"], PDO::PARAM_STR);
                    $sth->bindValue(':taio_kokyu', $val["taio_kokyu"] === null ? "" : $val["taio_kokyu"], PDO::PARAM_STR);
                    $sth->bindValue(':hokoku', $val["hokoku"], PDO::PARAM_STR);
                    $sth->bindValue(':biko', $val["biko"], PDO::PARAM_STR);
                    if ($sth->execute() === false) {
                        throw new Exception($sql);
                    }
                    if ($val["trouble_no"] === "") {
                        $sql = "SELECT last_insert_id() AS trouble_no FROM t_trouble";
                        $ds = $con->pdo->query($sql) or die($sql);
                        $row = $ds->fetch(PDO::FETCH_ASSOC);
                        $data["trouble_no"][] = array(
                            "no" => $i,
                            "trouble_no" => "T".str_pad($row["trouble_no"], 5, 0, STR_PAD_LEFT)
                        );
                    }
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
    function systemRegAll() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            for ($i=0; $i<count($_POST["data"]); $i++) {
                $sql =
                    "UPDATE t_system SET
                        system_name = :system_name,
                        gaiyo = :gaiyo,
                        kado_jyokyo = :kado_jyokyo,
                        dev_busho = :dev_busho,
                        dev_tanto = :dev_tanto,
                        unyo_busho = :unyo_busho,
                        unyo_tanto = :unyo_tanto,
                        dev_env = :dev_env,
                        dev_lang = :dev_lang,
                        dev_kbn = :dev_kbn,
                        url = :url,
                        save_folder = :save_folder,
                        biko = :biko,
                        upd_date = now(),
                        upd_tan = '{$_SESSION["devassets"]["user"]}'
                    WHERE sys_key = :sys_key";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':sys_key', $_POST["data"][$i]["id"], PDO::PARAM_INT);
                $sth->bindValue(':system_name', $_POST["data"][$i]["system_name"], PDO::PARAM_STR);
                $sth->bindValue(':gaiyo', $_POST["data"][$i]["gaiyo"], PDO::PARAM_STR);
                $sth->bindValue(':kado_jyokyo', $_POST["data"][$i]["kado_jyokyo"], PDO::PARAM_INT);
                $sth->bindValue(':dev_busho', $_POST["data"][$i]["dev_busho"], PDO::PARAM_STR);
                $sth->bindValue(':dev_tanto', $_POST["data"][$i]["dev_tanto"], PDO::PARAM_STR);
                $sth->bindValue(':unyo_busho', $_POST["data"][$i]["unyo_busho"], PDO::PARAM_STR);
                $sth->bindValue(':unyo_tanto', $_POST["data"][$i]["unyo_tanto"], PDO::PARAM_STR);
                $sth->bindValue(':dev_env', implode(",",$_POST["data"][$i]["dev_env"]), PDO::PARAM_STR);
                $sth->bindValue(':dev_lang', implode(",",$_POST["data"][$i]["dev_lang"]), PDO::PARAM_STR);
                $sth->bindValue(':dev_kbn', $_POST["data"][$i]["dev_kbn"], PDO::PARAM_INT);
                $sth->bindValue(':url', $_POST["data"][$i]["url"], PDO::PARAM_STR);
                $sth->bindValue(':save_folder', $_POST["data"][$i]["save_folder"], PDO::PARAM_STR);
                $sth->bindValue(':biko', $_POST["data"][$i]["biko"], PDO::PARAM_STR);
                if ($sth->execute() === false) {
                    throw new Exception($sql);
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
    // システム削除
    function deleteSystem() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            $sql =
                "UPDATE t_system SET
                    del_flg = 1,
                    upd_tan = '{$_SESSION["devassets"]["user"]}'
                WHERE sys_key = :sys_key";
            $sth = $con->pdo->prepare($sql);
            $sth->bindValue(':sys_key', $_POST["sys_key"], PDO::PARAM_INT);
            if ($sth->execute() === false) {
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
    // システム内サーバー一覧読込
    function loadSystemServer() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");
        if ($_POST["sys_key"] !== "新規") {
            $sql = "SELECT
                        s.svr_key,
                        s.host_name,
                        s.other_name,
                        s.gaiyo,
                        (SELECT group_concat(nm1 separator '\n') FROM m_code WHERE FIND_IN_SET(code,s.role) AND syubetu = 'devrole') AS role_name,
                        cd.nm1 AS db_type_name,
                        l.db_memo,
                        l.biko
                    FROM t_system_server AS l
                    INNER JOIN t_server AS s ON s.svr_key = l.svr_key
                    LEFT JOIN m_code AS cs ON cs.code = s.os AND cs.syubetu = 'devserver'
                    LEFT JOIN m_code AS cd ON cd.code = s.db_type AND cd.syubetu = 'devdb'
                    WHERE l.sys_key = {$_POST["sys_key"]} AND s.del_flg = 0 AND l.del_flg = 0
                    ORDER by s.host_name";
            $ds = $con->pdo->query($sql) or die($sql);
            while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
                $data["data"][] = array(
                    "no" => $row["svr_key"],
                    "svr_key" => array(
                        "value" => $row["svr_key"],
                        "label" => $row["host_name"]
                    ),
                    "other_name" => $row["other_name"],
                    "gaiyo" => $row["gaiyo"],
                    "role_name" => $row["role_name"],
                    "db_type_name" => $row["db_type_name"],
                    "db_memo" => $row["db_memo"] === "" ? "" : explode(",",$row["db_memo"]),
                    "biko" => $row["biko"]
                );
            }
        }
        echo json_encode($data);
    }
    // システム内リリース一覧読込
    function loadSystemRelease() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    r.release_no,
                    r.release_date,
                    r.tanto,
                    r.version,
                    r.system_no,
                    r.task1,
                    r.naiyo,
                    r.kakunin,
                    r.biko
                FROM t_release AS r
                WHERE r.sys_key = {$_POST["sys_key"]} AND r.del_flg = 0
                ORDER BY r.release_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "release_no" => "R".str_pad($row["release_no"], 5, 0, STR_PAD_LEFT),
                "release_date" => str_replace("-","/",$row["release_date"]),
                "tanto" => $row["tanto"],
                "version" => $row["version"],
                "system_no" => $row["system_no"],
                "task1" => $row["task1"],
                "naiyo" => $row["naiyo"],
                "kakunin" => $row["kakunin"],
                "biko" => $row["biko"]
            );
        }
        echo json_encode($data);
    }
    // システム内トラブル一覧読込
    function loadSystemTrouble() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    t.trouble_no,
                    t.hassei_date,
                    t.status,
                    t.kihyo,
                    t.level,
                    t.genin_busho,
                    t.naiyo,
                    t.genin,
                    t.taio_date,
                    t.taio,
                    t.taio_zantei,
                    t.taio_kokyu,
                    t.hokoku,
                    t.biko,
                    (SELECT group_concat(filename separator '\n') FROM t_trouble_file WHERE trouble_no = t.trouble_no) AS temp_file
                FROM t_trouble AS t
                WHERE t.sys_key = {$_POST["sys_key"]} AND t.del_flg = 0
                ORDER BY t.trouble_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "trouble_no" => "T".str_pad($row["trouble_no"], 5, 0, STR_PAD_LEFT),
                "hassei_date" => str_replace("-","/",$row["hassei_date"]),
                "status" => $row["status"],
                "kihyo" => $row["kihyo"],
                "level" => $row["level"],
                "genin_busho" => $row["genin_busho"],
                "naiyo" => $row["naiyo"],
                "genin" => $row["genin"],
                "taio_date" => str_replace("-","/",$row["taio_date"]),
                "taio" => $row["taio"],
                "taio_zantei" => $row["taio_zantei"],
                "taio_kokyu" => $row["taio_kokyu"],
                "hokoku" => $row["hokoku"],
                "biko" => $row["biko"],
                "temp_file" => $row["temp_file"]
            );
        }
        echo json_encode($data);
    }
    // システムCSV
    function systemCsv() {
        $ex_tmp_path = $_SERVER["DOCUMENT_ROOT"] ."/tmp/";
        $fname = $_SESSION["devassets"]["user"]."_system_".date("Ymd").".csv";
        // フォルダ内ＣＳＶファイルの削除
        $dir = glob($ex_tmp_path.$_SESSION["devassets"]["user"]."*.csv");
        foreach ($dir as $file){
            @unlink($file);
        }
        $tmp_file = fopen($ex_tmp_path.$fname,"w+");//保存ファイルを開く
        $data = array("code"=>"ERROR");
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $cnt = 0;
        $herder="No,システム名,概要,稼働開始日,稼働終了日,稼働状況,開発区分,情シス開発部署,情シス開発担当,運用部署,運用担当,開発環境,開発言語,URL/FILE,設計書フォルダ,備考,添付ファイル名,登録日,登録担当者,更新日,更新担当者";
        $herder = mb_convert_encoding($herder,"SJIS-win","UTF-8")."\r\n";//shift-jisへエンコード
        fwrite($tmp_file,$herder);//ヘッダを書き込む

        for ($i=0; $i<count($_SESSION["devassets"]["devapp"]); $i++) {
            $devenv[$_SESSION["devassets"]["devapp"][$i]["value"]] = $_SESSION["devassets"]["devapp"][$i]["label"];
        }
        for ($i=0; $i<count($_SESSION["devassets"]["devlang"]); $i++) {
            $devlang[$_SESSION["devassets"]["devlang"][$i]["value"]] = $_SESSION["devassets"]["devlang"][$i]["label"];
        }
        $sql = "SELECT
                    s.sys_key,
                    s.system_name,
                    s.gaiyo,
                    s.start_date,
                    s.end_date,
                    CASE s.kado_jyokyo WHEN 1 THEN '稼働中' WHEN 9 THEN '停止' ELSE '' END,
                    CASE s.dev_kbn WHEN 1 THEN '内製' WHEN 2 THEN '外注' ELSE '' END,
                    s.dev_busho,
                    s.dev_tanto,
                    s.unyo_busho,
                    s.unyo_tanto,
                    s.dev_env,
                    s.dev_lang,
                    s.url,
                    s.save_folder,
                    s.biko,
                    (SELECT group_concat(filename separator '\n') FROM t_system_file WHERE sys_key = s.sys_key) AS temp_file,
                    s.add_date,
                    IFNULL(s1.EMP_NAME,s.add_tan) AS add_tan,
                    s.upd_date,
                    IFNULL(s2.EMP_NAME,s.upd_tan) AS upd_tan
                FROM t_system AS s
                LEFT JOIN common.idinfo_user AS s1 ON s1.EMP_ID = s.add_tan
                LEFT JOIN common.idinfo_user AS s2 ON s2.EMP_ID = s.upd_tan
                WHERE s.del_flg = 0".
                ($_POST["system_name"] === "" ? "" : " AND s.system_name LIKE '%{$_POST["system_name"]}%'").
                ($_POST["gaiyo"] === "" ? "" : " AND s.gaiyo LIKE '%{$_POST["gaiyo"]}%'").
                ($_POST["kado_jyokyo"] === "0" ? "" : " AND s.kado_jyokyo = {$_POST["kado_jyokyo"]}").
                ($_POST["dev_kbn"] === "0" ? "" : " AND s.dev_kbn = {$_POST["dev_kbn"]}").
                ($_POST["develop"] === "" ? "" : " AND (s.dev_busho LIKE '%{$_POST["develop"]}%' OR s.dev_tanto LIKE '%{$_POST["develop"]}%')").
                ($_POST["unyou"] === "" ? "" : " AND (s.unyo_busho LIKE '%{$_POST["unyou"]}%' OR s.unyo_tanto LIKE '%{$_POST["unyou"]}%')").
                ($_POST["dev_env"] === "" ? "" : " AND FIND_IN_SET('{$_POST["dev_env"]}',s.dev_env)").
                ($_POST["dev_lang"] === "" ? "" : " AND FIND_IN_SET('{$_POST["dev_lang"]}',s.dev_lang)").
                ($_POST["biko"] === "" ? "" : " AND s.biko LIKE '%{$_POST["biko"]}%'").
                " ORDER BY s.sys_key DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_NUM)) {
            $row[11] = $this->Code2Name($row[11],$devenv);
            $row[12] = $this->Code2Name($row[12],$devlang);
            mb_convert_variables("SJIS-win","UTF-8",$row);
            fputcsv($tmp_file,$row);
            $cnt++;
        }
        fclose($tmp_file);
        $data = array(
            "code"=>"OK",
            "filename"=>"../tmp/".$fname,
            "cnt"=>$cnt
        );
        echo json_encode($data);
    }
    // リリース一覧読込
    function loadRelease() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    r.release_no,
                    r.sys_key,
                    s.system_name,
                    s.kado_jyokyo,
                    s.dev_busho,
                    r.release_date,
                    r.tanto,
                    r.version,
                    r.system_no,
                    r.task1,
                    r.naiyo,
                    r.kakunin,
                    r.biko
                FROM t_release AS r
                INNER JOIN t_system AS s ON s.sys_key = r.sys_key
                WHERE r.del_flg = 0 AND s.del_flg = 0
                ORDER BY r.release_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "id" => $row["release_no"],
                "release_no" => "R".str_pad($row["release_no"], 5, 0, STR_PAD_LEFT),
                "sys_key" => $row["sys_key"],
                "system_name" => $row["system_name"],
                "kado_jyokyo" => $row["kado_jyokyo"],
                "dev_busho" => $row["dev_busho"],
                "release_date" => str_replace("-","/",$row["release_date"]),
                "tanto" => $row["tanto"],
                "version" => $row["version"],
                "system_no" => $row["system_no"],
                "task1" => $row["task1"],
                "naiyo" => $row["naiyo"],
                "kakunin" => $row["kakunin"],
                "biko" => $row["biko"]
            );
        }
        echo json_encode($data);
    }
    // リリース登録
    function releaseReg() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            if ($_POST["release_no"] === "新規") {
                $sql = "INSERT INTO t_release (
                            sys_key,
                            release_date,
                            version,
                            system_no,
                            task1,
                            naiyo,
                            tanto,
                            kakunin,
                            biko,
                            upd_tan
                        ) VALUES (
                            :sys_key,
                            :release_date,
                            :version,
                            :system_no,
                            :task1,
                            :naiyo,
                            :tanto,
                            :kakunin,
                            :biko,
                            '{$_SESSION["devassets"]["user"]}'
                        )";
                $sth = $con->pdo->prepare($sql);
            } else {
                $release_no = intval(str_replace("R","",$_POST["release_no"]));
                $sql = "UPDATE t_release SET
                            sys_key = :sys_key,
                            release_date = :release_date,
                            version = :version,
                            system_no = :system_no,
                            task1 = :task1,
                            naiyo = :naiyo,
                            tanto = :tanto,
                            kakunin = :kakunin,
                            biko = :biko,
                            upd_tan = '{$_SESSION["devassets"]["user"]}'
                        WHERE release_no = :release_no
                        ";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':release_no', $release_no, PDO::PARAM_INT);
            }
            $sth->bindValue(':sys_key', $_POST["sys_key"], PDO::PARAM_INT);
            $sth->bindValue(':release_date',  $_POST["release_date"] === "" ? null : date("Y-m-d", strtotime($_POST["release_date"])), PDO::PARAM_STR);
            $sth->bindValue(':version', $_POST["version"], PDO::PARAM_STR);
            $sth->bindValue(':system_no', $_POST["system_no"], PDO::PARAM_STR);
            $sth->bindValue(':task1', $_POST["task1"], PDO::PARAM_STR);
            $sth->bindValue(':naiyo', $_POST["naiyo"], PDO::PARAM_STR);
            $sth->bindValue(':tanto', $_POST["tanto"], PDO::PARAM_STR);
            $sth->bindValue(':kakunin', $_POST["kakunin"], PDO::PARAM_STR);
            $sth->bindValue(':biko', $_POST["biko"], PDO::PARAM_STR);
            if ($sth->execute() === false) {
                throw new Exception($sql);
            }
            if ($_POST["release_no"] === "新規") {
                $sql = "SELECT last_insert_id() AS release_no FROM t_release";
                $ds = $con->pdo->query($sql) or die($sql);
                $row = $ds->fetch(PDO::FETCH_ASSOC);
                $data["release_no"] = "R".str_pad($row["release_no"], 5, 0, STR_PAD_LEFT);
            }
            $con->pdo->commit();
            $data["code"] = "OK";
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);
    }
    // リリース登録（一括）
    function releaseRegAll() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            for ($i=0; $i<count($_POST["data"]); $i++) {
                $sql = "UPDATE t_release SET
                            release_date = :release_date,
                            version = :version,
                            system_no = :system_no,
                            task1 = :task1,
                            naiyo = :naiyo,
                            tanto = :tanto,
                            kakunin = :kakunin,
                            biko = :biko,
                            upd_tan = '{$_SESSION["devassets"]["user"]}'
                        WHERE release_no = :release_no
                        ";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':release_no', $_POST["data"][$i]["id"], PDO::PARAM_INT);
                $sth->bindValue(':release_date',  $_POST["data"][$i]["release_date"] === "" ? null : date("Y-m-d", strtotime($_POST["data"][$i]["release_date"])), PDO::PARAM_STR);
                $sth->bindValue(':version', $_POST["data"][$i]["version"], PDO::PARAM_STR);
                $sth->bindValue(':system_no', $_POST["data"][$i]["system_no"], PDO::PARAM_STR);
                $sth->bindValue(':task1', $_POST["data"][$i]["task1"], PDO::PARAM_STR);
                $sth->bindValue(':naiyo', $_POST["data"][$i]["naiyo"], PDO::PARAM_STR);
                $sth->bindValue(':tanto', $_POST["data"][$i]["tanto"], PDO::PARAM_STR);
                $sth->bindValue(':kakunin', $_POST["data"][$i]["kakunin"], PDO::PARAM_STR);
                $sth->bindValue(':biko', $_POST["data"][$i]["biko"], PDO::PARAM_STR);
                if ($sth->execute() === false) {
                    throw new Exception($sql);
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
    // リリースCSV
    function releaseCsv() {
        $ex_tmp_path = $_SERVER["DOCUMENT_ROOT"] ."/tmp/";
        $fname = $_SESSION["devassets"]["user"]."_release_".date("Ymd").".csv";
        // フォルダ内ＣＳＶファイルの削除
        $dir = glob($ex_tmp_path.$_SESSION["devassets"]["user"]."*.csv");
        foreach ($dir as $file){
            @unlink($file);
        }
        $tmp_file = fopen($ex_tmp_path.$fname,"w+");//保存ファイルを開く
        $data = array("code"=>"ERROR");
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $cnt = 0;
        $herder="システムNo,システム名,稼働状況,リリースNo,リリース日,リリース担当者,バージョン,案件番号,タスク名,修正内容,確認者,備考,更新日,更新担当者";
        $herder = mb_convert_encoding($herder,"SJIS-win","UTF-8")."\r\n";//shift-jisへエンコード
        fwrite($tmp_file,$herder);//ヘッダを書き込む

        $sql = "SELECT
                    r.sys_key,
                    s.system_name,
                    CASE s.kado_jyokyo WHEN 1 THEN '稼働中' WHEN 9 THEN '停止' ELSE '' END,
                    CONCAT('R',LPAD(r.release_no,5,'0')),
                    r.release_date,
                    r.tanto,
                    r.version,
                    r.system_no,
                    r.task1,
                    r.naiyo,
                    r.kakunin,
                    r.biko,
                    r.upd_date,
                    IFNULL(s1.EMP_NAME,r.upd_tan)
                FROM t_release AS r
                INNER JOIN t_system AS s ON s.sys_key = r.sys_key
                LEFT JOIN common.idinfo_user AS s1 ON s1.EMP_ID = r.upd_tan
                WHERE r.del_flg = 0 AND s.del_flg = 0".
                ($_POST["system_name"] === "" ? "" : " AND s.system_name LIKE '%{$_POST["system_name"]}%'").
                ($_POST["kado_jyokyo"] === "0" ? "" : " AND s.kado_jyokyo = {$_POST["kado_jyokyo"]}").
                ($_POST["release_date"] === "" ? "" : " AND r.release_date LIKE '%".str_replace("/","-",$_POST["release_date"])."%'").
                ($_POST["tanto"] === "" ? "" : " AND r.tanto LIKE '%{$_POST["tanto"]}%'").
                ($_POST["system_no"] === "" ? "" : " AND r.system_no LIKE '%{$_POST["system_no"]}%'").
                ($_POST["naiyo"] === "" ? "" : " AND r.naiyo LIKE '%{$_POST["naiyo"]}%'").
                ($_POST["kakunin"] === "" ? "" : " AND r.kakunin LIKE '%{$_POST["kakunin"]}%'").
                ($_POST["biko"] === "" ? "" : " AND r.biko LIKE '%{$_POST["biko"]}%'").
                " ORDER BY r.release_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_NUM)) {
            mb_convert_variables("SJIS-win","UTF-8",$row);
            fputcsv($tmp_file,$row);
            $cnt++;
        }
        fclose($tmp_file);
        $data = array(
            "code"=>"OK",
            "filename"=>"../tmp/".$fname,
            "cnt"=>$cnt
        );
        echo json_encode($data);
    }
    // システムトラブル一覧読込
    function loadTrouble() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    t.trouble_no,
                    t.sys_key,
                    s.system_name,
                    s.kado_jyokyo,
                    s.dev_busho,
                    t.hassei_date,
                    t.status,
                    t.kihyo,
                    t.level,
                    t.genin_busho,
                    t.naiyo,
                    t.genin,
                    t.taio_date,
                    t.taio,
                    t.taio_zantei,
                    t.taio_kokyu,
                    t.hokoku,
                    t.biko,
                    (SELECT group_concat(filename separator '\n') FROM t_trouble_file WHERE trouble_no = t.trouble_no) AS temp_file
                FROM t_trouble AS t
                INNER JOIN t_system AS s ON s.sys_key = t.sys_key
                WHERE t.del_flg = 0 AND s.del_flg = 0
                ORDER BY t.trouble_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "id" => $row["trouble_no"],
                "trouble_no" => "T".str_pad($row["trouble_no"], 5, 0, STR_PAD_LEFT),
                "sys_key" => $row["sys_key"],
                "system_name" => $row["system_name"],
                "kado_jyokyo" => $row["kado_jyokyo"],
                "dev_busho" => $row["dev_busho"],
                "hassei_date" => str_replace("-","/",$row["hassei_date"]),
                "status" => $row["status"],
                "kihyo" => $row["kihyo"],
                "level" => $row["level"],
                "genin_busho" => $row["genin_busho"],
                "naiyo" => $row["naiyo"],
                "genin" => $row["genin"],
                "taio_date" => str_replace("-","/",$row["taio_date"]),
                "taio" => $row["taio"],
                "taio_zantei" => $row["taio_zantei"],
                "taio_kokyu" => $row["taio_kokyu"],
                "hokoku" => $row["hokoku"],
                "biko" => $row["biko"],
                "temp_file" => $row["temp_file"]
            );
        }
        echo json_encode($data);
    }
    // システムトラブル登録
    function troubleReg() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            if ($_POST["trouble_no"] === "新規") {
                $sql = "INSERT INTO t_trouble (
                            sys_key,
                            hassei_date,
                            status,
                            kihyo,
                            level,
                            genin_busho,
                            naiyo,
                            genin,
                            taio_date,
                            taio,
                            taio_zantei,
                            taio_kokyu,
                            hokoku,
                            biko,
                            upd_tan
                        ) VALUES (
                            :sys_key,
                            :hassei_date,
                            :status,
                            :kihyo,
                            :level,
                            :genin_busho,
                            :naiyo,
                            :genin,
                            :taio_date,
                            :taio,
                            :taio_zantei,
                            :taio_kokyu,
                            :hokoku,
                            :biko,
                            '{$_SESSION["devassets"]["user"]}'
                        )";
                $sth = $con->pdo->prepare($sql);
            } else {
                $trouble_no = intval(str_replace("T","",$_POST["trouble_no"]));
                $sql = "UPDATE t_trouble SET
                            sys_key = :sys_key,
                            hassei_date = :hassei_date,
                            status = :status,
                            kihyo = :kihyo,
                            level = :level,
                            genin_busho = :genin_busho,
                            naiyo = :naiyo,
                            genin = :genin,
                            taio_date = :taio_date,
                            taio = :taio,
                            taio_zantei = :taio_zantei,
                            taio_kokyu = :taio_kokyu,
                            hokoku = :hokoku,
                            biko = :biko,
                            upd_tan = '{$_SESSION["devassets"]["user"]}'
                        WHERE trouble_no = :trouble_no
                        ";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':trouble_no', $trouble_no, PDO::PARAM_INT);
            }
            $sth->bindValue(':sys_key', $_POST["sys_key"], PDO::PARAM_INT);
            $sth->bindValue(':hassei_date',  $_POST["hassei_date"] === "" ? null : date("Y-m-d", strtotime($_POST["hassei_date"])), PDO::PARAM_STR);
            $sth->bindValue(':status', $_POST["status"], PDO::PARAM_INT);
            $sth->bindValue(':kihyo', $_POST["kihyo"], PDO::PARAM_STR);
            $sth->bindValue(':level', $_POST["level"], PDO::PARAM_INT);
            $sth->bindValue(':genin_busho', $_POST["genin_busho"], PDO::PARAM_INT);
            $sth->bindValue(':naiyo', $_POST["naiyo"], PDO::PARAM_STR);
            $sth->bindValue(':genin', $_POST["genin"], PDO::PARAM_STR);
            $sth->bindValue(':taio_date',  $_POST["taio_date"] === "" ? null : date("Y-m-d", strtotime($_POST["taio_date"])), PDO::PARAM_STR);
            $sth->bindValue(':taio', $_POST["taio"], PDO::PARAM_STR);
            $sth->bindValue(':taio_zantei', $_POST["taio_zantei"], PDO::PARAM_STR);
            $sth->bindValue(':taio_kokyu', $_POST["taio_kokyu"], PDO::PARAM_STR);
            $sth->bindValue(':hokoku', $_POST["hokoku"], PDO::PARAM_STR);
            $sth->bindValue(':biko', $_POST["biko"], PDO::PARAM_STR);
            if ($sth->execute() === false) {
                throw new Exception($sql);
            }
            if ($_POST["trouble_no"] === "新規") {
                $sql = "SELECT last_insert_id() AS trouble_no FROM t_trouble";
                $ds = $con->pdo->query($sql) or die($sql);
                $row = $ds->fetch(PDO::FETCH_ASSOC);
                $data["trouble_no"] = "T".str_pad($row["trouble_no"], 5, 0, STR_PAD_LEFT);
            }
            $con->pdo->commit();
            $data["code"] = "OK";
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);
    }
    // システムトラブル登録（一括）
    function troubleRegAll() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            for ($i=0; $i<count($_POST["data"]); $i++) {
                $sql = "UPDATE t_trouble SET
                            hassei_date = :hassei_date,
                            status = :status,
                            kihyo = :kihyo,
                            naiyo = :naiyo,
                            level = :level,
                            genin_busho = :genin_busho,
                            naiyo = :naiyo,
                            genin = :genin,
                            taio_date = :taio_date,
                            taio = :taio,
                            taio_zantei = :taio_zantei,
                            taio_kokyu = :taio_kokyu,
                            hokoku = :hokoku,
                            biko = :biko,
                            upd_tan = '{$_SESSION["devassets"]["user"]}'
                        WHERE trouble_no = :trouble_no
                        ";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':trouble_no', $_POST["data"][$i]["id"], PDO::PARAM_INT);
                $sth->bindValue(':hassei_date',  $_POST["data"][$i]["hassei_date"] === "" ? null : date("Y-m-d", strtotime($_POST["data"][$i]["hassei_date"])), PDO::PARAM_STR);
                $sth->bindValue(':status', $_POST["data"][$i]["status"], PDO::PARAM_INT);
                $sth->bindValue(':kihyo', $_POST["data"][$i]["kihyo"], PDO::PARAM_STR);
                $sth->bindValue(':level', $_POST["data"][$i]["level"], PDO::PARAM_INT);
                $sth->bindValue(':genin_busho', $_POST["data"][$i]["genin_busho"], PDO::PARAM_INT);
                $sth->bindValue(':naiyo', $_POST["data"][$i]["naiyo"], PDO::PARAM_STR);
                $sth->bindValue(':genin', $_POST["data"][$i]["genin"], PDO::PARAM_STR);
                $sth->bindValue(':taio_date',  $_POST["data"][$i]["taio_date"] === "" ? null : date("Y-m-d", strtotime($_POST["data"][$i]["taio_date"])), PDO::PARAM_STR);
                $sth->bindValue(':taio', $_POST["data"][$i]["taio"], PDO::PARAM_STR);
                $sth->bindValue(':taio_zantei', $_POST["data"][$i]["taio_zantei"], PDO::PARAM_STR);
                $sth->bindValue(':taio_kokyu', $_POST["data"][$i]["taio_kokyu"], PDO::PARAM_STR);
                $sth->bindValue(':hokoku', $_POST["data"][$i]["hokoku"], PDO::PARAM_STR);
                $sth->bindValue(':biko', $_POST["data"][$i]["biko"], PDO::PARAM_STR);
                if ($sth->execute() === false) {
                    throw new Exception($sql);
                }
                $con->pdo->commit();
                $data["code"] = "OK";
            }
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);
    }
    // システムトラブルCSV
    function troubleCsv() {
        $ex_tmp_path = $_SERVER["DOCUMENT_ROOT"] ."/tmp/";
        $fname = $_SESSION["devassets"]["user"]."_systemtrouble_".date("Ymd").".csv";
        // フォルダ内ＣＳＶファイルの削除
        $dir = glob($ex_tmp_path.$_SESSION["devassets"]["user"]."*.csv");
        foreach ($dir as $file){
            @unlink($file);
        }
        $tmp_file = fopen($ex_tmp_path.$fname,"w+");//保存ファイルを開く
        $data = array("code"=>"ERROR");
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $cnt = 0;
        $herder="システムNo,システム名,稼働状況,トラブルNo,発生日,状態,起票者,レベル,原因部署,不具合事象,原因,対応日,対応者,暫定対応,恒久対応,報告先,備考,添付ファイル名,更新日,更新担当者";
        $herder = mb_convert_encoding($herder,"SJIS-win","UTF-8")."\r\n";//shift-jisへエンコード
        fwrite($tmp_file,$herder);//ヘッダを書き込む

        $sql = "SELECT
                    t.sys_key,
                    s.system_name,
                    CASE s.kado_jyokyo WHEN 1 THEN '稼働中' WHEN 9 THEN '停止' ELSE '' END,
                    CONCAT('T',LPAD(t.trouble_no,5,'0')),
                    t.hassei_date,
                    CASE t.status WHEN 1 THEN '検討中' WHEN 2 THEN '対応中' WHEN 9 THEN '完了' ELSE '' END,
                    t.kihyo,
                    CASE t.level WHEN 1 THEN '小' WHEN 2 THEN '中' WHEN 3 THEN '大' ELSE '' END,
                    CASE t.genin_busho WHEN 1 THEN '情シス' WHEN 2 THEN '他部署' WHEN 3 THEN '他社' ELSE '' END,
                    t.naiyo,
                    t.genin,
                    t.taio_date,
                    t.taio,
                    t.taio_zantei,
                    t.taio_kokyu,
                    t.hokoku,
                    t.biko,
                    (SELECT group_concat(filename separator '\n') FROM t_trouble_file WHERE trouble_no = t.trouble_no) AS temp_file,
                    t.upd_date,
                    IFNULL(s1.EMP_NAME,t.upd_tan)
                FROM t_trouble AS t
                INNER JOIN t_system AS s ON s.sys_key = t.sys_key
                LEFT JOIN common.idinfo_user AS s1 ON s1.EMP_ID = t.upd_tan
                WHERE t.del_flg = 0 AND s.del_flg = 0".
                ($_POST["system_name"] === "" ? "" : " AND s.system_name LIKE '%{$_POST["system_name"]}%'").
                ($_POST["kado_jyokyo"] === "0" ? "" : " AND s.kado_jyokyo = {$_POST["kado_jyokyo"]}").
                ($_POST["hassei_date"] === "" ? "" : " AND t.hassei_date LIKE '%".str_replace("/","-",$_POST["hassei_date"])."%'").
                ($_POST["status"] === "0" ? "" : " AND t.status = {$_POST["status"]}").
                ($_POST["kihyo"] === "" ? "" : " AND t.kihyo LIKE '%{$_POST["kihyo"]}%'").
                ($_POST["level"] === "0" ? "" : " AND t.level = {$_POST["level"]}").
                ($_POST["genin_busho"] === "0" ? "" : " AND t.genin_busho = {$_POST["genin_busho"]}").
                ($_POST["naiyo"] === "" ? "" : " AND t.naiyo LIKE '%{$_POST["naiyo"]}%'").
                ($_POST["taio_date"] === "" ? "" : " AND t.taio_date LIKE '%".str_replace("/","-",$_POST["taio_date"])."%'").
                ($_POST["taio"] === "" ? "" : " AND t.taio LIKE '%{$_POST["taio"]}%'").
                ($_POST["hokoku"] === "" ? "" : " AND t.hokoku LIKE '%{$_POST["hokoku"]}%'").
                ($_POST["biko"] === "" ? "" : " AND t.biko LIKE '%{$_POST["biko"]}%'").
                " ORDER BY t.trouble_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_NUM)) {
            mb_convert_variables("SJIS-win","UTF-8",$row);
            fputcsv($tmp_file,$row);
            $cnt++;
        }
        fclose($tmp_file);
        $data = array(
            "code"=>"OK",
            "filename"=>"../tmp/".$fname,
            "cnt"=>$cnt
        );
        echo json_encode($data);
    }
    // 作業一覧読込
    function loadSagyo() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    w.sagyo_no,
                    w.sys_key,
                    s.system_name,
                    w.sagyo_date,
                    w.system_no,
                    w.task1,
                    w.tanto,
                    w.naiyo,
                    w.kakunin,
                    w.biko
                FROM t_sagyo AS w
                LEFT JOIN t_system AS s ON s.sys_key = w.sys_key
                WHERE w.del_flg = 0 AND (s.del_flg IS NULL OR s.del_flg = 0)
                ORDER BY w.sagyo_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "id" => $row["sagyo_no"],
                "sagyo_no" => "W".str_pad($row["sagyo_no"], 5, 0, STR_PAD_LEFT),
                "sys_key" => $row["sys_key"],
                "system_name" => $row["system_name"],
                "sagyo_date" => str_replace("-","/",$row["sagyo_date"]),
                "system_no" => $row["system_no"],
                "task1" => $row["task1"],
                "tanto" => $row["tanto"],
                "naiyo" => $row["naiyo"],
                "kakunin" => $row["kakunin"],
                "biko" => $row["biko"]
            );
        }
        echo json_encode($data);
    }
    // 作業登録
    function sagyoReg() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            if ($_POST["sagyo_no"] === "新規") {
                $sql = "INSERT INTO t_sagyo (
                            sys_key,
                            sagyo_date,
                            system_no,
                            task1,
                            naiyo,
                            tanto,
                            kakunin,
                            biko,
                            upd_tan
                        ) VALUES (
                            :sys_key,
                            :sagyo_date,
                            :system_no,
                            :task1,
                            :naiyo,
                            :tanto,
                            :kakunin,
                            :biko,
                            '{$_SESSION["devassets"]["user"]}'
                        )";
                $sth = $con->pdo->prepare($sql);
            } else {
                $sagyo_no = intval(str_replace("W","",$_POST["sagyo_no"]));
                $sql = "UPDATE t_sagyo SET
                            sys_key = :sys_key,
                            sagyo_date = :sagyo_date,
                            system_no = :system_no,
                            task1 = :task1,
                            naiyo = :naiyo,
                            tanto = :tanto,
                            kakunin = :kakunin,
                            biko = :biko,
                            upd_tan = '{$_SESSION["devassets"]["user"]}'
                        WHERE sagyo_no = :sagyo_no
                        ";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':sagyo_no', $sagyo_no, PDO::PARAM_INT);
            }
            $sth->bindValue(':sys_key', $_POST["sys_key"] === "" ? null : $_POST["sys_key"] , PDO::PARAM_INT);
            $sth->bindValue(':sagyo_date',  $_POST["sagyo_date"] === "" ? null : date("Y-m-d", strtotime($_POST["sagyo_date"])), PDO::PARAM_STR);
            $sth->bindValue(':system_no', $_POST["system_no"], PDO::PARAM_STR);
            $sth->bindValue(':task1', $_POST["task1"], PDO::PARAM_STR);
            $sth->bindValue(':naiyo', $_POST["naiyo"], PDO::PARAM_STR);
            $sth->bindValue(':tanto', $_POST["tanto"], PDO::PARAM_STR);
            $sth->bindValue(':kakunin', $_POST["kakunin"], PDO::PARAM_STR);
            $sth->bindValue(':biko', $_POST["biko"], PDO::PARAM_STR);
            if ($sth->execute() === false) {
                throw new Exception($sql);
            }
            if ($_POST["sagyo_no"] === "新規") {
                $sql = "SELECT last_insert_id() AS sagyo_no FROM t_sagyo";
                $ds = $con->pdo->query($sql) or die($sql);
                $row = $ds->fetch(PDO::FETCH_ASSOC);
                $data["sagyo_no"] = "W".str_pad($row["sagyo_no"], 5, 0, STR_PAD_LEFT);
            }
            $con->pdo->commit();
            $data["code"] = "OK";
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);
    }
    // 作業登録（一括）
    function sagyoRegAll() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            for ($i=0; $i<count($_POST["data"]); $i++) {
                $sql = "UPDATE t_sagyo SET
                            sagyo_date = :sagyo_date,
                            system_no = :system_no,
                            task1 = :task1,
                            naiyo = :naiyo,
                            tanto = :tanto,
                            kakunin = :kakunin,
                            biko = :biko,
                            upd_tan = '{$_SESSION["devassets"]["user"]}'
                        WHERE sagyo_no = :sagyo_no
                        ";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':sagyo_no', $_POST["data"][$i]["id"], PDO::PARAM_INT);
                $sth->bindValue(':sagyo_date',  $_POST["data"][$i]["sagyo_date"] === "" ? null : date("Y-m-d", strtotime($_POST["data"][$i]["sagyo_date"])), PDO::PARAM_STR);
                $sth->bindValue(':system_no', $_POST["data"][$i]["system_no"], PDO::PARAM_STR);
                $sth->bindValue(':task1', $_POST["data"][$i]["task1"], PDO::PARAM_STR);
                $sth->bindValue(':naiyo', $_POST["data"][$i]["naiyo"], PDO::PARAM_STR);
                $sth->bindValue(':tanto', $_POST["data"][$i]["tanto"], PDO::PARAM_STR);
                $sth->bindValue(':kakunin', $_POST["data"][$i]["kakunin"], PDO::PARAM_STR);
                $sth->bindValue(':biko', $_POST["data"][$i]["biko"], PDO::PARAM_STR);
                if ($sth->execute() === false) {
                    throw new Exception($sql);
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
    // 作業削除
    function deleteSagyo() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            $sagyo_no = intval(str_replace("W","",$_POST["sagyo_no"]));
            $sql = "UPDATE t_sagyo SET
                        del_flg = 1,
                        upd_tan = '{$_SESSION["devassets"]["user"]}'
                    WHERE sagyo_no = :sagyo_no
                    ";
            $sth = $con->pdo->prepare($sql);
            $sth->bindValue(':sagyo_no', $sagyo_no, PDO::PARAM_INT);
            if ($sth->execute() === false) {
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
    // 作業CSV
    function sagyoCsv() {
        $ex_tmp_path = $_SERVER["DOCUMENT_ROOT"] ."/tmp/";
        $fname = $_SESSION["devassets"]["user"]."_sagyo_".date("Ymd").".csv";
        // フォルダ内ＣＳＶファイルの削除
        $dir = glob($ex_tmp_path.$_SESSION["devassets"]["user"]."*.csv");
        foreach ($dir as $file){
            @unlink($file);
        }
        $tmp_file = fopen($ex_tmp_path.$fname,"w+");//保存ファイルを開く
        $data = array("code"=>"ERROR");
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $cnt = 0;
        $herder="システムNo,システム名,作業No,作業日,作業担当者,案件番号,タスク名,修正内容,確認者,備考,更新日,更新担当者";
        $herder = mb_convert_encoding($herder,"SJIS-win","UTF-8")."\r\n";//shift-jisへエンコード
        fwrite($tmp_file,$herder);//ヘッダを書き込む

        $sql = "SELECT
                    w.sys_key,
                    s.system_name,
                    CONCAT('W',LPAD(w.sagyo_no,5,'0')),
                    w.sagyo_date,
                    w.tanto,
                    w.system_no,
                    w.task1,
                    w.naiyo,
                    w.kakunin,
                    w.biko,
                    w.upd_date,
                    IFNULL(s1.EMP_NAME,w.upd_tan)
                FROM t_sagyo AS w
                LEFT JOIN t_system AS s ON s.sys_key = w.sys_key
                LEFT JOIN common.idinfo_user AS s1 ON s1.EMP_ID = w.upd_tan
                WHERE w.del_flg = 0 AND (s.del_flg IS NULL OR s.del_flg = 0)".
                ($_POST["system_name"] === "" ? "" : " AND s.system_name LIKE '%{$_POST["system_name"]}%'").
                ($_POST["sagyo_date"] === "" ? "" : " AND w.sagyo_date LIKE '%".str_replace("/","-",$_POST["sagyo_date"])."%'").
                ($_POST["tanto"] === "" ? "" : " AND w.tanto LIKE '%{$_POST["tanto"]}%'").
                ($_POST["naiyo"] === "" ? "" : " AND w.naiyo LIKE '%{$_POST["naiyo"]}%'").
                ($_POST["kakunin"] === "" ? "" : " AND w.kakunin LIKE '%{$_POST["kakunin"]}%'").
                ($_POST["biko"] === "" ? "" : " AND w.biko LIKE '%{$_POST["biko"]}%'").
                " ORDER BY w.sagyo_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_NUM)) {
            mb_convert_variables("SJIS-win","UTF-8",$row);
            fputcsv($tmp_file,$row);
            $cnt++;
        }
        fclose($tmp_file);
        $data = array(
            "code"=>"OK",
            "filename"=>"../tmp/".$fname,
            "cnt"=>$cnt
        );
        echo json_encode($data);
    }
    // リリース・トラブル・作業画面でのシステム検索
    function findSystemlist() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");
        $data = array();
        $sql = "SELECT
                    s.sys_key,
                    s.system_name
                FROM t_system AS s
                WHERE s.system_name like :system_name AND s.del_flg = 0
                ORDER BY s.system_name";
        $sth = $con->pdo->prepare($sql);
        $sth->bindValue(':system_name', "%".$_POST["keyword"]."%", PDO::PARAM_STR);
        $sth->execute();
        while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
            $data[] = array(
                "sys_key" => $row["sys_key"],
                "system_name" => $row["system_name"]
            );
        }
        echo json_encode($data);
    }
    function findSystem() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");
        $data = array();
        $sql = "SELECT
                    s.sys_key,
                    s.system_name
                FROM t_system AS s
                WHERE s.system_name = :system_name AND s.del_flg = 0";
        $sth = $con->pdo->prepare($sql);
        $sth->bindValue(':system_name', $_POST["system_name"], PDO::PARAM_STR);
        $sth->execute();
        if ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
            $data = array(
                "code" => "OK",
                "sys_key" => $row["sys_key"],
                "system_name" => $row["system_name"]
            );
        } else {
            $data = array("code" => "ERROR");
        }
        echo json_encode($data);
    }
    // サーバー一覧読込
    function loadserver() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    v.svr_key,
                    v.sv_name,
                    v.host_name,
                    v.other_name,
                    v.env_type,
                    v.sv_place,
                    v.kado_jyokyo,
                    v.start_date,
                    v.end_date,
                    v.os,
                    v.ip_adrs,
                    v.role,
                    v.db_type,
                    v.gaiyo,
                    v.core_cnt,
                    v.memory_size,
                    v.hdd_cap,
                    v.kanri_busho,
                    v.kanri_tanto,
                    v.biko,
                    (SELECT group_concat(filename separator '\n') FROM t_server_file WHERE svr_key = v.svr_key) AS temp_file
                FROM t_server AS v
                WHERE v.del_flg = 0".
                (isset($_POST["svr_key"]) ? " AND v.svr_key = {$_POST["svr_key"]} " : " ").
                "ORDER BY svr_key DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "id" => $row["svr_key"],
                "sv_name" => $row["sv_name"],
                "host_name" => $row["host_name"],
                "other_name" => $row["other_name"],
                "env_type" => $row["env_type"],
                "sv_place" => $row["sv_place"],
                "kado_jyokyo" => $row["kado_jyokyo"],
                "start_date" => str_replace("-","/",$row["start_date"]),
                "end_date" => str_replace("-","/",$row["end_date"]),
                "os" => $row["os"],
                "ip_adrs" => $row["ip_adrs"],
                "role" => $row["role"] === "" ? "" : explode(",",$row["role"]),
                "db_type" => $row["db_type"],
                "gaiyo" => $row["gaiyo"],
                "core_cnt" => $row["core_cnt"] === "0" ? "" : $row["core_cnt"],
                "memory_size" => $row["memory_size"] === "0" ? "" : $row["memory_size"],
                "hdd_cap" => $row["hdd_cap"],
                "kanri_busho" => $row["kanri_busho"],
                "kanri_tanto" => $row["kanri_tanto"],
                "biko" => $row["biko"],
                "temp_file" => $row["temp_file"]
            );
        }
        echo json_encode($data);
    }
    // サーバー登録
    function serverReg() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            if ($_POST["svr_key"] === "新規")  {
                $sql =
                    "INSERT INTO t_server (
                        host_name,
                        sv_name,
                        env_type,
                        sv_place,
                        kado_jyokyo,
                        start_date,
                        end_date,
                        other_name,
                        os,
                        ip_adrs,
                        role,
                        db_type,
                        gaiyo,
                        core_cnt,
                        memory_size,
                        hdd_cap,
                        kanri_busho,
                        kanri_tanto,
                        biko,
                        add_date,
                        add_tan,
                        upd_tan
                    ) VALUES (
                        :host_name,
                        :sv_name,
                        :env_type,
                        :sv_place,
                        :kado_jyokyo,
                        :start_date,
                        :end_date,
                        :other_name,
                        :os,
                        :ip_adrs,
                        :role,
                        :db_type,
                        :gaiyo,
                        :core_cnt,
                        :memory_size,
                        :hdd_cap,
                        :kanri_busho,
                        :kanri_tanto,
                        :biko,
                        now(),
                        '{$_SESSION["devassets"]["user"]}',
                        '{$_SESSION["devassets"]["user"]}'
                    )";
                $sth = $con->pdo->prepare($sql);
            } else {
                $sql =
                    "UPDATE t_server SET
                        host_name = :host_name,
                        sv_name = :sv_name,
                        env_type = :env_type,
                        sv_place = :sv_place,
                        kado_jyokyo = :kado_jyokyo,
                        start_date = :start_date,
                        end_date = :end_date,
                        other_name = :other_name,
                        os = :os,
                        ip_adrs = :ip_adrs,
                        role = :role,
                        db_type = :db_type,
                        gaiyo = :gaiyo,
                        core_cnt = :core_cnt,
                        memory_size = :memory_size,
                        hdd_cap = :hdd_cap,
                        kanri_busho = :kanri_busho,
                        kanri_tanto = :kanri_tanto,
                        biko = :biko,
                        upd_tan = '{$_SESSION["devassets"]["user"]}'
                    WHERE svr_key = :svr_key";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':svr_key', $_POST["svr_key"], PDO::PARAM_INT);
            }
            $sth->bindValue(':host_name', $_POST["host_name"], PDO::PARAM_STR);
            $sth->bindValue(':sv_name', $_POST["sv_name"], PDO::PARAM_INT);
            $sth->bindValue(':env_type', $_POST["env_type"], PDO::PARAM_INT);
            $sth->bindValue(':sv_place', $_POST["sv_place"], PDO::PARAM_INT);
            $sth->bindValue(':kado_jyokyo', $_POST["kado_jyokyo"], PDO::PARAM_INT);
            $sth->bindValue(':start_date',  $_POST["start_date"] === "" ? null : date("Y-m-d", strtotime($_POST["start_date"])), PDO::PARAM_STR);
            $sth->bindValue(':end_date',  $_POST["end_date"] === "" ? null : date("Y-m-d", strtotime($_POST["end_date"])), PDO::PARAM_STR);
            $sth->bindValue(':other_name', $_POST["other_name"], PDO::PARAM_STR);
            $sth->bindValue(':os', $_POST["os"], PDO::PARAM_STR);
            $sth->bindValue(':ip_adrs', $_POST["ip_adrs"], PDO::PARAM_STR);
            $sth->bindValue(':role', $_POST["role"], PDO::PARAM_STR);
            $sth->bindValue(':db_type', isset($_POST["db_type"]) ? $_POST["db_type"] : "", PDO::PARAM_STR);
            $sth->bindValue(':gaiyo', $_POST["gaiyo"], PDO::PARAM_STR);
            $sth->bindValue(':core_cnt', $_POST["core_cnt"] === "" ? 0 : $_POST["core_cnt"], PDO::PARAM_INT);
            $sth->bindValue(':memory_size', $_POST["memory_size"] === "" ? 0 : $_POST["memory_size"], PDO::PARAM_INT);
            $sth->bindValue(':hdd_cap', $_POST["hdd_cap"], PDO::PARAM_STR);
            $sth->bindValue(':kanri_busho', $_POST["kanri_busho"], PDO::PARAM_STR);
            $sth->bindValue(':kanri_tanto', $_POST["kanri_tanto"], PDO::PARAM_STR);
            $sth->bindValue(':biko', $_POST["biko"], PDO::PARAM_STR);
            if ($sth->execute() === false) {
                throw new Exception($sql);
            }
            if ($_POST["svr_key"] === "新規") {
                $sql = "SELECT last_insert_id() AS new_key FROM t_server";
                $ds = $con->pdo->query($sql) or die($sql);
                $row = $ds->fetch(PDO::FETCH_ASSOC);
                $data["svr_key"] = $row["new_key"];
            }
            if ($_POST["svr_mnt"] !== "[]") {
                $svr_mnt = json_decode($_POST["svr_mnt"]);
                for ($i=0; $i<count($svr_mnt); $i++) {
                    $val = (array) $svr_mnt[$i];
                    if ($val["mente_no"] === "") {
                        $sql = "INSERT INTO t_maintenance (
                                    svr_key,
                                    start_date,
                                    end_date,
                                    tanto,
                                    kekka,
                                    naiyo,
                                    biko,
                                    upd_tan
                                ) VALUES (
                                    :svr_key,
                                    :start_date,
                                    :end_date,
                                    :tanto,
                                    :kekka,
                                    :naiyo,
                                    :biko,
                                    '{$_SESSION["devassets"]["user"]}'
                                )";
                        $sth = $con->pdo->prepare($sql);
                    } else {
                        $mente_no = intval(str_replace("M","",$val["mente_no"]));
                        $sql = "UPDATE t_maintenance SET
                                    svr_key = :svr_key,
                                    start_date = :start_date,
                                    end_date = :end_date,
                                    tanto = :tanto,
                                    kekka = :kekka,
                                    naiyo = :naiyo,
                                    biko = :biko,
                                    upd_tan = '{$_SESSION["devassets"]["user"]}'
                                WHERE mente_no = :mente_no
                                ";
                        $sth = $con->pdo->prepare($sql);
                        $sth->bindValue(':mente_no', $mente_no, PDO::PARAM_INT);
                    }
                    $sth->bindValue(':svr_key', $_POST["svr_key"], PDO::PARAM_INT);
                    $sth->bindValue(':start_date',  $val["start_date"] === "" ? null : date("Y-m-d H:i", strtotime($val["start_date"]." ".$val["start_time"])), PDO::PARAM_STR);
                    $sth->bindValue(':end_date',  $val["end_date"] === "" ? null : date("Y-m-d H:i", strtotime($val["end_date"]." ".$val["end_time"])), PDO::PARAM_STR);
                    $sth->bindValue(':tanto', $val["tanto"], PDO::PARAM_STR);
                    $sth->bindValue(':kekka', $val["kekka"], PDO::PARAM_INT);
                    $sth->bindValue(':naiyo', $val["naiyo"], PDO::PARAM_STR);
                    $sth->bindValue(':biko', $val["biko"], PDO::PARAM_STR);
                    if ($sth->execute() === false) {
                        throw new Exception($sql);
                    }
                    if ($val["mente_no"] === "") {
                        $sql = "SELECT last_insert_id() AS mente_no FROM t_maintenance";
                        $ds = $con->pdo->query($sql) or die($sql);
                        $row = $ds->fetch(PDO::FETCH_ASSOC);
                        $data["mente_no"][] = array(
                            "no" => $i,
                            "mente_no" => "M".str_pad($row["mente_no"], 5, 0, STR_PAD_LEFT)
                        );
                    }
                }
            }
            if ($_POST["svr_trbl"] !== "[]") {
                $svr_trbl = json_decode($_POST["svr_trbl"]);
                for ($i=0; $i<count($svr_trbl); $i++) {
                    $val = (array) $svr_trbl[$i];
                    if ($val["trouble_no"] === "") {
                        $sql = "INSERT INTO t_strouble (
                                    svr_key,
                                    hassei_date,
                                    status,
                                    kihyo,
                                    level,
                                    naiyo,
                                    taio_date,
                                    taio,
                                    hokoku,
                                    biko,
                                    upd_tan
                                ) VALUES (
                                    :svr_key,
                                    :hassei_date,
                                    :status,
                                    :kihyo,
                                    :level,
                                    :naiyo,
                                    :taio_date,
                                    :taio,
                                    :hokoku,
                                    :biko,
                                    '{$_SESSION["devassets"]["user"]}'
                                )";
                        $sth = $con->pdo->prepare($sql);
                    } else {
                        $trouble_no = intval(str_replace("X","",$val["trouble_no"]));
                        $sql = "UPDATE t_strouble SET
                                    svr_key = :svr_key,
                                    hassei_date = :hassei_date,
                                    status = :status,
                                    kihyo = :kihyo,
                                    naiyo = :naiyo,
                                    level = :level,
                                    naiyo = :naiyo,
                                    taio_date = :taio_date,
                                    taio = :taio,
                                    hokoku = :hokoku,
                                    biko = :biko,
                                    upd_tan = '{$_SESSION["devassets"]["user"]}'
                                WHERE trouble_no = :trouble_no
                                ";
                        $sth = $con->pdo->prepare($sql);
                        $sth->bindValue(':trouble_no', $trouble_no, PDO::PARAM_INT);
                    }
                    $sth->bindValue(':svr_key', $_POST["svr_key"], PDO::PARAM_INT);
                    $sth->bindValue(':hassei_date',  $val["hassei_date"] === "" ? null : date("Y-m-d", strtotime($val["hassei_date"])), PDO::PARAM_STR);
                    $sth->bindValue(':status', $val["status"], PDO::PARAM_INT);
                    $sth->bindValue(':kihyo', $val["kihyo"], PDO::PARAM_STR);
                    $sth->bindValue(':naiyo', $val["naiyo"], PDO::PARAM_STR);
                    $sth->bindValue(':level', $val["level"], PDO::PARAM_INT);
                    $sth->bindValue(':naiyo', $val["naiyo"], PDO::PARAM_STR);
                    $sth->bindValue(':taio_date',  $val["taio_date"] === "" ? null : date("Y-m-d", strtotime($val["taio_date"])), PDO::PARAM_STR);
                    $sth->bindValue(':taio', $val["taio"], PDO::PARAM_STR);
                    $sth->bindValue(':hokoku', $val["hokoku"], PDO::PARAM_STR);
                    $sth->bindValue(':biko', $val["biko"], PDO::PARAM_STR);
                    if ($sth->execute() === false) {
                        throw new Exception($sql);
                    }
                    if ($val["trouble_no"] === "") {
                        $sql = "SELECT last_insert_id() AS trouble_no FROM t_strouble";
                        $ds = $con->pdo->query($sql) or die($sql);
                        $row = $ds->fetch(PDO::FETCH_ASSOC);
                        $data["trouble_no"][] = array(
                            "no" => $i,
                            "trouble_no" => "X".str_pad($row["trouble_no"], 5, 0, STR_PAD_LEFT)
                        );
                    }
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
    function serverRegAll() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            for ($i=0; $i<count($_POST["data"]); $i++) {
                $sql =
                    "UPDATE t_server SET
                        host_name = :host_name,
                        sv_name = :sv_name,
                        env_type = :env_type,
                        sv_place = :sv_place,
                        kado_jyokyo = :kado_jyokyo,
                        other_name = :other_name,
                        os = :os,
                        role = :role,
                        ip_adrs = :ip_adrs,
                        db_type = :db_type,
                        gaiyo = :gaiyo,
                        core_cnt = :core_cnt,
                        memory_size = :memory_size,
                        hdd_cap = :hdd_cap,
                        kanri_busho = :kanri_busho,
                        kanri_tanto = :kanri_tanto,
                        biko = :biko,
                        upd_tan = '{$_SESSION["devassets"]["user"]}'
                    WHERE svr_key = :svr_key";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':svr_key', $_POST["data"][$i]["id"], PDO::PARAM_INT);
                $sth->bindValue(':host_name', $_POST["data"][$i]["host_name"], PDO::PARAM_STR);
                $sth->bindValue(':sv_name', $_POST["data"][$i]["sv_name"], PDO::PARAM_INT);
                $sth->bindValue(':env_type', $_POST["data"][$i]["env_type"], PDO::PARAM_INT);
                $sth->bindValue(':sv_place', $_POST["data"][$i]["sv_place"], PDO::PARAM_INT);
                $sth->bindValue(':kado_jyokyo', $_POST["data"][$i]["kado_jyokyo"], PDO::PARAM_INT);
                $sth->bindValue(':other_name', $_POST["data"][$i]["other_name"], PDO::PARAM_STR);
                $sth->bindValue(':os', $_POST["data"][$i]["os"], PDO::PARAM_STR);
                $sth->bindValue(':role', implode(",",$_POST["data"][$i]["role"]), PDO::PARAM_STR);
                $sth->bindValue(':ip_adrs', $_POST["data"][$i]["ip_adrs"], PDO::PARAM_STR);
                $sth->bindValue(':db_type', $_POST["data"][$i]["db_type"], PDO::PARAM_STR);
                $sth->bindValue(':gaiyo', $_POST["data"][$i]["gaiyo"], PDO::PARAM_STR);
                $sth->bindValue(':core_cnt', $_POST["data"][$i]["core_cnt"] === "" ? 0 : $_POST["data"][$i]["core_cnt"], PDO::PARAM_INT);
                $sth->bindValue(':memory_size', $_POST["data"][$i]["memory_size"] === "" ? 0 : $_POST["data"][$i]["memory_size"], PDO::PARAM_INT);
                $sth->bindValue(':hdd_cap', $_POST["data"][$i]["hdd_cap"], PDO::PARAM_STR);
                $sth->bindValue(':kanri_busho', $_POST["data"][$i]["kanri_busho"], PDO::PARAM_STR);
                $sth->bindValue(':kanri_tanto', $_POST["data"][$i]["kanri_tanto"], PDO::PARAM_STR);
                $sth->bindValue(':biko', $_POST["data"][$i]["biko"], PDO::PARAM_STR);
                if ($sth->execute() === false) {
                    throw new Exception($sql);
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
    // サーバー削除
    function deleteServer() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            $sql =
                "UPDATE t_server SET
                    del_flg = 1,
                    upd_tan = '{$_SESSION["devassets"]["user"]}'
                WHERE svr_key = :svr_key";
            $sth = $con->pdo->prepare($sql);
            $sth->bindValue(':svr_key', $_POST["svr_key"], PDO::PARAM_INT);
            if ($sth->execute() === false) {
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
    // サーバー内システム一覧読込
    function loadServerSystem() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    s.sys_key,
                    s.system_name,
                    s.gaiyo,
                    CASE s.kado_jyokyo WHEN 1 THEN '稼働中' WHEN 2 THEN '未稼働' ELSE '' END AS kado_jyokyo,
                    s.dev_busho,
                    l.db_memo,
                    l.biko AS memo,
                    s.unyo_busho
                FROM t_system_server AS l
                INNER JOIN t_system AS s ON s.sys_key = l.sys_key
                WHERE l.svr_key = {$_POST["svr_key"]} AND s.del_flg = 0 AND l.del_flg = 0";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "svr_key" => $_POST["svr_key"],
                "no" => $row["sys_key"],
                "sys_key" => $row["sys_key"],
                "system_name" => $row["system_name"],
                "gaiyo" => $row["gaiyo"],
                "kado_jyokyo" => $row["kado_jyokyo"],
                "dev_busho" => $row["dev_busho"],
                "unyo_busho" => $row["unyo_busho"],
                "db_memo" => $row["db_memo"] === "" ? "" : explode(",",$row["db_memo"]),
                "memo" => $row["memo"]
            );
        }
        echo json_encode($data);
    }
    // サーバー内メンテナンス一覧読込
    function loadServerMente() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    m.mente_no,
                    m.start_date,
                    m.end_date,
                    m.tanto,
                    m.kekka,
                    m.naiyo,
                    m.biko
                FROM t_maintenance AS m
                WHERE m.svr_key = {$_POST["svr_key"]} AND m.del_flg = 0
                ORDER BY m.mente_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "mente_no" => "M".str_pad($row["mente_no"], 5, 0, STR_PAD_LEFT),
                "start_date" => $row["start_date"] === null ? "" : str_replace("-","/",substr($row["start_date"],0,10)),
                "start_time" => $row["start_date"] === null ? "" : substr($row["start_date"],11,5),
                "end_date" => $row["end_date"] === null ? "" : str_replace("-","/",substr($row["end_date"],0,10)),
                "end_time" => $row["end_date"] === null ? "" : substr($row["end_date"],11,5),
                "tanto" => $row["tanto"],
                "kekka" => $row["kekka"],
                "naiyo" => $row["naiyo"],
                "biko" => $row["biko"]
            );
        }
        echo json_encode($data);
    }
    // サーバー内トラブル一覧読込
    function loadServerTrouble() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    t.trouble_no,
                    t.hassei_date,
                    t.status,
                    t.kihyo,
                    t.level,
                    t.naiyo,
                    t.taio_date,
                    t.taio,
                    t.hokoku,
                    t.biko,
                    (SELECT group_concat(filename separator '\n') FROM t_strouble_file WHERE trouble_no = t.trouble_no) AS temp_file
                FROM t_strouble AS t
                WHERE t.svr_key = {$_POST["svr_key"]} AND t.del_flg = 0
                ORDER BY t.trouble_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "trouble_no" => "X".str_pad($row["trouble_no"], 5, 0, STR_PAD_LEFT),
                "hassei_date" => str_replace("-","/",$row["hassei_date"]),
                "status" => $row["status"],
                "kihyo" => $row["kihyo"],
                "level" => $row["level"],
                "naiyo" => $row["naiyo"],
                "taio_date" => str_replace("-","/",$row["taio_date"]),
                "taio" => $row["taio"],
                "hokoku" => $row["hokoku"],
                "biko" => $row["biko"],
                "temp_file" => $row["temp_file"]
            );
        }
        echo json_encode($data);
    }
    // サーバーCSV
    function serverCsv() {
        $ex_tmp_path = $_SERVER["DOCUMENT_ROOT"] ."/tmp/";
        $fname = $_SESSION["devassets"]["user"]."_server_".date("Ymd").".csv";
        // フォルダ内ＣＳＶファイルの削除
        $dir = glob($ex_tmp_path.$_SESSION["devassets"]["user"]."*.csv");
        foreach ($dir as $file){
            @unlink($file);
        }
        $tmp_file = fopen($ex_tmp_path.$fname,"w+");//保存ファイルを開く
        $data = array("code"=>"ERROR");
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $cnt = 0;
        $herder="No,物理筐体,ホスト名,別名,環境区分,設置場所,概要,稼働開始日,稼働終了日,稼働状況,ＯＳ,CPUコア数,メモリー,HDD容量,役割,ＤＢ,IPアドレス,管理部署,管理者,備考,添付ファイル名,登録日,登録担当者,更新日,更新担当者";
        $herder = mb_convert_encoding($herder,"SJIS-win","UTF-8")."\r\n";//shift-jisへエンコード
        fwrite($tmp_file,$herder);//ヘッダを書き込む

        $sql = "SELECT
                    v.svr_key,
                    sv.nm1 AS sv_name,
                    v.host_name,
                    v.other_name,
                    CASE v.env_type WHEN 1 THEN '本番機' WHEN 2 THEN '開発機' WHEN 3 THEN '検証機' WHEN 4 THEN 'マスター機' ELSE '' END,
                    ps.nm1 AS sv_place,
                    v.gaiyo,
                    v.start_date,
                    v.end_date,
                    CASE v.kado_jyokyo WHEN 1 THEN '運用中' WHEN 7 THEN '停止予定' WHEN 8 THEN '運用停止' WHEN 9 THEN '廃止済' ELSE '' END,
                    os.nm1 AS os_nm,
                    v.core_cnt,
                    v.memory_size,
                    v.hdd_cap,
                    (SELECT group_concat(nm1 separator '\n') FROM m_code WHERE FIND_IN_SET(code,v.role) AND syubetu = 'devrole') AS role_name,
                    db.nm1 AS db_nm,
                    v.ip_adrs,
                    v.kanri_busho,
                    v.kanri_tanto,
                    v.biko,
                    (SELECT group_concat(filename separator '\n') FROM t_server_file WHERE svr_key = v.svr_key) AS temp_file,
                    v.add_date,
                    IFNULL(s1.EMP_NAME,v.add_tan) AS add_tan,
                    v.upd_date,
                    IFNULL(s2.EMP_NAME,v.upd_tan) AS upd_tan
                FROM t_server AS v
                LEFT JOIN m_code AS sv ON sv.code = v.sv_name AND sv.syubetu = 'devsvname'
                LEFT JOIN m_code AS ps ON ps.code = v.sv_place AND ps.syubetu = 'devsvplace'
                LEFT JOIN m_code AS os ON os.code = v.os AND os.syubetu = 'devserver'
                LEFT JOIN m_code AS db ON db.code = v.db_type AND db.syubetu = 'devdb'
                LEFT JOIN common.idinfo_user AS s1 ON s1.EMP_ID = v.add_tan
                LEFT JOIN common.idinfo_user AS s2 ON s2.EMP_ID = v.upd_tan
                WHERE v.del_flg = 0".
                ($_POST["host_name"] === "" ? "" : " AND (sv.nm1 LIKE '%{$_POST["host_name"]}%' OR v.host_name LIKE '%{$_POST["host_name"]}%' OR v.other_name LIKE '%{$_POST["host_name"]}%')").
                ($_POST["env_type"] === "" ? "" : " AND v.env_type = {$_POST["env_type"]}").
                ($_POST["sv_place"] === "" ? "" : " AND v.sv_place = {$_POST["sv_place"]}").
                ($_POST["gaiyo"] === "" ? "" : " AND v.gaiyo LIKE '%{$_POST["gaiyo"]}%'").
                ($_POST["kado_jyokyo"] === "0" ? "" : " AND v.kado_jyokyo = {$_POST["kado_jyokyo"]}").
                ($_POST["os"] === "" ? "" : " AND v.os = {$_POST["os"]}").
                ($_POST["role"] === "" ? "" : " AND FIND_IN_SET('{$_POST["role"]}',v.role)").
                ($_POST["db"] === "" ? "" : " AND v.db_type = {$_POST["db"]}").
                ($_POST["ip_adrs"] === "" ? "" : " AND v.ip_adrs LIKE '%{$_POST["ip_adrs"]}%'").
                ($_POST["kanri"] === "" ? "" : " AND (v.kanri_busho LIKE '%{$_POST["kanri"]}%' OR v.kanri_tanto LIKE '%{$_POST["kanri"]}%')").
                ($_POST["biko"] === "" ? "" : " AND v.biko LIKE '%{$_POST["biko"]}%'").
                " ORDER BY v.svr_key DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_NUM)) {
            mb_convert_variables("SJIS-win","UTF-8",$row);
            fputcsv($tmp_file,$row);
            $cnt++;
        }
        fclose($tmp_file);
        $data = array(
            "code"=>"OK",
            "filename"=>"../tmp/".$fname,
            "cnt"=>$cnt
        );
        echo json_encode($data);
    }
    // メンテナンス一覧読込
    function loadMente() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    m.mente_no,
                    m.svr_key,
                    v.host_name,
                    v.other_name,
                    v.kado_jyokyo,
                    m.start_date,
                    m.end_date,
                    m.tanto,
                    m.kekka,
                    m.naiyo,
                    m.biko
                FROM t_maintenance AS m
                INNER JOIN t_server AS v ON v.svr_key = m.svr_key
                WHERE m.del_flg = 0 AND v.del_flg = 0
                ORDER BY m.mente_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "id" => $row["mente_no"],
                "mente_no" => "M".str_pad($row["mente_no"], 5, 0, STR_PAD_LEFT),
                "svr_key" => $row["svr_key"],
                "host_name" => $row["host_name"],
                "other_name" => $row["other_name"],
                "kado_jyokyo" => $row["kado_jyokyo"],
                "start_date" => $row["start_date"] === null ? "" : str_replace("-","/",substr($row["start_date"],0,10)),
                "start_time" => $row["start_date"] === null ? "" : substr($row["start_date"],11,5),
                "end_date" => $row["end_date"] === null ? "" : str_replace("-","/",substr($row["end_date"],0,10)),
                "end_time" => $row["end_date"] === null ? "" : substr($row["end_date"],11,5),
                "tanto" => $row["tanto"],
                "kekka" => $row["kekka"],
                "naiyo" => $row["naiyo"],
                "biko" => $row["biko"]
            );
        }
        echo json_encode($data);
    }
    // メンテナンス登録
    function menteReg() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            if ($_POST["mente_no"] === "新規") {
                $sql = "INSERT INTO t_maintenance (
                            svr_key,
                            start_date,
                            end_date,
                            tanto,
                            kekka,
                            naiyo,
                            biko,
                            upd_tan
                        ) VALUES (
                            :svr_key,
                            :start_date,
                            :end_date,
                            :tanto,
                            :kekka,
                            :naiyo,
                            :biko,
                            '{$_SESSION["devassets"]["user"]}'
                        )";
                $sth = $con->pdo->prepare($sql);
            } else {
                $mente_no = intval(str_replace("M","",$_POST["mente_no"]));
                $sql = "UPDATE t_maintenance SET
                            svr_key = :svr_key,
                            start_date = :start_date,
                            end_date = :end_date,
                            tanto = :tanto,
                            kekka = :kekka,
                            naiyo = :naiyo,
                            biko = :biko,
                            upd_tan = '{$_SESSION["devassets"]["user"]}'
                        WHERE mente_no = :mente_no
                        ";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':mente_no', $mente_no, PDO::PARAM_INT);
            }
            $sth->bindValue(':svr_key', $_POST["svr_key"], PDO::PARAM_INT);
            $sth->bindValue(':start_date',  $_POST["start_date"] === "" ? null : date("Y-m-d H:i", strtotime($_POST["start_date"]." ".$_POST["start_time"])), PDO::PARAM_STR);
            $sth->bindValue(':end_date',  $_POST["end_date"] === "" ? null : date("Y-m-d H:i", strtotime($_POST["end_date"]." ".$_POST["end_time"])), PDO::PARAM_STR);
            $sth->bindValue(':tanto', $_POST["tanto"], PDO::PARAM_STR);
            $sth->bindValue(':kekka', $_POST["kekka"], PDO::PARAM_INT);
            $sth->bindValue(':naiyo', $_POST["naiyo"], PDO::PARAM_STR);
            $sth->bindValue(':biko', $_POST["biko"], PDO::PARAM_STR);
            if ($sth->execute() === false) {
                throw new Exception($sql);
            }
            if ($_POST["mente_no"] === "新規") {
                $sql = "SELECT last_insert_id() AS mente_no FROM t_maintenance";
                $ds = $con->pdo->query($sql) or die($sql);
                $row = $ds->fetch(PDO::FETCH_ASSOC);
                $data["mente_no"] = "M".str_pad($row["mente_no"], 5, 0, STR_PAD_LEFT);
            }
            $con->pdo->commit();
            $data["code"] = "OK";
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);
    }
    // メンテナンス登録（一括）
    function menteRegAll() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            for ($i=0; $i<count($_POST["data"]); $i++) {
                $sql = "UPDATE t_maintenance SET
                            start_date = :start_date,
                            end_date = :end_date,
                            tanto = :tanto,
                            kekka = :kekka,
                            naiyo = :naiyo,
                            biko = :biko,
                            upd_tan = '{$_SESSION["devassets"]["user"]}'
                        WHERE mente_no = :mente_no
                        ";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':mente_no', $_POST["data"][$i]["id"], PDO::PARAM_INT);
                $sth->bindValue(':start_date',  $_POST["data"][$i]["start_date"] === "" ? null : date("Y-m-d H:i", strtotime($_POST["data"][$i]["start_date"]." ".$_POST["data"][$i]["start_time"])), PDO::PARAM_STR);
                $sth->bindValue(':end_date',  $_POST["data"][$i]["end_date"] === "" ? null : date("Y-m-d H:i", strtotime($_POST["data"][$i]["end_date"]." ".$_POST["data"][$i]["end_time"])), PDO::PARAM_STR);
                $sth->bindValue(':tanto', $_POST["data"][$i]["tanto"], PDO::PARAM_STR);
                $sth->bindValue(':kekka', $_POST["data"][$i]["kekka"], PDO::PARAM_INT);
                $sth->bindValue(':naiyo', $_POST["data"][$i]["naiyo"], PDO::PARAM_STR);
                $sth->bindValue(':biko', $_POST["data"][$i]["biko"], PDO::PARAM_STR);
                if ($sth->execute() === false) {
                    throw new Exception($sql);
                }
                $con->pdo->commit();
                $data["code"] = "OK";
            }
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);
    }
    // サーバーメンテナンスCSV
    function menteCsv() {
        $ex_tmp_path = $_SERVER["DOCUMENT_ROOT"] ."/tmp/";
        $fname = $_SESSION["devassets"]["user"]."_mente_".date("Ymd").".csv";
        // フォルダ内ＣＳＶファイルの削除
        $dir = glob($ex_tmp_path.$_SESSION["devassets"]["user"]."*.csv");
        foreach ($dir as $file){
            @unlink($file);
        }
        $tmp_file = fopen($ex_tmp_path.$fname,"w+");//保存ファイルを開く
        $data = array("code"=>"ERROR");
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $cnt = 0;
        $herder="サーバーNo,ホスト名,稼働状況,メンテナンスNo,開始日時,終了日時,担当者,作業結果,作業内容,備考,更新日,更新担当者";
        $herder = mb_convert_encoding($herder,"SJIS-win","UTF-8")."\r\n";//shift-jisへエンコード
        fwrite($tmp_file,$herder);//ヘッダを書き込む

        $sql = "SELECT
                    m.svr_key,
                    v.host_name,
                    CASE v.kado_jyokyo WHEN 1 THEN '運用中' WHEN 7 THEN '停止予定' WHEN 8 THEN '運用停止' WHEN 9 THEN '廃止済' ELSE '' END,
                    CONCAT('M',LPAD(m.mente_no,5,'0')),
                    m.start_date,
                    m.end_date,
                    m.tanto,
                    CASE m.kekka WHEN 1 THEN '中断' WHEN 2 THEN '継続' WHEN 9 THEN '完了' ELSE '' END,
                    m.naiyo,
                    m.biko,
                    m.upd_date,
                    IFNULL(s1.EMP_NAME,m.upd_tan)
                FROM t_maintenance AS m
                INNER JOIN t_server AS v ON v.svr_key = m.svr_key
                LEFT JOIN common.idinfo_user AS s1 ON s1.EMP_ID = m.upd_tan
                WHERE m.del_flg = 0 AND v.del_flg = 0".
                ($_POST["host_name"] === "" ? "" : " AND (v.host_name LIKE '%{$_POST["host_name"]}%' OR v.other_name LIKE '%{$_POST["host_name"]}%')").
                ($_POST["kado_jyokyo"] === "0" ? "" : " AND v.kado_jyokyo = {$_POST["kado_jyokyo"]}").
                ($_POST["start_date"] === "" ? "" : " AND m.start_date LIKE '%".str_replace("/","-",$_POST["start_date"])."%'").
                ($_POST["end_date"] === "" ? "" : " AND m.end_date LIKE '%".str_replace("/","-",$_POST["end_date"])."%'").
                ($_POST["tanto"] === "" ? "" : " AND m.tanto LIKE '%{$_POST["tanto"]}%'").
                ($_POST["kekka"] === "0" ? "" : " AND m.kekka = {$_POST["kekka"]}").
                ($_POST["naiyo"] === "" ? "" : " AND m.naiyo LIKE '%{$_POST["naiyo"]}%'").
                ($_POST["biko"] === "" ? "" : " AND m.biko LIKE '%{$_POST["biko"]}%'").
                " ORDER BY m.mente_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_NUM)) {
            mb_convert_variables("SJIS-win","UTF-8",$row);
            fputcsv($tmp_file,$row);
            $cnt++;
        }
        fclose($tmp_file);
        $data = array(
            "code"=>"OK",
            "filename"=>"../tmp/".$fname,
            "cnt"=>$cnt
        );
        echo json_encode($data);
    }
    // サーバートラブル一覧読込
    function loadStrouble() {
        $data = array("data"=>array());
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    t.trouble_no,
                    t.svr_key,
                    v.host_name,
                    v.other_name,
                    v.kado_jyokyo,
                    t.hassei_date,
                    t.status,
                    t.kihyo,
                    t.level,
                    t.naiyo,
                    t.taio_date,
                    t.taio,
                    t.hokoku,
                    t.biko,
                    (SELECT group_concat(filename separator '\n') FROM t_strouble_file WHERE trouble_no = t.trouble_no) AS temp_file
                FROM t_strouble AS t
                INNER JOIN t_server AS v ON v.svr_key = t.svr_key
                WHERE t.del_flg = 0 AND v.del_flg = 0
                ORDER BY t.trouble_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "id" => $row["trouble_no"],
                "trouble_no" => "X".str_pad($row["trouble_no"], 5, 0, STR_PAD_LEFT),
                "svr_key" => $row["svr_key"],
                "host_name" => $row["host_name"],
                "other_name" => $row["other_name"],
                "kado_jyokyo" => $row["kado_jyokyo"],
                "hassei_date" => str_replace("-","/",$row["hassei_date"]),
                "status" => $row["status"],
                "kihyo" => $row["kihyo"],
                "level" => $row["level"],
                "naiyo" => $row["naiyo"],
                "taio_date" => str_replace("-","/",$row["taio_date"]),
                "taio" => $row["taio"],
                "hokoku" => $row["hokoku"],
                "biko" => $row["biko"],
                "temp_file" => $row["temp_file"]
            );
        }
        echo json_encode($data);
    }
    // サーバートラブル登録
    function stroubleReg() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            if ($_POST["trouble_no"] === "新規") {
                $sql = "INSERT INTO t_strouble (
                            svr_key,
                            hassei_date,
                            status,
                            kihyo,
                            level,
                            naiyo,
                            taio_date,
                            taio,
                            hokoku,
                            biko,
                            upd_tan
                        ) VALUES (
                            :svr_key,
                            :hassei_date,
                            :status,
                            :kihyo,
                            :level,
                            :naiyo,
                            :taio_date,
                            :taio,
                            :hokoku,
                            :biko,
                            '{$_SESSION["devassets"]["user"]}'
                        )";
                $sth = $con->pdo->prepare($sql);
            } else {
                $trouble_no = intval(str_replace("X","",$_POST["trouble_no"]));
                $sql = "UPDATE t_strouble SET
                            svr_key = :svr_key,
                            hassei_date = :hassei_date,
                            status = :status,
                            kihyo = :kihyo,
                            level = :level,
                            naiyo = :naiyo,
                            taio_date = :taio_date,
                            taio = :taio,
                            hokoku = :hokoku,
                            biko = :biko,
                            upd_tan = '{$_SESSION["devassets"]["user"]}'
                        WHERE trouble_no = :trouble_no
                        ";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':trouble_no', $trouble_no, PDO::PARAM_INT);
            }
            $sth->bindValue(':svr_key', $_POST["svr_key"], PDO::PARAM_INT);
            $sth->bindValue(':hassei_date',  $_POST["hassei_date"] === "" ? null : date("Y-m-d", strtotime($_POST["hassei_date"])), PDO::PARAM_STR);
            $sth->bindValue(':status', $_POST["status"], PDO::PARAM_INT);
            $sth->bindValue(':kihyo', $_POST["kihyo"], PDO::PARAM_STR);
            $sth->bindValue(':naiyo', $_POST["naiyo"], PDO::PARAM_STR);
            $sth->bindValue(':level', $_POST["level"], PDO::PARAM_INT);
            $sth->bindValue(':naiyo', $_POST["naiyo"], PDO::PARAM_STR);
            $sth->bindValue(':taio_date',  $_POST["taio_date"] === "" ? null : date("Y-m-d", strtotime($_POST["taio_date"])), PDO::PARAM_STR);
            $sth->bindValue(':taio', $_POST["taio"], PDO::PARAM_STR);
            $sth->bindValue(':hokoku', $_POST["hokoku"], PDO::PARAM_STR);
            $sth->bindValue(':biko', $_POST["biko"], PDO::PARAM_STR);
            if ($sth->execute() === false) {
                throw new Exception($sql);
            }
            if ($_POST["trouble_no"] === "新規") {
                $sql = "SELECT last_insert_id() AS trouble_no FROM t_strouble";
                $ds = $con->pdo->query($sql) or die($sql);
                $row = $ds->fetch(PDO::FETCH_ASSOC);
                $data["trouble_no"] = "X".str_pad($row["trouble_no"], 5, 0, STR_PAD_LEFT);
            }
            $con->pdo->commit();
            $data["code"] = "OK";
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);
    }
    // サーバートラブル登録（一括）
    function stroubleRegAll() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            for ($i=0; $i<count($_POST["data"]); $i++) {
                $sql = "UPDATE t_strouble SET
                            hassei_date = :hassei_date,
                            status = :status,
                            kihyo = :kihyo,
                            level = :level,
                            naiyo = :naiyo,
                            taio_date = :taio_date,
                            taio = :taio,
                            hokoku = :hokoku,
                            biko = :biko,
                            upd_tan = '{$_SESSION["devassets"]["user"]}'
                        WHERE trouble_no = :trouble_no
                        ";
                $sth = $con->pdo->prepare($sql);
                $sth->bindValue(':trouble_no', $_POST["data"][$i]["id"], PDO::PARAM_INT);
                $sth->bindValue(':hassei_date',  $_POST["data"][$i]["hassei_date"] === "" ? null : date("Y-m-d", strtotime($_POST["data"][$i]["hassei_date"])), PDO::PARAM_STR);
                $sth->bindValue(':status', $_POST["data"][$i]["status"], PDO::PARAM_INT);
                $sth->bindValue(':kihyo', $_POST["data"][$i]["kihyo"], PDO::PARAM_STR);
                $sth->bindValue(':naiyo', $_POST["data"][$i]["naiyo"], PDO::PARAM_STR);
                $sth->bindValue(':level', $_POST["data"][$i]["level"], PDO::PARAM_INT);
                $sth->bindValue(':naiyo', $_POST["data"][$i]["naiyo"], PDO::PARAM_STR);
                $sth->bindValue(':taio_date',  $_POST["data"][$i]["taio_date"] === "" ? null : date("Y-m-d", strtotime($_POST["data"][$i]["taio_date"])), PDO::PARAM_STR);
                $sth->bindValue(':taio', $_POST["data"][$i]["taio"], PDO::PARAM_STR);
                $sth->bindValue(':hokoku', $_POST["data"][$i]["hokoku"], PDO::PARAM_STR);
                $sth->bindValue(':biko', $_POST["data"][$i]["biko"], PDO::PARAM_STR);
                if ($sth->execute() === false) {
                    throw new Exception($sql);
                }
                $con->pdo->commit();
                $data["code"] = "OK";
            }
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
        }
        echo json_encode($data);
    }
    // サーバートラブルCSV
    function stroubleCsv() {
        $ex_tmp_path = $_SERVER["DOCUMENT_ROOT"] ."/tmp/";
        $fname = $_SESSION["devassets"]["user"]."_servertrouble_".date("Ymd").".csv";
        // フォルダ内ＣＳＶファイルの削除
        $dir = glob($ex_tmp_path.$_SESSION["devassets"]["user"]."*.csv");
        foreach ($dir as $file){
            @unlink($file);
        }
        $tmp_file = fopen($ex_tmp_path.$fname,"w+");//保存ファイルを開く
        $data = array("code"=>"ERROR");
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $cnt = 0;
        $herder="サーバーNo,ホスト名,稼働状況,トラブルNo,発生日,状態,起票者,レベル,不具合事象,対応日,対応者,報告先,備考,添付ファイル名,更新日,更新担当者";
        $herder = mb_convert_encoding($herder,"SJIS-win","UTF-8")."\r\n";//shift-jisへエンコード
        fwrite($tmp_file,$herder);//ヘッダを書き込む

        $sql = "SELECT
                    x.svr_key,
                    v.host_name,
                    CASE v.kado_jyokyo WHEN 1 THEN '運用中' WHEN 7 THEN '停止予定' WHEN 8 THEN '運用停止' WHEN 9 THEN '廃止済' ELSE '' END,
                    CONCAT('X',LPAD(x.trouble_no,5,'0')),
                    x.hassei_date,
                    CASE x.status WHEN 1 THEN '検討中' WHEN 2 THEN '対応中' WHEN 9 THEN '完了' ELSE '' END,
                    x.kihyo,
                    CASE x.level WHEN 1 THEN '小' WHEN 2 THEN '中' WHEN 3 THEN '大' ELSE '' END,
                    x.naiyo,
                    x.taio_date,
                    x.taio,
                    x.hokoku,
                    x.biko,
                    (SELECT group_concat(filename separator '\n') FROM t_strouble_file WHERE trouble_no = x.trouble_no) AS temp_file,
                    x.upd_date,
                    IFNULL(s1.EMP_NAME,x.upd_tan)
                FROM t_strouble AS x
                INNER JOIN t_server AS v ON v.svr_key = x.svr_key
                LEFT JOIN common.idinfo_user AS s1 ON s1.EMP_ID = x.upd_tan
                WHERE x.del_flg = 0 AND v.del_flg = 0".
                ($_POST["host_name"] === "" ? "" : " AND (v.host_name LIKE '%{$_POST["host_name"]}%' OR v.other_name LIKE '%{$_POST["host_name"]}%')").
                ($_POST["kado_jyokyo"] === "0" ? "" : " AND v.kado_jyokyo = {$_POST["kado_jyokyo"]}").
                ($_POST["hassei_date"] === "" ? "" : " AND x.hassei_date LIKE '%".str_replace("/","-",$_POST["hassei_date"])."%'").
                ($_POST["status"] === "0" ? "" : " AND x.status = {$_POST["status"]}").
                ($_POST["kihyo"] === "" ? "" : " AND x.kihyo LIKE '%{$_POST["kihyo"]}%'").
                ($_POST["level"] === "0" ? "" : " AND x.level = {$_POST["level"]}").
                ($_POST["naiyo"] === "" ? "" : " AND x.naiyo LIKE '%{$_POST["naiyo"]}%'").
                ($_POST["taio_date"] === "" ? "" : " AND x.taio_date LIKE '%".str_replace("/","-",$_POST["taio_date"])."%'").
                ($_POST["taio"] === "" ? "" : " AND x.taio LIKE '%{$_POST["taio"]}%'").
                ($_POST["hokoku"] === "" ? "" : " AND x.hokoku LIKE '%{$_POST["hokoku"]}%'").
                ($_POST["biko"] === "" ? "" : " AND x.biko LIKE '%{$_POST["biko"]}%'").
                " ORDER BY x.trouble_no DESC";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_NUM)) {
            mb_convert_variables("SJIS-win","UTF-8",$row);
            fputcsv($tmp_file,$row);
            $cnt++;
        }
        fclose($tmp_file);
        $data = array(
            "code"=>"OK",
            "filename"=>"../tmp/".$fname,
            "cnt"=>$cnt
        );
        echo json_encode($data);
    }
    // メンテナンス・トラブル画面でのサーバー検索
    function findServerlist() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");
        $data = array();
        $sql = "SELECT
                    v.svr_key,
                    v.host_name
                FROM t_server AS v
                WHERE v.host_name like :host_name AND v.del_flg = 0
                ORDER BY v.host_name";
        $sth = $con->pdo->prepare($sql);
        $sth->bindValue(':host_name', "%".$_POST["keyword"]."%", PDO::PARAM_STR);
        $sth->execute();
        while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
            $data[] = array(
                "svr_key" => $row["svr_key"],
                "host_name" => $row["host_name"]
            );
        }
        echo json_encode($data);
    }
    function findServer() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");
        $data = array();
        $sql = "SELECT
                    v.svr_key,
                    v.host_name
                FROM t_server AS v
                WHERE v.host_name = :host_name AND v.del_flg = 0";
        $sth = $con->pdo->prepare($sql);
        $sth->bindValue(':host_name',$_POST["host_name"], PDO::PARAM_STR);
        $sth->execute();
        if ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
            $data = array(
                "code" => "OK",
                "svr_key" => $row["svr_key"],
                "host_name" => $row["host_name"]
            );
        } else {
            $data = array("code" => "ERROR");
        }
        echo json_encode($data);
    }
    // サーバー一覧検索（システム内サーバーリストでの検索）
    function findServerlist2() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");
        $data = array();
        $sql = "SELECT
                    v.svr_key,
                    v.host_name,
                    v.other_name,
                    v.gaiyo,
                    cs.nm1 AS os_name,
                    (SELECT group_concat(nm1 separator '\n') FROM m_code WHERE FIND_IN_SET(code,v.role) AND syubetu = 'devrole') AS role_name,
                    cd.nm1 AS db_type_name
                FROM t_server AS v
                LEFT JOIN m_code AS cs ON cs.code = v.os AND cs.syubetu = 'devserver'
                LEFT JOIN m_code AS cd ON cd.code = v.db_type AND cd.syubetu = 'devdb'
                WHERE (v.host_name like :host_name OR v.gaiyo like :host_name OR v.other_name like :host_name) AND del_flg = 0 AND kado_jyokyo = 1
                ORDER BY v.host_name";
        $sth = $con->pdo->prepare($sql);
        $sth->bindValue(':host_name', "%".$_POST["keyword"]."%", PDO::PARAM_STR);
        $sth->execute();
        while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
            $data[] = array(
                "label" => $row["host_name"]."（".$row["gaiyo"]."）",
                "value" => $row["svr_key"],
                "other" => array(
                    "host_name" => $row["host_name"],
                    "os_name" => $row["os_name"],
                    "other_name" => $row["other_name"],
                    "gaiyo" => $row["gaiyo"],
                    "role_name" => $row["role_name"],
                    "db_type_name" => $row["db_type_name"]
                )
            );
        }
        echo json_encode($data);
    }
    // データベース名検索（システム内サーバーリストでの検索）
    function findDBName() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");
        $data = array();
        $sql = "SELECT
                    code,
                    nm1
                FROM m_code
                WHERE syubetu = 'devdbname' AND stop_flg = 0 AND nm1 LIKE :nm1";
        if (isset($_POST["option"]) && $_POST["option"] !== "") {
            $sql .= " AND nm2 = '{$_POST["option"]}'";
        }
        $sth = $con->pdo->prepare($sql);
        $sth->bindValue(':nm1', "%".$_POST["keyword"]."%", PDO::PARAM_STR);
        $sth->execute();
        while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
            $data[] = array(
                "label" => $row["nm1"],
                "value" => $row["code"]
            );
        }
        echo json_encode($data);
    }
    // マスター（各種設定）読込
    function masterLoad() {
        $data = array("data"=>array(), "maxcd"=>0);
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT code, nm1, nm2, stop_flg FROM m_code
                WHERE syubetu = '{$_POST["key"]}'
                ORDER BY sortno";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array(
                "code" => $row["code"],
                "nm1" => $row["nm1"],
                "nm2" => $row["nm2"],
                "stop_flg" => intval($row["stop_flg"]),
                "unyo_busho" => $row["unyo_busho"],
                "unyo_tanto" => $row["unyo_tanto"],
                "dev_env" => $row["dev_env"],
                "dev_lang" => $row["dev_lang"],
                "save_folder" => $row["save_folder"],
            );
            if ($_POST["key"] === "devserver" || $_POST["key"] === "devdb") {

            }
            if ($data["maxcd"] < intval($row["code"])) {
                $data["maxcd"] = intval($row["code"]);
            }
        }
        echo json_encode($data);
    }
    // マスター（各種設定）登録
    function masterReg() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            for ($i=0; $i<count($_POST["data"]); $i++) {
                $sql =
                    "INSERT INTO m_code (
                        syubetu,
                        code,
                        nm1,
                        nm2,
                        sortno,
                        stop_flg
                    ) VALUES (
                        '{$_POST["key"]}',
                        '{$_POST["data"][$i]["code"]}',
                        '{$_POST["data"][$i]["nm1"]}',
                        '".(isset($_POST["data"][$i]["nm2"]) ? $_POST["data"][$i]["nm2"] : "")."',
                        {$i},
                        {$_POST["data"][$i]["stop_flg"]}
                    )
                    ON DUPLICATE KEY UPDATE
                        nm1 = '{$_POST["data"][$i]["nm1"]}',
                        nm2 = '".(isset($_POST["data"][$i]["nm2"]) ? $_POST["data"][$i]["nm2"] : "")."',
                        sortno = {$i},
                        stop_flg = {$_POST["data"][$i]["stop_flg"]}";
                if ($con->pdo->exec($sql) === false) {
                    throw new Exception($sql);
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
    // DB対応サーバー一覧
    function LoadDBList() {
        $data = array();
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT
                    v.svr_key,
                    v.host_name,
                    SUBSTR(v.gaiyo,1,50) AS gaiyo
                FROM t_server AS v
                WHERE v.del_flg = 0 AND FIND_IN_SET('3',v.role)
                ORDER BY v.host_name";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["data"][] = array("key"=>$row["svr_key"],"value"=>$row["host_name"]."（".$row["gaiyo"]."）");
        }
        echo json_encode($data);
    }
    // 管理者情報読込
    function adminLoad() {
        $data = array("code"=>"ERROR");
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        $sql = "SELECT c.code, m.EMP_NAME FROM m_code AS c
                INNER JOIN common.idinfo_user AS m ON m.EMP_ID = c.code
                WHERE c.syubetu = 'devadmin'
                ORDER BY c.code";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $data["admin"][] = array(
                "admincd" => $row["code"],
                "adminnm" => $row["EMP_NAME"]
            );
        }
        echo json_encode($data);
    }
    // 管理者社員CDチェック＆登録
    function adminChk() {
        $data = array();
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");
        $syaincd = strtoupper($_POST["syaincd"]);
        $sql = "SELECT m.EMP_NAME,c.code FROM common.idinfo_user AS m
                LEFT JOIN m_code AS c ON c.code = m.EMP_ID AND c.syubetu = 'devadmin'
                WHERE m.EMP_ID = '{$syaincd}'";
        $ds = $con->pdo->query($sql) or die($sql);
        if ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            if ($row["c.code"] === null) {
                try {
                    $con->pdo->beginTransaction();
                    $sql =
                    "INSERT INTO m_code (syubetu,code)
                        VALUES('devadmin','{$syaincd}')
                     ON DUPLICATE KEY UPDATE
                        nm1 = ''";
                    if ($con->pdo->exec($sql) === false) {
                        throw new Exception($sql);
                    }
                    $con->pdo->commit();
                    $data["code"] = "OK";
                    $data["adminnm"] = $row["EMP_NAME"];
                } catch (Exception $e) {
                    $con->pdo->rollBack();
                    $data = array("code"=>"ERROR","msg"=>$e->getMessage());
                }
            }
        }
        echo json_encode($data);
    }
    // 管理者削除
    function adminDel() {
        $data = array();
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");

        try {
            $con->pdo->beginTransaction();
            $sql = "DELETE FROM m_code
                    WHERE syubetu = 'devadmin'
                    AND code = '{$_POST["syaincd"]}'";
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
    // セッション切れ防止
    // function sessioncheck() {
    //     echo array("code"=>"OK");
    // }
    //----------------------------------------------------------------------------------------------------------------------------------
    //　ファイルアップロード
    //----------------------------------------------------------------------------------------------------------------------------------
    function FileUpload() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");
        try {
            $con->pdo->beginTransaction();
            $sql = "INSERT INTO t_{$_POST["upload_type"]}_file VALUES(
                        :key,
                        :filename,
                        :filedata
                    ) ON DUPLICATE KEY UPDATE
                        filedata = :filedata
                    ";
            $p = strrpos($_FILES["file"]["name"], ".") + 1;
            $fname = substr($_FILES["file"]["name"], 0, $p).strtolower(substr($_FILES["file"]["name"], $p));
            $sth = $con->pdo->prepare($sql);
            $sth->bindValue(':key', $_POST["key"], PDO::PARAM_INT);
            $sth->bindValue(':filename', $fname, PDO::PARAM_STR);
            $sth->bindValue(':filedata', file_get_contents($_FILES["file"]["tmp_name"]), PDO::PARAM_STR);
            if ($sth->execute() === false) {
                throw new Exception($sql);
            }
            $con->pdo->commit();
            $data = array("code"=>"OK","filename"=>$fname);
        } catch (Exception $e) {
            $con->pdo->rollBack();
            $data = array("code"=>"ERROR","msg"=>$e->getMessage(),"filename"=>$fname);
        }
        echo json_encode($data);
    }
    // ファイルDownLoad
    function FileDownload() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");
        try {
            $key = array("system"=>"sys_key","server"=>"svr_key","trouble"=>"trouble_no","strouble"=>"trouble_no");
            $sql = "SELECT LENGTH(filedata) AS filelen, filedata FROM t_{$_GET["file_type"]}_file
                    WHERE {$key[$_GET["file_type"]]} = :key
                    AND filename = :filename
                    ";
            $sth = $con->pdo->prepare($sql);
            $sth->bindValue(':key', $_GET["key"], PDO::PARAM_INT);
            $sth->bindValue(':filename', rawurldecode($_GET["filename"]), PDO::PARAM_STR);
            if ($sth->execute() === false) {
                throw new Exception($sql);
            }
            $row = $sth->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                header('Content-Type: application/force-download;');
                header( "Content-Disposition: attachment; filename=".mb_convert_encoding(rawurldecode($_GET["filename"]),"SJIS-win","UTF-8"));
                echo $row["filedata"];
            } else {
                echo "ERROR DATA=".rawurldecode($_GET["filename"]);
            }
        } catch (Exception $e) {
            $data = array("code"=>"ERROR","msg"=>$e->getMessage());
            echo json_encode($data);
        }
    }
    // 添付ファイル削除
    function FileDelete() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("devassets","leockdb01.leopalace21.com");
        try {
            $key = array("system"=>"sys_key","server"=>"svr_key","trouble"=>"trouble_no","strouble"=>"trouble_no");
            $con->pdo->beginTransaction();
            $sql = "DELETE FROM t_{$_POST["file_type"]}_file
                    WHERE {$key[$_POST["file_type"]]} = :key
                    AND filename = :filename
                    ";
            $sth = $con->pdo->prepare($sql);
            $sth->bindValue(':key', $_POST["key"], PDO::PARAM_INT);
            $sth->bindValue(':filename', $_POST["filename"], PDO::PARAM_STR);
            if ($sth->execute() === false) {
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
    // 案件番号チェック
    function systemNoCheck() {
        require_once "../common/pdo_connect.php";
        $con = new pdoConnect("taskman");
        $data = array("code"=>"ERROR");
        $system_no = trim($_POST["system_no"]);
        if ($system_no !== "" && strpos($system_no,"A") === false) {
            if (substr($system_no,0,1) === "G") {
                $system_no = substr($system_no,1,2).(substr($system_no,3,1) === "-" ? substr($system_no,4):substr($system_no,3));
            } elseif (substr($system_no,0,1) === "S") {
                $system_no = substr($system_no,0,3).(substr($system_no,3,1) === "-" ? substr($system_no,3):substr($system_no,3));
            } else {
                $system_no = "S".substr($system_no,0,2).(substr($system_no,2,1) === "-" ? substr($system_no,3):substr($system_no,2));
            }
            $system_no .= (substr($system_no,-3,1) === "-" ? "" : "-00");
        }
        $sql = "SELECT COALESCE(k.task1,s.system_item) AS task1 FROM it_system AS s
                LEFT JOIN kadai AS k ON k.system_no = s.system_no
                WHERE s.system_no = :system_no";
        $sth = $con->pdo->prepare($sql);
        $sth->bindValue(':system_no', $system_no, PDO::PARAM_STR);
        if ($sth->execute()) {
            $row = $sth->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $data = array("code"=>"OK","task1"=>$row["task1"]);
            }
        }
        echo json_encode($data);
    }
    // function getTasktitle() {
    //     require_once "../common/pdo_connect.php";
    //     $con = new pdoConnect("taskman");
    //     $data = array("code"=>"ERROR");
    //     $system_no = trim($_POST["system_no"]);
    //     $sql = "SELECT task1 FROM kadai WHERE sinseino = :system_no";
    //     $sth = $con->pdo->prepare($sql);
    //     $sth->bindValue(':system_no', $system_no, PDO::PARAM_STR);
    //     if ($sth->execute()) {
    //         $row = $sth->fetch(PDO::FETCH_ASSOC);
    //         if ($row) {
    //             $data = array("code"=>"OK","task_title"=>$row["task1"]);
    //         }
    //     }
    //     echo json_encode($data);
    // }
    function Code2Name($key,$list) {
        if ($key === null || $key === "") {
            return "";
        }
        $wcode = explode(",",$key);
        $wret = array();
        for ($i=0; $i<count($wcode); $i++) {
            $wret[] = $list[$wcode[$i]];
        }
        return implode("\n",$wret);
    }
}
?>