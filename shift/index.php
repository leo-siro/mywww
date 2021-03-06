<?php
    session_start();
    if (isset($_GET["syaincd"]) || isset($_SESSION["shift"]["user"]) === false) {
        $_SESSION["shift"]["admin"] = false;
        require "pdo_connect.php";
        $header = getallheaders();
        $_SESSION["shift"]["user"] = isset($header["iv-user"])
                                    ? $header["iv-user"]
                                    : (isset($_GET["syaincd"])
                                        ? $_GET["syaincd"]
                                        : "99999");
        $con = new pdoConnect("schedule");
        $sql = "SELECT admin_user,toban_cd,toban_x,yobi_cd,toi_cd FROM setting";
        $ds = $con->pdo->query($sql);
        $row = $ds->fetch();
        $_SESSION["shift"]["admin"] = (strpos($row["admin_user"],$_SESSION["shift"]["user"]) > -1 ? true : false);
        $_SESSION["shift"]["toban_cd"] = $row["toban_cd"];
        $_SESSION["shift"]["toban_x"] = $row["toban_x"];
        $_SESSION["shift"]["yobi_cd"] = $row["yobi_cd"];
        $_SESSION["shift"]["toi_cd"] = $row["toi_cd"];
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
        $sql = "SELECT user_name,syozokucd,edit_flg FROM v_member WHERE syaincd = '{$_SESSION["shift"]["user"]}'";
        $ds = $con->pdo->query($sql);
        if ($row = $ds->fetch()) {
            $_SESSION["shift"]["user_name"] = $row["user_name"];
            $_SESSION["shift"]["syozokucd"] = $row["syozokucd"];
            $_SESSION["shift"]["edit_flg"] = $row["edit_flg"];
        } else {
            $_SESSION["shift"]["user_name"] = "";
            $_SESSION["shift"]["syozokucd"] = "999999";
            $_SESSION["shift"]["edit_flg"] = "0";
        }
    }
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <title>???????????????</title>
	<link rel="stylesheet" href="/CSS/jquery-ui.min.css" >
    <link rel="stylesheet" href="/CSS/jquery.contextMenu.min.css">
    <link rel="stylesheet" href="shift.css?v=3">
	<script src="/JS/jquery-3.5.1.min.js" defer></script>
	<script src="/JS/jquery-ui.min.js" defer></script>
	<script src="/JS/jquery.ui.datepicker-ja.min.js" defer></script>
    <script src="/JS/common.js" defer></script>
    <script src="/JS/jquery.contextMenu.min.js" defer></script>
    <script src="/JS/jquery.ui.position.js" defer></script>
    <script src="/JS/eventsource.js" defer></script>
    <script>
        const admin = <?php echo $_SESSION["shift"]["admin"] ? "true" : "false" ?>;
        const syaincd = <?php echo "'{$_SESSION["shift"]["user"]}'"; ?>;
        const user_name = <?php echo "'{$_SESSION["shift"]["user_name"]}'"; ?>;
        const syozokucd = <?php echo "'{$_SESSION["shift"]["syozokucd"]}'"; ?>;
        const edit_flg = <?php echo "{$_SESSION["shift"]["edit_flg"]}"; ?>;
        const toban_cd = <?php echo "'".$_SESSION["shift"]["toban_cd"]."'"; ?>;
        const toban_x = <?php echo "'".$_SESSION["shift"]["toban_x"]."'"; ?>;
        const yobi_cd = <?php echo "'".$_SESSION["shift"]["yobi_cd"]."'"; ?>;
        const toi_cd = <?php echo "'".$_SESSION["shift"]["toi_cd"]."'"; ?>;
        var stamps = <?php echo json_encode($_SESSION["shift"]["stamps"]);?>;
        var six = <?php echo json_encode($_SESSION["shift"]["stamp_s"]);?>;
    </script>
    <script src="shift.js?v=8" defer></script>
