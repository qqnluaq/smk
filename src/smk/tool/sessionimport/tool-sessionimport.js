include.module( 'tool-sessionimport', [ 'tool', 'widgets', 'tool-sessionimport.panel-sessionimport-html' ], function ( inc ) {
    "use strict";

    
    
    
    // used to store data passed in from importing
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
        for (let tool in jsonConfig.tools) {
            ////console.log(jsonConfig.tools[tool])
            if (jsonConfig.tools[tool].type == "layers") {
                
                for ( let item in jsonConfig.tools[tool].display) {
                    
                    if ( jsonConfig.tools[tool].display[item].id == layerId) {
                        

                        return jsonConfig.tools[tool].display[item].isVisible
                    }
                    
                    
                }
            }
        }
    }

    function ifContentExists ( drawing, drawingObj) {
        if (drawingObj.content != null) {
            drawing.bindTooltip(drawingObj.content).openTooltip();
        }

    }


    // return a list of all the layers currently in the map by id
    function getArrayOfJSONLayers( smk ) {
       let arrayOfJSONLayers = []
       for (let layer in SMK.MAP[1].layers){
           arrayOfJSONLayers.push(SMK.MAP[1].layers[layer].id)
       }
        return (arrayOfJSONLayers)
    }
    

    //directly adds a wms layer to map passing the values to SMK.MAP[1] layers and tools, while also passing directly to the leaflet map
    function addWMSLayerToLeafletMap ( wmsLayer ) {
        //console.log(wmsLayer)

        

        let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;
        var wmsMapLayer = L.tileLayer.wms( wmsLayer.serviceUrl ,{ 
            layers: wmsLayer.layerName,
            styles: wmsLayer.styleName,
            format: 'image/png',
            transparent: true
        }).addTo(map);
        //layer should be already correct format
        SMK.MAP[1].layers.push(wmsLayer)
         
         
         let jsonToolLayerInfo = '{  "id": "", "type": "layer", "title": "", "isVisible": true }'
         jsonToolLayerInfo  = JSON.parse(jsonToolLayerInfo)
         jsonToolLayerInfo.id = wmsLayer.id
         jsonToolLayerInfo.title = wmsLayer.title


         for (let tool in SMK.MAP[1].tools) {
             if (SMK.MAP[1].tools[tool].type == "layers" ){
                 SMK.MAP[1].tools[tool].display.push(jsonToolLayerInfo)
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
            
            //creating element that can be 'clicked' and then allowing the user to select a map-config file which is then parsed which causes:
            // tool visibility to be turned on or off, causes zoom and position to shift, and causes lines, circles and polygons to be drawn to the map
            let input = document.createElement('input');
            input.type = 'file';
            input.onchange = e => { 
                let file = e.target.files[0]; 
                let reader = new FileReader();
                reader.readAsText(file,'UTF-8');
                reader.onload = readerEvent => {
                    jsonOfSMKData = readerEvent.target.result; 
                    jsonOfSMKData = JSON.parse(jsonOfSMKData)

                    if ( jsonOfSMKData != null) {

                        // leaflet specific 
                        if (smk.$viewer.type == "leaflet") {

                            // import first needs to check all the layers in the map, and return a list of them, visible or not
                            let arrayOfJSONLayersInMap = getArrayOfJSONLayers( smk )
                            //console.log(arrayOfJSONLayersInMap)

                            for (let maybeNewLayer in jsonOfSMKData.layers) {
                                //console.log("maybe new layer ID is: ", jsonOfSMKData.layers[maybeNewLayer].id)
                                for  (let existingLayer in arrayOfJSONLayersInMap){
                                    //console.log("existing layer ID is: ", arrayOfJSONLayersInMap[existingLayer])
                                    if (jsonOfSMKData.layers[maybeNewLayer].id == arrayOfJSONLayersInMap[existingLayer]) {
                                        //console.log("Match, layer already exists do not add")
                                        break
                                    }
                                    //if there are no matches the layer should be added to the map the same way we would in tool-layerimport
                                    //console.log("current iteration is: ", existingLayer)
                                    //console.log("max number of iterations is: ", (arrayOfJSONLayersInMap.length -1))
                                    if (existingLayer == (arrayOfJSONLayersInMap.length - 1)){
                                        //console.log("Checked every possible match, no match for: ", jsonOfSMKData.layers[maybeNewLayer].id)
                                        //handle the proper layer import here

                                        if ( jsonOfSMKData.layers[maybeNewLayer].type == "wms"){
                                            //console.log("is of type wms proceed accordingly")
                                            addWMSLayerToLeafletMap(jsonOfSMKData.layers[maybeNewLayer])
                                        } 
                                    }
                                }
                            }

                            //handles visibility by looping through layers and setting visibility 
                            for (let layer in jsonOfSMKData.layers) {
                                let visible = getLayerToolVisibility(jsonOfSMKData, jsonOfSMKData.layers[layer].id )
                                smk.$viewer.layerDisplayContext.setItemVisible( jsonOfSMKData.layers[layer].id, visible, false )
                                smk.$viewer.updateLayersVisible()
                            }
                            
                                // setting zoom and center for the map
                                let zoom = jsonOfSMKData.viewer.location.zoom; 
                                let center = jsonOfSMKData.viewer.location.center
                                smk.$viewer.currentBasemap[0]._map.setView(new L.LatLng(center[1], center[0]), zoom);
                                
                                //Here we need to loop through the drawings section looking for circle type layers to draw them to the map (can later handle all types of drawings)
                                //console.log("about to loop through drawings")
                                for (let drawing in jsonOfSMKData.drawings) {
                                    //console.log(jsonOfSMKData.drawings[drawing])
                                    //handling import of circles 
                                    if (jsonOfSMKData.drawings[drawing].type == "circle") {
                                        //console.log(jsonOfSMKData.drawings[drawing].latlng)
                                        //console.log(jsonOfSMKData.drawings[drawing].radius)
                                        let drawingOnMap = L.circle([jsonOfSMKData.drawings[drawing].latlng.lat, jsonOfSMKData.drawings[drawing].latlng.lng], {radius: jsonOfSMKData.drawings[drawing].radius}).addTo(smk.$viewer.currentBasemap[0]._map);
                                        ifContentExists( drawingOnMap, jsonOfSMKData.drawings[drawing]);
                                        //handling import of lines 
                                    } else if (jsonOfSMKData.drawings[drawing].type == "line") {
                                        //console.log(jsonOfSMKData.drawings[drawing].latlngs)
                                        let latlngs = jsonOfSMKData.drawings[drawing].latlngs
                                        let drawingOnMap = L.polyline(latlngs, {color: 'blue'}).addTo(smk.$viewer.currentBasemap[0]._map);
                                        ifContentExists( drawingOnMap, jsonOfSMKData.drawings[drawing]);
                                    //handling import of polygons
                                    } else if (jsonOfSMKData.drawings[drawing].type == "polygon") {
                                        //console.log(jsonOfSMKData.drawings[drawing].latlngs)
                                        let latlngs = jsonOfSMKData.drawings[drawing].latlngs
                                        let drawingOnMap = L.polygon(latlngs, {color: '#3498db'}).addTo(smk.$viewer.currentBasemap[0]._map);
                                        ifContentExists( drawingOnMap, jsonOfSMKData.drawings[drawing]);
                                    //handling import of markers
                                    }  else if (jsonOfSMKData.drawings[drawing].type == "marker") {
                                        //console.log(jsonOfSMKData.drawings[drawing].latlngs)
                                        let latlng = jsonOfSMKData.drawings[drawing].latlng;
                                        let drawingOnMap = L.marker(latlng).addTo(smk.$viewer.currentBasemap[0]._map);
                                        ifContentExists( drawingOnMap, jsonOfSMKData.drawings[drawing]);
                                        }


                                    }  
                                    // handle changing baseMap based on import
                                    
                                    smk.$viewer.setBasemap(jsonOfSMKData.viewer.baseMap)



                                
            


                                    

                                // esri support can be implemented below once available
                            }   else {  console.log("esri import support not yet implemented")  }

                    }
                }
            
            }
            input.click();
        

            }
        } )

    } )

    return sessionimportTool
} )
