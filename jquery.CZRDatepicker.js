;(function(global, document, $, undefined) {
	var 
	//每个日历框赋予一个id
	_uid = 0,
	$doc = $(document),

	//模板文件
	_panelTmpl = '<div class="date_picker">{0}</div>',
    _yearTmpl = '<div class="picker_year"><strong title="点击以选择年份">{0}</strong><em class="arrow_t" title="前一年"></em><em class="arrow_b" title="后一年"></em><div class="picker_panel"><div class="picker_inner">{1}</div><strong class="prev" title="前{2}年"><em class="arrow_l"></em></strong><strong class="next" title="后{2}年"><em class="arrow_r"></em></strong><i class="tab"></i></div>{3}</div>',
    _monthTmpl = '<div class="picker_month"><strong title="点击以选择月份">{0}</strong><em class="arrow_t" title="前一月"></em><em class="arrow_b" title="后一月"></em><div class="picker_panel"><div class="picker_inner">{1}</div><strong class="prev" title="前一年"><em class="arrow_l"></em></strong><strong class="next" title="后一年"><em class="arrow_r"></em></strong><i class="tab"></i></div>{2}</div>',
    _dayTmpl = '<div class="picker_day"><strong title="点击以选择日期">{0}</strong><em class="arrow_t" title="前一天"></em><em class="arrow_b" title="后一天"></em><div class="picker_panel"><div class="picker_inner">{1}</div><strong class="prev" title="前一月"><em class="arrow_l"></em></strong><strong class="next" title="后一月"><em class="arrow_r"></em></strong><i class="tab"></i></div>{2}</div>',

    //常用正则与函数
    rblock = /\{([^\}]*)\}/ig,
    toolUtil = {
    	//渲染模板
    	render: function(tmpl) {
    		var args = Array.prototype.slice.call(arguments, 1);

    		return tmpl.replace(rblock, function(match, sub) {
    			return args[sub] !== null ? args[sub] : match;
    		});
    	},

    	//填充字符串，使其满足特定格式，如：月份均为2位数，则第二个参数为2
    	paddStr: function(str, len) {
    		return ('000000' + str).slice(-len);
    	},

    	//返回el的节点名称，或判断el的节点名称是否为name
    	nodeName: function(el, name) {
    		var node = el.nodeName.toUpperCase();
    		return typeof name === 'string' ? node === name.toUpperCase() : node;
    	},

    	//把obj浅复制到target
    	mix: function(target, obj) {
    		Object.prototype.toString.call(obj) !== '[object Object]' && (obj = {})

    		for (var k in obj) {
    			target[k] = obj[k];
    		}

    		return target;
    	},

    	noop: function(){}
    };

    /**
     * CZRDatepicker OOP
     */
	var CZRDatepicker = global.CZRDatepicker = function(opts) {
		this.init(opts || {});
	};

	//构造对象/全局对象的方法，类似RegExp的全局方法
	CZRDatepicker.defaultOptions = {
        shell: null,
        shellTriggerEvent: 'click.DatePicker focus.DatePicker',
        follow: null,
        followOffset: [0, 0],
        showMode: 0,    //0 - 年月日, 1 - 年月, 2 - 年
        autoHide: true,
        effect: 'show',
        effectDuration: 0,
        altFormat: 'yyyy-mm-dd',
        unitYearSize: 12,
        defaultDate: null,
        minDate: null,
        maxDate: null,
        onselect: toolUtil.noop,
        onmouseenter: toolUtil.noop,
        onmouseleave: toolUtil.noop
    };

	CZRDatepicker.parseDate = function(formatDate, splitStr) {
		splitStr = splitStr || '-';

		var
        date = new Date(),
        rDate = new RegExp('(\\d+)\\' + splitStr + '(\\d+)\\' + splitStr + '(\\d+)');
        if(rDate.test(formatDate)){
            date.setFullYear(RegExp.$1);
            date.setMonth(parseInt(RegExp.$2, 10) - 1);
            date.setDate(RegExp.$3);
        }
        return date;
	};

	CZRDatepicker.formatDate = function(date, format) {
		var result = '';

		format = format || 'yyyy-mm-dd';

        result = format.replace(/yyyy/g, toolUtil.paddStr(date.getFullYear(), 4));
        result = result.replace(/mm/g, toolUtil.paddStr(date.getMonth() + 1, 2));
        result = result.replace(/dd/g, toolUtil.paddStr(date.getDate(), 2));
        return result;
	};

	CZRDatepicker.prototype = {
		constructor: CZRDatepicker,

		init: function(opts) {
			//合并选项
			var _opts = CZRDatepicker.defaultOptions;
			for (var k in _opts) {
				if (opts[k] === void 0) {
					opts[k] = _opts[k];
				}
			}

			//绑定click、focus事件
			var 
			self = this,
			shell = this.shell = $(opts.shell).on(opts.shellTriggerEvent, function(eve) {
				self.show();
			});

			this.id = ++_uid;
			this.opts = opts;
			this.curDate = CZRDatepicker.parseDate(opts.defaultDate);
            this.minDate = CZRDatepicker.parseDate(opts.minDate || '1680-1-1');
            this.maxDate = CZRDatepicker.parseDate(opts.maxDate || '2999-12-12');
            this.initField();
		},

		initField: function() {
			var
			self = this,
			opts = this.opts,
			curDate = this.curDate;

			this.follow = !!opts.follow ? $(ops.follow) : this.shell;

			//根据showMode确定模板的加载，二级日历框单独构造
			var html = toolUtil.render(_yearTmpl, curDate.getFullYear(), '', opts.unitYearSize, '');
			if (opts.showMode < 2) {
				html += toolUtil.render(_monthTmpl, toolUtil.paddStr(curDate.getMonth() + 1, 2), '', '');
			}
			if (opts.showMode < 1) {
				html += toolUtil.render(_dayTmpl, toolUtil.paddStr(curDate.getDate(), 2), '', '');
			}

			//赋予日历框对象 elems
			var
			dom = this.DOM = $(toolUtil.render(_panelTmpl, html)).hide(),
			yearElem = this.yearElem = dom.find('.picker_year'),
            monthElem = this.monthElem = dom.find('.picker_month'),
            dayElem = this.dayElem = dom.find('.picker_day');
            this.yearLabel = yearElem.find('strong').eq(0);
            this.yearPanel = yearElem.find('.picker_inner').eq(0);
            this.monthLabel = monthElem.find('strong').eq(0);
            this.monthPanel = monthElem.find('.picker_inner').eq(0);
            this.dayLabel = dayElem.find('strong').eq(0);
            this.dayPanel = dayElem.find('.picker_inner').eq(0);

            //小方法：获取当前事件目标是年 or 月 or 日
            function getMehod(ele) {
            	var method = '';
            	if (/picker_([^\s]+)/.test(ele.className)) {
            		method = RegExp.$1;
            		return method.charAt(0).toUpperCase() + method.slice(1);
            	}

            	return method;
            }

            //对日历框绑定事件, 使用代理，共五种事件
            //触发哪种事件的判断，依赖日历框的dom结构
            dom.on('click', function(eve) {
            	var
            	rDir = /prev|next/,
            	target = eve.target,
            	nodeName = toolUtil.nodeName(target),
            	parentNode = target.parentNode,
            	parentClass = parentNode.className,
            	method = getMehod(parentNode);

            	//picker_inner: a
            	if (nodeName === 'A' && parentClass.indexOf('picker_inner') > -1) {
            		method = getMehod(parentNode.parentNode.parentNode);
            		self['set' + method](target.innerHTML);

            		if (method === 'Year' && opts.showMode < 2) {
            			self.chooseMonth();
            		} else if (method === 'Month' && opts.showMode < 1) {
            			self.chooseDay();
            		} else if (!opts.autoHide) {
            			self.hidePanel();
            		} else {
            			self.hide();
            		}
            	} 
            	//picker_pannel: next prev i
            	else if (parentClass.indexOf('picker_panel') > -1 || nodeName === 'EM' && rDir.test(parentClass)) {
            		if (nodeName === 'I') {
            			self.hidePanel();
            		} else if (nodeName === 'EM') {
            			//em转化为strong，下面统一处理
            			target = parentNode;
            		}

            		if (toolUtil.nodeName(target) === 'STRONG') {
            			method = getMehod(target.parentNode.parentNode);

            			var isNext = target.className.indexOf('next') > -1;
            			if (method === 'Day') {
            				self[isNext ? 'nextMonth' : 'prevMonth']();
            			} else if (method === 'Month') {
            				self[isNext ? 'nextYear' : 'prevYear']();
            			} else {
            				self[isNext ? 'nextYear' : 'prevYear'](opts.unitYearSize);
            			}

            			self['choose' + method]();
            		}
            	}
            	//picker_$$: 点击选择$$ next$$ prev$$
            	else if (parentClass.indexOf('picker_') > -1) {
            		if (nodeName === 'STRONG') {
            			self['choose' + method]();
            		} else if (nodeName === 'EM') {
            			var isPrev = target.className.indexOf('arrow_t') > -1;
            			self[(isPrev ? 'prev' : 'next') + method]();
            		}
            	}
            	else {
            		self.hidePanel();
            	}

            	//保持shell聚焦
            	self.shell.focus();

            	//阻止冒泡
            	eve.preventDefault();
            	eve.stopPropagation();
            }).hover(function() {
            	opts.onmouseenter.apply(self, arguments);
            }, function() {
            	opts.onmouseleave.apply(self, arguments);
            });

            //添加到DOM树中：不确定dom与插件的加载顺序
            document.body ? dom.appendTo('body') : $(function() {
            	dom.appendTo('body');
            });
		},

		setDate: function(date) {
			var
			opts = this.opts,
			preDate = this.curDate,
			curDate = typeof date === 'object' ? date : CZRDatepicker.parseDate(date);

			//确保日期的合法：prev和next操作可能会带来不合法的日期
			curDate = new Date(Math.min(+this.maxDate, Math.max(+this.minDate, +curDate)));

			this.yearLabel.html(toolUtil.paddStr(curDate.getFullYear(), 4));
			this.monthLabel.html(toolUtil.paddStr(curDate.getMonth() + 1, 2));
			this.dayLabel.html(toolUtil.paddStr(curDate.getDate(), 2));

			this.shell[0] && this.shell.val(CZRDatepicker.formatDate(curDate));
			this.curDate = curDate;
		},

		opened: false,
		show: function() {
			if (this.opened) {
				return this;
			}

			var self = this,
				opts = this.opts;

			this.hidePanel().position();
			this.DOM[opts.effect](opts.effectDuration > 0 ? opts.effectDuration : undefined);

			if (opts.autoHide) {
				setTimeout(function() {
					$doc.on('click.datePicker_' + self.id, function(eve) {
						if (eve.target !== self.shell[0]) {
							$doc.unbind('click.datePicker_' + self.id);
							self.hide();
						}
					});
				}, 10);
			}

			this.opened = true;
			return this;
		},

		hide: function() {
			if (!this.opened) {
				return this;
			}

			$doc.unbind('click.datePicker_' + this.id);
			this.hidePanel();
			this.DOM.hide();
			this.opened = false;
			return this;
		},

    	position: function(x, y) {
    		if (typeof x !== 'number') {
    			var opts = this.opts,
    				originPos = this.follow.offset();

    			x = originPos.left + opts.followOffset[0];
    			y = originPos.top + opts.followOffset[1];
    		}

    		this.DOM.css({left: x, top: y});
    		return this;
    	}
	};

	/**
	 * 扩展CZRDatepicker.prototype
	 */
	var
	rWord = /([^,|]+)/g,
	baseWord = 'Year,Month,Day',
	fn = CZRDatepicker.prototype,
	//方便统一调用Date实例的getxx函数
	switchWord = { Year: 'FullYear', Day: 'Date'};

	//html拼接picker_inner模板
	var _itemTmpl = '<a href="javascript:;" title="{0}"{1}>{2}</a>';
	var htmlFn = {
		Year: function(curDate, minDate, maxDate, size) {
			var
			i, html = '',
			curYear = curDate.getFullYear(),
			maxYear = maxDate.getFullYear(),
			minYear = minDate.getFullYear(),
			startYear = Math.min(maxYear, Math.max(curYear - parseInt(size / 2, 10), minYear)),
			endYear = Math.max(minYear, Math.min(startYear + size - 1, maxYear));

			for (i = startYear; i <= endYear; i++) {
				html += toolUtil.render(_itemTmpl, i + '年', i === curYear ? ' class="hover"': '', i);
			}

			return html;
		},
		Month: function(curDate, minDate, maxDate) {
			var
			i, html = '',
			curMonth = curDate.getMonth(),
			curYear = curDate.getFullYear(),
			startMonth = curYear === minDate.getFullYear() ? minDate.getMonth() : 0,
			endMonth = curYear === maxDate.getFullYear() ? maxDate.getMonth() : 11;
			
			for (i = startMonth; i <= endMonth; i++) {
				html += toolUtil.render(_itemTmpl, i + 1 + '月', i === curMonth ? ' class="hover"' : '', i + 1);
			}

			return html;
		},
		Day: function(curDate, minDate, maxDate) {
			var
			i, html = '',
			//tempDate用来实现一个月有多少天的功能
			tempDate = new Date(+curDate),
			curDay = curDate.getDate(),
			curMonth = curDate.getMonth(),
			curYear = curDate.getFullYear(),
			startDay = curYear === minDate.getFullYear() || curMonth === minDate.getMonth() ? minDate.getDate() : 1,
			endDay = curYear === maxDate.getFullYear() || curMonth === maxDate.getMonth() ? maxDate.getDate() : 31;
			
			var
			curWeek = curDate.getDay(),
			weeks = ['天', '一', '二', '三', '四', '五', '六'];

			for (i = startDay; i <= endDay; i++) {
				if (i > 28 && tempDate.setDate(i) && tempDate.getDate() !== i) {
					break;
				}

				curWeek = tempDate.setDate(i) && tempDate.getDay(); 
				curWeekName = weeks[curWeek];
				html += toolUtil.render(_itemTmpl, '星期' + curWeekName, curDay === i ? ' class="hover"' : '', i);
			}

			return html;
		}
	};

	//基础功能: choose, set, next/prev
	baseWord.replace(rWord, function(match, k) {
		//choose
		fn['choose' + k] = function() {
			var
			key = k.toLowerCase(),
			elem = this[key + 'Elem'],
			panel = this[key + 'Panel'],
			html = htmlFn[k](this.curDate, this.minDate, this.maxDate, this.opts.unitYearSize);

			panel.html(html);
			this.hidePanel(function(value){return value !== key;});
			panel.parent().show();
			elem.addClass('focus').show();

			return this;
		};

		//set
		fn['set' + k] = function(val) {
			var date = this.curDate;
			k === 'Year' && date.setFullYear(val);
			k === 'Day' && date.setDate(val);
			k === 'Month' && date.setMonth(val - 1);

			return this.setDate(date);
		};

		//prev
		fn['prev' + k] = function(val) {
			var
			key = switchWord[k] || k,
			date = new Date(+this.curDate),
			newVal = date['get' + key]() - (val || 1);

			if (newVal < 0) {
				if (k === 'Month') {
					date.setFullYear(date.getFullYear() - 1);
					date.setMonth(newVal + 12);
				} else if (k === 'Day') {
					data.setTime(+date - val * 24 * 60 * 60 * 1000);
				}
			} else {
				date['set' + key](newVal);
			}

			return this.setDate(date);
		};

		//next
		fn['next' + k] = function(val) {
			var
			key = switchWord[k] || k,
			date = new Date(+this.curDate),
			newVal = date['get' + key]() + (val || 1);

			date['set' + key](newVal);

			return this.setDate(date);
		};
	});

	//增加hidePanel
	toolUtil.mix(fn, {
		hidePanel: function(filter) {
			var self = this;
			
			filter = filter || toolUtil.noop;
			baseWord.replace(rWord, function(match, k) {
				var
				key = k.toLowerCase(),
				elem = self[key + 'Elem'],
				panel = self[key + 'Panel'];

				if (filter.call(self, key, panel) !== false) {
					panel.parent().hide();
					elem.removeClass('focus');
				}
			});

			return this;
		}
	});

	/**
	 * 扩展jQuery
	 */
	$.fn.CZRDatepicker = function(opts) {
		//typeof 各个类型得到的结果？
		typeof opts !== 'object' && (opts = {});

		opts.shell = this;
		return this.data('CZRDatepicker', new CZRDatepicker(opts));
	};

	/**
	 * 引入CSS
	 */
    var css = '.date_picker{ font:14px/1.5 "5FAE8F6F96C59ED1","Microsoft Yahei",Arial; position:absolute;}.date_picker, .picker_panel{ width:183px;}.picker_year, .picker_month, .picker_day{ float:left; display:inline; background:#fff; border:1px solid #d3d3d3; border-radius:5px; box-shadow:0 0 4px rgba(0,0,0,.2); margin-right:1px; height:60px; width:58px; position:relative; z-index:1; white-space:nowrap;}.date_picker .focus{ z-index:2;}.date_picker .focus .picker_panel{ display:block;}.date_picker strong{ color:#666; cursor:pointer; margin-top:-10px; height:20px; width:100%; position:absolute; left:0; top:50%; text-align:center; z-index:3;}.date_picker .line{ border-top:1px solid #d3d3d3; font-size:0; height:0; width:100%; position:absolute; left:0; top:50%;}.date_picker .arrow_t, .date_picker .arrow_r, .date_picker .arrow_b, .date_picker .arrow_l{ border-color:#cbcbcb transparent; border-style:solid dashed; border-width:0 6px 6px; cursor:pointer; font-size:0; height:0; width:0; position:absolute; z-index:1;}.date_picker .arrow_t{ border-width:6px 6px 0; left:22px; bottom:6px;}.date_picker .arrow_b{ left:22px; top:6px;}.date_picker .arrow_r, .date_picker .arrow_l{ border-color:transparent #cbcbcb; border-style:dashed solid; border-width:6px 0 6px 6px;}.date_picker .arrow_l{ border-width:6px 6px 6px 0;}.picker_panel{ display:none; margin-left:-1px; position:absolute; left:0; top:36px; z-index:9;}.picker_panel .picker_inner{ background:#fff; border:1px solid #d3d3d3; border-radius:5px; padding:6px 0 5px 5px; position:relative; z-index:2; overflow:hidden; *zoom:1;}.picker_panel .picker_inner a{ float:left; border-radius:3px; color:#666; font:14px/25px Arial; height:25px; width:56px; text-align:center; text-decoration:none;}.picker_panel .picker_inner a:hover, .picker_panel .picker_inner a.hover{ background:#ddd; color:#333; text-decoration:none;}.picker_panel .picker_inner a:hover{ background:#d0d0d0;}.picker_panel .tab{ background:#fff; border:1px solid #d3d3d3; border-bottom-width:0; border-radius:5px 5px 0 0; font-size:0; height:18px; width:58px; position:absolute; left:0; top:-18px; z-index:3;}.picker_panel .prev, .picker_panel .next{ background:#fff; border:1px solid #d3d3d3; border-radius:12px; cursor:pointer; margin:-16px 0 0 -14px; height:24px; width:24px; position:absolute; left:0; top:50%; z-index:1; box-shadow:0 0 3px rgba(0,0,0,.2);}.picker_panel .next{ margin-left:0; margin-right:-14px; left:auto; right:0;}.picker_panel .arrow_l{ margin:-6px 0 0 4px; left:0; top:50%;}.picker_panel .arrow_r{ margin:-6px 4px 0 0; left:auto; right:0; top:50%;}.picker_panel .prev:hover, .picker_panel .next:hover{ border-color:#999;}.picker_panel .prev:hover .arrow_l, .picker_panel .next:hover .arrow_r{ border-color:transparent #999;}.picker_year .picker_inner{ border-radius:0 5px 5px 5px;}.picker_month .picker_panel{ margin-left:-62px;}.picker_month .picker_inner{ border-radius:5px 0 5px 5px;}.picker_month .tab{ margin-left:61px;}.picker_day .picker_panel{ margin-left:-123px;}.picker_day .picker_inner{ border-radius:5px 0 5px 5px;}.picker_day .tab{ margin-left:122px;}.picker_inner{ box-shadow:0 0 4px rgba(0,0,0,.2); margin:0 1px 0 0; overflow:hidden; *zoom:1;}.picker_main a{ float:left; cursor:pointer;}.picker_main a:hover{ background:#ccc;}';
    $(function(){
        var style = document.createElement('style'), head = document.head || document.getElementsByTagName('head')[0];
        style.type = 'text/css';
        !style.styleSheet ? (style.innerHTML = css) : (style.styleSheet.cssText = css);
        head.insertBefore(style, head.firstChild);
    });
})(window, document, jQuery);