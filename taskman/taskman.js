const UA = window.navigator.userAgent.toLowerCase();
const IE = (UA.indexOf('msie') != -1 || UA.indexOf('trident') != -1);
const column_width = 316;
var sv_parent;
var sv_obj;
var today_str = new Date().formatDate('YYYY/MM/DD');
var today = new Date(today_str);
var syori_ym = new Date(today.formatDate('YYYY/MM/01'));
var str_syori = new Date(syori_ym).addMonth(-1);
var end_syori = new Date(syori_ym).addMonth(2).addDay(-1);
// 課題タブの初期集計期間
var str_kadai = new Date(syori_ym).addMonth(-8)
var end_kadai = new Date(syori_ym).addMonth(4).addDay(-1);
var column_cnt = 0;  // メインボディーの列数
var jyotai_s;
var jyotai_e;
var sortno;
var columnno;
var sv_monthkei = 0;
var super_reload = false;
$(function() {
    $(document).tooltip({
        position: {
            my: 'center bottom',
            at: 'center top'
        },
        close: function (event, ui) {
            $(".ui-helper-hidden-accessible").empty();
        }
    });
    // 日付選択
    $('#dl_story_start_yotei,#dl_story_end_yotei').datepicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        showButtonPanel: true,
        numberOfMonths: 3,
        onClose: function (e) {
            $(this).datepicker('refresh');
        }
    });
    $('#dl_task_nippodate').datepicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        showButtonPanel: true,
        maxDate: 0,
        onClose: function (e) {
            $(this).datepicker('refresh');
        }
    });
    // バックカラー等変更
    if (IE) {
        setTimeout(function() {
            showMessage('IEは非推奨です。ChromeやEdgeなどを利用して下さい。','#ff0000');
        },1000);
    } else {
        var dark = localStorage.getItem('taskman_darkmode') || 'light';
        document.documentElement.setAttribute('theme', dark);
        $('label[for="dark_mode"]').show();
        $('#dark_mode').prop('checked',(dark === 'dark')).show().button();
        $('#dark_mode').change(function() {
            document.documentElement.setAttribute('theme', $(this).prop('checked') ? 'dark':'light');
            localStorage.setItem('taskman_darkmode',$(this).prop('checked') ? 'dark':'light');
        })
    }
    $('#board_left').toggle(((localStorage.getItem('taskman_disp_left') || '1') === '1'));
    $('#disp_left').prop('checked',((localStorage.getItem('taskman_disp_left') || '1') === '1'));
    $('#board_right').toggle((localStorage.getItem('taskman_disp_right') === '1'));
    $('#disp_right').prop('checked',(localStorage.getItem('taskman_disp_right') === '1'));
    $('#hide_comp').prop('checked',(localStorage.getItem('taskman_schdule_hidecomp') !== '0'));
    $('#disp1').prop('checked',(localStorage.getItem('taskman_schdule_disp1') === '1'));
    // ボタン装飾
    $('#disp_mode').buttonset();
    $('#disp_data').buttonset();
    $('header button').button();
    // $('#kadai_sel').buttonset();
    $('#hide_comp').button();
    $('#disp1').button();
    // ウインドウ枠変更時
    $(window).resize(function() {
        if ($('#board').is(':visible')) {
            mainResize(false);
        }
    });
    BlockScreen('Loading ...');
    $('#board_syozoku').databind();
    $('#board_syain').databind();
    $('#select_syain').databind();
    $('#schdule_syain').databind();
    $('#kadai_syain').databind();
    $('#dl_story_syain').databind();
    // 初期処理
    Ajax('taskman.php?func=initLoad').done(function(ret) {
        $('#board_syozoku').databind(ret.syozoku);
        $('#board_syozoku').val(ret.find_syozoku
                                    ? ret.find_syozoku
                                    : (syozokucd === '999999'
                                        ? ret.syozoku[0].value
                                        : syozokucd));
        $('#board_syain').databind(ret.same_group);
        $('#board_syain').val(ret.find_syain ? ret.find_syain : syaincd);

        $('#schdule_syozoku').html($('#board_syozoku').html());
        $('#schdule_syozoku').val(ret.find_syozoku ? ret.find_syozoku : syozokucd);
        $('#schdule_syain').databind(ret.same_group);
        $('#schdule_syain').val(ret.find_syain ? ret.find_syain : syaincd);

        $('#kadai_syozoku').html($('#board_syozoku').html());
        $('#kadai_syozoku').val(ret.find_syozoku ? ret.find_syozoku : syozokucd);
        $('#kadai_syain').databind(ret.same_group);
        // $('#kadai_syain').val(ret.find_syain ? ret.find_syain : syaincd);

        ret.same_group.shift();
        $('#select_syain').databind(ret.same_group);
        $('#dl_story_syain').databind(ret.same_group);

        $('#'+disp_app).prop('checked',true).change();
    }).fail(function(ret) {
        $.alert('読込エラーです。Ｆ５キーで再読込して下さい');
    }).always(function(ret) {
        UnBlockScreen();
    });
    // ウインドウフォーカス時に日付チェックを行う
    $(window).focus(function() {
        if (today_str !== new Date().formatDate('YYYY/MM/DD')) {
            // 処理日が変わっている場合、再読込を行う
            if ($('#board').is(':visible')) {
                location.href = location.origin+location.pathname;
            } else if ($('#schdule').is(':visible')) {
                location.href = location.origin+location.pathname+'?disp=disp_schdule';
            } else {
                location.href = location.origin+location.pathname+'?disp=disp_kadai';
            }
        }
    });
    // 再読込
    $('#reload').click(function(e) {
        super_reload = e.ctrlKey;
        if ($('#board').is(':visible')) {
            dataLoadBoard('');
        } else if ($('#schdule').is(':visible')) {
            dataLoadSchdule();
        } else {
            dataLoadKadai();
        }
        $(this).blur();
    });
    // --------------------------------- //
    // ここから作業進捗関連                //
    // --------------------------------- //
    $('#board_left_body').databindex();
    $('#board_main_body').databindex();
    $('#board_right_body').databindex();
    // 部署一覧変更時
    $('#board_syozoku,#board_syain').change(function() {
        if ($(this)[0].id === 'board_syozoku') {
            $('#board_syain').val('0');
            $('#schdule_syain').val('0');
            $('#schdule_syozoku').val($(this).val());
            $('#kadai_syozoku').val($(this).val());
        } else {
            $('#schdule_syain').val($(this).val());
        }
        dataLoadBoard('');
    });
    // sortableのみで枠越えのドラッグ＆ドロップが可能
    function sortable() {
        // ゲストは更新不可
        if (user_name === 'ゲスト') {
            return;
        }
        $('#board_left_body .column').sortable({
            items: '.board_kadai',
            connectWith: '#board_main_body .column,#board_right_body .column',
            start: function(e, ui) {
                sv_obj = ui.item;
                jyotai_s = 0;
                jyotai_e = null;
                $(document).tooltip('disable');
            },
            stop: function(e, ui) {
                $(document).tooltip('enable');
                if (jyotai_e !== null) {
                    changeJyotai(ui.item,jyotai_e,columnno);
                }
            },
            update: function(e, ui) {
                jyotai_e = jyotai_s === 0 ? 0 : -1;
                columnno = 0;
            },
            receive: function(e, ui) {
                ui.item.find('.board_story:not(.story_hide)').hide();
            }
        });
        $('#board_main_body .column').sortable({
            items: '.board_kadai',
            connectWith: '#board_left_body .column,#board_right_body .column,#board_main_body .column',
            start: function(e, ui) {
                sv_obj = ui.item;
                jyotai_s = 1;
                jyotai_e = null;
                $(document).tooltip('disable');
            },
            stop: function(e, ui) {
                $(document).tooltip('enable');
                if (jyotai_e !== null) {
                    changeJyotai(ui.item,jyotai_e,columnno);
                }
            },
            over: function() {
                $(this).addClass('bg0');
            },
            out: function() {
                $(this).removeClass('bg0');
            },
            update: function(e, ui) {
                jyotai_e = 1;
                columnno = ui.item.parent().parent().children('.column').index(ui.item.parent());
            },
            receive: function(e, ui) {
                if (ui.sender.parent().is('#board_main_body') === false) {
                    ui.item.find('.board_story:not(.story_hide)').show();
                }
            }
        });
        $('#board_right_body .column').sortable({
            items: '.board_kadai',
            connectWith: '#board_left_body .column,#board_main_body .column',
            start: function(e, ui) {
                sv_obj = ui.item;
                jyotai_s = 2;
                jyotai_e = null;
                $(document).tooltip('disable');
            },
            stop: function(e, ui) {
                $(document).tooltip('enable');
                if (jyotai_e !== null) {
                    changeJyotai(ui.item,jyotai_e,columnno);
                }
            },
            update: function(e, ui) {
                jyotai_e = 2;
                columnno = 0;
            },
            receive: function(e, ui) {
                ui.item.find('.board_story:not(.story_hide)').hide();
            }
        });
    }
    // 状態の移動
    function changeJyotai(obj,jyotai,column) {
        let para = {
            keynum: obj.data('keynum'),
            dept_cd: $('#board_syozoku').val(),
            jyotai: jyotai,
            column: column
        }
        if ($('#board_syozoku').val() !== '0') {
            para['sortkey'] = $('#board_syain').val() === '0' ? 'ka' : '';
            var orderkey = [];
            obj.parent().children('.board_kadai').each(function(i) {
                orderkey[i] = $(this).data('keynum')
            });
            para['orderkey'] = orderkey;
        }
        // BlockScreen('更新中 ...');
        Ajax('taskman.php?func=ChangeJyotai',para).done(function(ret) {
            if (ret.code !== "OK") {
                $.alert('更新エラーです。再読込して下さい');
                // console.log(ret.msg);
            }
        }).fail(function(ret) {
            $.alert('更新エラーです。再読込して下さい');
        }).always(function(ret) {
            // UnBlockScreen();
        });
    }
    // 進捗タイトル変更
    $('#board_main .board_header > div').click(function() {
        if ($(this).children().length === 0 && syozokucd === $('#board_syozoku').val()) {
            let ix = $('#board_main .board_header > div').index($(this));
            if (ix >= column_cnt) {
                return;
            }
            let title = $(this).text();
            $(this).html('<input type="text" id="board_main_title" maxlength="30" data-sv_val="'+title+'" data-ix="'+(ix+1)+'">');
            $('#board_main_title').focus().val(title);
        }
    });
    $(document).on('blur','#board_main_title',function() {
        $this = $(this);
        if ($this.val() === $this.data('sv_val')) {
            $this.parent().html($this.val());
            return;
        }
        let para = {
            ix: $this.data('ix'),
            title: $this.val(),
            syozokucd: $('#board_syozoku').val()
        }
        Ajax('taskman.php?func=changeTitle',para).done(function(ret) {
            if (ret.code === 'OK') {
                $this.parent().html($this.val());
            } else {
                $this.parent().html($this.data('sv_val'));
            }
        }).fail(function(ret) {
            $this.parent().html($this.data('sv_val'));
        });
    });
    // 作業進捗クリック
    $('#disp_board').change(function() {
        $('#board_left_body').empty();
        $('#board_main_body').empty();
        $('#board_right_body').empty();
        $('#schdule,#schdule_option').hide();
        $('#kadai,#kadai_option').hide();
        $('#board,#board_option').show();
        dataLoadBoard('');
    });
    // 作業前の表示ON OFF
    $('#disp_left').change(function() {
        $('#board_left').toggle($(this).prop('checked'));
        localStorage.setItem('taskman_disp_left',($(this).prop('checked') ? '1':'0'))
        mainResize(false);
    });
    // 完了の表示ON OFF
    $('#disp_right').change(function() {
        $('#board_right').toggle($(this).prop('checked'));
        localStorage.setItem('taskman_disp_right',($(this).prop('checked') ? '1':'0'))
        mainResize(false);
    });
    // 項目追加ボタンクリック
    $(document).on('click','.add_btn',function(e) {
        sv_parent = $(this).parent().parent();
        // if (sv_parent.children().is(':hidden')) {
        //     sv_parent.children().show();
        // }
        sv_obj = null;
        if ($(this).parent().parent().hasClass('board_kadai')) {
            $('#edit_story').dialog('option', 'title', 'ストーリー追加');
            $('#dl_story_ration').prop('disabled',true);
            let no = parseInt(Math.random() * 13);
            $('#edit_story .bg'+no).click();
            $('#edit_story')[0].reset();
            $('#dl_story_syain').val(syaincd);
            $('#edit_story').dialog('open');
        } else {
            $('#edit_task').dialog('option', 'title', 'タスク追加');
            $('#dl_task_ration').prop('disabled',true);
            $('#edit_task')[0].reset();
            $('#dl_task_progress').slider('value',0);
            $('#dl_task_progress_tx').text('0%');
            $('#edit_task').dialog('open');
        }
        e.stopPropagation();
    });
    //
    $(document).on('click','.board_title',function(e) {
        let $this = $(this).parent();

        if ($this.parent().hasClass('board_kadai')) {
            dispKadaiForm($this.parent().data('keynum'));
        } else if ($this.parent().hasClass('board_story')) {
            sv_obj = $this.parent();
            sv_parent = sv_obj.parent();
            $('#edit_story').dialog('option', 'title', 'ストーリー編集');
            $('#edit_story .bg'+sv_obj.data('color')).click();
            $('#dl_story_title').val(sv_obj.children('.board_title_waku').children('.board_title').data('title'));
            $('#dl_story_start_yotei').val(sv_obj.data('syotei'));
            $('#dl_story_end_yotei').val(sv_obj.data('eyotei'));
            $('#dl_story_ration_auto').prop('checked',(sv_obj.data('ration_auto') === 1));
            $('#dl_story_ration').val(sv_obj.data('ration')).prop('disabled',(sv_obj.data('ration_auto') === 1));
            $('#dl_story_bikou').val(sv_obj.data('bikou'));
            $('#dl_story_syain').val(sv_obj.data('syain'));
            $('#edit_story').dialog('open');
        } else if ($this.parent().hasClass('board_task')) {
            sv_obj = $this.parent();
            sv_parent = sv_obj.parent();
            $('#edit_task').dialog('option', 'title', 'タスク編集');
            $('#dl_task_title').val(sv_obj.children('.board_title_waku').children('.board_title').data('title'));
            $('#dl_task_ration_auto').prop('checked',(sv_obj.data('ration_auto') === 1));
            $('#dl_task_ration').val(sv_obj.data('ration')).prop('disabled',(sv_obj.data('ration_auto') === 1));
            $('#dl_task_progress').slider('value',sv_obj.find('.slide_bar').data('val'));
            $('#dl_task_progress_tx').text(sv_obj.find('.slide_bar').data('val')+'%');
            $('#dl_task_bikou').val(sv_obj.data('bikou'));
            $('#edit_task').dialog('open');
        }
    });
    function dispKadaiForm(keynum) {
        let para = {
            keynum: keynum
        }
        Ajax('taskman.php?func=loadKadaiInfo',para).done(function(ret) {
            $('#dl_keynum').val(para.keynum);
            $('#dl_kihyo_date').val(ret.data.kihyo_date);
            $('#dl_irai_tan').val(ret.data.irai_tan);
            $('#dl_kadai_kbn').val(ret.data.kbn);
            $('#dl_important').val(ret.data.important);
            $('#dl_tantouka').val(ret.data.tantouka);
            $('#dl_tantou').val(ret.data.syutantou);
            $('#dl_progress').text(ret.data.progress+'%');
            $('#dl_progress_bar').css('width',$('#dl_progress').text());
            $('#dl_task1').val(ret.data.task1);
            $('#dl_task2').val(ret.data.task2);
            $('#dl_sinseino').val(ret.data.sinseino);
            $('#dl_yoteikosu').val(ret.data.yoteikosu);
            $('#dl_jissekikosu').val(ret.data.jissekikosu);
            $('#dl_dev_tan').val(ret.data.dev_tan);
            $('#dl_start_yotei').val(ret.data.start_yotei);
            $('#dl_end_yotei').val(ret.data.end_yotei);
            $('#dl_start_jisseki').val(ret.data.start_jisseki);
            $('#dl_end_jisseki').val(ret.data.end_jisseki);
            $('#dl_bikou').val(ret.data.bikou);
            $('#dl_add_date').val(ret.data.add_date);
            $('#dl_add_syain').val(ret.data.add_syain);
            $('#dl_upd_date').val(ret.data.upd_date);
            $('#dl_upd_syain').val(ret.data.upd_syain);

            $('#edit_kadai').dialog('open');
            $('#edit_kadai').next().find('button').focus();
        }).fail(function(ret) {
            $.alert('読込エラーです。再試行して下さい');
        });
    }
    $('#edit_kadai').dialog({
		autoOpen: false,
		width: 540,
		modal: true,
        resizable: false,
        buttons: {
            '閉じる': function() {
                $(this).dialog('close');
            },
        }
    });
    $('#edit_story').dialog({
		autoOpen: false,
		width: 500,
		modal: true,
        resizable: false,
        open: function() {
            msgid = '#story_msg';
            clearMessage();
        },
        close: function() {
            msgid = '#msg';
        },
        buttons: {
            '登録': function() {
                if ($('#dl_story_title').val().trim() === '') {
                    showMessage2($('#dl_story_title'),'ストーリ名を入力して下さい','#0000ff');
                    return;
                }
                if ($('#dl_story_start_yotei').val().trim() === '') {
                    showMessage2($('#dl_story_start_yotei'),'開始日を入力して下さい','#0000ff');
                    return;
                }
                if ($('#dl_story_start_yotei').val().isDate() === false) {
                    showMessage2($('#dl_story_start_yotei'),'開始日を正しく入力して下さい','#0000ff');
                    return;
                }
                if (sv_parent.data('syotei') !== '' && sv_parent.data('syotei') > $('#dl_story_start_yotei').val()) {
                    showMessage2($('#dl_story_start_yotei'),'開始日を課題開始予定日（'+sv_parent.data('syotei')+'）以降で入力して下さい','#0000ff');
                    return;
                }
                if ($('#dl_story_end_yotei').val().trim() === '') {
                    showMessage2($('#dl_story_end_yotei'),'終了日を入力して下さい','#0000ff');
                    return;
                }
                if ($('#dl_story_end_yotei').val().isDate() === false) {
                    showMessage2($('#dl_story_end_yotei'),'終了日を正しく入力して下さい','#0000ff');
                    return;
                }
                if (sv_parent.data('eyotei') !== '' && sv_parent.data('eyotei') < $('#dl_story_end_yotei').val()) {
                    showMessage2($('#dl_story_end_yotei'),'終了日を課題終了予定日（'+sv_parent.data('eyotei')+'）以前で入力して下さい','#0000ff');
                    return;
                }
                if ($('#dl_story_start_yotei').val() > $('#dl_story_end_yotei').val()) {
                    showMessage2($('#dl_story_start_yotei'),'予定期間を正しく入力して下さい','#ff0000');
                    return;
                }
                if ($('#dl_story_ration_auto').prop('checked') === false) {
                    if ($('#dl_story_ration').val().isNumeric() === false) {
                        showMessage2($('#dl_story_ration'),'進捗割合を数値で入力して下さい','#ff0000');
                        return;
                    }
                    var ration_sum = 0;
                    sv_parent.children('.board_story').each(function(i) {
                        if ((sv_obj !== null && sv_obj.is($(this)) === false) && $(this).data('ration_auto') === 0) {
                            ration_sum += $(this).data('ration');
                        }
                    });
                    if (parseInt($('#dl_story_ration').val()) + ration_sum > 100) {
                        showMessage2($('#dl_story_ration'),'進捗割合を'+(100-ration_sum)+'以下で入力して下さい','#ff0000');
                        return;
                    }
                }
                var para = {
                    keynum: sv_parent.data('keynum'),
                    storyno: (sv_obj === null ? 0 : sv_obj.data('storyno')),
                    title: $('#dl_story_title').val().trim(),
                    start_yotei: $('#dl_story_start_yotei').val().trim(),
                    end_yotei: $('#dl_story_end_yotei').val().trim(),
                    ration_auto: $('#dl_story_ration_auto').prop('checked') ? 1:0,
                    ration: $('#dl_story_ration').val(),
                    color: $('#edit_story .sels_color').index($('#edit_story .sel_color')),
                    bikou: $('#dl_story_bikou').val(),
                    syaincd: $('#dl_story_syain').val()
                }
                Ajax('taskman.php?func=storyReg',para).done(function(ret) {
                    if (ret.code === 'OK') {
                        if (ret.data) {
                            $('#board_main_body').databindex('addchild',ret.data,
                                (sv_parent.children('.board_story').length === 0 ? sv_parent.children('.board_comp') : sv_parent.children('.board_story:last')));
                            // $('#board_main_body').databindex('addchild',ret.data, sv_parent.children('.board_comp'));
                            taskSortable(sv_parent.children('.board_story:last'));
                            setSilder(sv_parent.find('.slide_bar:last'));
                        } else {
                            sv_obj.children('.board_title_waku').children('.board_title').text(para.title).data('title',para.title);
                            sv_obj.data('syotei',para.start_yotei);
                            sv_obj.data('eyotei',para.end_yotei);
                            sv_obj.children('.board_memo').children('.memo_kikan').text(para.start_yotei.substr(5)+'～'+para.end_yotei.substr(5));
                            sv_obj.data('ration_auto',para.ration_auto);
                            sv_obj.data('ration',para.ration);
                            if (para.color != sv_obj.data('color')) {
                                sv_obj.removeClass('bg'+sv_obj.data('color'));
                                sv_obj.data('color',para.color);
                                sv_obj.addClass('bg'+para.color);
                            }
                            sv_obj.data('bikou',para.bikou);
                            sv_obj.data('syain',para.syaincd);
                            sv_obj.children('.board_memo').children('.memo_syutantou').text($('#dl_story_syain option:selected').text());
                        }
                        setTimeout(function() {
                            sv_parent.children('.board_story').each(function(i) {
                                if ($(this).data('ration_auto') === 1 && ret.ration) {
                                    $(this).data('ration',ret.ration);
                                }
                            });
                            calcProgress(sv_parent);
                        },101)
                        $('#edit_story').dialog('close');
                    } else {
                        $.alert('変更できませんでした');
                    }
                }).fail(function(ret) {
                    $.alert('変更できませんでした');
                });
            },
            '閉じる': function() {
                $(this).dialog('close');
            },
        }
    });
    $('.sels_color').click(function() {
        $('.sels_color').removeClass('sel_color');
        $(this).addClass('sel_color');
    });
    $('#dl_story_ration_auto').change(function() {
        $('#dl_story_ration').prop('disabled',($(this).prop('checked')));
        if ($(this).prop('checked') === false) {
            $('#dl_story_ration').focus();
        }
    });
    $('#edit_task').dialog({
		autoOpen: false,
		width: 500,
		modal: true,
        resizable: false,
        open: function() {
            msgid = '#task_msg';
            $('#dl_task_worktime').data('sv_val','0');
            $('#dl_task_nippomemo').data('sv_val','');
            $('#dl_task_nippodate').val(today_str).change();
            clearMessage();
        },
        close: function() {
            msgid = '#msg';
        },
        buttons: {
            '登録': function() {
                if ($('#dl_task_title').val().trim() === '') {
                    showMessage2($('#dl_task_title'),'タスク名を入力して下さい','#0000ff');
                    return;
                }
                if ($('#dl_task_ration_auto').prop('checked') === false) {
                    if ($('#dl_task_ration').val().isNumeric() === false) {
                        showMessage2($('#dl_task_ration'),'進捗割合を数値で入力して下さい','#ff0000');
                        return;
                    }
                    var ration_sum = 0;
                    sv_parent.children('.board_task').each(function(i) {
                        if ((sv_obj !== null && sv_obj.is($(this)) === false) && $(this).data('ration_auto') === 0) {
                            ration_sum += $(this).data('ration');
                        }
                    });
                    if (parseInt($('#dl_task_ration').val()) + ration_sum > 100) {
                        showMessage2($('#dl_task_ration'),'進捗割合を'+(100-ration_sum)+'以下で入力して下さい','#ff0000');
                        return;
                    }
                }
                if ($('#dl_task_nippodate').val().isDate() === false) {
                    showMessage2($('#dl_task_nippodate'),'日報入力日を正しく入力して下さい','#ff0000');
                    return;
                }
                if ($('#dl_task_nippodate').val() > today_str) {
                    showMessage2($('#dl_task_nippodate'),'日報入力日に未来の日付は指定できません','#ff0000');
                    return;
                }
                var para = {
                    keynum: sv_parent.parent().data('keynum'),
                    storyno: sv_parent.data('storyno'),
                    taskno: (sv_obj === null ? 0 : sv_obj.data('taskno')),
                    title: $('#dl_task_title').val().trim(),
                    ration_auto: $('#dl_task_ration_auto').prop('checked') ? 1:0,
                    ration: $('#dl_task_ration').val(),
                    progress: $('#dl_task_progress').slider('value'),
                    bikou: $('#dl_task_bikou').val(),
                    work_syori: $('#dl_task_nippodate').val(),
                    work_time: $('#dl_task_worktime').val(),
                    memo: $('#dl_task_nippomemo').val(),
                    nippo: ($('#dl_task_worktime').val() !== String($('#dl_task_worktime').data('sv_val'))
                            || $('#dl_task_nippomemo').val() !== $('#dl_task_nippomemo').data('sv_val') ? '1' : '0')
                }
                Ajax('taskman.php?func=taskReg',para).done(function(ret) {
                    if (ret.code === 'OK') {
                        if (ret.data) {
                            let ix = 0;
                            sv_parent.children('.board_task').each(function(i) {
                                if ($(this).find('.slide_bar').data('val') === 100) {
                                    ix = i - 1;
                                    return false;
                                }
                                ix = i;
                            })
                            $('#board_main_body').databindex('addchild',ret.data,(ix<0 ? sv_parent.children('.board_memo') : sv_parent.children('.board_task').eq(ix)));
                            // $('#board_main_body').databindex('addchild',ret.data,sv_parent.children('.board_memo'));
                            sv_obj = sv_parent.children('.board_task').eq(ix+1).find('.slide_bar');
                            setSilder(sv_obj);
                        } else {
                            sv_obj.children('.board_title_waku').children('.board_title').text(para.title).data('title',para.title);
                            if (para.progress === 100) {
                                sv_obj.children('.board_title_waku').children('.board_title').addClass('comp');
                            }
                            sv_obj.data('ration_auto',para.ration_auto);
                            sv_obj.find('.slide_bar').slider('value',para.progress).data('val',para.progress);
                            sv_obj.find('.progress').text(para.progress+'%');
                            sv_obj.data('bikou',para.bikou);
                        }
                        setTimeout(function() {
                            sv_parent.children('.board_task').each(function(i) {
                                if ($(this).data('ration_auto') === 1 && ret.ration) {
                                    $(this).data('ration',ret.ration);
                                }
                            });
                            calcProgress(sv_parent.parent());
                        },101)
                        $('#edit_task').dialog('close');
                    } else {
                        $.alert('変更できませんでした');
                    }
                }).fail(function(ret) {
                    $.alert('変更できませんでした');
                });
            },
            '閉じる': function() {
                $(this).dialog('close');
            },
        }
    });
    // タスク画面日報入力用
    $('#dl_task_nippodate').change(function() {
        if (sv_obj === null) {
            return;
        }
        let para = {
            keynum: sv_parent.parent().data('keynum'),
            storyno: sv_parent.data('storyno'),
            taskno: sv_obj.data('taskno'),
            work_syori: $(this).val()
        }
        Ajax('taskman.php?func=nippoGet',para).done(function(ret) {
            $('#dl_task_worktime').val(ret.work_time).data('sv_val',ret.work_time);
            $('#dl_task_nippomemo').val(ret.memo).data('sv_val',ret.memo);
        }).fail(function(ret) {
            $.alert('エラーが発生しました。');
        });

    });
    // ゲストは登録不可
    if (user_name === 'ゲスト') {
        $('.ui-dialog-buttonpane button:contains("登録")').remove();
    }
    $('#dl_task_ration_auto').change(function() {
        $('#dl_task_ration').prop('disabled',($(this).prop('checked')));
        if ($(this).prop('checked') === false) {
            $('#dl_task_ration').focus();
        }
    });
    $('#dl_task_progress').slider({
        range: 'min',
        min: 0,
        max: 100,
        step: 10,
        value: $(this).data('val'),
        slide: function( e, ui ) {
            $(this).prev().text(ui.value+'%');
        }
    });
    // プログレス値計算
    function calcProgress(kadai) {
        let kadai_val = 0.0;
        // let old_progress = kadai.children('.board_memo').children('.memo_progress').text();
        let comp_cnt = 0;
        kadai.children('.board_story').each(function() {
            let story_val = 0.0;
            $(this).children('.board_task').each(function() {
                story_val += parseInt($(this).find('.slide_bar').data('val')) * ($(this).data('ration') / 100);
            });
            let story_proress = Math.floor(story_val+0.01)+'%';
            $(this).children('.board_memo').children('.memo_progress').text(story_proress);
            if (story_proress === '100%') {
                comp_cnt++;
            }
            story_val = Math.floor(story_val+0.01);
            kadai_val += story_val * ($(this).data('ration') / 100);
        });
        let new_progress = Math.floor(kadai_val + 0.01) - Math.floor(kadai_val + 0.01) % 5;
        kadai.children('.board_memo').children('.memo_progress').text(new_progress+'%');
        kadai.children('.board_comp').children('.board_comp_cnt').text(comp_cnt);
    }
    // メイン域の幅変更時
    function mainResize(reload) {
        function resizeSub() {
            var main_body_width = $(window).width() - 2 - ($('#board_left').is(':visible') ? column_width : 0) - ($('#board_right').is(':visible') ? column_width : 0);
            $('#board_main_body_sc').width(main_body_width);
            $('#board_main .board_header').width(main_body_width);
            let count = parseInt(($('#board_main_body').width()+2) / column_width);
            if (count > 6) {
                count = 6;
            }
            if (column_cnt < count) {
                while ($('#board_main_body .column').length < count) {
                    $('#board_main_body').append('<div class="column"></div>');
                    reload = true;
                }
                column_cnt = count;
            } else if (column_cnt > count) {
                while ($('#board_main_body .column').length > count) {
                    if ($('#board_main_body .column:last').children().length === 0) {
                        $('#board_main_body .column:last').remove();
                        column_cnt--;
                    } else {
                        break;
                    }
                }
            }
            if (reload) {
                sortable();
            }
        }
        if (reload) {
            // ChromeでF5リロード時に両ボード表示時に$(window).width()が正しく取得できない為、少し遅らせて取得する。
            setTimeout(resizeSub,10);
        } else {
            resizeSub();
        }
    }
    // 検索クリック
    $('#board_find').click(function() {
        if ($('#board_find_words').val() !== '') {
            $('#board_syain').val('0');
        }
        dataLoadBoard($('#board_find_words').val());
    });
    // 作業進捗データ読込
    function dataLoadBoard(find_words) {
        column_cnt = 0;
        let para = {
            dept_cd: $('#board_syozoku').val(),
            syaincd: $('#board_syain').val(),
            syainnm: $('#board_syain option:selected').text(),
            find_words: find_words,
            super_reload: super_reload ? 1 : 0
        };
        BlockScreen('読込中 ...');
        Ajax('taskman.php?func=loadBoard',para).done(function(ret) {
            clearMessage();
            if (ret.code === 'OK') {
                for (let i=0; i<6; i++) {
                    $('#board_main .board_header > div').eq(i).text(ret.title[i]);
                }
                if (ret.syain_list) {
                    $('#board_syain').databind(ret.syain_list);
                    $('#schdule_syain').databind(ret.syain_list);
                }
                if (ret.data_left) {
                    $('#board_left_body').databindex(ret.data_left);
                    $('#board_left_body').find('.board_story:not(.story_hide)').hide();
                } else {
                    $('#board_left_body').html('<div class="column"></div>');
                }
                if (ret.data_main) {
                    $('#board_main_body').databindex(ret.data_main);
                } else {
                    $('#board_main_body').html('<div class="column"></div>');
                    showMessage('対象データ無し','#0000ff');
                }
                if (ret.data_right) {
                    $('#board_right_body').databindex(ret.data_right);
                    $('#board_right_body').find('.board_story:not(.story_hide)').hide();
                } else {
                    $('#board_right_body').html('<div class="column"></div>');
                }
                if (find_words !== '') {
                    if (ret.data_left === undefined && ret.data_main === undefined && ret.data_right == undefined) {
                        showMessage('該当データ無し','#ff0000');
                    } else {
                        showMessage('未振分:'+$('#board_left_body .board_kadai').length+'件　進行中:'+$('#board_main_body .board_kadai').length+'件　完了:'+$('#board_right_body .board_kadai').length+' 件ヒットしました。','#0000ff');
                        if (ret.data_right && $('#disp_right').prop('checked') === false) {
                            $('#disp_right').prop('checked',true).change();
                        }
                    }
                }
                storySortable($('.board_kadai'));
                taskSortable($('.board_story'));
                $('.slide_bar').each(function() {
                    setSilder($(this));
                    // 完了タスクのスライドバーを非表示
                    // if ($(this).data('val') === 100) {
                    //     $(this).parent().hide();
                    // }
                });
                // 完了ストーリーのタスクと開始前タスクと担当者指定時に他担当者分を非表示
                $('#board_main_body .board_story').each(function() {
                    if ($(this).children('.board_memo').children('.memo_progress').text() === '100%') {
                        // $(this).find('.board_task').hide();
                    }
                    // if ($(this).data('syotei') > today_str && $(this).children('.board_memo').children('.memo_progress').text() === '0%') {
                    //     $(this).find('.board_task').hide();
                    // }
                    if ($('#board_syain').val() !== "0" && $('#board_syain option:selected').text() !== $(this).children('.board_memo').children('.memo_syutantou').text() && $(this).hasClass('story_hide') === false) {
                        $(this).hide();
                    }
                });
                mainResize(true);
            } else {
                $.alert('データ読込に失敗しました。再読込して下さい。');
                // location.reload();
            }
        }).fail(function(ret) {
            $.alert('データ読込に失敗しました。再読込して下さい。');
            // location.reload();
        }).always(function(ret) {
            UnBlockScreen();
        });
    }
    function storySortable($this) {
        // ゲストは更新不可
        if (user_name === 'ゲスト') {
            return;
        }
        // ストーリの並び替え
        $this.sortable({
            items: '.board_story',
            axis: 'y',
            start: function() {
                $(document).tooltip('disable');
            },
            stop: function(e,ui) {
                let storyno = [];
                ui.item.parents('.board_kadai').children('.board_story').each(function() {
                    storyno.push($(this).data('storyno'));
                })
                let para = {
                    keynum: ui.item.parents('.board_kadai').data('keynum'),
                    storyno: storyno
                }
                Ajax('taskman.php?func=orderStory',para).done(function(ret) {
                }).fail(function(ret) {
                    $.alert('更新エラーです。再読込して下さい');
                });
                $(document).tooltip('enable');
            }
        });
    }
    function taskSortable($this) {
        // ゲストは更新不可
        if (user_name === 'ゲスト') {
            return;
        }
        // タスクの並び替え
        $this.sortable({
            items: '.board_task',
            axis: 'y',
            start: function() {
                $(document).tooltip('disable');
            },
            stop: function(e,ui) {
                let taskno = [];
                ui.item.parents('.board_story').children('.board_task').each(function() {
                    taskno.push($(this).data('taskno'));
                })
                let para = {
                    keynum: ui.item.parents('.board_kadai').data('keynum'),
                    storyno: ui.item.parents('.board_story').data('storyno'),
                    taskno: taskno
                }
                Ajax('taskman.php?func=orderTask',para).done(function(ret) {
                }).fail(function(ret) {
                    $.alert('更新エラーです。再読込して下さい');
                });
                $(document).tooltip('enable');
            }
        });
    }
    function setSilder($this) {
        $this.slider({
            range: 'min',
            min: 0,
            max: 100,
            step: 10,
            value: $this.data('val'),
            slide: function( e, ui ) {
                // ゲストは更新不可
                if (user_name === 'ゲスト' || String($this.parents('.board_story').data('syain')) !== syaincd) {
                    return false;
                }
                $(this).prev().text(ui.value+'%');
            },
            change: function( e, ui ) {
                $this.data('val',ui.value);
                let para = {
                    keynum: $this.parents('.board_kadai').data('keynum'),
                    storyno: $this.parents('.board_story').data('storyno'),
                    taskno: $this.parents('.board_task').data('taskno'),
                    value: ui.value
                }
                // $this = $this;
                Ajax('taskman.php?func=setTaskProgress',para).done(function(ret) {
                    let task = $this.parent().parent().children('.board_title_waku').children('.board_title');
                    if (ui.value === 100 && task.hasClass('comp') === false) {
                        task.addClass('comp');
                    } else if (ui.value < 100 && task.hasClass('comp')) {
                        task.removeClass('comp');
                    }
                    let story = $this.parents('.board_story').children('.board_title_waku').children('.board_title');
                    let progress = $this.parents('.board_story').children('.board_memo').children('.memo_progress');
                    if (progress.text() === '100%' && story.hasClass('comp') === false) {
                        story.addClass('comp');
                    } else if (progress.text() !== '100%' && story.hasClass('comp')) {
                        story.removeClass('comp');
                    }
                }).fail(function(ret) {
                    $.alert('更新エラーです。再読込して下さい');
                });
                calcProgress($this.parents('.board_kadai'));
            }
        });
    }
    // ストーリー担当者変更
    $(document).on('click','.board_story .memo_syutantou',function() {
        // ゲストは更新不可
        if (user_name === 'ゲスト') {
            return false;
        }
        if ($('#select_syain_scr').is(':visible') === false) {
            sv_obj = $(this);
            let pos = $(this).offset();
            $('#select_syain').css({left: pos.left+24, top: pos.top+5});
            $('#select_syain_scr').show();
            if ($(window).height() < pos.top + $('#select_syain').height()) {
                $('#select_syain').css('top', pos.top-$('#select_syain').height()-15);
            }
        }
    });
    // 担当者クリック
    $(document).on('click','#select_syain li',function() {
        $this = $(this);
        if (sv_obj.text() === $this.text()) {
            return;
        }
        let para = {
            keynum: sv_obj.parents('.board_kadai').data('keynum'),
            storyno: sv_obj.parents('.board_story').data('storyno'),
            syaincd: $(this).data('syaincd')
        }
        Ajax('taskman.php?func=updateTantou',para).done(function(ret) {
            sv_obj.text($this.text());
        }).fail(function(ret) {
            $.alert('変更できませんでした');
        });
    });
    // 担当者変更画面非表示
    $('#select_syain_scr').click(function() {
        $(this).hide();
    });
    // 終了ストーリー表示・非表示
    $(document).on('click','.board_comp',function() {
        if ($(this).children().eq(0).text() === '終了したストーリー（') {
            if ($(this).children('.board_comp_switch').text() === '▼') {
                $(this).parent().children('.story_hide').removeClass('story_hide');
                $(this).children('.board_comp_switch').text('▲');
            } else {
                $(this).parent().children('.board_story').each(function() {
                    if ($(this).children('.board_memo').children('.memo_progress').text() === '100%') {
                        $(this).addClass('story_hide');
                    }
                });
                $(this).children('.board_comp_switch').text('▼');
            }
        } else {
            if ($(this).children('.board_comp_switch').text() === '▼') {
                $(this).parent().children('.task_hide').removeClass('task_hide');
                $(this).children('.board_comp_switch').text('▲');
            } else {
                $(this).parent().children('.board_task').each(function() {
                    if ($(this).children('.progress_waku').children('.progress').text() === '100%') {
                        $(this).addClass('task_hide');
                    }
                });
                $(this).children('.board_comp_switch').text('▼');
            }
        }
    });
    // 各タイトルのホバー時にタイトルが長い時だけツールチップを表示する
    $(document).on('mouseover','.board_title,.schdule_title,.kadai_title',function() {
		if ($(this)[0].offsetHeight > $(this).parent()[0].offsetHeight && ($(this).attr('title') == undefined || $(this).attr('title') != $(this).data('title'))) {
            if ($(this).attr('title') !== $(this).data('title')) {
                $(this).attr('title', $(this).data('title'));
            }
		}
        if ($(this)[0].className === 'schdule_title'
        && $(this).parent().next()[0].className === 'schdule_exwaku'
        && $(this).parent().parent().height() === 23
        && $(this).attr('title') !== $(this).parent().next().text()) {
            if ($(this).attr('title') === undefined) {
                $(this).attr('title','');
            }
            $(this).attr('title', ($(this).attr('title') === '' ? $(this).parent().next().text() : $(this).attr('title')+'\n'+$(this).parent().next().text()));
        }
    });
    // コンテキストメニュー 課題
    $.contextMenu({
        selector: '.board_kadai > .board_title_waku',
        callback: function(key, options) {
            if (key === 'add') {
                $(this).children('.add_btn').click();
            } else if (key === 'dispstory') {
                if ($('#board_syain').val() !== "0") {
                    $(this).parent().children('.board_story').not('.story_hide').each(function() {
                        if ($('#board_syain option:selected').text() !== $(this).children('.board_memo').children('.memo_syutantou').text()) {
                            $(this).toggle();
                        }
                    });
                }
            } else if (key === 'edit') {
                $(this).children('.board_title').click();
            } else if (key === 'link') {
                window.open('https://leoportal.leopalace21.com/leo-wperformer/WP_Jsystem/_link.do?i=I07002_KADAI_DTL.do&p='+$(this).parent().data('keynum'));
            }
        },
        items: {
            add:{ name:'ストーリー追加', icon:'add', },
            sep1: '---------',
            dispstory: {name:'他担当者ストーリー表示'},
            sep2: '---------',
            edit: { name:'課題情報'},
            link: { name:'課題管理システム'}
        },
        events: {
            show: function(opt) {
                $.contextMenu.setInputValues(opt, {jyotai: '2'});
            },
            hide: function(opt) {
                var $this = this;
                $.contextMenu.getInputValues(opt, $this.data());
            }
        }
    });
    // コンテキストメニュー ストーリー
    $.contextMenu({
        selector: '.board_story > .board_title_waku',
        callback: function(key, options) {
            if (key === 'add') {
                $(this).children('.add_btn').click();
            } else if (key === 'disptask') {
                // $(this).parent().children('.board_task').toggle();
            } else if (key === 'edit') {
                $(this).children('.board_title').click();
            } else if (key === 'delete') {
                // ゲストは更新不可
                $this = $(this).parent();
                if (user_name === 'ゲスト' || String($this.data('syain')) !== syaincd) {
                    $.alert('削除できません');
                    return false;
                }
                if ($this.find('.memo_progress').text() !== '0%') {
                    $.alert('進捗のあるストーリーは削除できません');
                } else {
                    $.confirm('ストーリーを削除します。よろしいですか？').done(function() {
                        sv_parent = $this.parent();
                        var para = {
                            keynum: sv_parent.data('keynum'),
                            storyno: $this.data('storyno')
                        }
                        Ajax('taskman.php?func=deleteStory',para).done(function(ret) {
                            if (ret.code === 'NIPPO') {
                                $.alert('日報入力がある為、削除できません');
                            } else {
                                $this.remove();
                                sv_parent.children('.board_story').each(function(i) {
                                    if ($(this).data('ration_auto') === 1 && ret.ration) {
                                        $(this).data('ration',ret.ration);
                                    }
                                });
                                calcProgress(sv_parent);
                            }
                        }).fail(function(ret) {
                            $.alert('削除エラーです。再読込して下さい');
                        });
                    });
                }
            }
        },
        items: {
            add: { name:'タスク追加', icon:'add', },
            // disptask: {name:'タスク表示／非表示'},
            sep1: '---------',
            edit: { name:'ストーリー編集', icon:'edit', },
            sep2: '---------',
            delete: { name:'ストーリー削除', icon:'delete', },
        },
        events: {
            show: function(opt) {
                sv_obj = $(this).parent();
            }
        }
    });
    // コンテキストメニュー タスク
    $.contextMenu({
        selector: '.board_task > .board_title_waku',
        callback: function(key, options) {
            // if (key === 'disptask') {
            //     $(this).parent().children('.progress_waku').toggle();
            if (key === 'edit') {
                $(this).children('.board_title').click();
            } else if (key === 'delete') {
                // ゲストは更新不可
                $this = $(this).parent();
                if (user_name === 'ゲスト' || String($this.parents('.board_story').data('syain')) !== syaincd) {
                    $.alert('削除できません');
                    return false;
                }
                if ($this.find('.slide_bar').data('val') > 0) {
                    $.alert('進捗のあるタスクは削除できません');
                } else if ($this.parent('.board_story').children('.board_task').length === 1) {
                    $.alert('ストーリーを削除して下さい');
                } else {
                    $.confirm('タスクを削除します。よろしいですか？').done(function() {
                        sv_parent = $this.parent();
                        var para = {
                            keynum: $this.parents('.board_kadai').data('keynum'),
                            storyno: sv_parent.data('storyno'),
                            taskno: $this.data('taskno')
                        }
                        Ajax('taskman.php?func=deleteTask',para).done(function(ret) {
                            if (ret.code === 'NIPPO') {
                                $.alert('日報入力がある為、削除できません');
                            } else {
                                $this.remove();
                                sv_parent.children('.board_task').each(function(i) {
                                    if ($(this).data('ration_auto') === 1 && ret.ration) {
                                        $(this).data('ration',ret.ration);
                                    }
                                });
                                calcProgress(sv_parent.parent());
                            }
                        }).fail(function(ret) {
                            $.alert('削除エラーです。再読込して下さい');
                        });
                    });
                }
            }
        },
        items: {
            // disptask: {name:'プログレス表示／非表示'},
            // sep1: '---------',
            edit: { name:'タスク編集', icon:'edit', },
            sep2: '---------',
            delete: { name:'タスク削除', icon:'delete', },
        },
        events: {
            show: function(opt) {
                sv_obj = $(this).parent();
            }
        }
    });
    $(document).on('click','.sub_menu',function(e) {
        $(this).parent().contextMenu();
        e.preventDefault();
    })
    // --------------------------------- //
    // ここから日報入力関連                //
    // --------------------------------- //
    $('#schdule_body_item').empty();
    $('#schdule_body_ctrl').databindex();
    $('#schdule_head_ctrl,#schdule_body_ctrl').width(localStorage.getItem('taskman_schedule_width') || 800);
    // ■ カレンダー関連処理
    // 日報入力クリック
    $('#disp_schdule').change(function() {
        $('#schdule_body_ctrl').empty();
        $('#schdule_body_item').empty();
        $('#board,#board_option').hide();
        $('#kadai,#kadai_option').hide();
        $('#schdule,#schdule_option').show();
        dataLoadSchdule();
    });
    // 処理年月変更（前月クリック）
    $('#prev_ym').click(function() {
        syori_ym.addMonth(-1);
        str_syori = new Date(syori_ym).addMonth(-1);
        end_syori = new Date(syori_ym).addMonth(2).addDay(-1);
        dataLoadSchdule();
    });
    // 処理年月変更（翌月クリック）
    $('#next_ym').click(function() {
        if (today.formatDate('YYYYMM') > syori_ym.formatDate('YYYYMM')) {
            syori_ym.addMonth(1);
            str_syori = new Date(syori_ym).addMonth(-1);
            end_syori = new Date(syori_ym).addMonth(2).addDay(-1);
            dataLoadSchdule();
        } else {
            showMessage('これより先のデータは選択できません','#0000ff');
            // scroll_flg = false;
        }
    });
    // スクロールでの月変更実装したがいまいち
    // var scroll_flg = false;
    // $('#schdule_body_item').scroll(function() {
    //     if (scroll_flg === false) {
    //         if ($(this).scrollLeft() === 0) {
    //             scroll_flg = false;
    //             $('#prev_ym').click();
    //         }
    //     }
    // })
    // 部署一覧変更時
    $('#schdule_syozoku,#schdule_syain').change(function() {
        if ($(this)[0].id === 'schdule_syozoku') {
            $('#schdule_syain').val('0');
            $('#board_syain').val('0');
            $('#board_syozoku').val($(this).val());
            $('#kadai_syozoku').val($(this).val());
        } else {
            $('#board_syain').val($(this).val());
        }
        dataLoadSchdule();
    });
    $('#hide_comp,#disp1').change(function() {
        if ($(this)[0].id === 'hide_comp' && $('#hide_comp').prop('checked')) {
            $('#disp1').prop('checked',false).button();
        } else if ($('#hide_comp').prop('checked')) {
            $('#hide_comp').prop('checked',false).button();
        }
        dataLoadSchdule();
        localStorage.setItem('taskman_schdule_hidecomp',($('#hide_comp').prop('checked') ? '1' : '0'));
        localStorage.setItem('taskman_schdule_disp1',($('#disp1').prop('checked') ? '1' : '0'));
    });
    $(document).on('click','.schdule_title_waku',function() {
        if ($(this).parent().parent().hasClass('schdule_kadai')) {
            // 課題
            dispKadaiForm($(this).parents('.schdule_kadai').data('keynum'));
        } else if ($(this).parent().parent().hasClass('schdule_story')) {
            // ストーリー
        } else if ($(this).parent().parent().hasClass('schdule_task')) {
            // タスク
        }
    });
    // 日報データ読込
    const cellwidth = 33;
    function dataLoadSchdule() {
        BlockScreen('読込中 ...');
        let para = {
            syori_ym: syori_ym.formatDate('YYYY/MM/01'),
            dept_cd: $('#schdule_syozoku').val(),
            syaincd: $('#schdule_syain').val(),
            syainnm: $('#schdule_syain option:selected').text(),
            hidecomp: $('#hide_comp').prop('checked') ? 1 : 0,
            disp1: $('#disp1').prop('checked') ? 1 : 0
        }
        kyuka = ['',' kyuka'];
        sv_monthkei = 0;
        Ajax('taskman.php?func=loadSchdule',para).done(function(ret) {
            if (ret.code === 'OK') {
                if (ret.syain_list) {
                    $('#schdule_syain').databind(ret.syain_list);
                    $('#board_syain').databind(ret.syain_list);
                }
                $('#schdule_body_ctrl').databindex(ret.data.kadai);
                $('#schdule_body_sum').remove();
                // $('#schdule_body_ctrl').prepend('<div id="schdule_ctrl_sum"></div>');
                sv_monthkei = ret.data.monthkei;
                $('#monthkei').text('月合計 '+ret.data.monthkei+' h');
                let width = ret.daycnt * cellwidth;
                let headsum = $('<div id="schdule_body_sum" style="width:'+width+'px">'+'<div class="cells"></div>'.repeat(ret.daycnt)+'</div>');
                let w_item = '';
                if (ret.data.kadai) {
                    ret.data.kadai.forEach(function(rec) {
                        if (rec.schdule_story !== undefined) {
                            rec.schdule_story.forEach(function(srec) {
                                // $(this).css({left:left+(s-1)*width,width:(e-s+1)*width});
                                let story_bordar = '';
                                if (srec.start_yotei <= end_syori.formatDate('YYYY/MM/DD') && srec.end_yotei >= str_syori.formatDate('YYYY/MM/DD')) {
                                    let b_left = 0;
                                    let b_width = ret.daycnt*cellwidth;
                                    if (srec.start_yotei > str_syori.formatDate('YYYY/MM/DD')) {
                                        b_left = (getDays(str_syori,new Date(srec.start_yotei))-1)*cellwidth;
                                    }
                                    if (srec.end_yotei < end_syori.formatDate('YYYY/MM/DD')) {
                                        b_width = getDays(str_syori,new Date(srec.end_yotei))*cellwidth-b_left-2;
                                    }　else {
                                        b_width = b_width - b_left - 2;
                                    }
                                    let border_height;
                                    if ($('#hide_comp').prop('checked') || $('#disp1').prop('checked')) {
                                        let cnt = 0;
                                        srec.schdule_task.forEach(function(trec) {
                                            if (trec.task_disp !== 'sc_hide') {
                                                cnt++;
                                            }
                                        });
                                        border_height = 23 * cnt + (cnt - 1);
                                    } else {
                                        border_height = 23 * srec.schdule_task.length + (srec.schdule_task.length - 1);
                                    }
                                    if (border_height > 0) {
                                        story_bordar = '<div class="schdule_story_border bg'+srec.color+'" '+
                                                        'style="z-index:3;top:-1px;height:'+border_height+'px;'+
                                                        'left:'+b_left+'px;width:'+b_width+'px"></div>';
                                    }
                                }

                                srec.schdule_task.forEach(function(trec) {
                                    w_item += '<div class="row" style="width:'+width+'px'+(trec.task_disp === 'sc_hide' ? ';display:none':'')+'">';
                                    if (trec.task_disp !== 'sc_hide') {
                                        w_item += story_bordar;
                                        story_bordar = '';
                                    }
                                    let w_syori = new Date(str_syori);
                                    let i = 0;
                                    let memo;
                                    while (w_syori <= end_syori) {
                                        if (trec.memo && trec.memo[w_syori.formatDate('YYYY/MM/DD')]) {
                                            memo = trec.memo[w_syori.formatDate('YYYY/MM/DD')];
                                        } else {
                                            memo = '';
                                        }
                                        if (kyuka[srec.kyuka[i]] === undefined) {
                                            console.log(w_syori);
                                        }
                                        if (trec.nippo && trec.nippo[w_syori.formatDate('YYYY/MM/DD')]) {
                                            w_item += '<div class="cells'+kyuka[srec.kyuka[i]]+(memo === '' ? '' : ' cellmemo')+'" title="'+memo+'" data-memo="'+memo+'">'+trec.nippo[w_syori.formatDate('YYYY/MM/DD')]+'</div>';
                                            let sum = headsum.children('.cells').eq(i).text() === '' ? 0 : parseFloat(headsum.children('.cells').eq(i).text());
                                            headsum.children('.cells').eq(i).text(sum+parseFloat(trec.nippo[w_syori.formatDate('YYYY/MM/DD')]));
                                        } else {
                                            w_item += '<div class="cells'+kyuka[srec.kyuka[i]]+(memo === '' ? '' : ' cellmemo')+'" title="'+memo+'" data-memo="'+memo+'"></div>';
                                        }
                                        w_syori.addDay(1);
                                        i++;
                                    }
                                    w_item += '</div>';
                                });
                            });
                        }
                    });
                }
                // $('#schdule_body_item').html(headsum.prop('outerHTML')+w_item+'<div id="today_frame2"></div>');
                // setCalender(ret.holiday,width);
                $('#schdule_body_item').html(w_item+'<div id="today_frame2"></div>');
                setCalender(ret.holiday,width);
                $('#schdule_head_item').append(headsum.prop('outerHTML'));

                $('#schdule_body_ctrl').resizable({
                    minWidth: 600,
                    maxWidth: 1000,
                    handles: 'e',
                    resize: function(e, ui) {
                        $('#schdule_head_ctrl').width($(this).width());
                    },
                    stop: function(e, ui) {
                        localStorage.setItem('taskman_schedule_width',$(this).width());
                    }
                });
            } else {
                $.alert('データ読込に失敗しました。再読込して下さい。');
                // location.reload();
            }
        }).fail(function(ret) {
            $.alert('データ読込に失敗しました。再読込して下さい。');
            // location.reload();
        }).always(function(ret) {
            UnBlockScreen();
            clearMessage();
            // scroll_flg = false;
        });
    }
    // --------------------------------------------------------------------------------------------------------------------
    // カレンダーセット
    function setCalender(holiday,width) {
        let week = ['日','月','火','水','木','金','土'];
        let w_syori = new Date(str_syori);
        $('#shift_ym').text(syori_ym.formatDate('YYYY年MM月'));
        let w_day = '';
        let w_week = '';
        while (w_syori <= end_syori) {
            w_day += '<p class="cells">'+(w_syori.getDate() === 1 ? w_syori.formatDate('M/D') : w_syori.getDate())+'</p>';
            let add_class = '';
            if (w_syori.getDay() === 6) {
                add_class = ' saturday';
            } else if (w_syori.getDay() === 0 || holiday[w_syori.formatDate('MMDD')]) {
                add_class = ' holiday';
            }
            w_week += '<p class="cells'+add_class+'">'+week[w_syori.getDay()]+'</p>';
            w_syori.addDay(1);
        }
        $('#days').html(w_day).css('width',width);
        $('#week').html(w_week).css('width',width);
        // 当日枠を表示
        let pday = getDays(str_syori,today);
        dispTodayFrame(pday-1);
        if (today.getMonth() === syori_ym.getMonth()) {
            $('#schdule_body_item').scrollLeft((pday*cellwidth) - ($('#schdule_body_item').width() / 2));
        } else {
            $('#schdule_body_item').scrollLeft((width / 2) - ($('#schdule_body_item').width() / 2));
        }
    }
    // 当日枠を表示
    function dispTodayFrame(pday) {
        if (today.getMonth() === syori_ym.getMonth() || today.getMonth() === end_syori.getMonth()) {
            $('#today_frame1,#today_frame2').show();
            let left = $('#days .cells').eq(pday).position().left - $('#days .cells').eq(0).position().left;
            $('#today_frame1').css({top:0,left:left-1});
            $('#today_frame2').css({top:0,left:left-1});
            $('#today_frame1,#today_frame2').width($('#days .cells').eq(today.getDate()-1).width()-2);
            // if ($('#schdule_body').height() < $('#schdule_body_ctrl').height()) {
                // $('#today_frame2').height($('#schdule_body').height()-1);
            // } else {
            //     $('#today_frame2').height($('#schdule_body_ctrl').height()-1);
            // }
        } else {
            $('#today_frame1,#today_frame2').hide();
        }
    }
    // 日数計算
    function getDays(str_date,chk_date) {
        let w_date = new Date(str_date);
        let cnt = 0;
        while (w_date.formatDate('YYYYMM') < chk_date.formatDate('YYYYMM')) {
            w_date.addMonth(1);
            cnt += new Date(w_date).addDay(-1).getDate();
        }
        cnt += new Date(chk_date).getDate();

        return cnt;
    }
    // 作業時間選択枠表示
    let sv_syori;
    $(document).on('click','#schdule_body_item .cells',function() {
        sv_obj = $(this);
        if (checkCell() === false) {
            return;
        }
        if (sv_syori > today) {
            showMessage('入力不可です。','#0000ff');
            return;
        }
        clearMessage();
        let pos = $(this).offset();
        $('#worktime_sel').css({top:pos.top+12,left:pos.left-1});
        $('#worktime_sel_scr').show();
        if ($(window).height() < pos.top + $('#worktime_sel').height() + 12) {
            $('#worktime_sel').css('top', pos.top-$('#worktime_sel').height()-14);
        }
    });
    function checkCell() {
        if ($('#schdule_syain option:selected').text() !== $('#user_name').text()) {
            return false;
        }
        if (sv_obj.hasClass('kyuka')) {
            showMessage('休みの為、入力不可です。','#0000ff');
            return false;
        }
        let dcnt = sv_obj.parent().children('.cells').index(sv_obj);
        let pcnt = new Date(syori_ym).addDay(-1).getDate();
        if (pcnt < dcnt) {
            let tcnt = new Date(syori_ym).addMonth(1).addDay(-1).getDate();
            if ((pcnt+tcnt) < dcnt) {
                sv_syori = new Date(syori_ym).addMonth(1).addDay(dcnt-(pcnt+tcnt));
            } else {
                sv_syori = new Date(syori_ym).addDay(dcnt-pcnt);
            }
        } else {
            sv_syori = new Date(str_syori).addDay(dcnt);
        }
        return true;
    }
    // 作業時間選択
    $('#worktime_sel li').click(function() {
        cellUpdate($(this).text().trim(),sv_obj.data('memo')).done(function(ret) {
            if (ret.code !== 'OK') {
                $.alert('更新できませんでした');
            }
        }).fail(function(ret) {
            $.alert('更新できませんでした');
        }).always(function() {
            $('#worktime_sel_scr').hide();
        });
    });
    function cellUpdate(work_time,memo) {
        let dfd = $.Deferred();
        let ix = sv_obj.parent().children('.cells').index(sv_obj);
        let task = $('.schdule_task').eq($('.row').index(sv_obj.parent()));
        let story = task.parents('.schdule_story');
        let kadai = story.parents('.schdule_kadai');
        let para = {
            keynum: kadai.data('keynum'),
            storyno: story.data('storyno'),
            taskno: task.data('taskno'),
            work_syori: sv_syori.formatDate('YYYY/MM/DD'),
            work_time: work_time,
            memo: memo
        }
        Ajax('taskman.php?func=cellUpdate',para).done(function(ret) {
            if (para.work_time !== sv_obj.text()) {
                let wtime = parseFloat(para.work_time === '' ? 0 : para.work_time) - parseFloat(sv_obj.text() === '' ? 0 : sv_obj.text());
                task.data('kei',task.data('kei')+wtime);
                task.children('.schdule_waku').children('.worktime').children('.worktime_time').text(task.data('kei')+'h');
                story.data('kei',story.data('kei')+wtime);
                story.children('.schdule_waku').children('.worktime').children('.worktime_time').text(story.data('kei')+'h');
                kadai.data('kei',kadai.data('kei')+wtime);
                kadai.children('.schdule_waku').children('.worktime').children('.worktime_time').text(kadai.data('kei')+'h');
                sv_obj.text(para.work_time);
                if (sv_syori.formatDate('YYYYMM') === syori_ym.formatDate('YYYYMM')) {
                    sv_monthkei += wtime;
                    $('#monthkei').text('月合計 '+sv_monthkei+' h');
                }
                let sum = $('#schdule_body_sum .cells').eq(ix).text() === '' ? 0 : parseFloat($('#schdule_body_sum .cells').eq(ix).text());
                $('#schdule_body_sum .cells').eq(ix).text(sum+wtime);
            }
            if (para.memo === '' && sv_obj.data('memo') !== '') {
                sv_obj.removeClass('cellmemo');
            } else if (para.memo !== '' && sv_obj.data('memo') === '') {
                sv_obj.addClass('cellmemo');
            }
            sv_obj.attr('title',para.memo).data('memo',para.memo);
            dfd.resolve(ret);
        }).fail(function(ret) {
            dfd.reject(ret);
        });
        return dfd.promise();
    }
    $('#worktime_sel_scr').click(function() {
        $(this).hide();
    });
    $(document).on('mouseenter','.row',function() {
        let ix = $('.row').index($(this));
        let task = $('.schdule_task').eq(ix).find('.schdule_title_waku');
        task.addClass('task_hover');
        let story = task.parents('.schdule_story');
        story.children('.schdule_waku').children('.schdule_title_waku').addClass('task_hover');
        story.children('.schdule_waku').addClass('task_hover');
        let kadai = story.parents('.schdule_kadai');
        kadai.children('.schdule_waku').children('.schdule_title_waku').addClass('task_hover');
        kadai.children('.schdule_waku').addClass('task_hover');
    });
    $(document).on('mouseleave','.row',function() {
        let ix = $('.row').index($(this));
        let task = $('.schdule_task').eq(ix).find('.schdule_title_waku');
        task.removeClass('task_hover');
        let story = task.parents('.schdule_story');
        story.children('.schdule_waku').children('.schdule_title_waku').removeClass('task_hover');
        story.children('.schdule_waku').removeClass('task_hover');
        let kadai = story.parents('.schdule_kadai');
        kadai.children('.schdule_waku').children('.schdule_title_waku').removeClass('task_hover');
        kadai.children('.schdule_waku').removeClass('task_hover');
    });
    // 日報ボディースクロール時、ヘッダー部連動
    $('#schdule_body_item').scroll(function() {
        $('#schdule_head_item').scrollLeft($(this).scrollLeft());
    });
    $('#schdule_csv').click(function() {
        if ($('#schdule_syozoku').val() === '0') {
            $.alert('所属選択をして下さい（全ては不可）');
            $('#schdule_syozoku').focus();
            return;
        }
        $('#csv_form').dialog('open');
    });
    // 日付選択
    $('#dl_csv_f,#dl_csv_t').datepicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        showButtonPanel: true,
        showOn: 'button',
        onClose: function (e) {
            $(this).datepicker('refresh');
        }
    });
    // 日報入力プログレスバークリック
    $(document).on('click','.task_progress',function() {
        if ($('#schdule_syain option:selected').text() !== $('#user_name').text()) {
            return false;
        }
        let pos = $(this).offset();
        $('#nippo_progress').css({top:pos.top-12,left:pos.left-65});
        $('#nippo_progress_tx').text($(this).data('progress')+'%');
        $('#nippo_progress_bar').data('val',$(this).data('progress'));
        setSilder2($('#nippo_progress_bar'),$(this));
        $('#nippo_progress_scr').show(200);
    });
    $('#nippo_progress').click(function() {
        return false;
    });
    $('#nippo_progress_scr').click(function() {
        $('#nippo_progress_bar').slider('destroy');
        $(this).hide(100);
    });
    // 日報入力用プログレスバー
    function setSilder2($this,$target) {
        $this.slider({
            range: 'min',
            min: 0,
            max: 100,
            step: 10,
            value: $this.data('val'),
            slide: function( e, ui ) {
                // ゲストは更新不可
                // if (user_name === 'ゲスト' || String($this.parents('.board_story').data('syain')) !== syaincd) {
                //     return false;
                // }
                $(this).prev().text(ui.value+'%');
            },
            change: function( e, ui ) {
                $this.data('val',ui.value);
                let para = {
                    keynum: $target.parents('.schdule_kadai').data('keynum'),
                    storyno: $target.parents('.schdule_story').data('storyno'),
                    taskno: $target.parents('.schdule_task').data('taskno'),
                    value: ui.value,
                    getprogress: 1
                }
                // $target = $target;
                Ajax('taskman.php?func=setTaskProgress',para).done(function(ret) {
                    let task = $target.parent().prev();
                    $target.children('div').css('width',ui.value+'%');
                    $target.children('div').children('span').text(ui.value+'%');
                    $target.data('progress',ui.value);
                    if (ui.value === 100 && task.hasClass('comp2') === false) {
                        task.addClass('comp2');
                    } else if (ui.value < 100 && task.hasClass('comp2')) {
                        task.removeClass('comp2');
                    }
                    let story = $target.parents('.schdule_story').children('.schdule_waku');
                    story.find('.worktime_progress').children('div').css('width',ret.story_progress+'%');
                    story.find('.worktime_progress').children('div').children('span').text(ret.story_progress+'%');
                    if (ret.story_progress == 100 && story.hasClass('comp2') === false) {
                        story.addClass('comp2');
                        story.children('.schdule_title_waku').addClass('comp2');
                    } else if (ret.story_progress != 100 && story.hasClass('comp2')) {
                        story.removeClass('comp2');
                        story.children('.schdule_title_waku').removeClass('comp2');
                    }
                    let kadai = $target.parents('.schdule_kadai').children('.schdule_waku');
                    kadai.find('.worktime_progress').children('div').css('width',ret.kadai_progress+'%');
                    kadai.find('.worktime_progress').children('div').children('span').text(ret.kadai_progress+'%');
                    if (ret.kadai_progress == 100 && kadai.hasClass('comp2') === false) {
                        kadai.addClass('comp2');
                        kadai.children('.schdule_title_waku').addClass('comp2');
                    } else if (ret.kadai_progress != 100 && kadai.hasClass('comp2')) {
                        kadai.removeClass('comp2');
                        kadai.children('.schdule_title_waku').removeClass('comp2');
                    }
                    $('#nippo_progress_bar').slider('destroy');
                    $('#nippo_progress_scr').hide(100);
                }).fail(function(ret) {
                    $.alert('更新エラーです。再読込して下さい');
                });
            }
        });
    }
    // ＣＳＶ
    $('#csv_form').dialog({
		autoOpen: false,
		width: 420,
		modal: true,
        resizable: false,
        open: function() {
            msgid = '#csv_msg';
            clearMessage();
            $('#dl_csv_f').val(syori_ym.formatDate('YYYY/MM/DD'));
            $('#dl_csv_t').val(new Date(syori_ym).addMonth(1).addDay(-1).formatDate('YYYY/MM/DD'));
            // $('#dl_csv_type1').prop('checked',true);
            $('.ui-dialog-buttonpane button:contains("出力")').focus();
        },
        close: function() {
            msgid = '#msg';
        },
        buttons: {
            '出力': function() {
                if ($('#schdule_syain').val() === '0' && $('#dl_csv_type2').prop('checked')) {
                    $.alert('出力タイプ日毎の場合は個人の選択が必要です。').done(function() {
                        $('#csv_form').dialog('close');
                        $('#schdule_syain').focus();
                    });
                    return;
                }
                if ($('#dl_csv_f').val() === '') {
                    showMessage2($('#dl_csv_f'),'期間開始日を入力してください','#ff0000');
                    return;
                }
                if ($('#dl_csv_f').val().isDate() === false) {
                    showMessage2($('#dl_csv_f'),'期間開始日を正しく入力してください','#ff0000');
                    return;
                }
                if ($('#dl_csv_t').val() === '') {
                    showMessage2($('#dl_csv_t'),'期間終了日を入力してください','#ff0000');
                    return;
                }
                if ($('#dl_csv_t').val().isDate() === false) {
                    showMessage2($('#dl_csv_t'),'期間終了日を正しく入力してください','#ff0000');
                    return;
                }
                if ($('#dl_csv_f').val() > $('#dl_csv_t').val()) {
                    showMessage2($('#dl_csv_f'),'出力期間を正しく入力してください','#ff0000');
                    return;
                }
                clearMessage();
                var para = {
                    dept_cd: $('#schdule_syozoku').val(),
                    syaincd: $('#schdule_syain').val(),
                    datef: $('#dl_csv_f').val(),
                    datet: $('#dl_csv_t').val(),
                    csv_type: $('input[name="dl_csv_type"]:checked').val()
                }
                Ajax('taskman.php?func=createCSV',para).done(function(ret) {
                    if (ret.cnt > 0) {
                        $('#csv_form').dialog('close');
                        showMessage(ret.cnt+'件出力しました！','#0000ff');
                        location.href = ret.filename;
                    } else {
                        showMessage('該当データ無し','#ff0000');
                    }
                }).fail(function(ret) {
                    $.alert('データ出力に失敗しました。再試行して下さい。');
                }).always(function(ret) {
                    UnBlockScreen();
                });
            },
            '閉じる': function() {
                $(this).dialog('close');
            }
        }
    });
    // コンテキストメニュー日報セル
    let sv_cell = {work_time:0,memo:'',disabled:true};
    let cell_proc; // コピー・切り取り・貼り付け選択チェック
    $.contextMenu({
        selector: '#schdule_body_item .cells',
        callback: function(key, options) {
            if (key === 'copy') {
                sv_cell = {
                    work_time: sv_obj.text(),
                    memo: sv_obj.data('memo'),
                    disabled: false
                };
                cell_proc = true;
            } else if (key === 'cut') {
                sv_cell = {
                    work_time: sv_obj.text(),
                    memo: sv_obj.data('memo'),
                    disabled: false
                };
                cellUpdate('','').done(function(ret) {
                    if (ret.code !== 'OK') {
                        $.alert('更新できませんでした');
                    }
                }).fail(function(ret) {
                    $.alert('更新できませんでした');
                });
                cell_proc = true;
            } else if (key === 'paste') {
                cellUpdate(sv_syori.formatDate('YYYY/MM/DD') > today_str ? '' : sv_cell.work_time,sv_cell.memo).done(function(ret) {
                    if (ret.code !== 'OK') {
                        $.alert('更新できませんでした');
                    }
                }).fail(function(ret) {
                    $.alert('更新できませんでした');
                });
                cell_proc = true;
            }
        },
        items: {
            memo: {
                name: "作業メモ",
                type: 'text',
                events: {
                    keydown: function(e) {
                        // add some fancy key handling here?
                        if (e.keyCode === 13) {
                            sv_obj.contextMenu('hide');
                        }
                    }
                }
            },
            work_time: {
                name: '作業時間',
                type: 'select',
                options: {'0':'','0.5':'0.5','1.0':'1.0','1.5':'1.5','2.0':'2.0','2.5':'2.5','3.0':'3.0','3.5':'3.5',
                    '4.0':'4.0','4.5':'4.5','5.0':'5.0','5.5':'5.5','6.0':'6.0','6.5':'6.5','7.0':'7.0','7.5':'7.5','8.0':'8.0',
                    '8.5':'8.5','9.0':'9.0','9.5':'9.5','10.0':'10.0','10.5':'10.5','11.0':'11.0','11.5':'11.5','12.0':'12.0'},
                events: {
                    change: function(e) {
                        sv_obj.contextMenu('hide');
                    }
                }
            },
            sep2: '---------',
            copy: { name:'コピー', icon:'copy', },
            cut: { name:'切り取り（クリア）', icon:'cut', },
            paste: { name:'貼り付け', icon:'paste', disabled: true},
            sep3: '---------',
            close: { name:'閉じる', icon: function($element, key, item){ return 'context-menu-icon context-menu-icon-quit'; }, },
        },
        events: {
            show: function(opt) {
                sv_obj = $(this);
                if (checkCell() === false) {
                    return false;
                }
                if (sv_syori > today) {
                    showMessage('入力不可です。','#0000ff');
                    return false;
                }
                $(document).tooltip('disable');
                let disflg = (sv_obj.text() === '' && sv_obj.data('memo') === '');
                opt.commands.copy.disabled = disflg;
                opt.commands.cut.disabled = disflg;
                opt.commands.paste.disabled = sv_cell.disabled;
                opt.commands.work_time.selected = sv_obj.text() === '' ? '0' : sv_obj.text();
                opt.commands.memo.value = sv_obj.data('memo');
                cell_proc = false;
                // $.contextMenu.setInputValues(opt, sv_obj.data());
            },
            hide: function(opt) {
                $(document).tooltip('enable');
                if (cell_proc === false &&
                   (opt.commands.work_time.selected !== $('select[name="context-menu-input-work_time"]').val() ||
                    opt.commands.memo.value !== $('input[name="context-menu-input-memo"]').val())) {
                    cellUpdate($('select[name="context-menu-input-work_time"]').val(),$('input[name="context-menu-input-memo"]').val().trim()).done(function(ret) {
                        if (ret.code !== 'OK') {
                            $.alert('更新できませんでした');
                        }
                    }).fail(function(ret) {
                        $.alert('更新できませんでした');
                    });
                }
                // $.contextMenu.getInputValues(opt, $this.data());
            }
        }
    });
    $('input[name="context-menu-input-memo"]').attr('maxlength',50);
    // --------------------------------- //
    // ここから課題一覧関連                //
    // --------------------------------- //
    $('#kadai_body_ctrl').databind();
    $('#kadai_body_item').databind();

    $('#kadai_head_ctrl,#kadai_body_ctrl').width(localStorage.getItem('taskman_kadai_width') || 450);
    // 課題一覧クリック
    $('#disp_kadai').change(function() {
        $('#schdule,#schdule_option').hide();
        $('#board,#board_option').hide();
        $('#kadai,#kadai_option').show();
        dataLoadKadai();
    });
    // 処理年月変更（前月クリック）
    $('#prev_ym2').click(function() {
        str_kadai.addMonth(-1);
        end_kadai.addDay(end_kadai.getDate()*-1);
        dataLoadKadai();
    });
    // 処理年月変更（翌月クリック）
    $('#next_ym2').click(function() {
        str_kadai.addMonth(1);
        end_kadai.addDay(1);
        end_kadai.addMonth(1);
        end_kadai.addDay(-1);
        dataLoadKadai();
    });
    $('#kadai_syozoku,#kadai_syain').change(function() {
        if ($(this)[0].id === 'kadai_syozoku') {
            $('#kadai_syain').val('0');
        }
        dataLoadKadai();
    });
    // $('input[name="kadai_sel"]').change(function() {
    //     if ($('#kadai_sel_month').prop('checked')) {
    //         str_kadai = new Date(today.formatDate('YYYY/MM/01'));
    //         end_kadai = new Date(str_kadai).addMonth(1).addDay(-1);
    //     } else if ($('#kadai_sel_month4').prop('checked')) {
    //         str_kadai = new Date(today.formatDate('YYYY/MM/01')).addMonth(-1);
    //         end_kadai = new Date(str_kadai).addMonth(4).addDay(-1);
    //     } else if ($('#kadai_sel_month6').prop('checked')) {
    //         str_kadai = new Date(today.formatDate('YYYY/MM/01')).addMonth(-1);
    //         end_kadai = new Date(str_kadai).addMonth(6).addDay(-1);
    //     } else if ($('#kadai_sel_month12').prop('checked')) {
    //         str_kadai = new Date(today.formatDate('YYYY/MM/01')).addMonth(-1);
    //         end_kadai = new Date(str_kadai).addMonth(12).addDay(-1);
    //     }
    //     dataLoadKadai();
    // });
    $('#kadai_sel').change(function() {
        if ($(this).val() === '1') {
            str_kadai = new Date(today.formatDate('YYYY/MM/01'));
        } else if ($(this).val() === '12') {
            str_kadai = new Date(today.formatDate('YYYY/MM/01')).addMonth(-8);
        } else {
            str_kadai = new Date(today.formatDate('YYYY/MM/01')).addMonth(-1);
        }
        end_kadai = new Date(str_kadai).addMonth($(this).val()).addDay(-1);
        dataLoadKadai();
    });
    function dataLoadKadai() {
        BlockScreen('読込中 ...');
        let title_html = '';
        let body_html = '';
        let width;
        // if ($('#kadai_sel_month').prop('checked')) {
        if ($('#kadai_sel').val() === '1') {
            $('#kadai_ym').text(str_kadai.formatDate('YYYY年MM月'));
            let cnt = end_kadai.getDate();
            width = 100 / cnt;
            for (let i=1; i<=cnt; i++) {
                title_html += '<div class="kcell" style="width:'+width+'%">'+i+'</div>';
                body_html += '<div class="kcell" style="width:'+width+'%"></div>';
            }
        } else {
            $('#kadai_ym').text(str_kadai.formatDate('YYYY/MM')+'～'+end_kadai.formatDate('YYYY/MM'));
            let cnt = 0;
            let mcnt = [];
            let i = 0;
            for (let w_date=new Date(str_kadai); w_date<end_kadai; w_date.addMonth(1)) {
                mcnt[i] = new Date(w_date).addMonth(1).addDay(-1).getDate();
                cnt += mcnt[i];
                i++;
            }
            i = 0;
            for (let w_date=new Date(str_kadai); w_date<end_kadai; w_date.addMonth(1)) {
                title_html += '<div class="kcell" style="width:'+(100/(cnt/mcnt[i]))+'%">'+w_date.formatDate('YYYY/MM')+'</div>';
                body_html += '<div class="kcell" style="width:'+(100/(cnt/mcnt[i]))+'%"></div>';
                i++;
            }
            width = 100 / cnt;
        }
        $('#kadai_head_item').html(title_html);
        let para = {
            dept_cd: $('#kadai_syozoku').val(),
            syaincd: $('#kadai_syain').val(),
            syainnm: $('#kadai_syain option:selected').text(),
            str_day: str_kadai.formatDate('YYYY/MM/DD'),
            end_day: end_kadai.formatDate('YYYY/MM/DD'),
            // sel_month: $('input[name="kadai_sel"]:checked').val(),
            sel_month: $('#kadai_sel').val(),
            width: width
        }
        Ajax('taskman.php?func=loadKadai',para).done(function(ret) {
            if (ret.code === 'OK') {
                if (ret.syain_list) {
                    $('#kadai_syain').databind(ret.syain_list);
                }
                $('#kadai_body_ctrl').databind(ret.data.head);
                $('#kadai_body_item').databind(ret.data.body,null,function(rec,i) {
                    $('.kadai_bar').eq(i).css({left:rec.left,width:rec.width});
                    $('.kadai_bar_progress').eq(i).css('width',rec.progress);
                    $('.kadai_item_waku').eq(i).append(body_html);
                });
                if (str_kadai <= today && end_kadai >= today) {
                    let hour = new Date().getHours();
                    let nissu =  Math.ceil((today-str_kadai)/(60*60*24*1000))+(hour < 9 ? 0 : (hour > 18 ? 1 : ((hour-9) / 10)));

                    $('#kadai_body_item').append('<div id="today_bar" style="left:'+(nissu*width)+'%"></div>');
                }
                $('#kadai_body_ctrl').resizable({
                    minWidth: 400,
                    maxWidth: 800,
                    handles: 'e',
                    resize: function(e, ui) {
                        $('#kadai_head_ctrl').width($(this).width());
                    },
                    stop: function(e, ui) {
                        localStorage.setItem('taskman_kadai_width',$(this).width());s
                    }
                });
            } else {
                $.alert('データ読込に失敗しました。再読込して下さい。');
                // location.reload();
            }
        }).fail(function(ret) {
            $.alert('データ読込に失敗しました。再読込して下さい。');
            // location.reload();
        }).always(function(ret) {
            UnBlockScreen();
            clearMessage();
            // scroll_flg = false;
        });
    }
    $(document).on('click','.kadai_title_waku',function() {
        window.open('https://leoportal.leopalace21.com/leo-wperformer/WP_Jsystem/_link.do?i=I07002_KADAI_DTL.do&p='+$(this).data('keynum'));
    });
    // セッション切れ防止
    setInterval(function() {
        Ajax('taskman.php?func=sessioncheck');
    }, 1200000);
});
var msgid = '#msg';
var msghd;
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