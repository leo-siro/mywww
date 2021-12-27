
// Main System Setting
var kado_jyokyo_opt = {
    1: '稼働中',
    9: '停止'
};
var dev_kbn_opt = {
    1: '内製',
    2: '外注'
}
var kado_jyokyo_opt_s = {
    1: '運用中',
    7: '停止予定',
    8: '運用停止',
    9: '廃止済'
};
var env_type_opt = {
    1: '本番機',
    2: '開発機',
    3: '検証機',
    4: 'マスター機'
}
var mnt_kekka_opt = {
	0: '',
    1: '中断',
    2: '継続',
    9: '完了'
};
var mnt_time = ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
var trbl_status_opt = {
    1: '検討中',
    2: '対応中',
    9: '完了'
};
var trbl_level_opt = {
    1: '小',
    2: '中',
    3: '大'
};
var genin_busho_opt = {
    1: '情シス',
    2: '他部署',
    3: '他社'
}
var devenv_opt = {0: ''};
var devlang_opt = {0: ''};
var devrole_opt = {0: ''};
var devserver_opt = {};
var devsvname_opt = {};
var devsvplace_opt = {};
var devdb_opt = {};

// フォーマッター
function formatDBName(row, cell, value, columnDef, dataContext) {
    if (value === '') {
        return '';
    }
    let lbl = [];
    let key = dataContext.memo !== undefined ? dataContext.svr_key : dataContext.no;
    value.forEach(function(item) {
        if (devdbname[key][item]) {
            lbl.push(devdbname[key][item]);
        }
    });
    return lbl.join(' / ');
}
function formatMulitiLine(row, cell, value, columnDef, dataContext) {
    if (value === '') {
        return '';
    }
    let lbl = value.split('\n');
    return lbl.join(' / ');
}
function formatTroubleStatus(row, cell, value, columnDef, dataContext) {
    if (columnDef.options[value] == undefined){
        return "";
    }
    if (value === '1') {
        return '<span style="color:#007bff">'+columnDef.options[value]+'<span>';
    } else if (value === '2') {
        return '<span style="color:#dc3545">'+columnDef.options[value]+'<span>';
    } else if (value === '9') {
        return '<span style="color:#28a745">'+columnDef.options[value]+'<span>';
    }
    return columnDef.options[value];
}

var columns = {
    'system' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'id', name: 'No.', field: 'id', width: 42, headerCssClass: 'center', cssClass: 'center xinput', sortable: true},
        {id: 'system_name', name: 'システム名', field: 'system_name', width: 200, editor: Slick.Editors.Text, headerCssClass: 'center', validator: spaceCheck},
        {id: 'gaiyo', name: '概要', field: 'gaiyo', width: 200, editor: Slick.Editors.LongText, headerCssClass: 'center', validator: spaceCheck},
        {id: 'dev_busho', name: '情シス担当部署', field: 'dev_busho', width: 150, editor: Slick.Editors.LongText, headerCssClass: 'center', formatter: formatMulitiLine},
        {id: 'dev_tanto', name: '情シス担当者', field: 'dev_tanto', width: 150, editor: Slick.Editors.LongText, headerCssClass: 'center', formatter: formatMulitiLine},
        {id: 'unyo_busho', name: '運用部署', field: 'unyo_busho', width: 150, editor: Slick.Editors.LongText, headerCssClass: 'center', formatter: formatMulitiLine},
        {id: 'unyo_tanto', name: '運用担当', field: 'unyo_tanto', width: 150, editor: Slick.Editors.LongText, headerCssClass: 'center', formatter: formatMulitiLine},
        {id: 'dev_env', name: '開発環境', field: 'dev_env', width: 150, headerCssClass: 'center', editor: Extends.Editors.MultiSelect, formatter: Extends.Formatters.MultiSelect, options: devenv_opt},
        {id: 'dev_lang', name: '開発言語', field: 'dev_lang', width: 120, headerCssClass: 'center', editor: Extends.Editors.MultiSelect, formatter: Extends.Formatters.MultiSelect, options: devlang_opt},
        {id: 'save_folder', name: '格納フォルダ', field: 'save_folder', width: 150, editor: Slick.Editors.Text, headerCssClass: 'center', cssClass: 'linkitem',
            formatter: function (row, cell, value) {
                if (value.substr(0,4) === 'http') {
                    return '<a href="'+value+'" target="_new">'+value+'</a>';
                } else if (value.substr(1,1) === ':') {
                    return '<a href="file:///'+value+'">'+value+'</a>';
                }
                return value;
            }},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 200, headerCssClass: 'center'},
        {id: 'kado_jyokyo', name: '稼働状況', field: 'kado_jyokyo', width: 80, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: kado_jyokyo_opt, headerCssClass: 'center', cssClass: 'center'},
        {id: 'dev_kbn', name: '開発区分', field: 'dev_kbn', width: 80, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: dev_kbn_opt, headerCssClass: 'center', cssClass: 'center'},
    ],
    'sys_svr' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        // {id: 'no', name: 'No.', field: 'no', width: 0, headerCssClass: 'center', cssClass: 'center', sortable: true},
        // {id: 'svr_key', name: 'ホスト名', field: 'svr_key', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: {}, width: 130, headerCssClass: 'center'},
        {id: 'svr_key', name: 'ホスト名', field: 'svr_key', editor: Slick.Editors.AutoCompSvr, svrurl: 'devasstes.php?func=findServerlist2', formatter: Slick.Formatters.AutoCompSvr, width: 150, headerCssClass: 'center', cssClass: 'sys_svr_key', validator: sysSveKeyCheck},
        {id: 'other_name', name: '別名', field: 'other_name', width: 150, headerCssClass: 'center', cssClass: 'xinput'},
        {id: 'gaiyo', name: '概要', field: 'gaiyo', width: 200, headerCssClass: 'center', cssClass: 'xinput'},
        {id: 'role_name', name: '役割', field: 'role_name', width: 120, headerCssClass: 'center', cssClass: 'xinput'},
        {id: 'db_type_name', name: 'DBエンジン', field: 'db_type_name', width: 120, headerCssClass: 'center', cssClass: 'xinput'},
        // {id: 'db_memo', name: 'データベース名', field: 'db_memo', editor: Slick.Editors.Text, width: 120, headerCssClass: 'center'},
        // {id: 'db_memo', name: 'データベース名', field: 'db_memo', editor: Slick.Editors.AutoComp, formatter: Slick.Formatters.AutoComp, options: [], width: 120, headerCssClass: 'center'},
        {id: 'db_memo', name: 'データベース名', field: 'db_memo', editor: Extends.Editors.MultiSelect, options: [], width: 200, headerCssClass: 'center', formatter: formatDBName},
        {id: 'biko', name: 'メモ', field: 'biko', editor: Slick.Editors.LongText, width: 400, headerCssClass: 'center'},
        {id: 'delete', name: '削除', field: '', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'center delete',
            formatter: function () { return '✖'; }},
    ],
    'sys_rel' : [
        {id: 'detail', name: '', field: '', width: 42, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'release_no', name: 'リリースNo', field: 'release_no', width: 84, headerCssClass: 'center', cssClass: 'center xinput', sortable: true},
        {id: 'release_date', name: 'リリース日', field: 'release_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center sys_rel_release_date', validator: dateCheck2},
        {id: 'tanto', name: 'リリース担当', field: 'tanto', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'version', name: 'バージョン', field: 'version', editor: Slick.Editors.Text, width: 80, headerCssClass: 'center'},
        {id: 'system_no', name: '案件番号', field: 'system_no', editor: Slick.Editors.Text, width: 80, headerCssClass: 'center', cssClass: 'center', validator: systemNoCheck},
        {id: 'task1', name: 'タスク名', field: 'task1', width: 110, headerCssClass: 'center', cssClass: 'xinput'},
        {id: 'naiyo', name: '修正内容', field: 'naiyo', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center', cssClass: 'sys_rel_naiyo'},
        {id: 'kakunin', name: '確認者', field: 'kakunin', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'delete', name: '削除', field: '', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'center delete',
            formatter: function () { return '✖'; }},
    ],
    'sys_trbl' : [
        {id: 'detail', name: '', field: '', width: 42, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'trouble_no', name: 'トラブルNo', field: 'trouble_no', width: 84, headerCssClass: 'center', cssClass: 'center xinput', sortable: true},
        {id: 'hassei_date', name: '発生日', field: 'hassei_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center sys_trbl_hassei_date', validator: dateCheck2},
        {id: 'status', name: '状態', field: 'status', editor: Slick.Editors.Select, formatter: formatTroubleStatus, options: trbl_status_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'kihyo', name: '起票者', field: 'kihyo', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'level', name: 'レベル', field: 'level', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: trbl_level_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'genin_busho', name: '原因部署', field: 'genin_busho', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: genin_busho_opt, width: 60, headerCssClass: 'center', cssClass: 'center'},
        {id: 'naiyo', name: '不具合事象', field: 'naiyo', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center', cssClass: 'sys_trbl_naiyo'},
        {id: 'genin', name: '原因', field: 'genin', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'taio_date', name: '対応日', field: 'taio_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center', validator: dateCheck},
        {id: 'taio', name: '対応者', field: 'taio', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'taio_zantei', name: '暫定対応', field: 'taio_zantei', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'taio_kokyu', name: '恒久対応', field: 'taio_kokyu', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'hokoku', name: '報告先', field: 'hokoku', editor: Slick.Editors.LongText, width: 100, headerCssClass: 'center'},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 120, headerCssClass: 'center'},
        {id: 'delete', name: '削除', field: '', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'center delete',
            formatter: function () { return '✖'; }},
    ],
    'release' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'release_no', name: 'リリースNo', field: 'release_no', width: 90, headerCssClass: 'center', cssClass: 'center xinput', sortable: true},
        {id: 'system_name', name: 'システム名', field: 'system_name', width: 200, headerCssClass: 'center', cssClass: 'xinput link_detail'},
        {id: 'release_date', name: 'リリース日', field: 'release_date', editor: Slick.Editors.Date, width: 100, headerCssClass: 'center', cssClass: 'center', validator: dateCheck2, sortable: true},
        {id: 'tanto', name: 'リリース担当', field: 'tanto', editor: Slick.Editors.AutoComp, width: 120, headerCssClass: 'center', options: syozokulist},
        {id: 'version', name: 'バージョン', field: 'version', editor: Slick.Editors.Text, width: 100, headerCssClass: 'center'},
        {id: 'system_no', name: '案件番号', field: 'system_no', editor: Slick.Editors.Text, width: 110, headerCssClass: 'center', cssClass: 'center f_system_no', validator: systemNoCheck},
        {id: 'task1', name: 'タスク名', field: 'task1', width: 200, headerCssClass: 'center', cssClass: 'xinput'},
        {id: 'naiyo', name: '修正内容', field: 'naiyo', editor: Slick.Editors.LongText, width: 400, headerCssClass: 'center', validator: spaceCheck},
        {id: 'kakunin', name: '確認者', field: 'kakunin', editor: Slick.Editors.AutoComp, width: 120, headerCssClass: 'center', options: syozokulist},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 200, headerCssClass: 'center'},
        {id: 'kado_jyokyo', name: '稼働状況', field: 'kado_jyokyo', width: 80, formatter: Slick.Formatters.Select, options: kado_jyokyo_opt, headerCssClass: 'center', cssClass: 'center xinput'},
    ],
    'trouble' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'trouble_no', name: 'トラブルNo', field: 'trouble_no', width: 90, headerCssClass: 'center', cssClass: 'center xinput', sortable: true},
        {id: 'system_name', name: 'システム名', field: 'system_name', width: 200, headerCssClass: 'center', cssClass: 'xinput link_detail'},
        {id: 'hassei_date', name: '発生日', field: 'hassei_date', editor: Slick.Editors.Date, width: 100, headerCssClass: 'center', cssClass: 'center', validator: dateCheck2, sortable: true},
        {id: 'status', name: '状態', field: 'status', editor: Slick.Editors.Select, formatter: formatTroubleStatus, options: trbl_status_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'kihyo', name: '起票者', field: 'kihyo', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'level', name: 'レベル', field: 'level', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: trbl_level_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'genin_busho', name: '原因部署', field: 'genin_busho', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: genin_busho_opt, width: 60, headerCssClass: 'center', cssClass: 'center'},
        {id: 'naiyo', name: '不具合事象', field: 'naiyo', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center', validator: spaceCheck},
        {id: 'genin', name: '原因', field: 'genin', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'taio_date', name: '対応日', field: 'taio_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center', validator: dateCheck},
        {id: 'taio', name: '対応者', field: 'taio', editor: Slick.Editors.AutoComp, width: 120, headerCssClass: 'center', options: syozokulist},
        {id: 'taio_zantei', name: '暫定対応', field: 'taio_zantei', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'taio_kokyu', name: '恒久対応', field: 'taio_kokyu', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'hokoku', name: '報告先', field: 'hokoku', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'kado_jyokyo', name: '稼働状況', field: 'kado_jyokyo', width: 80, formatter: Slick.Formatters.Select, options: kado_jyokyo_opt, headerCssClass: 'center', cssClass: 'center xinput'},
    ],
    'sagyo' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'sagyo_no', name: '作業No', field: 'sagyo_no', width: 90, headerCssClass: 'center', cssClass: 'center xinput', sortable: true},
        {id: 'system_name', name: 'システム名', field: 'system_name', width: 200, headerCssClass: 'center', cssClass: 'xinput link_detail'},
        {id: 'sagyo_date', name: '作業日', field: 'sagyo_date', editor: Slick.Editors.Date, width: 100, headerCssClass: 'center', cssClass: 'center', validator: dateCheck2, sortable: true},
        {id: 'tanto', name: '作業担当', field: 'tanto', editor: Slick.Editors.AutoComp, width: 120, headerCssClass: 'center', options: syozokulist},
        {id: 'system_no', name: '案件番号', field: 'system_no', editor: Slick.Editors.Text, width: 110, headerCssClass: 'center', cssClass: 'center f_system_no', validator: systemNoCheck},
        {id: 'task1', name: 'タスク名', field: 'task1', width: 200, headerCssClass: 'center', cssClass: 'xinput'},
        {id: 'naiyo', name: '作業内容', field: 'naiyo', editor: Slick.Editors.LongText, width: 400, headerCssClass: 'center', validator: spaceCheck},
        {id: 'kakunin', name: '確認者', field: 'kakunin', editor: Slick.Editors.AutoComp, width: 120, headerCssClass: 'center', options: syozokulist},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 200, headerCssClass: 'center'}
    ],
    'server' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'id', name: 'No.', field: 'id', width: 42, headerCssClass: 'center', cssClass: 'center xinput', sortable: true},
        {id: 'sv_name', name: '物理筐体', field: 'sv_name', width: 100, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: devsvname_opt, headerCssClass: 'center', sortable: true},
        {id: 'host_name', name: 'ホスト名', field: 'host_name', editor: Slick.Editors.Text, width: 120, headerCssClass: 'center', validator: spaceCheck, sortable: true},
        {id: 'other_name', name: '別名', field: 'other_name', editor: Slick.Editors.LongText, width: 100, headerCssClass: 'center'},
        {id: 'env_type', name: '環境区分', field: 'env_type', width: 70, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: env_type_opt, headerCssClass: 'center'},
        {id: 'sv_place', name: '設置場所', field: 'sv_place', width: 70, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: devsvplace_opt, headerCssClass: 'center'},
        {id: 'gaiyo', name: '概要', field: 'gaiyo', editor: Slick.Editors.LongText, width: 200, headerCssClass: 'center'},
        {id: 'os', name: 'ＯＳ', field: 'os', width: 200,editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: devserver_opt, headerCssClass: 'center'},
        {id: 'role', name: '役割', field: 'role', width: 100, headerCssClass: 'center', cssClass: 'svr_role', editor: Extends.Editors.MultiSelect, formatter: Extends.Formatters.MultiSelect, options: devrole_opt},
        {id: 'db_type', name: 'ＤＢ', field: 'db_type', width: 100, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: devdb_opt, headerCssClass: 'center', cssClass: 'svr_db'},
        {id: 'ip_adrs', name: 'IPアドレス', field: 'ip_adrs', editor: Slick.Editors.LongText, width: 120, headerCssClass: 'center', cssClass: 'ipadrs center', sortable: true, validator: ipadrsCheck,
            formatter: function(row,cell,value) {
                if (value === undefined || value === '') {
                    return '';
                }
                let ips = value.split('\n');
                for (i in ips) {
                    ips[i] = '<a href="http://vermilion.leopalace21.com/php/ipcheck/main/detail.php?ip_adr='+ips[i]+'&seg='+ips[i].substr(0,ips[i].lastIndexOf('.'))+'&pastdays=0" target="_new">'+ips[i]+'</a>\n';
                }
                return ips.join(' / ');
            }},
        {id: 'kanri_busho', name: '管理部署', field: 'kanri_busho', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center', formatter: formatMulitiLine},
        {id: 'kanri_tanto', name: '管理者', field: 'kanri_tanto', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center', formatter: formatMulitiLine},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 200, headerCssClass: 'center'},
        {id: 'kado_jyokyo', name: '稼働状況', field: 'kado_jyokyo', width: 80, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: kado_jyokyo_opt_s, headerCssClass: 'center', cssClass: 'center'},
    ],
    'svr_sys' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'no', name: 'No.', field: 'no', width: 42, headerCssClass: 'center', cssClass: 'center xinput', sortable: true},
        {id: 'system_name', name: 'システム名', field: 'system_name', width: 200, headerCssClass: 'center', cssClass: 'xinput'},
        {id: 'gaiyo', name: '概要', field: 'gaiyo', width: 400, headerCssClass: 'center', cssClass: 'xinput'},
        {id: 'dev_busho', name: '情シス担当部署', field: 'dev_busho', width: 130, editor: Slick.Editors.LongText, headerCssClass: 'center', cssClass: 'xinput'},
        {id: 'unyo_busho', name: '運用部署', field: 'unyo_busho', width: 130, headerCssClass: 'center', cssClass: 'xinput'},
        {id: 'db_memo', name: 'データベース名', field: 'db_memo', width: 120, headerCssClass: 'center', cssClass: 'xinput', formatter: formatDBName},
        {id: 'memo', name: 'メモ', field: 'memo', width: 200, headerCssClass: 'center', cssClass: 'xinput'},
        {id: 'kado_jyokyo', name: '稼働状況', field: 'kado_jyokyo', width: 80, headerCssClass: 'center', cssClass: 'center xinput'},
    ],
    'svr_mnt' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'mente_no', name: 'メンテNo', field: 'mente_no', width: 84, headerCssClass: 'center', cssClass: 'center xinput', sortable: true},
        {id: 'start_date', name: '開始日', field: 'start_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center svr_mnt_start_date', validator: dateCheck2},
        {id: 'start_time', name: '時間', field: 'start_time', editor: Slick.Editors.AutoComp, width: 70, headerCssClass: 'center', cssClass: 'center', options: mnt_time, validator: timeCheck},
        {id: 'end_date', name: '終了日', field: 'end_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center svr_mnt_end_date', validator: dateCheck2},
        {id: 'end_time', name: '時間', field: 'end_time', editor: Slick.Editors.AutoComp, width: 70, headerCssClass: 'center', cssClass: 'center', options: mnt_time, validator: timeCheck},
        {id: 'tanto', name: '担当者', field: 'tanto', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'kekka', name: '結果', field: 'kekka', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: mnt_kekka_opt, width: 80, headerCssClass: 'center', cssClass: 'center'},
        {id: 'naiyo', name: '作業内容', field: 'naiyo', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center', cssClass: 'svr_mnt_naiyo'},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 100, headerCssClass: 'center'},
        {id: 'delete', name: '削除', field: '', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'center delete',
            formatter: function () { return '✖'; }},
    ],
    'svr_trbl' : [
        {id: 'detail', name: '', field: '', width: 42, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'trouble_no', name: 'トラブルNo', field: 'trouble_no', width: 84, headerCssClass: 'center', cssClass: 'center xinput', sortable: true},
        {id: 'hassei_date', name: '発生日', field: 'hassei_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center svr_trbl_hassei_date', validator: dateCheck2},
        {id: 'status', name: '状態', field: 'status', editor: Slick.Editors.Select, formatter: formatTroubleStatus, options: trbl_status_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'kihyo', name: '起票者', field: 'kihyo', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'level', name: 'レベル', field: 'level', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: trbl_level_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'naiyo', name: '不具合事象', field: 'naiyo', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center', cssClass: 'svr_trbl_naiyo'},
        {id: 'taio_date', name: '対応日', field: 'taio_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center', validator: dateCheck},
        {id: 'taio', name: '対応者', field: 'taio', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'hokoku', name: '報告先', field: 'hokoku', editor: Slick.Editors.LongText, width: 100, headerCssClass: 'center'},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 120, headerCssClass: 'center'},
        {id: 'delete', name: '削除', field: '', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'center delete',
            formatter: function () { return '✖'; }},
    ],
    'mente' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'mente_no', name: 'メンテNo', field: 'mente_no', width: 90, headerCssClass: 'center', cssClass: 'center xinput', sortable: true},
        {id: 'host_name', name: 'ホスト名', field: 'host_name', width: 200, headerCssClass: 'center', cssClass: 'xinput link_detail'},
        {id: 'start_date', name: '開始日', field: 'start_date', editor: Slick.Editors.Date, width: 100, headerCssClass: 'center', cssClass: 'center mnt_start_date', validator: dateCheck2, sortable: true},
        {id: 'start_time', name: '開始時間', field: 'start_time', editor: Slick.Editors.AutoComp, width: 80, headerCssClass: 'center', cssClass: 'center', options: mnt_time, validator: timeCheck},
        {id: 'end_date', name: '終了日', field: 'end_date', editor: Slick.Editors.Date, width: 100, headerCssClass: 'center', cssClass: 'center', validator: dateCheck2},
        {id: 'end_time', name: '終了時間', field: 'end_time', editor: Slick.Editors.AutoComp, width: 80, headerCssClass: 'center', cssClass: 'center', options: mnt_time, validator: timeCheck},
        {id: 'tanto', name: '担当者', field: 'tanto', editor: Slick.Editors.AutoComp, width: 120, headerCssClass: 'center', options: syozokulist},
        {id: 'kekka', name: '結果', field: 'kekka', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: mnt_kekka_opt, width: 80, headerCssClass: 'center', cssClass: 'center'},
        {id: 'naiyo', name: '作業内容', field: 'naiyo', editor: Slick.Editors.LongText, width: 400, headerCssClass: 'center', validator: spaceCheck},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 200, headerCssClass: 'center'},
        {id: 'kado_jyokyo', name: '稼働状況', field: 'kado_jyokyo', width: 80, formatter: Slick.Formatters.Select, options: kado_jyokyo_opt_s, headerCssClass: 'center', cssClass: 'center xinput'},
    ],
    'strouble' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'trouble_no', name: 'トラブルNo', field: 'trouble_no', width: 90, headerCssClass: 'center', cssClass: 'center xinput', sortable: true},
        {id: 'host_name', name: 'ホスト名', field: 'host_name', width: 200, headerCssClass: 'center', cssClass: 'xinput link_detail'},
        {id: 'hassei_date', name: '発生日', field: 'hassei_date', editor: Slick.Editors.Date, width: 100, headerCssClass: 'center', cssClass: 'center', validator: dateCheck2, sortable: true},
        {id: 'status', name: '状態', field: 'status', editor: Slick.Editors.Select, formatter: formatTroubleStatus, options: trbl_status_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'kihyo', name: '起票者', field: 'kihyo', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'level', name: 'レベル', field: 'level', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: trbl_level_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'naiyo', name: '不具合事象', field: 'naiyo', editor: Slick.Editors.LongText, width: 400, headerCssClass: 'center', validator: spaceCheck},
        {id: 'taio_date', name: '対応日', field: 'taio_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center', validator: dateCheck},
        {id: 'taio', name: '対応者', field: 'taio', editor: Slick.Editors.AutoComp, width: 120, headerCssClass: 'center', options: syozokulist},
        {id: 'hokoku', name: '報告先', field: 'hokoku', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'kado_jyokyo', name: '稼働状況', field: 'kado_jyokyo', width: 80, formatter: Slick.Formatters.Select, options: kado_jyokyo_opt_s, headerCssClass: 'center', cssClass: 'center xinput'},
    ],
}