</head>
<body>
    <header>
        <img src="/Images/Leopalace21_Logo.gif">
        <input type="text" id="findfilter" placeholder="?????????????????????">
        <button id="findclear">C</button>
        <a href="doc.html" target="_new" id="doc">?????????</a>
        <button id="prev_ym">???</button>
        <p id="shift_ym" class="pwaku"></p>
        <button id="next_ym">???</button>
        <button id="reload" title="?????????"><img src="images/reload.png"></button>
        <button id="excel">Excel</button>
        <div id="data_mode">
            <input type="radio" id="data_kakutei" name="data_mode"><label for="data_kakutei">?????????</label>
            <input type="radio" id="data_kousin" name="data_mode" checked><label for="data_kousin">?????????</label>
        </div>
        <label for="kokyu_cnt">?????????</label>
        <p id="kokyu_cnt" class="pwaku"></p>
        <p id="user_name"></p>
    </header>
    <div id="contents">
        <main>
            <div id="main_head">
                <div id="main_head_ctrl">
                    <div id="main_title" class="row">?????????????????????</div>
                </div>
                <div id="main_head_item">
                    <div id="days" class="flex">
                        <p class="cells">1</p>
                        <p class="cells">2</p>
                        <p class="cells">3</p>
                        <p class="cells">4</p>
                        <p class="cells">5</p>
                        <p class="cells">6</p>
                        <p class="cells">7</p>
                        <p class="cells">8</p>
                        <p class="cells">9</p>
                        <p class="cells">10</p>
                        <p class="cells">11</p>
                        <p class="cells">12</p>
                        <p class="cells">13</p>
                        <p class="cells">14</p>
                        <p class="cells">15</p>
                        <p class="cells">16</p>
                        <p class="cells">17</p>
                        <p class="cells">18</p>
                        <p class="cells">19</p>
                        <p class="cells">20</p>
                        <p class="cells">21</p>
                        <p class="cells">22</p>
                        <p class="cells">23</p>
                        <p class="cells">24</p>
                        <p class="cells">25</p>
                        <p class="cells">26</p>
                        <p class="cells">27</p>
                        <p class="cells">28</p>
                        <p class="cells day29">29</p>
                        <p class="cells day30">30</p>
                        <p class="cells day31">31</p>
                    </div>
                    <div id="week" class="flex">
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells">???</p>
                        <p class="cells day29">???</p>
                        <p class="cells day30">???</p>
                        <p class="cells day31">???</p>
                    </div>
                </div>
                <div id="main_head_memo">
                    <div class="row">
                        <div class="memo_cell memo_kokyu">?????????</div>
                        <div class="memo_cell memo_toban1">?????????<br>9:00</div>
                        <div class="memo_cell memo_toban2">?????????<br>10:00</div>
                    </div>
                </div>
            </div>
            <div id="main_body">
                <div class="flex">
                    <div id="main_body_ctrl">
                        <div class="row" data-syozokucd=!{syozokucd} data-prev_kokyu_cnt=!{prev_kokyu_cnt} data-user_flg=!{user_flg}>
                            <p class="syaincd">!{syaincd}</p>
                            <p class="syainnm">!{syainnm}</p>
                            <p class="itemnm">!{itemnm}</p>
                        </div>
                    </div>
                    <div id="main_body_item">
                        <div class="row" data-syaincd="!{syaincd}">
                            <div class="cells day1 !{add0}" title="!{memo0}" data-title="!{memo0}" data-id="!{id0}">!{day0}</div>
                            <div class="cells day2 !{add1}" title="!{memo1}" data-title="!{memo1}" data-id="!{id1}">!{day1}</div>
                            <div class="cells day3 !{add2}" title="!{memo2}" data-title="!{memo2}" data-id="!{id2}">!{day2}</div>
                            <div class="cells day4 !{add3}" title="!{memo3}" data-title="!{memo3}" data-id="!{id3}">!{day3}</div>
                            <div class="cells day5 !{add4}" title="!{memo4}" data-title="!{memo4}" data-id="!{id4}">!{day4}</div>
                            <div class="cells day6 !{add5}" title="!{memo5}" data-title="!{memo5}" data-id="!{id5}">!{day5}</div>
                            <div class="cells day7 !{add6}" title="!{memo6}" data-title="!{memo6}" data-id="!{id6}">!{day6}</div>
                            <div class="cells day8 !{add7}" title="!{memo7}" data-title="!{memo7}" data-id="!{id7}">!{day7}</div>
                            <div class="cells day9 !{add8}" title="!{memo8}" data-title="!{memo8}" data-id="!{id8}">!{day8}</div>
                            <div class="cells day10 !{add9}" title="!{memo9}" data-title="!{memo9}" data-id="!{id9}">!{day9}</div>
                            <div class="cells day11 !{add10}" title="!{memo10}" data-title="!{memo10}" data-id="!{id10}">!{day10}</div>
                            <div class="cells day12 !{add11}" title="!{memo11}" data-title="!{memo11}" data-id="!{id11}">!{day11}</div>
                            <div class="cells day13 !{add12}" title="!{memo12}" data-title="!{memo12}" data-id="!{id12}">!{day12}</div>
                            <div class="cells day14 !{add13}" title="!{memo13}" data-title="!{memo13}" data-id="!{id13}">!{day13}</div>
                            <div class="cells day15 !{add14}" title="!{memo14}" data-title="!{memo14}" data-id="!{id14}">!{day14}</div>
                            <div class="cells day16 !{add15}" title="!{memo15}" data-title="!{memo15}" data-id="!{id15}">!{day15}</div>
                            <div class="cells day17 !{add16}" title="!{memo16}" data-title="!{memo16}" data-id="!{id16}">!{day16}</div>
                            <div class="cells day18 !{add17}" title="!{memo17}" data-title="!{memo17}" data-id="!{id17}">!{day17}</div>
                            <div class="cells day19 !{add18}" title="!{memo18}" data-title="!{memo18}" data-id="!{id18}">!{day18}</div>
                            <div class="cells day20 !{add19}" title="!{memo19}" data-title="!{memo19}" data-id="!{id19}">!{day19}</div>
                            <div class="cells day21 !{add20}" title="!{memo20}" data-title="!{memo20}" data-id="!{id20}">!{day20}</div>
                            <div class="cells day22 !{add21}" title="!{memo21}" data-title="!{memo21}" data-id="!{id21}">!{day21}</div>
                            <div class="cells day23 !{add22}" title="!{memo22}" data-title="!{memo22}" data-id="!{id22}">!{day22}</div>
                            <div class="cells day24 !{add23}" title="!{memo23}" data-title="!{memo23}" data-id="!{id23}">!{day23}</div>
                            <div class="cells day25 !{add24}" title="!{memo24}" data-title="!{memo24}" data-id="!{id24}">!{day24}</div>
                            <div class="cells day26 !{add25}" title="!{memo25}" data-title="!{memo25}" data-id="!{id25}">!{day25}</div>
                            <div class="cells day27 !{add26}" title="!{memo26}" data-title="!{memo26}" data-id="!{id26}">!{day26}</div>
                            <div class="cells day28 !{add27}" title="!{memo27}" data-title="!{memo27}" data-id="!{id27}">!{day27}</div>
                            <div class="cells day29 !{add28}" title="!{memo28}" data-title="!{memo28}" data-id="!{id28}">!{day28}</div>
                            <div class="cells day30 !{add29}" title="!{memo29}" data-title="!{memo29}" data-id="!{id29}">!{day29}</div>
                            <div class="cells day31 !{add30}" title="!{memo30}" data-title="!{memo30}" data-id="!{id30}">!{day30}</div>
                        </div>
                    </div>
                    <div id="main_body_memo">
                        <div class="row">
                            <div class="memo_cell memo_kokyu">!{koucnt}</div>
                            <div class="memo_cell memo_toban1">!{asacnt}</div>
                            <div class="memo_cell memo_toban2">!{toucnt}</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <nav>
            <input type="checkbox" id="edit_mode"><label for="edit_mode" class="buttons">??????Mode</label>
            <div id="stamp_group">
            </div>
            <button id="edit_none" class="buttons"  title="???????????????????????????????????????????????????????????????">????????????</button>
            <!-- <button id="stamp_add" class="buttons" title="???????????????????????????????????????????????????????????????????????????????????????????????????">??????</button> -->
        </nav>
