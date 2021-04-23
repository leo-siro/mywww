// 共通関数の使い方は
// http://chintaikanri.leopalace21.com/siro/doc.html
// を参照してください
/**
 * ajax通信を行う（JQueryが必要）
 * @param {string} app PHPプログラムパス
 * @param {Object} [idata = null] PHPへ渡すPOSTデータ（省略可能）
 * @param {number} [RetryCnt = 5] 通信エラー時のリトライ数（省略可能）
 * @return {Object} PHPからの戻り値
 **/
function Ajax(app, idata, RetryCnt) {
	var idata = typeof idata !== 'undefined' ? idata : null;
	var RetryCnt = typeof RetryCnt !== 'undefined' ? RetryCnt : 5;
	var dfd = $.Deferred();
	AjaxEx(app, idata, dfd, RetryCnt).done(function (ret) {
		dfd.resolve(ret);
	})
	.fail(function (ret) {
		dfd.reject(ret);
	});
	return dfd.promise();
}
function AjaxEx(app, idata, dfd, RetryCnt) {
	$.ajax({
		type: 'post',
		url: app,
		dataType: 'json',
		data: idata
	}).done(function (ret) {
		//通信正常終了
		if (ret.code != undefined && ret.code === 'SESSION ERROR') {
			//セッションエラー時、インデックスへジャンプする
			ret.msg = 'セッション切れ';
			dfd.reject(ret);
			if (location.pathname.substr(0, 4) == '/leo') {
				location.href = 'https://leoportal.leopalace21.com/leo-kanintra/php/login/main/login.php?back_url=../../../..' + location.pathname;
			} else {
				location.href = 'http://' + location.host + '/php/login/main/login.php?back_url=../../..' + location.pathname;
			}
		} else if (ret.code != undefined && ret.code === 'MAINTENANCE') {
			if (ret.msg) alert(ret.msg);
			if (location.pathname.substr(0, 4) == '/leo') {
				if (ret.url) location.href = 'https://leoportal.leopalace21.com/leo-kanintra/' + ret.url;
			} else {
				if (ret.url) location.href = 'http://' + location.host + ret.url;
			}
		} else {
			dfd.resolve(ret);
		}
	}).fail(function (jqXHR, textStatus, errorThrown) {
		//通信エラー時にリトライをかける
		if (textStatus === 'timeout' && RetryCnt > 0) {
			RetryCnt--;
			setTimeout(function () { Ajax(RetryCnt, dfd, idata, app); }, 500);
		}
		else {
			ret = { code: 'TIME OUT', msg: jqXHR.responseText };
			dfd.reject(ret);
		}
	});
	return dfd.promise();
}
//------------------------------------------------------------------------------------------------------------
// Ajax処理でプログレスバーを表示する
//------------------------------------------------------------------------------------------------------------
var progress_fname = '';
var progress_sta = 0;	// ０:開始 １:処理中 ２:終了
function DispProgress() {
	var key = new Date().getTime().toString(16);
	var initflg = true;
	$('body').append('<div id="progress_scr" style="cursor:wait; background-color: rgba(0,0,0,0.5); position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 999;">' +
		'<div style="background-color: rgba(255,255,255,1); text-align: center; border-radius: 7px; border: 1px solid #333333; height: 30px; width: 40%; position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; margin: auto;" id="progress_bar">' +
		'<div style="position: absolute; top: 7px; right: 0px; left: 0px; margin: auto;" id="progress_text">initial processing</div></div></div>');
	var sv_progress_allcnt = 0, sv_progress_cnt = 0;
	var check_cnt = 0;
	setTimeout(function ProgressProc() {
		$.ajax({
			url: '/count/' + key + '.json',
			dataType: 'json'
		})
			.done(function (ret) {
				if (ret.allcnt > 0) {
					var val = (ret.cnt / ret.allcnt) * 100;
					$('#progress_bar').progressbar({
						value: val
					});
					$('#progress_text').text(parseInt(val) + '%');
					if (initflg) {
						$('.ui-progressbar-value').css('background', '#BFFF66');
						initflg = false;
					}
				}
				// 元処理の影響で永久ループをしないよう同じ内容が5回続いたら終了する
				if (ret.allcnt == sv_progress_allcnt && ret.cnt == sv_progress_cnt) {
					check_cnt++;
					if ((ret.cnt != -1 && check_cnt > 4) || (ret.cnt == -1 && check_cnt > 1000)) {
						$('#progress_text').text('Process Error....');
						setTimeout(function () {
							ProgressEnd(key)
						}, 500);
					}
					if (ret.cnt == -1) {
						if ((check_cnt % 10) == 0) {
							$('#progress_text').text('initial processing');
						}
						if ((check_cnt % 10) == 5) {
							$('#progress_text').text('');
						}
					}
				} else {
					sv_progress_allcnt = ret.allcnt;
					sv_progress_cnt = ret.cnt;
					check_cnt = 0;
					progress_sta = 1;
					progress_fname = ret.fname;
				}
				if (ret.cnt == ret.allcnt) {
					setTimeout(function () {
						ProgressEnd(key)
					}, 100);
				} else if ((ret.cnt != -1 && check_cnt < 5) || (ret.cnt == -1 && check_cnt < 1001)) {
					setTimeout(ProgressProc, 200);
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				if (textStatus === 'timeout') {
					setTimeout(ProgressProc, 200);
				} else {
					ProgressEnd(key);
				}
			});
	}, 200);
	return key;
}
// プログレスバー終了
function ProgressEnd(key) {
	progress_sta = 2;
	$('#progress_scr').remove();
	$.ajax({
		type: 'post',
		url: '/php/common/scripts/progress.php',
		dataType: 'json',
		data: { progresskey: key, func: 'remove' }
	});
}
//------------------------------------------------------------------------------------------------------------
// 画面操作を無効（Now loadingなどのメッセージを表示）
//------------------------------------------------------------------------------------------------------------
function BlockScreen(msg) {
	$('body').append('<div id="block_screen" '+
						'style="'+
							'z-index:9999;'+
							'position:absolute;'+
							'width:100%;'+
							'height:100vh;'+
							'top:0;'+
							'left:0;'+
							'background-color:rgba(0,0,0,0.5);'+
							'display:flex;'+
							'justify-content:center;'+
							'align-items:center;'+
						'">'+msg+
					'</div>');
	document.body.style.cursor = 'wait';
}
function UnBlockScreen() {
	$('#block_screen').remove();
	document.body.style.cursor = 'auto';
}
//------------------------------------------------------------------------------------------------------------
// URLパラメータの取得
//------------------------------------------------------------------------------------------------------------
function getParam() {
	var arg = new Object;
	var pair = location.search.substring(1).split('&');
	for (var i = 0; pair[i]; i++) {
		var kv = pair[i].split('=');
		arg[kv[0]] = (kv[1] ? kv[1] : '');
	}
	return arg;
}
//------------------------------------------------------------------------------------------------------------
// 日付チェック文字型拡張　日付の妥当性チェック
//------------------------------------------------------------------------------------------------------------
String.prototype.isDate = function () {
	var str = this.trim();
	if (str === '') return true;
	var ymd, time = '', y, m, d, h = 0, i = 0, s = 0, dt, pos, ary;

	try {
		if ((pos = str.indexOf(' ')) > 7) {
			ymd = str.substr(0, pos);
			time = str.substr(pos + 1);
		} else {
			ymd = str;
		}
		if (ymd.indexOf('/') > -1 || ymd.indexOf('-') > -1) {
			if (ymd.indexOf('/') > -1) {
				ary = ymd.split('/');
			} else {
				ary = ymd.split('-');
			}
			if (ary.length !== 3) {
				return false;
			}
			y = parseInt(ary[0]);
			m = parseInt(ary[1]);
			d = parseInt(ary[2]);
		} else if (str.length === 8) {
			y = parseInt(this.substr(0, 4));
			m = parseInt(this.substr(4, 2));
			d = parseInt(this.substr(6, 2));
		} else {
			return false;
		}
		if (time !== '') {
			ary = time.split(':');
			if (ary.length === 2) {
				h = parseInt(ary[0]);
				i = parseInt(ary[1]);
			} else if (ary.length === 3) {
				h = parseInt(ary[0]);
				i = parseInt(ary[1]);
				s = parseInt(ary[2]);
			} else {
				return false;
			}
		}
		dt = new Date(y, m - 1, d, h, i, s);
	}
	catch (e) {
		return false;
	}
	return (dt.getFullYear() == y && dt.getMonth() == m - 1 && dt.getDate() == d
		&& dt.getHours() == h && dt.getMinutes() == i && dt.getSeconds() == s);
}
//------------------------------------------------------------------------------------------------------------
// 日付フォーマット　日付型拡張関数
//------------------------------------------------------------------------------------------------------------
Date.prototype.formatDate = function (format) {
	if (!format) format = 'YYYY-MM-DD hh:mm:ss';
	var week = new Array("日","月","火","水","木","金","土");

	format = format.replace(/YYYY/g, this.getFullYear());
	format = format.replace(/YY/g, ('0' + this.getYear()).slice(-2));
	format = format.replace(/MM/g, ('0' + (this.getMonth() + 1)).slice(-2));
	format = format.replace(/M/g, (this.getMonth() + 1));
	format = format.replace(/DD/g, ('0' + this.getDate()).slice(-2));
	format = format.replace(/D/g, this.getDate());
	format = format.replace(/hh/g, ('0' + this.getHours()).slice(-2));
	format = format.replace(/mm/g, ('0' + this.getMinutes()).slice(-2));
	format = format.replace(/ss/g, ('0' + this.getSeconds()).slice(-2));
	format = format.replace(/ww/g, week[this.getDay()]);
	if (format.match(/S/g)) {
		var milliSeconds = ('00' + this.getMilliseconds()).slice(-3);
		var length = format.match(/S/g).length;
		for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
	}
	return format;
};
Date.prototype.addYear = function (val) {
	return new Date(this.setFullYear(this.getFullYear() + parseInt(val)));
};
Date.prototype.addMonth = function (val) {
	return new Date(this.setMonth(this.getMonth() + parseInt(val)));
};
Date.prototype.addDay = function (val) {
	return new Date(this.setDate(this.getDate() + parseInt(val)));
};
//------------------------------------------------------------------------------------------------------------
// 数値のチェック ーを許可 minus:true 小数点を許可 dot:true
//------------------------------------------------------------------------------------------------------------
String.prototype.isNumeric = function (minus, dot) {
	var $this = this.replace(/,/g, '');
	if ($this.trim() === '') return true;
	if (!minus) minus = false;
	if (!dot) dot = false;
	if (minus && dot) {
		return /^[-]?([1-9]\d*|0)(\.\d+)?$/.test($this);
	} else if (dot) {
		return /^([1-9]\d*|0)(\.\d+)?$/.test($this);
	} else if (minus) {
		return /^[-]?([1-9]\d*|0)$/.test($this);
	} else {
		return /^([1-9]\d*|0)$/.test($this);
	}
};
//------------------------------------------------------------------------------------------------------------
// IE要にrepeat関数定義
//------------------------------------------------------------------------------------------------------------
if (!String.prototype.repeat) { /* String.repeat が定義されていなければ… */
	String.prototype.repeat = function(count) {/* …定義する。 */
	   return Array(count*1+1).join(this);
	};
 }
//------------------------------------------------------------------------------------------------------------
// JQuery プラグイン databind     http://chintaikanri.leopalace21.com/siro/doc.html#databind
//------------------------------------------------------------------------------------------------------------
; (function ($) {

	var methods = {
		init: function () {
			if (!this.data('databind_template')) {
				this.data('databind_template', this.html().replace(/[\t|\n]/g, ''));
			}
			this.html(this.html().replace(/\!\{.+?\}/g, ''));
		},
		init2: function () {
			if (!this.data('databind_template')) {
				this.data('databind_template', this.html().replace(/[\t|\n]/g, ''));
			}
			this.empty();
		},
		newrow: function () {
			this.append(this.data('databind_template').replace(/\!\{.+?\}/g, ''));
		},
		setdata: function () {
			this.empty();
			methods.sub.apply(this, arguments);
		},
		add: function () {
			methods.sub.apply(this, arguments);
		},
		sub: function (data, before_callback, after_callback) {
			if (data === undefined) return;
			if (!this.data('databind_template')) return;
			if (!$.isArray(data)) {	//配列で無い場合の対応
				var wdata = data;
				data = [];
				data[0] = wdata;
			}
			for (var i = 0; i < data.length; i++) {
				if (typeof before_callback === 'function') {
					var ret = before_callback(data[i], i);
					if (ret !== undefined) {
						if (ret) {
							continue;
						} else {
							break;
						}
					}
				}
				var html = this.data('databind_template');
				for (key in data[i]) {
					var bef = new RegExp('\!\{' + key + '\}', 'g');
					html = html.replace(bef, data[i][key]);
				}
				this.append(html);
				if (typeof after_callback === 'function') {
					var ret = after_callback(data[i], i);
					if (ret !== undefined) {
						if (ret) {
							continue;
						} else {
							break;
						}
					}
				}
			}
		}
	};

	$.fn.databind = function (method) {
		var sv_arg = arguments;
		// 要素を1つずつ処理
		return this.each(function () {
			// メソッド呼び出し部分
			if (methods[method]) {
				return methods[method].apply($(this), Array.prototype.slice.call(sv_arg, 1));
			} else if (!method && sv_arg.length === 0) {
				return methods.init2.apply($(this), sv_arg);
			} else if (typeof method === 'object' || !method) {
				return methods.setdata.apply($(this), sv_arg);
			} else {
				$.error('Method ' + method + ' does not exist on jQuery.tooltip');
			}
		});
	};

})(jQuery);
//------------------------------------------------------------------------------------------------------------
// JQuery プラグイン databindex     http://chintaikanri.leopalace21.com/siro/doc.html#databind
//------------------------------------------------------------------------------------------------------------
; (function ($) {

	var methods = {
		init: function () {
			if (!this.data('databind_template')) {
				this.data('databind_template', this.html().replace(/[\t|\n]/g, ''));
			}
			this.html(this.html().replace(/\!\{.+?\}/g, ''));
		},
		init2: function () {
			if (!this.data('databind_template')) {
				var html = this.html();
				var ary = html.match(/\@\{.+?\}/g);
				if (ary !== null) {
					html = html.replace(/\@\{(.+?)\}/g,'$1');
					for (var i=0; i<ary.length; i++) {
						ary[i] = ary[i].replace(/\@\{(.+?)\}/g,'$1');
						this.data('databind_'+ary[i],$(html).find('.'+ary[i]).prop('outerHTML'));
					}
					this.data('databind_arykey',ary.join(','));
				}
				this.data('databind_template', html.replace(/[\t|\n]/g, ''));
			}
			this.empty();
		},
		newrow: function () {
			this.append(this.data('databind_template').replace(/\!\{.+?\}/g, ''));
		},
		setdata: function () {
			this.empty();
			methods.sub.apply(this, arguments);
		},
		add: function () {
			methods.sub.apply(this, arguments);
		},
		sub: function (data, before_callback, after_callback) {
			function recursive(wdata,$this,kaiso) {
				let ari = false;
				for (var key in wdata) {
					if ($.isArray(wdata[key])) {
						ari = true;
						for (var i=0; i<wdata[key].length; i++) {
							if ($this.data('databind_'+key) !== undefined) {
								if (i > 0) {
									var obj = $(html);
									obj.find('.'+key+':last').after($this.data('databind_'+key));
									html = obj.prop('outerHTML');
								}
							}
							recursive(wdata[key][i],$this,kaiso+1);
						}
					} else {
						var bef = new RegExp('\!\{' + key + '\}', 'g');
						html = html.replace(bef, wdata[key]);
					}
				}
				if (ari === false && arykey[kaiso]) {
					var obj = $(html);
					obj.find('.'+arykey[kaiso]+':last').remove();
					html = obj.prop('outerHTML');
				}
			}
			if (data === undefined) return;
			if (!this.data('databind_template')) return;
			if (!$.isArray(data)) {	//配列で無い場合の対応
				var wdata = data;
				data = [];
				data[0] = wdata;
			}
			var arykey;
			for (var i = 0; i < data.length; i++) {
				if (this.data('databind_arykey') !== undefined) {
					arykey = this.data('databind_arykey').split(',');
				}
				if (typeof before_callback === 'function') {
					var ret = before_callback(data[i], i);
					if (ret !== undefined) {
						if (ret) {
							continue;
						} else {
							break;
						}
					}
				}
				var html = this.data('databind_template');
				recursive(data[i],this,0);
				this.append(html);
				if (typeof after_callback === 'function') {
					var ret = after_callback(data[i], i);
					if (ret !== undefined) {
						if (ret) {
							continue;
						} else {
							break;
						}
					}
				}
			}
		},
		addchild: function (data,target) {
			// 配下オブジェクトの追加　data内容をtargetの次に挿入
			var html = '';
			function recursive(wdata,$this,arykey,fast) {
				for (var key in wdata) {
					if ($.isArray(wdata[key])) {
						for (var i=0; i<wdata[key].length; i++) {
							if ($this.data('databind_'+key) !== undefined) {
								if (arykey) {
									var no = arykey.indexOf(key);
									if (no > -1) {
										arykey.splice(no, 1);
									}
								}
								if (i > 0 || fast) {
									if (html === '') {
										html = $this.data('databind_'+key);
									} else {
										var obj = $(html);
										obj.find('.'+key+':last').after($this.data('databind_'+key));
										html = obj.prop('outerHTML');
									}									
								}
							}
							recursive(wdata[key][i],$this,arykey,false);
						}
					} else {
						var bef = new RegExp('\!\{' + key + '\}', 'g');
						html = html.replace(bef, wdata[key]);
					}
				}
				return arykey;
			}			
			var arykey;
			if (this.data('databind_arykey') !== undefined) {
				arykey = this.data('databind_arykey').split(',');
			}
			warykey = recursive(data,this,arykey,true);
			if (warykey) {
				var obj = $(html);
				for (var j=0; j<warykey.length; j++) {
					obj.find('.'+warykey[j]).remove();
				}
				html = obj.prop('outerHTML');
			}
			target.after(html);
		}
	};

	$.fn.databindex = function (method) {
		var sv_arg = arguments;
		// 要素を1つずつ処理
		return this.each(function () {
			// メソッド呼び出し部分
			if (methods[method]) {
				return methods[method].apply($(this), Array.prototype.slice.call(sv_arg, 1));
			} else if (!method && sv_arg.length === 0) {
				return methods.init2.apply($(this), sv_arg);
			} else if (typeof method === 'object' || !method) {
				return methods.setdata.apply($(this), sv_arg);
			} else {
				$.error('Method ' + method + ' does not exist on jQuery.tooltip');
			}
		});
	};
})(jQuery);

(function( $ ){
	$.alert = function(message) {
		var dfd = $.Deferred();
	  	// ダイアログを作成
	  	var dlg = $( "<div></div>" ).dialog({
			title: '確認',
		  	modal: true,
		  	buttons: {
			  	'ＯＫ': function() {
				  	$( this ).dialog('close');
					dfd.resolve();
			  	}
		  	}
	  	});
	  	dlg.html(message);
	  	return dfd.promise();
	};
  
	$.confirm = function(message) {
	  	var dfd = $.Deferred();
		var okclick = false;
	  	// ダイアログを作成
	  	var dlg = $( "<div></div>" ).dialog({
			title: '確認',
		  	modal: true,
			close: function() {
				if (okclick) {
					dfd.resolve("yes");
				} else {
					dfd.reject('cancel');
				}
			},
		  	buttons: {
			  	'ＯＫ': function() {
					okclick = true;	
					$( this ).dialog('close');
				},
				'キャンセル': function(event, ui) {
					$( this ).dialog('close');
				}
			}
		});
		dlg.html(message);
		return dfd.promise();
	};
  })( jQuery );