var frame_type = 'system';
var grid = {};
var dataView = {};
var formWidth = function(ftype) {
    if (ftype === 'system') return {width:window.innerWidth - 60,height:window.innerHeight - 10};
    if (ftype === 'release') return {width: 820, height: 570};
    if (ftype === 'trouble') return {width: 820, height: 800};
    if (ftype === 'sagyo') return {width: 820, height: 550};
    if (ftype === 'server') return {width:window.innerWidth - 100,height:window.innerHeight - 10};
    if (ftype === 'mente') return {width: 800, height: 500};
    if (ftype === 'strouble') return {width: 800, height: 600};
};
var sys_svr_data = [];
var sv_sys_svr_data = [];
var sys_rel_data = [];
var sys_trbl_data = [];
var svr_sys_data = [];
var svr_mnt_data = [];
var svr_trbl_data = [];
var timer = false;
// callback function
var afterLoad = {};
var gridClick = {};
var focusCheck = {};
var formCheck = {};
var afterReg = {};
var filterFunc = {};
var rowCheck = {};
var deleteData = {};
var shosaiDisp = {};
var copyshosaiDisp = {};
// Master Setting
var master_data = [];

var svr_opt = [
	"Windows系",
	"UNIX系"
];
var db_opt = [
	"MSSQL",
	"MySQL",
    "DB2",
    "Postgre"
];
var master1_columns = [
    {id: 'code', name: 'ＣＤ', field: 'code', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'right' },
	{id: 'nm1', name: '名称１', field: 'nm1', width: 200, resizable: false, editor: Slick.Editors.Text, headerCssClass: 'center master_nm1', cssClass: 'master_nm1'},
    {id: 'nm2', name: '名称２', field: 'nm2', width: 150, resizable: false, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: [], options2: [], headerCssClass: 'center master_nm2', cssClass: 'master_nm2'},
    {id: 'stop_flg', name: '停止', field: 'stop_flg', width: 42, resizable: false, formatter: Slick.Formatters.Checkmark, editor: Slick.Editors.Checkbox, headerCssClass: 'center', cssClass: 'center'}
];
var master2_columns = [
    {id: 'code', name: 'ＣＤ', field: 'code', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'right'},
	{id: 'nm1', name: '名称１', field: 'nm1', width: 350, resizable: false, editor: Slick.Editors.Text, headerCssClass: 'center master_nm1', cssClass: 'master_nm1'},
    {id: 'stop_flg', name: '停止', field: 'stop_flg', width: 42, resizable: false, formatter: Slick.Formatters.Checkmark, editor: Slick.Editors.Checkbox, headerCssClass: 'center', cssClass: 'center'}
];

var master_head1 = {devrole:'役割',devserver:'サーバーOS', devdb:'DBバージョン', devapp:'開発環境', devlang:'開発言語', devdbname: 'データベース名称', devsvplace: '設置場所名称', devsvname: '物理筐体名称'};
var master_head2 = {devrole:'',devserver:'サーバー種別', devdb:'DB種別', devapp:'', devlang:'', devdbname: 'ホスト名', devsvplace: '', devsvname: ''};
var master_key;
var master;
var maxcd = 0;
// Admin Setting
var admin_grid;
var admin_data = [];
var admin_columns = [
	{id: 'admincd', name: '社員番号', field: 'admincd', width: 80, resizable: false, editor: Slick.Editors.Text, headerCssClass: 'center', cssClass: 'center'},
	{id: 'adminnm', name: '管理者名', field: 'adminnm', width: 250, resizable: false, headerCssClass: 'center'},
    {id: 'delete', name: '削除', field: '', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'center delete',
        formatter: function () { return '✖'; }},
];

var options = {
	editable: false,
	autoEdit: true,
	enableCellNavigation: true,
	enableColumnReorder: false,
    asyncEditorLoading: true,
	multiColumnSort: true,
    enableAddRow: false,
    enableTextSelectionOnCells: true
};
var editflg;
var reloadflg = false;
var changeflg = false;

