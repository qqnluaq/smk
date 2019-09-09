include.module( 'tool-sessionexport', [ 'tool', 'widgets', 'tool-sessionexport.panel-sessionexport-html' ], function ( inc ) {
    "use strict";

    
    var jsonDownloadValue = "Normal"
    var dynamicLink = "Placeholder"

    
    

    Vue.component( 'sessionexport-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'sessionexport-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-sessionexport.panel-sessionexport-html' ],
        props: [ 'content' ],
        
        data: function() {
            return {
              jsonDownloadLink: jsonDownloadValue,
              titleCheck: dynamicLink
            }
          }
        
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function sessionexportTool( option ) {
        
        this.makePropWidget( 'icon', null ) //'help' )

        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            widgetComponent:'sessionexport-widget',
            panelComponent: 'sessionexport-panel',
            // title:          'sessionexport SMK',
            // position:       'menu'
            content:        null
            
        }, option ) )

    }


    // Gets JSON Layer information from smk and then assigns that to an object which can be downloaded
    // Going to build an entire JSON object structured after map-config.json
    // first need to build the map-config.json equivalent object, then can start copying data into it, then it can be provided as a
    // downloadable object
    function createJsonLink ( smk ) {

        let blob = new Blob([JSON.stringify(copyIntoJSONObject( smk ), null, 2)], {type : 'application/json'});
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob)
        a.download = 'map-config.json';
        a.innerHTML = 'download JSON';
        jsonDownloadValue = a
        a.dispatchEvent(new MouseEvent(`click`, {bubbles: true, cancelable: true, view: window}));
    }


    // creates a JSON object using the same structure as the eventual format as a map-config file
    function createSMKJSONObject () {

        let smkJSONHolder = {
                "lmfId": null,
                "lmfRevision" : null,
                "version" : null,
                "name": null,
                "project": null,
                "createdBy" : null,
                "createdDate" : null,
                "modifiedBy" : null, 
                "modifiedDate" : null,
                "published": null,
                "surround": {
                    "type": null,
                    "title": null,
                    "imageSrc": null
                },
                "viewer": {
                    "type": null,
                    "location": {
                        "extent": [],
                        "center": [],
                        "zoom": null
                    },
                "baseMap" : null,
                "activeTool" : null,
                "clusterOption": {
                    "showCoverageOnHover": null
                },
                "device": null,
                "themes": [],
                "deviceAutoBreakpoint": null,
                "panelWidth": null
            },
            "layers": [ 
                {}

            ],
            "tools": [
                {}
            ],
            "_id": null,
            "_rev": null,
            "drawings": [
            ]

            
            }

            return smkJSONHolder

    }

    //check if the passed object has tooltip, if it does it has content to be returned
    function checkForContent ( obj) {
        let content = null
        if ( obj._tooltip ) {
            content = obj._tooltip._content
        }
        return content
    }

    // takes the empty JSON holder and the smk object and fills the smkJSON holder with the useful values of smk to create a JSON file that can be used as a map-config
    // or at least as a similar file
    // should come back and clean this up into a readable for loop going through smk and checking all it's properties against jsonObjectHolder's properties that way

    // has to check state to see if the layers are enabled or disabled as well via checking smk.$viewer.visibleLayer
    function copyIntoJSONObject ( smk ){
        let jsonObjectHolder = createSMKJSONObject()

        if ( jsonObjectHolder.hasOwnProperty("lmfId")  && smk.hasOwnProperty('lmfId')){
            //////console.log ("both have a lmfid property")
            jsonObjectHolder.lmfId = smk.lmfId
        }
        if ( jsonObjectHolder.hasOwnProperty("lmfRevision")  && smk.hasOwnProperty('lmfRevision')){
            //////console.log ("both have a lmfRevision property")
            jsonObjectHolder.lmfRevision = smk.lmfRevision
        }
        if ( jsonObjectHolder.hasOwnProperty("version")  && smk.hasOwnProperty('version')){
            //////console.log ("both have a version property")
            jsonObjectHolder.version = smk.version
        }
        if ( jsonObjectHolder.hasOwnProperty("name")  && smk.hasOwnProperty('name')){
            //////console.log ("both have a name property")
            jsonObjectHolder.name = smk.name
        }
        if ( jsonObjectHolder.hasOwnProperty("project")  && smk.hasOwnProperty('project')){
            //////console.log ("both have a project property")
            jsonObjectHolder.project = smk.project
        }
        if ( jsonObjectHolder.hasOwnProperty("createdBy")  && smk.hasOwnProperty('createdBy')){
            //////console.log ("both have a createdBy property")
            jsonObjectHolder.createdBy = smk.createdBy
        }
        if ( jsonObjectHolder.hasOwnProperty("createdDate")  && smk.hasOwnProperty('createdDate')){
            //////console.log ("both have a createdDate property")
            jsonObjectHolder.createdDate = smk.createdDate
        }
        if ( jsonObjectHolder.hasOwnProperty("modifiedBy")  && smk.hasOwnProperty('modifiedBy')){
            //////console.log ("both have a modifiedBy property")
            jsonObjectHolder.modifiedBy = smk.modifiedBy
        }
        if ( jsonObjectHolder.hasOwnProperty("modifiedDate")  && smk.hasOwnProperty('modifiedDate')){
            //////console.log ("both have a modifiedDate property")
            jsonObjectHolder.modifiedDate = smk.modifiedDate
        }
        if ( jsonObjectHolder.hasOwnProperty("published")  && smk.hasOwnProperty('published')){
            //////console.log ("both have a published property")
            jsonObjectHolder.published = smk.published
        }
        if ( jsonObjectHolder.hasOwnProperty("surround")  && smk.hasOwnProperty('surround')){
            //////console.log ("both have a surround property")
            jsonObjectHolder.surround = smk.surround
        }
        if ( jsonObjectHolder.hasOwnProperty("viewer")  && smk.hasOwnProperty('viewer')){
            //////console.log ("both have a viewer property")
            jsonObjectHolder.viewer = smk.viewer
            let baseMap
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Topo_Map")) {
                baseMap = "Topographic"
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Street_Map")) {
                baseMap = "Streets"
                
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Imagery")) {
                baseMap = "Imagery"
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Ocean_Base")) {
                baseMap = "Oceans"
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("NatGeo_World_Map")) {
                baseMap = "NationalGeographic"
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Dark_Gray_Base")) {
                baseMap = "DarkGray"
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Light_Gray_Base")) {
                baseMap = "Gray"
                
            }
            jsonObjectHolder.viewer.baseMap = baseMap;

        }
        if ( jsonObjectHolder.hasOwnProperty("layers")  && smk.hasOwnProperty('layers')){
            //////console.log ("both have a layers property")
            jsonObjectHolder.layers = smk.layers
        }
        if ( jsonObjectHolder.hasOwnProperty("tools")  && smk.hasOwnProperty("tools")){
            //////console.log ("both have a tools property")
            jsonObjectHolder.tools = smk.tools
        }
        if ( jsonObjectHolder.hasOwnProperty("_id")  && smk.hasOwnProperty('_id')){
            //////console.log ("both have a _id property")
            jsonObjectHolder._id = smk._id
        }
        if ( jsonObjectHolder.hasOwnProperty("_rev")  && smk.hasOwnProperty('_rev')){
            //////console.log ("both have a _rev property")
            jsonObjectHolder._rev = smk._rev
        }





        // now need to check state and set it appropriately for the various tool displayers
        // first turn everything off

        for (let tool in jsonObjectHolder.tools) {
            //////console.log(jsonObjectHolder.tools[y])
            if (jsonObjectHolder.tools[tool].type == "layers") {
                for ( let item in jsonObjectHolder.tools[tool].display) {
                    //////console.log(jsonObjectHolder.tools[y].display[x])
                    jsonObjectHolder.tools[tool].display[item].isVisible = false
                }
            }
        }
        
        // then compare the tools display state to every visible layer, if there is a match then turn on the visibility
        for (let x in smk.$viewer.visibleLayer) {
            
            
            for (let y in jsonObjectHolder.tools) {
                
                if (jsonObjectHolder.tools[y].type == "layers") {
                    for ( let j in jsonObjectHolder.tools[y].display) {
                        

                        if ( x == jsonObjectHolder.tools[y].display[j].id ) {
                            
                            jsonObjectHolder.tools[y].display[j].isVisible = true
                        }

                        
                    }
                }
            }
        }


        // Going to get a list of all the layers currently in the system
        // then iterate through all existing objects to check for duplicates, if no duplicates are found then add both the tool version
        // and the layer version to  jsonLayersAndToolsToBeAdded array,
        //this allows for layers that have been added through tool-layer import to be carried into the main system
        let arrayOfJSONLayersAndTools = getArrayOfJSONLayers( smk )
        // need to first loop through all layers, to check for matches, if there is a match then don't add it
        

        // this object is going to store all the new layers that we'll add in the step during a for loop where no matches were found for that layer
        let jsonLayersAndToolsToBeAdded = []
        for (let newLayers in arrayOfJSONLayersAndTools) {
            for (let layer in jsonObjectHolder.layers) {
                //console.log("existing layer is: ", jsonObjectHolder.layers[layer].id)
                //console.log("possible new layer is: ", arrayOfJSONLayersAndTools[newLayers].jsonLayerInfo.id)
                if (jsonObjectHolder.layers[layer].id == arrayOfJSONLayersAndTools[newLayers].jsonLayerInfo.id) {
                    //console.log("Match, this layer should not be added")
                    break;
                } 
                // this should mean we're in the last length of the loop and there has not been a match, and therefore this layer should be added
                //console.log("Layer number is: ", layer)
                //console.log("total length is: ", jsonObjectHolder.layers.length)
                if (layer == (jsonObjectHolder.layers.length - 1)) {
                    //console.log("this one should be added")
                    //console.log("NOT MATCH existing layer is: ", jsonObjectHolder.layers[layer].id)
                    //console.log("NOT MATCH possible new layer is: ", arrayOfJSONLayersAndTools[newLayers].jsonLayerInfo.id)

                    jsonLayersAndToolsToBeAdded.push(arrayOfJSONLayersAndTools[newLayers])
                }
            }       
        }

        
        // now to add these layers and tools into the main jsonObjectHolder object so they will be exported correctly
        for (let layerTool in jsonLayersAndToolsToBeAdded) {
            jsonObjectHolder.layers.push(jsonLayersAndToolsToBeAdded[layerTool].jsonLayerInfo)

            for (let tool in jsonObjectHolder.tools) {
                if (jsonObjectHolder.tools[tool].type == "layers" ){
                    jsonObjectHolder.tools[tool].display.push(jsonLayersAndToolsToBeAdded[layerTool].jsonToolLayerInfo)
                }

                
            }

        }





        // can find co-ordinates and zoom here, but only if it's changed
        if (smk.$viewer.map._animateToCenter){
            //////console.log(smk.$viewer.map._animateToCenter)
            jsonObjectHolder.viewer.location.center[0] = smk.$viewer.map._animateToCenter.lng
            jsonObjectHolder.viewer.location.center[1] = smk.$viewer.map._animateToCenter.lat
        }
        
        if (smk.$viewer.map._animateToZoom){
            //////console.log(smk.$viewer.map._animateToZoom)
            jsonObjectHolder.viewer.location.zoom = smk.$viewer.map._animateToZoom
        }


        // handle the export of circles created in leaflet here
        if (smk.$viewer.type == "leaflet") {
            for (let drawing in smk.$viewer.map._layers) {
                if (smk.$viewer.map._layers[drawing]._mRadius && smk.$viewer.map._layers[drawing]._latlng) {
                    ////console.log("_mRadius exists and is: ", smk.$viewer.map._layers[drawing]._mRadius)
                    let radius = smk.$viewer.map._layers[drawing]._mRadius
                    ////console.log(radius)
                    ////console.log("_latling exists and is: ", smk.$viewer.map._layers[drawing]._latlng)
                    let latlng = smk.$viewer.map._layers[drawing]._latlng
                    //checking for _content which would be there if a tooltip had occured
                    let content = checkForContent( smk.$viewer.map._layers[drawing] )
                    let circleObj = { type: "circle", latlng, radius, content}
                    jsonObjectHolder.drawings.push(circleObj)

                // handle support for lines and polygons
                } else if (smk.$viewer.map._layers[drawing]._latlngs && smk.$viewer.map._layers[drawing]._path) {
                    if ( smk.$viewer.map._layers[drawing]._path.attributes[6].nodeValue == "none") {
                        // handle retriveing the latlangs needed for making a line, and give it the type of "line"
                        ////console.log("This is a line!")
                        ////console.log("_latlngs exists and is: ", smk.$viewer.map._layers[drawing]._latlngs)
                        let latlngs = smk.$viewer.map._layers[drawing]._latlngs
                        //checking for _content which would be there if a tooltip had occured
                        let content = checkForContent( smk.$viewer.map._layers[drawing] )
                        
                        let lineObj = { type: "line", latlngs, content }
                        jsonObjectHolder.drawings.push(lineObj)

                        
                    } else { //if nodeValue is not "none" then it's a polygon
                        ////console.log("This is a polygon")
                        ////console.log("_latlngs exists and is: ", smk.$viewer.map._layers[drawing]._latlngs)
                        let latlngs = smk.$viewer.map._layers[drawing]._latlngs
                        //checking for _content which would be there if a tooltip had occured
                        let content = checkForContent( smk.$viewer.map._layers[drawing] )
                        
                        
                        let polygonObj = { type: "polygon", latlngs, content}
                        jsonObjectHolder.drawings.push(polygonObj)
                        

                    }
                  
                    // handle exporting of markers
                } else if (smk.$viewer.map._layers[drawing]._icon && smk.$viewer.map._layers[drawing]._latlng && smk.$viewer.map._layers[drawing]._shadow) {
                    let latlng = smk.$viewer.map._layers[drawing]._latlng
                    //checking for _content which would be there if a tooltip had occured
                    let content = checkForContent( smk.$viewer.map._layers[drawing] )
                    let markerObj = { type: "marker", latlng, content  }
                    jsonObjectHolder.drawings.push(markerObj)
                    ////console.log("another marker hmm")
                    ////console.log(smk.$viewer.map._layers[drawing])
                }
                
                
            
            }
        } else {
            ////console.log ("No esri3D support for circles yet, sorry.")
        }



        
        return jsonObjectHolder
    }



    //grab all the layer info needed required to recreate a layer on load, and return a JSON of that info that can be parse and inserted into
    // the existing map_config.json structure
    function getArrayOfJSONLayers( smk ) {

        //final return value holder
        let arrayOfJSONLayers = [];

        let type = null;
        let id = null;
        let title = null;
        let isVisible = true;
        let attribution = '';
        let metadataURL = '';
        let opacity = 0.65;
        let isQueryable = true;
        let attributes = [];

        let serviceUrl = null;
        let layerName = null;
        let styleName = null;

        //this loop creates a JSON object for each WMS layer it finds, then add it to the array of all the JSON layer objects we have
        for (let layer in smk.$viewer.map._layers ) {
            //console.log(smk.$viewer.map._layers[layer])
            if (smk.$viewer.map._layers[layer].options && smk.$viewer.map._layers[layer].wmsParams) {

                let jsonToolAndLayerInfoCombined = '{ "jsonLayerInfo": "", "jsonToolLayerInfo": ""}'
                jsonToolAndLayerInfoCombined = JSON.parse(jsonToolAndLayerInfoCombined)

                //console.log('The service URL is: ', smk.$viewer.map._layers[layer]._url)
                //console.log('The layer is: ', smk.$viewer.map._layers[layer].options.layers)
                //console.log('The style is: ', smk.$viewer.map._layers[layer].options.styles)

                type = smk.$viewer.map._layers[layer].wmsParams.service
                serviceUrl = smk.$viewer.map._layers[layer]._url
                layerName = smk.$viewer.map._layers[layer].options.layers
                styleName = smk.$viewer.map._layers[layer].options.styles

                //console.log("layer name is: ", layerName)
                //console.log("The style name is: ", styleName)

                id = (layerName + "-" + styleName)

                //This title name is a placeholder
                title = (layerName + "-" + styleName)
                title = title.replace(/_/g, " ")
                //console.log("placeholder title is: ", title)
                //console.log("ID is: ", id)

                let jsonLayerInfo = '{  "type": null, "id": null, "title": null, "isVisible": true, "attribution": "", "metadataUrl": "", "opacity": 0.65,  "isQueryable": true, "attributes": [], "serviceUrl":null, "layerName": null, "styleName": null }';

                jsonLayerInfo = JSON.parse(jsonLayerInfo)
                jsonLayerInfo.type = type.toLowerCase()
                jsonLayerInfo.id = id
                jsonLayerInfo.title = title
                jsonLayerInfo.serviceUrl = serviceUrl
                jsonLayerInfo.layerName = layerName
                jsonLayerInfo.styleName = styleName

                //console.log("json layer info is: ", jsonLayerInfo)

                let jsonToolLayerInfo = '{  "id": "", "type": "layer", "title": "", "isVisible": true }'
                jsonToolLayerInfo  = JSON.parse(jsonToolLayerInfo)
                jsonToolLayerInfo.id = id
                jsonToolLayerInfo.title = title 

                jsonToolAndLayerInfoCombined.jsonLayerInfo = jsonLayerInfo
                jsonToolAndLayerInfoCombined.jsonToolLayerInfo = jsonToolLayerInfo

                 // Should be adding to the array here
                arrayOfJSONLayers.push(jsonToolAndLayerInfoCombined)
            }
            
        }
        
        return (arrayOfJSONLayers)
        
    }







    SMK.TYPE.sessionexportTool = sessionexportTool

    $.extend( sessionexportTool.prototype, SMK.TYPE.Tool.prototype )
    sessionexportTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    sessionexportTool.prototype.afterInitialize.push( function ( smk ) {
        smk.on( this.id, {
            'activate': function () {
           
            //This is creating an update to date link of the JSON file to download
            //often disabled during testing and should be re-enabled
            createJsonLink( smk );

            ////console.log(getArrayOfJSONLayers( smk ))

            }
        } )

    } )

    return sessionexportTool
} )
