include.module( 'tool-sessionexport', [ 'tool', 'widgets', 'tool-sessionexport.panel-sessionexport-html' ], function ( inc ) {
    "use strict";

    
    var jsonDownloadValue = "Normal"
    var mapLayersJSON = null
    var dynamicLink = "Placeholder"
    var jsonOfSMKData = null
    
    

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
          },
          methods: {
            previewFiles() {
              this.files = this.$refs.myFiles.files
              handleFiles (this.files)
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

        var blob = new Blob([JSON.stringify(copyIntoJSONObject( smk ), null, 2)], {type : 'application/json'});
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob)
        a.download = 'data.json';
        a.innerHTML = 'download JSON';
        jsonDownloadValue = a
    }


    // creates a JSON object using the same structure as the eventual format as a map-config file
    function createSMKJSONObject () {

        var smkJSONHolder = {
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
            "_rev": null

            
            }

            return smkJSONHolder

    }

    

    // takes the empty JSON holder and the smk object and fills the smkJSON holder with the useful values of smk to create a JSON file that can be used as a map-config
    // or at least as a similar file
    // should come back and clean this up into a readable for loop going through smk and checking all it's properties against jsonObjectHolder's properties that way

    // has to check state to see if the layers are enabled or disabled as well via checking smk.$viewer.visibleLayer
    function copyIntoJSONObject ( smk ){
        var jsonObjectHolder = createSMKJSONObject()

        if ( jsonObjectHolder.hasOwnProperty("lmfId")  && smk.hasOwnProperty('lmfId')){
            //console.log ("both have a lmfid property")
            jsonObjectHolder.lmfId = smk.lmfId
        }
        if ( jsonObjectHolder.hasOwnProperty("lmfRevision")  && smk.hasOwnProperty('lmfRevision')){
            //console.log ("both have a lmfRevision property")
            jsonObjectHolder.lmfRevision = smk.lmfRevision
        }
        if ( jsonObjectHolder.hasOwnProperty("version")  && smk.hasOwnProperty('version')){
            //console.log ("both have a version property")
            jsonObjectHolder.version = smk.version
        }
        if ( jsonObjectHolder.hasOwnProperty("name")  && smk.hasOwnProperty('name')){
            //console.log ("both have a name property")
            jsonObjectHolder.name = smk.name
        }
        if ( jsonObjectHolder.hasOwnProperty("project")  && smk.hasOwnProperty('project')){
            //console.log ("both have a project property")
            jsonObjectHolder.project = smk.project
        }
        if ( jsonObjectHolder.hasOwnProperty("createdBy")  && smk.hasOwnProperty('createdBy')){
            //console.log ("both have a createdBy property")
            jsonObjectHolder.createdBy = smk.createdBy
        }
        if ( jsonObjectHolder.hasOwnProperty("createdDate")  && smk.hasOwnProperty('createdDate')){
            //console.log ("both have a createdDate property")
            jsonObjectHolder.createdDate = smk.createdDate
        }
        if ( jsonObjectHolder.hasOwnProperty("modifiedBy")  && smk.hasOwnProperty('modifiedBy')){
            //console.log ("both have a modifiedBy property")
            jsonObjectHolder.modifiedBy = smk.modifiedBy
        }
        if ( jsonObjectHolder.hasOwnProperty("modifiedDate")  && smk.hasOwnProperty('modifiedDate')){
            //console.log ("both have a modifiedDate property")
            jsonObjectHolder.modifiedDate = smk.modifiedDate
        }
        if ( jsonObjectHolder.hasOwnProperty("published")  && smk.hasOwnProperty('published')){
            //console.log ("both have a published property")
            jsonObjectHolder.published = smk.published
        }
        if ( jsonObjectHolder.hasOwnProperty("surround")  && smk.hasOwnProperty('surround')){
            //console.log ("both have a surround property")
            jsonObjectHolder.surround = smk.surround
        }
        if ( jsonObjectHolder.hasOwnProperty("viewer")  && smk.hasOwnProperty('viewer')){
            //console.log ("both have a viewer property")
            jsonObjectHolder.viewer = smk.viewer
        }
        if ( jsonObjectHolder.hasOwnProperty("layers")  && smk.hasOwnProperty('layers')){
            //console.log ("both have a layers property")
            jsonObjectHolder.layers = smk.layers
        }
        if ( jsonObjectHolder.hasOwnProperty("tools")  && smk.hasOwnProperty("tools")){
            //console.log ("both have a tools property")
            jsonObjectHolder.tools = smk.tools
        }
        if ( jsonObjectHolder.hasOwnProperty("_id")  && smk.hasOwnProperty('_id')){
            //console.log ("both have a _id property")
            jsonObjectHolder._id = smk._id
        }
        if ( jsonObjectHolder.hasOwnProperty("_rev")  && smk.hasOwnProperty('_rev')){
            //console.log ("both have a _rev property")
            jsonObjectHolder._rev = smk._rev
        }
        // now need to check state and set it appropriately for the various tool displayers
        // first turn everything off
        for (var tool in jsonObjectHolder.tools) {
            //console.log(jsonObjectHolder.tools[y])
            if (jsonObjectHolder.tools[tool].type == "layers") {
                for ( var item in jsonObjectHolder.tools[tool].display) {
                    //console.log(jsonObjectHolder.tools[y].display[x])
                    jsonObjectHolder.tools[tool].display[item].isVisible = false
                }
            }
        }
        // then compare the tools display state to every visible layer, if there is a match then turn on the visibility
        for (var x in smk.$viewer.visibleLayer) {
            for (var y in jsonObjectHolder.tools) {
                if (jsonObjectHolder.tools[y].type == "layers") {
                    for ( var j in jsonObjectHolder.tools[y].display) {
                        if ( x == jsonObjectHolder.tools[y].display[j].id ) {
                            jsonObjectHolder.tools[y].display[j].isVisible = true
                        }

                        
                    }
                }
            }
        }

        // can find co-ordinates and zoom here, but only if it's changed
        if (smk.$viewer.map._animateToCenter){
            //console.log(smk.$viewer.map._animateToCenter)
            jsonObjectHolder.viewer.location.center[0] = smk.$viewer.map._animateToCenter.lng
            jsonObjectHolder.viewer.location.center[1] = smk.$viewer.map._animateToCenter.lat
        }
        
        if (smk.$viewer.map._animateToZoom){
            //console.log(smk.$viewer.map._animateToZoom)
            jsonObjectHolder.viewer.location.zoom = smk.$viewer.map._animateToZoom
        }



        
        return jsonObjectHolder
    }

    //if passed in a config file and a layerID returns the true/false value of it's visibility from tools.display
    function getLayerToolVisibility ( jsonConfig, layerId ) {
        for (var tool in jsonConfig.tools) {
            //console.log(jsonConfig.tools[tool])
            if (jsonConfig.tools[tool].type == "layers") {
                for ( var item in jsonConfig.tools[tool].display) {
                    if ( jsonConfig.tools[tool].display[item] == layerId) {
                        //console.log("Match, setting visibility")
                        //console.log(jsonConfig.tools[tool].display[item])

                        return jsonConfig.tools[tool].display[item].isVisible
                    }
                    
                    
                }
            }
        }
    }


    //Handles the importing of a json file created by smk which eventually populates the  mapLayersJSON variable with the layers
    function handleFiles ( files ) {
        var reader = new FileReader();
        reader.onload = function(event) {
        //console.log('', event.target.result);
        json = event.target.result
        //console.log(JSON.parse(json))
        //console.log(typeof(json))
        var mapLayersJSON = JSON.parse ( json )
        //console.log("imported map layers json are: ")
        //console.log(mapLayersJSON)
        //console.log("type of mapLayersJSON is:")
        //console.log(typeof(mapLayersJSON))
        jsonOfSMKData = mapLayersJSON
        

        };
        var json = reader.readAsText(files[0]);
    }







    SMK.TYPE.sessionexportTool = sessionexportTool

    $.extend( sessionexportTool.prototype, SMK.TYPE.Tool.prototype )
    sessionexportTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    sessionexportTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        smk.on( this.id, {
            'activate': function () {
            
            //This is creating an update to date link of the JSON file to download
            createJsonLink( smk );
            
            console.log ( smk);
            
            // leaflet specific 
           
            
            
         
            
            
           
           //if an import has occured this value will be set, and then the next time this button is pressed
            if ( jsonOfSMKData != null) {
                for (var layer in jsonOfSMKData.layers) {
                    var visible = getLayerToolVisibility(jsonOfSMKData, jsonOfSMKData.layers[layer].id )
                    smk.$viewer.layerDisplayContext.setItemVisible( jsonOfSMKData.layers[layer].id, visible, false )
                    smk.$viewer.updateLayersVisible()
                }
                 // leaflet specific 
                if (smk.$viewer.type == "leaflet") {
                var zoom = jsonOfSMKData.viewer.location.zoom; 
                var center = jsonOfSMKData.viewer.location.center
                console.log(center)
                smk.$viewer.currentBasemap[0]._map.setView(new L.LatLng(center[1], center[0]), zoom);
                } else {
                    console.log("esri import support not yet implemented")
                }

            }


            if ( !self.enabled ) return


            self.active = !self.active

                

            }
        } )

    } )

    return sessionexportTool
} )
