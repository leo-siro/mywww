
// Main System Setting
var kado_jyokyo_opt = {
    1: '稼働中',
    9: '停止'
};
var dev_kbn_opt = {
    1: '内製',
    2: '外注'
}
var mnt_kekka_opt = {
	0: '',
    1: '中断',
    2: '継続',
    9: '完了'
};
var mnt_time = ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
var trbl_status_opt = {
	0: '',
    1: '検討中',
    2: '対応中',
    9: '完了'
};
var trbl_level_opt = {
	0: '',
    1: '小',
    2: '中',
    3: '大'
};
var devenv_opt = {0: ''};
var devlang_opt = {0: ''};
var devrole_opt = {0: ''};
var devserver_opt = {};
var devdb_opt = {};

var columns = {
    'system' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'id', name: 'No.', field: 'id', width: 42, headerCssClass: 'center', cssClass: 'center', sortable: true},
        {id: 'system_name', name: 'システム名', field: 'system_name', width: 200, editor: Slick.Editors.Text, headerCssClass: 'center', validator: spaceCheck},
        {id: 'gaiyo', name: '概要', field: 'gaiyo', width: 200, editor: Slick.Editors.LongText, headerCssClass: 'center'},
        {id: 'kado_jyokyo', name: '稼働状況', field: 'kado_jyokyo', width: 80, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: kado_jyokyo_opt, headerCssClass: 'center', cssClass: 'center'},
        {id: 'dev_kbn', name: '開発区分', field: 'dev_kbn', width: 80, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: dev_kbn_opt, headerCssClass: 'center', cssClass: 'center'},
        {id: 'dev_busho', name: '情シス担当部署', field: 'dev_busho', width: 150, editor: Slick.Editors.LongText, headerCssClass: 'center'},
        {id: 'dev_tanto', name: '情シス担当者', field: 'dev_tanto', width: 150, editor: Slick.Editors.LongText, headerCssClass: 'center'},
        {id: 'unyo_busho', name: '運用部署', field: 'unyo_busho', width: 150, editor: Slick.Editors.LongText, headerCssClass: 'center'},
        {id: 'unyo_tanto', name: '運用担当', field: 'unyo_tanto', width: 150, editor: Slick.Editors.LongText, headerCssClass: 'center'},
        {id: 'dev_env', name: '開発環境', field: 'dev_env', width: 150, headerCssClass: 'center', editor: Extends.Editors.MultiSelect, formatter: Extends.Formatters.MultiSelect, options: devenv_opt},
        {id: 'dev_lang', name: '開発言語', field: 'dev_lang', width: 120, headerCssClass: 'center', editor: Extends.Editors.MultiSelect, formatter: Extends.Formatters.MultiSelect, options: devlang_opt},
        {id: 'save_folder', name: '格納フォルダ', field: 'save_folder', width: 150, editor: Slick.Editors.Text, headerCssClass: 'center'},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 200, headerCssClass: 'center'},
    ],
    'sys_svr' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'no', name: 'No.', field: 'no', width: 42, headerCssClass: 'center', cssClass: 'center', sortable: true},
        {id: 'svr_key', name: 'ホスト名', field: 'svr_key', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: {}, width: 130, headerCssClass: 'center'},
        {id: 'role_name', name: '役割', field: 'role_name', width: 120, headerCssClass: 'center'},
        {id: 'db_type_name', name: 'ＤＢ', field: 'db_type_name', width: 120, headerCssClass: 'center'},
        {id: 'biko', name: 'メモ', field: 'biko', editor: Slick.Editors.LongText, width: 200, headerCssClass: 'center'},
        {id: 'delete', name: '削除', field: '', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'center delete',
            formatter: function () { return '✖'; }},
    ],
    'sys_rel' : [
        {id: 'detail', name: '', field: '', width: 42, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},        
        {id: 'release_no', name: 'リリースNo', field: 'release_no', width: 84, headerCssClass: 'center', cssClass: 'center', sortable: true},
        {id: 'release_date', name: 'リリース日', field: 'release_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center', validator: dateCheck2},
        {id: 'tanto', name: 'リリース担当', field: 'tanto', editor: Slick.Editors.AutoComp, width: 110, headerCssClass: 'center', options: syozokulist},
        {id: 'version', name: 'バージョン', field: 'version', editor: Slick.Editors.Text, width: 100, headerCssClass: 'center'},
        {id: 'system_no', name: '案件番号', field: 'system_no', editor: Slick.Editors.Text, width: 110, headerCssClass: 'center', cssClass: 'center', validator: systemNoCheck},
        {id: 'naiyo', name: '修正内容', field: 'naiyo', editor: Slick.Editors.LongText, width: 160, headerCssClass: 'center'},
        {id: 'kakunin', name: '確認者', field: 'kakunin', editor: Slick.Editors.AutoComp, width: 110, headerCssClass: 'center', options: syozokulist},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'delete', name: '削除', field: '', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'center delete',
            formatter: function () { return '✖'; }},
    ],    
    'sys_trbl' : [
        {id: 'detail', name: '', field: '', width: 42, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},        
        {id: 'trouble_no', name: 'トラブルNo', field: 'trouble_no', width: 84, headerCssClass: 'center', cssClass: 'center', sortable: true},
        {id: 'hassei_date', name: '発生日', field: 'hassei_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center', validator: dateCheck2},
        {id: 'status', name: '状態', field: 'status', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: trbl_status_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'kihyo', name: '起票者', field: 'kihyo', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'level', name: 'レベル', field: 'level', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: trbl_level_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'naiyo', name: '不具合事象', field: 'naiyo', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'taio_date', name: '対応日', field: 'taio_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center', validator: dateCheck},
        {id: 'taio', name: '対応者', field: 'taio', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'hokoku', name: '報告先', field: 'hokoku', editor: Slick.Editors.LongText, width: 100, headerCssClass: 'center'},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 120, headerCssClass: 'center'},
        {id: 'delete', name: '削除', field: '', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'center delete',
            formatter: function () { return '✖'; }},
    ],
    'release' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},        
        {id: 'release_no', name: 'リリースNo', field: 'release_no', width: 90, headerCssClass: 'center', cssClass: 'center', sortable: true},
        {id: 'system_name', name: 'システム名', field: 'system_name', width: 200, headerCssClass: 'center'},        
        {id: 'release_date', name: 'リリース日', field: 'release_date', editor: Slick.Editors.Date, width: 100, headerCssClass: 'center', cssClass: 'center', validator: dateCheck2},
        {id: 'tanto', name: 'リリース担当', field: 'tanto', editor: Slick.Editors.AutoComp, width: 120, headerCssClass: 'center', options: syozokulist},
        {id: 'version', name: 'バージョン', field: 'version', editor: Slick.Editors.Text, width: 100, headerCssClass: 'center'},
        {id: 'system_no', name: '案件番号', field: 'system_no', editor: Slick.Editors.Text, width: 110, headerCssClass: 'center', cssClass: 'center', validator: systemNoCheck},
        {id: 'naiyo', name: '修正内容', field: 'naiyo', editor: Slick.Editors.LongText, width: 400, headerCssClass: 'center'},
        {id: 'kakunin', name: '確認者', field: 'kakunin', editor: Slick.Editors.AutoComp, width: 120, headerCssClass: 'center', options: syozokulist},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 200, headerCssClass: 'center'}
    ],    
    'trouble' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},        
        {id: 'trouble_no', name: 'トラブルNo', field: 'trouble_no', width: 90, headerCssClass: 'center', cssClass: 'center', sortable: true},
        {id: 'system_name', name: 'システム名', field: 'system_name', width: 200, headerCssClass: 'center'},        
        {id: 'hassei_date', name: '発生日', field: 'hassei_date', editor: Slick.Editors.Date, width: 100, headerCssClass: 'center', cssClass: 'center', validator: dateCheck2},
        {id: 'status', name: '状態', field: 'status', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: trbl_status_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'kihyo', name: '起票者', field: 'kihyo', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'level', name: 'レベル', field: 'level', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: trbl_level_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'naiyo', name: '不具合事象', field: 'naiyo', editor: Slick.Editors.LongText, width: 400, headerCssClass: 'center'},
        {id: 'taio_date', name: '対応日', field: 'taio_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center', validator: dateCheck},
        {id: 'taio', name: '対応者', field: 'taio', editor: Slick.Editors.AutoComp, width: 120, headerCssClass: 'center', options: syozokulist},
        {id: 'hokoku', name: '報告先', field: 'hokoku', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'}
    ],
    'server' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'id', name: 'No.', field: 'id', width: 42, headerCssClass: 'center', cssClass: 'center', sortable: true},
        {id: 'host_name', name: 'ホスト名', field: 'host_name', editor: Slick.Editors.Text, width: 120, headerCssClass: 'center', validator: spaceCheck},
        {id: 'other_name', name: '別名', field: 'other_name', editor: Slick.Editors.LongText, width: 100, headerCssClass: 'center'},
        {id: 'gaiyo', name: '概要', field: 'gaiyo', editor: Slick.Editors.LongText, width: 200, headerCssClass: 'center'},
        {id: 'kado_jyokyo', name: '稼働状況', field: 'kado_jyokyo', width: 80, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: kado_jyokyo_opt, headerCssClass: 'center', cssClass: 'center'},
        {id: 'os', name: 'ＯＳ', field: 'os', width: 200,editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: devserver_opt, headerCssClass: 'center'},
        {id: 'role', name: '役割', field: 'role', width: 100, headerCssClass: 'center', editor: Extends.Editors.MultiSelect, formatter: Extends.Formatters.MultiSelect, options: devrole_opt},
        {id: 'db_type', name: 'ＤＢ', field: 'db_type', width: 100, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: devdb_opt, headerCssClass: 'center'},
        {id: 'ip_adrs', name: 'IPアドレス', field: 'ip_adrs', editor: Slick.Editors.LongText, width: 120, headerCssClass: 'center', cssClass: 'center', validator: ipadrsCheck},
        {id: 'kanri_busho', name: '管理部署', field: 'kanri_busho', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'kanri_tanto', name: '管理者', field: 'kanri_tanto', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 200, headerCssClass: 'center'},
    ],
    'svr_sys' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},
        {id: 'no', name: 'No.', field: 'no', width: 42, headerCssClass: 'center', cssClass: 'center', sortable: true},
        {id: 'system_name', name: 'システム名', field: 'system_name', width: 180, headerCssClass: 'center'},
        {id: 'kado_jyokyo', name: '稼働状況', field: 'kado_jyokyo', width: 80, headerCssClass: 'center', cssClass: 'center'},
        {id: 'dev_busho', name: '開発部署', field: 'dev_busho', width: 150, editor: Slick.Editors.LongText, headerCssClass: 'center'},
        {id: 'dev_tanto', name: '開発担当', field: 'dev_tanto', width: 150, editor: Slick.Editors.LongText, headerCssClass: 'center'},
        {id: 'unyo_busho', name: '運用部署', field: 'unyo_busho', width: 150, headerCssClass: 'center'},
        {id: 'unyo_tanto', name: '運用管理者', field: 'unyo_tanto', width: 150, headerCssClass: 'center'}
    ],
    'svr_mnt' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},        
        {id: 'mente_no', name: 'メンテNo', field: 'mente_no', width: 84, headerCssClass: 'center', cssClass: 'center', sortable: true},
        {id: 'start_date', name: '開始日', field: 'start_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center', validator: dateCheck},
        {id: 'start_time', name: '時間', field: 'start_time', editor: Slick.Editors.AutoComp, width: 70, headerCssClass: 'center', cssClass: 'center', options: mnt_time, validator: timeCheck},
        {id: 'end_date', name: '終了日', field: 'end_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center', validator: dateCheck},
        {id: 'end_time', name: '時間', field: 'end_time', editor: Slick.Editors.AutoComp, width: 70, headerCssClass: 'center', cssClass: 'center', options: mnt_time, validator: timeCheck},
        {id: 'tanto', name: '担当者', field: 'tanto', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'kekka', name: '結果', field: 'kekka', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: mnt_kekka_opt, width: 80, headerCssClass: 'center', cssClass: 'center'},
        {id: 'naiyo', name: '作業内容', field: 'naiyo', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 100, headerCssClass: 'center'},
        {id: 'delete', name: '削除', field: '', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'center delete',
            formatter: function () { return '✖'; }},
    ],
    'svr_trbl' : [
        {id: 'detail', name: '', field: '', width: 42, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},        
        {id: 'trouble_no', name: 'トラブルNo', field: 'trouble_no', width: 84, headerCssClass: 'center', cssClass: 'center', sortable: true},
        {id: 'hassei_date', name: '発生日', field: 'hassei_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center', validator: dateCheck2},
        {id: 'status', name: '状態', field: 'status', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: trbl_status_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'kihyo', name: '起票者', field: 'kihyo', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'level', name: 'レベル', field: 'level', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: trbl_level_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'naiyo', name: '不具合事象', field: 'naiyo', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
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
        {id: 'mente_no', name: 'メンテNo', field: 'mente_no', width: 90, headerCssClass: 'center', cssClass: 'center', sortable: true},
        {id: 'host_name', name: 'ホスト名', field: 'host_name', width: 200, headerCssClass: 'center'},        
        {id: 'start_date', name: '開始日', field: 'start_date', editor: Slick.Editors.Date, width: 100, headerCssClass: 'center', cssClass: 'center', validator: dateCheck},
        {id: 'start_time', name: '開始時間', field: 'start_time', editor: Slick.Editors.AutoComp, width: 80, headerCssClass: 'center', cssClass: 'center', options: mnt_time, validator: timeCheck},
        {id: 'end_date', name: '終了日', field: 'end_date', editor: Slick.Editors.Date, width: 100, headerCssClass: 'center', cssClass: 'center', validator: dateCheck},
        {id: 'end_time', name: '終了時間', field: 'end_time', editor: Slick.Editors.AutoComp, width: 80, headerCssClass: 'center', cssClass: 'center', options: mnt_time, validator: timeCheck},
        {id: 'tanto', name: '担当者', field: 'tanto', editor: Slick.Editors.AutoComp, width: 120, headerCssClass: 'center', options: syozokulist},
        {id: 'kekka', name: '結果', field: 'kekka', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: mnt_kekka_opt, width: 80, headerCssClass: 'center', cssClass: 'center'},
        {id: 'naiyo', name: '作業内容', field: 'naiyo', editor: Slick.Editors.LongText, width: 400, headerCssClass: 'center'},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 200, headerCssClass: 'center'}
    ],
    'strouble' : [
        {id: 'detail', name: '', field: '', width: 47, headerCssClass: 'center', cssClass: 'center link_detail',
            formatter: function () { return '詳細'; }},        
        {id: 'trouble_no', name: 'トラブルNo', field: 'trouble_no', width: 90, headerCssClass: 'center', cssClass: 'center', sortable: true},
        {id: 'host_name', name: 'ホスト名', field: 'host_name', width: 200, headerCssClass: 'center'},        
        {id: 'hassei_date', name: '発生日', field: 'hassei_date', editor: Slick.Editors.Date, width: 100, headerCssClass: 'center', cssClass: 'center', validator: dateCheck2},
        {id: 'status', name: '状態', field: 'status', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: trbl_status_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'kihyo', name: '起票者', field: 'kihyo', editor: Slick.Editors.AutoComp, width: 100, headerCssClass: 'center', options: syozokulist},
        {id: 'level', name: 'レベル', field: 'level', editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: trbl_level_opt, width: 54, headerCssClass: 'center', cssClass: 'center'},
        {id: 'naiyo', name: '不具合事象', field: 'naiyo', editor: Slick.Editors.LongText, width: 400, headerCssClass: 'center'},
        {id: 'taio_date', name: '対応日', field: 'taio_date', editor: Slick.Editors.Date, width: 90, headerCssClass: 'center', cssClass: 'center', validator: dateCheck},
        {id: 'taio', name: '対応者', field: 'taio', editor: Slick.Editors.AutoComp, width: 120, headerCssClass: 'center', options: syozokulist},
        {id: 'hokoku', name: '報告先', field: 'hokoku', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'},
        {id: 'biko', name: '備考', field: 'biko', editor: Slick.Editors.LongText, width: 150, headerCssClass: 'center'}
    ],
}

