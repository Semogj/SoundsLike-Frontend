/*
 ForceGraphVis version 0.1
 ###################################################
 ############### QUICK USE EXAMPLE #################
 ###################################################
 
 //config parameters - not limited to this ones
 var config = { width: 1024, height: 540, gravity: 0.04, defaultRadius: 30, 
 charge:-100, linkMinimumDistance:15, linkMaximumDistance: 300}    
 //create a new object bounded to the html element pointed by the given selector (jquery style)
 var graphObj = new ForceGraphVis.create("#mySelectorToDiv", config);
 
 
 //define new custom behaviour before starting the simulation  
 this.onNodeClick = function(node, index){ //called when clicks over a node
 
 //IMPORTANT! instead of this to access the main object (here is graphObj), use gObj
 var o = gObj; 
 console.log("MouseClick event over node[" + index + "] \"" +  node.name + "\"");
 var selector = d3.select(this).select('.text');
 selector.transition().duration(500).text('CLICK!').each('end', function(){
 selector.text(node.name);
 });
 }   
 
 var nodes =  [{name:'A'}, {name:'B'},{name:'C'}, {name:'D'}, {name:'E'} ,{name:'F'},
 {name:'G'}, {name:'H'},{name:'I'},{name:'J'}];
 
 var links =  [{source:0, target:1, value:1},{source:0, target:2, value:1},
 {source:0, target:3, value:0.1},{source:0, target:4, value:0},
 {source:0, target:5, value:0.6},{source:0, target:6, value:0.5},
 {source:0, target:7, value:0.5},{source:0, target:8, value:0.5},
 {source:0, target:9, value:0.5}];    
 
 //start the simulation
 graphObj.start(nodes, links);
 
 ####################################################
 ############ CONFIG PARAMETERS AVAILABLE ###########
 ####################################################
 NOTE: please check processConfig() function for default values! I'm not putting them here for now.
 
 parameter key - type - description
 width - int - the canvas width. This with will be set to the html element when calling the create() method;
 height - int - the canvas height. This with will be set to the html element when calling the create() method;  
 gravity - float - on default behaviour, this is the strengh which the nodes will be pulled to the gravitacional center;
 charge - float - A negative value results in node repulsion, while a positive value results in node attraction;
 friction - float - The friction coefficient for each node. A value of 1 corresponds to a frictionless environment, while a value of 0 freezes all particles in place.   
 defaultRadius - int - The default radius in px for nodes without declared radius;
 defaultGroup - int - The default radius in px for groups without declared radius;
 linkDefaultDistance - int - The default link lenght in px (when link.value = ?);
 linkMinimumDistance - int - The minimum link lenght in px (when link.value = 0.0);
 linkMaximumDistance - int - The maximum link lenght in px (when link.value = 1.0);
 linkDefaultStrength - float - The link default link strength (rigidity) between nodes. The value must be between 0 and 1. Default = 1;
 bordersLimit : boolean - if true, nodes cannot exit the canvas even if dragged;
 nodeFillScale : object - a d3 categorical scale for defining node colors. Default is d3.scale.category20();
 pzoom - float - IGNORE this for now; 
 zoom - float - the current zoom scale;
 minZoom - float - minimum zoom scale (recommended positive value bellow 1.0);
 maxZoom - float - maximum zoom scale;
 initialZoom - float - initial zoom scale;
 linkColorScaleDomain - array - custom float domain for the link colour scale (based on the link value);
 linkColorScaleRange - array - custom color string range for the link colour scale (based on the link value);
 linkColorScale - object - custom scale for the link colour. Default is d3.scale.linear;
 
 ####################################################
 ############# NODE PARAMETERS AVAILABLE ############
 ####################################################
 
 All nodes have a set of default values, where their type must not be changed.
 
 radius - int -
 group - int -
 
 
 ####################################################
 ############# LINK PARAMETERS AVAILABLE ############
 ####################################################
 
 TODO
 
 ####################################################
 ####################################################
 ####################################################
 */

