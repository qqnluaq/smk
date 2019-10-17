include.module( 'tool-mapimageexport',  [ 'tool', 'widgets', 'tool-mapimageexport.panel-mapimageexport-html', 'proj4' ], function ( inc ) {
    "use strict";

    

    let pressed = false;

    Vue.component( 'mapimageexport-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'mapimageexport-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-mapimageexport.panel-mapimageexport-html' ],
        props: [ 'content' ],
        data: function() {
            return {
                mapimageexportID: "PDF",
                mapTemplate: "MAP_ONLY",
                imageFetching: false,
                downloadLinkAvailable: false,
                downloadLink: null,
                downloadLinkAvailableError: false,
                downloadLinkError: null,
                resolution: [1950, 1080],
                dpi: 300,
            }
          },
        methods: {

        mapimageexport: function  ( event ) {

            this.mapimageexportID = event.srcElement.id;

        },

        mapimageexportOK: async function ( event ){

            this.downloadLinkAvailable = false;
            this.downloadLink = null;
            this.downloadLinkAvailableError = false;
            this.downloadLinkError = null;

            this.imageFetching = true;
            let responseFile = await prepareImageDownload( this.mapimageexportID, this.mapTemplate, this.dpi, this.resolution);
            this.imageFetching = false;

            if (typeof responseFile.error != "undefined"){
                console.log(responseFile);
                this.downloadLinkAvailableError = true;
                this.downloadLinkError = responseFile.error;

            } else {
                console.log(responseFile);
                this.downloadLinkAvailable = true;
                this.downloadLink = responseFile.results[0].value.url;
            }

            
        }

        }
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function mapimageexportTool( option ) {
        
        this.makePropWidget( 'icon', null ) //'help' )

        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            widgetComponent:'mapimageexport-widget',
            panelComponent: 'mapimageexport-panel',
            // title:          'mapimageexport SMK',
            // position:       'menu'
            content:        null
            
        }, option ) )

    }
  

    //this function will return the file for download after assembling the various pieces of the request and then sending it off and getting the file as a response
        // most values are currently hardcoded pending writing of code to collect their values
    async function prepareImageDownload ( fileType, template, dpi, resolution){

        let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;
        let jsonLayersMapRequestFormat
        // get the current map-config by calling util to get the map-config as json

        //calculate the extent // needs calculating
        let extentValues = getCurrentExtent();
        let xmin = extentValues.minX;
        let ymin = extentValues.minY;
        let xmax = extentValues.maxX;
        let ymax = extentValues.maxY;
        let scale = getScale();

        console.log(xmin, ymin, xmax, ymax, scale);

        //get the basemap 
        let baseMapUrl = getCurrentBaseMapUrl()

        let baseMapTitle = "Base Map"
        let baseMapLayers = [];
        baseMapLayers.push( { "url": baseMapUrl});

        


        //retrieves the current visible layers and returns an array of them in the correct format
        jsonLayersMapRequestFormat = getCurrentLayerInfo();
        
        

        // build the 'shell' of the request
        let jsonShell = { "mapOptions": 
        {
            "extent":
            {
                "xmin": xmin,
                "ymin": ymin,
                "xmax": xmax,
                "ymax": ymax
            },
            "scale": scale

        },
        "operationalLayers": [],
        "baseMap": {
            "title": baseMapTitle,
            "baseMapLayers": baseMapLayers
        },
        "exportOptions": {
            "dpi": dpi,
            "outputSize": resolution
        },
        "layoutOptions":
        {
            "titleText": "Super Test",
           "authorText": "Print by: Test",
            "copyrightText": "© Government of British Columbia",
            "scaleBarOptions":
           {
               "metricUnit": "kilometers" ,
               "metricLabel": "km",
               "nonMetricUnit": "miles" ,
               "nonMetricLabel": "mi"
            },
            "legendOptions":
           {
               "operationalLayers":
               [
                   {
                           "id": "FTA_Map_Service_Layer",
                           "subLayerIds": [35]
                   }
               ]
           }
        }
     }

     for (let layer in jsonLayersMapRequestFormat){
        jsonShell.operationalLayers.push(jsonLayersMapRequestFormat[layer])
     }
     

     // now that the shell is completed, a request can be sent
     let responseFile = await sendExportWebMapRequest(jsonShell, fileType, template)

    

     return responseFile
    }


    function getScale(){
        let zoom = Math.round(SMK.MAP[1].$viewer.map.getZoom())
        let scale;
        if (zoom > 1){
            //I've been finding the exact zoom level is usually closer than you would expect
            zoom = zoom - 1;
        }
        switch(zoom) {
            case 1:
                scale=168000000; 
                break;
            case 2:
                scale=87200000;
                break;
            case 3:
                scale=43900000;  
                break;
            case 4:
                scale=22000000;
                break;
            case 5:
                scale=11000000;  
                break;
            case 6:
                scale=5510000;  
                break;
            case 7:
                scale=2750000;  
                break;
            case 8:
                scale=1380000; 
                break;
            case 9:
                scale=688000;  
                break;
            case 10:
                scale=344000;  
                break;
            case 12:
                scale=172000;  
                break;
            case 12:
                scale=86000;  
                break;
            case 13:
                scale=43000;
                break;
            case 14:
                scale=21500; 
                break;
            case 15:
                scale=10800;
                break;
            case 16:
                scale=5380;
                break;
            default:
                scale=250000;      
                      } 
        return scale;
    }   


    function getCurrentExtent(){

        let longlat = "+proj=longlat +datum=WGS84 +no_defs ";
        let albers = ("+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ");

        let bounds = SMK.MAP[1].$viewer.map.getBounds()

        let northEastLatLng = bounds._northEast;
        let southWestLatLng = bounds._southWest;

        let maxXEastLng = northEastLatLng.lng;
        let maxYNorthLat = northEastLatLng.lat;

        let minXWestLng = southWestLatLng.lng;
        let minYSouthLat = southWestLatLng.lat;

    
        
        let convertedAlbersMax = (proj4(longlat, albers,[parseFloat(maxXEastLng), parseFloat(maxYNorthLat)]));
        let convertedAlbersMin = (proj4(longlat, albers,[parseFloat(minXWestLng), parseFloat(minYSouthLat)]));


        console.log(convertedAlbersMax)
        console.log(convertedAlbersMin)
        
        let convertedAlbers = { "maxX": convertedAlbersMax[0], "maxY": convertedAlbersMax[1], "minX": convertedAlbersMin[0], "minY": convertedAlbersMin[1]}

        return convertedAlbers
    }


    function getCurrentBaseMapUrl(){

        let baseMapUrl;

         if ( SMK.MAP[1].$viewer.currentBasemap[0]._url.includes("World_Topo_Map")) {
             baseMapUrl = "https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer"; 
         }
         if ( SMK.MAP[1].$viewer.currentBasemap[0]._url.includes("World_Street_Map")) {
             baseMapUrl = "https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer";
         }
         if ( SMK.MAP[1].$viewer.currentBasemap[0]._url.includes("World_Imagery")) {
             baseMapUrl = "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer";
         }
         if ( SMK.MAP[1].$viewer.currentBasemap[0]._url.includes("World_Ocean_Base")) {
             baseMapUrl = "https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer";
         }
         if ( SMK.MAP[1].$viewer.currentBasemap[0]._url.includes("NatGeo_World_Map")) {
             baseMapUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer";
         }
         if ( SMK.MAP[1].$viewer.currentBasemap[0]._url.includes("World_Dark_Gray_Base")) {
             baseMapUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer";
         }
         if ( SMK.MAP[1].$viewer.currentBasemap[0]._url.includes("World_Light_Gray_Base")) {
             baseMapUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer";
         }
       

        return baseMapUrl

    }

    async function sendExportWebMapRequest(jsonData, fileType, template){
        // get the URL
        let url = "https://delivery.maps.gov.bc.ca/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute";
        let json;
        
        let formData = new FormData();

        formData.append("Web_Map_as_JSON", JSON.stringify(jsonData));
        formData.append("Format", fileType);
        formData.append("Layout_Template", template);
        formData.append("f", "json");

        for (let formDataValue of formData.values()){
            console.log(formDataValue)
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            
            json = await response.json();
    
            
        }
        catch(error) {
            console.error(error);
            json = { "error": error.message};
        } finally {
            return json;
        }

        
    }







    // this function will return all current visible map layers in the format needed by prepare image download as an array
        //for now this will contain hardcoded data to ensure the other functionality works
    function getCurrentLayerInfo(){
        let jsonLayersNewFormat = [];

        // need to generate a web map as a string out of the currently visible map layers
            //each visible layer has a dynamic JSON that needs to be unescaped, and JSON.parse'd
            //each visible layer will need to be added to the shell's operationalLayers array

        //temporary test data
        let mapConfigJSON = SMK.UTIL.copyIntoJSONObject(SMK.MAP[1]);

        let visibleLayers = [];
        let fullVisibleLayerDetails = []
        // need to loop through all the esri-dynamic layers that are set to visible and display them

        //iterate through tools to find all the currently visible layers
        for (let tool in mapConfigJSON.tools){
            if (mapConfigJSON.tools[tool].type == "layers"){
                visibleLayers = recursivelyFindVisibleLayers(mapConfigJSON.tools[tool].display, visibleLayers);
            }
        }


        for (let layer in mapConfigJSON.layers){
            // currently only esri-dynamic layers are being supported but esri support is desired
            if (mapConfigJSON.layers[layer].type == "esri-dynamic" && visibleLayers.includes(mapConfigJSON.layers[layer].id)){
                fullVisibleLayerDetails.push(mapConfigJSON.layers[layer]);
            }

        }


        for (let fullVisibleLayer in fullVisibleLayerDetails){
            let dynamicLayer = fullVisibleLayerDetails[fullVisibleLayer].dynamicLayers[0];
            dynamicLayer = decodeURI(dynamicLayer);
            dynamicLayer = JSON.parse(dynamicLayer);
            console.log(dynamicLayer)
            
            let dataShellJSON = {
                "id": dynamicLayer.id,
                "url": "https://maps.gov.bc.ca/arcgis/rest/services/mpcm/bcgw/MapServer",
                "title": fullVisibleLayerDetails[fullVisibleLayer].title,
                "opacity": fullVisibleLayerDetails[fullVisibleLayer].opacity,
                "visibility": true,
                "minScale": fullVisibleLayerDetails[fullVisibleLayer].minScale,
                "maxScale": fullVisibleLayerDetails[fullVisibleLayer].maxScale,
                "visibleLayers": [],
                "layers":
                [
                    {
                        "id": dynamicLayer.id,
                        "layerDefinition":
                        {
                            "definitionExpression": dynamicLayer.definitionExpression,
                            "drawingInfo": dynamicLayer.drawingInfo,
                            "source": dynamicLayer.source 
                        } 
    
    
                    }
                    
                ]
           };
         
            jsonLayersNewFormat.push(dataShellJSON)

        }
        
        
        return jsonLayersNewFormat
    }


    function recursivelyFindVisibleLayers( toolArray, visibleLayers ){
        for (let  tool in toolArray){
            if (typeof toolArray[tool].items  != "undefined" && toolArray[tool].items.length > 0){
                visibleLayers = recursivelyFindVisibleLayers(toolArray[tool].items, visibleLayers );
            } else if (toolArray[tool].type == "layer" && toolArray[tool].isVisible == true){
                visibleLayers.push(toolArray[tool].id); 
            }
        }
        return visibleLayers;

    }



    SMK.TYPE.mapimageexportTool = mapimageexportTool

    $.extend( mapimageexportTool.prototype, SMK.TYPE.Tool.prototype )
    mapimageexportTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    mapimageexportTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this
        
        smk.on( this.id, {
            'activate': function () {

            if ( !self.enabled ) return
        
            self.active = !self.active

            }
        } )

    } )

    return mapimageexportTool
} )
