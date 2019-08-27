include.module( 'tool-print', [ 'tool', 'widgets', 'tool-print.panel-print-html' ], function ( inc ) {
    "use strict";

    
    var jsonDownloadValue = "Normal"
    var mapLayersJSON = null
    var dynamicLink = "DynamicLinkGoesHere"
    
    
    

    Vue.component( 'print-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'print-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-print.panel-print-html' ],
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
    function PrintTool( option ) {
        
        this.makePropWidget( 'icon', null ) //'help' )

        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            widgetComponent:'print-widget',
            panelComponent: 'print-panel',
            // title:          'Print SMK',
            // position:       'menu'
            content:        null
            
        }, option ) )

    }


    // Gets JSON Layer information from smk and then assigns that to an object which can be downloaded
    //Going to build an entire JSON object structured after map-config.json
    //first need to build the map-config.json equivalent object, then can start copying data into it, then it can be provided as a
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

        return jsonObjectHolder
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
        console.log(mapLayersJSON)
        //console.log("type of mapLayersJSON is:")
        //console.log(typeof(mapLayersJSON))

        };
        var json = reader.readAsText(files[0]);
    }







    SMK.TYPE.PrintTool = PrintTool

    $.extend( PrintTool.prototype, SMK.TYPE.Tool.prototype )
    PrintTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    PrintTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this

        smk.on( this.id, {
            'activate': function () {

            //console.log(smk)
            createJsonLink( smk )
            
            copyIntoJSONObject(smk)
            

            console.log( smk )
            console.log ("smk.layers are:")
            console.log (smk.layers)
            
           

            if ( !self.enabled ) return


            self.active = !self.active

                

            }
        } )

    } )

    return PrintTool
} )
