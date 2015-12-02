#jQuery.CZRDatepicker

##可选参数

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

##Next step

年月日的日样式变更，加入农历显示，计划以iOS的日历框为参考
