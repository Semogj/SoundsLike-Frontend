

var soundEventObj = null;
var lastClickEventTime = 0;


function VIRUS_testData1Event() {
    var result = VIRUS_convertSimilarSounds(VIRUS_getSimilarSoundsEvents(TEST_SOUND_EVENT_ID));
    var nodes = result[0];
    var links = result[1];



    setInfo(nodes.length + ' nodes and ' + links.length + ' connection. Rendering visualization...');

    console.log(nodes);
    console.log(links);
    $('#btLastfmUsername').removeAttr('disabled');

    var config = {
        width: 1024,
        height: 540,
        gravity: 0.04,
        defaultRadius: 30,
        charge: -100,
        linkMinimumDistance: 15,
        linkMaximumDistance: 300,
        bordersLimit: $('#btBordersLimit').val() === "Border Limit : On" ? true : false,
        nodeFillScale: d3.scale.ordinal().range(["#AEC7E8", "#C00000"])

    };
    graphObj = new ForceGraphVis.create("#chart", config);
    //graphObj.reloadConfig(config);



    graphObj.onNodeClick = function(node, index) {
        var selector = d3.select(this).select('.text');

        var now = Date.now();
        if (now - lastClickEventTime < 500) //ja passou 1 segundo desde o ultimo evento?
        {
            return;
        }
        lastClickEventTime = now;
        var tmp = node.name.split(".");

        //FIXME: fix possible errors here
        var movieName = tmp[0];
        for (var i = 1; i < tmp.length - 1; i++)
            movieName += "." + tmp[i];

        var soundPath = "sounds/movies/" + movieName + "/" + node.name;

        //global var soundEventObj, we only want 1 sound playing at a time
        if (isset(soundEventObj)) {
            soundEventObj.stop();
        }
        soundEventObj = new buzz.sound(soundPath, {
            //var mySound = new buzz.sound( "sounds/effects/Alien 1", {
            formats: ["wav", "mp3"]
        });
        selector.text("Playing: " + node.name);
        var stopEvent = function(e) {
            selector.text(node.name);
        };
        soundEventObj.setVolume(40).play().bind("ended", stopEvent);


    };
    graphObj.onNodeMouseOver = function(node, index) {
        console.log("MouseOver event over node[" + index + "] \"" + node.name + "\"");
        var newRadius = node.radius * 1.2;
        var difRadius = (newRadius - node.radius) * -1;
        var selector = d3.select(this);
        selector.style('z-index', Math.round(selector.style('z-index') * 2))
                .transition().duration(250)
                .style('margin-top', difRadius + "px")
                .style('margin-left', difRadius + "px")
                .style('width', newRadius * 2 + "px")
                .style('height', newRadius * 2 + "px")
                .style('border-radius', newRadius + "px");

        //o.layout.resume();
    };
    graphObj.onNodeMouseOut = function(node, index) {
        console.log("MouseOut event over node[" + index + "] \"" + node.name + "\"");
        var selector = d3.select(this);
        //selector.select('.text').text(node.name);   
        selector.style('z-index', Math.round(selector.style('z-index') / 2))
                .transition().duration(250)
                .style('margin-top', "0px")
                .style('margin-left', "0px")
                .style('width', node.radius * 2 + "px")
                .style('height', node.radius * 2 + "px")
                .style('border-radius', node.radius + "px");
        graphObj.layout.resume();
    };


    graphObj.start(nodes, links);

}
function VIRUS_testData2Event() {
    var result = VIRUS_convertSimilarSounds(VIRUS_getSimilarSoundsEvents(TEST_SOUND_EVENT_ID));
    var nodes = result[0];
    var links = result[1];

    nodes[0].group = 2;
    nodes[0].radiusMult = 3;

    setInfo(nodes.length + ' nodes and ' + links.length + ' connection. Rendering visualization...');

    console.log(nodes);
    console.log(links);
    $('#btLastfmUsername').removeAttr('disabled');

    var config = {
        width: 1024,
        height: 540,
        gravity: 0.04,
        defaultRadius: 16,
        charge: -100,
//        linkMinimumDistance: 15,
//        linkMaximumDistance: 300,
        linkMinimumDistance: 8,
        linkMaximumDistance: 200,
        bordersLimit: $('#btBordersLimit').val() === "Borders Limit: On" ? true : false,
//        nodeFillScale: d3.scale.ordinal().range(["#AEC7E8", "#C00000"])
//        nodeFillScale: d3.scale.ordinal().range(["#C00000", "#7B94B5"]), //vermelho, azul cueca
        nodeFillScale: d3.scale.ordinal().range(["#1038d4", "#7B94B5"]), //azul forte, azul cueca
//        nodeFillScale: d3.scale.ordinal().range(["#C00000", "#AAAAAA"]), //vermelho, cinza
//        nodeFillScale: d3.scale.ordinal().range(["#04EC2A", "#AAAAAA"]), 
        linkColorScale: d3.scale.ordinal().range(["#888888"])
    };
    graphObj = new ForceGraphVis.create("#chart", config);
    //graphObj.reloadConfig(config);

    var selectorCache = null;
    var underDrag = false, focusBalloon = false;
    var focusNode = null;
    var focusNodeSelector = null;
    var balloonContents = "hi!";

    graphObj.onNodeCreation = function(node, index) {
        var label = node.name.lastIndexOf('.');
        label = label > -1 && label < node.name.length - 1 ? node.name.substr(label + 1) : '?';
//        return '<div class="text" >' + label + '</div>';
        return index === 0 ? "<div class=\"text\">Current Audio Excerpt</div>" : "";
    };

    var balloonCss = {
            minWidth: "20px",
            padding: "10px",
            borderRadius: "15px",
            border: "solid 1px #777",
            boxShadow: "4px 4px 4px #555",
            color: "#666",
            backgroundColor: "#efefef",
            opacity: "0.85",
            zIndex: "32767",
            textAlign: "left"
    };

    graphObj.onNodeMouseOver = function(node, index, DOMelem) {
        if (!underDrag && !focusBalloon) {
            var pos = calcBalloonPosition(node.x, node.y, graphObj.config.width,
                    graphObj.config.height, 40);
            if (selectorCache !== null)
                selectorCache.hideBalloon();
            selectorCache = $(DOMelem);
            selectorCache.showBalloon({css: balloonCss, contents: '<div class="smallText">' + node.name
                        + '</div><div id="' + 'hoverTagCloud' + index + '" class="smallText">[small tag cloud]</div>', position: pos,
                minLifetime: 0, showDuration: 0, hideDuration: 0});
//            generateRandSmallTagCloud('#hoverTagCloud' + index, true)
            console.log("onNodeMouseOver!");
        }

    };
    graphObj.onNodeMouseOut = function(node, index, DOMelem) {
        if (!underDrag && !focusBalloon) {
            selectorCache = $(DOMelem);
            selectorCache.hideBalloon();
            console.log("onNodeMouseOut!");
        }
    };

    /**
     *  Called when start dragging a node.
     **/
    graphObj.onDragStart = function(node, index, DOMelem) {
        if (!focusBalloon || node === focusNode) {
            selectorCache = $(DOMelem);
            console.log("!!!!!!!!!!!!!! drag init!");
            underDrag = true;
        }
    };

    /**
     *  Called each step while dragging a node.
     **/
    graphObj.onDragMove = function(node, index, DOMelem) {
        if (!focusBalloon || index === focusNode) {
            var margin = 230;
            selectorCache = $(DOMelem);
            if (!focusBalloon) {
                margin = 80;
                balloonContents = '<span class="smallText"><p>' + node.name + '</p><p>[small tag cloud]</p></span>';
            }
            pos = calcBalloonPosition(node.x, node.y, graphObj.config.width,
                    graphObj.config.height, margin);
            selectorCache.hideBalloon();
            selectorCache.showBalloon({css: balloonCss, contents: balloonContents, position: pos, minLifetime: 0,
                showDuration: 0, hideDuration: 0, tipSize: 20});
//            $('#btClose').click(function() {
//                removeTagWindow($('#tagWindow'));
//            });
            console.log("onDragNodeTick!");

        }
    };
    /**
     *  Called when releases a node after dragging.
     **/
    graphObj.onDragEnd = function(node, index, DOMelem) {
        if (!focusBalloon || node === focusNode) {
            selectorCache = null;
            underDrag = false;
            console.log("!!!!!!!!!!!!!!!!!!!!!! drag end!");

        }
    };
    graphObj.layoutNodeFriction = function(node) {
        return node.charge || graphObj.config.charge;
    };
    var fixedNode = null;

    graphObj.onNodeClick = function(node, index, DOMelem) {
        if (focusBalloon && focusNode === index)
            return;
//        var canvasWidth = graphObj.config.width;
//        var canvasHeight = graphObj.config.height;

        var bX = Math.round(node.x) - 50;
        var bY = Math.round(node.y) - 50;

        if (fixedNode !== null) {
            fixedNode.fixed = false;
            fixedNode.charge = null;
        }
        node.fixed = true;
        node.charge = graphObj.charge * 10;
        fixedNode = node;

        focusBalloon = true;
        focusNode = index;

        //        
//        nodeSelector.showBalloon({contents:"content", position:"bottom"});
//        nodeSelector.showBalloon({contents:"hi!", position:"bottom"});
        var tagWindow = $('#tagWindow');
        if (tagWindow.length !== 0) {
            removeTagWindow(tagWindow, loadTagWindow);
        } else {
            loadTagWindow();
        }



        function removeTagWindow(tagWindowSelector, callback, timeout) {
            focusNodeSelector.hideBalloon();
            setTimeout(function() {
                tagWindowSelector.remove();
                if (jQuery.isFunction(callback))
                    callback();
            }, timeout || 200);
        }
        function loadTagWindow(callback) {
            $('<div>').load('ajax/eventTagsWindow.html', null, function(content) {

                focusNodeSelector = $(DOMelem);
                var pos = calcBalloonPosition(node.x, node.y,
                        graphObj.config.width, graphObj.config.height, 230);
                balloonContents = content;
                focusNodeSelector.showBalloon({contents: content, position: pos, minLifetime: 0,
                    showDuration: 200, hideDuration: 200, tipSize: 20,
                    showAnimation: function(d) {
                        this.fadeIn(d);
                    },
                    hideAnimation: function(d) {
                        this.fadeOut(d);
                    }});
                var tagWindow = $('#tagWindow');
                var css = null;
                //lets position the new ballon
                switch (pos) {
                    case "bottom right":
                        css = {top: "0px", left: "0px"};
                        break;
                    case "bottom":
                        css = {top: "0px", left: tagWindow.outerWidth(true) / (-2)};
                        break;
                    case "bottom left":
                        css = {top: "0px", right: "0px"};
                        break;
                    case "right":
                        css = {left: "0px", top: tagWindow.outerHeight(true) / (-2)};
                        break;
                    case "left":
                        css = {right: "0px", top: tagWindow.outerHeight(true) / (-2) + "px"};
                        break;
                    case "top right":
                        css = {bottom: "0px", left: "0px"};
                        break;
                    case "top":
                        css = {bottom: "0px", left: tagWindow.outerWidth(true) / (-2)};
                        break;
                    case "top left":
                        css = {bottom: "0px", right: "0px"};
                        break;
                }
                tagWindow.css(css);
                $('#btClose').click(function() {
                    removeTagWindow(tagWindow);
                    fixedNode.fixed = false;
                    focusBalloon = false;
                });
                generateRandSmallTagCloud('#tagWindow #eventTags', true);
                if (jQuery.isFunction(callback))
                    callback();
            });
        }


    };

    graphObj.start(nodes, links);

}
var TEST_SOUND_EVENT_ID = "24.S01E01.460";

