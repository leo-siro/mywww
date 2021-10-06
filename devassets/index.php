<?php
    session_start();
    if (isset($_GET["syaincd"]) || isset($_SESSION["devassets"]["user"]) === false) {
        $_SESSION["devassets"] = array();
        require "../common/pdo_connect.php";
        $header = getallheaders();
        if ((isset($header["iv-user"]) && $header["iv-user"] === '95H04') || isset($header["iv-user"]) === false) {
            $_SESSION["devassets"]["user"] = isset($_GET["syaincd"]) 
                                            ? $_GET["syaincd"]  
                                            : (isset($header["iv-user"]) 
                                                ? $header["iv-user"]
                                                : "99999");
        } else {
            $_SESSION["devassets"]["user"] = $header["iv-user"];
        }
        $con = new pdoConnect("devassets");
        $sql = "SELECT v.user_name,v.msort,v.syozokucd,v.syozokunm, k.DEPT_NAME 
                FROM schedule.v_member AS v
                LEFT JOIN common.idinfo_soshiki AS k ON k.DEPT_CD = v.syozokucd
                WHERE v.syaincd = '{$_SESSION["devassets"]["user"]}'";
        $ds = $con->pdo->query($sql);
        if ($row = $ds->fetch()) {
            $_SESSION["devassets"]["user_name"] = $row["user_name"];
            $_SESSION["devassets"]["syozokucd"] = $row["syozokucd"];
            $syozokunm = explode(" ",($row["DEPT_NAME"] === null ? $row["syozokunm"] : $row["DEPT_NAME"]));
            $_SESSION["devassets"]["syozokunm"] = (count($syozokunm) === 3 ? $syozokunm[2] : $row["syozokunm"]);
            $_SESSION["devassets"]["syainkbn"] = ($row["msort"] === "0" ? "1" : "0");  // 1：社員 0：派遣
        } else {
            $_SESSION["devassets"]["user_name"] = "ゲスト";
            $_SESSION["devassets"]["syozokucd"] = "999999";
            $_SESSION["devassets"]["syozokunm"] = "";
            $_SESSION["devassets"]["syainkbn"] = "0";
        }
        $sql = "SELECT code FROM m_code WHERE syubetu = 'devadmin' AND code = '{$_SESSION["devassets"]["user"]}'";
        $ds = $con->pdo->query($sql);
        $_SESSION["devassets"]["admin"] = ($row = $ds->fetch());

        $sql = "SELECT 
                    syubetu,
                    code, 
                    nm1
                FROM m_code
                WHERE syubetu IN ('devapp','devlang','devserver','devdb','devrole')
                ORDER BY syubetu,sortno";
        $ds = $con->pdo->query($sql) or die($sql);
        while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
            $_SESSION["devassets"][$row["syubetu"]][] = array(
                "value" => $row["code"],
                "label" => $row["nm1"]
            );
        }
        $_SESSION["devassets"]["syozokulist"] = array();
        if ($_SESSION["devassets"]["syozokucd"] !== "999999") {
            $sql = "SELECT user_name FROM schedule.v_member WHERE syozokucd = '{$_SESSION["devassets"]["syozokucd"]}' ORDER BY msort,sortno";
            $ds = $con->pdo->query($sql) or die($sql);
            while ($row = $ds->fetch(PDO::FETCH_ASSOC)) {
                $_SESSION["devassets"]["syozokulist"][] = $row["user_name"];
            }
        }
    }
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>開発資産管理</title>
    <link rel="stylesheet" href="/CSS/bootstrap4.5/bootstrap.min.css" >
    <link rel="stylesheet" href="/JS/SlickGrid/slick.grid.css" type="text/css"/>
    <link rel="stylesheet" href="/JS/SlickGrid/slick-default-theme.css" type="text/css"/>    
    <link rel="stylesheet" href="/CSS/jquery-ui.min.css" >
    <link rel="stylesheet" href="devassets.css?v=3" >
	<script src="/JS/jquery-3.5.1.min.js" defer></script>
    <script src="/JS/bootstrap4.5/bootstrap.min.js" defer></script>
	<script src="/JS/jquery-ui.min.js" defer></script>
	<script src="/JS/jquery.ui.datepicker-ja.min.js" defer></script>
    <script src="/JS/SlickGrid/lib/jquery.event.drag-2.3.0.js" defer></script>
    <script src="/JS/SlickGrid/slick.core.js" defer></script>
    <script src="/JS/SlickGrid/plugins/slick.autotooltips.js" defer></script>
    <script src="/JS/SlickGrid/slick.formatters.js" defer></script>
    <script src="/JS/SlickGrid/slick.editors.js" defer></script>
    <script src="/JS/SlickGrid/slick.grid.js" defer></script>
    <script src="/JS/SlickGrid/slick.dataview.js" defer></script>
    <script src="/JS/SlickGrid/plugins/slick.rowmovemanager.js" defer></script>
    <script src="/JS/SlickGrid/plugins/slick.rowselectionmodel.js" defer></script>    
    <script src="/JS/common.js" defer></script>
    <script>
        const syaincd = <?php echo "'{$_SESSION["devassets"]["user"]}'"; ?>;
        const user_name = <?php echo "'{$_SESSION["devassets"]["user_name"]}'"; ?>;
        const syozokucd = <?php echo "'{$_SESSION["devassets"]["syozokucd"]}'"; ?>;
        const syozokunm = <?php echo "'{$_SESSION["devassets"]["syozokunm"]}'"; ?>;
        const admin = <?php echo $_SESSION["devassets"]["admin"] ? "1" : "0"; ?>;
        const devenv = <?php echo json_encode($_SESSION["devassets"]["devapp"]);?>;
        const devlang = <?php echo json_encode($_SESSION["devassets"]["devlang"]);?>;
        const devserver = <?php echo json_encode($_SESSION["devassets"]["devserver"]);?>;
        const devdb = <?php echo json_encode($_SESSION["devassets"]["devdb"]);?>;
        const devrole = <?php echo json_encode($_SESSION["devassets"]["devrole"]);?>;
        const syozokulist = <?php echo json_encode($_SESSION["devassets"]["syozokulist"]);?>;
    </script>
    <script src="multiselect.js" defer></script>
    <script src="devassets.js?v=3" defer></script>
