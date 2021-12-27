// slickgrid用マルチセレクトエディター
(function ($) {
    $.extend(true, window, {
        "Extends": {
            "Editors": {
                "MultiSelect": MultiSelectEditor
            },
            "Formatters": {
                "MultiSelect": MultiSelectFormatter
            }
        }
    });

    function MultiSelectEditor(args) {
        var $mselect;
        var defaultValue;
        var scope = this;

        this.init = function () {
            var option_str = "";
            for( key in args.column.options ){
                option_str += "<OPTION value='" + key +"'>" + args.column.options[key] + "</OPTION>";
            }
            var select = '<SELECT style="margin-bottom: 1px" tabIndex="0" class="editor-mselect">'+ option_str +'</SELECT>';
            for( var i=0; args.item[args.column.field] !== "" && i<args.item[args.column.field].length; i++) {
                select += '<SELECT style="margin-bottom: 1px" tabIndex="0" class="editor-mselect">'+ option_str +'</SELECT>';
            }
            $mselect = $('<DIV style="display:none;z-index:10000;position:absolute;white-space:pre-wrap;border:2px solid #8888aa;width:'+(args.column.width+1)+'px">'+ select +'</DIV>')
                .appendTo($('body'));
            $mselect.children('SELECT').eq(0).focus();

            $mselect.on('change','select',function() {
                if ($mselect.children('SELECT:last').is($(this))) {
                    $mselect.append('<SELECT style="margin-bottom: 1px" tabIndex="0" class="editor-mselect">'+ option_str +'</SELECT>');
                } else if ($(this).val() === '0' || $(this).val() === '') {
                    $(this).remove();
                }
            });
            scope.position(args.position);
        };

        this.destroy = function () {
            $mselect.remove();
        };

        this.focus = function () {
            $mselect.children('SELECT').eq(0).focus();
        };
        this.hide = function () {
            $mselect.hide();
        };
        this.show = function () {
            $mselect.show();
        };
        this.position = function (position) {
            $mselect
              .css("top", position.top)
              .css("left", position.left).show();
        };

        this.loadValue = function (item) {
            if (Array.isArray(item[args.column.field])) {
                defaultValue = item[args.column.field];
            } else {
                defaultValue = [];
            }
            defaultValue.forEach(function(value,i) {
                $mselect.children('SELECT').eq(i).val(value);
            })
        };

        this.serializeValue = function () {
            var value = [];
            $mselect.children('SELECT').each(function(i) {
                if ($(this).val() !== '0' && $(this).val() !== '') {
                    value.push($(this).val());
                }
            });
            return value;
        };

        this.applyValue = function (item, state) {
            item[args.column.field] = state;
        };

        this.isValueChanged = function () {
            var value = [];
            $mselect.children('SELECT').each(function(i) {
                if ($(this).val() !== '0' && $(this).val() !== '' && $(this).val() !== null) {
                    value.push($(this).val());
                }
            });
            return (JSON.stringify(value) != JSON.stringify(defaultValue));
        };

        this.validate = function () {
            return {
                valid: true,
                msg: null
            };
        };

        this.init();
    }

    function MultiSelectFormatter(row, cell, value, columnDef, dataContext) {
        if (value === '') {
            return '';
        }
        let lbl = [];
        value.forEach(function(item) {
            lbl.push(columnDef.options[item]);
        });
        return lbl.join(' / ');
    }

})(jQuery);