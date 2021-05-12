<?php
    session_start();
    if (isset($_GET["syaincd"]) || isset($_SESSION["taskman"]["user"]) === false) {
        require "../common/pdo_connect.php";
        $header = getallheaders();
        if ((isset($header["iv-user"]) && $header["iv-user"] === '95H04') || isset($header["iv-user"]) === false) {
            $_SESSION["taskman"]["user"] = isset($_GET["syaincd"]) 
                                            ? $_GET["syaincd"]  
                                            : (isset($header["iv-user"]) 
                                                ? $header["iv-user"]
                                                : "99999");
        } else {
            $_SESSION["taskman"]["user"] = $header["iv-user"];
        }
        $con = new pdoConnect("schedule");
        $sql = "SELECT user_name,msort,syozokucd FROM v_member WHERE syaincd = '{$_SESSION["taskman"]["user"]}'";
        $ds = $con->pdo->query($sql);
        if ($row = $ds->fetch()) {
            $_SESSION["taskman"]["user_name"] = $row["user_name"];
            $_SESSION["taskman"]["syozokucd"] = $row["syozokucd"];
            $_SESSION["taskman"]["syainkbn"] = ($row["msort"] === "0" ? "1" : "0");  // 1：社員 0：派遣
        } else {
            $_SESSION["taskman"]["user_name"] = "ゲスト";
            $_SESSION["taskman"]["syozokucd"] = "999999";
            $_SESSION["taskman"]["syainkbn"] = "0";
        }
        if (isset($_GET["findsyain"])) {
            $_SESSION["taskman"]["findsyain"] = $_GET["findsyain"];
        }
    }
    $disp_app = isset($_GET["disp"]) ? $_GET["disp"] : "disp_board";
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <title>タスク管理</title>
	<link rel="stylesheet" href="/CSS/jquery-ui.min.css" >
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.contextMenu.min.css">
    <link rel="stylesheet" href="taskman.css?v=11">
	<script src="/JS/jquery-3.5.1.min.js"></script>
	<script src="/JS/jquery-ui.min.js"></script>
	<script src="/JS/jquery.ui.datepicker-ja.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.contextMenu.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.ui.position.js"></script>
    <script src="/JS/common.js?v=2"></script>
    <script>
        const syaincd = <?php echo "'{$_SESSION["taskman"]["user"]}'"; ?>;
        const user_name = <?php echo "'{$_SESSION["taskman"]["user_name"]}'"; ?>;
        const syozokucd = <?php echo "'{$_SESSION["taskman"]["syozokucd"]}'"; ?>;
        const disp_app = <?php echo "'{$disp_app}'"; ?>;
    </script>
    <script src="taskman.js?v=11"></script>