if (typeof(isset) !== "function") {
    /**
     * Returns true if the parameter is defined and not null.
     */
    function isset(variable) {
        var type = jQuery.type(variable);
        return type !== "undefined" && type !== "null";
    }

}
if (typeof(issetDefault) !== "function") {
    /**
     * Returns the first parameter if it is defined and not null, otherwise returns the second.
     * For most situations, var x = x || default will work, but if you are expecting x = 0
     *  or x = false, this is a stronger solution.
     */
    function issetDefault(variable, defaultVal) {
        return isset(variable) ? variable : defaultVal;
    }
}
if (typeof(getProperty) !== "function") {
    function getProperty(variable, property, defaultVal) {
        var vtype = jQuery.type(variable);
        if (jQuery.type(property) !== "string" && vtype === "array" || vtype === "object")
            return property in variable ? variable[property] : typeof defaultVal !== "undefined" ? defaultVal : null;
        return typeof defaultVal !== "undefined" ? defaultVal : null;
    }
}




/**
 *  Creates a new force visualization object, but do not start the simulation.
 *  @param pageElemSelector the HTML selector where you want to start the visualization (jquery style). It should be an HTML div id.
 *  @param config a map containing configuration properties. It must be a key:string => value, where value type can be anything.
 *  @deprecated use 'new ForceGraphVis.create(pageElemSelector, config)' instead.
 **/
function create_force_visualization(pageElemSelector, config) {
    return new ForceGraphVis.create(pageElemSelector, config);
}
/**
 * @deprecated use graphObj.start(nodes, links) instead.
 **/
