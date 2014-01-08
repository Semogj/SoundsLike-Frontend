// If you’re reading this, that means you have been put in charge of my previous project.
// I am so, so sorry for you. God speed.
/**
 * 
 * @param MovieCloudsApi api
 * @param {type} videoId
 * @returns {SoundsLike}
 */
var SoundsLike = function(api, videoId, soundSegmentId) {

    var videoFolder, videoFileName, videoTitle, resourceRoot = "resources/movies/";

    var videoFilePath;
    /**
     * 
     * @type string Audio path without file extensions
     */
    var videoAudioPath;
    var videoAudioExtensions = ['ogg', 'mp3', 'wav'];
    var apiCallFailures = 0;
    var videoPlayer;

    var similarGraph, timelines;

    var apiCallFailures = 0;
    var limit = 1000;
    var page = 1;
    var CURRENT_USER_ID = 1;
    var SEG_PARAMS = {user: CURRENT_USER_ID};
    //tags titles
    var TAGS_SUGGESTED_TITLE_NORMAL = "Suggested tag. It is going to be ignored.<br />Click to accept.<br />Double click to reject.";
    var TAGS_SUGGESTED_TITLE_ACCEPTED = "Accepted tag. The audio is related to this tag.<br />Click to reject.<br />Double click to ignore.";
    var TAGS_SUGGESTED_TITLE_REJECTED = "Rejected tag. The audio is not related to this tag!<br />Click to ignore.<br />Double click to accept.";
    var TAGS_ADDED_TITLE_NORMAL = "Ignored tag, added by you. It is going to be ignored.<br />Click to accept it.<br />Double click to reject.";
    var TAGS_ADDED_TITLE_ACCEPTED = "Accepted tag, added by you. The audio is related to this tag.<br />Click to reject.<br />Double click to ignore.";
    var TAGS_ADDED_TITLE_REJECTED = "Rejected tag, added by you. The audio is not related to this tag!<br />Click to ignore.<br />Double click to accept.";
    var TAGS_USERTAG_TITLE = "You have already classified this audio.<br />This tag is yours!";

    //tags submit button titles
    var TAGS_SUBMIT_LOAD_ERROR = "Error loading tags...";
    var TAGS_SUBMIT_LOADING = "Loading tags...";
    var TAGS_SUBMIT_SEND_ERROR = "Error! Try again?";
    var TAGS_SUBMIT_SEND_SUCCESS = "Done! +{0} points.";
    var TAGS_SUBMIT_NORMAL = "Save tags";
    var TAGS_SUBMIT_TAGGED = "Already tagged";
    var TAGS_SUBMIT_SENDING = "Saving...";
    var TAGS_SUBMIT_SEND_NOTAGS = "No selected tags!"

    var AUDIO_CURRENT_TITLE = "Current audio segment.<br />Click to playback.";
    var AUDIO_NORMAL_TITLE = "Audio segment.<br />Click to playback.<br />Double click to focus and tag him";
    var AUDIO_TAGGED_TITLE = "You have already tagged this Audio segment.<br />Click to playback.<br />Double click to focus.";
    var AUDIO_SKIPPED_TITLE = "Audio segment.<br />Click to playback.<br />Double click to tag him";

    var audioSegments = [];
    var uncleanSegments = [];
    var currentIndex; //inside audioSegments array
    var timelines;
    var similarGraph;
    var soundEventObj;
    var currentIndex;
    var currentItem;
    var randomItemClasses = false;
    var nSimilar = 16;
    var isTagged = false;

    var userPointSelector = $('#userHud .points');
    var userPoints = $.jStorage.get('userPoints', null);
    setUserPoints(userPoints !== null ? userPoints : Math.round(Math.random() * 300));

    $('#tagSubmit').html(TAGS_SUBMIT_LOADING);

    function setUserPoints(points, notsetHTML) {
        if (!points)
            points = 0;
        console.debug("DEBUG: User Points set: %d.", points);
        userPoints = points;
        $.jStorage.set('userPoints', points);
        if (!notsetHTML)
            userPointSelector.html(points + " points");
        return true;
    }
    this.setPoints = setUserPoints;
    function addUserPoints(points) {
        if (!points)
            return false;
        var newPoints = userPoints + points;
        var p;
        $({points: userPoints}).animate({points: newPoints}, {
            duration: 5000,
            easing: 'swing',
            step: function() { // called on every step
                // Update the element's text with rounded-up value:
                p = Math.ceil(this.points);
                if (p !== newPoints) {
                    userPointSelector.html("{0}(+{1}) points".f(p, points));
                } else {
                    userPointSelector.html("{0} points".f(p));
                }

            }
        });
        setUserPoints(userPoints + points, true);
        return true;
    }
    function resetPoints() {
        setUserPoints(0);
        return true;
    }
    this.resetPoints = resetPoints;
    function randomPoints(val) {
        setUserPoints(Math.round(Math.random() * (val || 300)));
        return true;
    }
    this.addSuggestion =
            this.randomPoints = randomPoints;
    console.info("INFO: loading video details...");
    api.video.getSingle(videoId, videoDetailsApiCallback);

    function videoDetailsApiCallback(success, videoDetails, soundSegmentId) {
        if (!success) {
            apiCallFailures++;
            console.info("INFO: Api call failure, retrying...");
            if (apiCallFailures <= 3) {
                api.video.soundsegment.get(videoId, segmentsApiCallback, limit, page);
            } else {
                console.error("ERROR: Retrying limit reached. Unable to get video details.");
                onFatalError("Unable to fetch the video details.");
            }
            return;
        }

        apiCallFailures = 0;

        //save video details
        videoFileName = $.trim(videoDetails.textid);
        videoTitle = $.trim(videoDetails.title);
        videoFolder = $.trim(videoDetails.path);
        if (videoFolder.length === 0)
            videoFolder = 'resources/movies/' + videoFileName + "/";

        videoFilePath = videoFolder + videoFileName + ".ogv";
        videoAudioPath = videoFolder + videoFileName;


        //load the video
        videoPlayer = $('#videoSection video').get(0);
        videoPlayer.src = videoFilePath;
        videoPlayer.load();

        soundEventObj = new buzz.sound(videoAudioPath, {formats: videoAudioExtensions});
        //get all segments from the selected movie
        console.info("INFO: Video details loaded.");
        console.info("INFO: loading video sound segments...");
        api.video.soundsegment.get(videoId, segmentsApiCallback, limit, page, SEG_PARAMS);
    }
    function segmentsApiCallback(success, segmentsArray) {
        if (success) {
            apiCallFailures = 0;
            if (segmentsArray.length > 0)
                audioSegments = audioSegments.concat(segmentsArray);
            page++;
            if (segmentsArray.length === limit) {
                api.video.soundsegment.get(videoId, segmentsApiCallback, limit, page, SEG_PARAMS);
            } else {
                console.info("INFO: Video sound segments loaded.");
                afterSoundSegmentsFetch(cleanupSegmentsForTimeline(audioSegments), audioSegments);
            }
        } else {
            apiCallFailures++;
            console.log("INFO: Api call failure, retrying...");
            if (apiCallFailures > 3) {
                console.error("Error: Retrying limit reached. Unable to get the segments list from a video.");
                onFatalError();
            } else {
                api.video.soundsegment.get(videoId, segmentsApiCallback, limit, page);
            }

        }
    }
    function cleanupSegmentsForTimeline(segmentsArray) {
        //removes the elements where the index is odd (we dont need overlapped segments).
        segmentsArray = $.grep(segmentsArray, function(e, i) {
            return i % 2 === 0;
        });
//        console.log(segmentsArray);
        var type;
        for (var i = 0; i < segmentsArray.length; i++) {
            segmentsArray[i].id = segmentsArray[i].idsoundsegment;
            segmentsArray[i].lane = 0;
            if (randomItemClasses) {
                type = Math.random() * 100 > 70 ? Math.random() * 10 > 3 ? 'tagged' : 'skipped' : 'normal';
            }
            else {
                type = segmentsArray[i].tagcount > 0 ? 'tagged' : 'normal';
            }
            segmentsArray[i].type = type;
            segmentsArray[i].class = "item" + ucwords(type);
            segmentsArray[i].desc = '';
        }
        return segmentsArray;
    }
    function afterSoundSegmentsFetch(soundSegments, uncleanedSoundSegments) {
        uncleanSegments = uncleanedSoundSegments;
        if (soundSegmentId && !currentSegmentInfo && (currentIndex = findPositionByProperty('idsoundsegment', soundSegments, soundSegmentId)) === -1) {
            //Find the segment in the unclean array
            console.log("DEBUG: Invalid sound segment Id. Lets lookup for the previous valid segment...");
            var currentSegmentInfo;
            currentIndex = findPositionByProperty('idsoundsegment', uncleanedSoundSegments, soundSegmentId);
            if (currentIndex >= 0)
            {//foundit
                currentSegmentInfo = uncleanedSoundSegments[currentIndex];
                var lookupTime = currentSegmentInfo.start - (currentSegmentInfo.end - currentSegmentInfo.start) / 2;
                console.log("DEBUG: Referenced node (which is invalid) start is %ds. Trying to locate with start %ds.", currentSegmentInfo.start, lookupTime);
                currentIndex = findPositionByProperty('start', soundSegments, lookupTime);
//                soundSegmentId = soundSegments[currentIndex].idsoundsegment; D
                if (currentIndex === -1) {
                    console.error("ERROR: Failed to lookup for the previous valid segment in the same movie...");
                } else {
                    console.log("DEBUG: found it, so far so good! Changing state now...");
                    changeState(videoId, soundSegments[currentIndex].idsoundsegment);
                    return;
                }
            } else {
                currentIndex = -1;
                console.error("ERROR: Failed to lookup for the previous valid segment - segment is from another movie.");
            }
        }

        if (!currentIndex || currentIndex === -1) {
            currentIndex = Math.round(Math.random() * soundSegments.length);
//            soundSegmentId = soundSegments[currentIndex].soundSegmentId;
            changeState(videoId, soundSegments[currentIndex].idsoundsegment);
            console.error("ERROR: the segmentId is not set or cannot be found in the video segments array! Falling back to random -> " + currentIndex + ".");
        }
        var pos;
        if ((pos = findPositionByProperty('class', soundSegments, 'itemNow')) !== -1) {
            console.log("DEBUG: removed 'itemNow' class of timeline item with id %d, in position %d.", soundSegments[pos].idsoundsegment, pos);
            soundSegments[pos].class = "item" + ucwords(soundSegments[pos].type);
        }
        currentItem = soundSegments[currentIndex];

        //put the video in the correct position.
        $(videoPlayer).one('playing', function() {
            videoPlayer.currentTime = currentItem.start;
            videoPlayer.pause();
        });
        var audioSectionNowMarkerSelector = $('#audioSection .now');
        var audioSectionXscale = d3.scale.linear().domain([currentItem.start, currentItem.end]).range([0, $('#audioSection .audioExcerpt').innerWidth()]);
        var lastTime = 0;
        $(videoPlayer).on('timeupdate', function(e) {
            //Firefox fires the timeupdate event once per frame. Safari 5 and Chrome 6 fire every 250ms. Opera 10.50 fires every 200ms.
            if (timelines)
                timelines.updateCurrentTime(this.currentTime);
            if (this.currentTime >= currentItem.start && this.currentTime < currentItem.end && lastTime < this.currentTime) {
                audioSectionNowMarkerSelector.animate({'left': audioSectionXscale(this.currentTime) + "px"}, {duration: 300, queue: false, easing: "linear"});
            } else {
                audioSectionNowMarkerSelector.stop(true, true);
                audioSectionNowMarkerSelector.css('left', '-10px');
            }
            lastTime = this.currentTime;
//            console.debug("!!! timeupdate {0}".f(this.currentTime));
        });
        videoPlayer.play();
        soundSegments[currentIndex].class = "itemNow";
        handleTags();


        var timelineConfig = {
            onMouseOverMainItem: onTimelineMainMouseOver,
            onMouseOutMainItem: onTimelineMainMouseOut,
            onMouseClickMainItem: onTimelineMainClick,
            onMouseDoubleClickMainItem: onTimelineMainDoubleClick,
            brushPosition: soundSegments[currentIndex].start + 5
        };
        audioSegments = soundSegments;

        document.addEventListener("DOMContentLoaded", function() {
            videoPlayer.addEventListener('loadedmetadata', function() {
                videoPlayer.currentTime = soundSegments[currentIndex].start;
            }, false);
        }, false);

        if (!timelines)
            timelines = new MultiTimeline(timelineConfig, '#timelineSection', soundSegments);
        else {
            timelines.update();
            //pos
            var currentAudioItem = findPositionByProperty('class', soundSegments, 'itemNow');
            if (currentAudioItem === -1) {
                console.error("ERROR: cannot find CurrentItem in timeline items!");
            } else {
                currentAudioItem = soundSegments[currentAudioItem];
                var zoomArea = timelines.getZoomAreaExtent();
                console.debug("DEBUG: Zoom area [" + zoomArea.join(',') + "].");
                console.debug("DEBUG: Current Audio  start = {0} end = {1}".format(currentAudioItem.start, currentAudioItem.end));
                //if the current Item is out of bounds
                if (currentAudioItem.end < zoomArea[0] || currentAudioItem.start > zoomArea[1]) {
                    timelines.moveZoomAreaExtent(currentAudioItem.start + (currentAudioItem.end - currentAudioItem.start) / 2);
                }
            }
        }


        similarGraph = loadSimilarGraph('#similarSection .canvas', api, videoId, nSimilar, soundSegments, currentIndex, timelines, videoPlayer, soundEventObj, changeSegment);

        function onTimelineMainMouseOver(item, i, DOM) {
            $(similarGraph.getNodeSelectorByDataId(item.id)).stop(true,true).toggleClass("selected", true, 200);
            if (videoPlayer.paused)
            {
                if (soundEventObj !== null)
                    soundEventObj.stop();
                soundEventObj.endTime = item.end;
                console.log("DEBUG: Playing audio of node id=" + item.idsoundsegment + "(idsoundsegment) start=" + item.start);
                soundEventObj.setTime(item.start).play();
            } else {
                console.log("DEBUG: Cannot play audio during video playback!");
            }

            timelines.selectMainItem(item.id);
            timelines.selectMiniItem(item.id);

        }
        function onTimelineMainMouseOut(item, i, DOM) {
            $(similarGraph.getNodeSelectorByDataId(item.id)).stop(true,true).toggleClass("selected", false, 150);
            if (soundEventObj !== null)
                soundEventObj.stop();
            timelines.unselectMainItem(item.id);
            timelines.unselectMiniItem(item.id);
        }
        var counter = 0;
        function onTimelineMainClick(item, i, DOM) {
//            console.log("onTimelineMainClick");
            soundEventObj.stop();

            var nodeselector = $(similarGraph.getNodeSelectorByDataId(item.id));
            nodeselector.stop(true,true).toggleClass("playing", true, 200);
            var c = counter++;
            timelines.selectMainItem(item.id, "playing");
            timelines.selectMiniItem(item.id, "playing");
            console.debug("Play event for node id %d!", item.id);

            playVideoSegment(videoPlayer, item.start, item.end, item.id, {onPause: function(e) {
                    console.debug(e);
                    $(DOM).stop(true,true).toggleClass("playing", false, 150);
                    timelines.unselectMainItem(e.data.currentId, "playing");
                    timelines.unselectMiniItem(e.data.currentId, "playing");
//                    console.debug("OnPause(Timeline) for node id %d!", e.data.currentId);
                }});

        }
        function onTimelineMainDoubleClick(item, i, DOM) {
            changeSegment(videoId, item.idsoundsegment);
        }
    }

    this.changeSoundSegment = function(segmentId) {
        videoPlayer.pause();
        soundSegmentId = segmentId;
        afterSoundSegmentsFetch(audioSegments, uncleanSegments);
    };
    this.getVideoId = function() {
        return videoId;
    };

    this.getTimeline = function() {
        return timelines;
    }
    this.getSimilarGraph = function() {
        return similarGraph;
    }

    this.getCurrentSegmentId = function() {
        return soundSegmentId;
    };

    var tagsDataList = [];
    var tagsDataListSelector = $('#suggestedTags');
    /**
     * 
     * @param {array|string} tagsToInsert
     */
    function updateTagsDatalist(tagsToInsert) {
        if (tagsToInsert) {
            if ($.type(tagsToInsert) === 'array') {
                for (var i = 0; i < tagsToInsert.length; i++) {
                    updateTagsDatalist(tagsToInsert[i]);
                }
//                return;
            } else {
                tagsToInsert = tagsToInsert.trim();
                if (tagsToInsert.length === 0) {
                    console.warn("WARNING: attemped to insert an empty tag in the tag datalist.");
                }
                if ($.inArray(tagsToInsert, tagsDataList) >= 0) {
                    console.warn("WARNING: attempted to insert a duplicate in tags datalist: {0}.".f(tagsToInsert));
//                console.log(tagsDataList);
                    return;
                }
                tagsDataList.push(tagsToInsert);
                $('<option value="{0}" label="suggestion">'.f(tagsToInsert)).appendTo(tagsDataListSelector);
            }
        } else {
            tagsDataListSelector.html("");
            for (var i = 0; i < tagsDataList.length; i++) {
                $('<option value="{0}" label="suggestion">'.f(tagsDataList[i])).appendTo(tagsDataListSelector);
            }
        }
    }
    function changeSegment(vid, sid) {
//        var pos = findPositionByProperty('idsoundsegment', audioSegments, sid);
//        if (pos !== -1) {
        if (audioSegments[currentIndex].type === 'normal')
            audioSegments[currentIndex].type = isTagged ? 'tagged' : 'skipped';
        isTagged = false;
        tagsDataList = [];
        updateTagsDatalist();
        changeState(vid, sid);

    }

    function handleTags() {
        var tagArea = $('#tagsSection .tagArea');
        tagArea.html("");
        var addBtSelector = $('<div class="elem add">+</div>');
        addBtSelector.qtip({content: {text: "Click to add a tag."}, position: {my: 'left center', at: 'right center', },
            style: {classes: "tooltip smalltip"}, show: {delay: 0}});
        var tagSubmitBt = $('#tagSubmit');
        addBtSelector.appendTo(tagArea);
        api.soundsegment.getSimilarTags(soundSegmentId, function(success, tagsArr) {
            if (success) {
                if (tagsArr.length === 0) {
                    console.info("INFO: no similar tags found for the current audio segment.");
                } else {
//                    console.debug(tagsArr);
                    for (var i = 0; i < tagsArr.length; i++) {
                        var newTag = $('<div class="elem tag {0}">{1}</div>'
                                .format(tagsArr[i].usertag ? "usertag selected" : "suggested", tagsArr[i].tagname)
                                ).hide();
                        newTag.qtip({content: {text: tagsArr[i].usertag ? TAGS_USERTAG_TITLE : TAGS_SUGGESTED_TITLE_NORMAL},
                            position: {my: 'top center', at: 'bottom center', }, style: {classes: "tooltip smalltip"}, show: {delay: 0}});
                        if (tagsArr[i].usertag) {
                            isTagged = true;
                        } else {
                            newTag.on('click', tagClickEvent);
                        }
                        addBtSelector.before(newTag);
                        newTag.fadeIn(1000);
                        updateTagsDatalist(tagsArr[i].tagname);
                    }
                }
                if (isTagged) {
                    addBtSelector.hide(0);
                    tagSubmitBt.html(TAGS_SUBMIT_TAGGED).toggleClass('disabled', true).toggleClass('active', false);
                } else {
                    tagSubmitBt.html(TAGS_SUBMIT_NORMAL).toggleClass('disabled', false).toggleClass('active', true);
                }
            } else {
                console.error("ERROR: Failed to obtain the tags of similar sound segments.");
            }
        }, 10, null, null, {includeCurrent: 1, user: CURRENT_USER_ID});
        tagSubmitBt.on('click', tagSubmitEvent);
        $('#tagsSection .add').on('click', addTagButtonEvent);
        this.addTags = addTag;

        function addTagButtonEvent(e) {
            $(this).qtip('api').toggle(false);
            var addTagsInputSelector = $('<input class="addTag" type=text list=suggestedTags >');
            $(document).on('click keypress', function(event) {
                var target = $(event.target);
                if (event.type === 'click') {
                    if (!(target.hasClass('addTag') || target.hasClass('add')))
                    {
                        addTag(addTagsInputSelector.val());
                        addTagsInputSelector.remove();
                        addBtSelector.show(0);
                        $(this).off(event);
                    }
                } else { //keypress event
                    if (event.which === 13) {
                        addTag(addTagsInputSelector.val());
                        addTagsInputSelector.remove();
                        addBtSelector.show(0);
                        $(this).off(event);
                    }
                }
            });
            addBtSelector.hide(0); //hide the add button
            addBtSelector.before(addTagsInputSelector);
            addTagsInputSelector.focus();
        }

        function tagClickEvent(event) {
            //if the segment is tagged, we are not suppose to change any tag
            if (!isTagged) {
                //FIXME: alterar o texto dos title
                var tagElem = $(this);
                if (tagElem.hasClass('selected')) {
                    tagElem.removeClass('selected');
                    tagElem.addClass('discard');
                    tagElem.qtip('option', 'content.text', tagElem.hasClass('suggested') ? TAGS_SUGGESTED_TITLE_REJECTED : TAGS_ADDED_TITLE_REJECTED);
                } else if (tagElem.hasClass('discard')) {
                    tagElem.removeClass('discard');
                    tagElem.qtip('option', 'content.text', tagElem.hasClass('suggested') ? TAGS_SUGGESTED_TITLE_NORMAL : TAGS_ADDED_TITLE_NORMAL);
                } else {
                    tagElem.addClass('selected');
                    tagElem.qtip('option', 'content.text', tagElem.hasClass('suggested') ? TAGS_SUGGESTED_TITLE_ACCEPTED : TAGS_ADDED_TITLE_ACCEPTED);
                }
            }
        }
        function addTag(tagStr, suggested) {
            tagStr = tagStr.trim();
            if (tagStr.length === 0) {
                console.info("INFO: Insertion of tag canceled: empty tag string.");
                return;
            }
            var tags = tagStr.split(',');
            var existingTags = null;
            var duplicated = false;
            for (var i = 0; i < tags.length; i++) {
                tags[i] = tags[i].trim();
                if (tags[i].length === 0) {
                    console.info("INFO: empty tag string.");
                    continue;
                }
                //check for duplicated with existing tags
                duplicated = false;
                existingTags = $('#tagsSection .tag'); //we need to update this in each iteration
                for (var j = 0; j < existingTags.length; j++) {
                    var existingTag = $(existingTags[j]);
                    if (tags[i] == existingTag.html())
                    {
                        duplicated = true;
                        existingTag.toggleClass("selected", true).toggleClass("discard", false);
                        break;
                    }
                }
                if (duplicated) {
                    console.info("INFO: Tag %s is duplicated with an existing tag.", tags[i]);
                    continue;
                }
                var newTag;
                if (suggested)
                    newTag = $('<div class="elem tag suggested">{0}</div>'.format(tags[i]));
                else
                    newTag = $('<div class="elem tag selected added">{0}</div>'.format(tags[i]));
                newTag.qtip({content: {text: newTag.hasClass('suggested') ? TAGS_SUGGESTED_TITLE_REJECTED : TAGS_ADDED_TITLE_REJECTED},
                    position: {my: 'top center', at: 'bottom center', }, style: {classes: "tooltip smalltip"}, show: {delay: 0}});
                newTag.on('click', {tagName: tags[i]}, tagClickEvent);
                addBtSelector.before(newTag);
                updateTagsDatalist(tags[i]);
                console.debug("DEBUG: Added a tag '" + tagStr + "' to the tagarea");
            }
        }
        function tagSubmitEvent(event) {
            var bt = $(this);
            if (!bt.hasClass('disabled') && bt.hasClass('active')) {
                bt.html(TAGS_SUBMIT_SENDING).toggleClass('disabled', true).toggleClass('active', false);
                var tags = [];
                var tagsSelection = $('#tagsSection .tag.selected');
                for (var i = 0; i < tagsSelection.length; i++) {
                    tags.push($(tagsSelection[i]).html());
                }
                if (tags.length === 0) {
                    bt.html(TAGS_SUBMIT_SEND_NOTAGS);
                    setTimeout(function() {
                        bt.html(TAGS_SUBMIT_NORMAL).toggleClass('disabled', false).toggleClass('active', true);
                    }, 2000);
                }
                tags = Object.values(array_unique(tags)).join(',');
                console.debug("Sending tags: %s", tags);
                //submiting tags to the webservice (by ajax POST request)
                api.soundtag.post(soundSegmentId, 1, tags, '', 1.0, function(success, resultArr) {
                    if (success) {
                        isTagged = true;
                        var points = 0;
                        //random points attribution
                        for (var i = 0; i < tags.length; i++) {
                            points += Math.round(Math.random() * 4);
                        }
                        addUserPoints(points);
                        bt.html(TAGS_SUBMIT_SEND_SUCCESS.f(points));
                        //mark all accepted tags
                        $('#tagsSection .tag.selected, #tagsSection .tag.discard')
                                .toggleClass('usertag', true)
                                .toggleClass('suggestion', false)
                                .toggleClass('added', false);
                        //disable all tags events
                        $('#tagsSection .elem').unbind();
                        //hide the + button
                        $('#tagsSection .elem.add').hide(0);
                        //change the skip button
                        $('#skipButton').html("Next random audio");
                        //update similar graph item now
                        $('#similarSection .node.itemNow')
                                .toggleClass('suggested', false)
                                .toggleClass('tagged', true)
                                .toggleClass('added', false)
                                .html('<div class="text">You earned {0} points!</div>'.f(points));
                        console.info("INFO: tags updated with success.");
                    } else {
                        bt.html(TAGS_SUBMIT_SEND_ERROR).toggleClass('disabled', false).toggleClass('active', true);
                        console.error("ERROR: error inserting the data.");
                    }
                    console.debug(resultArr);
                });

            }
        }

    }
    function onNotification(type, message){
        switch(type.toLowerCase()){
            case 'error': case 'fatalerror':
            
                break;
            case 'warning':
                break;
            default:
                
        }
    }
    
    this.error = function (message){
             
    };
    this.fatalError = function (message){
        
    };
}; //end soundsLike