</head>
<body>
    <header>
        <img src="/Images/Leopalace21_Logo.gif">
        <div id="disp_mode">
            <input type="radio" id="disp_board" name="disp_mode" checked><label for="disp_board">作業進捗</label>
            <input type="radio" id="disp_schdule" name="disp_mode"><label for="disp_schdule">日報入力</label>
            <input type="radio" id="disp_kadai" name="disp_mode"><label for="disp_kadai">課題一覧</label>
        </div>
        <button id="reload" title="再読込"><img src="../Images/reload.png"></button>
        <div id="board_option" class="groupline">
            <select id="board_syozoku">
                <option value="!{value}">!{label}</option>
            </select>
            <select id="board_syain">
                <option value="!{value}">!{label}</option>
            </select>            
            <div id="disp_data">
                <input type="checkbox" id="disp_left" name="disp_data"><label for="disp_left">未振分</label>
                <!-- <input type="checkbox" id="disp_main" name="disp_data" checked><label for="disp_main">作業中</label> -->
                <input type="checkbox" id="disp_right" name="disp_data"><label for="disp_right">&nbsp;完&nbsp;了&nbsp;</label>
            </div>
            <input type="search" id="board_find_words" maxlength="30">
            <button id="board_find">検索</button>
        </div>
        <div id="schdule_option" class="groupline">
            <select id="schdule_syozoku">
            </select>
            <select id="schdule_syain">
                <option value="!{value}">!{label}</option>
            </select>
            <button id="prev_ym">＜</button>
            <p id="shift_ym" class="pwaku"></p>
            <button id="next_ym">＞</button>
            <p id="monthkei" class="pwaku">月合計 0 h</p>
            <button id="schdule_csv">CSV</button>
        </div>
        <div id="kadai_option" class="groupline">
            <select id="kadai_syozoku">
            </select>
            <select id="kadai_syain">
                <option value="!{value}">!{label}</option>
            </select>
            <button id="prev_ym2">＜</button>
            <p id="kadai_ym" class="pwaku"></p>
            <button id="next_ym2">＞</button>
            <!-- <div id="kadai_sel">
                <input type="radio" id="kadai_sel_month" name="kadai_sel" value="1"><label for="kadai_sel_month">月</label>
                <input type="radio" id="kadai_sel_month4" name="kadai_sel" checked value="2"><label for="kadai_sel_month4">４ヶ月</label>
                <input type="radio" id="kadai_sel_month6" name="kadai_sel" value="3"><label for="kadai_sel_month6">半年</label>
                <input type="radio" id="kadai_sel_month12" name="kadai_sel" value="4"><label for="kadai_sel_month12">年</label>
            </div> -->
            <select id="kadai_sel">
                <option value="1">１ヶ月</option>
                <option value="4" selected>４ヶ月</option>
                <option value="6">半年</option>
                <option value="12">１年</option>
            </select>
        </div>
        <div id="header_right">
            <input type="checkbox" id="dark_mode">
            <label for="dark_mode">Dark</label>
            <a href="taskdoc.html" target="_new" id="doc">使い方</a>
            <p id="user_name"><?php echo $_SESSION["taskman"]["user_name"]; ?></p>
        </div>
    </header>
    <main>
        <!-- 作業進捗 -->
        <div id="board">
            <div id="board_left">
                <div class="board_header">未振分</div>
                <div id="board_left_body">
                    <div class="column">
                    <div class="@{board_kadai}" data-keynum=!{keynum} data-syotei="!{kadai_syotei}" data-eyotei="!{kadai_eyotei}">
                        <div class="board_title_waku"><div class="board_title" data-title="!{kadai_title}">!{kadai_title}</div><div class="sub_menu">≡</div><div class="add_btn">＋</div></div>
                        <div class="board_memo"><div class="memo_progress">!{kadai_progress}%</div><div class="memo_important !{important_css}">!{important}</div><div class="memo_kikan">!{kadai_kikan}</div><div class="memo_syutantou">!{sinseino}</div></div>
                        <div class="board_comp !{board_comp_show}"><span>終了したストーリー（</span><div class="board_comp_cnt">!{board_comp_cnt}</div><span>）</span><div class="board_comp_switch">▼</div></div>
                        <div class="@{board_story} bg!{color} !{story_hide}" data-storyno=!{storyno} data-ration="!{story_ration}" data-ration_auto="!{story_ration_auto}" data-syotei="!{story_syotei}" data-eyotei="!{story_eyotei}" data-bikou="!{story_bikou}" data-color="!{color}" data-syain="!{syain}">
                            <div class="board_title_waku"><div class="board_title !{story_comp}" data-title="!{story_title}">!{story_title}</div><div class="sub_menu">≡</div><div class="add_btn">＋</div></div>
                            <div class="board_memo"><div class="memo_progress">!{story_progress}%</div><div class="memo_kikan">!{story_kikan}</div><div class="memo_syutantou">!{tantou}</div></div>
                            <div class="@{board_task}" data-taskno=!{taskno} data-ration="!{task_ration}" data-ration_auto="!{task_ration_auto}" data-bikou="!{task_bikou}">
                                <div class="board_title_waku"><div class="board_title !{task_comp}" data-title="!{task_title}">!{task_title}</div><div class="sub_menu">≡</div></div>
                                <div class="progress_waku"><div class="progress">!{task_progress}%</div><div class="slide_bar" data-val="!{task_progress}"></div></div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
            <div id="board_main">
                <div class="board_header">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <div id="board_main_body_sc">
                    <div id="board_main_body">
                        <div class="column">
                        <div class="@{board_kadai}" data-keynum=!{keynum} data-syotei="!{kadai_syotei}" data-eyotei="!{kadai_eyotei}">
                            <div class="board_title_waku"><div class="board_title" data-title="!{kadai_title}">!{kadai_title}</div><div class="sub_menu">≡</div><div class="add_btn">＋</div></div>
                            <div class="board_memo"><div class="memo_progress">!{kadai_progress}%</div><div class="memo_important !{important_css}">!{important}</div><div class="memo_kikan">!{kadai_kikan}</div><div class="memo_syutantou">!{sinseino}</div></div>
                            <div class="board_comp !{board_comp_show}"><span>終了したストーリー（</span><div class="board_comp_cnt">!{board_comp_cnt}</div><span>）</span><div class="board_comp_switch">▼</div></div>
                            <div class="@{board_story} bg!{color} !{story_hide}" data-storyno=!{storyno} data-ration="!{story_ration}" data-ration_auto="!{story_ration_auto}" data-syotei="!{story_syotei}" data-eyotei="!{story_eyotei}" data-bikou="!{story_bikou}" data-color="!{color}" data-syain="!{syain}">
                                <div class="board_title_waku"><div class="board_title !{story_comp}" data-title="!{story_title}">!{story_title}</div><div class="sub_menu">≡</div><div class="add_btn">＋</div></div>
                                <div class="board_memo"><div class="memo_progress">!{story_progress}%</div><div class="memo_kikan">!{story_kikan}</div><div class="memo_syutantou">!{tantou}</div></div>
                                <div class="@{board_task}" data-taskno=!{taskno} data-ration="!{task_ration}" data-ration_auto="!{task_ration_auto}" data-bikou="!{task_bikou}">
                                    <div class="board_title_waku"><div class="board_title !{task_comp}" data-title="!{task_title}">!{task_title}</div><div class="sub_menu">≡</div></div>
                                    <div class="progress_waku"><div class="progress">!{task_progress}%</div><div class="slide_bar" data-val="!{task_progress}"></div></div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="board_right">
                <div class="board_header">完了</div>
                <div id="board_right_body">
                    <div class="column">
                    <div class="@{board_kadai}" data-keynum=!{keynum} data-syotei="!{kadai_syotei}" data-eyotei="!{kadai_eyotei}">
                        <div class="board_title_waku"><div class="board_title" data-title="!{kadai_title}">!{kadai_title}</div><div class="sub_menu">≡</div><div class="add_btn">＋</div></div>
                        <div class="board_memo"><div class="memo_progress">!{kadai_progress}%</div><div class="memo_important !{important_css}">!{important}</div><div class="memo_kikan">!{kadai_kikan}</div><div class="memo_syutantou">!{sinseino}</div></div>
                        <div class="board_comp !{board_comp_show}"><span>終了したストーリー（</span><div class="board_comp_cnt">!{board_comp_cnt}</div><span>）</span><div class="board_comp_switch">▼</div></div>
                        <div class="@{board_story} bg!{color} !{story_hide}" data-storyno=!{storyno} data-ration="!{story_ration}" data-ration_auto="!{story_ration_auto}" data-syotei="!{story_syotei}" data-eyotei="!{story_eyotei}" data-bikou="!{story_bikou}" data-color="!{color}" data-syain="!{syain}">
                            <div class="board_title_waku"><div class="board_title !{story_comp}" data-title="!{story_title}">!{story_title}</div><div class="sub_menu">≡</div><div class="add_btn">＋</div></div>
                            <div class="board_memo"><div class="memo_progress">!{story_progress}%</div><div class="memo_kikan">!{story_kikan}</div><div class="memo_syutantou">!{tantou}</div></div>
                            <div class="@{board_task}" data-taskno=!{taskno} data-ration="!{task_ration}" data-ration_auto="!{task_ration_auto}" data-bikou="!{task_bikou}">
                                <div class="board_title_waku"><div class="board_title !{task_comp}" data-title="!{task_title}">!{task_title}</div><div class="sub_menu">≡</div></div>
                                <div class="progress_waku"><div class="progress">!{task_progress}%</div><div class="slide_bar" data-val="!{task_progress}"></div></div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 日報入力 -->        
        <div id="schdule">
            <div id="schdule_head">
                <div id="schdule_head_ctrl">
                    <div class="schdule_head_title">課題</div>
                    <div class="schdule_head_title">ストーリー
                    </div>
                    <div class="schdule_head_title">
                        <span>タスク</span>
                        <input type="checkbox" id="hide_comp"><label for="hide_comp">完了非表示</label>
                    </div>
                </div>
                <div id="schdule_head_item">
                    <div id="days" class="flex">
                    </div>
                    <div id="week" class="flex">
                    </div>
                    <!-- 当日の枠 -->
                    <div id="today_frame1"></div>
                </div>
            </div>
            <div id="schdule_body">
                <div class="flex">
                    <div id="schdule_body_ctrl">
                        <div class="schdule_kadai !{kadai_disp}" data-keynum="!{keynum}" data-kei="!{kadai_kei}">
                            <div class="schdule_waku !{kadai_comp}">
                                <div class="schdule_title_waku !{kadai_comp}"><div class="schdule_title" data-title="!{kadai_title}">!{kadai_title}</div></div>
                                <div class="schdule_exwaku">!{sinseino}</div>
                                <div class="worktime"><div class="worktime_progress">!{kadai_progress}%</div><div class="worktime_time">!{kadai_kei}h</div></div>
                            </div>
                            <div class="schdule_story_waku">
                                <div class="@{schdule_story} !{story_disp}" data-storyno="!{storyno}" data-kei="!{story_kei}">
                                    <div class="schdule_waku !{story_comp}">
                                        <div class="schdule_title_waku !{story_comp}"><div class="schdule_title" data-title="!{story_title}">!{story_title}</div></div>
                                        <div class="schdule_exwaku">!{user_name}</div>
                                        <div class="worktime"><div class="worktime_progress">!{story_progress}%</div><div class="worktime_time">!{story_kei}h</div></div>
                                    </div>
                                    <div class="schdule_task_waku">
                                        <div class="@{schdule_task} !{task_disp}" data-taskno="!{taskno}" data-kei="!{task_kei}">
                                            <div class="schdule_waku">
                                                <div class="schdule_title_waku !{task_comp}"><div class="schdule_title" data-title="!{task_title}">!{task_title}</div></div>
                                                <div class="worktime"><div class="worktime_progress">!{task_progress}%</div><div class="worktime_time">!{task_kei}h</div></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                        
                    </div>
                    <div id="schdule_body_item">
                    </div>
                </div>
            </div>
        </div>
        <!-- 課題一覧 -->
        <div id="kadai">
            <div id="kadai_head">
                <div id="kadai_head_ctrl">課題</div>
                <div id="kadai_head_item"></div>
            </div>
            <div id="kadai_body">
                <div class="flex">
                    <div id="kadai_body_ctrl">
                        <div class="kadai_waku">
                            <div class="kadai_title_waku" data-keynum=!{keynum}><div class="memo_important !{important_css}">!{important}</div><div class="kadai_title" data-title="!{kadai_title}">!{kadai_title}</div></div>
                            <div class="kadai_ex_waku">
                                <div class="kadai_sinseino">!{sinseino}</div>
                                <div class="kadai_progress">!{progress}</div>
                                <div class="kadai_status">!{status}</div>
                                <div class="kadai_kikan !{color}">!{kikan}</div>
                            </div>
                        </div>
                    </div>
                    <div id="kadai_body_item">
                        <div class="kadai_item_waku">
                            <div class="kadai_bar"><div class="kadai_bar_progress"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <footer>
        <span>>></span>
        <p id="msg" class="msg"></p>
    </footer>
    <!-- 担当者選択リスト -->
    <div id="select_syain_scr">
        <ul id="select_syain">
            <li data-syaincd="!{value}">!{label}</li>
        </ul>
    </div>
    <!-- 日報作業時間入力 -->
    <div id="worktime_sel_scr">
        <ul id="worktime_sel">
            <li>&nbsp;</li>
            <li>0.5</li>
            <li>1.0</li>
            <li>1.5</li>
            <li>2.0</li>
            <li>2.5</li>
            <li>3.0</li>
            <li>3.5</li>
            <li>4.0</li>
            <li>4.5</li>
            <li>5.0</li>
            <li>5.5</li>
            <li>6.0</li>
            <li>6.5</li>
            <li>7.0</li>
            <li>7.5</li>
            <li>8.0</li>
            <li>8.5</li>
            <li>9.0</li>
            <li>9.5</li>
            <li>10.0</li>
            <li>10.5</li>
            <li>11.0</li>
            <li>11.5</li>
            <li>12.0</li>
        </ul>
    </div>
    <!-- 課題表示ダイアログ -->
    <form id="edit_kadai" title="課題情報">
        <table id="kadai_info">
            <tr>
                <th>No</th>
                <th>起票日</th>
                <th colspan="2">作業依頼者</th>
            </tr>
            <tr>
                <td><input type="text" id="dl_keynum" readonly></td>
                <td><input type="text" id="dl_kihyo_date" readonly></td>
                <td colspan="2"><input type="text" id="dl_irai_tan" readonly></td>
            </tr>
            <tr>
                <th>課題区分</th>
                <th>重要度</th>
                <th>担当課</th>
                <th>担当者</th>
            </tr>
            <tr>
                <td><input type="text" id="dl_kadai_kbn" readonly></td>
                <td><input type="text" id="dl_important" readonly></td>
                <td rowspan="3"><textarea id="dl_tantouka" readonly></textarea></td>
                <td rowspan="3"><textarea id="dl_tantou" readonly></textarea></td>
            </tr>
            <tr>
                <th colspan="2">ステータス</th>
            </tr>
            <tr>
                <td colspan="2"><div id="dl_status"><div id="dl_progress_bar"></div><div id="dl_progress">0%</div></div></td>
            </tr>
            <tr>
                <th colspan="4">タスク名１</th>
            </tr>
            <tr>
                <td colspan="4"><textarea id="dl_task1" readonly></textarea></td>
            </tr>
            <tr>
                <th colspan="4">タスク名２</th>
            </tr>
            <tr>
                <td colspan="4"><textarea id="dl_task2" readonly></textarea></td>
            </tr>
            <tr>
                <th>申請番号</th>
                <th>予定工数</th>
                <th>実績工数</th>
                <th>開発者</th>
            </tr>
            <tr>
                <td><input type="text" id="dl_sinseino" readonly></td>
                <td><input type="text" id="dl_yoteikosu" readonly></td>
                <td><input type="text" id="dl_jissekikosu" readonly></td>
                <td><input type="text" id="dl_dev_tan" readonly></td>
            </tr>
            <tr>
                <th colspan="2">開発予定期間</th>
                <th colspan="2">開発実績期間</th>
            </tr>
            <tr>
                <td><input type="text" id="dl_start_yotei" readonly></td>
                <td><input type="text" id="dl_end_yotei" readonly></td>
                <td><input type="text" id="dl_start_jisseki" readonly></td>
                <td><input type="text" id="dl_end_jisseki" readonly></td>
            </tr>
            <tr>
                <th colspan="4">備考</th>
            </tr>
            <tr>
                <td colspan="4"><textarea id="dl_bikou" readonly></textarea></td>
            </tr>
            <tr>
                <th>登録日</th>
                <th>登録者</th>
                <th>更新日</th>
                <th>更新者</th>
            </tr>
            <tr>
                <td><input type="text" id="dl_add_date" readonly></td>
                <td><input type="text" id="dl_add_syain" readonly></td>
                <td><input type="text" id="dl_upd_date" readonly></td>
                <td><input type="text" id="dl_upd_syain" readonly></td>
            </tr>
        </table>
    </form>    
    <!-- ストーリー編集ダイアログ -->
    <form id="edit_story">
        <div class="groupline">
            <label>名　　称</label><input type="text" id="dl_story_title" maxlength="50">
        </div>
        <div class="groupline mt10">
            <label>予定期間</label><input type="text" id="dl_story_start_yotei" maxlength="10"><label>～</label><input type="text" id="dl_story_end_yotei" maxlength="10">
        </div>
        <div class="groupline mt10">
            <label>背&ensp;景&ensp;色</label>
            <div class="sels_color bg0"></div>
            <div class="sels_color bg1"></div>
            <div class="sels_color bg2 "></div>
            <div class="sels_color bg3"></div>
            <div class="sels_color bg4"></div>
            <div class="sels_color bg5"></div>
            <div class="sels_color bg6"></div>
            <div class="sels_color bg7"></div>
            <div class="sels_color bg8"></div>
            <div class="sels_color bg9"></div>
            <div class="sels_color bg10"></div>
            <div class="sels_color bg11"></div>
            <div class="sels_color bg12"></div>
        </div>
        <div class="groupline mt10">
            <label title="進捗割合についてクリックでヘルプを開きます"><a href="taskdoc.html#ration" target="_blank">進捗割合</a></label><input type="checkbox" id="dl_story_ration_auto" checked><label for="dl_story_ration_auto">自動</label>
            <input type="text" id="dl_story_ration" value="0" disabled><label for="dl_story_ration">％</label>
            <label>担当者</label>
            <select id="dl_story_syain">
                <option value="!{value}">!{label}</option>
            </select>
        </div>
        <div class="groupline mt10">
            <label>詳細内容</label>
            <textarea id="dl_story_bikou"></textarea>
        </div>
        <div class="msg_bar">
            <span>>></span>
            <p id="story_msg" class="msg"></p>
        </div>
    </form>
    <!-- タスク編集ダイアログ -->
    <form id="edit_task">
        <div class="groupline">
            <label>名　　称</label><input type="text" id="dl_task_title" maxlength="50">
        </div>
        <div class="groupline mt10">
            <label title="進捗割合についてクリックでヘルプを開きます"><a href="taskdoc.html#ration" target="_blank">進捗割合</a></label><input type="checkbox" id="dl_task_ration_auto" checked><label for="dl_task_ration_auto">自動</label>
            <input type="text" id="dl_task_ration" value="0" disabled><label for="dl_task_ration">％</label>
            <label>進捗</label>
            <div id="dl_task_progress_tx"></div><div id="dl_task_progress"></div>
        </div>
        <div class="groupline mt10">
            <label>詳細内容</label>
            <textarea id="dl_task_bikou"></textarea>
        </div>
        <div class="groupline mt10">
            <label>日報入力</label>
            <input type="text" id="dl_task_nippodate">
            <label>作業時間</label>
            <select id="dl_task_worktime">
                <option value="0"></option>
                <option value="0.5">0.5</option>
                <option value="1.0">1.0</option>
                <option value="1.5">1.5</option>
                <option value="2.0">2.0</option>
                <option value="2.5">2.5</option>
                <option value="3.0">3.0</option>
                <option value="3.5">3.5</option>
                <option value="4.0">4.0</option>
                <option value="4.5">4.5</option>
                <option value="5.0">5.0</option>
                <option value="5.5">5.5</option>
                <option value="6.0">6.0</option>
                <option value="6.5">6.5</option>
                <option value="7.0">7.0</option>
                <option value="7.5">7.5</option>
                <option value="8.0">8.0</option>
                <option value="8.5">8.5</option>
                <option value="9.0">9.0</option>
                <option value="9.5">9.5</option>
                <option value="10.0">10.0</option>
                <option value="10.5">10.5</option>
                <option value="11.0">11.0</option>
                <option value="11.5">11.5</option>
                <option value="12.0">12.0</option>
            </select>
        </div>
        <div class="groupline mt5">
            <label>作業メモ</label>
            <input type="text" id="dl_task_nippomemo">
        </div>
        <div class="msg_bar">
            <span>>></span>
            <p id="task_msg" class="msg"></p>
        </div>
    </form>
    <!-- CSV出力ダイアログ -->
    <form id="csv_form" title="CSV出力">
        <div class="groupline">
            <label>集計期間</label><input type="text" id="dl_csv_f" maxlength="10"><label>～</label><input type="text" id="dl_csv_t" maxlength="10">
        </div>
        <div class="groupline">
            <label>出力タイプ</label>
            <input type="radio" name="dl_csv_type" id="dl_csv_type1" value="1" checked><label for="dl_csv_type1">課題毎</label>
            <input type="radio" name="dl_csv_type" id="dl_csv_type2" value="2"><label for="dl_csv_type2">日毎</label>
        </div>
        <div class="msg_bar">
            <span>>></span>
            <p id="csv_msg" class="msg"></p>
        </div>
    </form>    
</body>
</html>