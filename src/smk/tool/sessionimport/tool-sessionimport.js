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
                        

                        return jsonConfig.tools[tool].display[item].isVisible;
                    }
                    
                    
                }
            }
        }
    }

    function ifContentExists ( drawing, drawingObj) {
        if (drawingObj.content != null) {
            drawing.bindTooltip(drawingObj.content, {
                permanent: true
            }).openTooltip();
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
        //console.log(wmsLayer)

        

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

    function importLeafletDrawings( smk, drawing ) {
        let drawingOnMap;
        let latlng;
        let latlngs = []
        switch( drawing.properties.name ){
            case "circle":
                latlng = L.GeoJSON.coordsToLatLng(drawing.geometry.coordinates);
                drawingOnMap = L.circle(latlng, {radius: drawing.properties.radius}).addTo(smk.$viewer.currentBasemap[0]._map);
                ifContentExists( drawingOnMap, drawing.properties);
                break;
            case "line":
                for (let coord in drawing.geometry.coordinates){
                    latlng = L.GeoJSON.coordsToLatLng(drawing.geometry.coordinates[coord]);
                    latlngs.push(latlng);
                }
                drawingOnMap = L.polyline(latlngs, {color: 'blue'}).addTo(smk.$viewer.currentBasemap[0]._map);
                ifContentExists( drawingOnMap, drawing.properties);
                break;
            case "polygon":
                for (let coord in drawing.geometry.coordinates){
                    latlng = L.GeoJSON.coordsToLatLng(drawing.geometry.coordinates[coord]);
                    latlngs.push(latlng);
                }
                drawingOnMap = L.polygon(latlngs, {color: 'blue'}).addTo(smk.$viewer.currentBasemap[0]._map);
                ifContentExists( drawingOnMap, drawing.properties);
                break;
            case "marker":
                latlng = L.GeoJSON.coordsToLatLng(drawing.geometry.coordinates);
                drawingOnMap = L.marker(latlng).addTo(smk.$viewer.currentBasemap[0]._map);
                ifContentExists( drawingOnMap, drawing.properties);
                break;
            default:
                console.log("Not a leaflet drawing")
        }
    }

    function isSimpleLeafletDrawing( drawing ){
        let match = false;
        if (typeof drawing.properties != "undefined") {
            let drawingType = drawing.properties.name;
            if ( drawingType == "marker" || drawingType == "line" || drawingType == "circle" || drawingType == "polygon"){
                match = true;
            }
        }
        return match;
    }


    function isStyledGeoJSON( geoJSON ){
        let match = false;
        if (geoJSON.type == "Feature" || geoJSON.type == "FeatureCollection"){
            match = true;
        }

        return match;

    }

    function importStyledGeoJSON ( geoJSON ){
        let color;
        let stroke;
        let fill;
        let opacity;
        let strokeWidth;
        let lineCap;
        let lineJoin;
        let dashArray;
        let dashOffset;
        let fillColor;
        let fillOpacity;
        let fillRule;

        if ( geoJSON.type != "FeatureCollection") {
            color = geoJSON.properties.style.color;
            stroke = geoJSON.properties.style.stroke;
            fill = geoJSON.properties.style.fill;
            opacity = geoJSON.properties.style.opacity;
            strokeWidth = geoJSON.properties.style.strokeWidth;
            lineCap = geoJSON.properties.style.lineCap;
            lineJoin = geoJSON.properties.style.lineJoin;
            dashArray = geoJSON.properties.style.dashArray;
            dashOffset = geoJSON.properties.style.dashOffset;
            fillColor = geoJSON.properties.style.fillColor;
            fillOpacity = geoJSON.properties.style.fillOpacity;
            fillRule = geoJSON.properties.style.fillRule;
        } else {
            // check if the first element in the feature collection is a geometry collection, if so we need to go inside the geometry collection to check it's sub geometries for their style elements
            if ( typeof geoJSON.features[0].geometry.type != "undefined" && geoJSON.features[0].geometry.type == "GeometryCollection"){
                for (let geometry in geoJSON.features[0].geometry.geometries){
                    if (typeof geoJSON.features[0].geometry.geometries[geometry].properties != "undefined" && typeof geoJSON.features[0].geometry.geometries[geometry].properties.style != "undefined" ){
                        color = geoJSON.features[0].geometry.geometries[geometry].properties.style.color;
                        stroke = geoJSON.features[0].geometry.geometries[geometry].properties.style.stroke;
                        fill = geoJSON.features[0].geometry.geometries[geometry].properties.style.fill;
                        opacity = geoJSON.features[0].geometry.geometries[geometry].properties.style.opacity;
                        strokeWidth = geoJSON.features[0].geometry.geometries[geometry].properties.style.strokeWidth;
                        lineCap = geoJSON.features[0].geometry.geometries[geometry].properties.style.lineCap;
                        lineJoin = geoJSON.features[0].geometry.geometries[geometry].properties.style.lineJoin;
                        dashArray = geoJSON.features[0].geometry.geometries[geometry].properties.style.dashArray;
                        dashOffset = geoJSON.features[0].geometry.geometries[geometry].properties.style.dashOffset;
                        fillColor = geoJSON.features[0].geometry.geometries[geometry].properties.style.fillColor;
                        fillOpacity = geoJSON.features[0].geometry.geometries[geometry].properties.style.fillOpacity;
                        fillRule = geoJSON.features[0].geometry.geometries[geometry].properties.style.fillRule;
                        break;
                    }
                }
            } else {
                // just taking feature zero because all non-Geo Collection features in a collection are styled the same, if a change is requested to allow specfic feature styling this can be changed
                color = geoJSON.features[0].properties.style.color;
                stroke = geoJSON.features[0].properties.style.stroke;
                fill = geoJSON.features[0].properties.style.fill;
                opacity = geoJSON.features[0].properties.style.opacity;
                strokeWidth = geoJSON.features[0].properties.style.strokeWidth;
                lineCap = geoJSON.features[0].properties.style.lineCap;
                lineJoin = geoJSON.features[0].properties.style.lineJoin;
                dashArray = geoJSON.features[0].properties.style.dashArray;
                dashOffset = geoJSON.features[0].properties.style.dashOffset;
                fillColor = geoJSON.features[0].properties.style.fillColor;
                fillOpacity = geoJSON.features[0].properties.style.fillOpacity;
                fillRule = geoJSON.features[0].properties.style.fillRule;
            } 
        }
        geoJSON = JSON.stringify(geoJSON);
        SMK.UTIL.addGeoJSONFileToMap( geoJSON, color, stroke, fill, opacity, strokeWidth, lineCap, lineJoin, dashArray, dashOffset, fillColor, fillOpacity, fillRule );
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

                        // leaflet specific 
                        if (smk.$viewer.type == "leaflet") {
                            // import first needs to check all the layers in the map, and return a list of them, visible or not
                            let arrayOfJSONLayersInMap = getArrayOfJSONLayers( smk );
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
                                smk.$viewer.layerDisplayContext.setItemVisible( jsonOfSMKData.layers[layer].id, visible, false );
                                smk.$viewer.updateLayersVisible();
                            }
                                // setting zoom and center for the map
                                let zoom = jsonOfSMKData.viewer.location.zoom; 
                                let center = jsonOfSMKData.viewer.location.center;
                                smk.$viewer.currentBasemap[0]._map.setView(new L.LatLng(center[1], center[0]), zoom);
                                //Here we need to loop through the drawings section looking for circle type layers to draw them to the map (can later handle all types of drawings)
                                for (let drawing in jsonOfSMKData.drawings) {
                                    //first check if it's one of the simple leaflet drawing types (all lowercase names: marker, polygon, line, circle)
                                    if ( isSimpleLeafletDrawing(jsonOfSMKData.drawings[drawing])){
                                        importLeafletDrawings(smk, jsonOfSMKData.drawings[drawing]);
                                    } else if ( isStyledGeoJSON( jsonOfSMKData.drawings[drawing]) ){
                                        importStyledGeoJSON(jsonOfSMKData.drawings[drawing]);
                                    }
                                    

                                    
                                    
                                    
                                }  
                                // handle changing baseMap based on import
                                smk.$viewer.setBasemap(jsonOfSMKData.viewer.baseMap);
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
