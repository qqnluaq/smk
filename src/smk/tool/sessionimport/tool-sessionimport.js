include.module( 'tool-sessionimport', [ 'tool', 'widgets', 'tool-sessionimport.panel-sessionimport-html' ], function ( inc ) {
    "use strict";

    
    
    
    
    var jsonOfSMKData = null
    
    

    Vue.component( 'sessionimport-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'sessionimport-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-sessionimport.panel-sessionimport-html' ],
        props: [ 'content' ]
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function sessionimportTool( option ) {
        
        this.makePropWidget( 'icon', null ) //'help' )

        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            widgetComponent:'sessionimport-widget',
            panelComponent: 'sessionimport-panel',
            // title:          'sessionimport SMK',
            // position:       'menu'
            content:        null
            
        }, option ) )

    }




    //if passed in a config file and a layerID returns the true/false value of it's visibility from tools.display
    function getLayerToolVisibility ( jsonConfig, layerId ) {
        for (var tool in jsonConfig.tools) {
            //console.log(jsonConfig.tools[tool])
            if (jsonConfig.tools[tool].type == "layers") {
                console.log("found layers")
                for ( var item in jsonConfig.tools[tool].display) {
                    console.log("layer id is: ", layerId)
                    console.log(jsonConfig.tools[tool].display[item])
                    if ( jsonConfig.tools[tool].display[item].id == layerId) {
                        console.log("Match, setting visibility")
                        console.log(jsonConfig.tools[tool].display[item])

                        return jsonConfig.tools[tool].display[item].isVisible
                    }
                    
                    
                }
            }
        }
    }



    SMK.TYPE.sessionimportTool = sessionimportTool

    $.extend( sessionimportTool.prototype, SMK.TYPE.Tool.prototype )
    sessionimportTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    sessionimportTool.prototype.afterInitialize.push( function ( smk ) {
        smk.on( this.id, {
            'activate': function () {
            
            //creating element that can be 'clicked' and then allowing the user to select a map-config file which is then parsed, and the layers are turned on/off and the view is moved
            var input = document.createElement('input');
            input.type = 'file';
            input.onchange = e => { 
            
                var file = e.target.files[0]; 
            
                
                var reader = new FileReader();
                reader.readAsText(file,'UTF-8');
            
                
                reader.onload = readerEvent => {
                    jsonOfSMKData = readerEvent.target.result; 
                    jsonOfSMKData = JSON.parse(jsonOfSMKData)
                    //console.log( jsonOfSMKData );

                    //if an import has occured this value will be set, and then the next time this button is pressed
                    if ( jsonOfSMKData != null) {
                        for (var layer in jsonOfSMKData.layers) {
                            var visible = getLayerToolVisibility(jsonOfSMKData, jsonOfSMKData.layers[layer].id )
                            //console.log("visible is set to", visible)
                            smk.$viewer.layerDisplayContext.setItemVisible( jsonOfSMKData.layers[layer].id, visible, false )
                            smk.$viewer.updateLayersVisible()
                        }
                        // leaflet specific 
                        if (smk.$viewer.type == "leaflet") {
                        var zoom = jsonOfSMKData.viewer.location.zoom; 
                        var center = jsonOfSMKData.viewer.location.center
                        //console.log(center)
                        smk.$viewer.currentBasemap[0]._map.setView(new L.LatLng(center[1], center[0]), zoom);
                        } else {
                            console.log("esri import support not yet implemented")
                        }

                    }
                }
            
            }
            input.click();
        

            }
        } )

    } )

    return sessionimportTool
} )
