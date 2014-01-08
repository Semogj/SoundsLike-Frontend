

// If you’re reading this, that means you have been put in charge of my previous project.
// I am so, so sorry for you. God speed.
/*
 1 minute	60 seconds
 1 hour	3600 seconds
 1 day	86400 seconds
 1 week	604800 seconds
 1 month (30.44 days) 	2629743 seconds
 1 year (365.24 days) 	 31556926 seconds
 */

var TIME_SECOND = 1,
        TIME_MINUTE = 60,
        TIME_HOUR = 3600,
        TIME_DAY = 86400,
        TIME_WEEk = 604800,
        TIME_MONTH_28 = 2419200,
        TIME_MONTH_29 = 2505600,
        TIME_MONTH_30 = 2592000,
        TIME_MONTH_31 = 2678400,
        TIME_MONTH = 2629743, // average  of 30.44 days
        TIME_YEAR_365 = 31536000,
        TIME_YEAR_366 = 31622400,
        TIME_YEAR = 31556926;//average of 365.24 days
var MultiTimeline = function(config, DOMelem, elements) {
    //based on http://bl.ocks.org/1962173
    var lanes = [{id: 0, label: "segments"}];
    var items = elements || [];
    var now = 0;
    var timelinesObj = this;
    /* Item: {
     id: item.id,
     lane: laneId,
     start: item.start,
     end: item.end,
     class: item.end > now ? 'future' : 'past',
     desc: item.desc 
     }*/
    var DOMselector = $(DOMelem);

//        DOMselector.toggleClass("invisible", true);


    var margin = {top: config.marginTop || 1, right: config.marginRight || 1,
        bottom: config.marginBottom || 1, left: config.marginLeft || 1};

    var canvasWidth = (config.width || DOMselector.width()) - margin.left - margin.right;
    var canvasHeight = (config.height || DOMselector.height()) - margin.top - margin.bottom;

    DOMselector.html("");
    DOMselector.fadeOut(0);

    var canvasX = margin.left;
    var canvasY = margin.top;

    var topMargin = canvasHeight * (2 / 20);
    var miniHeight = canvasHeight * (3 / 20);
    var midMargin = canvasHeight * (5 / 20);
    var mainHeight = canvasHeight * (7 / 20);

    var pBrushCenter;
    var currentTime;

    var XmainInterval = 3;
    var mainRectHeight = 0.60;
    var XminiInterval = 3;
    var miniRectHeight = 0.4;
    var initialMainInterval = config.brushInterval || 45; //brush size in seconds

    var itemSizeSeconds = items.length > 0 ? items[0].end - items[0].start : 1;
    var maxZoomAreaInSeconds = config.MaxZoomArea || itemSizeSeconds * (config.MaxZoomAreaMultiplier || 160);

    var YminiScale = d3.scale.linear().domain([0, 1]).range([0, miniHeight]);
    var YmainScale = d3.scale.linear().domain([0, 1]).range([0, mainHeight]);

    var XticksDenseScale = Math.round(d3.scale.linear().domain([0, 400]).range([1, 10])(canvasWidth));
    var XticksSparceScale = Math.round(d3.scale.linear().domain([0, 400]).range([1, 6])(canvasWidth));
    var maxItemEnd = d3.max(items,
            function(item) {
                return item.end;
            });

    var XminiScale = d3.scale.linear()
            .domain([0, maxItemEnd]) //+ XmainInterval * (items.length - 1)
            .range([0, canvasWidth]);
    var XmainScale = d3.scale.linear()
            .domain([0, maxItemEnd]) //+ XmainInterval * (items.length - 1)
            .range([0, canvasWidth]);

    this.chart = d3.select(DOMelem).append('svg:svg')
            .attr('width', canvasWidth + margin.right + margin.left)
            .attr('height', canvasHeight + margin.top + margin.bottom)
            .attr('class', 'timeline chart');

    this.chart.append('defs').append('clipPath')
            .attr('transform', 'translate(0,0)')
            .attr('id', 'clip')
            .append('rect')
            .attr('width', canvasWidth)
            .attr('height', mainHeight);
    var mainGraph = this.chart.append('g')
            .attr('transform', 'translate(' + canvasX + ',' + (canvasY + miniHeight + topMargin + midMargin) + ')')
            .attr('width', canvasWidth)
            .attr('height', mainHeight)
            .attr('class', 'mainGraph');

    var topMainXAxis = d3.svg.axis()
            .scale(XmainScale)
            .orient('top')
            .ticks(XticksSparceScale)
            .tickFormat(secondsToHms)
            .tickSize(1);
    var botMainXAxis = d3.svg.axis()
            .scale(XmainScale)
            .orient('bottom')
            .ticks(XticksDenseScale)
            .tickFormat(secondsToHms)
            .tickSize(1);
    //draw the top axis
    mainGraph.append('g')
            .attr('transform', 'translate(0, 0.5)')
            .attr('class', 'main axis top')
            .call(topMainXAxis);
    //draw the bottom axis
    mainGraph.append('g')
            .attr('transform', 'translate(0, ' + (mainHeight - 0.5) + ')')
            .attr('class', 'main axis bottom')
            .call(botMainXAxis);

    var miniGraph = this.chart.append('g')
            .attr('transform', 'translate(' + canvasX + ',' + (canvasY + topMargin) + ')')
            .attr('width', canvasWidth)
            .attr('height', miniHeight)
            .attr('class', 'miniGraph');

    var topMiniXAxis = d3.svg.axis()
            .scale(XminiScale)
            .orient('top')
            .ticks(XticksSparceScale)
            .tickFormat(secondsToHms)
            .tickSize(1);
    var botMiniXAxis = d3.svg.axis()
            .scale(XminiScale)
            .orient('bottom')
            .ticks(XticksDenseScale)
            .tickFormat(secondsToHms)
            .tickSize(1);
    //draw the top axis
    miniGraph.append('g')
            .attr('transform', 'translate(0, 0.5)')
            .attr('class', 'mini axis top')
            .call(topMainXAxis);
    //draw the bottom axis
    miniGraph.append('g')
            .attr('transform', 'translate(0, ' + (miniHeight - 0.5) + ')')
            .attr('class', 'mini axis bottom')
            .call(botMainXAxis);

    //draw the current time markers
    var mainCurrentTimeMarker = mainGraph.append('g')
            .attr('class', 'now');
    mainCurrentTimeMarker.append('line')
            .attr('x1', -10)
            .attr('x2', -10)
            .attr('y1', 3)
            .attr('y2', mainHeight - 3);
    var miniCurrentTimeMarker = miniGraph.append('g')
            .attr('class', 'now');
    miniCurrentTimeMarker.append('line')
            .attr('x1', -10)
            .attr('x2', -10)
            .attr('y1', 0)
            .attr('y2', miniHeight);
    //draw the items
    var mainItemRectangles = mainGraph.append('g')
            .attr('clip-path', 'url(#clip)'); //set the clipping defined previously
    var miniItemRectangles = miniGraph.append('g');
//                .attr('clip-path', 'url(#clip)'); //set the clipping defined previously

    updateMiniTimeline();

    // invisible hit area to move around the selection window
    miniGraph.append('rect')
            .attr('pointer-events', 'painted')
            .attr('width', canvasWidth)
            .attr('height', miniHeight)
            .attr('visibility', 'hidden')
            .on('mouseup', moveBrushMouseEvent);
    var brushStart = 0;
    var brushEnd = Math.min(maxItemEnd, initialMainInterval);

    // draw the selection area
    var brush = this.brush = d3.svg.brush()
            .x(XminiScale)
            .extent([brushStart, brushEnd])
            .on("brush", display);

    miniGraph.append('g')
            .attr('class', 'x brush')
            .call(brush)
            .selectAll('rect')
            .attr('y', 6)
            .attr('height', miniHeight - 12);

    miniGraph.selectAll('rect.background').remove();
    if (config.brushPosition) {
        moveBrush(config.brushPosition, initialMainInterval);
    }
//    display();
    DOMselector.fadeIn(config.fadeInDuration || 1200);

    function moveBrush(centerPos, totalExtent, doNotUpdate) {
        var e = brush.extent();

        centerPos = parseFloat(centerPos);
        totalExtent = parseFloat(totalExtent || initialMainInterval);
        if (totalExtent > maxZoomAreaInSeconds) {
            totalExtent = maxZoomAreaInSeconds;
        }
        maxItemEnd = parseFloat(maxItemEnd);
        var brushEnd = Math.min(maxItemEnd, centerPos + totalExtent / 2);
        var brushStart = Math.max(0, brushEnd === maxItemEnd ?
                centerPos - totalExtent / 2 - (centerPos + totalExtent / 2 - maxItemEnd) :
                centerPos - totalExtent / 2);
        if (brushStart === 0)
            brushEnd = Math.min(maxItemEnd, brushEnd + totalExtent - brushEnd - brushStart);
        if (brushStart > brushEnd) { //this is a safety measure against bugs
            console.log("WARNING: MoveBrush -  The brushStart value is higher than brushEnd. Something went wrong but I'm inverting the values.");
            brushStart ^= brushEnd;
            brushEnd ^= brushStart;
            brushStart ^= brushEnd;
        }
        pBrushCenter = centerPos;
        brush.extent([brushStart, brushEnd]);
        if (!doNotUpdate)
            display();
    }
    ;
    function updateMiniTimeline() {
        miniItemRectangles.append('g').selectAll('miniItem')
                .data(items)
                .enter().append('rect')
                .attr('class', function(item, i) {
            return 'miniItem ' + (i % 2 === 0 ? 'even ' : 'odd ') + item.class + " id-" + item.id;
        })
                .attr('x', function(item, i) {
            return XminiScale(item.start);
//            return XminiScale(item.start + i * XminiInterval);
        })
                .attr('width', function(item, i) {
            return XminiScale(item.end - item.start);
        })
                .attr('y', YminiScale(0.5 - miniRectHeight / 2))
                .attr('height', YminiScale(miniRectHeight));
    }
    function display() {
        var rects, labels;
        var minExtent = brush.extent()[0];
        var maxExtent = brush.extent()[1];

        var currentExtent = maxExtent - minExtent;

        if (!pBrushCenter) {
            pBrushCenter = maxExtent - currentExtent / 2;
        }
        if (currentExtent > maxZoomAreaInSeconds) {
            moveBrush(pBrushCenter, maxZoomAreaInSeconds - 20, true);
            minExtent = brush.extent()[0];
            maxExtent = brush.extent()[1];
        } else {
            pBrushCenter = maxExtent - currentExtent / 2;
        }
//        console.log(extent);

        var visItems = items.filter(function(d) {
            return d.start >= minExtent && d.start <= maxExtent || (d.end >= minExtent && d.end <= maxExtent);
        });

        miniGraph.select('.brush').call(brush.extent([minExtent, maxExtent]));

//            XmainScale.domain([minExtent, maxExtent + XmainInterval * (visItems.length - 1)]);
        XmainScale.domain([minExtent, maxExtent]);

        topMainXAxis.ticks(XticksSparceScale).tickFormat(secondsToHms);
        botMainXAxis.ticks(XticksDenseScale).tickFormat(secondsToHms);

        // update the axis
        mainGraph.select('.main.axis.top').call(topMainXAxis);
        mainGraph.select('.main.axis.bottom').call(botMainXAxis);

        //update the current time marker

        updateCurrentTime();

        // update the item rects
        rects = mainItemRectangles.selectAll('rect')
                .data(visItems, function(item) {
            return item.id;
        })
                .attr('x', mainItemX)
                .attr('width', mainItemWidth)
                .attr('class', function(item, i) {
            

            return 'mainItem ' + (i % 2 === 0 ? 'even ' : 'odd ') + item.class + " id-" + item.id;
        })
                .on('mouseover', onMouseOverMainItem)
                .on('mouseout', onMouseOutMainItem);

        rects.enter().append('rect')
                .attr('x', mainItemX)
                .attr('width', mainItemWidth)
                .attr('y', YmainScale(0.5 - mainRectHeight / 2))
                .attr('height', YmainScale(mainRectHeight))
                .attr('class', function(item, i) {
            loadTooptip(item, i, this);
            return 'mainItem ' + (i % 2 === 0 ? 'even ' : 'odd ') + item.class + " id-" + item.id;
        })
                .on('mouseover', config.onMouseOverMainItemEvent || onMouseOverMainItem)
                .on('mouseout', config.onMouseOutMainItemEvent || onMouseOutMainItem)
                .on('click', config.onMouseClickMainItemEvent || onMouseClickMainItem)
                .on('dblclick', config.onMouseDoubleClickMainItemEvent || onMouseDoubleClickMainItem);
        rects.exit().each(function(){
            $(this).qtip('destroy');
        }).remove();

        //draw the left and right lines
        mainGraph.append('g')
                .attr('transform', 'translate(0, 0)')
                .attr('class', 'main axis left')
                .append('line')
                .attr('x1', '0')
                .attr('y1', '0')
                .attr('x2', '0')
                .attr('y2', mainHeight);
        mainGraph.append('g')
                .attr('transform', 'translate(-1, 0)')
                .attr('class', 'main axis right')
                .append('line')
                .attr('x1', canvasWidth)
                .attr('y1', mainHeight)
                .attr('x2', canvasWidth)
                .attr('y2', 0);
        //scroll
        var scroll = mainGraph.append('g').attr('clip-path', 'url(#clip)').attr('class', 'scroll');
        var scrollH = mainHeight / 1.6, scrollW = 30;
        var leftScroll = scroll.append('polygon')
                .attr('points', "0.0,{0} {1},0.0 {2},{3}".format(scrollH / 2, scrollW, scrollW, scrollH))
                .attr('transform', 'translate(0.0, {0})'.format((mainHeight - scrollH) / 2))
                .on('click', config.onMainLeftScrollEvent || onMainLeftScrollEvent);
        var rightScroll = scroll.append('polygon')
                .attr('points', "0.0,0.0 {0},{1} 0.0,{2}".format(scrollW, scrollH / 2, scrollH))
                .attr('transform', 'translate({0}, {1})'.format(canvasWidth - scrollW, (mainHeight - scrollH) / 2))
                .on('click', config.onMainRightScrollEvent || onMainRightScrollEvent);
        ;

        function mainItemWidth(item, i) {
            return XmainScale(XmainScale.domain()[0] + item.end - item.start);
        }

        function mainItemX(item, i) {
            return XmainScale(item.start);
        }

        function onMouseOverMainItem(item, i) {
            if (config.onMouseOverMainItem)
                config.onMouseOverMainItem(item, i, this);
        }

        function onMouseOutMainItem(item, i) {
            if (config.onMouseOutMainItem)
                config.onMouseOutMainItem(item, i, this);
        }
        function onMainLeftScrollEvent() {
            if (config.onMainScrollEvent)
                config.onMainScrollEvent('left');
            else
                onMainScrollEvent('left');
        }
        function onMainRightScrollEvent() {
            if (config.onMainScrollEvent)
                config.onMainScrollEvent('right');
            else
                onMainScrollEvent('right');
        }
        function onMainScrollEvent(direction) {

            //calculate the move distance m
            var zoomArea = timelinesObj.getZoomAreaExtent();
//            console.debug(zoomArea);
            var m = (zoomArea[1] - zoomArea[0]) / 8 * (direction === 'left' ? (-1) : 1); //m = total_zoom_area / 10
//            console.debug("DEBUG: direction: " + direction + " m = " +  m);

            timelinesObj.moveZoomAreaExtent(zoomArea[0] + m, zoomArea[1] + m);

        }

        function onMouseClickMainItem(item, i) {
            if (config.onMouseClickMainItem) {
                config.onMouseClickMainItem(item, i, this);
            }
        }

        function onMouseDoubleClickMainItem(item, i) {
            if (config.onMouseDoubleClickMainItem) {
                config.onMouseDoubleClickMainItem(item, i, this);
            }
        }
        function loadTooptip(item, i, DOMelem) {
            var tooltipText = '';
            switch (item.class) {
                case 'itemNow':
                    tooltipText = 'This is the current audio excerpt.';
                    if (item.type === "tagged") {
                        tooltipText += '<br />You have already tagged this audio before.';
                    }
                    break;
                case 'itemSkipped':
                    tooltipText = 'You have skipped this node previously.';
                    break;
                case 'itemTagged':
                    tooltipText = 'You have already tagged this audio before.';
                    break;
                default:
                    tooltipText = 'Untagged audio excerpt.';
            }
            var selector = $(DOMelem);
            selector.qtip({
                content: {text: tooltipText},
                position: {my: 'top center', at: 'bottom center', target:'mouse', adjust: {y: 30}},
                style: {classes: "tooltip smalltip"},
                show: {delay: 0},
                prerender: true
            });
        }
    }



    function moveBrushMouseEvent() {
        var origin = d3.mouse(this),
                point = XmainScale.invert(origin[0]),
                halfExtent = (brush.extent()[1] - brush.extent()[0]) / 2,
                start = point - halfExtent,
                end = point + halfExtent;

        brush.extent([start, end]);
        display();
    }
    function updateCurrentTime(time) {
        if (time)
            currentTime = time;
        if (currentTime) {
            //update minitimeline marker
            var currentMiniX = XminiScale(currentTime);
            miniCurrentTimeMarker.select('line').attr('x1', currentMiniX).attr('x2', currentMiniX);
            //update maintimeliene marker if its inside the main domain
            var mainDomain = XmainScale.domain();
            if (mainDomain[0] < currentTime && mainDomain[1] > currentTime) {
                var currentMainX = XmainScale(currentTime);
                mainCurrentTimeMarker.select('line').attr('x1', currentMainX).attr('x2', currentMainX);
            } else {
                mainCurrentTimeMarker.select('line').attr('x1', -10).attr('x2', -10);
            }
        }
    }
    this.getMiniElemDOMselector = function(id) {
        return '.miniItem.id-' + id;
    };
    this.getMainElemDOMselector = function(id) {
        return '.mainItem.id-' + id;
    };

    var selections = {};
    this.selectItem = function(DOMSelector, cssClass, options) {
        console.assert($.type(DOMSelector) === 'string');
        if (!options)
            options = {};
        cssClass = cssClass || 'selected';
        var selector = d3.select(DOMSelector);
        if (selector.length > 0) {

            //the item is already selected?
            if (selections[DOMSelector]) {
                //is the same selection? if not add it to the list
                if (!selections[DOMSelector].classes.hasOwnProperty(cssClass)) {
                    selections[DOMSelector].classes[cssClass] = true;
                    selector.classed(cssClass, true);
                }
            } else {
                var currentX = parseFloat(selector.attr('x'));
                var currentW = parseFloat(selector.attr('width'));
                selections[DOMSelector] = {x: currentX, width: currentW, classes: {}};
                selections[DOMSelector].classes[cssClass] = true;
                //elements cannot be less than a pixel, or they won't simply exist
                selector.attr('x', Math.max(currentX + (options.x || 2), 1));
                selector.attr('width', Math.max(currentW + (options.width || -4), 1));
                selector.classed(cssClass, true);
            }
        }
    };
    this.unselectItem = function(DOMSelector, cssClass) {
        cssClass = cssClass || 'selected';
        var selector = d3.select(DOMSelector);
        if (selector.length > 0) {

            //the item is already selected?
            if (selections[DOMSelector]) {
                //ofc it is!
                if (selections[DOMSelector].classes.hasOwnProperty(cssClass)) {
                    delete selections[DOMSelector].classes[cssClass];
                    selector.classed(cssClass, false);
                }
                if (Object.keys(selections[DOMSelector].classes).length === 0) {
                    //no active selection
                    //restore the original settings
                    selector.attr('x', selections[DOMSelector].x);
                    selector.attr('width', selections[DOMSelector].width);
                    //delete the selection
                    delete selections[DOMSelector];
                }
            }
        }
    };
    this.selectMiniItem = function(idorDOMSelector, cssClass, options) {
        if (!options)
            options = {};
        var options = {
            x: (options.x || 1),
            width: (options.width || -2)
        };

        timelinesObj.selectItem(($.isNumeric(idorDOMSelector) ? timelinesObj.getMiniElemDOMselector(idorDOMSelector) : idorDOMSelector), cssClass, options);
    };
    this.selectMainItem = function(idorDOMSelector, cssClass, options) {
        if (!options)
            options = {};
        var options = {
            x: (options.x || 2),
            width: (options.width || -4)
        };
        timelinesObj.selectItem(($.isNumeric(idorDOMSelector) ? timelinesObj.getMainElemDOMselector(idorDOMSelector) : idorDOMSelector), cssClass, options);
    };
    this.unselectMiniItem = function(idorDOMSelector, cssClass) {
        timelinesObj.unselectItem(($.isNumeric(idorDOMSelector) ? timelinesObj.getMiniElemDOMselector(idorDOMSelector) : idorDOMSelector), cssClass);
    };
    this.unselectMainItem = function(idorDOMSelector, cssClass) {
        timelinesObj.unselectItem(($.isNumeric(idorDOMSelector) ? timelinesObj.getMainElemDOMselector(idorDOMSelector) : idorDOMSelector), cssClass);
    };
    this.getItemData = function(id) {
        return items[id];
    };
    this.moveZoomAreaExtent = function(centerPointOrStart, end) {

        var e = brush.extent();
        if (!end) {
            //center mode
            moveBrush(centerPointOrStart, e[1] - e[0]);
        } else {
            //start end mode
            if (end < centerPointOrStart) {
                //swap values (XOR algoritm)
                centerPointOrStart ^= end;
                end ^= centerPointOrStart;
                centerPointOrStart ^= end;
            }
            moveBrush(centerPointOrStart + (end - centerPointOrStart) / 2, e[1] - e[0]);
        }

    };
    this.getZoomAreaExtent = function() {
        return brush.extent();
    };
    this.update = function(onlyMain) {
        console.debug("DEBUG: timeline update call!");
        if (!onlyMain)
            updateMiniTimeline();
        display();
    };
    this.updateCurrentTime = function(time) {
        updateCurrentTime(time);
    };
};
function generateVideoTimelineElements(totalSeconds, interval, overlap) {
    /* Item: {
     id: item.id,
     lane: laneId,
     start: item.start,
     end: item.end,
     class: item.end > now ? 'future' : 'past',
     desc: item.desc
     }*/
    interval = interval || 10;
    overlap = overlap || 0;

    var items = [];
    for (var seconds = 0, index = 0; seconds < totalSeconds; seconds += (interval - overlap), index++) {
        items.push({
            id: index,
            lane: 0,
            start: seconds,
            end: Math.min(seconds + interval, totalSeconds),
            class: Math.random() * 100 > 60 ? Math.random() * 2 > 1 ? 'itemTagged' : 'itemSkipped' : '',
            desc: ''
        });
    }
    console.log("maximum time: " + secondsToHms(d3.max(items, function(d) {
        return d.end;
    })));
    console.log(items);
    return items;
}
function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
}