//callback = function(GraphForceVis)
function loadSimilarGraph(DOMelem, api, videoId, limit, soundsItems, currentNodeIndex, timelinesObj, videoPlayer, soundEventObj, changeSegmentFunction)
{
    var canvas = $(DOMelem);
    if (canvas.length === 0) {
        console.log("Unable to load the similar graph to unexistent DOM element '" + DOMelem + "'.");
        return;
    }
    var config = {
        width: canvas.width(),
        height: canvas.height(),
        gravity: 0.02,
        defaultRadius: 10,
        charge: -50,
//        linkMinimumDistance: 15,
//        linkMaximumDistance: 300,
        linkMinimumDistance: 20,
        linkMaximumDistance: 120,
        bordersLimit: true,
//      nodeFillScale: d3.scale.ordinal().range(["#C00000", "#7B94B5"]), //vermelho, azul cueca
        nodeFillScale: d3.scale.ordinal().range(["#1038d4", "#7B94B5"]), //azul forte, azul cueca
//      nodeFillScale: d3.scale.ordinal().range(["#C00000", "#AAAAAA"]), //vermelho, cinza
        linkColorScale: d3.scale.ordinal().range(["#888888"]),
        noNodeBorders: true
    };
//    console.log(config);
    var currentNodeId = soundsItems[currentNodeIndex].idsoundsegment;
    console.info("INFO: loading similar sound segments...");
    api.video.soundsegment.getSimilar(videoId, currentNodeId, similarAudioCallback, limit * 4, 1);
    var fixedNode = null;

    var graphObj = new ForceGraphVis.create(DOMelem, config);
    //graphObj.reloadConfig(config);

    var selectorCache = null;
    var underDrag = false, focusBalloon = false;
    var focusNode = null;
    var focusNodeSelector = null;
    var balloonContents = "hi!";


    soundEventObj.bind('timeupdate', function(e) {
//        console.log("timeupdate:" + this.getTime() + " endTime:" + this.endTime)
        if (this.getTime() >= this.endTime) {
            this.stop();
        }
    });
//    soundEventObj.setVolume(70);
    graphObj.onNodeHtml = function(node, index, DOMelem) {
        var tooltipText = '';
        switch (node.class) {
            case 'itemNow':
                tooltipText = 'This is the current audio excerpt.';
                if (node.type === "tagged") {
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
                tooltipText = 'Untagged similar audio excerpt.';
        }
        $(DOMelem).qtip({
            content: {text: tooltipText},
            position: {my: 'top center', at: 'bottom center'},
            style: {classes: "tooltip smalltip"},
            prerender: true
        })
        .qtip('disable');
//                .qtip('option', 'show.event', false).qtip('option', 'hide.event', false);

        return index === 0 ? "<span class=\"text\">Current Audio Excerpt</span>" : "";
    };
    graphObj.onNodeMouseOver = function(node, index, DOMelem) {
        if (node.dragged)
            return;
        $(DOMelem).stop(true, true).toggleClass("selected", true, 200).qtip('show');
        try {
            timelinesObj.selectMiniItem(node.id);
        } catch (e) {
            console.warn("WARNING: Error selecting a item from the mini timeline - " + e);
        }
        try {
            timelinesObj.selectMainItem(node.id);
        } catch (e) {
            console.warn("WARNING: Error selecting a item from the main timeline - " + e);
        }

        if (videoPlayer.paused)
        {
            if (soundEventObj !== null)
                soundEventObj.stop();
            soundEventObj.endTime = node.end;
            console.log("DEBUG: Playing audio of node id=" + node.id + " start=" + node.start);
            soundEventObj.setTime(node.start).play();
        } else {
            console.log("DEBUG: Cannot play audio during video playback!");
        }
    };
    graphObj.onNodeMouseOut = function(node, index, DOMelem) {
        console.debug("mouseout");
        if (node.dragged)
            return;
        $(DOMelem).stop(true, true).toggleClass("selected", false, 150).qtip('hide');
        try {
            timelinesObj.unselectMiniItem(node.id);
        } catch (e) {
            console.log(e);
        }
        try {
            timelinesObj.unselectMainItem(node.id);
        } catch (e) {
            console.log(e);
        }
        if (soundEventObj !== null)
            soundEventObj.stop();
    };

    /**
     *  Called when start dragging a node.
     **/
    graphObj.onDragStart = function(node, index, DOMelem) {

    };

    /**
     *  Called each step while dragging a node.
     **/
    graphObj.onDragMove = function(node, index, DOMelem) {
        $(DOMelem).qtip('reposition');
    };
    /**
     *  Called when releases a node after dragging.
     **/
    graphObj.onDragEnd = function(node, index, DOMelem) {
        if (!focusBalloon || node === focusNode) {
            selectorCache = null;
            underDrag = false;
        }
    };
    graphObj.layoutNodeFriction = function(node) {
        return node.charge || graphObj.config.charge;
    };

    graphObj.onNodeClick = function(node, index, DOMelem) {
//        var item = timelinesObj.getItemData(node.id);
        console.log("Similar Graph OnNodeClick Event: Playback from " + node.start + " to " + node.end + ".");
        soundEventObj.stop();
        var nodeselector = $(DOMelem);
        nodeselector.stop(true, true).toggleClass('playing', true, 200);
        try {
            timelinesObj.selectMiniItem(node.id, 'playing');
        } catch (e) {
            console.warn("WARNING: Error selecting a item from the mini timeline - " + e);
        }
        try {
            timelinesObj.selectMainItem(node.id, 'playing');
        } catch (e) {
            console.warn("WARNING: Error selecting a item from the main timeline - " + e);
        }
        playVideoSegment(videoPlayer, node.start, node.end, node.id, {onPause: function(e) {

                console.log("DEBUG: OnPause (SimilarGraph) for node id %d!", node.id);
                $(DOMelem).toggleClass("playing", false, 100);
                try {
                    timelinesObj.unselectMiniItem(e.data.currentId, 'playing');
                } catch (e) {
                    console.warn("WARNING: Error unselecting a item from the mini timeline - " + e);
                }
                try {
                    timelinesObj.unselectMainItem(e.data.currentId, 'playing');
                } catch (e) {
                    console.warn("WARNING: Error unselecting a item from the main timeline - " + e);
                }
            }, onTimeUpdate: function(time) {
                timelinesObj.updateCurrentTime(time);
            }});
    };
    graphObj.onNodeDoubleClick = function(node, index, DOMelem) {
        changeSegmentFunction(videoId, node.id);
    };
    graphObj.onNodeClass = function(node, index, DOMelem) {
        if (node.type) {
            switch (node.type) {
                case 'tagged':
                    return 'tagged';
                case 'skipped':
                    return 'skipped';
                case 'normal' :
                    return 'normal';
            }
        }
    };
    graphObj.onNodeTitle = function(node, index, DOMelem) {
        if (node.type && node.type === 'tagged')
            return "This node is already tagged by you.";
    };

    function similarAudioCallback(success, similarSoundsArray) {
        if (success) {
            var result = convertSimilarSounds(similarSoundsArray, currentNodeId);
            var nodes = result[0];
            var links = result[1];

            var i;
            var pos;


            for (i = 1; i < nodes.length && i < links.length; i++) {
                pos = findPositionByProperty('idsoundsegment', soundsItems, nodes[i].id);
                if (pos === -1) {
                    console.log("WARNING An segment id from the similar graph doesn't correspond with movies segments.");
                    //                    onError("An segment id from the similar graph doesn't correspond with movies segments.");
                } else {
                    nodes[i].class = soundsItems[pos].class; //match the classes from the timeline
                }
            }

            //            nodes[0].group = 2;
            nodes[0].radiusMult = 3;
            //            nodes[0].id = currentNodeIndex;
            nodes[0].x = nodes[0].px = graphObj.config.width / 2;
            nodes[0].y = nodes[0].py = graphObj.config.height / 2;
            console.info("INFO: loading video sound segments loaded.");
            graphObj.start(nodes, links);
        } else {
            onError();
        }
    }

    return graphObj;
    /**
     *  For the brave souls who get this far: You are the chosen ones, the valiant knights of programming
     *  who toil away, without rest, fixing our most awful code. To you, true saviors, kings of men, 
     *  I say this: never gonna give you up, never gonna let you down, never gonna run around and desert you.
     *  Never gonna make you cry, never gonna say goodbye. Never gonna tell a lie and hurt you. ;)
     * @param {array} similarArr the array of similar sounds returned by the api.
     * @param {int} currentNodeId the current (selected) node id
     * @returns {Array} a converted array of nodes and links, in the correct format for use in the graph visualization
     */
    function convertSimilarSounds(similarArr, currentNodeId) {

        var nodeArr = [];
        var maxValue = 0;
        var slen = similarArr.length;

        //store the currrent node as the first position
        var node = {
            id: currentNodeId,
            start: similarArr[0].id1 === currentNodeId ? similarArr[0].start1 : similarArr[0].start2,
            end: similarArr[0].id1 === currentNodeId ? similarArr[0].end1 : similarArr[0].end2,
            class: soundsItems[currentNodeIndex].class || '',
            type: soundsItems[currentNodeIndex].type || ''
        };
        //just for safety
        if (similarArr[0].id1 !== currentNodeId && similarArr[0].id2 !== currentNodeId) {
            console.error("ALERT!: similar array doesn't have a similarity with the current node. Something smell fishy here but the execution will continue!");
        }
        nodeArr.push(node);
        //find the maximum value for normalization
        //and at the same time searches for the start and end time of the first node
        for (var i = 0; i < slen; i++) {
            similarArr[i].value = similarArr[i].value / 100;
            if (similarArr[i].value > maxValue)
                maxValue = similarArr[i].value;
        }
        var normScale = d3.scale.linear().domain([0, maxValue]).range([1.0, 0.0]);
        var links = [];
        for (var index, i = 0, Lindex = 0; i < slen && nodeArr.length < limit; i++) {
            //check if the node exists in the timeline items
            if (findPositionByProperty('id', soundsItems, similarArr[i].id1) === -1 || findPositionByProperty('id', soundsItems, similarArr[i].id2) === -1) {
                continue;
            }
            links[Lindex] = similarArr[i];
            //store both nodes for use in similarGraph 
            //(each node must have an id to reference the position inside the timeline sounds array - soundsItems)
            //source node
            node = {id: similarArr[i].id1, start: similarArr[i].start1, end: similarArr[i].end1};
            index = findPositionByProperty('id', nodeArr, node.id);
            if (index === -1)
                index = nodeArr.push(node) - 1;
            links[Lindex].source = index;
            //target node
            node = {id: similarArr[i].id2, start: similarArr[i].start2, end: similarArr[i].end2};
            index = findPositionByProperty('id', nodeArr, node.id);
            if (index === -1)
                index = nodeArr.push(node) - 1;
            links[Lindex].target = index;
            links[Lindex].value = normScale(similarArr[i].value);
            Lindex++;
        }
        return [nodeArr, links];
    }
}

function onError(err) {
    console.log("ERROR: " + err);


}
function onFatalError(err) {
    console.log("FATAL ERROR: " + err);
}