function generateRandSmallTagCloud(DOMelem, noColors) {
    var eventTags = $(DOMelem);
    var tags = ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11",
        "tag12", "tag13", "tag14", "tag15", "tag16", "tag17", "tag18", "tag19", "tag20"];
    tags = tags.map(function(d) {
        return {text: d, size: 4 + Math.random() * 30};
    });

    generateWordCloud(DOMelem, eventTags.width(), eventTags.height(), tags, noColors);
}

function calcBalloonPosition(posX, posY, canvasWidth, canvasHeight, margin, defaultPos) {
    var margin = margin || 250;
    var defaultPos = defaultPos || "top";
    if (canvasHeight < margin || canvasWidth < margin) {
        console.log("Allert: canvas dimensions must be bigger than the margin! Expect strange behavior.");
    }
    var pos = 0x00;
    pos |= posX < margin ? 0x01 : posX > canvasWidth - margin ? 0x04 : 0x00;
    pos |= posY < margin ? 0x08 : posY > canvasHeight - margin ? 0x02 : 0x00;
    switch (pos) {
        case 0x00:
            return defaultPos;
        case 0x09:
            return "bottom right";
        case 0x08:
            return "bottom";
        case 0x0C:
            return "bottom left";
        case 0x01:
            return "right";
        case 0x04:
            return "left";
        case 0x03:
            return "top right";
        case 0x02:
            return "top";
        case 0x06:
            return "top left";
    }
    //in case of any kind of black magic!
    return defaultPos;
}

