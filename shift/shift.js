var msgid = '#msg';
var msghd = null;
var syori_ym;
var today = new Date();
var initflg = true;
var findcd = '';
var wflg = false;
var sv_item, sv_memo, sv_item_k, sv_memo_k, sv_holiday;
var kakutei_flg = false;
var max_upd = '';
// var add_stamp;
$(function() {
    // if (syaincd === '95H04') {
    //     const es = new EventSource('msg_events.php?syaincd='+syaincd);
    //     es.addEventListener('message', function(e) {
    //         const data = JSON.parse(e.data);
    //         if (data.max_upd > max_upd) {
    //             // alert('OK');
    //             // 更新分のみを再読込する処理を作成できれば、実装する 2020/11/06
    //         }
    //     });
    // }
    // 初期処理
    $('main').tooltip();
    // ユーザー名設定 admin、syaincd、user_name はindex.phpにて初期値設定
    if (user_name === '') {
        $('#user_name').hide();
    } else {
        $('#user_name').text(user_name);
    }
    if (admin) {
        $('#holiday_table tbody').databind();
        $('#syain_table tbody').databind();
        $('#stamp_table tbody').databind();
        var wyy = today.getMonth() < 3 ? today.getFullYear() - 2 : today.getFullYear() - 1;
        $('#holiday_yy').append($('<option>').text(wyy+'年度').val(wyy));
        var wyy = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();
        $('#holiday_yy').append($('<option selected>').text(wyy+'年度').val(wyy));
        wyy++;
        if (today.getMonth() < 3) {
            $('#holiday_yy').append($('<option>').text(wyy+'年度').val(wyy));
        }
    }
    $('#main_body_ctrl').databind();
    $('#main_body_item').databind();
    $('#main_body_memo').databind();
    // ボタン装飾
    $('#stamp_group,#data_mode').buttonset();
    $('header button').button();
    $('nav button').button();
    $('nav input[type="checkbox"]').button();
    // add_stamp = JSON.parse(localStorage.getItem('shift_add_stamp')) || [];
    dispStamps();
    function dispStamps() {
        for (var i=0; i<six.length; i++) {
            $('#stamp_group').append(
                '<input name="stamp" class="ui-checkboxradio ui-helper-hidden-accessible" id="'+six[i]+'" type="radio">'+
                '<label class="buttons ui-button ui-widget ui-checkboxradio-radio-label ui-controlgroup-item ui-checkboxradio-label ui-corner-right add_stmap" for="'+six[i]+
                '" title="'+stamps[six[i]].title+'">'+
                '<span class="ui-checkboxradio-icon ui-corner-all ui-icon ui-icon-background ui-icon-blank></span>'+
                '<span class="ui-checkboxradio-icon-space"> </span>'+stamps[six[i]].btn+'</label>'
            );
        }
        $('#stamp_group').buttonset('refresh');
    }
    // ■ カレンダー関連処理
    syori_ym = new Date(sessionStorage.getItem('shift_ym') || new Date().formatDate('YYYY/MM/01'));
    loadData();
    // 処理年月変更（前月クリック）
    $('#prev_ym').click(function() {
        syori_ym.addMonth(-1);
        loadData();
    });
    // 処理年月変更（翌月クリック）
    $('#next_ym').click(function() {
        // 鈴木マネジャー依頼で翌月制限を翌々月制限に変更 2022/3/18
        var wtoday = new Date(new Date().formatDate('YYYY/MM/01')).addMonth(2);
        // if ((today.formatDate('YYYYMM') >= syori_ym.formatDate('YYYYMM')) || (today.formatDate('MM') === '11' && syori_ym.formatDate('MM') === '12')) {
        if ((wtoday.formatDate('YYYYMM') > syori_ym.formatDate('YYYYMM'))) {
            syori_ym.addMonth(1);
            loadData();
        } else {
            showMessage('これより先のデータは選択できません','#0000ff');
        }
    });
    // ウインドウフォーカス
    $(window).focus(function() {
        var wtoday = new Date();
        // 読み込まれた日付と本日が違っている場合再読込を行う
        if (today.formatDate('YYYYMMDD') !== wtoday.formatDate('YYYYMMDD')) {
            today = wtoday;
            loadData();
        }
    });
    // 再読込
    $('#reload').click(function() {
        loadData();
    });
	// 画面遷移があったとき
	$(window).on('beforeunload', function (event) {
		if (edit) {
            event.returnValue = '変更が反映されていませんがよろしいですか？';
			return '変更が反映されていませんがよろしいですか？';
		}
	});
    // データ取得
    function loadData() {
        clearMessage();
        var para = {
            syori_ym: syori_ym.formatDate("YYYY/MM/DD"),
            syaincd: syaincd,
            data_mode: 1
        }
        $('#data_kakutei').button('disable');
        kakutei_flg = false;
        $('input[name="stamp"]').button('disable');
        $('#edit_none').button('disable');
        BlockScreen('読込中 ...');
        Ajax('shift.php?func=loadData',para).done(function(ret) {
            if (ret.code === 'OK') {
                if (initflg) {
                    $('#findfilter').autocomplete({
                        source: ret.syozoku,
                        minLength: 0,
                        search: function (e, ui) {
                            if (e.keyCode == 229) return false;
                            return true;
                        },
                        select: function (e, ui) {
                            $(this).val(ui.item.label);
                            findcd = ui.item.value;
                            filterData();
                            return false;
                        }
                    }).click(function () {
                        $(this).autocomplete('search', '');
                    }).change(function () {
                        findcd = '';
                        filterData();
                    });
                    if (admin) {
                        $('select.kf_syozoku').databind();
                        $('select.kf_syozoku').databind(ret.syozoku);
                        $('select.tf_syozoku').databind();
                        $('select.tf_syozoku').databind(ret.syozoku);
                        $('#haken_table tbody').databind();
                        $('#tempsyain_table tbody').databind();
                    }
                }
                max_upd = ret.max_upd;
                initflg = false;
                var sv_syozoku = '';
                var sv_syozokucd = '';
                $('#main_body_ctrl').databind(ret.head,null,function(rec,i) {
                    if (sv_syozoku !== rec.syozokunm) {
                        // フィルター用に社員(user_flg='0')のみ所属CDを設定
                        $('#main_body_ctrl .row').eq(i).before('<div class="groupline" data-syozokucd="'+rec.syozokucd+'">'+rec.syozokunm+'</div>');
                        sv_syozoku = rec.syozokunm;
                        sv_syozokucd = rec.syozokucd;
                    } else if(rec.user_flg === '1' && sv_syozokucd.indexOf(rec.syozokucd) === -1) {
                        sv_syozokucd += ',' + rec.syozokucd;
                        $('#main_body_ctrl .groupline:last').data('syozokucd',sv_syozokucd);
                    }
                    if(rec.user_flg === '1') {
                        $('#main_body_ctrl .itemnm:last').width(0).text(rec.syozokunm).css('overflow','hidden');
                    }
                });
                sv_item = ret.item;
                sv_memo = ret.memo;
                if (ret.kakutei) {
                    $('#data_kakutei').button('enable');
                    kakutei_flg = true;
                    sv_item_k = ret.item_k;
                    sv_memo_k = ret.memo_k;
                }
                dataSet(sv_item,sv_memo);
                $('#main_body_ctrl,#main_body_item,#main_body_memo').show();
                sv_holiday = ret.holiday;
                setCalender(ret.holiday,ret.holiday_biko);
                if (findcd !== '' || $('#findfilter').val() !== '') {
                    filterData();
                }
            } else {
                showMessage('データ読込に失敗しました。','#ff0000');
            }
        }).fail(function(ret) {
            showMessage('データ読込に失敗しました。','#ff0000');
        }).always(function(ret) {
            UnBlockScreen();
        });
    }
    $('#data_kakutei,#data_kousin').change(function() {
        BlockScreen('読込中');
        if ($('#data_kakutei').prop('checked')) {
            $('#edit_mode').button('disable');
            dataSet(sv_item_k,sv_memo_k);
        } else {
            $('#edit_mode').button('enable');
            dataSet(sv_item,sv_memo);
        }
        var w_syori = new Date(syori_ym);
        for (var i=0; i<31; i++) {
            if (w_syori.getMonth() !== syori_ym.getMonth()) {
                // 月末の非表示
                $('.day'+(i+1)).hide();
            } else {
                if (i > 26) {
                    // 月末の表示
                    $('.day'+(i+1)).show();
                }
            }
            if (sv_holiday[i] === "1" || w_syori.getDay() === 0 || w_syori.getDay() === 6) {
                $('.row .day'+(i+1)).addClass('kokyu');
            }
            w_syori.addDay(1);
        }
        if (findcd !== '' || $('#findfilter').val() !== '') {
            filterData();
        }
        UnBlockScreen();
    });
    function dataSet(item,memo) {
        var j=0;
        $('#main_body_item').databind(item,null,function(rec,i) {
            if ($('#main_body_ctrl div').eq(j).hasClass('groupline')) {
                $('#main_body_item .row').eq(i).before('<div class="groupline"></div>');
                j++;
            }
            j++;
            for (k=0; k<31; k++) {
                if (rec['memo'+k] && rec['memo'+k] !== '') {
                    $('#main_body_item .row').eq(i).children('div:eq('+k+')').append('<div class="memo">★</div>');
                }
            }
        });
        var j=0;
        $('#main_body_memo').databind(memo,null,function(rec,i) {
            if ($('#main_body_ctrl div').eq(j).hasClass('groupline')) {
                $('#main_body_memo .row').eq(i).before('<div class="groupline"></div>');
                j++;
            }
            j++;
        });
    }
    $('#findclear').click(function() {
        $('#findfilter').val('').change();
    });
    function filterData() {
        $('#main_body_ctrl > div').each(function(i) {
            if ((findcd !== '' && String($(this).data('syozokucd')).indexOf(findcd) > -1)
             || (findcd === '' && $(this).text().indexOf($('#findfilter').val()) > -1)) {
                $(this).show();
                $('#main_body_item > div').eq(i).show();
                $('#main_body_memo > div').eq(i).show();
            } else {
                $(this).hide();
                $('#main_body_item > div').eq(i).hide();
                $('#main_body_memo > div').eq(i).hide();
            }
        });
        dispTodayFrame();
    }
// --------------------------------------------------------------------------------------------------------------------
    // カレンダーセット
    function setCalender(holiday,holiday_biko) {
        $('#today_frame').hide();
        var week = ['日','月','火','水','木','金','土'];
        var w_syori = new Date(syori_ym);
        var kokyu_cnt = 0;
        $('#shift_ym').text(syori_ym.formatDate('YYYY年MM月'));
        for (var i=0; i<31; i++) {
            if (w_syori.getMonth() !== syori_ym.getMonth()) {
                // 月末の非表示
                $('.day'+(i+1)).hide();
            } else {
                if (i > 26) {
                    // 月末の表示
                    $('.day'+(i+1)).show();
                }
                $('#week .cells').eq(i).text(week[w_syori.getDay()]);
                $('#week .cells').eq(i).removeClass('holiday');
                $('#week .cells').eq(i).removeClass('saturday');
                if (holiday[i] === "1" || w_syori.getDay() === 0 || w_syori.getDay() === 6) {
                    if (holiday[i] === "1") {
                        // 祝日
                        $('#week .cells').eq(i).prop('title',holiday_biko[i])
                    }
                    if (w_syori.getDay() === 6) {
                        // 土曜
                        $('#week .cells').eq(i).addClass('saturday');
                    } else {
                        // 祝日・日曜
                        $('#week .cells').eq(i).addClass('holiday');
                    }
                    $('.row .day'+(i+1)).addClass('kokyu');
                    kokyu_cnt++;
                }
            }
            w_syori.addDay(1);
        }
        sessionStorage.setItem('shift_ym',syori_ym.formatDate('YYYY/MM/01'));
        // 公休日数をセット
        $('#kokyu_cnt').text(kokyu_cnt);
        // 当日枠を表示
        dispTodayFrame();
    }
    // ウインドウ枠変更時
    $(window).resize(function() {
        // 当日枠を表示
        dispTodayFrame();
    });
    // 当日枠を表示
    function dispTodayFrame() {
        if ($('#edit_mode').prop('checked') === false && today.getMonth() === syori_ym.getMonth()) {
            $('#today_frame').show();
            var pos = $('#days .cells').eq(today.getDate()-1).offset();
            $('#today_frame').offset({top:pos.top-2,left:pos.left-1});
            $('#today_frame').width($('#days .cells').eq(today.getDate()-1).width()-2);
            if ($('#main_body').height() < $('#main_body_ctrl').height()) {
                $('#today_frame').height($('#main_body').offset().top+$('#main_body').height()-pos.top)
            } else {
                $('#today_frame').height($('#main_body_ctrl').offset().top+$('#main_body_ctrl').height()-pos.top)
            }
        }
    }
// --------------------------------------------------------------------------------------------------------------------
    // 編集モードクリック
    // var stamp = '';
    // var stamp_title = '';
    var s_id = "";
    var sv_item;
    var edit = false;
    $('#edit_mode').change(function() {
        if ($(this).prop('checked')) {
            edit = false;
            showMessage('編集モード下の各予定を選択し予定表へクリックやドラッグで入力、右クリックで消去、ダブルクリックでコメント入力','#0000ff');
            // 編集範囲のみ表示
            if (edit_flg < 2) {
                findcd = syozokucd;
                filterData();
            }
            // 当日枠を非表示
            $('#today_frame').hide();
            $('input[name="stamp"]').button('enable');

            $('#edit_none').button('enable');
            $('header button').button('disable');
            $('#data_kakutei').button('disable');
            $('#admin_group button').button('disable');
            $('header input').prop('disabled',true);
            $('#main_body_item .cells').hover(
                function(e) {
                    // mousedownやdblclickでは何故かtitleが正しく制御できない（1日調べたがわからない）
                    // 下記マウスオーバー時に不整合を正す。。。
                    if ($(this).attr('title') !== $(this).data('title')) {
                        $(this).attr('title',$(this).data('title'));
                    }
                    if (edit_flg === 0 && syaincd == $(this).parent().data('syaincd') || edit_flg > 0) {
                        setStamp(e,$(this));
                    }
                },
                function(e) {
                    if (edit_flg === 0 && syaincd == $(this).parent().data('syaincd') || edit_flg > 0) {
                        $(this).text($(this).data('sv')).css('color','');
                        if ($(this).data('title') !== '') {
                            $(this).append('<div class="memo">★</div>');
                        }
                    }
                }
            ).mousedown(function(e) {
                if (edit_flg === 0 && syaincd == $(this).parent().data('syaincd') || edit_flg > 0) {
                    setStamp(e,$(this));
                }
            }).dblclick(function(e) {
                if (edit_flg === 0 && syaincd == $(this).parent().data('syaincd') || edit_flg > 0) {
                    showMessage('コメントは２０文字まで入力可');
                    $('#schdule_input_form').show();
                    sv_item = $(this);
                    $('#schdule_waku').offset({top:sv_item.offset().top+25,left:sv_item.offset().left});
                    // $('#sc_moji').width(sv_item.width()-5).val(sv_item.text()).focus();
                    $('#sc_title').width(sv_item.width()*2-4).val(sv_item.data('title')).focus();
                }
            });
        } else {
            clearMessage();
            if (edit) {
                var para = [];
                var err = false;

                $('#main_body_item .row').each(function(i) {
                    // 月間公休数と週毎公休数をチェックするかのフラグ
                    // 社員で且つ、当日が20を超えているか、当月以前はチェック対象
                    var chkflg = ($('#main_body_ctrl .row').eq(i).data('user_flg') === 0
                                && (today.getDate() > 20
                                 || today.formatDate('YYYYMM') >= syori_ym.formatDate('YYYYMM'))) ? true : false;
                    if ($(this).data('edit')) {
                        if (chkflg && $('#main_body_memo .memo_kokyu').eq(i).text() !== '' && $('#main_body_memo .memo_kokyu').eq(i).text() !== $('#kokyu_cnt').text()) {
                            if (confirm('公休数が違いますがよろしいですか？') === false) {
                                err = true;
                                return false;
                            }
                        }
                        var kokyu_cnt = $('#main_body_ctrl .row').eq(i).data('prev_kokyu_cnt');
                        var kokyu_msg = '';
                        var week_cnt = 1;
                        var yotei_var = '';
                        var yotei_memo = '';
                        $(this).children('.cells').each(function(j) {
                            if ($(this).is(':visible')) {
                                if (chkflg) {
                                    if ($(this).data('id') === 100) {
                                        kokyu_cnt++;
                                    }
                                    if ($('#week .cells').eq(j).text() === '土') {
                                        if (kokyu_cnt < 2) {
                                            kokyu_msg += String(week_cnt)+'週目の公休数が不足しています。\n';
                                        }
                                        week_cnt++;
                                        kokyu_cnt = 0;
                                    }
                                }
                                yotei_var += (j > 0 ? ',':'')+$(this).data('id');
                                yotei_memo += (j > 0 ? ',':'')+($(this).data('title') ? $(this).data('title') : '');
                            }
                        });
                        if (kokyu_msg !== '') {
                            if (confirm(kokyu_msg+'\n登録してもよろしいですか？') === false) {
                                err = true;
                                return false;
                            }
                        }
                        para.push({
                            syaincd: $(this).data('syaincd'),
                            yotei_var: yotei_var,
                            yotei_memo: yotei_memo
                        });
                    }
                });
                if (err) {
                    $(this).prop('checked',true);
                    $(this).button('refresh');
                    return false;
                }
                Ajax('shift.php?func=regData',{para: para, syori_ym: syori_ym.formatDate('YYYY/MM/DD')}).done(function(ret) {
                    if (ret.code === 'OK') {
                        edit = false;
                    } else {
                        alert('データ登録に失敗しました。再読込します。');
                        location.reload();
                    }
                }).fail(function(ret) {
                    alert('データ登録に失敗しました。再読込します。');
                    location.reload();
                }).always(function(ret) {
                    UnBlockScreen();
                });
            }
            findcd = '';
            $('#findfilter').val('');
            filterData();
            $('#edit_none').button('disable');
            $('input[name="stamp"]').button('disable');
            $('header button').button('enable');
            $('#admin_group button').button('enable');
            $('header input').prop('disabled',false);
            if (kakutei_flg) {
                $('#data_kakutei').button('enable');
            }
            $('#main_body_item .cells').off();
            if (today.getMonth() === syori_ym.getMonth()) {
                $('#today_frame').show();
            }
        }
    });
    $('#schdule_waku input').click(function() {
        return false;
    });
    $('#schdule_waku input').keypress(function(e) {
        if (e.which === 13) {
            $('#schdule_input_form').click();
            return false;
        }
    });
    // 予定入力完了後
    $('#schdule_input_form').click(function() {
        $(this).hide();
        clearMessage();
        if ($('#sc_title').val() !== sv_item.prop('title')) {
            // スケジュール入力
            sv_item.prop('title',$('#sc_title').val());
            sv_item.data({title:$('#sc_title').val()});
            edit = true;
            var r = $('#main_body_item .row').index(sv_item.parent());
            // 編集フラグセット
            if ($('#main_body_item .row').eq(r).data('edit') === undefined) {
                $('#main_body_item .row').eq(r).data('edit',1);
            }
            // コメントマーク
            if (sv_item.children('div').length === 0 && $('#sc_title').val() !== '') {
                sv_item.append('<div class="memo">★</div>');
            } else if (sv_item.children('div').length === 1 && $('#sc_title').val() === '') {
                sv_item.children('div').remove();
            }
        }
    });
    function setStamp(e,$this) {
        if (s_id !== '' || e.buttons === 2) {
            clearMessage();
            // 右クリック（消去 s_id=''）か登録する結合タイプが１以外で且つ対象セルが当番の場合
            if ((s_id === '' || stamps[s_id].type !== '1') && String($this.data('id')).length === 2
            && (parseInt($this.data('id') / 10)*10 === parseInt(toban_cd) || parseInt($this.data('id') / 10)*10 === parseInt(yobi_cd))) {
                // 所属長や管理者（edit_flg>0）でないと編集できない
                if (edit_flg === 0) {
                    showMessage('当番の変更は所属長や管理者へ連絡して下さい','#ff3333');
                    return;
                }
            }
            if (e.buttons === 1) { // 左ボタン
                if ($this.data('id') === '') {
                    $this.data('id',0);
                }
                // 処理日が20日以下で来月以降の編集が対象（社員のみ）
                if (today.getDate() <= 20 // && $this.hasClass('kokyu')
                && today.formatDate('YYYYMM') < syori_ym.formatDate('YYYYMM')
                && syaincd < '95000') {
                    // 当番ｘと問のみ入力可能
                    if (s_id !== toban_x && s_id !== toi_cd) {
                        // 1月10日までは編集可能にする：2020/12/02
                        if (syori_ym.getMonth() > 0 || $this.parent().children('.cells').index($this) > 9) {
                            showMessage('２０日迄は”当ｘ”と”問”のみ入力可能です','#ff3333');
                            return;
                        }
                    }
                }
                // 背景カラーがある場合、一旦現在のカラーを消去して追加する
                $this.removeClass(function(index, className) {
                    return (className.match(/\bbg\S+/g) || []).join(' ');
                });
                if (stamps[s_id].color !== '0') {
                    $this.addClass('bg'+stamps[s_id].color);
                }
                // ここから各項目の置き換え
                var tx = stamps[s_id].tx;
                var id = s_id;
                if (stamps[s_id].type === '1' && String($this.data('id')).length === 2) {
                    // 登録する項目の結合グループが１で現在の項目が結合グループ２が含まれる場合、結合する
                    tx = tx + ($this.data('sv').length === 2
                                ? $this.data('sv').substr(1,1)
                                : $this.data('sv'));
                    id = String(parseInt(id) + (parseInt($this.data('id') / 10) * 10));
                }
                if (stamps[s_id].type === '2' && $this.data('sv') !== undefined && String($this.data('id')).length === 1) {
                    // 登録する項目の結合グループが２で現在の項目が結合グループ１の場合、結合する
                    tx = $this.data('sv') + tx;
                    id = String(parseInt(id) + parseInt($this.data('id') % 10));
                }
                // 現在項目のテキストとＩＤ、バックアップ（ＳＶ）を置換える
                $this.text(tx).data({id: parseInt(id), sv: tx});
                // 現在の項目にタイトルが入っていない場合はタイトルを置換える
                if ($this.prop('title') === '' && $this.data('title') === '') {
                    $this.prop('title',stamps[s_id].title).data('title',stamps[s_id].title);
                }
                dispCnt($('#main_body_item .row').index($this.parent()));
            } else if (e.buttons === 2) { // 右クリック
                $this.removeClass(function(index, className) {
                    return (className.match(/\bbg\S+/g) || []).join(' ');
                });
                $this.data({'id':0,'sv':'','title':''}).text('').css('color','').prop('title','');
                dispCnt($('#main_body_item .row').index($this.parent()));
            } else if (s_id !== $this.prop('id')) {  // マウスオーバー
                if ($this.children('div').length > 0) {
                    $this.children('div').remove();
                }
                $this.data('sv',$this.text()).text(stamps[s_id].btn).css('color','#bbbbbb');
            }
        }
    }
    // 各スタンプクリック
    $(document).on('click','input[name="stamp"]',function() {
        // if (stamp === $(this).next().text().trim()) {
        if (s_id === $(this).prop('id')) {
            // ボタンオフの処理
            $(this).prop('checked',false);
            $('#stamp_group').buttonset('refresh');
            s_id = "";
            // stamp = '';
            // stamp_title = '';
        } else {
            s_id = $(this).prop('id');
            // stamp = $(this).next().text().trim();
            // stamp_title = $(this).next().prop('title');
        }
    });
    // 公休・当番数表示
    function dispCnt(r) {
        var kou = 0, asa = 0, tou = 0;
        $('#main_body_item .row:eq('+r+') .cells').each(function(i) {
            if ($(this).text() === '公' || $(this).text() === '計') {
                kou++;
            }
            if ($(this).text() === '朝') {
                asa++;
            }
            if ($(this).text() === '当') {
                tou++;
            }
        });
        $('#main_body_memo .memo_kokyu').eq(r).text(kou === 0 ? '' : kou);
        $('#main_body_memo .memo_toban1').eq(r).text(asa === 0 ? '' : asa);
        $('#main_body_memo .memo_toban2').eq(r).text(tou === 0 ? '' : tou);
        // 編集中メッセージ
        if (edit === false) {
            edit = true;
            clearMessage();
            $(msgid).text('編集中です。編集Modeクリックで保存します！');
        }
        // 編集フラグセット
        if ($('#main_body_item .row').eq(r).data('edit') === undefined) {
            $('#main_body_item .row').eq(r).data('edit',1);
        }
    }
    $('#edit_none').click(function() {
        if (confirm('編集内容を破棄します。よろしいですか？')) {
            edit = false;
            findcd = '';
            $('#findfilter').val('');
            filterData();
            $('#edit_none').button('disable');
            $('input[name="stamp"]').button('disable');
            $('header button').button('enable');
            $('#admin_group button').button('enable');
            $('header input').prop('disabled',false);
            if (kakutei_flg) {
                $('#data_kakutei').button('enable');
            }
            $('#edit_mode').prop('checked',false).button('refresh');
            loadData();
        }
    });

// --------------------------------------------------------------------------------------------------------------------
    // 当番割当処理ボタンクリック
    $('#set_toban').click(function() {
        // return;
        if (confirm('当番割当処理を行いますか？')) {
            var para = {
                syori_ym: syori_ym.formatDate("YYYY/MM/DD")
            }
            BlockScreen('作成中 ...');
            Ajax('shift.php?func=toban',para).done(function(ret) {
                if (ret.code === 'OK') {
                    alert(ret.msg === '' ? '当番割当処理を完了しました！再読込します。' : ret.msg);
                    loadData();
                } else {
                    showMessage(ret.msg ? ret.msg : '当番割当出来ませんでした。','#ff0000');
                }
            }).fail(function(ret) {
                alert(ret.msg ? ret.msg : '当番割当出来ませんでした。');
            }).always(function(ret) {
                UnBlockScreen();
            });
        }
    });
// --------------------------------------------------------------------------------------------------------------------
    // 確定処理ボタンクリック
    $('#set_kakutei').click(function() {
        if (confirm('確定処理を行いますか？')) {
            if (kakutei_flg === false || confirm('既に確定処理済です。上書きされますがよろしいですか？')) {
                var para = {
                    syori_ym: syori_ym.formatDate("YYYY/MM/DD")
                }
                BlockScreen('処理中 ...');
                Ajax('shift.php?func=Kakutei',para).done(function(ret) {
                    if (ret.code === 'OK') {
                        alert('確定処理を完了しました！再読込します。');
                        loadData();
                    } else {
                        showMessage(ret.msg ? ret.msg : '確定処理に失敗しました。','#ff0000');
                    }
                }).fail(function(ret) {
                    showMessage(ret.msg ? ret.msg : '確定処理に失敗しました。','#ff0000');
                }).always(function(ret) {
                    UnBlockScreen();
                });
            }
        }
    });
// --------------------------------------------------------------------------------------------------------------------
    // 社員設定ボタンクリック
    $('#set_syain').click(function() {
        loadSyain().done(function(ret) {
            $('#syain_form').dialog('open');
        });
    });
    // 社員設定データ読込
    function loadSyain() {
        var dfd = $.Deferred();
        var ph;
        BlockScreen('読込中 ...');
        Ajax('shift.php?func=loadSyain').done(function(ret) {
            if (ret.code === 'OK') {
                var sv_syozoku = '';
                $('#syain_table tbody').databind(ret.data,null,function(rec,i) {
                    $('select.sf_toban').eq(i).val(rec.toban_flg);
                    $('select.sf_edit').eq(i).val(rec.edit_flg);
                    if (sv_syozoku !== rec.syozokucd) {
                        $('#syain_table .syain_rec').eq(i).before('<tr class="groupline" data-syozokucd="'+rec.syozokucd+'"><td colspan="6">'+rec.syozokunm+'</td></tr>');
                        sv_syozoku = rec.syozokucd;
                    }
                });
                $('#syain_table tbody').selectable({
                    cancel: '.sf_syaincd, .sf_del, .sf_toban, .sf_edit, .ui-selected',
                    filter: '> tr'
                }).sortable({
                    axis: 'y',
                    opacity: 0.7,
                    items: "> tr",
                    handle: 'tr, .sf_syaincd, .ui-selected',
                    helper: function(e, item) {
                        if (item.hasClass('ui-selected') === false) {
                            item.parent().children('.ui-selected').removeClass('ui-selected');
                            item.addClass('ui-selected');
                        }
                        var selected = item.parent().children('.ui-selected').clone();
                        var fitem = item.parent().children('.ui-selected').find('.sf_toban');
                        selected.find('.sf_toban').each(function(i) {
                            $(this).val(fitem.eq(i).val())
                        });
                        var fitem = item.parent().children('.ui-selected').find('.sf_edit');
                        selected.find('.sf_edit').each(function(i) {
                            $(this).val(fitem.eq(i).val())
                        });
                        //placeholder用の高さを取得しておく
                        ph = item.outerHeight() * selected.length;
                        item.data('multidrag', selected).siblings('.ui-selected').remove();
                        return $('<li/>').append(selected);
                    },
                    //ドラッグした時にplaceholderの高さを選択要素分取る
                    start: function(e, ui) {
                        ui.placeholder.css({'height':ph});
                    },
                    //ドロップ時処理
                    stop: function(e, ui) {
                        var selected = ui.item.data('multidrag');
                        ui.item.after(selected);
                        ui.item.remove();
                    }
                });
                dfd.resolve(ret);
            } else {
                showMessage('データ読込に失敗しました。','#ff0000');
                dfd.reject(ret);
            }
        }).fail(function(ret) {
            showMessage('データ読込に失敗しました。','#ff0000');
            dfd.reject(ret);
        }).always(function(ret) {
            UnBlockScreen();
        });
        return dfd.promise();
    }
    // 社員設定ダイアログ
    $('#syain_form').dialog({
		autoOpen: false,
		width: 640,
		modal: true,
        resizable: false,
        open: function() {
            clearMessage();
            msgid = '#sf_msg';
        },
        close: function() {
            clearMessage();
            $('#new_syaincd').remove();
            msgid = '#msg';
        },
        buttons: {
            '新規': function() {
                if ($('#new_syaincd').length === 0) {
                    $('#syain_table tbody').databind('newrow');
                    $('.sf_syaincd:last').html('<input type="text" id="new_syaincd" maxlength="5">');
                    if ($('.ui-selected').length > 0) {
                        $('#syain_table tbody tr:last').insertAfter('.ui-selected:first');
                    }
                }
                $('#new_syaincd').focus();
            },
            '再取込': function() {
                if (confirm('社員リストの再取込を行います。よろしいですか？')) {
                    BlockScreen('登録中 ...');
                    Ajax('shift.php?func=initSyain').done(function(ret) {
                        if (ret.code === 'OK') {
                            loadSyain().done(function(ret) {
                                showMessage('取込しました。','#0000ff');
                            });
                        } else {
                            showMessage('取込に失敗しました。','#ff0000');
                        }
                    }).fail(function(ret) {
                        showMessage('取込に失敗しました。','#ff0000');
                    }).always(function(ret) {
                        UnBlockScreen();
                    });
                }
            },
            '使い方': function() {
                alert('【並び替え】\n'+
                      '並び替えは社員CDをドラッグすることで行えます。\n'+
                      '複数移動する場合は社員名をドラッグし選択した状態で社員CDをドラッグして移動して下さい。\n\n'+
                      '【再取込】\n'+
                      '所属部署名等が変更になった場合は、再取込を行って下さい\n'+
                      '再取込を行った場合は並び替えなどの編集等が必要になります。\n\n'+
                      '※情報システム部トップCDが変更になった場合は管理者設定のトップCDを変更してから取込みして下さい\n\n'+
                      '【新規追加】\n'+
                      'リストにいない社員を追加する場合は新規ボタンで追加して下さい\n'+
                      '選択行の下に追加します。選択が無い場合は最終行に追加します。')
            },
            '登録': function() {
                var para = [];
                var syozokucd;
                var c=0;
                if ($('#syain_table').find('#new_syaincd').length > 0) {
                    $('#syain_table').find('#new_syaincd').parent().parent().remove();
                }
                $('#syain_table tbody tr').each(function(i) {
                    if (i === 0 && $(this).hasClass('groupline') === false) {
                        alert('先頭行は社員データではなく所属行でなければいけません！');
                        return false;
                    }
                    if ($(this).hasClass('groupline')) {
                        syozokucd = $(this).data('syozokucd');
                        c++;
                    } else {
                        para.push({
                            newcd: $('td.sf_syaincd').eq(i-c).prop('title') === 'New' ? 1 : 0,
                            syaincd: $('td.sf_syaincd').eq(i-c).text(),
                            user_name: $('td.sf_syainnm').eq(i-c).text(),
                            syozokucd: syozokucd,
                            toban_flg: $('select.sf_toban').eq(i-c).val(),
                            edit_flg: $('select.sf_edit').eq(i-c).val()
                        });
                    }
                });
                if (para.length > 0) {
                    BlockScreen('登録中 ...');
                    Ajax('shift.php?func=regSyain',{para: para}).done(function(ret) {
                        if (ret.code === 'OK') {
                            showMessage('登録しました。','#0000ff');
                        } else {
                            showMessage('登録に失敗しました。','#ff0000');
                        }
                    }).fail(function(ret) {
                        showMessage('登録に失敗しました。','#ff0000');
                    }).always(function(ret) {
                        UnBlockScreen();
                    });
                }
            },
            '閉じる': function() {
                $(this).dialog('close');
            }
        }
    });
    $('.ui-dialog-buttonpane button:contains("使い方")').css('margin-right','200px');
    $(document).on('change','#new_syaincd',function() {
        if ($(this).val().length !== 5) {
            showMessage2($(this),'社員CDを５桁で入力して下さい','#ff0000');
            return;
        }
        $this = $(this);
        $syaincd = $this.parent();
        BlockScreen('検索中 ...');
        Ajax('shift.php?func=findSyain',{syaincd: $this.val()}).done(function(ret) {
            if (ret.code === 'OK') {
                $syaincd.html(ret.syaincd);
                $syaincd.next().text(ret.syainnm);
                $syaincd.next().next().text(ret.itemnm);
                $syaincd.prop('title','New');
            } else if (ret.code === 'HIT') {
                showMessage2($this,'登録済みです。','#ff0000');
            } else {
                showMessage2($this,'社員CDに誤りがあります。','#ff0000');
            }
        }).fail(function(ret) {
            showMessage2($this,'社員CDに誤りがあります。','#ff0000');
        }).always(function(ret) {
            UnBlockScreen();
        });
    });
    // 社員削除
    $(document).on('click','.sf_del button',function() {
        var ix = $('.sf_del button').index($(this));
        if ($('td.sf_syaincd').eq(ix).children('input').length > 0) {
            $('td.sf_syaincd').eq(ix).parent().remove();
            return;
        }
        if (confirm($('td.sf_syainnm').eq(ix).text()+' さんを削除します。よろしいでしょうか？')) {
            BlockScreen('削除中 ...');
            Ajax('shift.php?func=delSyain',{syaincd: $('td.sf_syaincd').eq(ix).text()}).done(function(ret) {
                if (ret.code === 'OK') {
                    $('td.sf_syaincd').eq(ix).parent().remove();
                    showMessage('削除しました。','#0000ff');
                } else {
                    showMessage('削除に失敗しました。','#ff0000');
                }
            }).fail(function(ret) {
                showMessage('削除に失敗しました。','#ff0000');
            }).always(function(ret) {
                UnBlockScreen();
            });
        }
    });
// --------------------------------------------------------------------------------------------------------------------
    // 派遣社員設定ボタンクリック
    $('#set_haken').click(function() {
        loadHaken().done(function(ret) {
            $('#haken_form').dialog('open');
        });
    });
    // 派遣設定データ読込
    function loadHaken() {
        var dfd = $.Deferred();
        var ph;
        BlockScreen('読込中 ...');
        Ajax('shift.php?func=loadHaken').done(function(ret) {
            if (ret.code === 'OK') {
                $('#haken_table tbody').databind(ret.data,null,function(rec,i) {
                    $('select.kf_syozoku').eq(i).val(rec.syozokucd);
                });
                $('#haken_table tbody').selectable({
                    cancel: '.kf_syaincd, .kf_del, .ui-selected',
                    filter: '> tr'
                }).sortable({
                    axis: 'y',
                    opacity: 0.7,
                    items: "> tr",
                    handle: 'tr, .kf_syaincd, .ui-selected',
                    helper: function(e, item) {
                        if (item.hasClass('ui-selected') === false) {
                            item.parent().children('.ui-selected').removeClass('ui-selected');
                            item.addClass('ui-selected');
                        }
                        var selected = item.parent().children('.ui-selected').clone();
                        var fitem = item.parent().children('.ui-selected').find('.kf_syozoku');
                        selected.find('.kf_syozoku').each(function(i) {
                            $(this).val(fitem.eq(i).val())
                        });
                        //placeholder用の高さを取得しておく
                        ph = item.outerHeight() * selected.length;
                        item.data('multidrag', selected).siblings('.ui-selected').remove();
                        return $('<li/>').append(selected);
                    },
                    //ドラッグした時にplaceholderの高さを選択要素分取る
                    start: function(e, ui) {
                        ui.placeholder.css({'height':ph});
                    },
                    //ドロップ時処理
                    stop: function(e, ui) {
                        var selected = ui.item.data('multidrag');
                        ui.item.after(selected);
                        ui.item.remove();
                    }
                });
                dfd.resolve(ret);
            } else {
                showMessage('データ読込に失敗しました。','#ff0000');
                dfd.reject(ret);
            }
        }).fail(function(ret) {
            showMessage('データ読込に失敗しました。','#ff0000');
            dfd.reject(ret);
        }).always(function(ret) {
            UnBlockScreen();
        });
        return dfd.promise();
    }
    // 派遣社員設定ダイアログ
    $('#haken_form').dialog({
		autoOpen: false,
		width: 690,
		modal: true,
        resizable: false,
        open: function() {
            clearMessage();
            msgid = '#kf_msg';
        },
        close: function() {
            clearMessage();
            $('#new_syaincd2').remove();
            msgid = '#msg';
        },
        buttons: {
            '新規': function() {
                if ($('#new_syaincd2').length === 0) {
                    $('#haken_table tbody').databind('newrow');
                    $('.kf_syaincd:last').html('<input type="text" id="new_syaincd2" maxlength="5">');
                    if ($('.ui-selected').length > 0) {
                        $('#haken_table tbody tr:last').insertAfter('.ui-selected:first');
                    }
                }
                $('#new_syaincd2').focus();
            },
            '登録': function() {
                var para = [];
                // var svnew = -1;
                if ($('#haken_table').find('#new_syaincd2').length > 0) {
                    $('#haken_table').find('#new_syaincd2').parent().parent().remove();
                }
                $('#haken_table tbody tr').each(function(i) {
                    para.push({
                        newcd: $('td.kf_syaincd').eq(i).prop('title') === 'New' ? 1 : 0,
                        syaincd: $('td.kf_syaincd').eq(i).text(),
                        user_name: $('input.kf_usernm').eq(i).val(),
                        corp_name: $('input.kf_corpnm').eq(i).val(),
                        syozokucd: $('select.kf_syozoku').eq(i).val(),
                    });
                });
                if (para.length > 0) {
                    BlockScreen('登録中 ...');
                    Ajax('shift.php?func=regHaken',{para: para}).done(function(ret) {
                        if (ret.code === 'OK') {
                            $('#haken_table tbody tr').each(function(i) {
                                if ($('td.kf_syaincd').eq(i).prop('title') === 'New') {
                                    $('td.kf_syaincd').eq(i).prop('title','');
                                }
                            });
                            showMessage('登録しました。','#0000ff');
                        } else {
                            showMessage('登録に失敗しました。','#ff0000');
                        }
                    }).fail(function(ret) {
                        showMessage('登録に失敗しました。','#ff0000');
                    }).always(function(ret) {
                        UnBlockScreen();
                    });
                }
            },
            '閉じる': function() {
                $(this).dialog('close');
            }
        }
    });
    $('.ui-dialog-buttonpane button:contains("新規"):eq(1)').css('margin-right','430px');
    $(document).on('change','#new_syaincd2',function() {
        if ($(this).val().length !== 5) {
            showMessage2($(this),'社員CDを５桁で入力して下さい','#ff0000');
            return;
        }
        $(this).val($(this).val().toUpperCase());
        $this = $(this);
        $syaincd = $this.parent();
        BlockScreen('検索中 ...');
        Ajax('shift.php?func=findHaken',{syaincd: $this.val()}).done(function(ret) {
            if (ret.code === 'OK') {
                $syaincd.html(ret.syaincd);
                $syaincd.prop('title','New');
            } else if (ret.code === 'HIT') {
                showMessage2($this,$this.val()+'は登録済みのCDです。','#ff0000');
                $this.val('');
            } else {
                showMessage2($this,'社員CDに誤りがあります。','#ff0000');
            }
        }).fail(function(ret) {
            showMessage2($this,'社員CDに誤りがあります。','#ff0000');
        }).always(function(ret) {
            UnBlockScreen();
        });
    });
    // 派遣社員削除
    $(document).on('click','.kf_del button',function() {
        var ix = $('.kf_del button').index($(this));
        if ($('td.kf_syaincd').eq(ix).children('input').length > 0) {
            $('td.kf_syaincd').eq(ix).parent().remove();
            return;
        }
        if (confirm($('input.kf_usernm').eq(ix).val()+' さんを削除します。よろしいでしょうか？')) {
            BlockScreen('削除中 ...');
            Ajax('shift.php?func=delHaken',{syaincd: $('td.kf_syaincd').eq(ix).text()}).done(function(ret) {
                if (ret.code === 'OK') {
                    $('td.kf_syaincd').eq(ix).parent().remove();
                    showMessage('削除しました。','#0000ff');
                } else {
                    showMessage('削除に失敗しました。','#ff0000');
                }
            }).fail(function(ret) {
                showMessage('削除に失敗しました。','#ff0000');
            }).always(function(ret) {
                UnBlockScreen();
            });
        }
    });
// --------------------------------------------------------------------------------------------------------------------
    // 新・中途社員設定ボタンクリック
    $('#set_tempsyain').click(function() {
        loadTempsyain().done(function(ret) {
            $('#tempsyain_form').dialog('open');
        });
    });
    // 新・中途社員設定データ読込
    function loadTempsyain() {
        var dfd = $.Deferred();
        BlockScreen('読込中 ...');
        Ajax('shift.php?func=loadTempsyain').done(function(ret) {
            if (ret.code === 'OK') {
                $('#tempsyain_table tbody').databind(ret.data,null,function(rec,i) {
                    $('select.tf_syozoku').eq(i).val(rec.syozokucd);
                });
                dfd.resolve(ret);
            } else {
                showMessage('データ読込に失敗しました。','#ff0000');
                dfd.reject(ret);
            }
        }).fail(function(ret) {
            showMessage('データ読込に失敗しました。','#ff0000');
            dfd.reject(ret);
        }).always(function(ret) {
            UnBlockScreen();
        });
        return dfd.promise();
    }
    // 新・中途社員設定ダイアログ
    $('#tempsyain_form').dialog({
		autoOpen: false,
		width: 870,
		modal: true,
        resizable: false,
        open: function() {
            clearMessage();
            $('#tempsyain_table tbody').databind('newrow');
            $('.tf_syaincd:last').html('<input type="text" id="new_syaincd3" maxlength="5">');
            $('#new_syaincd3').focus();
            msgid = '#tf_msg';
            showMessage('状態が登録済みのデータがある場合、問題ないようでしたら削除して下さい','#0000ff');
        },
        close: function() {
            clearMessage();
            $('#new_syaincd3').remove();
            msgid = '#msg';
        },
        buttons: {
            '新規': function() {
                if ($('#new_syaincd3').length === 0) {
                    $('#tempsyain_table tbody').databind('newrow');
                    $('.tf_syaincd:last').html('<input type="text" id="new_syaincd3" maxlength="5">');
                }
                $('#new_syaincd3').focus();
            },
            '登録': function() {
                var para = [];
                if ($('#tempsyain_table').find('#new_syaincd3').length > 0) {
                    $('#tempsyain_table').find('#new_syaincd3').parent().parent().remove();
                }
                $('#tempsyain_table tbody tr').each(function(i) {
                    para.push({
                        newcd: $('td.tf_syaincd').eq(i).prop('title') === 'New' ? 1 : 0,
                        syaincd: $('td.tf_syaincd').eq(i).text(),
                        name: $('input.tf_name').eq(i).val(),
                        kana: $('input.tf_kana').eq(i).val(),
                        itemnm: $('input.tf_itemnm').eq(i).val(),
                        syozokucd: $('select.tf_syozoku').eq(i).val(),
                        syozokunm: $('select.tf_syozoku option:selected').eq(i).text()
                    });
                });
                if (para.length > 0) {
                    BlockScreen('登録中 ...');
                    Ajax('shift.php?func=regTempsyain',{para: para}).done(function(ret) {
                        if (ret.code === 'OK') {
                            $('#tempsyain_table tbody tr').each(function(i) {
                                if ($('td.tf_syaincd').eq(i).prop('title') === 'New') {
                                    $('td.tf_syaincd').eq(i).prop('title','');
                                }
                            });
                            showMessage('登録完了しました。続いて社員設定を行って下さい。','#0000ff');
                        } else {
                            showMessage('登録に失敗しました。','#ff0000');
                        }
                    }).fail(function(ret) {
                        showMessage('登録に失敗しました。','#ff0000');
                    }).always(function(ret) {
                        UnBlockScreen();
                    });
                }
            },
            '閉じる': function() {
                $(this).dialog('close');
            }
        }
    });
    $('.ui-dialog-buttonpane button:contains("新規"):eq(2)').css('margin-right','610px');
    $(document).on('change','#new_syaincd3',function() {
        if ($(this).val().length !== 5) {
            showMessage2($(this),'社員CDを５桁で入力して下さい','#ff0000');
            return;
        }
        $(this).val($(this).val().toUpperCase());
        $this = $(this);
        $syaincd = $this.parent();
        BlockScreen('検索中 ...');
        Ajax('shift.php?func=findTempsyain',{syaincd: $this.val()}).done(function(ret) {
            if (ret.code === 'OK') {
                $syaincd.html(ret.syaincd);
                $syaincd.prop('title','New');
            } else if (ret.code === 'HIT') {
                showMessage2($this,$this.val()+'は登録済みのCDです。','#ff0000');
                $this.val('');
            } else {
                showMessage2($this,'社員CDに誤りがあります。','#ff0000');
            }
        }).fail(function(ret) {
            showMessage2($this,'社員CDに誤りがあります。','#ff0000');
        }).always(function(ret) {
            UnBlockScreen();
        });
    });
    // 新・中途社員削除
    $(document).on('click','.tf_del button',function() {
        var ix = $('.tf_del button').index($(this));
        if ($('td.tf_syaincd').eq(ix).children('input').length > 0) {
            $('td.tf_syaincd').eq(ix).parent().remove();
            return;
        }
        if (confirm($('input.tf_name').eq(ix).val()+' さんを削除します。よろしいでしょうか？')) {
            BlockScreen('削除中 ...');
            Ajax('shift.php?func=delTempsyain',{syaincd: $('td.tf_syaincd').eq(ix).text()}).done(function(ret) {
                if (ret.code === 'OK') {
                    $('td.tf_syaincd').eq(ix).parent().remove();
                    showMessage('削除しました。','#0000ff');
                } else {
                    showMessage('削除に失敗しました。','#ff0000');
                }
            }).fail(function(ret) {
                showMessage('削除に失敗しました。','#ff0000');
            }).always(function(ret) {
                UnBlockScreen();
            });
        }
    });
// --------------------------------------------------------------------------------------------------------------------
    // 祝日・休暇設定ボタンクリック
    $('#set_holiday').click(function() {
        loadHoliday().done(function(ret) {
            $('#holiday_form').dialog('open');
        });
    });
    // 対象年度変更
    $('#holiday_yy').change(function() {
        loadHoliday().done(function(ret) {
            holiday_table_newrow();
        });
    })
    // 祝日・休暇データ読込
    function loadHoliday() {
        var dfd = $.Deferred();
        BlockScreen('読込中 ...');
        Ajax('shift.php?func=loadHoliday',{syori_yy: $('#holiday_yy').val()}).done(function(ret) {
            if (ret.code === 'OK') {
                $('#holiday_table tbody').databind(ret.data,null,function(rec,i) {
                    if (rec.toban === '1') {
                        $('input.hf_toban').eq(i).prop('checked',true);
                    }
                });
                dfd.resolve(ret);
            } else {
                showMessage('データ読込に失敗しました。','#ff0000');
                dfd.reject(ret);
            }
        }).fail(function(ret) {
            showMessage('データ読込に失敗しました。','#ff0000');
            dfd.reject(ret);
        }).always(function(ret) {
            UnBlockScreen();
        });
        return dfd.promise();
    }
    // 日付変更処理
    $(document).on('change','input.hf_date',function() {
        if ($(this).val().isDate() === false) {
            showMessage2($(this),'日付を正しく入力して下さい','#ff0000');
            $(this).val('');
            return;
        }
        var chkyy = parseInt($('#holiday_yy').val());
        if ($(this).val() < chkyy+'/04/01'
        ||  $(this).val() > (chkyy+1)+'/03/31') {
            showMessage2($(this),'日付が範囲外です','#ff0000');
            $(this).val('');
            return;
        }
        var ix = $('input.hf_date').index($(this));
        $('input.hf_biko').eq(ix).focus();
        holiday_table_newrow();
    });
    // 入力行追加
    function holiday_table_newrow() {
        $('#holiday_table tbody').databind('newrow');
        $('input.hf_date').eq($('input.hf_date').length-1).prop('readonly',false);
        $('input.hf_date').eq($('input.hf_date').length-1).datepicker({
            showButtonPanel: true,
            showOtherMonths: true,
            selectOtherMonths: true,
            changeYear: true,
            changeMonth: true,
            onClose: function (e) {
                $(this).datepicker("refresh");
            }
        });
        $('#holiday_table tbody').scrollTop(999);
    }
    // 祝日・休暇ダイアログ
    $('#holiday_form').dialog({
		autoOpen: false,
		width: 492,
		modal: true,
        resizable: false,
        open: function() {
            clearMessage();
            msgid = '#hf_msg';
            holiday_table_newrow();
        },
        close: function() {
            clearMessage();
            msgid = '#msg';
        },
        buttons: {
            '登録': function() {
                var para = [];
                $('input.hf_date').each(function(i) {
                    if ($('input.hf_date').eq(i).val() !== $('input.hf_date').eq(i).data('sv_val')
                    || ($('input.hf_toban').eq(i).prop('checked') ? '1' : '0') !== $('input.hf_toban').eq(i).data('sv_val')
                    ||  $('input.hf_biko').eq(i).val() !== $('input.hf_biko').eq(i).data('sv_val')) {
                        para.push({
                            holiday:$('input.hf_date').eq(i).val(),
                            toban:$('input.hf_toban').eq(i).prop('checked') ? 1 : 0,
                            holiday_biko:$('input.hf_biko').eq(i).val()
                        });
                    }
                });
                if (para.length > 0) {
                    BlockScreen('登録中 ...');
                    Ajax('shift.php?func=regHoliday',{para: para}).done(function(ret) {
                        if (ret.code === 'OK') {
                            $('input.hf_date').each(function(i) {
                                if ($('input.hf_date').eq(i).val() !== $('input.hf_date').eq(i).data('sv_val')
                                ||  ($('input.hf_toban').eq(i).prop('checked') ? '1' : '0') !== $('input.hf_toban').eq(i).data('sv_val')
                                ||  $('input.hf_biko').eq(i).val() !== $('input.hf_biko').eq(i).data('sv_val')) {
                                    $('input.hf_date').eq(i).data('sv_val',$('input.hf_date').eq(i).val());
                                    $('input.hf_toban').eq(i).data('sv_val',($('input.hf_toban').eq(i).prop('checked') ? '1' : '0'));
                                    $('input.hf_biko').eq(i).data('sv_val',$('input.hf_biko').eq(i).val());
                                }
                            });
                            showMessage('登録しました。','#0000ff');
                        } else {
                            showMessage('登録に失敗しました。','#ff0000');
                        }
                    }).fail(function(ret) {
                        showMessage('登録に失敗しました。','#ff0000');
                    }).always(function(ret) {
                        UnBlockScreen();
                    });
                } else {
                    showMessage('変更箇所がありません','#0000ff');
                }
            },
            '閉じる': function() {
                $(this).dialog('close');
            }
        }
    });
    // 祝日削除
    $(document).on('click','.hf_del button',function() {
        var ix = $('.hf_del button').index($(this));
        if ($('input.hf_date').eq(ix).data('sv_val') === '') {
            return;
        }
        if (confirm($('input.hf_date').eq(ix).val()+'を削除します。よろしいでしょうか？')) {
            BlockScreen('削除中 ...');
            Ajax('shift.php?func=delHoliday',{holiday: $('input.hf_date').eq(ix).val()}).done(function(ret) {
                if (ret.code === 'OK') {
                    $('#holiday_table tbody tr').eq(ix).remove();
                    showMessage('削除しました。','#0000ff');
                } else {
                    showMessage('削除に失敗しました。','#ff0000');
                }
            }).fail(function(ret) {
                showMessage('削除に失敗しました。','#ff0000');
            }).always(function(ret) {
                UnBlockScreen();
            });
        }
    });
// --------------------------------------------------------------------------------------------------------------------
    // ボタン設定クリック
    $('#set_button').click(function() {
        loadButton().done(function(ret) {
            $('#button_form').dialog('open');
        });
    });
    // ボタンデータ読込
    function loadButton() {
        var dfd = $.Deferred();
        BlockScreen('読込中 ...');
        Ajax('shift.php?func=loadButton').done(function(ret) {
            if (ret.code === 'OK') {
                $('#stamp_table tbody').databind(ret.data,null,function(rec,i) {
                    $('select.sp_type').eq(i).val(rec.type);
                    $('select.sp_color').eq(i).val(rec.color);
                    if (rec.color !== '0') {
                        $('select.sp_color').eq(i).addClass('bg'+rec.color);
                        $('select.sp_color').eq(i).parent().addClass('bg'+rec.color);
                    }
                    $('#stamp_table tbody').selectable({
                        cancel: '.sp_type, .sp_color, .sp_del, .ui-selected',
                        filter: '> tr'
                    }).sortable({
                        axis: 'y',
                        opacity: 0.7,
                        items: "> tr",
                        handle: 'tr, .sp_id, .ui-selected',
                        helper: function(e, item) {
                            if (item.hasClass('ui-selected') === false) {
                                item.parent().children('.ui-selected').removeClass('ui-selected');
                                item.addClass('ui-selected');
                            }
                            var selected = item.parent().children('.ui-selected').clone();
                            var fitem = item.parent().children('.ui-selected').find('select.sp_type');
                            selected.find('select.sp_type').each(function(i) {
                                $(this).val(fitem.eq(i).val())
                            });
                            fitem = item.parent().children('.ui-selected').find('select.sp_color');
                            selected.find('select.sp_color').each(function(i) {
                                $(this).val(fitem.eq(i).val())
                            });
                            //placeholder用の高さを取得しておく
                            ph = item.outerHeight() * selected.length;
                            item.data('multidrag', selected).siblings('.ui-selected').remove();
                            return $('<li/>').append(selected);
                        },
                        //ドラッグした時にplaceholderの高さを選択要素分取る
                        start: function(e, ui) {
                            ui.placeholder.css({'height':ph});
                        },
                        //ドロップ時処理
                        stop: function(e, ui) {
                            var selected = ui.item.data('multidrag');
                            ui.item.after(selected);
                            ui.item.remove();
                        }
                    });
                });
                dfd.resolve(ret);
            } else {
                showMessage('データ読込に失敗しました。','#ff0000');
                dfd.reject(ret);
            }
        }).fail(function(ret) {
            showMessage('データ読込に失敗しました。','#ff0000');
            dfd.reject(ret);
        }).always(function(ret) {
            UnBlockScreen();
        });
        return dfd.promise();
    }
    $(document).on('change','select.sp_color',function() {
        $(this).removeClass(function(index, className) {
            return (className.match(/\bbg\S+/g) || []).join(' ');
        });
        $(this).parent().removeClass(function(index, className) {
            return (className.match(/\bbg\S+/g) || []).join(' ');
        });
        if ($(this).val() !== '0') {
            $(this).addClass('bg'+$(this).val());
            $(this).parent().addClass('bg'+$(this).val());
        }
    })
    // ボタンダイアログ
    $('#button_form').dialog({
		autoOpen: false,
		width: 550,
		modal: true,
        resizable: false,
        open: function() {
            msgid = '#sp_msg';
            showMessage('重複グループ１とグループ２は結合が可能なアイテムです','#0000ff');
            wflg = false;
        },
        close: function() {
            clearMessage();
            msgid = '#msg';
            if (wflg) {
                location.reload();
                // $('#stamp_group').empty();
                // dispStamps();
            }
        },
        buttons: {
            '新規': function() {
                $('#stamp_table tbody').databind('newrow');
                $('td.sp_id:last').text('New');
                $('input.sp_btn:last').focus();
                $('#stamp_table tbody').scrollTop(999);
            },
            '登録': function() {
                var para = [];
                $('td.sp_id').each(function(i) {
                    if ($('td.sp_id').eq(i).text() !== 'New' && $('input.sp_btn').eq(i).val().trim() === '') {
                        showMessage2($('input.sp_btn').eq(i),'ボタン用文字は必須入力です。');
                        para = [];
                        return false;
                    }
                    // if ($('select.sp_type').eq(i).val() === '1' && $('input.sp_tx').eq(i).val().trim() !== '') {
                    //     showMessage2($('input.sp_tx').eq(i),'タイプが重複背景を選択時は表示文字は入力できません');
                    //     para = [];
                    //     return false;
                    // }
                    if ($('select.sp_type').eq(i).val() === '2' && $('select.sp_color').eq(i).val() !== '0') {
                        showMessage2($('select.sp_color').eq(i),'タイプが重複Ｇ２を選択時は背景色は選択できません');
                        para = [];
                        return false;
                    }
                    if ($('input.sp_btn').eq(i).text() !== 'New' || $('input.sp_btn').eq(i).val().trim() !== '') {
                        para.push({
                            id:$('td.sp_id').eq(i).text(),
                            type:$('select.sp_type').eq(i).val(),
                            btn:$('input.sp_btn').eq(i).val(),
                            tx:$('input.sp_tx').eq(i).val(),
                            title:$('input.sp_title').eq(i).val(),
                            color:$('select.sp_color').eq(i).val()
                        });
                    }
                });
                if (para.length > 0) {
                    BlockScreen('登録中 ...');
                    Ajax('shift.php?func=regButton',{para: para}).done(function(ret) {
                        if (ret.code === 'OK') {
                            $('td.sp_id').each(function(i) {
                                if ($(this).text() === "New") {
                                    $(this).text(ret.stamp_s[i]);
                                }
                                $('select.sp_type').eq(i).data('sv_val',$('select.sp_type').eq(i).val());
                                $('input.sp_btn').eq(i).data('sv_val',$('input.sp_btn').eq(i).val());
                                $('input.sp_tx').eq(i).data('sv_val',$('input.sp_tx').eq(i).val());
                                $('input.sp_title').eq(i).data('sv_val',$('input.sp_title').eq(i).val());
                                $('select.sp_color').eq(i).data('sv_val',$('select.sp_color').eq(i).val());
                            });
                            stamps = ret.stamps;
                            six = ret.stamp_s;
                            wflg = true;
                            showMessage('登録しました。','#0000ff');
                        } else {
                            showMessage('登録に失敗しました。','#ff0000');
                        }
                    }).fail(function(ret) {
                        showMessage('登録に失敗しました。','#ff0000');
                    }).always(function(ret) {
                        UnBlockScreen();
                    });
                } else {
                    showMessage('変更箇所がありません','#0000ff');
                }
            },
            '閉じる': function() {
                $(this).dialog('close');
            }
        }
    });
    $('.ui-dialog-buttonpane button:contains("新規"):eq(3)').css('margin-right','280px');
    // ボタン削除
    $(document).on('click','.sp_del button',function() {
        var ix = $('.sp_del button').index($(this));
        if ($('td.sp_id').eq(ix).text() === 'New') {
            $('td.sp_id').eq(ix).parent().remove();
            return;
        }
        if (confirm("CD:"+$('td.sp_id').eq(ix).text()+'を削除します。よろしいでしょうか？')) {
            BlockScreen('削除中 ...');
            Ajax('shift.php?func=delButton',{id: $('td.sp_id').eq(ix).text()}).done(function(ret) {
                if (ret.code === 'OK') {
                    $('#stamp_table tbody tr').eq(ix).remove();
                    showMessage('削除しました。','#0000ff');
                    stamps = ret.stamps;
                    six = ret.stamp_s;
                    wflg = true;
                } else {
                    showMessage('削除に失敗しました。','#ff0000');
                }
            }).fail(function(ret) {
                showMessage('削除に失敗しました。','#ff0000');
            }).always(function(ret) {
                UnBlockScreen();
            });
        }
    });
// --------------------------------------------------------------------------------------------------------------------
    // 管理者設定ボタンクリック
    $('#set_admin').click(function() {
        loadAdmin().done(function(ret) {
            $('#admin_form').dialog('open');
        });
    });
    // 管理者データ読込
    function loadAdmin() {
        var dfd = $.Deferred();
        BlockScreen('読込中 ...');
        Ajax('shift.php?func=loadAdmin').done(function(ret) {
            if (ret.code === 'OK') {
                $('#ad_syain').val(ret.admin_user);
                $('#ad_deptcd').val(ret.dept_cd);
                $('#ad_toban').val(ret.toban_cd);
                $('#ad_toban_x').val(ret.toban_x);
                $('#ad_tobansuu').val(ret.toban_suu);
                $('#ad_yobi').val(ret.yobi_cd);
                $('#ad_toi').val(ret.toi_cd);
                $('#ad_jyogai').val(ret.jyogai_syain);
                dfd.resolve(ret);
            } else {
                showMessage('データ読込に失敗しました。','#ff0000');
                dfd.reject(ret);
            }
        }).fail(function(ret) {
            showMessage('データ読込に失敗しました。','#ff0000');
            dfd.reject(ret);
        }).always(function(ret) {
            UnBlockScreen();
        });
        return dfd.promise();
    }
    $(document).on('change','select.sp_color',function() {
        $(this).removeClass(function(index, className) {
            return (className.match(/\bbg\S+/g) || []).join(' ');
        });
        $(this).parent().removeClass(function(index, className) {
            return (className.match(/\bbg\S+/g) || []).join(' ');
        });
        if ($(this).val() !== '0') {
            $(this).addClass('bg'+$(this).val());
            $(this).parent().addClass('bg'+$(this).val());
        }
    })
    // 入力行追加
    function admin_table_newrow() {
        $('#stamp_table tbody').databind('newrow');
        $('#stamp_table tbody').scrollTop(999);
    }
    // 管理者ダイアログ
    $('#admin_form').dialog({
		autoOpen: false,
		width: 600,
		modal: true,
        resizable: false,
        open: function() {
            clearMessage();
            msgid = '#ad_msg';
            admin_table_newrow();
        },
        close: function() {
            clearMessage();
            msgid = '#msg';
        },
        buttons: {
            '登録': function() {
                var para = {
                    admin_user: $('#ad_syain').val(),
                    dept_cd: $('#ad_deptcd').val(),
                    toban_cd: $('#ad_toban').val(),
                    toban_x: $('#ad_toban_x').val(),
                    toban_suu: $('#ad_tobansuu').val(),
                    yobi_cd: $('#ad_yobi').val(),
                    toi_cd: $('#ad_toi').val(),
                    jyogai_syain: $('#ad_jyogai').val()
                };
                BlockScreen('読込中 ...');
                Ajax('shift.php?func=regAdmin',para).done(function(ret) {
                    if (ret.code === 'OK') {
                        showMessage('データ登録しました。','#0000ff');
                    } else {
                        showMessage(ret.msg ? ret.msg : 'データ登録できませんでした。','#ff0000');
                    }
                }).fail(function(ret) {
                    showMessage(ret.msg ? ret.msg : 'データ登録できませんでした。','#ff0000');
                }).always(function(ret) {
                    UnBlockScreen();
                });
            },
            '閉じる': function() {
                $(this).dialog('close');
            }
        }
    });
// --------------------------------------------------------------------------------------------------------------------
    // Excel出力
    $('#excel').click(function() {
        document.downloadform.submit();
    });
// --------------------------------------------------------------------------------------------------------------------
    $(function(){
        $(document).on("contextmenu", function(e){
            // 右クリックメニュー非表示
            return false;
        });
    });
});
// メッセージ表示関数
function showMessage(msg,color,alert) {
    if (!alert && $(msgid).data('alert')) return;
    if (msghd != null) clearTimeout(msghd);
    $(msgid).css('color',color);
    $(msgid).text(msg);
    $(msgid).data('alert',alert);
    msghd = setTimeout(function() {
        $(msgid).text('');
        $(msgid).data('alert',false);
        msghd = null;
    },30000);
}
// メッセージ表示関数２　エラーアイテムにフォーカスを与える
function showMessage2(obj,msg,color,alert) {
    setTimeout(function() {
        obj.focus();
        showMessage(msg,color,alert);
    },1);
}
// メッセージクリア
function clearMessage() {
    if (msghd != null) clearTimeout(msghd);
    $(msgid).text('');
    $(msgid).data('alert',false);
    msghd = null;
}