function playVideoSegment(videoPlayerDOM, start, end, id, options) {
    options = options || {};

    var videoSelector = $(videoPlayerDOM);
    if (!videoPlayerDOM.paused)
    {
        videoPlayerDOM.pause();
    }
//    videoSelector.off('timeupdate');

    videoPlayerDOM.currentTime = start;
    videoPlayerDOM.currentId = id;
    videoPlayerDOM.endTime = end;

    videoPauseListener = function(event) {
        console.debug("DEBUG: Pause event for id %d!", this.currentId);
        videoSelector.stop(true,true).toggleClass('playing', false, 150);
        if (options.onPause)
            options.onPause(event);
    };

    videoSelector.on('timeupdate', {onTimeUpdate: options.onTimeUpdate}, function(event) {
//        console.debug("DEBUG: video time update event - {0}s".f(this.currentTime));
        if (event.data.onTimeUpdate) {
            event.data.onTimeUpdate.call(this, this.currentTime);
        }
        if (this.endTime && this.currentTime >= this.endTime)
        {
            console.debug("DEBUG: Excess time event for id %d! CurrentTime = {0}, End time = {1}".f(this.currentTime, this.endTime),
                    this.currentId);
            this.pause();
            this.currentTime = this.endTime;
            this.endTime = null;
        }
    }
    );
    videoSelector.one('pause', {currentId: videoPlayerDOM.currentId}, videoPauseListener);
//    videoSelector.one('pause', videoPauseListener);
//    videoPlayingId = id;

    videoPlayerDOM.play();
    videoSelector.stop(true,true).toggleClass('playing', true, 200);
}