var frame_type = 'system';
var grid = {};
var dataView = {};
var formWidth = {
    'system': {width:window.innerWidth - 60,height:window.innerHeight - 50}, 
    'release': {width: 800, height: 550}, 
    'trouble': {width: 800, height: 650}, 
    'server': {width:window.innerWidth - 100,height:window.innerHeight - 50},
    'mente': {width: 800, height: 550},
    'strouble': {width: 800, height: 650}
};
var server_list;
var sys_svr_data = [];
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
// Master Setting
var master_grid,
    master1_grid,
    master2_grid;
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
    {id: 'nm2', name: '名称２', field: 'nm2', width: 150, resizable: false, editor: Slick.Editors.Select, formatter: Slick.Formatters.Select, options: [], headerCssClass: 'center master_nm2', cssClass: 'master_nm2'},
    {id: 'stop_flg', name: '停止', field: 'stop_flg', width: 42, resizable: false, formatter: Slick.Formatters.Checkmark, editor: Slick.Editors.Checkbox, headerCssClass: 'center', cssClass: 'center'}
];
var master2_columns = [
    {id: 'code', name: 'ＣＤ', field: 'code', width: 42, resizable: false, headerCssClass: 'center', cssClass: 'right'},
	{id: 'nm1', name: '名称１', field: 'nm1', width: 350, resizable: false, editor: Slick.Editors.Text, headerCssClass: 'center master_nm1', cssClass: 'master_nm1'},
    {id: 'stop_flg', name: '停止', field: 'stop_flg', width: 42, resizable: false, formatter: Slick.Formatters.Checkmark, editor: Slick.Editors.Checkbox, headerCssClass: 'center', cssClass: 'center'}
];

