
/*
 * This is the javascript library for accessing the Movieclouds webservice API.
 * 
 * All API requests will inquire the server for a json response.
 * 
 * To provide a robust and uniform interface, all api methods requires 3 parameters:
 *    > data:object|string - the GET parameters to send to the api, in js object or string format.
 *    > responseCallback:callable - the callback function. This function is detailed in the next section.
 *    > options: TODO:parameter documentation 
 * 
 * The responseCallback callable will require 3 parameters:
 *    > success:boolean - signaling if the call was successfull or not
 *    > responseArray - the output array from the webservice.
 *    > HTMLStatusCode - the received HTML status from the server or 0 if not
 *    aplicable (eg. connection error).
 * 
 * The annotation used is specified in this page: https://developers.google.com/closure/compiler/docs/js-for-compiler
 * 
 */



/**
 * Prepares the interaction with the moviecloud webservice.
 * IMPORTANT: this method is meant to return an object, invoke with the "new" keyword.
 * 
 * 
 * @param string apiUrl The base URI for accessing the webservice, including "index.php" or similar 
 * if needed, but without the api version. The URI must end with a '/' 
 * @param int apiVersion the api version. Default is 1.
 * @param boolean debug
 * @returns object
 */
var MovieCloudsApi = function(apiUrl, apiVersion, debug) {
    if (!JSON) {
        console.log("The JSON 3 library is required by the MovieCloudsApi!");
        return;
    }
    //http://localhost/VIRUS-AudioEvents-Webservice/webservice/index.php/apiv1/video/6/soundsegment/7/similar

    //must end with a slash ( / )
    var apiBaseUrl = apiUrl || "http://localhost/VIRUS-AudioEvents-Webservice/webservice/index.php/";
    apiVersion = apiVersion || 1;

    debug = debug || false;

    //apiBaseUrl must end with a slash
    if (apiBaseUrl.charAt(apiBaseUrl.length - 1) !== '/') {
        apiBaseUrl += '/';
    }
    var apiPath = apiBaseUrl + "apiv" + apiVersion + "/";

    var apiObj = this;

    //callback = function(success:boolean, responseArray:object[], HTMLStatusCode:int)
//    success
//      Type: Function( Object data, String textStatus, jqXHR jqXHR )
//    error
//    Type: Function(jqXHR jqXHR, String textStatus, String errorThrown)
    this.video = {
        //video
        /**
         * Get all videos from the webservice.
         * 
         * Callback for the [base_url]/video/ service
         * @param {!function(!boolean, !object[],!jqXHR)} responseCallback The callback function.
         * @param {?int} limit The maximum number of entries to be returned. Note that the webservice may impose a maxium value!
         * @param {?int} page The current page of results. The webservice results are paginated with n=limit entries by page.
         * @param {?string|Object.<string,string>} params A string or a map of extra parameters to be added as querystring.
         * @param {?Object.<string,object>} options
         * @returns {!Object} the api object. The result is returned through the callback function.
         */
        get: function(responseCallback, limit, page, params, options, callbackParam) {
            var jsonHandler = function(json) {
                if (json.videos) {
                    if (json.videos.video && $.isArray(json.videos.video)) {
                        return json.videos.video;
                    }
                    //else is an empty video array
                } else {
                    console.log("Unexpected json output, in video.get .");
                }
                return [];
            };
            params = params || {};
            params.limit = limit || params.limit || 100;
            params.page = page || params.page || 1;
            handleRequest("video/", 'GET', params, null, responseCallback, options, jsonHandler, callbackParam);
            return apiObj;
        },
        //video
        /**
         * Get a single video entry using the video id.
         * 
         * Callback for the [base_url]/video/[videoId] service
         * @param {!int} videoId The video Id.
         * @param {!function(!boolean, ?object,!jqXHR)} responseCallback The callback function.
         * @param {?string|Object.<string,string>} params A string or a map of extra parameters to be added as querystring.
         * @param {?Object.<string,object>} options
         * @returns {!Object} the api object. The result is returned through the callback function.
         */
        getSingle: function(videoId, responseCallback, params, options, callbackParam) {
            var jsonHandler = function(json) {
                if (json.videos) {
                    if (json.videos.video) {
                        var videos = json.videos.video;
                        if ($.isArray(videos))
                            return videos.length > 0 ? videos[0] : null;
                        else
                            return videos;
                    }
                } else {
                    console.log("Unexpected json output, in video.getSingle .");
                }
                return null;
            };
            params = params || {};
            handleRequest("video/" + videoId + "/", 'GET', params, null, responseCallback, options, jsonHandler, callbackParam);
        },
        //video
        soundsegment: {
            //video.soundsegment

            /**
             * Get all registered audio segments from a video.
             * 
             * Callback for the [base_url]/video/[videoId]/soundsegment/ service
             * @param {!int} videoId The video Id.
             * @param {!function(!boolean, !object[],!jqXHR)} responseCallback The callback function.
             * @param {?int} limit The maximum number of entries to be returned. Note that the webservice may impose a maxium value!
             * @param {?int} page The current page of results. The webservice results are paginated with n=limit entries by page.
             * @param {?string|Object.<string,string>} params A string or a map of extra parameters to be added as querystring.
             * @param {?Object.<string,object>} options
             * @returns {!Object} the api object. The result is returned through the callback function.
             */
            get: function(videoId, responseCallback, limit, page, params, options, callbackParam) {
                var jsonHandler = function(json) {
                    if (json.soundsegments) {
                        if (json.soundsegments.soundsegment && $.isArray(json.soundsegments.soundsegment)) {
                            return json.soundsegments.soundsegment;
                        }
                        //else is an empty video array
                    } else {
                        console.log("Unexpected json output, in soundSegment.get .");
                    }
                    return [];
                };
                params = params || {};
                params.limit = limit || params.limit || 100;
                params.page = page || params.page || 1;
                handleRequest("video/" + videoId + "/soundsegment/", 'GET', params, null, responseCallback,
                        options, jsonHandler, callbackParam);
            },
            //video.soundsegment
            /**
             * Get a sound segment from a video the video id and segment id.
             * Note: You may want to use the soundsegment.get() instead.
             * 
             * Callback for the [base_url]/video/[videoId]/soundsegment/[segmentId] service
             * @param {!int} videoId The video Id.
             * @param {!int} segmentId The segment Id.
             * @param {!function(!boolean, ?object,!jqXHR)} responseCallback The callback function.
             * @param {?string|Object.<string,string>} params A string or a map of extra parameters to be added as querystring.
             * @param {?Object.<string,object>} options
             * @returns {!Object} the api object. The result is returned through the callback function.
             */
            getSingle: function(videoId, segmentId, responseCallback, params, options, callbackParam) {
                var jsonHandler = function(json) {
                    if (json.soundsegments) {
                        if (json.soundsegments.soundsegment) {
                            var soundSegments = json.soundsegments.soundsegment;
                            if ($.isArray(soundSegments))
                                return soundSegments.length > 0 ? soundSegments[0] : null;
                            else
                                return soundSegments;
                        }
                    } else {
                        console.log("Unexpected json output, in soundSegment.getSingle .");
                    }
                    return null;
                };
                params = params || {};
                handleRequest("video/" + videoId + "/soundsegment/" + segmentId + "/", 'GET', params,
                        null, responseCallback, options, jsonHandler, callbackParam);
            },
            //video.soundsegment
            /**
             * Get all similar sound segment entries within the same video, ordered by the similarity value (0 = most similarity possible).
             * 
             * Callback for the [base_url]/video/[videoId]/soundsegment/ service
             * @param {type} videoId
             * @param {type} segmentId
             * @param {!function(!boolean, !object[],!jqXHR)} responseCallback The callback function.
             * @param {?int} limit The maximum number of entries to be returned. Note that the webservice may impose a maxium value!
             * @param {?int} page The current page of results. The webservice results are paginated with n=limit entries by page.
             * @param {?string|Object.<string,string>} params A string or a map of extra parameters to be added as querystring.
             * @param {?Object.<string,object>} options
             * @returns {!Object} the api object. The result is returned through the callback function.
             */
            getSimilar: function(videoId, segmentId, responseCallback, limit, page, params, options, callbackParam) {
                var jsonHandler = function(json) {
                    if (json.soundsegments) {
                        if (json.soundsegments.soundsegment && $.isArray(json.soundsegments.soundsegment)) {
                            return json.soundsegments.soundsegment;
                        }
                        //else is an empty video array
                    } else {
                        console.log("Unexpected json output, in soundSegment.get .");
                    }
                    return [];
                };
                params = params || {};
                params.limit = limit || params.limit || 100;
                params.page = page || params.page || 1;
                handleRequest("video/" + videoId + "/soundsegment/" + segmentId + "/similar/", 'GET',
                        params, null, responseCallback, options, jsonHandler, callbackParam);
            }
        }

    };

    this.soundsegment = {
        //soundsegment
        get: function(responseCallback, limit, page, params, options, callbackParam) {
            var jsonHandler = function(json) {
                if (json.soundsegments) {
                    if (json.soundsegments.soundsegment && $.isArray(json.soundsegments.soundsegment)) {
                        return json.soundsegments.soundsegment;
                    }
                    //else is an empty video array
                } else {
                    console.log("Unexpected json output, in soundSegment.get .");
                }
                return [];
            };
            params = params || {};
            params.limit = limit || params.limit || 100;
            params.page = page || params.page || 1;
            handleRequest("soundsegment/", 'GET', params, null, responseCallback, options, jsonHandler, callbackParam);
        },
        //soundsegment
        getSingle: function(segmentId, responseCallback, params, options, callbackParam) {
            var jsonHandler = function(json) {
                if (json.soundsegments) {
                    if (json.soundsegments.soundsegment) {
                        var soundSegments = json.soundsegments.soundsegment;
                        if ($.isArray(soundSegments))
                            return soundSegments.length > 0 ? soundSegments[0] : null;
                        else
                            return soundSegments;
                    }
                } else {
                    console.log("Unexpected json output, in soundSegment.getSingle .");
                }
                return null;
            };
            params = params || {};
            handleRequest("soundsegment/" + segmentId + "/", 'GET', params, null, responseCallback, options,
                    jsonHandler, callbackParam);
        },
        //soundsegment
        getSimilar: function(segmentId, responseCallback, limit, page, params, options, callbackParam) {
            var jsonHandler = function(json) {
                if (json.soundsegments) {
                    if (json.soundsegments.soundsegment && $.isArray(json.soundsegments.soundsegment)) {
                        return json.soundsegments.soundsegment;
                    }
                    //else is an empty video array
                } else {
                    console.log("Unexpected json output, in soundSegment.getSimilar .");
                }
                return [];
            };
            params = params || {};
            params.limit = limit || params.limit || 100;
            params.page = page || params.page || 1;
            handleRequest("soundsegment/" + segmentId + "/similar/", 'GET', params, null,
                    responseCallback, options, jsonHandler, callbackParam);
        },
        //soundsegment
        getSimilarTags: function(segmentId, responseCallback, similarLimit, limit, page, params, options, callbackParam) {
            var jsonHandler = function(json) {
                if (json.soundtags) {
                    if (json.soundtags.soundtag && $.isArray(json.soundtags.soundtag)) {
                        return json.soundtags.soundtag;
                    }
                    //else is an empty video array
                } else {
                    console.log("Unexpected json output, in soundSegment.tags.getSimilarTags .");
                }
                return [];
            };
            params = params || {};
            params.limit = limit || params.limit || 100;
            params.page = page || params.page || 1;
            if (similarLimit) {
                params.similarLimit = similarLimit;
            }

            handleRequest("soundsegment/" + segmentId + "/similarsoundtag/", 'GET', params, null,
                    responseCallback, options, jsonHandler, callbackParam);
        },
        //soundsegment
        tags: {
            //soundsegment.tags
            get: function(segmentId, responseCallback, limit, page, params, options, callbackParam) {
                var jsonHandler = function(json) {
                    if (json.soundtags) {
                        if (json.soundtags.soundtag && $.isArray(json.soundtags.soundtag)) {
                            return json.soundtags.soundtag;
                        }
                        //else is an empty video array
                    } else {
                        console.log("Unexpected json output, in soundSegment.tags.get .");
                    }
                    return [];
                };
                params = params || {};
                params.limit = limit || params.limit || 100;
                params.page = page || params.page || 1;
                handleRequest("soundsegment/" + segmentId + "/soundtags/", 'GET', params, null,
                        responseCallback, options, jsonHandler, callbackParam);
            },
            //soundsegment.tags
            getByUser: function(segmentId, userId, responseCallback, limit, page, params, options, callbackParam) {
                var jsonHandler = function(json) {
                    if (json.soundtags) {
                        if (json.soundtags.soundtag && $.isArray(json.soundtags.soundtag)) {
                            return json.soundtags.soundtag;
                        }
                        //else is an empty video array
                    } else {
                        console.log("Unexpected json output, in soundSegment.tags.getByUser.");
                    }
                    return [];
                };
                params = params || {};
                params.limit = limit || params.limit || 100;
                params.page = page || params.page || 1;
                handleRequest("soundsegment/" + segmentId + "/soundtags/user/" + userId + "/", 'GET',
                        params, null, responseCallback, options, jsonHandler, callbackParam);
            }
        }
    };
    this.user = {
        //user
        get: function(responseCallback, limit, page, params, options, callbackParam) {
            var jsonHandler = function(json) {
                if (json.users) {
                    if (json.users.user && $.isArray(json.users.user)) {
                        return json.users.user;
                    }
                    //else is an empty video array
                } else {
                    console.log("Unexpected json output, in user.get .");
                }
                return [];
            };
            params = params || {};
            params.limit = limit || params.limit || 100;
            params.page = page || params.page || 1;
            handleRequest("user/", 'GET', params, null, responseCallback, options, jsonHandler, callbackParam);
        },
        //user
        getSingle: function(userId, responseCallback, params, options, callbackParam) {
            var jsonHandler = function(json) {
                if (json.users) {
                    if (json.users.user) {
                        var users = json.users.user;
                        if ($.isArray(users))
                            return users.length > 0 ? users[0] : null;
                        else
                            return users;
                    }
                } else {
                    console.log("Unexpected json output, in user.getSingle .");
                }
                return null;
            };
            params = params || {};
            handleRequest("user/" + userId + "/", 'GET', params, null, responseCallback, options, jsonHandler,
                    callbackParam);
        },
        //user
        getTags: function(userId, responseCallback, limit, page, params, options, callbackParam) {
            var jsonHandler = function(json) {
                if (json.soundtags) {
                    if (json.soundtags.soundtag && $.isArray(json.soundtags.soundtag)) {
                        return json.soundtags.soundtag;
                    }
                    //else is an empty video array
                } else {
                    console.log("Unexpected json output, in user.getTags .");
                }
                return [];
            };
            params = params || {};
            params.limit = limit || params.limit || 100;
            params.page = page || params.page || 1;
            handleRequest("user/" + userId + "/soundtags/", 'GET', params, null, responseCallback, options,
                    jsonHandler, callbackParam);
        }

    };
    this.soundtag = {
        //soundtag
        get: function(responseCallback, limit, page, params, options, callbackParam) {
            var jsonHandler = function(json) {
                if (json.soundtags) {
                    if (json.soundtags.soundtag && $.isArray(json.soundtags.soundtag)) {
                        return json.soundtags.soundtags;
                    }
                    //else is an empty video array
                } else {
                    console.log("Unexpected json output, in user.get .");
                }
                return [];
            };
            params = params || {};
            params.limit = limit || params.limit || 100;
            params.page = page || params.page || 1;
            handleRequest("soundtag/", 'GET', params, null, responseCallback, options, jsonHandler, callbackParam);
        },
        //soundtag
        getSingle: function(tagId, responseCallback, params, options) {
            var jsonHandler = function(json) {
                if (json.soundtags) {
                    if (json.soundtags.soundtag) {
                        var soundtags = json.soundtags.soundtag;
                        if ($.isArray(soundtags))
                            return soundtags.length > 0 ? soundtags[0] : null;
                        else
                            return soundtags;
                    }
                } else {
                    console.log("Unexpected json output, in user.getSingle .");
                }
                return null;
            };
            params = params || {};
            handleRequest("soundtag/" + tagId + "/", 'GET', params, null, responseCallback, options, jsonHandler);
        },
        //soundtag
        post: function(segmentId, userId, tags, type, confidence, responseCallBack, options, callbackParam) {

            var jsonHandler = function(json) {
                if (json.soundtags) {
                    if (json.insertId) {
                        return json.insertId;
                    }
                    //else is an empty video array
                } else {
                    console.log("Unexpected json output, in user.get .");
                }
                return [];
            };
            try {
                type = type || '';
                confidence = confidence || 1.0;

                if (!segmentId || !userId) {
                    throw 'Invalid null parameter!';
                }
                if (!tags) {
                    throw 'empty tags parameter.';
                } else {

                    if ($.type(tags) === 'array') {
                        if (tags.length === 0)
                            throw 'empty tags parameter: empty array.';
                        tags = tags.join(','); //convert to string.
                    } else {
                        tags = new String(tags);
                    }
                }
                postParams = JSON.stringify({uid: userId, sid: segmentId, tags: tags, type: type, confidence: confidence});
                handleRequest("soundtag/", 'POST', {}, postParams, responseCallBack, options, jsonHandler, callbackParam);
            } catch (e) {
                console.log("ERROR: " + e);
            }

        }

    }
    /**
     * 
     * @param {string} url
     * @param {string} method
     * @param {string|object} getParams
     * @param {object} postData
     * @param {function} responseCallback
     * @param {object} options
     * @param {function} jsonHandler
     * @returns {unresolved}
     */
    function handleRequest(url, method, getParams, postData, responseCallback, options, jsonHandler, callbackParam) {
        var urlParams = '';
        if ($.isPlainObject(getParams)) {
            for (var key in getParams) {
                urlParams += key + "=" + getParams[key] + "/";
            }
        } else if (typeof(getParams) === 'string') {
            urlParams += getParams;
        } else {
            console.log("WARNING: unknown GET parameters variable. Expecting string or object.");
            return;
        }

        url = $.trim(url);
        if (url.length === 0)
        {
            console.log("ERROR: empty URL at MovieCloudsAPI handleRequest.");
            return;
        }
        //url must not start with a slash
        if (url.charAt(0) === '/') {
            url = url.slice(1);
        }
        //url must end with a slash
        if (url.charAt(url.length - 1) !== '/') {
            url += '/';
        }
        var processData = true;
        if (method === 'POST' && method === 'PUT') {
            processData = false
            postData = JSON.stringify(postData || {});
        }
        var ajaxRequest = {
            url: apiPath + url + urlParams,
            type: method || 'GET',
            processData: processData,
            dataType: 'json',
            data: postData || '',
            success: successRC,
            contentType: 'application/json; charset=utf-8',
            error: errorRC,
            cache: false,
            converters: {
//                "* text": window.String,
                "text html": true,
                "text json": JSON.parse,
                "text xml": jQuery.parseXML
            }
        };
        if (debug) {
            console.log("DEBUG, AJAX REQUEST:");
            console.log(ajaxRequest);
        }
        if (options) {
            if (options.statusCode)
                ajaxRequest.statusCode = options.statusCode;
            if (options.success)
                ajaxRequest.success = options.success;
            if (options.error)
                ajaxRequest.success = options.error;
        }
        $.ajax(ajaxRequest);

        function successRC(response, textStatus, xhr) {
            var htmlStatus = xhr.status;
            var responseArray = [];
            responseArray = response.virus ? response.virus : response;
            if (responseCallback) {
                responseCallback(true, jsonHandler ? jsonHandler(responseArray) : responseArray, htmlStatus, responseArray, callbackParam);
            } else {
                console.log("WARNING: No valid responseCallback callable!");
            }
        }
        function errorRC(xhr, textStatus, errorThrown) {
            var htmlStatus = xhr.status;
            var responseArray = [];
            if (htmlStatus > 0) {
                //FIXME: possible exception here!
                try {
                    responseArray = JSON.parse(xhr.responseText);
                    responseArray = responseArray.virus ? responseArray.virus : responseArray;
                } catch (e) {
                    console.log("WARNING: unable to parse the error response from the webservice. HTTP status is " + htmlStatus + ".");
                    responseArray = [];
                }
            }
            if (responseCallback) {
                responseCallback(false, responseArray, htmlStatus, responseArray, callbackParam);
            } else {
                console.log("WARNING: No valid responseCallback callable!");
            }
        }
    }
};