// 空白チェック
function spaceCheck(value) {
    if (value == null || value == undefined || !value.length) {
        setTimeout(function() {
            showMessage2($('.editor-text').length > 0 ? $('.editor-text') : $('.slick-large-editor-text'), '必須入力です。','#ff0000',$('.editor-text').length > 0 ? -10 : 5);
        },200)
        return {valid: false, msg: '必須入力です'};
    } else {
        clearMessage();
        return {valid: true, msg: null};
    }
}
// 日付チェック
function dateCheck(value) {
    if (value.isDate() === false) {
        setTimeout(function() {
            showMessage2($('.editor-text'), '日付を正しく入力して下さい。','#ff0000',-10);
        },200)
        return {valid: false, msg: '日付を正しく入力して下さい。'};
    } else {
        clearMessage();
        return {valid: true, msg: null};
    }
}
function dateCheck2(value) {
    if (value == null || value == undefined || !value.length) {
        setTimeout(function() {
            showMessage2($('.editor-text'), '日付を入力して下さい。','#ff0000',-10);
        },200)
        return {valid: false, msg: '日付を入力して下さい。'};
    } else if (value.isDate() === false) {
        setTimeout(function() {
            showMessage2($('.editor-text'), '日付を正しく入力して下さい。','#ff0000',-10);
        },200)
        return {valid: false, msg: '日付を正しく入力して下さい。'};
    } else {
        clearMessage();
        return {valid: true, msg: null};
    }
}
// 時刻チェック
function timeCheck(value) {
    if (value !== '' && isTime(value) === false) {
        setTimeout(function() {
            showMessage2($('.editor-text'), '時刻を正しく入力して下さい。','#ff0000',-10);
        },200)
        return {valid: false, msg: '時刻を正しく入力して下さい。'};
    } else {
        clearMessage();
        return {valid: true, msg: null};
    }
}
// 案件番号チェック
function systemNoCheck(value,form) {
    let ret = {valid: true, msg: null};
    if (value !== '') {
        $.ajax({
            type: 'POST',
            url: 'devasstes.php?func=systemNoCheck',
            data: {system_no: value},
            dataType: 'json',
            async : false   // 同期チェックを行う
        }).done(function(data) {
            if(data.code === 'OK') {
                clearMessage();
                if (form) {
                    form.item.task1 = data.task1;
                } else if ($('#fr_task1').is(':visible')) {
                    $('#fr_task1').val(data.task1);
                } else if ($('#fw_task1').is(':visible')) {
                    $('#fw_task1').val(data.task1);
                }
                ret = {valid: true, msg: null};
            } else {
                if (form) {
                    setTimeout(function() {
                        showMessage2($('.editor-text'), '案件番号に誤りがあります。','#ff0000',-10);
                    },200);
                }
                ret = {valid: false, msg: null};
            }
        }).fail(function(ret) {
            if (form) {
                setTimeout(function() {
                    showMessage2($('.editor-text'), '案件番号取得時にエラー発生','#ff0000',-10);
                },200);
            }
            ret = {valid: false, msg: null};
        });
    }
    return ret;
}
// IPアドレスチェック
function ipadrsCheck(value) {
    let ret = {valid: true, msg: null};
    let item = value.split('\n');
    for (let i=0; i<item.length; i++) {
        if (item[i] === '') continue;
        if (/^(?:(?:^|\.)(?:2(?:5[0-5]|[0-4]\d)|1?\d?\d)){4}$/.test(item[i]) === false) {
            setTimeout(function() {
                showMessage2($('.slick-large-editor-text'), 'IPアドレスに誤りがあります。','#ff0000',5);
            },200)
            ret = {valid: false, msg: null};
            break;
        }
    }
    return ret;
}
// システム内サーバー一覧重複チェック
function sysSveKeyCheck(value) {
    let ret = {valid: true, msg: null};
    let wdata = grid['sys_svr'].getData();
    let pos = grid['sys_svr'].getActiveCell();
    for (var i=0; i<wdata.length; i++) {
        if (pos.row !== i && wdata[i].svr_key.label === value) {
            showMessage2($('.sys_svr_key').eq(pos.row),'登録済みサーバーです','#0000ff',-5);
            ret = {valid: false, msg: null};
            break;
        }
    }
    return ret;
}
$('.proc_frame:not(:first)').hide();
$(function() {
    // ---------------------------------------------------------------------------------------------------------------------------
    // 初期処理
    // ---------------------------------------------------------------------------------------------------------------------------
    // フォームエリアを初期値は非表示にし（ちらつき防止）ダイアログ作成時は表示にしする（gridが崩れるのを防ぐため）
    $('#form_area').show();
    $('#fds_develop').val(syozokunm);
    $(window).resize(function() {
        grid[frame_type].resizeCanvas();
    });
    if (widthReset === false) {
        // グリッドの横幅をセット
        var grid_width = JSON.parse(localStorage.getItem('devassets_grid_width'));
        if (grid_width) {
            for (let gridname in grid_width) {
                for (let ix in grid_width[gridname]) {
                    if (columns[gridname][ix]['id'] === grid_width[gridname][ix]['id']) {
                        columns[gridname][ix]['width'] = grid_width[gridname][ix]['width'];
                    }
                }
            }
        }
    }
    // 終了時の各グリッドの横幅を保存
    $(window).on('beforeunload', function(e) {
        let save = {};
        for (let gridname in columns) {
            save[gridname] = {};
            for (let keyname in columns[gridname]) {
                save[gridname][keyname] = {id: columns[gridname][keyname]['id'], width: columns[gridname][keyname]['width']};
            }
        }
        console.log(save);
        localStorage.setItem('devassets_grid_width',JSON.stringify(save));
        // e.preventDefault();
        // return '本当に閉じていいの？';
    });
    // コンテキストメニュー消去
    $('body').on('click', function () {
        $('#grid_contextmenu').hide();
    });
    // ---------------------------------------------------------------------------------------------------------------------------
    // 各処理画面共通処理
    // ---------------------------------------------------------------------------------------------------------------------------
    $('input[name="disp_type"]').change(function(e) {
        if ($('#'+frame_type+'_edit').text() === '保存') {
            $this = $(this);
            setTimeout(function() {
                $this.parent().removeClass('active focus');
                $('#'+frame_type+'_proc').parent().addClass('active');
                $('#'+frame_type+'_proc').prop('checked',true).focus();
            },10);
            $.alert('編集中の為、タブを変更できません<br>保存又は破棄して下さい');
            return false;
        }
        $('.proc_frame:visible').hide();
        frame_type = $(this).data('type');
        dispFrame();
        grid[frame_type].setSelectedRows([]);
    });
    function dispFrame() {
        $('#'+frame_type).show();
        if (columns[frame_type] === undefined) return;

        if (grid[frame_type] === undefined) {
            dataView[frame_type] = new Slick.Data.DataView({ inlineFilters: true });
            grid[frame_type] = new Slick.Grid('#'+frame_type+'_grid',dataView[frame_type], columns[frame_type], options);
            // ツールチップ
            grid[frame_type].registerPlugin( new Slick.AutoTooltips() );
            // $('#'+frame_type+'_grid').tooltip();
            // grid[frame_type].onScroll.subscribe(function (e, args) {
            //     // ツールチップをスクロール時にdisableする。終了後にenableにする
            //     if( timer !== false ){
            //         clearTimeout( timer );
            //     }
            //     timer = setTimeout( function() {
            //         $('#'+frame_type+'_grid').tooltip('enable');
            //         timer = false;
            //     }, 200 );
            //     $('#'+frame_type+'_grid').tooltip('disable');
            // });
            grid[frame_type].setSelectionModel(new Slick.RowSelectionModel());
            // ソート
            grid[frame_type].onSort.subscribe(function (e, args) {
                var sortcol = args.sortCols[0].columnId;
                dataView[frame_type].sort(function(a, b) {
                    var x = a[sortcol], y = b[sortcol];
                    if (args.sortCols[0].columnId === 'id') {
                        return (x == y ? 0 : (Number(x) > Number(y) ? 1 : -1));
                    } else if (args.sortCols[0].columnId === 'host_name') {
                        return (x.toUpperCase() == y.toUpperCase() ? 0 : (x.toUpperCase() > y.toUpperCase() ? 1 : -1));
                    } else {
                        return (x == y ? 0 : (x > y ? 1 : -1));
                    }
                }, args.sortCols[0].sortAsc);
            });
            dataView[frame_type].onRowCountChanged.subscribe(function (e, args) {
                grid[frame_type].updateRowCount();
                grid[frame_type].render();
            });
            dataView[frame_type].onRowsChanged.subscribe(function (e, args) {
                grid[frame_type].invalidateRows(args.rows);
                grid[frame_type].render();
            });
            // grid[frame_type].onSelectedRowsChanged.subscribe(function (e, args) {
                // let item = dataView[frame_type].getItem(args.previousSelectedRows[0])
                // if ($('#'+frame_type+'_edit').text() === '保存' && item.upd !== undefined && item.upd === 1) {
                    // grid[frame_type].setSelectedRows(args.previousSelectedRows[0]);
                    // $('#'+frame_type+'_grid .slick-row:eq('+args.previousSelectedRows[0]+') .slick-cell:eq('+3+')').click();
                    // return false;
                // }
            // });
            grid[frame_type].onClick.subscribe(function(e, args) {
                if (gridClick[frame_type] !== undefined) {
                    gridClick[frame_type](args);
                }
            });
            grid[frame_type].onCellChange.subscribe(function(e, args) {
                args.item.upd = 1;
                dataView[frame_type].updateItem(args.item.id, args.item);
            });
            // コンテキストメニュー
            grid[frame_type].onContextMenu.subscribe(function(e) {
                e.preventDefault();
                if ($('#'+frame_type+'_edit').text() === '保存') {
                    return;
                }
                var cell = grid[frame_type].getCellFromEvent(e);
                grid[frame_type].setSelectedRows([cell.row]);
                $('#cm_copy,.menuline').toggle((copyshosaiDisp[frame_type] !== undefined));
                $('#grid_contextmenu')
                    .data('row', cell.row)
                    .css('top', e.pageY)
                    .css('left', e.pageX)
                    .show();
            });
            $('#cm_edit').click(function() {
                var item = grid[frame_type].getDataItem($('#grid_contextmenu').data('row'));
                shosaiDisp[frame_type](item,0);
            });
            $('#cm_copy').click(function() {
                var item = grid[frame_type].getDataItem($('#grid_contextmenu').data('row'));
                copyshosaiDisp[frame_type](item);
            });
        }
        loadData(frame_type);
    }
    function loadData(frame_type) {
        if ($('#'+frame_type).is(':hidden')) {
            return;
        }
        $('.slick-sort-indicator-asc').removeClass('slick-sort-indicator-asc');
        $('.slick-sort-indicator-desc').removeClass('slick-sort-indicator-desc');
        Ajax('devasstes.php?func=load'+frame_type).done(function(ret) {
            dataView[frame_type].beginUpdate();
            dataView[frame_type].setItems([]);
            dataView[frame_type].endUpdate();
            if (ret.data.length > 0) {
                dataView[frame_type].beginUpdate();
                dataView[frame_type].setItems(ret.data);
                if (filterFunc[frame_type] !== undefined) {
                    dataView[frame_type].setFilterArgs(filterArgs(frame_type));
                    dataView[frame_type].setFilter(filterFunc[frame_type]);
                }
                dataView[frame_type].endUpdate();
            }
            if (afterLoad[frame_type] !== undefined) {
                afterLoad[frame_type](ret.data);
            }
        }).fail(function(ret) {
            alert(ret.msg);
        });
    }
    function formCreate(frame_type) {
        $('#'+frame_type+'_form').dialog({
            autoOpen: false,
            width: formWidth(frame_type).width,
            height: formWidth(frame_type).height,
            modal: true,
            closeOnEscape: false,
            // resizable: false,
            open: function() {
                $('#'+$(this).data('frame_type')+'_form').dialog({'width':formWidth(frame_type).width,'height':formWidth(frame_type).height});
                clearMessage();
                msgid = '#'+$(this).data('frame_type')+'_msg';
                $this = $(this);
                // フォームオープン時に日付にフォーカスがあると日付画面が表示されるのを防ぐため
                $('#'+$this.data('frame_type')+'_form .form_date').datepicker('disable');
                setTimeout(function() {
                    $this.data('editflg',0);
                    $('#'+$this.data('frame_type')+'_form [tabindex=1]').focus().select();
                    $('#'+$this.data('frame_type')+'_form .form_date').datepicker('enable');
                }, 100);
                if (deleteData[frame_type]) {
                    $('#'+frame_type+'_form').next().find('button:contains("削除")').css('margin-right',formWidth(frame_type).width - 210);
                } else {
                    $('#'+frame_type+'_form').next().find('button:contains("削除")').hide();
                }
            },
            beforeClose: function() {
                $this = $(this);
                if (focusCheck[$this.data('frame_type')]) {
                    focusCheck[$this.data('frame_type')]();
                }
                if ($this.data('editflg') === 1) {
                    // $.confirmが非同期処理の為、return falseで一旦Closeを破棄し
                    // はいがクリックされたら編集フラグを0にしフォームを再度Closeする（ややこしい・・・）
                    $.confirm('登録されていませんがよろしいですか？').done(function() {
                        $this.data('editflg',0);
                        $this.dialog('close');
                    });
                    return false;
                }
            },
            close: function() {
                clearMessage();
                msgid = '#msg';
            },
            buttons: {
                '削除': function() {
                    if ($('#'+$this.data('frame_type')+'_form input:eq(0)').val() === '新規') {
                        return;
                    }
                    $.confirm('削除してもよろしいですか？').done(function() {
                        deleteData[$this.data('frame_type')]().done(function() {
                            loadData($this.data('frame_type'));
                            $.alert('削除しました。');
                            clearMessage();
                            $this.dialog('close');
                        }).fail(function() {
                            $.alert('削除エラー');
                        });
                    });
                },
                '登録': function() {
                    $this = $(this);
                    if (focusCheck[$this.data('frame_type')]) {
                        focusCheck[$this.data('frame_type')]();
                    }
                    if ($(this).data('editflg') === 1) {
                        if (formCheck[$this.data('frame_type')]() === false) {
                            return;
                        }
                        BlockScreen('登録中 ...');
                        var items = $('#'+$this.data('frame_type')+'_form').serializeArray();
                        Ajax('devasstes.php?func='+$this.data('frame_type')+'Reg',items).done(function(ret) {
                            if (ret.code === 'OK') {
                                loadData($this.data('frame_type'));
                                // $.alert('登録しました。');
                                clearMessage();
                                if (afterReg[$this.data('frame_type')] !== undefined) {
                                    afterReg[$this.data('frame_type')](ret);
                                }
                                $this.data('editflg',0);
                                UnBlockScreen();
                                $('#'+frame_type+'_form').dialog('close');
                            } else {
                                $.alert('登録エラー');
                            }
                        }).fail(function(ret) {
                            $.alert('登録エラー');
                        }).always(function() {
                            UnBlockScreen();
                        });
                    } else {
                        $(this).dialog('close');
                    }
                },
                '閉じる': function() {
                    $(this).dialog('close');
                },
            }
        }).data({'frame_type':frame_type,'editflg':0});
        // $('#'+frame_type+'_form').next().prepend('<p id="'+frame_type+'_msg" class="form_msg"></p>');
        if (syozokucd === '999999') {
            $('#'+frame_type+'_form').next().find('button:contains("登録")').hide();
            $('#'+frame_type+'_form').next().find('button:contains("削除")').hide();
            $('#'+frame_type+'_new').hide();
        } else {
            // 編集フラグをセット
            $(document).on('change','#'+frame_type+'_form input,#'+frame_type+'_form textarea,#'+frame_type+'_form select,#'+frame_type+'_form .msel_item',function(e) {
                var form = e.handleObj.selector.substr(0,e.handleObj.selector.indexOf(' '));
                $(form).data('editflg',1);
            });
        }
        // 編集ボタンクリック
        $('#'+frame_type+'_edit').click(function() {
            if (syozokucd === '999999') {
                showMessage('この機能は利用できません','#ff0000');
                return;
            }
            if ($(this).text() === '編集') {
                grid[frame_type].setOptions({editable: true});
                $(this).text('保存').css({'background-color':'#ddff00','color':'#f00'});
                $('#'+frame_type+'_cancel').prop('disabled',false);
                $('#'+frame_type+'_csv,#'+frame_type+'_new').prop('disabled',true);
                $('#'+frame_type+' .find_frame input[type="text"],#'+frame_type+' .find_frame select').prop('disabled',true);
                $('header input[type="radio"]').prop('disabled',true);
                $('header .btn-group-toggle label').addClass('disabled');
            } else {
                // 保存処理
                let currentEditor = grid[frame_type].getCellEditor();
                if (currentEditor && currentEditor.validate().valid === false) {
                    return false;
                }
                focus_blur(frame_type);
                let data = [];
                let rec = dataView[frame_type].getFilteredItems();
                for (let i=0; i<rec.length; i++) {
                    if (rec[i].upd === 1) {
                        if (rowCheck[frame_type] && rowCheck[frame_type](rec[i],i) === false) {
                            return;
                        }
                        data.push(rec[i]);
                        rec[i].upd = 0;
                    }
                }
                if (data.length === 0) {
                    showMessage('変更箇所がありませんでした。','#0000ff');
                } else {
                    BlockScreen('登録中...');
                    Ajax('devasstes.php?func='+frame_type+'RegAll',{data:data}).done(function(ret) {
                        if (ret.code === 'OK') {
                            showMessage('登録しました。','#0000ff');
                        } else {
                            $.alert('登録エラー');
                        }
                    }).fail(function(ret) {
                        $.alert('登録エラー');
                    }).always(function() {
                        UnBlockScreen();
                    });
                }
                grid[frame_type].setOptions({editable: false});
                $(this).text('編集').css({'background-color':'','color':''});
                $('#'+frame_type+'_cancel').prop('disabled',true);
                $('#'+frame_type+'_csv,#'+frame_type+'_new').prop('disabled',false);
                $('#'+frame_type+' .find_frame input[type="text"],#'+frame_type+' .find_frame select').prop('disabled',false);
                $('header input[type="radio"]').prop('disabled',false);
                $('header .btn-group-toggle label').removeClass('disabled');
            }
        });
        // キャンセルボタンクリック
        $('#'+frame_type+'_cancel').click(function() {
            setTimeout(function() {
                grid[frame_type].setOptions({editable: false});
            },100);
            loadData(frame_type);
            $('#'+frame_type+'_edit').text('編集').css({'background-color':'','color':''});
            $(this).prop('disabled',true);
            $('#'+frame_type+'_csv,#'+frame_type+'_new').prop('disabled',false);
            $('#'+frame_type+' .find_frame input[type="text"],#'+frame_type+' .find_frame select').prop('disabled',false);
            $('header input[type="radio"]').prop('disabled',false);
            $('header .btn-group-toggle label').removeClass('disabled');
            clearMessage();
        });
        // CSVボタンクリック
        $('#'+frame_type+'_csv').click(function() {
            BlockScreen('作成中...');
            Ajax('devasstes.php?func='+frame_type+'Csv',$('#'+frame_type+' .find_frame').serializeArray()).done(function(ret) {
                if (ret.code === 'OK') {
                    showMessage('出力しました。','#0000ff');
                    location.href = ret.filename;
                } else {
                    $.alert('CSV出力エラー');
                }
            }).fail(function(ret) {
                $.alert('CSV出力エラー');
            }).always(function() {
                UnBlockScreen();
            });
        });
    }
    $('textarea.auto-resize').on('change keyup paste cut', function(){
        var lines = ($(this).val() + '\n').match(/\n/g).length;
        if ($(this).data('minline') <= lines && $(this).data('maxline') >= lines) {
            $(this).height(lines*18);
        } else if ($(this).data('minline') > lines) {
            $(this).height($(this).data('minline')*18);
        } else {
            $(this).height($(this).data('maxline')*18);
        }
    });
    // 検索枠、変更時
	var composition = false;
	$(document).on('change keyup','.find_frame input',function (e) {
		// clear on Esc
		if (e.which == 27) {
		  	this.value = "";
		}
		if (composition === false) {
			updateFilter();
		}
	}).on('compositionstart', function(e) {
		composition = true;
	}).on('compositionend', function(e) {
		composition = false;
	});
    $('.find_frame select').change(function() {
        updateFilter();
    });
    // ---------------------------------------------------------------------------------------------------------------------------
    // システム画面処理
    // ---------------------------------------------------------------------------------------------------------------------------
    // 新規ボタンクリック
    $('#system_new').click(function() {
        formReset('system');
        // 開発環境選択リスト
        $('#fs_dev_env').mulitiSelect({source:devenv,maxcnt:10});
        // 開発言語選択リスト
        $('#fs_dev_lang').mulitiSelect({source:devlang,maxcnt:10,mincnt:5});
        $('#fs_dev_busho').val(syozokunm);
        $('#fs_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');
        $('#system_form').dialog('open');
        $('#system_form .auto-resize').change();

        createSystemServerGrid();
        grid['sys_svr'].setData([]);
        grid['sys_svr'].render();
        createSystemReleaseGrid();
        grid['sys_rel'].setData([]);
        grid['sys_rel'].render();
        createSystemTroubleGrid();
        grid['sys_trbl'].setData([]);
        grid['sys_trbl'].render();
    });
    // 詳細クリック（詳細編集）
    gridClick['system'] = function(args) {
        var item = grid['system'].getDataItem(args.row);
        if (columns['system'][args.cell].id === 'detail') {
            if ($('#system_edit').text() === '保存') {
                $.alert('編集中の為、詳細を開けません');
                return;
            }
            shosaiDisp['system'](item,0);
        }
    }
    // サーバーからデータ取得
    function getSystemShosai(sys_key) {
        Ajax('devasstes.php?func=loadsystem',{sys_key: sys_key}).done(function(ret) {
            shosaiDisp['system'](ret.data[0],0);
        }).fail(function(ret) {
            alert(ret.msg);
        });
    }
    shosaiDisp['system'] = function(item,copy) {
        formReset('system');
        $('#fs_sys_key').val(item.id);
        $('#fs_system_name').val(item.system_name);
        $('#fs_system_gaiyo').val(item.gaiyo);
        $('#fs_kado_jyokyo').val(item.kado_jyokyo);
        $('#fs_start_date').val(item.start_date);
        $('#fs_end_date').val(item.end_date);
        $('#fs_dev_busho').val(item.dev_busho);
        $('#fs_dev_tanto').val(item.dev_tanto);
        $('#fs_unyo_busho').val(item.unyo_busho);
        $('#fs_unyo_tanto').val(item.unyo_tanto);
        // 開発環境選択リスト
        $('#fs_dev_env').mulitiSelect({source:devenv,value:item.dev_env,label:devenv_opt,maxcnt:10});
        // 開発言語選択リスト
        $('#fs_dev_lang').mulitiSelect({source:devlang,value:item.dev_lang,label:devlang_opt,maxcnt:10,mincnt:5});
        $('#fs_dev_kbn').val(item.dev_kbn);
        $('#fs_save_folder').val(item.save_folder);
        $('#fs_system_biko').val(item.biko);
        if (item.temp_file === null) {
            $('#fs_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');
        } else {
            $('#fs_temp_file').html('<button type="button" class="temp_file_add">＋</button>');
            item.temp_file.split('\n').forEach(function(item) {
                $('#fs_temp_file').append('<div><a href="'+item+'">'+item+'</a><span class="tmp_delete">✖</span></div>');
            });
        }
        $('#system_form').dialog('open');
        $('#system_form .auto-resize').change();
        // システム－＞サーバー一覧読込
        createSystemServerGrid();
        // システム－＞リリース一覧読込
        createSystemReleaseGrid();
        loadSysRel();
        // システム－＞トラブル一覧読込
        createSystemTroubleGrid();
        loadSysTrbl();
    }
    function loadSysRel() {
        let sc = BlockScreen('Loading ...','rgba(0,0,0,0)',$('#sys_rel_grid'));
        grid['sys_rel'].setSelectedRows([]);
        Ajax('devasstes.php?func=loadSystemRelease',{sys_key: $('#fs_sys_key').val()}).done(function(ret) {
            grid['sys_rel'].setData(ret.data);
            grid['sys_rel'].render();
        }).fail(function(ret) {
            alert(ret.msg);
        }).always(function(ret) {
            UnBlockScreen(sc);
        });
    }
    function loadSysTrbl() {
        let sc = BlockScreen('Loading ...','rgba(0,0,0,0)',$('#sys_trbl_grid'));
        grid['sys_trbl'].setSelectedRows([]);
        Ajax('devasstes.php?func=loadSystemTrouble',{sys_key: $('#fs_sys_key').val()}).done(function(ret) {
            grid['sys_trbl'].setData(ret.data);
            grid['sys_trbl'].render();
        }).fail(function(ret) {
            alert(ret.msg);
        }).always(function(ret) {
            UnBlockScreen(sc);
        });
    }
    function createSystemServerGrid() {
        if (grid['sys_svr'] === undefined) {
            grid['sys_svr'] = new Slick.Grid('#sys_svr_grid', sys_svr_data, columns['sys_svr'], options);
            grid['sys_svr'].registerPlugin( new Slick.AutoTooltips() );
            grid['sys_svr'].setSelectionModel(new Slick.RowSelectionModel());
            grid['sys_svr'].setOptions({editable: true, enableAddRow: true});
            grid['sys_svr'].onAddNewRow.subscribe(function (e, args) {
                if (args.item.svr_key.value === undefined) {
                    showMessage2($('.sys_svr_key').last(),'選択リストより選んで下さい','#0000ff',-20);
                    return false;
                }
                sys_svr_data = grid['sys_svr'].getData();
                var item = {
                    no: args.item.svr_key.value,
                    svr_key: {value: args.item.svr_key.value, label: args.item.svr_key.label},
                    host_name: args.item.svr_key.other.host_name,
                    other_name: args.item.svr_key.other.other_name,
                    gaiyo: args.item.svr_key.other.gaiyo,
                    role_name: args.item.svr_key.other.role_name,
                    db_type_name: args.item.svr_key.other.db_type_name,
                    db_memo: '',
                    biko: ''
                };
                grid['sys_svr'].invalidateRow(sys_svr_data.length);
                sys_svr_data.push(item);
                grid['sys_svr'].updateRowCount();
                grid['sys_svr'].render();
                $('#system_form').data('editflg',1);
                return true;
            });
            grid['sys_svr'].onClick.subscribe(function(e, args) {
                if (columns['sys_svr'][args.cell].id === 'detail') {
                    if ($('#server_form').is(':visible')) {
                        $.alert('この詳細画面は表示されている為、開くことができません');
                        return;
                    }
                    var item = grid['sys_svr'].getDataItem(args.row);
                    getServerShosai(item.svr_key.value);
                }
                if (columns['sys_svr'][args.cell].id === 'delete') {
                    sys_svr_data = grid['sys_svr'].getData();
                    if (sys_svr_data[args.row].svr_key.value !== '') {
                        let sys_svr_del = [];
                        if ($('#fs_sys_svr_del').val() !== '') {
                            sys_svr_del = JSON.parse($('#fs_sys_svr_del').val());
                        }
                        sys_svr_del.push(sys_svr_data[args.row].svr_key.value);
                        $('#fs_sys_svr_del').val(JSON.stringify(sys_svr_del));
                    }
                    sys_svr_data.splice(args.row, 1);
                    grid['sys_svr'].invalidate();
                    $('#system_form').data('editflg',1);
                }
            });
            grid['sys_svr'].onCellChange.subscribe(function(e, args) {
                if (columns['sys_svr'][args.cell].id === 'svr_key') {
                    if (args.item.svr_key.other) {
                        let item = grid['sys_svr'].getDataItem(args.row);
                        item.no = args.item.svr_key.value;
                        item.role_name = args.item.svr_key.other.role_name;
                        item.db_type_name = args.item.svr_key.other.db_type_name;
                        grid['sys_svr'].updateRow(args.row);
                    } else {
                        return;
                    }
                }
                $('#system_form').data('editflg',1);
            });
            grid['sys_svr'].onActiveCellChanged.subscribe(function(e, args) {
                if (args.cell && columns['sys_svr'][args.cell].id === 'db_memo') {
                    let item = grid['sys_svr'].getDataItem(args.row);
                    if (item && devdbname[item.no]) {
                        columns['sys_svr'][args.cell].options = devdbname[item.no];
                    } else {
                        columns['sys_svr'][args.cell].options = [];
                    }
                }
            });
        }
        if ($('#fs_sys_key').val() !== '新規') {
            loadSysSvr();
        }
        grid['sys_svr'].resizeCanvas();
    }
    function loadSysSvr() {
        let para = {
            sys_key: $('#fs_sys_key').val(),
        }
        grid['sys_svr'].setSelectedRows([]);
        let sc1 = BlockScreen('Loading ...','rgba(0,0,0,0)',$('#sys_svr_grid'));
        Ajax('devasstes.php?func=loadSystemServer',para).done(function(ret) {
            grid['sys_svr'].setData(ret.data);
            grid['sys_svr'].render();
        }).fail(function(ret) {
            alert(ret.msg);
        }).always(function(ret) {
            UnBlockScreen(sc1);
        });
    }
    function createSystemReleaseGrid() {
        if (grid['sys_rel'] === undefined) {
            grid['sys_rel'] = new Slick.Grid('#sys_rel_grid', sys_rel_data, columns['sys_rel'], options);
            grid['sys_rel'].registerPlugin( new Slick.AutoTooltips() );
            grid['sys_rel'].setSelectionModel(new Slick.RowSelectionModel());
            grid['sys_rel'].setOptions({editable: true, enableAddRow: true});
            grid['sys_rel'].onAddNewRow.subscribe(function (e, args) {
                var item = {
                    release_no: '',
                    release_date: '',
                    tanto: '',
                    version: '',
                    system_no: '',
                    task1: '',
                    naiyo: '',
                    kakunin: '',
                    biko: ''
                };
                sys_rel_data = grid['sys_rel'].getData();
                grid['sys_rel'].invalidateRow(sys_rel_data.length);
                sys_rel_data.push($.extend(item,args.item));
                grid['sys_rel'].updateRowCount();
                grid['sys_rel'].render();
                $('#system_form').data('editflg',1);
                return true;
            });
            grid['sys_rel'].onClick.subscribe(function(e, args) {
                if (columns['sys_rel'][args.cell].id === 'detail') {
                    if ($('#release_form').is(':visible')) {
                        $.alert('この詳細画面は表示されている為、開くことができません');
                        return;
                    }
                    var item = grid['sys_rel'].getDataItem(args.row);
                    item['sys_key'] = $('#fs_sys_key').val();
                    item['system_name'] = $('#fs_system_name').val();
                    shosaiDisp['release'](item,0);
                }
                if (columns['sys_rel'][args.cell].id === 'delete') {
                    sys_rel_data = grid['sys_rel'].getData();
                    if (sys_rel_data[args.row].release_no !== '') {
                        let sys_rel_del = [];
                        if ($('#fs_sys_rel_del').val() !== '') {
                            sys_rel_del = JSON.parse($('#fs_sys_rel_del').val());
                        }
                        sys_rel_del.push(sys_rel_data[args.row].release_no);
                        $('#fs_sys_rel_del').val(JSON.stringify(sys_rel_del));
                    }
                    sys_rel_data.splice(args.row, 1);
                    grid['sys_rel'].invalidate();
                    $('#system_form').data('editflg',1);
                }
                if (columns['sys_rel'][args.cell].id === 'tanto' || columns['sys_rel'][args.cell].id === 'kakunin') {
                    setTimeout(function() {
                        $('.editor-text').prop('readonly',true);
                    },300);
                }
            });
            grid['sys_rel'].onCellChange.subscribe(function(e, args) {
                $('#system_form').data('editflg',1);
            });
            grid['sys_rel'].onSelectedRowsChanged.subscribe(function(e, args) {
                if (args.previousSelectedRows.length > 0) {
                    let item = grid['sys_rel'].getDataItem(args.previousSelectedRows[0]);
                    if (item) {
                        sysReleaseCheck(args.previousSelectedRows[0],item);
                    }
                }
            });
        }
    }
    // リリース新規ボタンクリック
    $('#new_release').click(function() {
        if ($('#fs_sys_key').val() === '新規') {
            $.alert('登録し発番後に新規フォームが利用できます。')
        } else {
            formReset('release');
            $('#fr_sys_key').val($('#fs_sys_key').val());
            $('#fr_system_name').val($('#fs_system_name').val()).prop('readonly',true);
            // $('#fr_release_date').prop('tabindex','1');
            $('#fr_system_no').data('sv','');
            $('#release_form').dialog('open');
            $('#release_form .auto-resize').change();
        }
    });
    // リリースグリッドチェック
    function sysReleaseCheck(row,item) {
        if (item.release_date === '') {
            grid['sys_rel'].gotoCell(row,grid['sys_rel'].getColumnIndex('release_date'),true);
            grid['sys_rel'].setSelectedRows([row]);
            showMessage2($('.sys_rel_release_date').eq(row),'リリース日を入力して下さい','#ff0000',-65);
            return false;
        }
        if (item.naiyo === '') {
            grid['sys_rel'].gotoCell(row,grid['sys_rel'].getColumnIndex('naiyo'),true);
            grid['sys_rel'].setSelectedRows([row]);
            showMessage2($('.sys_rel_naiyo').eq(row),'修正内容を入力して下さい','#ff0000',-70);
            return false;
        }
    }
    // システム－トラブルグリッド作成
    function createSystemTroubleGrid() {
        if (grid['sys_trbl'] === undefined) {
            grid['sys_trbl'] = new Slick.Grid('#sys_trbl_grid', sys_trbl_data, columns['sys_trbl'], options);
            grid['sys_trbl'].registerPlugin( new Slick.AutoTooltips() );
            grid['sys_trbl'].setSelectionModel(new Slick.RowSelectionModel());
            grid['sys_trbl'].setOptions({editable: true, enableAddRow: true});
            grid['sys_trbl'].onAddNewRow.subscribe(function (e, args) {
                var item = {
                    trouble_no: '',
                    hassei_date: '',
                    status: 1,
                    kihyo: '',
                    level: 1,
                    genin_busho: 1,
                    naiyo: '',
                    genin: '',
                    taio_date: '',
                    taio: '',
                    taio_zantei: '',
                    taio_kokyu: '',
                    hokoku: '',
                    biko: ''
                };
                sys_trbl_data = grid['sys_trbl'].getData();
                grid['sys_trbl'].invalidateRow(sys_trbl_data.length);
                sys_trbl_data.push($.extend(item,args.item));
                grid['sys_trbl'].updateRowCount();
                grid['sys_trbl'].render();
                $('#system_form').data('editflg',1);
                return true;
            });
            grid['sys_trbl'].onClick.subscribe(function(e, args) {
                if (columns['sys_trbl'][args.cell].id === 'detail') {
                    var item = grid['sys_trbl'].getDataItem(args.row);
                    item['sys_key'] = $('#fs_sys_key').val();
                    item['system_name'] = $('#fs_system_name').val();
                    shosaiDisp['trouble'](item,0);
                }
                if (columns['sys_trbl'][args.cell].id === 'delete') {
                    sys_trbl_data = grid['sys_trbl'].getData();
                    if (sys_trbl_data[args.row].release_no !== '') {
                        let sys_trbl_del = [];
                        if ($('#fs_sys_trbl_del').val() !== '') {
                            sys_trbl_del = JSON.parse($('#fs_sys_trbl_del').val());
                        }
                        sys_trbl_del.push(sys_trbl_data[args.row].release_no);
                        $('#fs_sys_trbl_del').val(JSON.stringify(sys_trbl_del));
                    }
                    sys_trbl_data.splice(args.row, 1);
                    grid['sys_trbl'].invalidate();
                    $('#system_form').data('editflg',1);
                }
                if (columns['sys_trbl'][args.cell].id === 'kihyo') {
                    setTimeout(function() {
                        $('.editor-text').prop('readonly',true);
                    },300);
                }
            });
            grid['sys_trbl'].onCellChange.subscribe(function(e, args) {
                $('#system_form').data('editflg',1);
            });
            grid['sys_trbl'].onSelectedRowsChanged.subscribe(function(e, args) {
                if (args.previousSelectedRows.length > 0) {
                    let item = grid['sys_trbl'].getDataItem(args.previousSelectedRows[0]);
                    if (item) {
                        sysTroubleCheck(args.previousSelectedRows[0],item);
                    }
                }
            });
        }
    }
    // トラブル新規ボタンクリック
    $('#new_trouble').click(function() {
        if ($('#fs_sys_key').val() === '新規') {
            $.alert('登録し発番後に新規フォームが利用できます。')
        } else {
            formReset('trouble');
            $('#ft_sys_key').val($('#fs_sys_key').val());
            $('#ft_system_name').val($('#fs_system_name').val()).prop('readonly',true);
            // $('#ft_hassei_date').prop('tabindex','1');
            $('#ft_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');
            $('#trouble_form').dialog('open');
            $('#trouble_form .auto-resize').change();
        }
    });
    // トラブルグリッドチェック
    function sysTroubleCheck(row,item) {
        if (item.hassei_date === '') {
            grid['sys_trbl'].gotoCell(row,grid['sys_trbl'].getColumnIndex('hassei_date'),true);
            grid['sys_trbl'].setSelectedRows([row]);
            showMessage2($('.sys_trbl_hassei_date').eq(row),'発生日を入力して下さい','#ff0000',-65);
            return false;
        }
        if (item.naiyo === '') {
            grid['sys_trbl'].gotoCell(row,grid['sys_trbl'].getColumnIndex('naiyo'),true);
            grid['sys_trbl'].setSelectedRows([row]);
            showMessage2($('.sys_trbl_naiyo').eq(row),'不具合事象を入力して下さい','#ff0000',-70);
            return false;
        }
    }
    // フォーム初期化
    formCreate('system');
    // フォーカスチェック
    focusCheck['system'] = function() {
        focus_blur('sys_svr');
        focus_blur('sys_rel');
        focus_blur('sys_trbl');
    }
    // フォームチェック
    formCheck['system'] = function(item) {
        if ($('#fs_system_name').val().trim() === '') {
            showMessage2($('#fs_system_name'),'システム名を入力して下さい','#ff0000');
            return false;
        }
        if ($('#fs_start_date').val().trim() === '') {
            showMessage2($('#fs_start_date'),'稼働開始日を入力して下さい','#ff0000');
            return false;
        }
        if ($('#fs_start_date').val().isDate() === false) {
            showMessage2($('#fs_start_date'),'稼働開始日を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fs_end_date').val().isDate() === false) {
            showMessage2($('#fs_end_date'),'稼働終了日を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fs_start_date').val() !== '' && $('#fs_end_date').val() !=='' && $('#fs_start_date').val() > $('#fs_end_date').val()) {
            showMessage2($('#fs_start_date'),'稼働期間を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fs_kado_jyokyo').val() === '9' && $('#fs_end_date').val().trim() === '') {
            showMessage2($('#fs_end_date'),'稼働終了日を入力して下さい','#ff0000');
            return false;
        }
        if ($('#fs_kado_jyokyo').val() !== '9' && $('#fs_end_date').val().trim() !== '') {
            showMessage2($('#fs_kado_jyokyo'),'稼働状況を停止にして下さい','#ff0000');
            return false;
        }
        if ($('#fs_system_gaiyo').val().trim() === '') {
            showMessage2($('#fs_system_gaiyo'),'概要を入力して下さい','#ff0000');
            return false;
        }
        sys_rel_data = grid['sys_rel'].getData();
        for (let i=0; i<sys_rel_data.length; i++) {
            if (sysReleaseCheck(i,sys_rel_data[i]) === false) {
                return false;
            }
        }
        sys_trbl_data = grid['sys_trbl'].getData();
        for (let i=0; i<sys_trbl_data.length; i++) {
            if (sysTroubleCheck(i,sys_trbl_data[i]) === false) {
                return false;
            }
        }
        var env = [];
        $('#fs_dev_env .msel_item').each(function(i) {
            if ($(this).data('val') !== undefined && String($(this).data('val')) !== '') {
                env.push($(this).data('val'));
            }
        });
        $('#fs_dev_env_hidden').val(env.join(','));
        var lang = [];
        $('#fs_dev_lang .msel_item').each(function(i) {
            if ($(this).data('val') !== undefined && String($(this).data('val')) !== '') {
                lang.push($(this).data('val'));
            }
        });
        $('#fs_dev_lang_hidden').val(lang.join(','));

        sys_svr_data = grid['sys_svr'].getData();
        $('#fs_sys_svr').val(JSON.stringify(sys_svr_data));

        sys_rel_data = grid['sys_rel'].getData();
        $('#fs_sys_rel').val(JSON.stringify(sys_rel_data));

        sys_trbl_data = grid['sys_trbl'].getData();
        $('#fs_sys_trbl').val(JSON.stringify(sys_trbl_data));

        return true;
    }
    // 登録後の処理
    afterReg['system'] = function(ret) {
        if (ret.sys_key) {
            $('#fs_sys_key').val(ret.sys_key);
        }
        if (ret.release_no) {
            sys_rel_data = grid['sys_rel'].getData();
            for (let i=0; i<ret.release_no.length; i++) {
                sys_rel_data[ret.release_no[i].no].release_no = ret.release_no[i].release_no;
            }
            grid['sys_rel'].setData(sys_rel_data);
            grid['sys_rel'].render();
        }
        if (ret.trouble_no) {
            sys_trbl_data = grid['sys_trbl'].getData();
            for (let i=0; i<ret.trouble_no.length; i++) {
                sys_trbl_data[ret.trouble_no[i].no].trouble_no = ret.trouble_no[i].trouble_no;
            }
            grid['sys_trbl'].setData(sys_trbl_data);
            grid['sys_trbl'].render();
        }
        if ($('#server_form').is(':visible')) {
            loadSvrSys();
        }
    }
    // システムデータ削除処理
    deleteData['system'] = function(ret) {
        let dfd = $.Deferred();
        if ($('#fs_sys_key').val() === '新規') {
            dfd.resolve();
        } else {
            BlockScreen('削除中 ...');
            let para = {
                sys_key: $('#fs_sys_key').val(),
            }
            Ajax('devasstes.php?func=deleteSystem',para).done(function(ret) {
                dfd.resolve();
            }).fail(function(ret) {
                dfd.reject();
            }).always(function(ret) {
                UnBlockScreen();
            });
        }
        return dfd.promise();
    }
    // 検索処理
    filterFunc['system'] = function(item, args) {
        if ($('#system_edit').text() === '保存' && item.upd === 1) {
            return true;
        }
		if (args.findSystem !== "" && item["system_name"].indexOf(args.findSystem) == -1) {
            return false;
        }
		if (args.findGaiyo !== "" && item["gaiyo"].indexOf(args.findGaiyo) == -1 && item["biko"].indexOf(args.findGaiyo) == -1) {
            return false;
        }
        if (args.findKadoJyokyo !== "0" && item["kado_jyokyo"] !== args.findKadoJyokyo) {
            return false;
        }
        if (args.findDevKbn !== "0" && item["dev_kbn"] !== args.findDevKbn) {
            return false;
        }
		if (args.findUnyou !== "" && item["unyo_busho"].indexOf(args.findUnyou) == -1 && item["unyo_tanto"].indexOf(args.findUnyou) == -1) {
            return false;
        }
		if (args.findDevelop !== "" && item["dev_busho"].indexOf(args.findDevelop) == -1) {
            return false;
        }
		if (args.findDevtanto !== "" && item["dev_tanto"].indexOf(args.findDevtanto) == -1) {
            return false;
        }
        if (args.findEnv !== "" && item["dev_env"].indexOf(args.findEnv) == -1) {
            return false;
        }
        if (args.findLang !== "" && item["dev_lang"].indexOf(args.findLang) == -1) {
            return false;
        }
		// if (args.findBiko !== "" && item["biko"].indexOf(args.findBiko) == -1) {
        //     return false;
        // }
        return true;
    }
    // フォーム初期値設定
    for (let key in kado_jyokyo_opt) {
        $('#fds_kado_jyokyo').append('<option value="'+key+'"'+(kado_jyokyo_opt[key]==='稼働中' ? ' selected':'')+'>'+kado_jyokyo_opt[key]+'</option>');
        $('#fdr_kado_jyokyo').append('<option value="'+key+'"'+(kado_jyokyo_opt[key]==='稼働中' ? ' selected':'')+'>'+kado_jyokyo_opt[key]+'</option>');
        $('#fdt_kado_jyokyo').append('<option value="'+key+'"'+(kado_jyokyo_opt[key]==='稼働中' ? ' selected':'')+'>'+kado_jyokyo_opt[key]+'</option>');
        $('#fs_kado_jyokyo').append('<option value="'+key+'">'+kado_jyokyo_opt[key]+'</option>');
    }
    for (let key in kado_jyokyo_opt_s) {
        $('#fdv_kado_jyokyo').append('<option value="'+key+'"'+(kado_jyokyo_opt_s[key]==='運用中' ? ' selected':'')+'>'+kado_jyokyo_opt_s[key]+'</option>');
        $('#fdm_kado_jyokyo').append('<option value="'+key+'"'+(kado_jyokyo_opt_s[key]==='運用中' ? ' selected':'')+'>'+kado_jyokyo_opt_s[key]+'</option>');
        $('#fdx_kado_jyokyo').append('<option value="'+key+'"'+(kado_jyokyo_opt_s[key]==='運用中' ? ' selected':'')+'>'+kado_jyokyo_opt_s[key]+'</option>');
        $('#fv_kado_jyokyo').append('<option value="'+key+'">'+kado_jyokyo_opt_s[key]+'</option>');
    }
    for (let key in dev_kbn_opt) {
        $('#fds_dev_kbn').append('<option value="'+key+'">'+dev_kbn_opt[key]+'</option>');
        $('#fs_dev_kbn').append('<option value="'+key+'">'+dev_kbn_opt[key]+'</option>');
    }
    for (let key in env_type_opt) {
        $('#fdv_env_type').append('<option value="'+key+'">'+env_type_opt[key]+'</option>');
        $('#fv_env_type').append('<option value="'+key+'">'+env_type_opt[key]+'</option>');
    }
    devenv.forEach(function(item) {
        $('#fds_dev_env').append('<option value="'+item.value+'">'+item.label+'</option>');
        devenv_opt[item.value] = item.label;
    });
    devlang.forEach(function(item) {
        $('#fds_dev_lang').append('<option value="'+item.value+'">'+item.label+'</option>');
        devlang_opt[item.value] = item.label;
    });
    // システム画面表示
    $('input[name="disp_type"]:eq(0)').change();
    // ---------------------------------------------------------------------------------------------------------------------------
    // リリース画面処理
    // ---------------------------------------------------------------------------------------------------------------------------
    // 新規ボタンクリック
    $('#release_new').click(function() {
        formReset('release');
        $('#fr_system_name').prop('readonly',false);
        // $('#fr_release_date').prop('tabindex','2');
        $('#fr_system_no').data('sv','');
        $('#release_form').dialog('open');
        $('#release_form .auto-resize').change();
    });
    // 詳細クリック（詳細編集）
    gridClick['release'] = function(args) {
        var item = grid['release'].getDataItem(args.row);
        if (columns['release'][args.cell].id === 'detail') {
            if ($('#release_edit').text() === '保存') {
                $.alert('編集中の為、詳細を開けません<br>保存又は破棄して下さい');
                return;
            }
            shosaiDisp['release'](item,0);
        }
        if (columns['release'][args.cell].id === 'system_name') {
            getSystemShosai(item.sys_key);
        }
        if (columns['release'][args.cell].id === 'tanto' || columns['release'][args.cell].id === 'kakunin') {
            setTimeout(function() {
                $('.editor-text').prop('readonly',true);
            },300);
        }
    }
    // データ詳細セット
    shosaiDisp['release'] = function(item,copy) {
        formReset('release');
        if (copy !== 1) {
            $('#fr_release_no').val(item.release_no);
            $('#fr_release_date').val(item.release_date);
        } else {
            $('#fr_release_date').val((new Date()).formatDate('YYYY/MM/DD')).change();
        }
        $('#fr_sys_key').val(item.sys_key);
        $('#fr_system_name').val(item.system_name).prop('readonly',true);
        $('#fr_tanto').val(item.tanto);
        $('#fr_version').val(item.version);
        $('#fr_system_no').val(item.system_no).data('sv',String(item.system_no));
        $('#fr_task1').val(item.task1);
        $('#fr_naiyo').val(item.naiyo);
        $('#fr_kakunin').val(item.kakunin);
        $('#fr_biko').val(item.biko);

        $('#release_form').dialog('open');
        $('#release_form .auto-resize').change();
    }
    copyshosaiDisp['release'] = function(item) {
        shosaiDisp['release'](item,1);
        setTimeout(function() {
            $('#release_form').data('editflg',1);
        },300);
    }
    formCreate('release');
    // 検索処理
    filterFunc['release'] = function(item, args) {
        if ($('#release_edit').text() === '保存' && item.upd === 1) {
            return true;
        }
		if (args.findSystem !== "" && item["system_name"].indexOf(args.findSystem) == -1) {
            return false;
        }
        if (args.findKadoJyokyo !== "0" && item["kado_jyokyo"] !== args.findKadoJyokyo) {
            return false;
        }
		if (args.findDevelop !== "" && item["dev_busho"].indexOf(args.findDevelop) == -1) {
            return false;
        }
		if (args.findReleaseDate !== "" && item["release_date"].indexOf(args.findReleaseDate) == -1) {
            return false;
        }
		if (args.findTanto !== "" && item["tanto"].indexOf(args.findTanto) == -1) {
            return false;
        }
		if (args.findSystemNo !== "" && item["system_no"].indexOf(args.findSystemNo) == -1) {
            return false;
        }
		if (args.findNaiyo !== "" && item["naiyo"].indexOf(args.findNaiyo) == -1) {
            return false;
        }
		if (args.findKakunin !== "" && item["kakunin"].indexOf(args.findKakunin) == -1) {
            return false;
        }
		if (args.findBiko !== "" && item["biko"].indexOf(args.findBiko) == -1) {
            return false;
        }
        return true;
    }
    // フォームチェック
    formCheck['release'] = function() {
        if ($('#fr_sys_key').val() === '') {
            // showMessage2($('#fr_system_name'),'システム名をシステム一覧より選択して下さい','#ff0000');
            $('#fr_system_name').focus();
            return false;
        }
        if ($('#fr_release_date').val().trim() === '') {
            showMessage2($('#fr_release_date'),'リリース日を入力して下さい','#ff0000');
            return false;
        }
        if ($('#fr_release_date').val().isDate() === false) {
            showMessage2($('#fr_release_date'),'リリース日を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fr_naiyo').val().trim() === '') {
            showMessage2($('#fr_naiyo'),'修正内容を入力して下さい','#ff0000');
            return false;
        }
        if ($('#fr_system_no').val() === '') {
            showMessage2($('#fr_system_no'),'案件番号を入力して下さい','#ff0000');
            return false;
        }
        if (systemNoCheck2($('#fr_system_no')) === false) {
            return false;
        }
        return true;
    }
    // 案件番号チェック
    $('#fr_system_no').blur(function() {
        systemNoCheck2($(this));
    });
    // 登録後の処理
    afterReg['release'] = function(ret) {
        if (ret.release_no) {
            $('#fr_release_no').val(ret.release_no);
        }
        if ($('#system_form').is(':visible')) {
            loadSysRel();
        }
    }
    // ---------------------------------------------------------------------------------------------------------------------------
    // システムトラブル画面処理
    // ---------------------------------------------------------------------------------------------------------------------------
    // 新規ボタンクリック
    $('#trouble_new').click(function() {
        formReset('trouble');
        $('#ft_system_name').prop('readonly',false);
        $('#ft_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');
        $('#trouble_form').dialog('open');
        $('#trouble_form .auto-resize').change();
    });
    // 詳細クリック（詳細編集）
    gridClick['trouble'] = function(args) {
        var item = grid['trouble'].getDataItem(args.row);
        if (columns['trouble'][args.cell].id === 'detail') {
            if ($('#trouble_edit').text() === '保存') {
                $.alert('編集中の為、詳細を開けません<br>保存又は破棄して下さい');
                return;
            }
            shosaiDisp['trouble'](item,0);
        }
        if (columns['trouble'][args.cell].id === 'system_name') {
            getSystemShosai(item.sys_key);
        }
        // 変更不可にする為・・・
        if (columns['trouble'][args.cell].id === 'kihyo') {
            setTimeout(function() {
                $('.editor-text').prop('readonly',true);
            },300);
        }
    }
    // データ詳細セット
    shosaiDisp['trouble'] = function(item,copy) {
        formReset('trouble');
        if (copy !== 1) {
            $('#ft_trouble_no').val(item.trouble_no);
            $('#ft_hassei_date').val(item.hassei_date);
        } else {
            $('#ft_hassei_date').val((new Date()).formatDate('YYYY/MM/DD'));
        }
        $('#ft_sys_key').val(item.sys_key);
        $('#ft_system_name').val(item.system_name).prop('readonly',true);
        $('#ft_kihyo').val(item.kihyo);
        $('#ft_status').val(item.status);
        $('#ft_level').val(item.level);
        $('#ft_genin_busho').val(item.genin_busho);
        $('#ft_naiyo').val(item.naiyo);
        $('#ft_genin').val(item.genin);
        $('#ft_taio_date').val(item.taio_date);
        $('#ft_taio').val(item.taio);
        $('#ft_taio_zantei').val(item.taio_zantei);
        $('#ft_taio_kokyu').val(item.taio_kokyu);
        $('#ft_hokoku').val(item.hokoku);
        $('#ft_biko').val(item.biko);
        if (item.temp_file === null) {
            $('#ft_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');
        } else {
            $('#ft_temp_file').html('<button type="button" class="temp_file_add">＋</button>');
            item.temp_file.split('\n').forEach(function(item) {
                $('#ft_temp_file').append('<div><a href="'+item+'">'+item+'</a><span class="tmp_delete">✖</span></div>');
            });
        }
        $('#trouble_form').dialog('open');
        $('#trouble_form .auto-resize').change();
    }
    copyshosaiDisp['trouble'] = function(item) {
        shosaiDisp['trouble'](item,1);
        setTimeout(function() {
            $('#trouble_form').data('editflg',1);
        },300);
    }
    formCreate('trouble');
    // 検索処理
    filterFunc['trouble'] = function(item, args) {
        if ($('#trouble_edit').text() === '保存' && item.upd === 1) {
            return true;
        }
		if (args.findSystem !== "" && item["system_name"].indexOf(args.findSystem) == -1) {
            return false;
        }
        if (args.findKadoJyokyo !== "0" && item["kado_jyokyo"] !== args.findKadoJyokyo) {
            return false;
        }
		if (args.findHasseiDate !== "" && item["hassei_date"].indexOf(args.findHasseiDate) == -1) {
            return false;
        }
		if (args.findStatus !== "0" && item["status"] != args.findStatus) {
            return false;
        }
		if (args.findKihyo !== "" && item["kihyo"].indexOf(args.findKihyo) == -1) {
            return false;
        }
		if (args.findLevel !== "0" && item["level"] != args.findLevel) {
            return false;
        }
		if (args.findNaiyo !== "" && item["naiyo"].indexOf(args.findNaiyo) == -1 && item["genin"].indexOf(args.findNaiyo) == -1) {
            return false;
        }
		if (args.findTaioDate !== "" && item["taio_date"].indexOf(args.findTaioDate) == -1 && item["taio"].indexOf(args.findTaioDate) == -1) {
            return false;
        }
		if (args.findTaio !== "" && item["taio_zantei"].indexOf(args.findTaio) == -1 && item["taio_kokyu"].indexOf(args.findTaio) == -1) {
            return false;
        }
		if (args.findHokoku !== "" && item["hokoku"].indexOf(args.findHokoku) == -1) {
            return false;
        }
		if (args.findBiko !== "" && item["biko"].indexOf(args.findBiko) == -1) {
            return false;
        }
        return true;
    }
    // フォームチェック
    formCheck['trouble'] = function() {
        if ($('#ft_sys_key').val() === '') {
            // showMessage2($('#ft_system_name'),'システム名を正しく選択して下さい','#ff0000');
            $('#ft_system_name').focus();
            return false;
        }
        if ($('#ft_hassei_date').val().trim() === '') {
            showMessage2($('#ft_hassei_date'),'発生日を入力して下さい','#ff0000');
            return false;
        }
        if ($('#ft_hassei_date').val().isDate() === false) {
            showMessage2($('#ft_hassei_date'),'発生日を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#ft_status').val() === '9' && $('#ft_taio_date').val() === '') {
            showMessage2($('#ft_taio_date'),'対応日を入力して下さい','#ff0000');
            return false;
        }
        if ($('#ft_taio_date').val().isDate() === false) {
            showMessage2($('#ft_taio_date'),'対応日を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#ft_naiyo').val().trim() === '') {
            showMessage2($('#ft_naiyo'),'不具合事象を入力して下さい','#ff0000');
            return false;
        }
        return true;
    }
    // 登録後の処理
    afterReg['trouble'] = function(ret) {
        if (ret.trouble_no) {
            $('#ft_trouble_no').val(ret.trouble_no);
        }
        if ($('#system_form').is(':visible')) {
            loadSysTrbl();
        }
    }
    for (let key in trbl_status_opt) {
        $('#ft_status').append('<option value="'+key+'">'+trbl_status_opt[key]+'</option>');
        $('#fdt_status').append('<option value="'+key+'">'+trbl_status_opt[key]+'</option>');
    }
    for (let key in trbl_level_opt) {
        $('#ft_level').append('<option value="'+key+'">'+trbl_level_opt[key]+'</option>');
        $('#fdt_level').append('<option value="'+key+'">'+trbl_level_opt[key]+'</option>');
    }
    // ---------------------------------------------------------------------------------------------------------------------------
    // 作業画面処理
    // ---------------------------------------------------------------------------------------------------------------------------
    // 新規ボタンクリック
    $('#sagyo_new').click(function() {
        formReset('sagyo');
        // $('#fw_system_name').prop('readonly',false);
        $('#sagyo_form').dialog('open');
        $('#sagyo_form .auto-resize').change();
    });
    // 詳細クリック（詳細編集）
    gridClick['sagyo'] = function(args) {
        var item = grid['sagyo'].getDataItem(args.row);
        if (columns['sagyo'][args.cell].id === 'detail') {
            if ($('#sagyo_edit').text() === '保存') {
                $.alert('編集中の為、詳細を開けません<br>保存又は破棄して下さい');
                return;
            }
            shosaiDisp['sagyo'](item,0);
        }
        if (columns['sagyo'][args.cell].id === 'system_name' && item.sys_key !== null) {
            getSystemShosai(item.sys_key);
        }
        if (columns['sagyo'][args.cell].id === 'tanto' || columns['sagyo'][args.cell].id === 'kakunin') {
            setTimeout(function() {
                $('.editor-text').prop('readonly',true);
            },300);
        }
    }
    // データ詳細セット
    shosaiDisp['sagyo'] = function(item,copy) {
        formReset('sagyo');
        if (copy !== 1) {
            $('#fw_sagyo_no').val(item.sagyo_no);
            $('#fw_sagyo_date').val(item.sagyo_date);
        } else {
            $('#fw_sagyo_date').val((new Date()).formatDate('YYYY/MM/DD'));
        }
        $('#fw_sys_key').val(item.sys_key);
        $('#fw_system_name').val(item.system_name); //.prop('readonly',true);
        $('#fw_system_no').val(item.system_no);
        $('#fw_task1').val(item.task1);
        $('#fw_tanto').val(item.tanto);
        $('#fw_naiyo').val(item.naiyo);
        $('#fw_kakunin').val(item.kakunin);
        $('#fw_biko').val(item.biko);

        $('#sagyo_form').dialog('open');
        $('#sagyo_form .auto-resize').change();
    }
    copyshosaiDisp['sagyo'] = function(item) {
        shosaiDisp['sagyo'](item,1);
        setTimeout(function() {
            $('#sagyo_form').data('editflg',1);
        },300);
    }
    formCreate('sagyo');
    // 検索処理
    filterFunc['sagyo'] = function(item, args) {
        if ($('#sagyo_edit').text() === '保存' && item.upd === 1) {
            return true;
        }
		if (args.findSystem !== "" && item["system_name"].indexOf(args.findSystem) == -1) {
            return false;
        }
		if (args.findSagyoDate !== "" && item["sagyo_date"].indexOf(args.findSagyoDate) == -1) {
            return false;
        }
		if (args.findTanto !== "" && item["tanto"].indexOf(args.findTanto) == -1) {
            return false;
        }
		if (args.findNaiyo !== "" && item["naiyo"].indexOf(args.findNaiyo) == -1) {
            return false;
        }
		if (args.findKakunin !== "" && item["kakunin"].indexOf(args.findKakunin) == -1) {
            return false;
        }
		if (args.findBiko !== "" && item["biko"].indexOf(args.findBiko) == -1) {
            return false;
        }
        return true;
    }
    // フォームチェック
    formCheck['sagyo'] = function() {
        if ($('#fw_system_name').val() !== '' && $('#fw_sys_key').val() === '') {
        //     showMessage2($('#fw_system_name'),'システム名を正しく選択して下さい','#ff0000');
            $('#fw_system_name').focus();
            return false;
        }
        if ($('#fw_sagyo_date').val().trim() === '') {
            showMessage2($('#fw_sagyo_date'),'作業日を入力して下さい','#ff0000');
            return false;
        }
        if ($('#fw_sagyo_date').val().isDate() === false) {
            showMessage2($('#fw_sagyo_date'),'作業日を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fw_naiyo').val().trim() === '') {
            showMessage2($('#fw_naiyo'),'作業内容を入力して下さい','#ff0000');
            return false;
        }
        if (systemNoCheck2($('#fw_system_no')) === false) {
            return false;
        }
        return true;
    }
    // 案件番号チェック
    $('#fw_system_no').blur(function() {
        systemNoCheck2($(this));
    });
    // 登録後の処理
    afterReg['sagyo'] = function(ret) {
        if (ret.sagyo_no) {
            $('#fw_sagyo_no').val(ret.sagyo_no);
        }
        if ($('#system_form').is(':visible')) {
            loadSysRel();
        }
    }
    // 作業データ削除処理
    deleteData['sagyo'] = function(ret) {
        let dfd = $.Deferred();
        if ($('#fw_sagyo_no').val() === '新規') {
            dfd.resolve();
        } else {
            BlockScreen('削除中 ...');
            let para = {
                sagyo_no: $('#fw_sagyo_no').val(),
            }
            Ajax('devasstes.php?func=deleteSagyo',para).done(function(ret) {
                dfd.resolve();
            }).fail(function(ret) {
                dfd.reject();
            }).always(function(ret) {
                UnBlockScreen();
            });
        }
        return dfd.promise();
    }
    // ---------------------------------------------------------------------------------------------------------------------------
    // システム　リリース・トラブル・作業共通処理
    $('#fr_system_name,#ft_system_name,#fw_system_name').autocomplete({
        source: function (request, response) {
			Ajax('devasstes.php?func=findSystemlist', { keyword: (request.term == '0' ? '' : request.term) }).done(function (item) {
				response($.map(item, function (item) {
					return { label: item.system_name, value: item.sys_key };
				}));
			}).fail(function (ret) {
				response(['']);
			});
        },
        minLength: 2,
        select: function (e, ui) {
            changeflg = true;
            $(this).val(ui.item.label).change();
            $('#'+$(this)[0].id.substr(0,2)+'_sys_key').val(ui.item.value);
            return false;
        }
	}).focus(function () {
        if ($('#'+$(this)[0].id.substr(0,2)+'_sys_key').val() === '') {
            showMessage2($(this),'システム名の一部を入力し表示されたリストから選択して下さい','#0077ff',-60);
        }
    }).change(function() {
        $this_id = $(this)[0].id;
        if (changeflg === false && $(this).val().trim() !== '') {
			Ajax('devasstes.php?func=findSystem', { system_name : $(this).val() }).done(function (data) {
                if (data.code === 'OK') {
                    $('#'+$this_id.substr(0,2)+'_sys_key').val(data.sys_key);
                } else {
                    setTimeout(function() {
                        $('.ui-datepicker').hide();
                        $('#'+$this_id).focus();
                    },10);
                }
			}).fail(function (ret) {
				$.alert('エラーが発生しました。');
			});
        } else if ($(this).val().trim() === '') {
            setTimeout(function() {
                $('.ui-datepicker').hide();
                $('#'+$this_id.substr(0,2)+'_sys_key').val('');
                $('#'+$this_id).focus();
            },10);
        }
        changeflg = false;
    }).click(function(e) {
        if (e.ctrlKey) {
            $(this).prop('readonly',false);
        } else if ($(this).prop('readonly')) {
            showMessage2($(this),'Ctrlキー ＋ クリックで変更可能です。','#0077ff',-60);
        }
    });
    // システムNoチェック　トラブル・作業共通処理
    function systemNoCheck2($this) {
        if ($this.val() !== '' && $this.val() !== $this.data('sv')) {
            if (systemNoCheck($this.val(),false).valid === false) {
                showMessage2($this,'案件番号を正しく入力して下さい','#ff0000');
                return false;
            }
        }
        $this.data('sv',$this.val());
        clearMessage();
        return true;
    }
    // ---------------------------------------------------------------------------------------------------------------------------
    // サーバー画面処理
    // ---------------------------------------------------------------------------------------------------------------------------
    // 新規ボタンクリック
    $('#server_new').click(function() {
        formReset('server');
        // 別名
        $('#fv_other_name').mulitiText();
        // 役割選択リスト
        $('#fv_role').mulitiSelect({source:devrole});
        // IPアドレス
        $('#fv_ip_adrs').mulitiText();
        $('#fv_kanri_busho').val(syozokunm);
        $('#fv_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');

        $('#server_form').dialog('open');
        $('#server_form .auto-resize').change();

        createServerMenteGrid();
        grid['svr_mnt'].setData([]);
        grid['svr_mnt'].render();

        createServerTroubleGrid();
        grid['svr_trbl'].setData([]);
        grid['svr_trbl'].render();

        createServerSystemGrid();
        grid['svr_sys'].setData([]);
        grid['svr_sys'].render();
    });
    // 詳細クリック（詳細編集）
    gridClick['server'] = function(args) {
        var item = grid['server'].getDataItem(args.row);
        if (columns['server'][args.cell].id === 'detail') {
            if ($('#server_edit').text() === '保存') {
                $.alert('編集中の為、詳細を開けません<br>保存又は破棄して下さい');
                return;
            }
            shosaiDisp['server'](item,0);
        }
    }
    // サーバーからデータ取得
    function getServerShosai(svr_key) {
        Ajax('devasstes.php?func=loadserver',{svr_key: svr_key}).done(function(ret) {
            shosaiDisp['server'](ret.data[0],0);
        }).fail(function(ret) {
            alert(ret.msg);
        });
    }
    shosaiDisp['server'] = function(item,copy) {
        formReset('server');
        $('#fv_svr_key').val(item.id);
        $('#fv_host_name').val(item.host_name);
        $('#fv_sv_name').val(item.sv_name);
        $('#fv_sv_place').val(item.sv_place);
        $('#fv_env_type').val(item.env_type);
        $('#fv_kado_jyokyo').val(item.kado_jyokyo);
        $('#fv_start_date').val(item.start_date);
        $('#fv_end_date').val(item.end_date);
        $('#fv_os').val(item.os);
        $('#fv_role').val(item.role);
        $('#fv_db_type').val(item.db_type);
        $('#fv_server_gaiyo').val(item.gaiyo);
        $('#fv_kanri_busho').val(item.kanri_busho);
        $('#fv_kanri_tanto').val(item.kanri_tanto);
        $('#fv_server_biko').val(item.biko);

        // 別名
        $('#fv_other_name').mulitiText({value:item.other_name});
        // 役割選択リスト
        $('#fv_role').mulitiSelect({source:devrole,value:item.role,label:devrole_opt});
        // IPアドレス
        $('#fv_ip_adrs').mulitiText({value:item.ip_adrs,maxcnt:5});

        if (item.temp_file === null) {
            $('#fv_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');
        } else {
            $('#fv_temp_file').html('<button type="button" class="temp_file_add">＋</button>');
            item.temp_file.split('\n').forEach(function(item) {
                $('#fv_temp_file').append('<div><a href="'+item+'">'+item+'</a><span class="tmp_delete">✖</span></div>');
            });
        }
        $('#server_form').dialog('open');
        $('#server_form .auto-resize').change();
        // サーバーシステム一覧読込
        createServerSystemGrid();
        loadSvrSys();
        // サーバー－＞メンテナンス一覧読込
        createServerMenteGrid();
        loadSvrMnt();
        // サーバー－＞トラブル一覧読込
        createServerTroubleGrid();
        loadSvrTrbl();
    }
    function loadSvrSys() {
        var sc = BlockScreen('Loading ...','rgba(0,0,0,0)',$('#server_system_grid'));
        grid['svr_sys'].setSelectedRows([]);
        Ajax('devasstes.php?func=loadServerSystem',{svr_key: $('#fv_svr_key').val()}).done(function(ret) {
            grid['svr_sys'].setData(ret.data);
            grid['svr_sys'].render();
        }).fail(function(ret) {
            alert(ret.msg);
        }).always(function(ret) {
            UnBlockScreen(sc);
        });
    }
    function loadSvrMnt() {
        let sc = BlockScreen('Loading ...','rgba(0,0,0,0)',$('#svr_mente_grid'));
        grid['svr_mnt'].setSelectedRows([]);
        Ajax('devasstes.php?func=loadServerMente',{svr_key: $('#fv_svr_key').val()}).done(function(ret) {
            grid['svr_mnt'].setData(ret.data);
            grid['svr_mnt'].render();
        }).fail(function(ret) {
            alert(ret.msg);
        }).always(function(ret) {
            UnBlockScreen(sc);
        });
    }
    function loadSvrTrbl() {
        let sc = BlockScreen('Loading ...','rgba(0,0,0,0)',$('#svr_trbl_grid'));
        grid['svr_trbl'].setSelectedRows([]);
        Ajax('devasstes.php?func=loadServerTrouble',{svr_key: $('#fv_svr_key').val()}).done(function(ret) {
            grid['svr_trbl'].setData(ret.data);
            grid['svr_trbl'].render();
        }).fail(function(ret) {
            alert(ret.msg);
        }).always(function(ret) {
            UnBlockScreen(sc);
        });
    }
    // 登録後の処理
    afterReg['server'] = function(ret) {
        if (ret.svr_key) {
            $('#fv_svr_key').val(ret.svr_key);
        }
        if (ret.mente_no) {
            svr_mnt_data = grid['svr_mnt'].getData();
            for (let i=0; i<ret.mente_no.length; i++) {
                svr_mnt_data[ret.mente_no[i].no].mente_no = ret.mente_no[i].mente_no;
            }
            grid['svr_mnt'].setData(svr_mnt_data);
            grid['svr_mnt'].render();
        }
        if (ret.trouble_no) {
            svr_trbl_data = grid['svr_trbl'].getData();
            for (let i=0; i<ret.trouble_no.length; i++) {
                svr_trbl_data[ret.trouble_no[i].no].trouble_no = ret.trouble_no[i].trouble_no;
            }
            grid['svr_trbl'].setData(svr_trbl_data);
            grid['svr_trbl'].render();
        }
        if ($('#system_form').is(':visible')) {
            loadSysSvr();
        }
    }
    // サーバーデータ削除処理
    deleteData['server'] = function(ret) {
        let dfd = $.Deferred();
        if ($('#fv_svr_key').val() === '新規') {
            dfd.resolve();
        } else {
            BlockScreen('削除中 ...');
            let para = {
                svr_key: $('#fv_svr_key').val(),
            }
            Ajax('devasstes.php?func=deleteServer',para).done(function(ret) {
                dfd.resolve();
            }).fail(function(ret) {
                dfd.reject();
            }).always(function(ret) {
                UnBlockScreen();
            });
        }
        return dfd.promise();
    }
    formCreate('server');
    // フォーカスチェック
    focusCheck['server'] = function() {
        focus_blur('svr_mnt');
        focus_blur('svr_trbl');
    }
    // フォームチェック
    formCheck['server'] = function() {
        if ($('#fv_host_name').val().trim() === '') {
            showMessage2($('#fv_host_name'),'ホスト名を入力して下さい','#ff0000');
            return false;
        }
        if ($('#fv_start_date').val() === '') {
            showMessage2($('#fv_start_date'),'稼働開始日を入力して下さい','#ff0000');
            return false;
        }
        if ($('#fv_start_date').val().isDate() === false) {
            showMessage2($('#fv_start_date'),'稼働開始日を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fv_end_date').val().isDate() === false) {
            showMessage2($('#fv_end_date'),'稼働終了日を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fv_start_date').val() !== '' && $('#fv_end_date').val() !=='' && $('#fv_start_date').val() > $('#fv_end_date').val()) {
            showMessage2($('#fv_start_date'),'稼働期間を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fv_kado_jyokyo').val() >= '8' && $('#fv_end_date').val().trim() === '') {
            showMessage2($('#fv_end_date'),'稼働終了日を入力して下さい','#ff0000');
            return false;
        }
        if ($('#fv_kado_jyokyo').val() !== '9' && $('#fv_end_date').val().trim() !== '') {
            showMessage2($('#fv_kado_jyokyo'),'稼働状況を運用停止か廃止済にして下さい','#ff0000');
            return false;
        }
        svr_mnt_data = grid['svr_mnt'].getData();
        for (let i=0; i<svr_mnt_data.length; i++) {
            if (svrMenteCheck(i,svr_mnt_data[i]) === false) {
                return false;
            }
        }
        svr_trbl_data = grid['svr_trbl'].getData();
        for (let i=0; i<svr_trbl_data.length; i++) {
            if (svrTroubleCheck(i,svr_trbl_data[i]) === false) {
                return false;
            }
        }
        var db = false;
        var role = [];
        $('#fv_role .msel_item').each(function(i) {
            if ($(this).data('val') !== undefined && String($(this).data('val')) !== '') {
                role.push($(this).data('val'));
            }
            if ($(this).text() === 'DB' || $(this).text() === 'ＤＢ') {
                db = true;
            }
        });
        if (role.length === 0) {
            showMessage2($('#fv_role'),'役割を選択して下さい','#ff0000');
            return false;
        }
        $('#fv_role_hidden').val(role.join(','));
        if (db && ($('#fv_db_type').val() === "0" || $('#fv_db_type').val() === null)) {
            showMessage2($('#fv_db_type'),'ＤＢを選択して下さい','#ff0000');
            return false;
        }
        var other_name = [];
        $('#fv_other_name .mtxt_item').each(function() {
            if ($(this).val() !== '') {
                other_name.push($(this).val());
            }
        });
        $('#fv_other_name_hidden').val(other_name.join('\n'));
        var ip_adrs = [];
        var err = false;
        $('#fv_ip_adrs .mtxt_item').each(function(i) {
            if ($(this).val() !== '') {
                if (/^(?:(?:^|\.)(?:2(?:5[0-5]|[0-4]\d)|1?\d?\d)){4}$/.test($(this).val())) {
                    ip_adrs.push($(this).val());
                } else {
                    err = true;
                    showMessage2($(this),'IPアドレスを正しく入れて下さい','#ff0000');
                }
            }
        });
        if (err) {
            return false;
        }
        $('#fv_ip_adrs_hidden').val(ip_adrs.join('\n'));

        svr_mnt_data = grid['svr_mnt'].getData();
        $('#fv_svr_mnt').val(JSON.stringify(svr_mnt_data));
        svr_trbl_data = grid['svr_trbl'].getData();
        $('#fv_svr_trbl').val(JSON.stringify(svr_trbl_data));

        return true;
    }
    function createServerSystemGrid() {
        if (grid['svr_sys'] === undefined) {
            grid['svr_sys'] = new Slick.Grid('#server_system_grid', svr_sys_data, columns['svr_sys'], options);
            grid['svr_sys'].registerPlugin( new Slick.AutoTooltips() );
            grid['svr_sys'].setSelectionModel(new Slick.RowSelectionModel());
            grid['svr_sys'].onClick.subscribe(function(e, args) {
                if ($('#system_form').is(':visible')) {
                    $.alert('この詳細画面は表示されている為、開くことができません');
                    return;
                }
                if (columns['svr_sys'][args.cell].id === 'detail') {
                    var item = grid['svr_sys'].getDataItem(args.row);
                    getSystemShosai(item.sys_key);
                }
            });
        }
        grid['svr_sys'].resizeCanvas();
    }
    function createServerMenteGrid() {
        if (grid['svr_mnt'] === undefined) {
            grid['svr_mnt'] = new Slick.Grid('#svr_mnt_grid', svr_mnt_data, columns['svr_mnt'], options);
            grid['svr_mnt'].registerPlugin( new Slick.AutoTooltips() );
            grid['svr_mnt'].setSelectionModel(new Slick.RowSelectionModel());
            grid['svr_mnt'].setOptions({editable: true, enableAddRow: true});
            grid['svr_mnt'].onAddNewRow.subscribe(function (e, args) {
                var item = {
                    mente_no: '',
                    start_date: '',
                    start_time: '',
                    end_date: '',
                    end_time: '',
                    tanto: '',
                    kekka: 0,
                    naiyo: '',
                    biko: ''
                };
                svr_mnt_data = grid['svr_mnt'].getData();
                grid['svr_mnt'].invalidateRow(svr_mnt_data.length);
                svr_mnt_data.push($.extend(item,args.item));
                grid['svr_mnt'].updateRowCount();
                grid['svr_mnt'].render();
                $('#server_form').data('editflg',1);
                return true;
            });
            grid['svr_mnt'].onClick.subscribe(function(e, args) {
                if (columns['svr_mnt'][args.cell].id === 'detail') {
                    var item = grid['svr_mnt'].getDataItem(args.row);
                    item['svr_key'] = $('#fv_svr_key').val();
                    item['host_name'] = $('#fv_host_name').val();
                    shosaiDisp['mente'](item,0);
                }
                if (columns['svr_mnt'][args.cell].id === 'delete') {
                    svr_mnt_data = grid['svr_mnt'].getData();
                    if (svr_mnt_data[args.row].release_no !== '') {
                        let svr_mnt_del = [];
                        if ($('#fv_svr_mnt_del').val() !== '') {
                            svr_mnt_del = JSON.parse($('#fv_svr_mnt_del').val());
                        }
                        svr_mnt_del.push(svr_mnt_data[args.row].release_no);
                        $('#fv_svr_mnt_del').val(JSON.stringify(svr_mnt_del));
                    }
                    svr_mnt_data.splice(args.row, 1);
                    grid['svr_mnt'].invalidate();
                    $('#server_form').data('editflg',1);
                }
            });
            grid['svr_mnt'].onCellChange.subscribe(function(e, args) {
                $('#server_form').data('editflg',1);
            });
            grid['svr_mnt'].onSelectedRowsChanged.subscribe(function(e, args) {
                if (args.previousSelectedRows.length > 0) {
                    let item = grid['svr_mnt'].getDataItem(args.previousSelectedRows[0]);
                    if (item) {
                        svrMenteCheck(args.previousSelectedRows[0],item);
                    }
                }
            });
        }
        grid['svr_mnt'].resizeCanvas();
    }
    // メンテ新規ボタンクリック
    $('#new_mente').click(function() {
        if ($('#fv_svr_key').val() === '新規') {
            $.alert('登録し発番後に新規フォームが利用できます。')
        } else {
            formReset('mente');
            $('#fm_svr_key').val($('#fv_svr_key').val());
            $('#fm_host_name').val($('#fv_host_name').val()).prop('readonly',true);
            // $('#fm_start_date').prop('tabindex','1');
            $('#mente_form').dialog('open');
            $('#mente_form .auto-resize').change();
        }
    });
    // メンテグリッドチェック
    function svrMenteCheck(row,item) {
        if (item.start_date === '') {
            grid['svr_mnt'].gotoCell(row,grid['svr_mnt'].getColumnIndex('start_date'),true);
            grid['svr_mnt'].setSelectedRows([row]);
            showMessage2($('.svr_mnt_start_date').eq(row),'作業開始日を入力して下さい','#ff0000',-65);
            return false;
        }
        if (item.end_date === '') {
            grid['svr_mnt'].gotoCell(row,grid['svr_mnt'].getColumnIndex('end_date'),true);
            grid['svr_mnt'].setSelectedRows([row]);
            showMessage2($('.svr_mnt_end_date').eq(row),'作業終了日を入力して下さい','#ff0000',-65);
            return false;
        }
        if (item.start_date+' '+item.start_time > item.end_date+' '+item.end_time) {
            grid['svr_mnt'].gotoCell(row,grid['svr_mnt'].getColumnIndex('start_date'),true);
            grid['svr_mnt'].setSelectedRows([row]);
            showMessage2($('.svr_mnt_start_date').eq(row),'作業期間を正しく入力して下さい','#ff0000',-65);
            return false;
        }
        if (item.naiyo === '') {
            grid['svr_mnt'].gotoCell(row,grid['svr_mnt'].getColumnIndex('naiyo'),true);
            grid['svr_mnt'].setSelectedRows([row]);
            showMessage2($('.svr_mnt_naiyo').eq(row),'作業内容を入力して下さい','#ff0000',-70);
            return false;
        }
    }
    function createServerTroubleGrid() {
        if (grid['svr_trbl'] === undefined) {
            grid['svr_trbl'] = new Slick.Grid('#svr_trbl_grid', svr_trbl_data, columns['svr_trbl'], options);
            grid['svr_trbl'].registerPlugin( new Slick.AutoTooltips() );
            grid['svr_trbl'].setSelectionModel(new Slick.RowSelectionModel());
            grid['svr_trbl'].setOptions({editable: true, enableAddRow: true});
            grid['svr_trbl'].onAddNewRow.subscribe(function (e, args) {
                var item = {
                    trouble_no: '',
                    hassei_date: '',
                    status: 1,
                    kihyo: '',
                    level: 1,
                    naiyo: '',
                    taio_date: '',
                    taio: '',
                    hokoku: '',
                    biko: ''
                };
                svr_trbl_data = grid['svr_trbl'].getData();
                grid['svr_trbl'].invalidateRow(svr_trbl_data.length);
                svr_trbl_data.push($.extend(item,args.item));
                grid['svr_trbl'].updateRowCount();
                grid['svr_trbl'].render();
                $('#server_form').data('editflg',1);
                return true;
            });
            grid['svr_trbl'].onClick.subscribe(function(e, args) {
                if (columns['svr_trbl'][args.cell].id === 'detail') {
                    var item = grid['svr_trbl'].getDataItem(args.row);
                    item['svr_key'] = $('#fv_svr_key').val();
                    item['host_name'] = $('#fv_host_name').val();
                    shosaiDisp['strouble'](item,0);
                }
                if (columns['svr_trbl'][args.cell].id === 'delete') {
                    svr_trbl_data = grid['svr_trbl'].getData();
                    if (svr_trbl_data[args.row].release_no !== '') {
                        let svr_trbl_del = [];
                        if ($('#fv_svr_trbl_del').val() !== '') {
                            svr_trbl_del = JSON.parse($('#fv_svr_trbl_del').val());
                        }
                        svr_trbl_del.push(svr_trbl_data[args.row].release_no);
                        $('#fv_svr_trbl_del').val(JSON.stringify(svr_trbl_del));
                    }
                    svr_trbl_data.splice(args.row, 1);
                    grid['svr_trbl'].invalidate();
                    $('#server_form').data('editflg',1);
                }
            });
            grid['svr_trbl'].onCellChange.subscribe(function(e, args) {
                $('#server_form').data('editflg',1);
            });
            grid['svr_trbl'].onSelectedRowsChanged.subscribe(function(e, args) {
                if (args.previousSelectedRows.length > 0) {
                    let item = grid['svr_trbl'].getDataItem(args.previousSelectedRows[0]);
                    if (item) {
                        svrTroubleCheck(args.previousSelectedRows[0],item);
                    }
                }
            });
        }
        grid['svr_trbl'].resizeCanvas();
    }
    // トラブル新規ボタンクリック
    $('#new_strouble').click(function() {
        if ($('#fv_svr_key').val() === '新規') {
            $.alert('登録し発番後に新規フォームが利用できます。')
        } else {
            formReset('trouble');
            $('#fx_svr_key').val($('#fv_svr_key').val());
            $('#fx_host_name').val($('#fv_host_name').val()).pprop('readonly',true);
            // $('#fx_hassei_date').prop('tabindex','1');
            $('#fx_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');
            $('#strouble_form').dialog('open');
            $('#strouble_form .auto-resize').change();
        }
    });
    // トラブルグリッドチェック
    function svrTroubleCheck(row,item) {
        if (item.hassei_date === '') {
            grid['svr_trbl'].gotoCell(row,grid['svr_trbl'].getColumnIndex('hassei_date'),true);
            grid['svr_trbl'].setSelectedRows([row]);
            showMessage2($('.svr_trbl_hassei_date').eq(row),'発生日を入力して下さい','#ff0000',-65);
            return false;
        }
        if (item.naiyo === '') {
            grid['svr_trbl'].gotoCell(row,grid['svr_trbl'].getColumnIndex('naiyo'),true);
            grid['svr_trbl'].setSelectedRows([row]);
            showMessage2($('.svr_trbl_naiyo').eq(row),'不具合事象を入力して下さい','#ff0000',-70);
            return false;
        }
    }
    // 検索処理
    filterFunc['server'] = function(item, args) {
        if ($('#server_edit').text() === '保存' && item.upd === 1) {
            return true;
        }
		if (args.findHostName !== "" && item["host_name"].toUpperCase().indexOf(args.findHostName.toUpperCase()) == -1 && item["other_name"].toUpperCase().indexOf(args.findHostName.toUpperCase()) == -1
            && (devsvname_opt[item["sv_name"]] === undefined || devsvname_opt[item["sv_name"]].toUpperCase().indexOf(args.findHostName.toUpperCase()) == -1)) {
            return false;
        }
        if (args.findEnvType !== "" && item["env_type"] !== args.findEnvType) {
            return false;
        }
        if (args.findSvPlace !== "" && item["sv_place"] !== args.findSvPlace) {
            return false;
        }
		if (args.findGaiyo !== "" && item["gaiyo"].indexOf(args.findGaiyo) == -1 && item["biko"].indexOf(args.findGaiyo) == -1) {
            return false;
        }
        if (args.findKadoJyokyo !== "0" && item["kado_jyokyo"] !== args.findKadoJyokyo) {
            return false;
        }
        if (args.findOS !== "" && item["os"].indexOf(args.findOS) == -1) {
            return false;
        }
        if (args.findRole !== "" && item["role"].indexOf(args.findRole) == -1) {
            return false;
        }
        if (args.findDB !== "" && item["db_type"].indexOf(args.findDB) == -1) {
            return false;
        }
        if (args.findIPAdrs !== "" && item["ip_adrs"].indexOf(args.findIPAdrs) == -1) {
            return false;
        }
		if (args.findKanri !== "" && item["kanri_busho"].indexOf(args.findKanri) == -1 && item["kanri_tanto"].indexOf(args.findKanri) == -1) {
            return false;
        }
		// if (args.findBiko !== "" && item["biko"].indexOf(args.findBiko) == -1) {
        //     return false;
        // }
        return true;
    }
    // 行チェック
    rowCheck['server'] = function(item,row) {
        if (item.role.length === 0) {
            grid['server'].gotoCell(row,grid['server'].getColumnIndex('role'),true);
            setTimeout(function() {
                showMessage2($('.editor-mselect'),'役割を選択して下さい','#ff0000',-10);
            },200)
            return false;
        }
        let db = false;
        if (Array.isArray(item.role)) {
            for(let i=0; i<item.role.length; i++) {
                if (devrole_opt[item.role[i]] === 'DB' || devrole_opt[item.role[i]] === 'ＤＢ') {
                    db = true;
                }
            }
        }
        if (db && (item.db_type === '0' || item.db_type === null)) {
            setTimeout(function() {
                showMessage2($('.editor-text'),'ＤＢを選択して下さい。','#ff0000',-10);
            },200)
            grid['server'].gotoCell(row,grid['server'].getColumnIndex('db_type'),true);
            return false;
        }
        return true;
    }
    // フォーム初期値設定
    devserver.forEach(function(row) {
        $('#fv_os').append('<option value="'+row.value+'">'+row.label+'</option>');
        $('#fdv_os').append('<option value="'+row.value+'">'+row.label+'</option>');
        devserver_opt[row.value] = row.label;
    });
    devsvname.forEach(function(row) {
        $('#fv_sv_name').append('<option value="'+row.value+'">'+row.label+'</option>');
        // $('#fdv_sv_name').append('<option value="'+row.value+'">'+row.label+'</option>');
        devsvname_opt[row.value] = row.label;
    });
    devsvplace.forEach(function(row) {
        $('#fv_sv_place').append('<option value="'+row.value+'">'+row.label+'</option>');
        $('#fdv_sv_place').append('<option value="'+row.value+'">'+row.label+'</option>');
        devsvplace_opt[row.value] = row.label;
    });
    devrole.forEach(function(row) {
        $('#fv_role').append('<option value="'+row.value+'">'+row.label+'</option>');
        $('#fdv_role').append('<option value="'+row.value+'">'+row.label+'</option>');
        devrole_opt[row.value] = row.label;
    });
    devdb_opt[0] = '';
    devdb.forEach(function(row) {
        $('#fv_db_type').append('<option value="'+row.value+'">'+row.label+'</option>');
        $('#fdv_db').append('<option value="'+row.value+'">'+row.label+'</option>');
        devdb_opt[row.value] = row.label;
    });
    // ---------------------------------------------------------------------------------------------------------------------------
    // サーバーメンテナンス画面処理
    // ---------------------------------------------------------------------------------------------------------------------------
    // 新規ボタンクリック
    $('#mente_new').click(function() {
        formReset('mente');
        $('#fm_host_name').prop('readonly',false);
        // $('#fm_start_date').prop('tabindex','2');
        $('#mente_form').dialog('open');
        $('#mente_form .auto-resize').change();
    });
    // 詳細クリック（詳細編集）
    gridClick['mente'] = function(args) {
        var item = grid['mente'].getDataItem(args.row);
        if (columns['mente'][args.cell].id === 'detail') {
            if ($('#mente_edit').text() === '保存') {
                $.alert('編集中の為、詳細を開けません<br>保存又は破棄して下さい');
                return;
            }
            shosaiDisp['mente'](item,0);
        }
        if (columns['mente'][args.cell].id === 'host_name') {
            getServerShosai(item.svr_key);
        }
    }
    // データ詳細セット
    shosaiDisp['mente'] = function(item,copy) {
        formReset('mente');
        $('#fm_mente_no').val(item.mente_no);
        $('#fm_svr_key').val(item.svr_key);
        $('#fm_host_name').val(item.host_name).prop('readonly',true);
        $('#fm_start_date').val(item.start_date);
        $('#fm_start_time').val(item.start_time);
        $('#fm_end_date').val(item.end_date);
        $('#fm_end_time').val(item.end_time);
        $('#fm_tanto').val(item.tanto);
        $('#fm_kekka').val(item.kekka);
        $('#fm_naiyo').val(item.naiyo);
        $('#fm_biko').val(item.biko);

        $('#mente_form').dialog('open');
        $('#mente_form .auto-resize').change();
    }
    formCreate('mente');
    // 検索処理
    filterFunc['mente'] = function(item, args) {
        if ($('#mente_edit').text() === '保存' && item.upd === 1) {
            return true;
        }
		if (args.findHostName !== "" && item["host_name"].indexOf(args.findHostName) == -1 && item["other_name"].indexOf(args.findHostName) == -1) {
            return false;
        }
        if (args.findKadoJyokyo !== "0" && item["kado_jyokyo"] !== args.findKadoJyokyo) {
            return false;
        }
		if (args.findStartDate !== "" && item["start_date"].indexOf(args.findStartDate) == -1) {
            return false;
        }
		if (args.findEndDate !== "" && item["end_date"].indexOf(args.findEndDate) == -1) {
            return false;
        }
		if (args.findTanto !== "" && item["tanto"].indexOf(args.findTanto) == -1) {
            return false;
        }
		if (args.findKekka !== "0" && item["kekka"] != args.findKekka) {
            return false;
        }
		if (args.findNaiyo !== "" && item["naiyo"].indexOf(args.findNaiyo) == -1) {
            return false;
        }
		if (args.findBiko !== "" && item["biko"].indexOf(args.findBiko) == -1) {
            return false;
        }
        return true;
    }
    // 行チェック
    rowCheck['mente'] = function(item,row) {
        if (item.start_date+' '+item.start_time > item.end_date+' '+item.end_time) {
            grid['mente'].gotoCell(row,grid['mente'].getColumnIndex('start_date'),true);
            grid['mente'].setSelectedRows([row]);
            setTimeout(function() {
                showMessage2($('.editor-text'),'作業期間を正しく入力して下さい','#ff0000',-10);
            },200)
            return false;
        }
        return true;
    }
    // フォームチェック
    formCheck['mente'] = function() {
        if ($('#fm_svr_key').val() === '') {
            // showMessage2($('#fm_host_name'),'サーバー名を正しく選択して下さい','#ff0000');
            $('#fm_host_name').focus();
            return false;
        }
        if ($('#fm_start_date').val() === "" || $('#fm_start_date').val().isDate() === false) {
            showMessage2($('#fm_start_date'),'開始日を正しく入力して下さい','#ff0000');
            return false;
        }
        if (timeCheck($('#fm_start_time').val()).valid === false) {
            showMessage2($('#fm_start_time'),'開始時刻を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fm_end_date').val() === "" || $('#fm_end_date').val().isDate() === false) {
            showMessage2($('#fm_end_date'),'終了日を正しく入力して下さい','#ff0000');
            return false;
        }
        if (timeCheck($('#fm_end_time').val()).valid === false) {
            showMessage2($('#fm_end_time'),'終了時刻を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fm_start_date').val()+' '+$('#fm_start_time').val() > $('#fm_end_date').val()+' '+$('#fm_end_time').val()) {
            showMessage2($('#fm_start_date'),'作業期間を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fm_naiyo').val() === '') {
            showMessage2($('#fm_naiyo'),'作業内容を入力して下さい','#ff0000');
            return false;
        }
        return true;
    }
    // 登録後の処理
    afterReg['mente'] = function(ret) {
        if (ret.mente_no) {
            $('#fm_mente_no').val(ret.mente_no);
        }
        if ($('#server_form').is(':visible')) {
            loadSvrMnt();
        }
    }
    for (let key in mnt_kekka_opt) {
        $('#fm_kekka').append('<option value="'+key+'">'+mnt_kekka_opt[key]+'</option>');
        $('#fdm_kekka').append('<option value="'+key+'">'+mnt_kekka_opt[key]+'</option>');
    }

    $('#fm_start_time,#fm_end_time').autocomplete({
        source: mnt_time,
        minLength: 0,
        select: function (e, ui) {
            $(this).val(ui.item.label).change();
            return false;
        }
    }).click(function () {
        $(this).autocomplete('search', '');
    });
    // ---------------------------------------------------------------------------------------------------------------------------
    // サーバートラブル画面処理
    // ---------------------------------------------------------------------------------------------------------------------------
    // 新規ボタンクリック
    $('#strouble_new').click(function() {
        formReset('strouble');
        $('#fx_host_name').prop('readonly',false);
        // $('#fx_hassei_date').prop('tabindex','2');
        $('#fx_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');
        $('#strouble_form').dialog('open');
        $('#strouble_form .auto-resize').change();
    });
    // 詳細クリック（詳細編集）
    gridClick['strouble'] = function(args) {
        var item = grid['strouble'].getDataItem(args.row);
        if (columns['strouble'][args.cell].id === 'detail') {
            if ($('#strouble_edit').text() === '保存') {
                $.alert('編集中の為、詳細を開けません<br>保存又は破棄して下さい');
                return;
            }
            shosaiDisp['strouble'](item,0);
        }
        if (columns['strouble'][args.cell].id === 'host_name') {
            getServerShosai(item.svr_key);
        }
    }
    // データ詳細セット
    shosaiDisp['strouble'] = function(item,copy) {
        formReset('strouble');
        $('#fx_trouble_no').val(item.trouble_no);
        $('#fx_svr_key').val(item.svr_key);
        $('#fx_host_name').val(item.host_name).prop('readonly',true);
        $('#fx_hassei_date').val(item.hassei_date);
        $('#fx_kihyo').val(item.kihyo);
        $('#fx_status').val(item.status);
        $('#fx_level').val(item.level);
        $('#fx_naiyo').val(item.naiyo);
        $('#fx_taio_date').val(item.taio_date);
        $('#fx_taio').val(item.taio);
        $('#fx_hokoku').val(item.hokoku);
        $('#fx_biko').val(item.biko);
        if (item.temp_file === null) {
            $('#fx_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');
        } else {
            $('#fx_temp_file').html('<button type="button" class="temp_file_add">＋</button>');
            item.temp_file.split('\n').forEach(function(item) {
                $('#fx_temp_file').append('<div><a href="'+item+'">'+item+'</a><span class="tmp_delete">✖</span></div>');
            });
        }

        $('#strouble_form').dialog('open');
        $('#strouble_form .auto-resize').change();
    }
    formCreate('strouble');
    // 検索処理
    filterFunc['strouble'] = function(item, args) {
        if ($('#strouble_edit').text() === '保存' && item.upd === 1) {
            return true;
        }
		if (args.findHostName !== "" && item["host_name"].indexOf(args.findHostName) == -1 && item["other_name"].indexOf(args.findHostName) == -1) {
            return false;
        }
        if (args.findKadoJyokyo !== "0" && item["kado_jyokyo"] !== args.findKadoJyokyo) {
            return false;
        }
		if (args.findHasseiDate !== "" && item["hassei_date"].indexOf(args.findHasseiDate) == -1) {
            return false;
        }
		if (args.findStatus !== "0" && item["status"] != args.findStatus) {
            return false;
        }
		if (args.findKihyo !== "" && item["kihyo"].indexOf(args.findKihyo) == -1) {
            return false;
        }
		if (args.findLevel !== "0" && item["level"] != args.findLevel) {
            return false;
        }
		if (args.findNaiyo !== "" && item["naiyo"].indexOf(args.findNaiyo) == -1) {
            return false;
        }
		if (args.findTaioDate !== "" && item["taio_date"].indexOf(args.findTaioDate) == -1) {
            return false;
        }
		if (args.findTaio !== "" && item["taio"].indexOf(args.findTaio) == -1) {
            return false;
        }
		if (args.findHokoku !== "" && item["hokoku"].indexOf(args.findHokoku) == -1) {
            return false;
        }
		if (args.findBiko !== "" && item["biko"].indexOf(args.findBiko) == -1) {
            return false;
        }
        return true;
    }
    // フォームチェック
    formCheck['strouble'] = function() {
        if ($('#fx_svr_key').val() === '') {
            // showMessage2($('#fx_host_name'),'サーバー名を正しく選択して下さい','#ff0000');
            $('#fx_host_name').focus();
            return false;
        }
        if ($('#fx_hassei_date').val().trim() === '') {
            showMessage2($('#fx_hassei_date'),'発生日を入力して下さい','#ff0000');
            return false;
        }
        if ($('#fx_hassei_date').val().isDate() === false) {
            showMessage2($('#fx_hassei_date'),'発生日を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fx_status').val() === '9' && $('#fx_taio_date').val() === '') {
            showMessage2($('#fx_taio_date'),'対応日を入力して下さい','#ff0000');
            return false;
        }
        if ($('#fx_taio_date').val().isDate() === false) {
            showMessage2($('#fx_taio_date'),'対応日を正しく入力して下さい','#ff0000');
            return false;
        }
        if ($('#fx_naiyo').val().trim() === '') {
            showMessage2($('#fx_naiyo'),'不具合事象を入力して下さい','#ff0000');
            return false;
        }
        return true;
    }
    // 登録後の処理
    afterReg['strouble'] = function(ret) {
        if (ret.trouble_no) {
            $('#fx_trouble_no').val(ret.trouble_no);
        }
        if ($('#server_form').is(':visible')) {
            loadSvrTrbl();
        }
    }
    for (let key in trbl_status_opt) {
        $('#fx_status').append('<option value="'+key+'">'+trbl_status_opt[key]+'</option>');
        $('#fdx_status').append('<option value="'+key+'">'+trbl_status_opt[key]+'</option>');
    }
    for (let key in trbl_level_opt) {
        $('#fx_level').append('<option value="'+key+'">'+trbl_level_opt[key]+'</option>');
        $('#fdx_level').append('<option value="'+key+'">'+trbl_level_opt[key]+'</option>');
    }

    // ---------------------------------------------------------------------------------------------------------------------------
    // サーバー　リリース・トラブル共通処理
    $('#fm_host_name,#fx_host_name').autocomplete({
        source: function (request, response) {
			Ajax('devasstes.php?func=findServerlist', { keyword: (request.term == '0' ? '' : request.term) }).done(function (item) {
				response($.map(item, function (item) {
					return { label: item.host_name, value: item.svr_key };
				}));
			}).fail(function (ret) {
				response(['']);
			});
        },
        minLength: 2,
        select: function (e, ui) {
            changeflg = true;
            $(this).val(ui.item.label).change();
            $('#'+$(this)[0].id.substr(0,2)+'_svr_key').val(ui.item.value);
            return false;
        }
	}).focus(function () {
        if ($('#'+$(this)[0].id.substr(0,2)+'_svr_key').val() === '') {
            showMessage2($(this),'ホスト名の一部を入力し表示されたリストから選択して下さい','#0077ff',-60);
        }
    }).change(function() {
        $this_id = $(this)[0].id;
        if (changeflg === false && $(this).val().trim() !== '') {
			Ajax('devasstes.php?func=findServer', { host_name : $(this).val() }).done(function (data) {
                if (data.code === 'OK') {
                    $('#'+$this_id.substr(0,2)+'_svr_key').val(data.svr_key);
                } else {
                    setTimeout(function() {
                        $('.ui-datepicker').hide();
                        $('#'+$this_id).focus();
                    },10);
                }
			}).fail(function (ret) {
				$.alert('エラーが発生しました。');
			});
        } else if ($(this).val().trim() === '') {
            setTimeout(function() {
                $('.ui-datepicker').hide();
                $('#'+$this_id.substr(0,2)+'_svr_key').val('');
                $('#'+$this_id).focus();
            },10);
        }
        changeflg = false;
    }).click(function(e) {
        if (e.ctrlKey) {
            $(this).prop('readonly',false);
        } else if ($(this).prop('readonly')) {
            showMessage2($(this),'Ctrlキー ＋ クリックで変更可能です。','#0077ff',-60);
        }
    });
    // ---------------------------------------------------------------------------------------------------------------------------
    // 検索フィルター
    var filterArgs = function(type) {
        return {
            'system' : {
                findSystem: $('#fds_system').val(),
                findGaiyo: $('#fds_gaiyo').val(),
                findKadoJyokyo: $('#fds_kado_jyokyo').val(),
                findDevKbn: $('#fds_dev_kbn').val(),
                findUnyou: $('#fds_unyou').val(),
                findDevelop: $('#fds_develop').val(),
                findDevtanto: $('#fds_devtanto').val(),
                findEnv: $('#fds_dev_env').val(),
                findLang: $('#fds_dev_lang').val(),
                // findBiko: $('#fds_biko').val(),
            },
            'release' : {
                findSystem: $('#fdr_system').val(),
                findKadoJyokyo: $('#fdr_kado_jyokyo').val(),
                findReleaseDate: $('#fdr_release').val(),
                findTanto: $('#fdr_devtanto').val(),
                findSystemNo: $('#fdr_system_no').val(),
                findNaiyo: $('#fdr_naiyo').val(),
                findKakunin: $('#fdr_kakunin').val(),
                findBiko: $('#fdr_biko').val(),
                findDevelop: $('#fds_develop').val(),
            },
            'trouble' : {
                findSystem: $('#fdt_system').val(),
                findKadoJyokyo: $('#fdt_kado_jyokyo').val(),
                findHasseiDate: $('#fdt_hassei').val(),
                findStatus: $('#fdt_status').val(),
                findKihyo: $('#fdt_kihyo').val(),
                findLevel: $('#fdt_level').val(),
                findNaiyo: $('#fdt_naiyo').val(),
                findTaioDate: $('#fdt_taio_date').val(),
                findTaio: $('#fdt_taio').val(),
                findHokoku: $('#fdt_hokoku').val(),
                findBiko: $('#fdt_biko').val(),
                findDevelop: $('#fds_develop').val(),
            },
            'sagyo' : {
                findSystem: $('#fdw_system').val(),
                findKadoJyokyo: $('#fdw_kado_jyokyo').val(),
                findSagyoDate: $('#fdw_sagyo').val(),
                findTanto: $('#fdw_tanto').val(),
                findNaiyo: $('#fdw_naiyo').val(),
                findKakunin: $('#fdw_kakunin').val(),
                findBiko: $('#fdw_biko').val(),
            },
            'server' : {
                findHostName: $('#fdv_host_name').val(),
                findEnvType: $('#fdv_env_type').val(),
                findSvPlace: $('#fdv_sv_place').val(),
                findGaiyo: $('#fdv_gaiyo').val(),
                findKadoJyokyo: $('#fdv_kado_jyokyo').val(),
                findOS: $('#fdv_os').val(),
                findRole: $('#fdv_role').val(),
                findDB: $('#fdv_db').val(),
                findIPAdrs: $('#fdv_ip_adrs').val(),
                findKanri: $('#fdv_kanri').val(),
                // findBiko: $('#fdv_biko').val(),
            },
            'mente' : {
                findHostName: $('#fdm_host_name').val(),
                findKadoJyokyo: $('#fdm_kado_jyokyo').val(),
                findStartDate: $('#fdm_start_date').val(),
                findEndDate: $('#fdm_end_date').val(),
                findTanto: $('#fdm_tanto').val(),
                findKekka: $('#fdm_kekka').val(),
                findNaiyo: $('#fdm_naiyo').val(),
                findBiko: $('#fdm_biko').val(),
            },
            'strouble' : {
                findHostName: $('#fdx_host_name').val(),
                findKadoJyokyo: $('#fdx_kado_jyokyo').val(),
                findHasseiDate: $('#fdx_hassei').val(),
                findStatus: $('#fdx_status').val(),
                findKihyo: $('#fdx_kihyo').val(),
                findLevel: $('#fdx_level').val(),
                findNaiyo: $('#fdx_naiyo').val(),
                findTaioDate: $('#fdx_taio_date').val(),
                findTaio: $('#fdx_taio').val(),
                findHokoku: $('#fdx_hokoku').val(),
                findBiko: $('#fdx_biko').val(),
            }
        }[type];
    }
	function updateFilter() {
		dataView[frame_type].setFilterArgs(filterArgs(frame_type));
		dataView[frame_type].refresh();
	}
    function formReset(form_name) {
        $('#'+form_name+'_form')[0].reset();
        $('#'+form_name+'_form input[type="hidden"').val('');
    }

    $('#fs_dev_busho,#fds_develop,#fv_kanri_busho').autocomplete({
        source: busholist,
        minLength: 0,
        select: function (e, ui) {
            // テキストエリアで複数行選択入力に対応
            let sv = $(this).val().split('\n');
            let pos = 0;
            let i;
            for (i=0; i<sv.length; i++) {
                pos += sv[i].length;
                if (pos >= $(this)[0].selectionStart) {
                    sv[i] = ui.item.label;
                    break;
                }
                pos++;
            }
            if (i === sv.length) {
                sv[i-1] = ui.item.label;
            }
            $(this).val(sv.join('\n')).change();
            return false;
        }
    }).click(function () {
        $(this).autocomplete('search', '');
    });
    $('.form_date').datepicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        showButtonPanel: true,
        onClose: function (e) {
            $(this).datepicker('refresh');
        }
    });

    $('#fs_dev_tanto,#fr_tanto,#fr_kakunin,#ft_kihyo,#ft_taio,#fv_kanri_tanto,#fm_tanto,#fx_kihyo,#fx_taio,#fw_tanto,#fw_kakunin').autocomplete({
        source: syozokulist,
        minLength: 0,
        select: function (e, ui) {
            // テキストエリアで複数行選択入力に対応
            let sv = $(this).val().split('\n');
            let pos = 0;
            let i;
            for (i=0; i<sv.length; i++) {
                pos += sv[i].length;
                if (pos >= $(this)[0].selectionStart) {
                    sv[i] = ui.item.label;
                    break;
                }
                pos++;
            }
            if (i === sv.length) {
                sv[i-1] = ui.item.label;
            }
            $(this).val(sv.join('\n')).change();
            return false;
        }
    }).click(function () {
        $(this).autocomplete('search', '');
    });
    // ---------------------------------------------------------------------------------------------------------------------------
    // オリジナル複数行選択リスト
    // ---------------------------------------------------------------------------------------------------------------------------
    $.fn.mulitiSelect = function(options) {
        var settings = $.extend({
            value: [],
            label: [],
            maxcnt: 3,
            mincnt: 1
        }, options);
        var $this = this;
        $this.empty();
        var i = 0;
        if (settings.value.length !== 0) {
            for (i=0; i<settings.value.length; i++) {
                $this.append('<div class="msel_item" data-val="'+settings.value[i]+'">'+settings.label[settings.value[i]]+'</div><div class="msel_item_del">✕</div>');
            }
        }
        if (settings.value.length < settings.maxcnt) {
            for (var j=i+1; j<settings.mincnt; j++) {
                $this.append('<div class="msel_item"></div><div class="msel_item_del">✕</div>');
            }
            $this.append('<div class="msel_item"></div><div class="msel_item_del">✕</div>');
        }
        function addEvent() {
            $this.children('.msel_item').autocomplete({
                source: settings.source,
                minLength: 0,
                select: function (e, ui) {
                    var addok = true;
                    var chk = $(this);
                    $this.children('.msel_item').each(function(i) {
                        if (chk.is($(this)) === false && $(this).text() === '') {
                            addok = false;
                            return true;
                        }
                    });
                    if (addok && $this.children('.msel_item').length < settings.maxcnt) {
                        $this.append('<div class="msel_item"></div><div class="msel_item_del">✕</div>');
                        addEvent();
                    }
                    $(this).text(ui.item.label).data('val',ui.item.value);
                    $this.children('.msel_item').eq(0).change();
                    return false;
                }
            }).click(function () {
                $(this).autocomplete('search', '');
            });
            $this.children('.msel_item_del').on('click',function() {
                $(this).prev().remove();
                $(this).remove();
                if ($this.children('.msel_item').length === 0 || $this.children('.msel_item').last().text() !== '') {
                    $this.append('<div class="msel_item"></div><div class="msel_item_del">✕</div>');
                    addEvent();
                }
                $this.children('.msel_item').eq(0).change();
                return false;
            });
        }
        addEvent();
    };
    // ---------------------------------------------------------------------------------------------------------------------------
    // オリジナル複数行テキスト
    // ---------------------------------------------------------------------------------------------------------------------------
    $.fn.mulitiText = function(options) {
        var settings = $.extend({
            value: '',
            maxcnt: 3
        }, options);
        var $this = this;
        $this.empty();
        if (settings.value !== '') {
            settings.value.split('\n').forEach(function(val,i) {
                $this.append('<input class="mtxt_item" value="'+val+'"><div class="mtxt_item_del">✕</div>');
            });
        }
        if ($this.children('.mtxt_item').length < settings.maxcnt) {
            $this.append('<input class="mtxt_item"><div class="mtxt_item_del">✕</div>');
        }
        function addEvent() {
            $this.children('.mtxt_item').on('keyup',function(e) {
                var ix = $this.children('.mtxt_item').index($(this));
                if (e.keyCode === 13 && $(this).val() !== '' && $this.children('.mtxt_item').length < settings.maxcnt) {
                    $this.append('<input class="mtxt_item"><div class="mtxt_item_del">✕</div>');
                    $this.children('.mtxt_item').last().focus();
                    addEvent();
                } else if (e.keyCode === 40 && $this.children('.mtxt_item').length-1 > ix) {
                    $this.children('.mtxt_item').eq(ix+1).focus();
                } else if (e.keyCode === 38 && ix > 0) {
                    $this.children('.mtxt_item').eq(ix-1).focus();
                }
            });
            $this.children('.mtxt_item_del').on('click',function() {
                var ix = $this.children('.mtxt_item_del').index($(this));
                $(this).prev().remove();
                $(this).remove();
                if ($this.children('.mtxt_item').length === 0 || $this.children('.mtxt_item').last().val() !== '') {
                    $this.append('<input class="mtxt_item"><div class="mtxt_item_del">✕</div>');
                    addEvent();
                }
                if ($this.children('.mtxt_item').length < ix) {
                    $this.children('.mtxt_item').last().focus();
                } else {
                    $this.children('.mtxt_item').eq(ix).focus();
                }
                $this.children('.mtxt_item').eq(0).change();
            });
        }
        addEvent();
    };
    // ---------------------------------------------------------------------------------------------------------------------------
    // 各マスター画面処理
    // ---------------------------------------------------------------------------------------------------------------------------
    // マスター関連ダイアログ初期化
    grid['master1'] = new Slick.Grid('#master1_grid', master_data, master1_columns, options);
    grid['master2'] = new Slick.Grid('#master2_grid', master_data, master2_columns, options);
    grid['master1'].setSelectionModel(new Slick.RowSelectionModel());
    grid['master2'].setSelectionModel(new Slick.RowSelectionModel());
    $('#master_form').dialog({
		autoOpen: false,
		width: 495,
		modal: true,
        resizable: false,
        open: function() {
            editflg = false;
            grid[master].setOptions({editable: true, enableAddRow: true});
        },
        beforeClose: function() {
            focus_blur(master);
            if (editflg) {
                // $.confirmが非同期処理の為、return falseで一旦Closeを破棄し
                // はいがクリックされたら編集フラグを0にしフォームを再度Closeする（ややこしい・・・）
                $.confirm('登録されていませんがよろしいですか？').done(function() {
                    editflg = false;
                    $('#master_form').dialog('close');
                });
                return false;
            }
            if (reloadflg) {
                $.confirm('マスターが変更されたので再読込を行います！').done(function() {
                    location.reload();
                });
            }
        },
        close: function() {
            $('#form_sort').prop('checked',false).button('refresh');
        },
        buttons: {
            '登録': function() {
                focus_blur(master);
                if (editflg) {
                    BlockScreen('登録中 ...');
                    var para = {
                        key: master_key,
                        data: grid[master].getData()
                    }
                    Ajax('devasstes.php?func=masterReg',para).done(function(ret) {
                        if (ret.code === 'OK') {
                            $.alert('登録しました');
                            clearMessage();
                            editflg = false;
                            reloadflg = true;
                        } else {
                            $.alert('登録エラー');
                        }
                    }).fail(function(ret) {
                        $.alert('登録エラー');
                    }).always(function() {
                        UnBlockScreen();
                    });
                } else {
                    $.alert('変更箇所がありません');
                }
            },
            '閉じる': function() {
                $(this).dialog('close');
            },
        }
    });
    // 他マスター
    $('.master_form').click(function() {
        $this = $(this);
        master1_columns[2].options2 = [];
        if ($this.text() === 'ＤＢ設定') {
            master1_columns[2].options = db_opt;
        } else if ($this.text() === 'サーバ設定') {
            master1_columns[2].options = svr_opt;
        } else if ($this.text() === 'データベース名') {
            Ajax('devasstes.php?func=LoadDBList').done(function(ret) {
                let option = {};
                for (key in ret.data) {
                    option[ret.data[key].key] = ret.data[key].value;
                }
                master1_columns[2].options = option;
                master1_columns[2].options2 = ret.data;
            }).fail(function(ret) {
                $.alert('読込エラー');
            });
        }
        master = ($this.text() === 'サーバ設定' || $this.text() === 'ＤＢ設定' || $this.text() === 'データベース名') ? 'master1' : 'master2';
        $('#master1_grid').toggle((master === 'master1'));
        $('#master2_grid').toggle((master === 'master2'));

        $('#master_form').dialog('option','title',$(this).text());
        master_key = $(this).data('key');
        BlockScreen('読込中 ...');
        Ajax('devasstes.php?func=masterLoad',{key:master_key}).done(function(ret) {
            maxcd = ret.maxcd;
            grid[master].setData(ret.data);
            grid[master].render();
            $('#master_form').dialog('open');

            $('#'+master+'_grid .slick-column-name:eq(1)').text(master_head1[master_key]);
            if (master === 'master1') {
                $('#'+master+'_grid .slick-column-name:eq(2)').text(master_head2[master_key]);
            }
        }).fail(function(ret) {
            $.alert('読込エラー');
        }).always(function() {
            UnBlockScreen();
        });
    });
    // 編集済フラグOn
    grid['master1'].onCellChange.subscribe(function (e, args) {
        editflg = true;
    });
    grid['master2'].onCellChange.subscribe(function (e, args) {
        editflg = true;
    });
    // 新規行
    grid['master1'].onAddNewRow.subscribe(function (e, args) {
        return masterAddNewRow(args);
    });
    grid['master2'].onAddNewRow.subscribe(function (e, args) {
        return masterAddNewRow(args);
    });
    function masterAddNewRow(args) {
        master_data = grid[master].getData();
        if (args.item.nm1 === undefined) {
            setTimeout(function() {
                $('#'+master+'_grid slick-row').eq(master_data.length).children('.slick-cell.master_nm1').click();
            }, 10);
            return false;
        }
        maxcd++;
        var item = $.extend({},{code: maxcd, stop_flg: 0},args.item);
        grid[master].invalidateRow(master_data.length);
        master_data.push(item);
        grid[master].updateRowCount();
        grid[master].render();
        editflg = true;
        return true;
    }
    // 並び替えボタンを追加
    $('#master_form').next().prepend('<input type="checkbox" id="form_sort">'+
                        '<label for="form_sort" title="ドラッグによる並び替えを行います">並び替え</label>');
    $('#form_sort').button();
    // 並び替えボタンクリック
    $('#form_sort').change(function() {
        grid[master].setOptions({editable: ($(this).prop('checked') === false)});
        var behavior = ($(this).prop('checked') ? 'selectAndMove' : null);
        if (master === 'master1') {
            for (var i=0; i<master1_columns.length; i++) {
                master1_columns[i].behavior = behavior;
            }
        } else {
            for (var i=0; i<master2_columns.length; i++) {
                master2_columns[i].behavior = behavior;
            }
        }
    });
    // 並び替え
    var moveRowsPlugin1 = new Slick.RowMoveManager();
    var moveRowsPlugin2 = new Slick.RowMoveManager();
    grid['master1'].registerPlugin(moveRowsPlugin1);
    grid['master2'].registerPlugin(moveRowsPlugin2);

    moveRowsPlugin1.onMoveRows.subscribe(function (e, args) {
        moveRows(args);
    });
    moveRowsPlugin2.onMoveRows.subscribe(function (e, args) {
        moveRows(args);
    });
    function moveRows(args) {
        var data = grid[master].getData();
        var extractedRows = [], left, right;
        var rows = args.rows;
        var insertBefore = args.insertBefore;
        left = data.slice(0, insertBefore);
        right = data.slice(insertBefore, data.length);

        rows.sort(function(a,b) { return a-b; });

        for (var i = 0; i < rows.length; i++) {
            extractedRows.push(data[rows[i]]);
        }
        rows.reverse();

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row < insertBefore) {
                left.splice(row, 1);
            } else {
                right.splice(row - insertBefore, 1);
            }
        }
        data = left.concat(extractedRows.concat(right));

        var selectedRows = [];
        for (var i = 0; i < rows.length; i++) {
            selectedRows.push(left.length + i);
        }
        grid[master].resetActiveCell();
        grid[master].setData(data);
        grid[master].setSelectedRows(selectedRows);
        grid[master].render();
        editflg = true;
    }
    // ---------------------------------------------------------------------------------------------------------------------------
    // 管理者設定
    // ---------------------------------------------------------------------------------------------------------------------------
    admin_grid = new Slick.Grid('#admin_grid', admin_data, admin_columns, options);
    $('#admin_form').dialog({
		autoOpen: false,
		width: 440,
		modal: true,
        resizable: false,
        open: function() {
            admin_grid.setOptions({editable: true, enableAddRow: true});
        },
        buttons: {
            '閉じる': function() {
                $(this).dialog('close');
            },
        }
    });
    $('#reg_admin').click(function() {
        Ajax('devasstes.php?func=adminLoad').done(function(ret) {
            admin_grid.setData(ret.admin);
            admin_grid.render();
            $('#admin_form').dialog('open');
        }).fail(function(ret) {
            $.alert('読込エラー');
        });
    });
    // 新規行
    admin_grid.onAddNewRow.subscribe(function (e, args) {
        Ajax('devasstes.php?func=adminChk',{syaincd:args.item.admincd}).done(function(ret) {
            if (ret.code === 'OK') {
                admin_data = admin_grid.getData();
                args.item.adminnm =  ret.adminnm;
                var item = $.extend({}, args.item);
                admin_data.push(item);
                admin_grid.invalidateRow(admin_data.length - 1);
                admin_grid.render();
            }
        }).fail(function(ret) {
            $.alert('登録エラー');
        });
    });
    // 新規行以外は入力不可にする
    admin_grid.onBeforeEditCell.subscribe(function (e, args) {
        if (args.item) {
            return false;
        }
    });
    // 削除クリック
    admin_grid.onClick.subscribe(function (e, args) {
        if (admin_columns[args.cell].id === 'delete') {
            admin_data = admin_grid.getData();
            if (admin_data.length === 1) {
                $.alert('管理者は最低１人は必要です。登録後に削除して下さい');
                return;
            }
            $.confirm('削除します。よろしいですか？').done(function() {
                Ajax('devasstes.php?func=adminDel',{syaincd:admin_data[args.row].admincd}).done(function(ret) {
                    if (ret.code === 'OK') {
                        admin_data.splice(args.row, 1);
                        admin_grid.invalidate();
                    }
                }).fail(function(ret) {
                    $.alert('削除エラー');
                });
            });
        }
    });
    // ---------------------------------------------------------------------------------------------------------------------------
    // 他共通関数
    // ---------------------------------------------------------------------------------------------------------------------------
    // 強制的にフォーカスを外し、CellChangeイベントを発生させる
    function focus_blur(grid_name) {
        if ($('#'+grid_name+'_grid .editor-checkbox').length > 0 || $('#'+grid_name+'_grid .editor-text').length > 0
        || $('.slick-large-editor-text').length > 0 || $('.editor-mselect').length > 0) {
            grid[grid_name].navigateRowStart();
        }
    }
    // セッション切れ防止
    // setInterval(function() {
    //     Ajax('devasstes.php?func=sessioncheck');
    // }, 1200000);
    // ---------------------------------------------------------------------------------------------------------------------------
    // ファイルアップロード関連
    // ---------------------------------------------------------------------------------------------------------------------------
	// ファイルアップロード時、ボディーで受け取らないよう制御する
	$('body').on('dragover', function(e){
		if (e.target.className !== 'upload_area') {
			e.stopPropagation();
			e.preventDefault();
		}
	});
	// ドラッグ中（ドラッグ対象）
	$(document).on('dragover','.upload_area', function(e){
		e.stopPropagation();
		e.preventDefault();
		if ($(this).css('background-color') === 'rgb(200, 230, 255)') {
			return;
		}
		$(this).css('background-color','rgb(200, 255, 230)');
	});
	// ドラッグ中（ドラッグ外れ）
	$(document).on('dragleave','.upload_area', function(e){
		if ($(this).css('background-color') === 'rgb(200, 230, 255)') {
			return;
		}
		$(this).css('background-color','');
	});
    var svobj;
	// ドラッグアップロード
	$(document).on('drop','.upload_area', function(e){
		e.stopPropagation();
		e.preventDefault();
        svobj = $(this);
        if (svobj.data('upload') !== undefined) {
            if ((svobj.data('upload') === 'system' && $('#fs_sys_key').val() === '新規')
             || (svobj.data('upload') === 'server' && $('#fv_svr_key').val() === '新規')
             || (svobj.data('upload') === 'trouble' && $('#ft_trouble_no').val() === '新規')
             || (svobj.data('upload') === 'strouble' && $('#fx_trouble_no').val() === '新規')) {
                $(this).css('background-color','');
                $.alert('登録後にファイルアップロードして下さい');
                return;
            }
            $('#doc_upload').data('upload',$(this).data('upload'));
        }
        var files = e.originalEvent.dataTransfer.files;
		// UPLOADファイル、ドラッグ時の保存
		multifileUpload(files,$(this).data('upload')).done(function(ret) {
            clearteFileList(ret.filename);
		}).fail(function(ret) {
			$.alert(ret.msg,600);
        })
        $(this).css('background-color','');
	});
    // ファイル追加ボタンクリック
    $(document).on('click','.temp_file_add',function(e) {
        svobj = $(this).parent();
        if (svobj.data('upload') !== undefined) {
            if ((svobj.data('upload') === 'system' && $('#fs_sys_key').val() === '新規')
             || (svobj.data('upload') === 'server' && $('#fv_svr_key').val() === '新規')
             || (svobj.data('upload') === 'trouble' && $('#ft_trouble_no').val() === '新規')
             || (svobj.data('upload') === 'strouble' && $('#fx_trouble_no').val() === '新規')) {
                $.alert('登録後にファイルアップロードして下さい');
                return;
            }
            $('#doc_upload').data('upload',svobj.data('upload')).click();
        }
    });
	$('#doc_upload').change(function() {
        if ($(this).prop('files').length > 0) {
            multifileUpload($(this).prop('files'),$(this).data('upload')).done(function(ret) {
                clearteFileList(ret.filename);
            }).fail(function(ret) {
                $.alert(ret.msg,600);
            }).always(function() {
                $('#doc_upload').val('');
            });
        }
    });
    function clearteFileList(filename) {
        showMessage('アップロード完了しました','#0000ff');
        if (svobj.children('.temp_file_msg').length === 1) {
            svobj.children('.temp_file_msg').remove();
        }
        for (let i=0; i<filename.length; i++) {
            if (svobj.find('A:contains('+filename[i]+')').length === 0) {
                svobj.append('<div><a href="'+filename[i]+'">'+filename[i]+'</a><span class="tmp_delete">✖</span></div>');
            }
        }
        updateDataViewFiles(svobj.data('upload'));
    }
	// マルチファイルアップロード
	function multifileUpload(files,upload_type) {
		let dfd = $.Deferred();
		let svret = {msg:'',filename:[]};
        let errcnt = 0;
        let cnt = 0;
        for (var i=0; i<files.length; i++) {
            if ((files[i].size / 1024 / 1024) > 20) {
                svret.msg += 'サイズが20MBを超えている為、アップロードできません！<br>'+files[i].name+'<br>';
                errcnt++;
            } else if (KKC_Check(files[i].name) === false) {
                svret.msg += 'この種類のファイルはアップロードできません！<br>'+files[i].name+'<br>';
                errcnt++;
			} else {
                fileUpload(files[i],upload_type).done(function(ret) {
                    svret.filename.push(ret.filename);
                    cnt++;
                }).fail(function(ret) {
                    svret.msg += 'アップロードエラー！<br>'+ret.filename+'<br>';
                    errcnt++;
                });
            }
		}
        // アップロード終了待ち
        timer = setInterval(function() {
            if (errcnt+cnt === files.length) {
                clearInterval(timer);
                if (errcnt > 0) {
                    dfd.reject(svret);
                } else {
                    dfd.resolve(svret);
                }
            }
        }, 200);
		return dfd.promise();
	}
	// ファイルアップロード処理
	function fileUpload(upfile,upload_type) {
        $key = {
            'system':$('#fs_sys_key').val(),
            'server':$('#fv_svr_key').val(),
            'trouble':parseInt($('#ft_trouble_no').val().replace('T','')),
            'strouble':parseInt($('#fx_trouble_no').val().replace('X',''))};
		let dfd = $.Deferred();
		let data = new FormData();
		data.append('file', upfile);
		data.append('upload_type', upload_type);
        data.append('key', $key[upload_type]);
		$.ajax({
			url: 'devasstes.php?func=FileUpload',
			type: 'POST',
			data: data,
			cache: false,
			dataType: 'json',
			contentType: false,
			processData: false
		})
		.done(function(ret) {
			if (ret.code == 'OK') {
				dfd.resolve(ret);
			} else {
				dfd.reject(ret);
			}
		})
		.fail(function(jqXHR, textStatus, errorThrown){
			dfd.reject({code: 'ERROR', msg: jqXHR.responseText});
		});
		return dfd.promise();
	}
    function KKC_Check(filename) {
        let p = filename.lastIndexOf('.');
        if (p === -1) return false;
        let chk = ['xls','xlsx','xlsm','doc','docx','ppt','pptx','zip','jpg','jpeg','gif','png','pdf','csv','txt']
        let kkc = filename.substring(p+1).toLowerCase();
		if (chk.indexOf(kkc) === -1) {
			return false;
		}
        return true;
    }
    // 添付ファイルクリック（ファイルダウンロード）
    $(document).on('click','.upload_area a',function(e) {
        let filename = $(this).text();
        var key = {
            'system':$('#fs_sys_key').val(),
            'trouble':parseInt($('#ft_trouble_no').val().replace('T','')),
            'server':$('#fv_svr_key').val(),
            'strouble':parseInt($('#fx_trouble_no').val().replace('X',''))};
        var url = 'devasstes.php?func=FileDownload&file_type='+$(this).parents('.upload_area').data('upload')+
                '&key='+(key[$(this).parents('.upload_area').data('upload')])+
                '&filename='+encodeURIComponent(filename);
        // やり方はここを参照＝＞ https://warpbutton.com/blog/tips/739/
        $('<form/>',{action:url, method:'post'})
                .appendTo(document.body)
                .submit()
                .remove();
        return false;
    });
    // 添付ファイル削除クリック
    $(document).on('click','.tmp_delete',function(e) {
        var key = {
            'system':$('#fs_sys_key').val(),
            'trouble':parseInt($('#ft_trouble_no').val().replace('T','')),
            'server':$('#fv_svr_key').val(),
            'strouble':parseInt($('#fx_trouble_no').val().replace('X',''))
        };
        let $this = $(this);
        let filename = $this.prev().text()
        $.confirm(filename+'を削除します。よろしいですか？').done(function() {
            let para = {
                file_type: $this.parents('.upload_area').data('upload'),
                key: key[$this.parents('.upload_area').data('upload')],
                filename: filename
            }
            Ajax('devasstes.php?func=FileDelete',para).done(function(ret) {
                if (ret.code === 'OK') {
                    $this.parent().remove();
                    showMessage('添付ファイルを削除しました','#0000ff');
                    updateDataViewFiles(para.file_type);
                } else {
                    $.alert('ファイル削除エラー');
                }
            }).fail(function(ret) {
                $.alert('ファイル削除エラー');
            })
        });
    });
    function updateDataViewFiles(formtype) {
        if ($('#'+formtype).is(':visible')) {
            let row = grid[formtype].getSelectedRows();
            let item = grid[formtype].getDataItem(row);
            let temp_file = [];
            $('#'+formtype+'_form .upload_area a').each(function() {
                temp_file.push($(this).text());
            });
            item.temp_file = temp_file.length === 0 ? null : temp_file.join('\n');
            dataView[formtype].updateItem(item.id, item);
            grid[formtype].render();
        }
    }
    $(document).on('click','.linkitem, .ipadrs',function() {
        if ($('#'+frame_type+'_edit').text() === '保存') {
            return false;
        }
    });
});
// メッセージ表示関数
var msgid = '#msg';
var msghd;
function showMessage(msg,color,alert) {
    if (!alert && $(msgid).data('alert')) return;
    if (msghd != null) clearMessage();
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
function showMessage2(obj,msg,color,chosei) {
    var chosei = typeof chosei !== 'undefined' ? chosei : 0;
    if (obj.length === 0) return;
    if (msghd != null) clearMessage();
    setTimeout(function() {
        if (obj.is(':focus') === false) {
            obj.focus();
        }
        let pos = obj.offset();
        $("#alert_msg").css({'color':color,'top':pos.top+obj.height()+15+chosei,'left':pos.left}).text(msg).show();
        msghd = setTimeout(function() {
            $("#alert_msg").hide();
            msghd = null;
        },5000);
    },1);
}
// メッセージクリア
function clearMessage() {
    if (msghd != null) {
        $("#alert_msg").hide();
        clearTimeout(msghd);
    }
    $(msgid).text('');
    $(msgid).data('alert',false);
    msghd = null;
}
// 時刻チェック
function isTime(str) {
    return str.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/) !== null;
};