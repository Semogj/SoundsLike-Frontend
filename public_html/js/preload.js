// Define configuration defaults
$.fn.qtip.defaults.show = {
    target: false,
    event: 'mouseenter',
    effect: true,
    delay: 0,
    solo: false,
    ready: false,
    modal: false
};

$.fn.qtip.defaults.hide = {
    target: false,
    event: 'mouseleave',
    effect: true,
    delay: 0,
    fixed: false,
    inactive: false
};
$.fn.qtip.defaults.style = {
    classes: 'tooltip',
    widget: false,
    tip: {
        corner: true,
        mimic: false,
        width: 12,
        height: 12,
        border: true,
        offset: 0
    }
};