<?php if ($_SESSION["shift"]["admin"]): ?>
        <!-- ??????????????? -->
        <nav id="admin_group">
            <button id="set_toban" class="buttons">????????????</button>
            <button id="set_kakutei" class="buttons">????????????</button>
            <button id="set_holiday" class="buttons">????????????</button>
            <button id="set_syain" class="buttons">????????????</button>
            <button id="set_haken" class="buttons">????????????</button>
            <button id="set_tempsyain" class="buttons"><span class="small">?????????</span>??????</button>
            <button id="set_button" class="buttons"><span class="small">?????????</span>??????</button>
            <button id="set_admin" class="buttons"><span class="small">?????????</span>??????</button>
            <button id="doc2" class="buttons" onclick="window.open('docadmin.html')"><span class="small">?????????</span></button>
        </nav>
<?php endif ?>
    </div>
    <footer>
        <span>>></span>
        <p id="msg" class="msg"></p>
    </footer>
    <!-- ???????????? -->
    <div id="today_frame"></div>
    <!-- ?????????????????????????????? -->
    <div id="schdule_input_form">
        <div id="schdule_waku">
            <input type="text" id="sc_moji" maxlength="2">
            <input type="text" id="sc_title" maxlength="20">
        </div>
    </div>
<?php if ($_SESSION["shift"]["admin"]): ?>
    <!-- ??????????????? -->
    <!-- ???????????? -->
    <div id="syain_form" title="????????????">
        <table class="headerlock" id="syain_table">
            <thead>
                <tr>
                    <th class="sf_syaincd">??????CD</th>
                    <th class="sf_syainnm">?????????</th>
                    <th class="sf_itemnm">??????</th>
                    <th class="sf_toban">??????</th>
                    <th class="sf_edit">????????????</th>
                    <th class="sf_del">??????</th>
                </tr>
            </thead>
            <tbody>
                <tr class="syain_rec">
                    <td class="sf_syaincd">!{syaincd}</td>
                    <td class="sf_syainnm">!{syainnm}</td>
                    <td class="sf_itemnm">!{itemnm}</td>
                    <td>
                        <select class="sf_toban">
                            <option value="0">????????????</option>
                            <option value="1">?????????</option>
                            <option value="2">????????????</option>
                        </select>
                    </td>
                    <td>
                        <select class="sf_edit">
                            <option value="0">????????????</option>
                            <option value="1">????????????</option>
                            <option value="9">??????</option>
                        </select>
                    </td>
                    <td class="sf_del"><button>&#10006;</button></td>
                </tr>
            </tbody>
        </table>
        <div class="msg_bar">
            <span>>></span>
            <p id="sf_msg" class="msg"></p>
        </div>
    </div>
    <!-- ?????????????????? -->
    <div id="haken_form" title="??????????????????">
        <table class="headerlock" id="haken_table">
            <thead>
                <tr>
                    <th class="kf_syaincd">??????CD</th>
                    <th class="kf_usernm">??????</th>
                    <th class="kf_corpnm">?????????</th>
                    <th class="kf_syozoku">??????</th>
                    <th class="kf_del">??????</th>
                </tr>
            </thead>
            <tbody>
                <tr class="syain_rec">
                    <td class="kf_syaincd">!{syaincd}</td>
                    <td><input type="text" class="kf_usernm" value="!{usernm}"></td>
                    <td><input type="text" class="kf_corpnm" value="!{corpnm}"></td>
                    <td>
                        <select class="kf_syozoku">
                            <option value="!{value}">!{label}</option>
                        </select>
                    </td>
                    <td class="kf_del"><button>&#10006;</button></td>
                </tr>
            </tbody>
        </table>
        <div class="msg_bar">
            <span>>></span>
            <p id="kf_msg" class="msg"></p>
        </div>
    </div>
    <!-- ???????????????????????? -->
    <div id="tempsyain_form" title="????????????????????????">
        <table class="headerlock" id="tempsyain_table">
            <thead>
                <tr>
                    <th class="tf_syaincd">??????CD</th>
                    <th class="tf_name">??????</th>
                    <th class="tf_kana">??????</th>
                    <th class="tf_itemnm">??????</th>
                    <th class="tf_syozoku">??????</th>
                    <th class="tf_status">??????</th>
                    <th class="tf_del">??????</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="tf_syaincd">!{syaincd}</td>
                    <td><input type="text" class="tf_name" value="!{name}"></td>
                    <td><input type="text" class="tf_kana" value="!{kana}"></td>
                    <td><input type="text" class="tf_itemnm" value="!{itemnm}"></td>
                    <td>
                        <select class="tf_syozoku">
                            <option value="!{value}">!{label}</option>
                        </select>
                    </td>
                    <td class="tf_status">!{status}</td>
                    <td class="tf_del"><button>&#10006;</button></td>
                </tr>
            </tbody>
        </table>
        <div class="msg_bar">
            <span>>></span>
            <p id="tf_msg" class="msg"></p>
        </div>
    </div>
    <!-- ???????????? -->
    <div id="holiday_form" title="?????????????????????">
        <select id="holiday_yy">
        </select>
        <table class="headerlock" id="holiday_table">
            <thead>
                <tr>
                    <th class="hf_date">??????</th>
                    <th class="hf_biko">??????</th>
                    <th class="hf_toban">????????????</th>
                    <th class="hf_del">??????</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><input type="text" class="hf_date" value="!{holiday}" data-sv_val="!{holiday}" readonly></td>
                    <td><input type="text" class="hf_biko" value="!{holiday_biko}" data-sv_val="!{holiday_biko}"></td>
                    <td class="hf_toban"><input type="checkbox" class="hf_toban" data-sv_val="!{toban}"></td>
                    <td class="hf_del"><button>&#10006;</button></td>
                </tr>
            </tbody>
        </table>
        <div class="msg_bar">
            <span>>></span>
            <p id="hf_msg" class="msg"></p>
        </div>
    </div>
    <!-- ??????????????? -->
    <div id="button_form" title="???????????????">
        <table class="headerlock" id="stamp_table">
            <thead>
                <tr>
                    <th class="sp_id">CD</th>
                    <th class="sp_type">?????????</th>
                    <th class="sp_btn">?????????</th>
                    <th class="sp_tx">????????????</th>
                    <th class="sp_title">??????</th>
                    <th class="sp_color">?????????</th>
                    <th class="sp_del">??????</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="sp_id">!{id}</td>
                    <td>
                        <select class="sp_type" data-sv_val="!{type}">
                            <option value="0">??????</option>
                            <option value="1">????????????</option>
                            <option value="2">????????????</option>
                        </select>
                    </td>
                    <td><input type="text" class="sp_btn" value="!{btn}" data-sv_val="!{btn}" maxlength="2"></td>
                    <td><input type="text" class="sp_tx" value="!{tx}" data-sv_val="!{tx}" maxlength="2"></td>
                    <td><input type="text" class="sp_title" value="!{title}" data-sv_val="!{title}"></td>
                    <td>
                        <select class="sp_color" data-sv_val="!{color}">
                            <option class="bg0" value="0"></option>
                            <option class="bg1" value="1">No1</option>
                            <option class="bg2" value="2">No2</option>
                            <option class="bg3" value="3">No3</option>
                            <option class="bg4" value="4">No4</option>
                            <option class="bg5" value="5">No5</option>
                            <option class="bg6" value="6">No6</option>
                            <option class="bg7" value="7">No7</option>
                            <option class="bg8" value="8">No8</option>
                            <option class="bg9" value="9">No9</option>
                            <option class="bg10" value="10">No10</option>
                            <option class="bg11" value="11">No11</option>
                            <option class="bg12" value="12">No12</option>
                        </select>
                    </td>
                    <td class="sp_del"><button>&#10006;</button></td>
                </tr>
            </tbody>
        </table>
        <div class="msg_bar">
            <span>>></span>
            <p id="sp_msg" class="msg"></p>
        </div>
    </div>
    <!-- ??????????????? -->
    <div id="admin_form" title="???????????????">
        <div>
            <label>??????CD</label><input type="text" id="ad_syain" maxlength="100"><label>??????????????????CD??????????????????????????????</label>
        </div>
        <div>
            <label>??????CD</label><input type="text" id="ad_toban" maxlength="2">
            <label>????????CD</label><input type="text" id="ad_toban_x" maxlength="2">
            <label>??????CD</label><input type="text" id="ad_yobi" maxlength="2">
            <label>???CD</label><input type="text" id="ad_toi" maxlength="2">
            <label>?????????</label><input type="text" id="ad_tobansuu" maxlength="1">
        </div>
        <div>
            <label>??????????????????CD</label><input type="text" id="ad_deptcd" maxlength="2">
            <label>????????????</label><input type="text" id="ad_jyogai" maxlength="100">
        </div>
        <div class="msg_bar">
            <span>>></span>
            <p id="ad_msg" class="msg"></p>
        </div>
    </div>
<?php endif ?>
	<!-- ??????????????????????????????  -->
	<form name="downloadform" method="GET" action="download.php">
		<input type="hidden" name="file" id="exfile" value="excel/???????????????.xlsm">
	</form>
</body>
</html>