</head>
<body>
    <header class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <img src="/Images/Leopalace21_Logo.gif">
        <div class="navbar-nav-scroll ml-5">
            <div class="btn-group-toggle" data-toggle="buttons">
                <label class="btn btn-outline-primary btn-sm">
                    <input id="system_proc" type="radio" name="disp_type" data-type="system" checked>システム一覧
                </label>
                <label class="btn btn-outline-primary btn-sm">
                    <input id="release_proc" type="radio" name="disp_type" data-type="release">リリース管理
                </label>
                <label class="btn btn-outline-primary btn-sm">
                    <input id="trouble_proc" type="radio" name="disp_type" data-type="trouble">システムトラブル管理
                </label>
                <label class="btn btn-outline-danger btn-sm">
                    <input id="srrver_proc" type="radio" name="disp_type" data-type="server">サーバー一覧
                </label>
                <label class="btn btn-outline-danger btn-sm">
                    <input id="mente_proc" type="radio" name="disp_type" data-type="mente">メンテナンス管理
                </label>
                <label class="btn btn-outline-danger btn-sm">
                    <input id="strouble_proc" type="radio" name="disp_type" data-type="strouble">サーバートラブル管理
                </label>
            </div>            
        </div>
        <ul class="navbar-nav flex-row ml-md-auto d-none d-md-flex">
<?php if ($_SESSION["devassets"]["admin"]) : ?>            
            <li class="nav-item dropdown">
                <a class="nav-item nav-link dropdown-toggle mr-md-2" href="javascript:void(0)" id="bd-versions" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    管理者
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                    <a class="dropdown-item master_form" data-key="devrole" href="javascript:void(0)">役割設定</a>
                    <a class="dropdown-item master_form" data-key="devserver" href="javascript:void(0)">サーバ設定</a>
                    <a class="dropdown-item master_form" data-key="devdb" href="javascript:void(0)">ＤＢ設定</a>
                    <a class="dropdown-item master_form" data-key="devapp" href="javascript:void(0)">開発環境</a>
                    <a class="dropdown-item master_form" data-key="devlang" href="javascript:void(0)">開発言語</a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" id="reg_admin" href="javascript:void(0)">管理者設定</a>
                </div>
            </li>