function generateWordCloud(DOMelem, width, height, words, colorsOrBlack) {

    var fontSize = d3.scale.log().range([2, 90]);
    var fill = colorsOrBlack || d3.scale.category20();
    if (fill === true) {
        fill = d3.scale.linear().domain(["#000"]);
    }

    var layout = d3.layout.cloud().size([width, height])
            .words(words)
            .rotate(function() {
//        return ~~(Math.random() * 2) * 90;
        return 0;
    })
//            .font("Impact")
//            .font('"Lucida Grande", Arial, Helvetica, Verdana, sans-serif')
            .fontSize(function(d) {
        return d.size;
    })
            .on("end", draw)
            .start();

    function draw(words) {
//        var canvasPos = $(DOMelem).position();
//        canvasPos = {x:canvasPos.left, y:canvasPos.top};
        d3.select(DOMelem).html('').append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) {
            return d.size + "px";
        })
                .style("font-family", "Impact")
//                .style("font-family", '"Lucida Grande", Arial, Helvetica, Verdana, sans-serif')
                .style("fill", function(d, i) {
            return fill(i);
        })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
                .text(function(d) {
            return d.text;
        });
    }
    return layout;
}

function VIRUS_getSimilarSoundsEvents(eventId) {
    if (eventId === "24.S01E01.460")
        return [
            {
                source: "24.S01E01.460",
                target: "24.S01E01.893",
                value: 14.35
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.896",
                value: 52.02
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.459",
                value: 53.5
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.892",
                value: 65.05
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.464",
                value: 68.13
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.894",
                value: 69.44
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.895",
                value: 72.47
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.1209",
                value: 72.62
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.1230",
                value: 73.8
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.124",
                value: 80.06
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.512",
                value: 94.35
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.444",
                value: 95.02
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.15",
                value: 103.5
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.121",
                value: 165.05
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.656",
                value: 168.13
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.878",
                value: 169.44
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.443",
                value: 172.47
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.111",
                value: 172.62
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.214",
                value: 173.8
            },
            {
                source: "24.S01E01.460",
                target: "24.S01E01.658",
                value: 180.06
            }
        ];
    else
        return [];
}

