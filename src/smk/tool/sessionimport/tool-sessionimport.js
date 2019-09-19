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
            if (jsonConfig.tools[tool].type == "layers") {
                for ( let item in jsonConfig.tools[tool].display) {
                    if ( jsonConfig.tools[tool].display[item].id == layerId) {
                        return jsonConfig.tools[tool].display[item].isVisible;
                    }  
                }
            }
        }
    }

    // return a list of all the layers currently in the map by id
    function getArrayOfJSONLayers( smk ) {
       let arrayOfJSONLayers = []
       for (let layer in SMK.MAP[1].layers){
           arrayOfJSONLayers.push(SMK.MAP[1].layers[layer].id);
       }
        return (arrayOfJSONLayers);
    }
    
    //directly adds a wms layer to map passing the values to SMK.MAP[1] layers and tools, while also passing directly to the leaflet map
    function addWMSLayerToLeafletMap ( wmsLayer ) {

        let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;
        var wmsMapLayer = L.tileLayer.wms( wmsLayer.serviceUrl ,{ 
            layers: wmsLayer.layerName,
            styles: wmsLayer.styleName,
            format: 'image/png',
            transparent: true
        }).addTo(map);
        //layer should be already correct format
        SMK.MAP[1].layers.push(wmsLayer);
         
        let jsonToolLayerInfo = '{  "id": "", "type": "layer", "title": "", "isVisible": true }';
        jsonToolLayerInfo  = JSON.parse(jsonToolLayerInfo);
        jsonToolLayerInfo.id = wmsLayer.id;
        jsonToolLayerInfo.title = wmsLayer.title;

        for (let tool in SMK.MAP[1].tools) {
            if (SMK.MAP[1].tools[tool].type == "layers" ){
                SMK.MAP[1].tools[tool].display.push(jsonToolLayerInfo);
            } 
        }
    }

    //transfer over the existing layers into the incommingJSON so that they're both available for the import process
    function mergeIncommingJSONWithExistingJSON( existingJSON, incommingJSON){

        for (let existingLayer in existingJSON.layers){
            for (let incommingLayer in incommingJSON.layers){
                if (existingJSON.layers[existingLayer].id ==  incommingJSON.layers[incommingLayer].id){
                    // if this matches this layer is already present and does not need to be added to the array
                    break;
                } else if (incommingLayer == incommingJSON.layers.length - 1) {
                    // then we've already checked our existingLayer against all the incomming layers and haven't found a match, in which case we can add our existing layer to the incomming layers
                    incommingJSON.layers.push(existingJSON.layers[existingLayer]);
                }
            }
        }
        return incommingJSON;
    }

    async function importSession( jsonOfSMKData ){

        
        let backupJSONSMKDATA = JSON.parse(JSON.stringify(jsonOfSMKData));

        // import session needs to save all of the maps current // NOT jsonOfSMKData // elsewhere so it can be retrieved after the rebuild smkData functionality
        let mapConfigJSON = SMK.UTIL.copyIntoJSONObject(SMK.MAP[1]);
        
        mapConfigJSON = JSON.parse(JSON.stringify(mapConfigJSON));
        
        // may be worth merging the layers and tools from the current data aka mapConfigJSON and the imported data aka jsonOfSMKData into one file that way the current data is always passed forwards
        
        jsonOfSMKData = mergeIncommingJSONWithExistingJSON(mapConfigJSON, jsonOfSMKData);

        // then call the rebuild SMKMAP function which will turn on all the geojson from the import
        // normally this function is called with current smk data
        await SMK.UTIL.rebuildSMKMAP( jsonOfSMKData );

         // then once the map is rebuilt with the import drawings added to it, we want to retrieve out stored geojson and add that to the map also:
        SMK.UTIL.checkDrawings(mapConfigJSON);



        // leaflet specific 
        if (SMK.MAP[1].$viewer.type == "leaflet") {


           
            let zoom = backupJSONSMKDATA.viewer.location.zoom; 
            let center = backupJSONSMKDATA.viewer.location.center;
            SMK.MAP[1].$viewer.currentBasemap[0]._map.setView(new L.LatLng(center[1], center[0]), zoom);


            
            
            

            //Layer visibility checking is currently disabled as it should be handled by the reload based on the document passed in
            /*
            // import first needs to check all the layers in the map, and return a list of them, visible or not
            let arrayOfJSONLayersInMap = getArrayOfJSONLayers( SMK.MAP[1] );
            for (let maybeNewLayer in jsonOfSMKData.layers) {
                for  (let existingLayer in arrayOfJSONLayersInMap){
                    if (jsonOfSMKData.layers[maybeNewLayer].id == arrayOfJSONLayersInMap[existingLayer]) {
                        break
                    }
                    //if there are no matches the layer should be added to the map the same way we would in tool-layerimport
                    if (existingLayer == (arrayOfJSONLayersInMap.length - 1)){
                        //handle the proper layer import here
                        if ( jsonOfSMKData.layers[maybeNewLayer].type == "wms"){
                            addWMSLayerToLeafletMap(jsonOfSMKData.layers[maybeNewLayer]);
                        } 
                    }
                }
            }
            //handles visibility by looping through layers and setting visibility 
            for (let layer in jsonOfSMKData.layers) {
                let visible = getLayerToolVisibility(jsonOfSMKData, jsonOfSMKData.layers[layer].id );
                SMK.MAP[1].$viewer.layerDisplayContext.setItemVisible( jsonOfSMKData.layers[layer].id, visible, false );
                SMK.MAP[1].$viewer.updateLayersVisible();
            }
            */

                // setting zoom and center for the map


                //Basemap functionality also turned off as that should be handled by import
                /*
                // handle changing baseMap based on import
                SMK.MAP[1].$viewer.setBasemap(jsonOfSMKData.viewer.baseMap);
                // esri support can be implemented below once available
                */

            }   else {  console.log("esri import support not yet implemented")  }

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
                    jsonOfSMKData = JSON.parse(jsonOfSMKData);

                    if ( jsonOfSMKData != null) {
                        importSession( jsonOfSMKData );


                    }
                }
            
            }
            input.click();
        

            }
        } )

    } )

    return sessionimportTool
} )