<?php endif; ?>            
        </ul>
    </header>
    <main>
        <div id="system" class="proc_frame form-inline">
            <div class="find_frame form-group">
                <input id="fds_system" class="form-control form-control-sm ml-3" placeholder="システム名" type="text">
                <input id="fds_gaiyo" class="form-control form-control-sm ml-3" placeholder="概要" type="text">
                <label for="fds_kado_jyokyo" class="col-form-label ml-3">稼働状況</label>
                <select id="fds_kado_jyokyo" class="form-control form-control-sm ml-2">
                    <option value="0"></option>
                </select>
                <label for="fds_dev_kbn" class="col-form-label ml-3">開発区分</label>
                <select id="fds_dev_kbn" class="form-control form-control-sm ml-2">
                    <option value="0"></option>
                </select>
                <input id="fds_develop" class="form-control form-control-sm ml-3" placeholder="情シス部署・担当者" type="text">
                <input id="fds_unyou" class="form-control form-control-sm ml-3" placeholder="運用部署・担当者" type="text">
                <label for="fds_dev_env" class="col-form-label ml-3">開発環境</label>
                <select id="fds_dev_env" class="form-control form-control-sm ml-2">
                    <option value=""></option>
                </select>
                <label for="fds_dev_lang" class="col-form-label ml-3">開発言語</label>
                <select id="fds_dev_lang" class="form-control form-control-sm ml-2">
                    <option value=""></option>
                </select>
                <input id="fds_biko" class="form-control form-control-sm ml-3" placeholder="備考" type="text">
                <button type="button" id="system_edit" class="btn btn-secondary btn-sm ml-auto mr-3">編集</button>
                <button type="button" id="system_cancel" class="btn btn-secondary btn-sm mr-3" disabled>破棄</button>
                <button type="button" id="system_csv" class="btn btn-primary btn-sm mr-3">ＣＳＶ</button>
                <button type="button" id="system_new" class="btn btn-primary btn-sm mr-3">新規</button>
            </div>
            <div id="system_grid" class="proc_grid"></div>
        </div>
        <div id="release" class="proc_frame form-inline">
            <div class="find_frame form-group">
                <input id="fdr_system" class="form-control form-control-sm ml-3" placeholder="システム名" type="text">
                <input id="fdr_release" class="form-control form-control-sm ml-3" placeholder="リリース日" type="text">
                <input id="fdr_devtanto" class="form-control form-control-sm ml-3" placeholder="リリース担当" type="text">
                <input id="fdr_system_no" class="form-control form-control-sm ml-3" placeholder="案件番号" type="text">
                <input id="fdr_naiyo" class="form-control form-control-sm ml-3" placeholder="修正内容" type="text">
                <input id="fdr_kakunin" class="form-control form-control-sm ml-3" placeholder="確認者" type="text">
                <input id="fdr_biko" class="form-control form-control-sm ml-3" placeholder="備考" type="text">
                <button type="button" id="release_edit" class="btn btn-secondary btn-sm ml-auto mr-3">編集</button>
                <button type="button" id="release_cancel" class="btn btn-secondary btn-sm mr-3" disabled>破棄</button>                
                <button type="button" id="release_csv" class="btn btn-primary btn-sm mr-3">ＣＳＶ</button>
                <button type="button" id="release_new" class="btn btn-primary btn-sm mr-3">新規</button>                
            </div>
            <div id="release_grid" class="proc_grid"></div>
        </div>
        <div id="trouble" class="proc_frame form-inline">
            <div class="find_frame form-group">
                <input id="fdt_system" class="form-control form-control-sm ml-3" placeholder="システム名" type="text">
                <input id="fdt_hassei" class="form-control form-control-sm ml-3" placeholder="発生日" type="text">
                <label for="fdt_status" class="col-form-label ml-3">状態</label>
                <select id="fdt_status" class="form-control form-control-sm ml-2">
                </select>
                <input id="fdt_kihyo" class="form-control form-control-sm ml-3" placeholder="起票者" type="text">
                <label for="fdt_level" class="col-form-label ml-3">レベル</label>
                <select id="fdt_level" class="form-control form-control-sm ml-2">
                </select>
                <input id="fdt_naiyo" class="form-control form-control-sm ml-3" placeholder="不具合事象" type="text">
                <input id="fdt_taio_date" class="form-control form-control-sm ml-3" placeholder="対応日" type="text">
                <input id="fdt_taio" class="form-control form-control-sm ml-3" placeholder="対応社" type="text">
                <input id="fdt_hokoku" class="form-control form-control-sm ml-3" placeholder="報告先" type="text">
                <input id="fdt_biko" class="form-control form-control-sm ml-3" placeholder="備考" type="text">
                <button type="button" id="trouble_edit" class="btn btn-secondary btn-sm ml-auto mr-3">編集</button>
                <button type="button" id="trouble_cancel" class="btn btn-secondary btn-sm mr-3" disabled>破棄</button>                
                <button type="button" id="trouble_csv" class="btn btn-primary btn-sm mr-3">ＣＳＶ</button>
                <button type="button" id="trouble_new" class="btn btn-primary btn-sm mr-3">新規</button>                
            </div>
            <div id="trouble_grid" class="proc_grid"></div>
        </div>
        <div id="server" class="proc_frame form-inline">
            <div class="find_frame form-group">
                <input id="fdv_host_name" class="form-control form-control-sm ml-3" placeholder="ホスト名・別名" type="text">
                <input id="fdv_gaiyo" class="form-control form-control-sm ml-3" placeholder="概要" type="text">
                <label for="fdv_kado_jyokyo" class="col-form-label ml-3">稼働状況</label>
                <select id="fdv_kado_jyokyo" class="form-control form-control-sm ml-2">
                    <option value="0"></option>
                </select>
                <label for="fdv_os" class="col-form-label ml-3">ＯＳ</label>
                <select id="fdv_os" class="form-control form-control-sm ml-2">
                    <option value=""></option>
                </select>
                <label for="fdv_role" class="col-form-label ml-3">役割</label>
                <select id="fdv_role" class="form-control form-control-sm ml-2">
                    <option value=""></option>
                </select>
                <label for="fdv_db" class="col-form-label ml-3">ＤＢ</label>
                <select id="fdv_db" class="form-control form-control-sm ml-2">
                    <option value=""></option>
                </select>
                <input id="fdv_ip_adrs" class="form-control form-control-sm ml-3" placeholder="IPアドレス" type="text">
                <input id="fdv_kanri" class="form-control form-control-sm ml-3" placeholder="管理部署・管理者" type="text">
                <input id="fdv_biko" class="form-control form-control-sm ml-3" placeholder="備考" type="text">
                <button type="button" id="server_edit" class="btn btn-secondary btn-sm ml-auto mr-3">編集</button>
                <button type="button" id="server_cancel" class="btn btn-secondary btn-sm mr-3" disabled>破棄</button>                
                <button type="button" id="server_csv" class="btn btn-primary btn-sm mr-3">ＣＳＶ</button>
                <button type="button" id="server_new" class="btn btn-primary btn-sm mr-3">新規</button>
            </div>
            <div id="server_grid" class="proc_grid"></div>
        </div>
        <div id="mente" class="proc_frame form-inline">
            <div class="find_frame form-group">
                <input id="fdm_host_name" class="form-control form-control-sm ml-3" placeholder="ホスト名・別名" type="text">
                <input id="fdm_start_date" class="form-control form-control-sm ml-3" placeholder="開始日" type="text">
                <input id="fdm_end_date" class="form-control form-control-sm ml-3" placeholder="終了日" type="text">
                <input id="fdm_tanto" class="form-control form-control-sm ml-3" placeholder="担当者" type="text">
                <label for="fdm_kekka" class="col-form-label ml-3">結果</label>
                <select id="fdm_kekka" class="form-control form-control-sm ml-2">
                </select>
                <input id="fdm_naiyo" class="form-control form-control-sm ml-3" placeholder="作業内容" type="text">
                <input id="fdm_biko" class="form-control form-control-sm ml-3" placeholder="備考" type="text">
                <button type="button" id="mente_edit" class="btn btn-secondary btn-sm ml-auto mr-3">編集</button>
                <button type="button" id="mente_cancel" class="btn btn-secondary btn-sm mr-3" disabled>破棄</button>                
                <button type="button" id="mente_csv" class="btn btn-primary btn-sm mr-3">ＣＳＶ</button>
                <button type="button" id="mente_new" class="btn btn-primary btn-sm mr-3">新規</button>                
            </div>
            <div id="mente_grid" class="proc_grid"></div>
        </div>
        <div id="strouble" class="proc_frame form-inline">
            <div class="find_frame form-group">
                <input id="fdx_host_name" class="form-control form-control-sm ml-3" placeholder="ホスト名・別名" type="text">
                <input id="fdx_hassei" class="form-control form-control-sm ml-3" placeholder="発生日" type="text">
                <label for="fdx_status" class="col-form-label ml-3">状態</label>
                <select id="fdx_status" class="form-control form-control-sm ml-2">
                </select>
                <input id="fdx_kihyo" class="form-control form-control-sm ml-3" placeholder="起票者" type="text">
                <label for="fdx_level" class="col-form-label ml-3">レベル</label>
                <select id="fdx_level" class="form-control form-control-sm ml-2">
                </select>
                <input id="fdx_naiyo" class="form-control form-control-sm ml-3" placeholder="不具合事象" type="text">
                <input id="fdx_taio_date" class="form-control form-control-sm ml-3" placeholder="対応日" type="text">
                <input id="fdx_taio" class="form-control form-control-sm ml-3" placeholder="対応社" type="text">
                <input id="fdx_hokoku" class="form-control form-control-sm ml-3" placeholder="報告先" type="text">
                <input id="fdx_biko" class="form-control form-control-sm ml-3" placeholder="備考" type="text">
                <button type="button" id="strouble_edit" class="btn btn-secondary btn-sm ml-auto mr-3">編集</button>
                <button type="button" id="strouble_cancel" class="btn btn-secondary btn-sm mr-3" disabled>破棄</button>                
                <button type="button" id="strouble_csv" class="btn btn-primary btn-sm mr-3">ＣＳＶ</button>
                <button type="button" id="strouble_new" class="btn btn-primary btn-sm mr-3">新規</button>                
            </div>
            <div id="strouble_grid" class="proc_grid"></div>
        </div>
    </main>
    <footer class="d-flex bg-light">
        <span>>></span>
        <p id="msg" class="msg"></p>
    </footer>
    <div id="form_area">
        <!-- システム詳細・登録画面 -->
        <form id="system_form" title="システム">
            <div class="d-flex w-100 h-100">
                <div class="mr-3 d-flex flex-column shosai_width">
                    <fieldset id="system_detail" class="nonebootstrap ">
                        <legend class="nonebootstrap">システム詳細</legend>
                        <div class="form-row">
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fs_sys_key" class="col-form-label col-form-label-sm">No.</label>
                                    <input type="text" id="fs_sys_key" name="sys_key" class="form_item form-control form-control-sm ml-2" value="新規" readonly tabindex="0">
                                </div>
                                <div class="row pb-1">
                                    <label for="fs_start_date" class="col-form-label col-form-label-sm">稼働開始日</label>
                                    <input type="text" id="fs_start_date" name="start_date" class="form_date form_item form-control form-control-sm ml-2" tabindex="2">
                                </div>                                
                                <div class="row pb-1">
                                    <label for="fs_kado_jyokyo" class="col-form-label col-form-label-sm">稼働状況</label>
                                    <select id="fs_kado_jyokyo" name="kado_jyokyo" class="form_item form-control form-control-sm ml-2" tabindex="4">
                                    </select>
                                </div>
                            </div>
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fs_system_name" class="col-form-label col-form-label-sm">システム名</label>
                                    <input type="text" id="fs_system_name" name="system_name" class="form_item form-control form-control-sm ml-2" tabindex="1">
                                </div>
                                <div class="row pb-1">
                                    <label for="fs_end_date" class="col-form-label col-form-label-sm">稼働終了日</label>
                                    <input type="text" id="fs_end_date" name="end_date" class="form_date form_item form-control form-control-sm ml-2" tabindex="3">
                                </div>
                                <div class="row pb-1">
                                    <label for="fs_dev_kbn" class="col-form-label col-form-label-sm">開発区分</label>
                                    <select id="fs_dev_kbn" name="dev_kbn" class="form_item form-control form-control-sm ml-2" tabindex="5">
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fs_system_gaiyo" class="col-form-label col-form-label-sm">概要</label>
                                    <textarea id="fs_system_gaiyo" name="gaiyo" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="6" data-maxline="6"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fs_dev_busho" class="col-form-label col-form-label-sm">情ｼｽ担当部署</label>
                                    <textarea id="fs_dev_busho" name="dev_busho" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="1" data-maxline="3"></textarea>
                                </div>
                                <div class="row pb-1">
                                    <label for="fs_dev_tanto" class="col-form-label col-form-label-sm">情ｼｽ担当者</label>
                                    <textarea id="fs_dev_tanto" name="dev_tanto" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="1" data-maxline="3"></textarea>
                                </div>
                            </div>
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fs_unyo_busho" class="col-form-label col-form-label-sm">運用部署</label>
                                    <textarea id="fs_unyo_busho" name="unyo_busho" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="1" data-maxline="3"></textarea>
                                </div>
                                <div class="row pb-1">
                                    <label for="fs_unyo_tanto" class="col-form-label col-form-label-sm">運用担当</label>
                                    <textarea id="fs_unyo_tanto" name="unyo_tanto" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="1" data-maxline="3"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fs_dev_env" class="col-form-label col-form-label-sm">開発環境</label>
                                    <div id="fs_dev_env" class="multi_select form-control form-control-sm ml-2 d-flex flex-wrap"></div>
                                    <input type="hidden" id="fs_dev_env_hidden" name="dev_env">
                                </div>
                            </div>
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fs_dev_lang" class="col-form-label col-form-label-sm">開発言語</label>
                                    <div id="fs_dev_lang" class="multi_select form-control form-control-sm ml-2 d-flex flex-wrap"></div>
                                    <input type="hidden" id="fs_dev_lang_hidden" name="dev_lang">
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fs_save_folder" class="col-form-label col-form-label-sm">格納フォルダ</label>
                                    <input type="text" id="fs_save_folder" name="save_folder" class="form_item form-control form-control-sm ml-2">
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fs_system_biko" class="col-form-label col-form-label-sm">備考</label>
                                    <textarea id="fs_system_biko" name="biko" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="4" data-maxline="4"></textarea>
                                </div>
                                <div class="row">
                                    <label for="fs_temp_file" class="col-form-label col-form-label-sm">添付ファイル</label>
                                    <div id="fs_temp_file" class="upload_area" data-upload="system"></div>
                                </div>
                            </div>
                        </div>
                        <input type="hidden" id="fs_sys_svr" name="sys_svr" value="">
                        <input type="hidden" id="fs_sys_svr_del" name="sys_svr_del" value="">
                        <input type="hidden" id="fs_sys_rel" name="sys_rel" value="">
                        <input type="hidden" id="fs_sys_rel_del" name="sys_rel_del" value="">
                        <input type="hidden" id="fs_sys_trbl" name="sys_trbl" value="">
                        <input type="hidden" id="fs_sys_trbl_del" name="sys_trbl_del" value="">
                    </fieldset>
                    <fieldset id="system_server" class="nonebootstrap flex-grow-1">
                        <legend class="nonebootstrap">サーバー一覧</legend>
                        <div id="sys_svr_grid" class="form_grid"></div>
                    </fieldset>
                </div>
                <div class="flex-grow-1">
                    <fieldset id="system_release" class="nonebootstrap h-50">
                        <legend class="nonebootstrap">リリース管理</legend>
                        <div id="sys_rel_grid" class="form_grid"></div>
                    </fieldset>
                    <fieldset id="system_trouble" class="nonebootstrap h-50">
                        <legend class="nonebootstrap">システムトラブル管理</legend>
                        <div id="sys_trbl_grid" class="form_grid"></div>
                    </fieldset>
                </div>
            </div>
        </form>
        <!-- リリース詳細・登録画面 -->
        <form id="release_form" title="システムリリース">
            <fieldset class="nonebootstrap flex-grow-1">
                <legend class="nonebootstrap">リリース詳細</legend>
                <div class="form-row">
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fr_release_no" class="col-form-label col-form-label-sm">リリースNo</label>
                            <input type="text" id="fr_release_no" name="release_no" class="form_item form-control form-control-sm ml-2" value="新規" readonly tabindex="0">
                        </div>
                        <div class="row pb-1">
                            <label for="fr_release_date" class="col-form-label col-form-label-sm">リリース日</label>
                            <input type="text" id="fr_release_date" name="release_date" class="form_date form_item form-control form-control-sm ml-2" tabindex="2">
                        </div>
                        <div class="row pb-1">
                            <label for="fr_version" class="col-form-label col-form-label-sm">バージョン</label>
                            <input type="text" id="fr_version" name="version" class="form_item form-control form-control-sm ml-2" tabindex="4">
                        </div>
                    </div>
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fr_system_name" class="col-form-label col-form-label-sm">システム名</label>
                            <input type="text" id="fr_system_name" name="system_name" class="form_item form-control form-control-sm ml-2" tabindex="1">
                            <input type="hidden" id="fr_sys_key" name="sys_key" value="">
                        </div>
                        <div class="row pb-1">
                            <label for="fr_tanto" class="col-form-label col-form-label-sm">リリース担当</label>
                            <input type="text" id="fr_tanto" name="tanto" class="form_item form-control form-control-sm ml-2" tabindex="3">
                        </div>
                        <div class="row pb-1">
                            <label for="fr_system_no" class="col-form-label col-form-label-sm">案件番号</label>
                            <input type="text" id="fr_system_no" name="system_no" class="form_item form-control form-control-sm ml-2" tabindex="5">
                        </div>
                    </div>
                </div>
                <div class="form-row">                    
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fr_naiyo" class="col-form-label col-form-label-sm">修正内容</label>
                            <textarea id="fr_naiyo" name="naiyo" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="6" data-maxline="6"></textarea>
                        </div>
                    </div>
                </div>
                <div class="form-row">                    
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fr_kakunin" class="col-form-label col-form-label-sm">確認者</label>
                            <input type="text" id="fr_kakunin" name="kakunin" class="form_item form-control form-control-sm ml-2">
                        </div>
                    </div>
                </div>
                <div class="form-row">                    
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fr_biko" class="col-form-label col-form-label-sm">備考</label>
                            <textarea id="fr_biko" name="biko" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="5" data-maxline="5"></textarea>
                        </div>
                    </div>
                </div>
            </fieldset>
        </form>
        <!-- システムトラブル詳細・登録画面 -->
        <form id="trouble_form" title="システムトラブル">
            <fieldset class="nonebootstrap flex-grow-1">
                <legend class="nonebootstrap">トラブル詳細</legend>
                <div class="form-row">
                    <div class="col">
                        <div class="row pb-1">
                            <label for="ft_trouble_no" class="col-form-label col-form-label-sm">トラブルNo</label>
                            <input type="text" id="ft_trouble_no" name="trouble_no" class="form_item form-control form-control-sm ml-2" value="新規" readonly tabindex="0">
                        </div>
                        <div class="row pb-1">
                            <label for="ft_hassei_date" class="col-form-label col-form-label-sm">発生日</label>
                            <input type="text" id="ft_hassei_date" name="hassei_date" class="form_date form_item form-control form-control-sm ml-2" tabindex="2">
                        </div>
                        <div class="row pb-1">
                            <label for="ft_status" class="col-form-label col-form-label-sm">状態</label>
                            <select id="ft_status" name="status" class="form_item form-control form-control-sm ml-2">
                            </select>
                        </div>
                    </div>
                    <div class="col">
                        <div class="row pb-1">
                            <label for="ft_system_name" class="col-form-label col-form-label-sm">システム名</label>
                            <input type="text" id="ft_system_name" name="system_name" class="form_item form-control form-control-sm ml-2" tabindex="1">
                            <input type="hidden" id="ft_sys_key" name="sys_key" value="">
                        </div>
                        <div class="row pb-1">
                            <label for="ft_kihyo" class="col-form-label col-form-label-sm">起票者</label>
                            <input type="text" id="ft_kihyo" name="kihyo" class="form_item form-control form-control-sm ml-2" tabindex="3">
                        </div>
                        <div class="row pb-1">
                            <label for="ft_level" class="col-form-label col-form-label-sm">レベル</label>
                            <select id="ft_level" name="level" class="form_item form-control form-control-sm ml-2">
                            </select>
                        </div>
                    </div>
                </div>
                <div class="form-row">                    
                    <div class="col">
                        <div class="row pb-1">
                            <label for="ft_naiyo" class="col-form-label col-form-label-sm">不具合事象</label>
                            <textarea id="ft_naiyo" name="naiyo" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="6" data-maxline="6"></textarea>
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col">
                        <div class="row pb-1">
                            <label for="ft_taio_date" class="col-form-label col-form-label-sm">対応日</label>
                            <input type="text" id="ft_taio_date" name="taio_date" class="form_date form_item form-control form-control-sm ml-2">
                        </div>
                    </div>
                    <div class="col">
                        <div class="row pb-1">
                            <label for="ft_taio" class="col-form-label col-form-label-sm">対応者</label>
                            <input type="text" id="ft_taio" name="taio" class="form_item form-control form-control-sm ml-2">
                        </div>
                    </div>
                </div>
                <div class="form-row">                    
                    <div class="col">
                        <div class="row pb-1">
                            <label for="ft_hokoku" class="col-form-label col-form-label-sm">報告先</label>
                            <textarea id="ft_hokoku" name="hokoku" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="1" data-maxline="3"></textarea>
                        </div>
                        <div class="row pb-1">
                            <label for="ft_biko" class="col-form-label col-form-label-sm">備考</label>
                            <textarea id="ft_biko" name="biko" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="5" data-maxline="5"></textarea>
                        </div>
                        <div class="row">
                            <label for="ft_temp_file" class="col-form-label col-form-label-sm">添付ファイル</label>
                            <div id="ft_temp_file" class="upload_area" data-upload="trouble"></div>
                        </div>                                
                    </div>
                </div>
            </fieldset>
        </form>        
        <!-- サーバー詳細・登録画面 -->
        <form id="server_form" title="サーバー">
            <div class="d-flex flex-column w-100 h-100">
                <div class="d-flex">
                    <fieldset id="server_detail" class="nonebootstrap shosai_width">
                        <legend class="nonebootstrap">サーバー詳細</legend>
                        <div class="form-row">
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fv_svr_key" class="col-form-label col-form-label-sm">No.</label>
                                    <input type="text" id="fv_svr_key" name="svr_key" class="form_item form-control form-control-sm ml-2" value="新規" readonly tabindex="0">
                                </div>
                                <div class="row pb-1">
                                    <label for="fv_start_date" class="col-form-label col-form-label-sm">稼働開始日</label>
                                    <input type="text" id="fv_start_date" name="start_date" class="form_date form_item form-control form-control-sm ml-2">
                                </div>                                
                                <div class="row pb-1">
                                    <label for="fv_kado_jyokyo" class="col-form-label col-form-label-sm">稼働状況</label>
                                    <select id="fv_kado_jyokyo" name="kado_jyokyo" class="form_item form-control form-control-sm ml-2">
                                    </select>
                                </div>                                
                            </div>
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fv_host_name" class="col-form-label col-form-label-sm">ホスト名</label>
                                    <input type="text" id="fv_host_name" name="host_name" class="form_item form-control form-control-sm ml-2" tabindex="1">
                                </div>
                                <div class="row pb-1">
                                    <label for="fv_end_date" class="col-form-label col-form-label-sm">稼働終了日</label>
                                    <input type="text" id="fv_end_date" name="end_date" class="form_date form_item form-control form-control-sm ml-2">
                                </div>                                
                                <div class="row pb-1">
                                    <label for="fv_os" class="col-form-label col-form-label-sm">ＯＳ</label>
                                    <select id="fv_os" name="os" class="form_item form-control form-control-sm ml-2">
                                        <option value="0"></option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fv_server_gaiyo" class="col-form-label col-form-label-sm">概要</label>
                                    <textarea id="fv_server_gaiyo" name="gaiyo" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="6" data-maxline="6"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fv_other_name" class="col-form-label col-form-label-sm">別名</label>
                                    <div id="fv_other_name" class="multi_text form-control form-control-sm ml-2 d-flex flex-wrap"></div>
                                    <input type="hidden" id="fv_other_name_hidden" name="other_name">
                                </div>
                            </div>
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fv_role" class="col-form-label col-form-label-sm">役割</label>
                                    <div id="fv_role" class="multi_select form-control form-control-sm ml-2 d-flex flex-wrap"></div>
                                    <input type="hidden" id="fv_role_hidden" name="role">
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fv_kanri_busho" class="col-form-label col-form-label-sm">管理部署</label>
                                    <textarea id="fv_kanri_busho" name="kanri_busho" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="1" data-maxline="3"></textarea>
                                </div>
                                <div class="row pb-1">
                                    <label for="fv_kanri_tanto" class="col-form-label col-form-label-sm">管理者</label>
                                    <textarea id="fv_kanri_tanto" name="kanri_tanto" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="1" data-maxline="3"></textarea>
                                </div>
                            </div>
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fv_db_type" class="col-form-label col-form-label-sm">ＤＢ</label>
                                    <select id="fv_db_type" name="db_type" class="form_item form-control form-control-sm ml-2">
                                        <option value="0"></option>
                                    </select>
                                </div>
                                <div class="row pb-1">
                                    <label for="fv_ip_adrs" class="col-form-label col-form-label-sm">IPアドレス</label>
                                    <div id="fv_ip_adrs" class="multi_text form-control form-control-sm ml-2 d-flex flex-wrap"></div>
                                    <input type="hidden" id="fv_ip_adrs_hidden" name="ip_adrs">
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="col">
                                <div class="row pb-1">
                                    <label for="fv_server_biko" class="col-form-label col-form-label-sm">備考</label>
                                    <textarea id="fv_server_biko" name="biko" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="4" data-maxline="6"></textarea>
                                </div>
                                <div class="row">
                                    <label for="fv_temp_file" class="col-form-label col-form-label-sm">添付ファイル</label>
                                    <div id="fv_temp_file" class="upload_area" data-upload="server"></div>
                                </div>                                
                            </div>
                        </div>
                        <input type="hidden" id="fv_svr_trbl" name="svr_trbl" value="">
                        <input type="hidden" id="fv_svr_trbl_del" name="svr_trbl_del" value="">
                        <input type="hidden" id="fv_svr_mnt" name="svr_mnt" value="">
                        <input type="hidden" id="fv_svr_mnt_del" name="svr_mnt_del" value="">
                    </fieldset>
                    <fieldset id="server_system" class="nonebootstrap ml-3 flex-grow-1">
                        <legend class="nonebootstrap">システム一覧</legend>
                        <div id="server_system_grid" class="form_grid"></div>
                    </fieldset>
                </div>
                <div class="flex-grow-1 d-flex">
                    <fieldset id="server_mente" class="nonebootstrap w-50">
                        <legend class="nonebootstrap">メンテナンス管理</legend>
                        <div id="svr_mnt_grid" class="form_grid"></div>
                    </fieldset>
                    <fieldset id="server_trouble" class="nonebootstrap w-50 ml-3">
                        <legend class="nonebootstrap">サーバートラブル管理</legend>
                        <div id="svr_trbl_grid" class="form_grid"></div>
                    </fieldset>
                </div>
            </div>
        </form>
        <!-- メンテナンス詳細・登録画面 -->
        <form id="mente_form" title="メンテナンス">
            <fieldset class="nonebootstrap flex-grow-1">
                <legend class="nonebootstrap">メンテナンス詳細</legend>
                <div class="form-row">
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fm__no" class="col-form-label col-form-label-sm">メンテNo</label>
                            <input type="text" id="fm_mente_no" name="mente_no" class="form_item form-control form-control-sm ml-2" value="新規" readonly tabindex="0">
                        </div>
                    </div>
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fm_host_name" class="col-form-label col-form-label-sm">ホスト名</label>
                            <input type="text" id="fm_host_name" name="host_name" class="form_item form-control form-control-sm ml-2" tabindex="1">
                            <input type="hidden" id="fm_svr_key" name="svr_key" value="">
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fm_start_date" class="col-form-label col-form-label-sm">開始日時</label>
                            <input type="text" id="fm_start_date" name="start_date" class="form_date form_item form-control form-control-sm ml-2" tabindex="2">
                            <input type="text" id="fm_start_time" name="start_time" class="form_item form-control form-control-sm ml-2" tabindex="2">
                        </div>
                    </div>
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fm_end_date" class="col-form-label col-form-label-sm">終了日時</label>
                            <input type="text" id="fm_end_date" name="end_date" class="form_date form_item form-control form-control-sm ml-2" tabindex="2">
                            <input type="text" id="fm_end_time" name="end_time" class="form_item form-control form-control-sm ml-2" tabindex="2">
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fm_tanto" class="col-form-label col-form-label-sm">担当者</label>
                            <input type="text" id="fm_tanto" name="tanto" class="form_item form-control form-control-sm ml-2" tabindex="2">
                        </div>
                    </div>
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fm_end_date" class="col-form-label col-form-label-sm">作業結果</label>
                            <select id="fm_kekka" name="kekka" class="form_item form-control form-control-sm ml-2">
                            </select>
                        </div>
                    </div>
                </div>
                <div class="form-row">                    
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fm_naiyo" class="col-form-label col-form-label-sm">作業内容</label>
                            <textarea id="fm_naiyo" name="naiyo" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="6" data-maxline="6"></textarea>
                        </div>
                        <div class="row pb-1">
                            <label for="fm_biko" class="col-form-label col-form-label-sm">備考</label>
                            <textarea id="fm_biko" name="biko" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="5" data-maxline="5"></textarea>
                        </div>
                    </div>
                </div>
            </fieldset>
        </form>        
        <!-- サーバートラブル詳細・登録画面 -->
        <form id="strouble_form" title="サーバートラブル">
            <fieldset class="nonebootstrap flex-grow-1">
                <legend class="nonebootstrap">トラブル詳細</legend>
                <div class="form-row">
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fx_trouble_no" class="col-form-label col-form-label-sm">トラブルNo</label>
                            <input type="text" id="fx_trouble_no" name="trouble_no" class="form_item form-control form-control-sm ml-2" value="新規" readonly tabindex="0">
                        </div>
                        <div class="row pb-1">
                            <label for="fx_hassei_date" class="col-form-label col-form-label-sm">発生日</label>
                            <input type="text" id="fx_hassei_date" name="hassei_date" class="form_date form_item form-control form-control-sm ml-2" tabindex="2">
                        </div>
                        <div class="row pb-1">
                            <label for="fx_status" class="col-form-label col-form-label-sm">状態</label>
                            <select id="fx_status" name="status" class="form_item form-control form-control-sm ml-2">
                            </select>
                        </div>
                    </div>
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fx_host_name" class="col-form-label col-form-label-sm">ホスト名</label>
                            <input type="text" id="fx_host_name" name="host_name" class="form_item form-control form-control-sm ml-2" tabindex="1">
                            <input type="hidden" id="fx_svr_key" name="svr_key" value="">
                        </div>
                        <div class="row pb-1">
                            <label for="fx_kihyo" class="col-form-label col-form-label-sm">起票者</label>
                            <input type="text" id="fx_kihyo" name="kihyo" class="form_item form-control form-control-sm ml-2" tabindex="3">
                        </div>
                        <div class="row pb-1">
                            <label for="fx_level" class="col-form-label col-form-label-sm">レベル</label>
                            <select id="fx_level" name="level" class="form_item form-control form-control-sm ml-2">
                            </select>
                        </div>
                    </div>
                </div>
                <div class="form-row">                    
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fx_naiyo" class="col-form-label col-form-label-sm">不具合事象</label>
                            <textarea id="fx_naiyo" name="naiyo" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="6" data-maxline="6"></textarea>
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fx_taio_date" class="col-form-label col-form-label-sm">対応日</label>
                            <input type="text" id="fx_taio_date" name="taio_date" class="form_date form_item form-control form-control-sm ml-2">
                        </div>
                    </div>
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fx_taio" class="col-form-label col-form-label-sm">対応者</label>
                            <input type="text" id="fx_taio" name="taio" class="form_item form-control form-control-sm ml-2">
                        </div>
                    </div>
                </div>
                <div class="form-row">                    
                    <div class="col">
                        <div class="row pb-1">
                            <label for="fx_hokoku" class="col-form-label col-form-label-sm">報告先</label>
                            <textarea id="fx_hokoku" name="hokoku" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="1" data-maxline="3"></textarea>
                        </div>
                        <div class="row pb-1">
                            <label for="fx_biko" class="col-form-label col-form-label-sm">備考</label>
                            <textarea id="fx_biko" name="biko" class="form_item form-control form-control-sm ml-2 auto-resize" data-minline="5" data-maxline="5"></textarea>
                        </div>
                        <div class="row">
                            <label for="fx_temp_file" class="col-form-label col-form-label-sm">添付ファイル</label>
                            <div id="fx_temp_file" class="upload_area" data-upload="trouble"></div>
                        </div>                                
                    </div>
                </div>
            </fieldset>
        </form>        

        <form id="admin_form" title="管理者設定">
            <div id="admin_grid"></div>
        </form>
        <form id="master_form">
            <div id="master1_grid"></div>
            <div id="master2_grid"></div>
        </form>
    </div>
	<input type="file" id="doc_upload" multiple>
    <div id="alert_msg"></div>
</body>
</html>