var master_head1 = {devrole:'役割',devserver:'サーバーOS', devdb:'DBバージョン', devapp:'開発環境', devlang:'開発言語'};
var master_head2 = {devrole:'',devserver:'サーバー種別', devdb:'DB種別', devapp:'', devlang:''};
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
    asyncEditorLoading: true,
	enableColumnReorder: false,
	multiColumnSort: true,
    enableAddRow: false,
    enableTextSelectionOnCells: true
};
var editflg;
// 空白チェック
function spaceCheck(value) {
    if (value == null || value == undefined || !value.length) {
        showMessage('必須入力です。','#ff0000');
        return {valid: false, msg: '必須入力です'};
    } else {
        clearMessage();
        return {valid: true, msg: null};
    }
}
// 日付チェック
function dateCheck(value) {
    if (value.isDate() === false) {
        showMessage('日付を正しく入力して下さい。','#ff0000');
        return {valid: false, msg: '日付を正しく入力して下さい。'};
    } else {
        clearMessage();
        return {valid: true, msg: null};
    }
}
function dateCheck2(value) {
    if (value == null || value == undefined || !value.length) {
        showMessage('日付を入力して下さい。','#ff0000');
        return {valid: false, msg: '日付を入力して下さい。'};
    } else if (value.isDate() === false) {
        showMessage('日付を正しく入力して下さい。','#ff0000');
        return {valid: false, msg: '日付を正しく入力して下さい。'};
    } else {
        clearMessage();
        return {valid: true, msg: null};
    }
}
// 時刻チェック
function timeCheck(value) {
    if (value !== '' && isTime(value) === false) {
        showMessage('時刻を正しく入力して下さい。','#ff0000');
        return {valid: false, msg: '時刻を正しく入力して下さい。'};
    } else {
        clearMessage();
        return {valid: true, msg: null};
    }
}
// 案件番号チェック
function systemNoCheck(value) {
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
                ret = {valid: true, msg: null};
            } else {
                showMessage('案件番号に誤りがあります。','#ff0000');
                ret = {valid: false, msg: null};
            }
        }).fail(function(ret) {
            showMessage('案件番号に誤りがあります。','#ff0000');
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
            showMessage('IPアドレスに誤りがあります。','#ff0000');
            ret = {valid: false, msg: null};
            break;
        }
    }
    return ret;
}
$(function() {
    // ---------------------------------------------------------------------------------------------------------------------------
    // 初期処理
    // ---------------------------------------------------------------------------------------------------------------------------
    // フォームエリアを初期値は非表示にし（ちらつき防止）ダイアログ作成時は表示にしする（gridが崩れるのを防ぐため）
    $('#form_area').show();
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
                console.log($('input[name="disp_type"]:checked').data('type'));
            },10);
            $.alert('編集中の為、タブを変更できません');
            return false;
        }
        $('.proc_frame:visible').hide();
        frame_type = $(this).data('type');
        dispFrame();
    });   
    function dispFrame() {
        $('#'+frame_type).show();
        if (columns[frame_type] === undefined) return;
        
        if (grid[frame_type] === undefined) {
            dataView[frame_type] = new Slick.Data.DataView({ inlineFilters: true });
            grid[frame_type] = new Slick.Grid('#'+frame_type+'_grid',dataView[frame_type], columns[frame_type], options);
            // ツールチップ
            grid[frame_type].registerPlugin( new Slick.AutoTooltips() );
            $('#'+frame_type+'_grid').tooltip();
            grid[frame_type].onScroll.subscribe(function (e, args) {
                // ツールチップをスクロール時にdisableする。終了後にenableにする
                if( timer !== false ){
                    clearTimeout( timer );
                }
                timer = setTimeout( function() {
                    $('#'+frame_type+'_grid').tooltip('enable');
                    timer = false;
                }, 200 );
                $('#'+frame_type+'_grid').tooltip('disable');
            });            
            grid[frame_type].setSelectionModel(new Slick.RowSelectionModel());
            // ソート
            grid[frame_type].onSort.subscribe(function (e, args) {
                var sortcol = args.sortCols[0].columnId;
                dataView[frame_type].sort(function(a, b) {
                    var x = a[sortcol], y = b[sortcol];
                    return (x == y ? 0 : (Number(x) > Number(y) ? 1 : -1));
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
                    // console.log(item);
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
            grid[frame_type].onCellChange.subscribe(function (e, args) {
                args.item.upd = 1;
                dataView[frame_type].updateItem(args.item.id, args.item);
            });	            
        }
        loadData(frame_type);
    }
    function loadData(frame_type) {
        if ($('#'+frame_type).is(':hidden')) {
            return;
        }
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
            width: formWidth[frame_type].width,
            height: formWidth[frame_type].height,
            // minHeight: formWidth[frame_type].height,
            modal: true,
            closeOnEscape: false,
            // resizable: false,
            open: function() {
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
            },
            close: function() {
                clearMessage();
                msgid = '#msg';
            },
            buttons: {
                '登録': function() {
                    $this = $(this);
                    if (focusCheck[$this.data('frame_type')]) {
                        focusCheck[$this.data('frame_type')]();
                    }
                    if ($(this).data('editflg') === 1) {
                        var para = {};
                        // for (key in items) {
                        //     para[items[key]["name"]] = items[key]["value"];
                        // }
                        if (formCheck[$this.data('frame_type')]() === false) {
                            return;
                        }
                        BlockScreen('登録中 ...');
                        var items = $('#'+$this.data('frame_type')+'_form').serializeArray();
                        Ajax('devasstes.php?func='+$this.data('frame_type')+'Reg',items).done(function(ret) {
                            if (ret.code === 'OK') {
                                loadData($this.data('frame_type'));
                                $.alert('登録しました。');
                                clearMessage();
                                if (afterReg[$this.data('frame_type')] !== undefined) {
                                    afterReg[$this.data('frame_type')](ret);
                                }
                                $this.data('editflg',0);
                            } else {
                                $.alert('登録エラー');    
                            }
                        }).fail(function(ret) {
                            $.alert('登録エラー');
                        }).always(function() {
                            UnBlockScreen();
                        });
                    } else {
                        showMessage('変更箇所がありません','#0033ee');
                    }
                },
                '閉じる': function() {
                    $this = $(this);
                    if (focusCheck[$this.data('frame_type')]) {
                        focusCheck[$this.data('frame_type')]();
                    }
                    if ($(this).data('editflg') === 1) {
                        $this = $(this);
                        $.confirm('登録されていませんがよろしいですか？').done(function() {
                            $this.dialog('close');
                        });
                        return;
                    }
                    $(this).dialog('close');
                },
            }
        }).data({'frame_type':frame_type,'editflg':0});
        $('#'+frame_type+'_form').next().prepend('<p id="'+frame_type+'_msg" class="form_msg"></p>');        
        if (syozokucd === '999999') {
            $('.ui-dialog-buttonpane button:contains("登録")').hide();
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
                $(this).text('保存');
                $('#'+frame_type+'_cancel').prop('disabled',false);
                $('#'+frame_type+' .find_frame input[type="text"],#'+frame_type+' .find_frame select').prop('disabled',true);
            } else {
                // 保存処理
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
                $(this).text('編集');
                $('#'+frame_type+'_cancel').prop('disabled',true);
                $('#'+frame_type+' .find_frame input[type="text"],#'+frame_type+' .find_frame select').prop('disabled',false);
            }
        });
        // キャンセルボタンクリック
        $('#'+frame_type+'_cancel').click(function() {
            grid[frame_type].setOptions({editable: false});
            loadData(frame_type);
            $('#'+frame_type+'_edit').text('編集');
            $(this).prop('disabled',true);
            $('#'+frame_type+' .find_frame input[type="text"],#'+frame_type+' .find_frame select').prop('disabled',false);
        });
        // CSVボタンクリック
        $('#'+frame_type+'_csv').click(function() {
            BlockScreen('作成中...');
            Ajax('devasstes.php?func='+frame_type+'Csv').done(function(ret) {
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
            $(this).height(lines*21);
        } else if ($(this).data('minline') > lines) {
            $(this).height($(this).data('minline')*21);
        }
    });
    // 検索枠、変更時
	var composition = false;
	$(".find_frame input").keyup(function (e) {
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
        $('#fs_dev_lang').mulitiSelect({source:devlang,maxcnt:10});
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
            setSystemShosai(item);
        }
    }
    // サーバーからデータ取得
    function getSystemShosai(sys_key) {
        Ajax('devasstes.php?func=loadsystem',{sys_key: sys_key}).done(function(ret) {
            setSystemShosai(ret.data[0]);
        }).fail(function(ret) {
            alert(ret.msg);
        });
    }    
    function setSystemShosai(item) {
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
        $('#fs_dev_lang').mulitiSelect({source:devlang,value:item.dev_lang,label:devlang_opt,maxcnt:10});
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
        let sc2 = BlockScreen('Loading ...','rgba(0,0,0,0)',$('#sys_rel_grid'));
        Ajax('devasstes.php?func=loadSystemRelease',{sys_key: $('#fs_sys_key').val()}).done(function(ret) {
            grid['sys_rel'].setData(ret.data);
            grid['sys_rel'].render();
        }).fail(function(ret) {
            alert(ret.msg);
        }).always(function(ret) {
            UnBlockScreen(sc2);
        });
    }
    function loadSysTrbl() {
        let sc = BlockScreen('Loading ...','rgba(0,0,0,0)',$('#sys_trbl_grid'));
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
                sys_svr_data = grid['sys_svr'].getData();
                for (var i=0; i<sys_svr_data.length; i++) {
                    if (sys_svr_data[i].svr_key === args.item.svr_key) {
                        showMessage('登録済みサーバーです','#0000ff');
                        return false;
                    }
                }
                var item = {
                    no: args.item.svr_key, 
                    svr_key: args.item.svr_key, 
                    host_name: server_list[args.item.svr_key].host_name,
                    role_name: server_list[args.item.svr_key].role_name,
                    db_type_name: server_list[args.item.svr_key].db_type_name,
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
                if ($('#server_form').is(':visible')) {
                    $.alert('この詳細画面は表示されている為、開くことができません');
                    return;
                }
                if (columns['sys_svr'][args.cell].id === 'detail') {
                    var item = grid['sys_svr'].getDataItem(args.row);
                    getServerShosai(item.svr_key);
                }
                if (columns['sys_svr'][args.cell].id === 'delete') {
                    sys_svr_data = grid['sys_svr'].getData();
                    if (sys_svr_data[args.row].svr_key !== '') {
                        let sys_svr_del = [];
                        if ($('#fs_sys_svr_del').val() !== '') {
                            sys_svr_del = JSON.parse($('#fs_sys_svr_del').val());
                        }
                        sys_svr_del.push(sys_svr_data[args.row].svr_key);
                        $('#fs_sys_svr_del').val(JSON.stringify(sys_svr_del));
                    }
                    sys_svr_data.splice(args.row, 1);
                    grid['sys_svr'].invalidate();
                    $('#system_form').data('editflg',1);
                }
            });            
            grid['sys_svr'].onCellChange.subscribe(function(e, args) {
                $('#system_form').data('editflg',1);
            });
        }
        if ($('#fs_sys_key').val() !== '新規' || server_list === undefined) {
            loadSysSvr();
        }
    }
    function loadSysSvr() {
        let para = {
            sys_key: $('#fs_sys_key').val(),
            server_list: server_list === undefined ? 0 : 1
        }
        let sc1 = BlockScreen('Loading ...','rgba(0,0,0,0)',$('#sys_svr_grid'));
        Ajax('devasstes.php?func=loadSystemServer',para).done(function(ret) {
            if (ret.server_list.length !== 0) {
                setServerList(ret.server_list);
            }
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
                if ($('#release_form').is(':visible')) {
                    $.alert('この詳細画面は表示されている為、開くことができません');
                    return;
                }
                if (columns['sys_rel'][args.cell].id === 'detail') {
                    var item = grid['sys_rel'].getDataItem(args.row);
                    item['sys_key'] = $('#fs_sys_key').val();
                    item['system_name'] = $('#fs_system_name').val();
                    setReleaseShosai(item);
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
            });
            grid['sys_rel'].onCellChange.subscribe(function(e, args) {
                $('#system_form').data('editflg',1);
            });
        }
    }
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
                    status: 0,
                    kihyo: '',
                    level: 0,
                    naiyo: '',
                    taio_date: '',
                    taio: '',
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
                    setTroubleShosai(item);
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
            });
            grid['sys_trbl'].onCellChange.subscribe(function(e, args) {
                $('#system_form').data('editflg',1);
            });
        }
    }    
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
    // システム内サーバー一覧フォーカス時
    $(document).on('focus', '#sys_svr_grid select.editor-text', function() {
        showMessage('行を追加するにはホスト名リストから選択して別のセルをクリックして下さい','#0000ff');
    });
    // 検索処理
    filterFunc['system'] = function(item, args) {
        if ($('#system_edit').text() === '保存' && item.upd === 1) {
            return true;
        }
		if (args.findSystem !== "" && item["system_name"].indexOf(args.findSystem) == -1) {
            return false;
        }
		if (args.findGaiyo !== "" && item["gaiyo"].indexOf(args.findGaiyo) == -1) {
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
		if (args.findDevelop !== "" && item["dev_busho"].indexOf(args.findDevelop) == -1 && item["dev_tanto"].indexOf(args.findDevelop) == -1) {
            return false;
        }
        if (args.findEnv !== "" && item["dev_env"].indexOf(args.findEnv) == -1) {
            return false;
        }
        if (args.findLang !== "" && item["dev_lang"].indexOf(args.findLang) == -1) {
            return false;
        }
		if (args.findBiko !== "" && item["biko"].indexOf(args.findBiko) == -1) {
            return false;
        }
        return true;
    }
    // フォーム初期値設定
    for (let key in kado_jyokyo_opt) {
        $('#fds_kado_jyokyo').append('<option value="'+key+'"'+(kado_jyokyo_opt[key]==='稼働中' ? ' selected':'')+'>'+kado_jyokyo_opt[key]+'</option>');
        $('#fdv_kado_jyokyo').append('<option value="'+key+'"'+(kado_jyokyo_opt[key]==='稼働中' ? ' selected':'')+'>'+kado_jyokyo_opt[key]+'</option>');
        $('#fs_kado_jyokyo').append('<option value="'+key+'">'+kado_jyokyo_opt[key]+'</option>');
        $('#fv_kado_jyokyo').append('<option value="'+key+'">'+kado_jyokyo_opt[key]+'</option>');
    }
    for (let key in dev_kbn_opt) {
        $('#fds_dev_kbn').append('<option value="'+key+'">'+dev_kbn_opt[key]+'</option>');
        $('#fs_dev_kbn').append('<option value="'+key+'">'+dev_kbn_opt[key]+'</option>');
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
        $('#fr_system_name').prop('tabindex','1').prop('readonly',false);
        $('#fr_release_date').prop('tabindex','2');
        $('#fr_system_no').data('sv','');
        $('#release_form').dialog('open');
        $('#release_form .auto-resize').change();
    });
    // 詳細クリック（詳細編集）
    gridClick['release'] = function(args) {
        var item = grid['release'].getDataItem(args.row); 
        if (columns['release'][args.cell].id === 'detail') {
            if ($('#release_edit').text() === '保存') {
                $.alert('編集中の為、詳細を開けません');
                return;
            }
            setReleaseShosai(item);
        }
    }
    // データ詳細セット
    function setReleaseShosai(item) {
        formReset('release');
        $('#fr_release_no').val(item.release_no);
        $('#fr_sys_key').val(item.sys_key);
        $('#fr_system_name').val(item.system_name).prop('tabindex','0').prop('readonly',true);
        $('#fr_release_date').val(item.release_date).prop('tabindex','1');
        $('#fr_tanto').val(item.tanto);
        $('#fr_version').val(item.version);
        $('#fr_system_no').val(item.system_no).data('sv',String(item.system_no));
        $('#fr_naiyo').val(item.naiyo);
        $('#fr_kakunin').val(item.kakunin);
        $('#fr_biko').val(item.biko);

        $('#release_form').dialog('open');
        $('#release_form .auto-resize').change();
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
            showMessage2($('#fr_system_name'),'システム名を正しく選択して下さい','#ff0000');
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
        if (systemNoCheck2() === false) {
            return false;
        }
        return true;
    }
    // 案件番号チェック
    $('#fr_system_no').blur(function() {
        systemNoCheck2();
    });
    function systemNoCheck2() {
        if ($('#fr_system_no').val() !== '' && $('#fr_system_no').val() !== $(this).data('sv')) {
            if (systemNoCheck($('#fr_system_no').val()).valid === false) {
                showMessage2($('#fr_system_no'),'案件番号を正しく入力して下さい','#ff0000');
                return false;
            }
            $('#fr_system_no').data('sv',$('#fr_system_no').val());
        }
        clearMessage();
        return true;
    }
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
        $('#ft_system_name').prop('tabindex','1').prop('readonly',false);
        $('#ft_hassei_date').prop('tabindex','2');
        $('#ft_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');
        $('#trouble_form').dialog('open');
        $('#trouble_form .auto-resize').change();
    });
    // 詳細クリック（詳細編集）
    gridClick['trouble'] = function(args) {
        var item = grid['trouble'].getDataItem(args.row); 
        if (columns['trouble'][args.cell].id === 'detail') {
            if ($('#trouble_edit').text() === '保存') {
                $.alert('編集中の為、詳細を開けません');
                return;
            }
            setTroubleShosai(item);
        }
    }
    // データ詳細セット
    function setTroubleShosai(item) {
        formReset('trouble');
        $('#ft_trouble_no').val(item.trouble_no);
        $('#ft_sys_key').val(item.sys_key);
        $('#ft_system_name').val(item.system_name).prop('tabindex','0').prop('readonly',true);
        $('#ft_hassei_date').val(item.hassei_date).prop('tabindex','1');
        $('#ft_kihyo').val(item.kihyo);
        $('#ft_status').val(item.status);
        $('#ft_level').val(item.level);
        $('#ft_naiyo').val(item.naiyo);
        $('#ft_taio_date').val(item.taio_date);
        $('#ft_taio').val(item.taio);
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
    formCreate('trouble');
    // 検索処理
    filterFunc['trouble'] = function(item, args) {
        if ($('#trouble_edit').text() === '保存' && item.upd === 1) {
            return true;
        }
		if (args.findSystem !== "" && item["system_name"].indexOf(args.findSystem) == -1) {
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
    formCheck['trouble'] = function() {
        if ($('#ft_sys_key').val() === '') {
            showMessage2($('#ft_system_name'),'システム名を正しく選択して下さい','#ff0000');
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
        if ($('#ft_taio_date').val().isDate() === false) {
            showMessage2($('#ft_taio_date'),'対応日を入力して下さい','#ff0000');
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
    // システム　リリース・トラブル共通処理
    $('#fr_system_name,#ft_system_name').autocomplete({
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
            $(this).val(ui.item.label).change();
            $('#'+$(this)[0].id.substr(0,2)+'_sys_key').val(ui.item.value);
            return false;
        }
	}).focus(function () {
        if ($('#'+$(this)[0].id.substr(0,2)+'_sys_key').val() === '') {
            showMessage('システム名を入力し表示されたリストから必ず選択して下さい','#ff7700');
        }
    });
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
                $.alert('編集中の為、詳細を開けません');
                return;
            }
            setServerShosai(item);
        }
    }
    // サーバーからデータ取得
    function getServerShosai(svr_key) {
        Ajax('devasstes.php?func=loadserver',{svr_key: svr_key}).done(function(ret) {
            setServerShosai(ret.data[0]);
        }).fail(function(ret) {
            alert(ret.msg);
        });
    }
    function setServerShosai(item) {
        formReset('server');
        $('#fv_svr_key').val(item.id);
        $('#fv_host_name').val(item.host_name);
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
        $('#fv_ip_adrs').mulitiText({value:item.ip_adrs});

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
        Ajax('devasstes.php?func=loadServerTrouble',{svr_key: $('#fv_svr_key').val()}).done(function(ret) {
            grid['svr_trbl'].setData(ret.data);
            grid['svr_trbl'].render();
        }).fail(function(ret) {
            alert(ret.msg);
        }).always(function(ret) {
            UnBlockScreen(sc);
        });        
    }
    // データ読込後の処理
    afterLoad['server'] = function(data) {
        setServerList(data);
    }
    // 登録後の処理
    afterReg['server'] = function(ret) {
        if (ret.svr_key) {
            $('#fv_sys_key').val(ret.svr_key);
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
        if ($('#fv_kado_jyokyo').val() === '9' && $('#fv_end_date').val().trim() === '') {
            showMessage2($('#fv_end_date'),'稼働終了日を入力して下さい','#ff0000');
            return false;
        }
        if ($('#fv_kado_jyokyo').val() !== '9' && $('#fv_end_date').val().trim() !== '') {
            showMessage2($('#fv_kado_jyokyo'),'稼働状況を停止にして下さい','#ff0000');
            return false;
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
        $('#fv_role_hidden').val(role.join(','));
        if (db && $('#fv_db_type').val() === "0") {
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
                    setMenteShosai(item);
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
                    status: 0,
                    kihyo: '',
                    level: 0,
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
                    setSTroubleShosai(item);
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
        }
    }
    // 検索処理
    filterFunc['server'] = function(item, args) {
        if ($('#server_edit').text() === '保存' && item.upd === 1) {
            return true;
        }
		if (args.findHostName !== "" && item["host_name"].indexOf(args.findHostName) == -1 && item["other_name"].indexOf(args.findHostName) == -1) {
            return false;
        }
		if (args.findGaiyo !== "" && item["gaiyo"].indexOf(args.findGaiyo) == -1) {
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
		if (args.findBiko !== "" && item["biko"].indexOf(args.findBiko) == -1) {
            return false;
        }
        return true;
    }
    // 行チェック
    rowCheck['server'] = function(item,row) {
        let db = false;
        if (Array.isArray(item.role)) {
            for(let i=0; i<item.role.length; i++) {
                if (devrole_opt[item.role[i]] === 'DB' || devrole_opt[item.role[i]] === 'ＤＢ') {
                    db = true;
                }
            }
        }
        if (db && (item.db_type === '' || item.db_type === null)) {            
            grid['server'].gotoCell(row,grid['server'].getColumnIndex('db_type'),true);
            showMessage('ＤＢを選択して下さい。','#ff0000');
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
    devrole.forEach(function(row) {
        $('#fv_role').append('<option value="'+row.value+'">'+row.label+'</option>');
        $('#fdv_role').append('<option value="'+row.value+'">'+row.label+'</option>');
        devrole_opt[row.value] = row.label;
    });
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
        $('#fm_host_name').prop('tabindex','1').prop('readonly',false);
        $('#fm_start_date').prop('tabindex','2');
        $('#fm_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');
        $('#mente_form').dialog('open');
        $('#mente_form .auto-resize').change();
    });
    // 詳細クリック（詳細編集）
    gridClick['mente'] = function(args) {
        var item = grid['mente'].getDataItem(args.row); 
        if (columns['mente'][args.cell].id === 'detail') {
            if ($('#mente_edit').text() === '保存') {
                $.alert('編集中の為、詳細を開けません');
                return;
            }
            setMenteShosai(item);
        }
    }
    // データ詳細セット
    function setMenteShosai(item) {
        formReset('mente');
        $('#fm_mente_no').val(item.mente_no);
        $('#fm_svr_key').val(item.svr_key);
        $('#fm_host_name').val(item.host_name).prop('tabindex','0').prop('readonly',true);
        $('#fm_start_date').val(item.start_date).prop('tabindex','1');
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
    // フォームチェック
    formCheck['mente'] = function() {
        if ($('#fm_svr_key').val() === '') {
            showMessage2($('#fm_host_name'),'サーバー名を正しく選択して下さい','#ff0000');
            return false;
        }
        if ($('#fm_start_date').val().isDate() === false) {
            showMessage2($('#fm_start_date'),'開始日を正しく入力して下さい','#ff0000');
            return false;
        }        
        if (timeCheck($('#fm_start_time').val()).valid === false) {
            showMessage2($('#fm_start_time'),'開始時刻を正しく入力して下さい','#ff0000');
            return false;
        }        
        if ($('#fm_end_date').val().isDate() === false) {
            showMessage2($('#fm_end_date'),'終了日を正しく入力して下さい','#ff0000');
            return false;
        }        
        if (timeCheck($('#fm_end_time').val()).valid === false) {
            showMessage2($('#fm_end_time'),'終了時刻を正しく入力して下さい','#ff0000');
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
        $('#fx_host_name').prop('tabindex','1').prop('readonly',false);
        $('#fx_hassei_date').prop('tabindex','2');
        $('#fx_temp_file').html('<div class="temp_file_msg">添付するには＋をクリックするかファイルをドラッグして下さい</div><button type="button" class="temp_file_add">＋</button>');
        $('#strouble_form').dialog('open');
        $('#strouble_form .auto-resize').change();
    });
    // 詳細クリック（詳細編集）
    gridClick['strouble'] = function(args) {
        var item = grid['strouble'].getDataItem(args.row); 
        if (columns['strouble'][args.cell].id === 'detail') {
            if ($('#strouble_edit').text() === '保存') {
                $.alert('編集中の為、詳細を開けません');
                return;
            }
            setSTroubleShosai(item);
        }
    }
    // データ詳細セット
    function setSTroubleShosai(item) {
        formReset('strouble');
        $('#fx_trouble_no').val(item.trouble_no);
        $('#fx_svr_key').val(item.svr_key);
        $('#fx_host_name').val(item.host_name).prop('tabindex','0').prop('readonly',true);
        $('#fx_hassei_date').val(item.hassei_date).prop('tabindex','1');
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
            showMessage2($('#fx_host_name'),'サーバー名を正しく選択して下さい','#ff0000');
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
        if ($('#fx_taio_date').val().isDate() === false) {
            showMessage2($('#fx_taio_date'),'対応日を正しく入力して下さい','#ff0000');
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
            $(this).val(ui.item.label).change();
            $('#'+$(this)[0].id.substr(0,2)+'_svr_key').val(ui.item.value);
            return false;
        }
	}).focus(function () {
        if ($('#'+$(this)[0].id.substr(0,2)+'_svr_key').val() === '') {
            showMessage('ホスト名を入力し表示されたリストから必ず選択して下さい','#ff7700');
        }
    });

    // ---------------------------------------------------------------------------------------------------------------------------
    // サーバーリスト作成
    function setServerList(data) {
        columns['sys_svr'][2].options = {};
        server_list = {};
        data.forEach(function(rec) {
            columns['sys_svr'][2].options[rec.id] = rec.host_name;
            server_list[rec.id] = {};
            server_list[rec.id].host_name = rec.host_name;
            server_list[rec.id].os_name = rec.os_name;
            server_list[rec.id].role_name = rec.role_name;
            server_list[rec.id].db_type_name = rec.db_type_name;
        });
    }
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
                findEnv: $('#fds_dev_env').val(),
                findLang: $('#fds_dev_lang').val(),
                findBiko: $('#fds_biko').val(),
            },
            'release' : {
                findSystem: $('#fdr_system').val(),
                findReleaseDate: $('#fdr_release').val(),
                findTanto: $('#fdr_devtanto').val(),
                findSystemNo: $('#fdr_system_no').val(),
                findNaiyo: $('#fdr_naiyo').val(),
                findKakunin: $('#fdr_kakunin').val(),
                findBiko: $('#fdr_biko').val(),
            },
            'trouble' : {
                findSystem: $('#fdt_system').val(),
                findHasseiDate: $('#fdt_hassei').val(),
                findStatus: $('#fdt_status').val(),
                findKihyo: $('#fdt_kihyo').val(),
                findLevel: $('#fdt_level').val(),
                findNaiyo: $('#fdt_naiyo').val(),
                findTaioDate: $('#fdt_taio_date').val(),
                findTaio: $('#fdt_taio').val(),
                findHokoku: $('#fdt_hokoku').val(),
                findBiko: $('#fdt_biko').val(),
            },
            'server' : {
                findHostName: $('#fdv_host_name').val(),
                findGaiyo: $('#fdv_gaiyo').val(),
                findKadoJyokyo: $('#fdv_kado_jyokyo').val(),
                findOS: $('#fdv_os').val(),
                findRole: $('#fdv_role').val(),
                findDB: $('#fdv_db').val(),
                findIPAdrs: $('#fdv_ip_adrs').val(),
                findKanri: $('#fdv_kanri').val(),
                findBiko: $('#fdv_biko').val(),
            },
            'mente' : {
                findHostName: $('#fdm_host_name').val(),
                findStartDate: $('#fdm_start_date').val(),
                findEndDate: $('#fdm_end_date').val(),
                findTanto: $('#fdm_tanto').val(),
                findKekka: $('#fdm_kekka').val(),
                findNaiyo: $('#fdm_naiyo').val(),
                findBiko: $('#fdm_biko').val(),
            },
            'strouble' : {
                findHostName: $('#fdx_host_name').val(),
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
    
    // $('#fs_dev_busho,#fv_kanri_busho').autocomplete({
    //     source: busholist,
    //     minLength: 0,
    //     select: function (e, ui) {
    //         $(this).val(ui.item.label).change();
    //         return false;
    //     }
    // }).click(function () {
    //     $(this).autocomplete('search', '');
    // });
    $('.form_date').datepicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        showButtonPanel: true,
        onClose: function (e) {
            $(this).datepicker('refresh');
        }
    });    

    $('#fs_dev_tanto,#fr_tanto,#fr_kakunin,#ft_kihyo,#ft_taio,#fv_kanri_tanto,#fm_tanto,#fx_kihyo,#fx_taio').autocomplete({
        source: syozokulist,
        minLength: 0,
        select: function (e, ui) {
            $(this).val(ui.item.label).change();
            return false;
        }
    }).click(function () {
        $(this).autocomplete('search', '');
    });
    // ---------------------------------------------------------------------------------------------------------------------------
    // オリジナル選択リスト
    // ---------------------------------------------------------------------------------------------------------------------------
    $.fn.mulitiSelect = function(options) {
        var settings = $.extend({
            value: [],
            label: [],
            maxcnt: 3
        }, options);
        var $this = this;
        $this.empty();
        if (settings.value.length !== 0) {
            for (var i=0; i<settings.value.length; i++) {
                $this.append('<div class="msel_item" data-val="'+settings.value[i]+'">'+settings.label[settings.value[i]]+'</div><div class="msel_item_del">✕</div>');
            }
        }
        if (settings.value.length < settings.maxcnt) {
            $this.append('<div class="msel_item"></div><div class="msel_item_del">✕</div>');
        }
        function addEvent() {
            $this.children('.msel_item').autocomplete({
                source: settings.source,
                minLength: 0,
                select: function (e, ui) {
                    if ($(this).text() === '' && $this.children('.msel_item').length < settings.maxcnt) {                    
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
    // オリジナルテキストリスト
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
    master1_grid = new Slick.Grid('#master1_grid', master_data, master1_columns, options);	
    master2_grid = new Slick.Grid('#master2_grid', master_data, master2_columns, options);	
    master1_grid.setSelectionModel(new Slick.RowSelectionModel());
    master2_grid.setSelectionModel(new Slick.RowSelectionModel());
    $('#master_form').dialog({
		autoOpen: false,
		width: 495,
		modal: true,
        resizable: false,
        open: function() {
            editflg = false;
            master_grid.setOptions({editable: true, enableAddRow: true});
        },
        close: function() {
            $('#form_sort').prop('checked',false).button('refresh');
        },
        buttons: {
            '登録': function() {
                focus_blur(master,0);
                if (editflg) {
                    BlockScreen('登録中 ...');
                    var para = {
                        key: master_key,
                        data: master_grid.getData()
                    }
                    Ajax('devasstes.php?func=masterReg',para).done(function(ret) {
                        if (ret.code === 'OK') {
                            $.alert('登録しました。');
                            clearMessage();
                            editflg = false;
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
                focus_blur(master,0);
                if (editflg) {
                    $.confirm('登録されていませんがよろしいですか？').done(function() {
                        $('#master_form').dialog('close');
                    });
                    return;
                }
                $(this).dialog('close');
            },
        }
    });
    // 他マスター
    $('.master_form').click(function() {
        $this = $(this);
        if ($this.text() === 'ＤＢ設定') {
            master1_columns[2].options = db_opt;
        } else if ($this.text() === 'サーバ設定') {
            master1_columns[2].options = svr_opt;
        }
        master = ($this.text() === 'サーバ設定' || $this.text() === 'ＤＢ設定') ? 'master1' : 'master2';
        $('#master1_grid').toggle((master === 'master1'));
        $('#master2_grid').toggle((master === 'master2'));

        $('#master_form').dialog('option','title',$(this).text());
        master_key = $(this).data('key');
        BlockScreen('読込中 ...');
        Ajax('devasstes.php?func=masterLoad',{key:master_key}).done(function(ret) {
            maxcd = ret.maxcd;
            if (master === 'master1') {
                master_grid = master1_grid;
            } else {
                master_grid = master2_grid;
            }
            master_grid.setData(ret.data);
            master_grid.render();
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
    master1_grid.onCellChange.subscribe(function (e, args) {
        editflg = true;
    });
    master2_grid.onCellChange.subscribe(function (e, args) {
        editflg = true;
    });
    // 新規行
    master1_grid.onAddNewRow.subscribe(function (e, args) {
        return masterAddNewRow(args);
    });
    master2_grid.onAddNewRow.subscribe(function (e, args) {
        return masterAddNewRow(args);
    });
    function masterAddNewRow(args) {
        master_data = master_grid.getData();
        if (args.item.nm1 === undefined) {
            setTimeout(function() {
                $('#'+master+'_grid slick-row').eq(master_data.length).children('.slick-cell.master_nm1').click();                
            }, 10);
            return false;
        }
        maxcd++;
        var item = $.extend({},{code: maxcd, stop_flg: 0},args.item);
        master_grid.invalidateRow(master_data.length);
        master_data.push(item);
        master_grid.updateRowCount();
        master_grid.render();
        editflg = true;
        return true;
    }
    // 並び替えボタンを追加
    $('#master_form').next().prepend('<input type="checkbox" id="form_sort">'+
                        '<label for="form_sort" title="ドラッグによる並び替えを行います">並び替え</label>');
    $('#form_sort').button();
    // 並び替えボタンクリック
    $('#form_sort').change(function() {
        master_grid.setOptions({editable: ($(this).prop('checked') === false)});
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
    master1_grid.registerPlugin(moveRowsPlugin1);
    master2_grid.registerPlugin(moveRowsPlugin2);    

    moveRowsPlugin1.onMoveRows.subscribe(function (e, args) {
        moveRows(args);
    });    
    moveRowsPlugin2.onMoveRows.subscribe(function (e, args) {
        moveRows(args);
    });    
    function moveRows(args) {
        var data = master_grid.getData();
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
        master_grid.resetActiveCell();
        master_grid.setData(data);
        master_grid.setSelectedRows(selectedRows);
        master_grid.render();
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
    function focus_blur(grid_name,ix) {
        var ix = typeof ix !== 'undefined' ? ix : 1;
        if ($('#'+grid_name+'_grid .editor-checkbox').length > 0 || $('#'+grid_name+'_grid .editor-text').length > 0 || $('.slick-large-editor-text').length > 0) {
            $('#'+grid_name+'_grid .slick-row:eq(0) .slick-cell:eq('+ix+')').click();
            // grid[grid_name].focus();
        }
    }
    // セッション切れ防止
    setInterval(function() {
        Ajax('devassets.php?func=sessioncheck');
    }, 1200000);
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
        if ($(this).data('upload') !== undefined) {
            if (($(this).data('upload') === 'system' && $('#fs_sys_key').val() === '新規')
             || ($(this).data('upload') === 'server' && $('#fv_svr_key').val() === '新規')
             || (svobj.data('upload') === 'trouble' && $('#ft_trouble_no').val() === '新規')) {
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
             || (svobj.data('upload') === 'trouble' && $('#ft_trouble_no').val() === '新規')) {
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
            if ((files[i].size / 1024 / 1024) > 0.5) {
                svret.msg += 'サイズが500KBを超えている為、アップロードできません！<br>'+files[i].name+'<br>';
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
        var url = 'devasstes.php?func=FileDownload&file_type='+$(this).parents('.upload_area').data('upload')+
                '&key='+($(this).parents('.upload_area').data('upload') === 'system' ? $('#fs_sys_key').val() : $('#fv_svr_key').val())+
                '&filename='+encodeURIComponent(filename);
        // やり方はここを参照＝＞ https://warpbutton.com/blog/tips/739/
        $('<form/>',{action:url, method:'post'})
                .appendTo(document.body)
                .submit()
                .remove();
    });
    // 添付ファイル削除クリック
    $(document).on('click','.tmp_delete',function(e) {
        $key = {'system':$('#fs_sys_key').val(),'server':$('#fv_svr_key').val(),'trouble':parseInt($('#ft_trouble_no').val().replace('T',''))};
        let $this = $(this);
        let filename = $this.prev().text()
        $.confirm(filename+'を削除します。よろしいですか？').done(function() {
            let para = {
                file_type: $this.parents('.upload_area').data('upload'),
                key: $key[$this.parents('.upload_area').data('upload')],
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
});
// メッセージ表示関数
var msgid = '#msg';
var msghd;
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
    if (msghd != null) clearTimeout(msghd);
    setTimeout(function() {
        obj.focus();
        let pos = obj.offset();
        $("#alert_msg").css({'color':color,'top':pos.top+obj.height()+15,'left':pos.left}).text(msg).show();
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