function init_visualization(graphObj, nodes, links) {
    graphObj.start(nodes, links);
    return graphObj;
}
var ForceGraphVis =
        {
            //create an object to return that will hold the layout, properties and the visualization
            create: function(pageElemSelector, config) {

                //NOTE: similar to the 3D ambients, we have two contextes: the physics context and the visualization context
                //The physics context is were the elements directions are interpolated and position calculated.
                //The visualization context is what we going to show to the user (in the HTML or SVG!)
                //The physics context updates the visualization context, but both need to be set!
                //
                //visualization context = canvas (o.canvas)
                //physics context = layout (o.layout)

                var gObj = this;  //will store the main object, this is needed to pass values for some calls

                //set up the layout (the physics context)
                this.layout = d3.layout.force();
                this.canvasSelector = pageElemSelector;

                this.canvas = d3.select(pageElemSelector);

                this.graphId = Math.round(Math.random() * 1000);
                this.getNodeSelector = function(index) {
                    return '#node_' + index + "_" + this.graphId;
                };
                this.getNodeJquerySelector = function(index) {
                    return $('#node_' + index + "_" + this.graphId);
                };
                this.getNodeSelectorByDataId = function(id) {
                    return pageElemSelector + " .node.id-" + id;
                };


                this.isInitialized = false;
                this.isRunning = false;

                this.onNodeCharge = function(link, index, forceLayout) {
                    return gObj.config.charge;
                };
                this.onLinkDistance = function(link, index, forceLayout) {
                    var sourceRadius = isset(link.source.radius) ? link.source.radius : gObj.config.defaultRadius;
                    var targetRadius = isset(link.target.radius) ? link.target.radius : gObj.config.defaultRadius;
                    var lengthMult = issetDefault(link.lengthMult, 1);
                    if (isset(link.value)) {
                        //we are assuming that link.value have normalized values between 0 and 1.
                        var value = link.value < 0 ? 0 : link.value > 1 ? 1 : link.value;
                        return (sourceRadius + targetRadius + gObj.config.linkMinimumDistance + gObj.config.linkMaximumDistance -
                                (gObj.config.linkMaximumDistance - gObj.config.linkMinimumDistance) * value) * lengthMult;
                    } else {
                        return (sourceRadius + targetRadius + gObj.config.linkDefaultDistance) * lengthMult;
                    }
                };
                this.onLinkStrength = function(link, index, forceLayout) {
                    return gObj.config.linkDefaultStrength;
                };

                //lets cleanup and process the config file
                loadConfig(config || {});

                //private
                function loadConfig(config, reload) {
                    //cleanup config
                    cleanConfig(config, reload);


                    //set up the visualization
                    gObj.canvas.style("width", gObj.config.width + "px").style("height", gObj.config.height + "px");
                }
                ;
                //private
                function cleanConfig(config, reuse)
                {
                    gObj.config = {
                        width: getProperty(config, "width", reuse ? gObj.config.width : 960),
                        height: getProperty(config, "height", reuse ? gObj.config.height : 500),
                        gravity: getProperty(config, "gravity", reuse ? gObj.config.gravity : 0.05),
                        charge: getProperty(config, "charge", reuse ? gObj.config.charge : -100),
                        friction: getProperty(config, "friction", reuse ? gObj.config.friction : 0.9),
                        defaultRadius: getProperty(config, "defaultRadius", reuse ? gObj.config.defaultRadius : 6),
                        defaultGroup: getProperty(config, "defaultGroup", reuse ? gObj.config.defaultGroup : null),
                        linkDefaultDistance: getProperty(config, "linkDefaultDistance", reuse ? gObj.config.linkDefaultDistance : 30),
                        linkMinimumDistance: getProperty(config, "linkMinimumDistance", reuse ? gObj.config.linkMinimumDistance : 10),
                        linkMaximumDistance: getProperty(config, "linkMaximumDistance", reuse ? gObj.config.linkMaximumDistance : 60),
                        linkDefaultStrength: getProperty(config, "linkDefaultStrength", reuse ? gObj.config.linkDefaultStrength : 1),
                        bordersLimit: getProperty(config, "bordersLimit", reuse ? gObj.config.bordersLimit : true),
                        nodeFillScale: getProperty(config, "nodeFillScale", reuse ? gObj.config.nodeFillScale : d3.scale.category20()),
                        pzoom: getProperty(config, "zoom", reuse ? gObj.config.pzoom : 1), //yes zoom is correct here!
                        zoom: getProperty(config, "zoom", reuse ? gObj.config.zoom : 1),
                        minZoom: getProperty(config, "minZoom", reuse ? gObj.config.minZoom : 0.0625), //-4x
                        maxZoom: getProperty(config, "maxZoom", reuse ? gObj.config.maxZoom : 5), //5x
                        initialZoom: getProperty(config, "initialZoom", reuse ? gObj.config.initialZoom : gObj.zoom),
                        linkColorScaleDomain: getProperty(config, "linkColorScaleDomain", reuse ? gObj.config.linkColorScaleDomain : null),
                        linkColorScaleRange: getProperty(config, "linkColorScaleRange", reuse ? gObj.config.linkColorScaleRange : null),
                        linkColorScale: getProperty(config, "linkColorScale", reuse ? gObj.config.linkColorScale : null),
                        debug: getProperty(config, "debug", reuse ? gObj.config.debug : true),
                        noNodeBorders: getProperty(config, "noNodeBorders", reuse ? gObj.config.noNodeBorders : false),
//                        useCssColors: getProperty(config, "useCssColors", reuse ? gObj.config.useCssColors : false)
                    };
                    if (gObj.config.linkColorScale === null) {
                        //Custom scale is not defined. Lets use a default linear scale.
                        gObj.config.linkColorScale = d3.scale.linear();
                        //Are custom scale domains and ranges defined in config? If not, lets use default values.
                        if (gObj.config.linkColorScaleDomain !== null) {
                            gObj.config.linkColorScale.domain(gObj.config.linkColorScaleDomain); //config domain
                        } else {
                            gObj.config.linkColorScale.domain([0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]); //default domain
                        }
                        if (gObj.config.linkColorScaleRange !== null) {
                            gObj.config.linkColorScale.range(gObj.config.linkColorScaleRange); //config range
                        } else {
                            //default range
                            gObj.config.linkColorScale.range(["#0066FF", "#00CC99", "#00CC00", "#99CC00", "#FF9900", "#FF6600", "#FF3300", "#FF0000", "#B20000"]);
                        }
                    } else {
                        //Custom scale in config found. Add the scale and/or if also defined in the config. 
                        //If not we use the domain and range of the custom scale.
                        if (gObj.config.linkColorScaleDomain !== null) {
                            gObj.config.linkColorScale.domain(gObj.config.linkColorScaleDomain);
                        }
                        if (gObj.config.linkColorScaleRange !== null) {
                            gObj.config.linkColorScale.range(gObj.config.linkColorScaleRange);
                        }
                    }

                }// function cleanConfig();

                this.reloadConfig = function(config) {
                    loadConfig(config || {}, true);
                    return this;
                };

                //maping some functions
                this.restart = function() {
                    this.layout.start();
                    this.isRunning = true;
                    return this;
                };
                this.stop = function() {
                    this.layout.stop();
                    this.isRunning = false;
                    return this;
                };
                this.resume = function() {
                    this.layout.resume();
                    this.isRunning = true;
                    return this;
                };

                this.tick = function() {
                    this.layout.tick();
                    return this;
                };
                /**
                 * Similar to o.stop(); o.tick(); o.start();
                 */
                this.update = function() {
                    this.layout.start();
                    this.layout.tick();
                    this.layout.start();
                    return this;
                };
                /**
                 * @deprecated use onNodeHtml instead!
                 */
                this.onNodeCreation = function(node, index) {
                    return '<div class="text" >' + node.name + '</div>';
                };
                this.onNodeHtml = function(node, index, DOMelem) {
                    return this.onNodeCreation(node, index);
                }
                this.changeZoom = function(position, value) {
                    var o = this;
                    o.zoom = value;
                    var transformStr = "translate(" + (position[0] + ((o.config.width - (o.config.width * o.config.initialZoom)) / 2))
                            + ',' + (position[1] + ((o.config.height - (o.config.height * o.config.initialZoom)) / 2)) + ")scale(" + value * o.config.initialZoom + ")";
                    o.canvas.style("-webkit-transform", transformStr)
                            .style("-moz-transform", transformStr)
                            .style("-ms-transform", transformStr)
                            .style("-o-transform", transformStr)
                            .style("transform", transformStr);
                    return o;
                };
                //this function is called in each step of the simulation
                this.onTick = function() {
                    var o = gObj; //this context here will be d3.layout!
                    function transform(link) {
                        return "rotate(" + Math.atan2(
                                (link.target.y + link.target.radius) - (link.source.y + link.source.radius),
                                (link.target.x + link.target.radius) - (link.source.x + link.source.radius)
                                ) * 180 / Math.PI + "deg)";
                    }
                    //calculates the link lenght. For l
                    function length(link)
                    {
                        var dx = (link.target.x + link.target.radius) - (link.source.x + link.source.radius),
                                dy = (link.target.y + link.target.radius) - (link.source.y + link.source.radius);
                        return Math.sqrt(dx * dx + dy * dy) + "px";
                    }

                    o.visNodes.style("left", function(node) {
                        var pos = 0.0;
                        if (o.config.bordersLimit || node.bordersLimit)
                            pos = (node.x = Math.max(0, Math.min(o.config.width - node.radius * 2, node.x)));  //x bondaries limit
                        else
                            pos = node.x;
                        return  pos + "px";
                    })
                            .style("top", function(node) {
                        var pos = 0.0;
                        if (o.config.bordersLimit || node.bordersLimit)
                            pos = (node.y = Math.max(0, Math.min(o.config.height - node.radius * 2, node.y))); //y bondaries limit
                        else
                            pos = node.y;
                        return  pos + "px";
                    })
                            .each(function(node, i) {
                        if (node.dragged) {
                            gObj.onDragNodeTick(node, i, this);
                        }
                    });

                    o.visLinks.style("left", function(d) {
                        return (d.source.x + d.source.radius) + "px";
                    })
                            .style("top", function(d) {
                        return (d.source.y + d.source.radius) + "px";
                    })
                            .style("width", length)
                            .style("-webkit-transform", transform)
                            .style("-moz-transform", transform)
                            .style("-ms-transform", transform)
                            .style("-o-transform", transform)
                            .style("transform", transform);
                    return o;
                };
                //called when the mode pointer hovers over a node
                this.onNodeMouseOver = function(node, index, DOMElem) {
                    var o = gObj;
                    if (o.config.debug)
                        console.log("MouseOver event over node[" + index + "] \"" + node.name + "\"");
                    var newRadius = node.radius * 1.5;
                    var difRadius = (newRadius - node.radius) * -1;
                    var selector = d3.select(DOMElem);
                    selector.style('z-index', Math.round(selector.style('z-index') * 2))
                            .transition().duration(250)
                            .style('margin-top', difRadius + "px")
                            .style('margin-left', difRadius + "px")
                            .style('width', newRadius * 2 + "px")
                            .style('height', newRadius * 2 + "px")
                            .style('border-radius', newRadius + "px");
                    return o;
                };
                /**
                 *  Called when the mode pointer hovers out of a node. 
                 *  
                 */
                this.onNodeMouseOut = function(node, index, DOMElem) {
                    var o = gObj;
                    if (o.config.debug)
                        console.log("MouseOut event over node[" + index + "] \"" + node.name + "\"");
                    var selector = d3.select(DOMElem);
                    //selector.select('.text').text(node.name);   
                    selector.style('z-index', Math.round(selector.style('z-index') / 2))
                            .transition().duration(250)
                            .style('margin-top', "0px")
                            .style('margin-left', "0px")
                            .style('width', node.radius * 2 + "px")
                            .style('height', node.radius * 2 + "px")
                            .style('border-radius', node.radius + "px");
                    o.layout.resume();
                    return o;
                };
                //called when clicks over a node
                this.onNodeClick = function(node, index, DOMelem) {
                    if (o.config.debug)
                        console.log("MouseClick event over node[" + index + "] \"" + node.name + "\"");
                    return gObj;
                };
                //called when clicks over a node
                this.onNodeDoubleClick = function(node, index, DOMelem) {
                    if (o.config.debug)
                        console.log("Double mouse click event over node[" + index + "] \"" + node.name + "\"");
                    return gObj;
                };
                this.onNodeClass = function(node, id, DOMelem) {
                    return "";
                };
                this.onNodeTitle = function(node, id, DOMelem) {
                    return "";
                };

                this.onZoomAction = function() {
                    var o = gObj;
                    //Zoom work in progress  
                    var translatePos = d3.event.translate;
                    var value = o.config.zoom;
                    //detect the mousewheel event, then subtract/add a constant to the zoom level and transform it
                    if (d3.event.sourceEvent.type === 'mousewheel' || d3.event.sourceEvent.type === 'DOMMouseScroll') {
                        if (d3.event.sourceEvent.wheelDelta) {
                            if (d3.event.sourceEvent.wheelDelta > 0) {
                                value = value + 0.1;
                            } else {
                                value = value - 0.1;
                            }
                        } else {
                            if (d3.event.sourceEvent.detail > 0) {
                                value = value + 0.1;
                            } else {
                                value = value - 0.1;
                            }
                        }
                        o.changeZoom(translatePos, value);
                        //o.update();
                    }
                    return o;
                    //transformVis(d3.event.translate, value);
                };

                /**
                 *  Called when start dragging a node.
                 **/
                this.onDragStart = function(node, index, DOMelem) {
                    return gObj;
                };

                /**
                 *  Called each step while dragging a node.
                 **/
                this.onDragMove = function(node, index, DOMelem) {
                    return gObj;
                };

                this.onDragNodeTick = function(node, index, DOMelem) {
                    return gObj;
                };
                /**
                 *  Called when releases a node after dragging.
                 **/
                this.onDragEnd = function(node, index) {
                    return gObj;
                };

                this.dragStartEvent = function(node, index) {
                    gObj.onDragStart(node, index, this);
                    node.fixed |= 2;
                    node.dragged = true;
                    return gObj;
                };

                this.dragMoveEvent = function(node, index) {
                    gObj.onDragMove(node, index, this);
                    node.px = d3.event.x, node.py = d3.event.y;
                    gObj.layout.resume();
                    return gObj;
                };

                this.dragEndEvent = function(node, index) {
                    gObj.onDragEnd(node, index, this);
                    node.fixed &= 1;
                    node.dragged = null;
                    return gObj;
                };
                //the default function, allways called!
                this.defaultCleanupNodes = function(nodeArr) {
                    var o = gObj;
                    var size = nodeArr.length;
                    for (var i = 0; i < size; i++)
                    {
                        nodeArr[i].group = nodeArr[i].group || o.config.defaultGroup;
                        nodeArr[i].radius = nodeArr[i].radius || o.config.defaultRadius;
                        nodeArr[i].id = nodeArr[i].id || i;
                        nodeArr[i].class = nodeArr[i].class || '';

                        if (isset(nodeArr[i].radiusMult)) {
                            nodeArr[i].radius *= nodeArr[i].radiusMult;
                        } else {
                            nodeArr[i].radiusMult = 1;
                        }
                        nodeArr[i].bordersLimit = nodeArr[i].bordersLimit || o.config.bordersLimit;
                    }
                    o.onCleanupNodes(nodeArr);
                    return gObj;
                };
                this.placeNodes = function(nodesArr) {
                    var o = gObj;
                    //        var n = nodesArr.length;
                    var x = o.config.width / 2, y = o.config.height / 2;
                    //        var xx = o.config.width /10, yy = o.config.height / 10; 
                    nodesArr.forEach(function(d, i) {
                        if (!d.x)
                            d.x = x + Math.round(Math.random() * 30) * Math.pow(-1, i);

                        if (!d.y)
                            d.y = y + Math.round(Math.random() * 30) * Math.pow(-1, i);
                    });
                    return gObj;
                };
                this.onCleanupNodes = function() {
                }; //the substitute function, to be appended to the default one
                /**
                 * Toogle borders limit ON or OFF for this graph. Nodes cannot leave canvas when borders limit is ON.
                 * Any node outside of the canvas will be thrown inside.
                 */
                this.setBordersLimit = function(val) {
                    var o = gObj;
                    o.toggleBordersLimitAndGet(val);
                    return o;
                };
                this.toggleBordersLimit = function(val) {
                    var o = gObj;
                    o.stop();
                    o.config.bordersLimit = issetDefault(val, !o.config.bordersLimit);
                    o.tick();
                    o.resume();
                    return o.config.bordersLimit;
                };
                this.exclusionAreas = new Array();

//                this.addExclusionZone = function(xPos, yPos, width, height) {
//                    return this.exclusionAreas.push({x: xPos, y: yPos, width: width, height: height});
//                };
//                this.removeAllExclusionZones = function() {
//                    this.exclusionAreas = new Array();
//                };

                this.start = function(nodes, links) {
                    var o = this;

                    //wipe canvas content
                    o.canvas.html("");
                    //setup layout properties based on config
                    o.layout.gravity(o.config.gravity)
                            .charge(function(n, i) {
                        return o.onNodeCharge.call(o, n, i, this);
                    })
                            .linkDistance(function(l, i) {
                        return o.onLinkDistance.call(o, l, i, this);
                    })
                            .linkStrength(function(l, i) {
                        return o.onLinkStrength.call(o,l, i, this);
                    })
                            .friction(o.config.friction)
                            //define the size of the canvas
                            .size([o.config.width, o.config.height]);
                    if (!isset(nodes)) {
                        //no paremeters, act as restart!
                        o.layout.start();
                        o.isRunning = true;
                        return o;
                    }

                    //add links to the visualization
                    o.visLinks = o.canvas.selectAll("div.link")
                            .data(links)
                            .enter()
                            .append("div")
                            .attr("class", function(link) {
                        return "link" + (link.class ? " " + link.class : "");
                    })
                            //link thickness
                            .style("z-index", function(link) {
                        if (isset(link.value)) {
                            return Math.round(link.value * 100);
                        } else {
                            return 1;
                        }
                    })
                            .style("background-color", function(link) {
                        if (isset(link.value)) {
                            //round it to 2 decimals
                            var value = Math.round(link.value * 100) / 100;
                            //we are assuming that link.value have normalized values between 0 and 1.
                            value = value < 0 ? 0 : value > 1 ? 1 : value;
                            return o.config.linkColorScale(value);
                        } else {
                            return "#000000";
                        }

                    });

                    //call both cleanup function (the default and the custom if available)
                    o.defaultCleanupNodes(nodes);
                    //place the nodes in the visualization, otherwise they will be randomly placed
                    o.placeNodes(nodes);
                    //add nodes to the visualization
                    var drag = null;

                    o.visNodes = o.canvas.selectAll("div.node")
                            .data(nodes)
                            .enter()
                            .append("div")
                            .attr("id", function(node, index) {
                        return 'node_' + index + "_" + o.graphId;
                    })
                            .attr("class", function(node, index) {

                        var ret = "node";
                        ret += isset(node.group) ? " group_" + node.group : "";
                        ret += isset(config.getDataId) ? " id-" + config.getDataId(node) : isset(node.id) ? " id-" + node.id : '';
                        if (isset(node.class))
                            ret += " " + node.class;
                        return ret + " " + o.onNodeClass(node, index, this);
                    })
                            .attr("title", function(n, i) {
                        return o.onNodeTitle(n, i, this);
                    })
                            .html(function(n, i) {
                        return o.onNodeHtml.call(o, n, i, this);
                    })
                            .style("width", function(d) {
                        return (isset(d.radius) ? d.radius * 2 : o.config.defaultRadius * 2) + "px";
                    })
                            .style("height", function(d) {
                        return (isset(d.radius) ? d.radius * 2 : o.config.defaultRadius * 2) + "px";
                    })
                            .style("border-radius", function(d) {
                        var radius = isset(d.radius) ? d.radius : o.config.defaultRadius;
                        return  (radius * 1.5) + "px";
                    })
                            .style("background", function(d) {
                        if (d.group)
                            return o.config.nodeFillScale(d.group);
                        else
                            return null;
                    })
                            .style("border-color", function(d) {
                        if (d.group && !o.config.noNodeBorders)
                            return d3.rgb(o.config.nodeFillScale(d.group)).brighter();
                        else
                            return null;
                    })
                            .on('click', function(n, i) {
                        o.onNodeClick(n, i, this);
                    })
                            .on('dblclick', function(n, i) {
                        o.onNodeDoubleClick(n, i, this);
                    })
                            .on('mouseover', function(n, i) {
                        o.onNodeMouseOver(n, i, this);
                    })
                            .on('mouseout', function(n, i) {
                        o.onNodeMouseOut(n, i, this);
                    })
//                            .call(d3.behavior.drag()
//                            .on('dragstart', o.dragStartEvent)
//                            .on('drag', o.dragMoveEvent)
//                            .on('dragend', o.dragEndEvent))
                            .call(function() {
                        if (!drag)
                            drag = d3.behavior.drag().origin(function(d) {
                                return d;
                            })//origin
                                    .on("dragstart", gObj.dragStartEvent)
                                    .on("drag", gObj.dragMoveEvent)
                                    .on("dragend", gObj.dragEndEvent);
                        this.on("mouseover.force", layout_forceMouseover)
                                .on("mouseout.force", layout_forceMouseout)
                                .call(drag);
                    })//} -> function(), ) -> call

                            .call(d3.behavior.zoom().on("zoom", o.onZoomAction));

                    //drag utility functions
                    function layout_forceMouseover(d) {
                        d.fixed |= 4;
                        d.px = d.x, d.py = d.y;
                    }
                    function layout_forceMouseout(d) {
                        d.fixed &= 3;
                    }
                    //tell the physics how to update and to start the simulation
                    o.layout
                            .nodes(nodes)
                            .links(links)
                            .on("tick", o.onTick)
                            .start();

                    o.isInitialized = o.isRunning = true;

                };// start : function

            }//create: function()

        };