function VIRUS_getSoundEvent(eventId) {
    return {
        name: eventId
    };
}

function VIRUS_convertSimilarSounds(similarArr) {
    var nodeArr = [];
    var maxValue = 0;
    var i, s = similarArr.length;
    //find the maximum value for normalization
    for (i = 0; i < s; i++) {
        if (similarArr[i].value > maxValue)
            maxValue = similarArr[i].value;
    }
    var normScale = d3.scale.linear().domain([0, maxValue]).range([1.0, 0.0]);

    for (i = 0; i < s; i++) {
        similarArr[i].source = VIRUS_insertIntoNodeSet(nodeArr, VIRUS_getSoundEvent(similarArr[i].source));
        similarArr[i].target = VIRUS_insertIntoNodeSet(nodeArr, VIRUS_getSoundEvent(similarArr[i].target));
        similarArr[i].value = normScale(similarArr[i].value);
    }

    return [nodeArr, similarArr];
}



/**
 * Add an node to a specific set and returns the position in the array.
 * If the artist exists, returns the position, if not inserts the node
 *  into the array and returns the position.
 */
function VIRUS_insertIntoNodeSet(nodeArray, node) {
    var size = nodeArray.length;
    for (var i = 0; i < size; i++) {
        if (nodeArray[i].name == node.name) {
            return i;
        }
    }

    nodeArray.push({
        name: node.name
    });
    return size
}
function VIRUS_insertIntoLinkSet(linkArray, newLink) {
    var size = linkArray.length;
    for (var i = 0; i < size; i++) {
        var l = linkArray[i];
        if ((l.source == newLink.source && l.target == newLink.target)
                || (l.target == newLink.source && l.source == newLink.target))
            return false;
    }
    linkArray.push(newLink);
    return true;
}
