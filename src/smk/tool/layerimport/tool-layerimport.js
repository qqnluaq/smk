include.module( 'tool-layerimport', [ 'tool', 'widgets', 'tool-layerimport.panel-layerimport-html', 'togeojson' ], function ( inc ) {
    "use strict";

    // global variable for keeping track of how often multiPointCollections have activatied
    var multiPointCollectionCounter = 0;

    Vue.component( 'layerimport-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'layerimport-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-layerimport.panel-layerimport-html' ],
        props: [ 'content' ],
        data: function() {
            return {
                items: '',
                service: '',
                WMSURL: 'https://openmaps.gov.bc.ca/geo/pub/ows',
                //WMSURL: 'https://openmaps.gov.bc.ca/geo/pub/REG_LEGAL_AND_ADMIN_BOUNDARIES.QSOI_BC_REGIONS/ows?service=WMS&request=GetCapabilities',
                //ESRIURL: 'https://apps.gov.bc.ca/pub/mpcm/services/catalog/PROD/',
                ESRIURL: 'http://localhost:8080/smks-api/LayerLibrary/test/test/',
                //ESRIURL: 'http://localhost:8080/smks-api/LayerLibrary/',
                //ESRIURL: 'http://vivid-w130a.vividsolutions.com:8080/smks-api/LayerLibrary/test/test/',
                KMLURL: 'https://openmaps.gov.bc.ca/kml/geo/layers/WHSE_IMAGERY_AND_BASE_MAPS.AIMG_HIST_INDEX_MAPS_POINT_loader.kml',
                
                checkedLayersArcGIS: [],
                checkedLayersWMS: [],

                layerLoading: false,
                arcGISFetched: false,
                wmsFetched: false,
                loading: false,
                featureListShow: false,
                layerListShow: false,
                esriLayerListShow: false,


                jsonFeatures: null,
                styleName: null,
                //current file number being transfered:
                transferFileNumber: null,

                //default menu item displayed
                selected: 'arcGIS',

                //default geoJSON values
                color: '#0066ff',
                stroke: true,
                strokeWidth: 3,
                opacity: 0.65,
                lineCap: 'round',
                lineJoin: 'bevel',
                dashArray: null,
                dashOffset: null,
                fill: true,
                fillColor: '#0066ff',
                fillOpacity: 0.2,
                fillRule: 'evenodd',
                geoJSONfileValue: null,
                geoJSONFileUploadSuccess: false
                
            }
          },
          methods: {


            //this function handles the higher tier checkboxes which are not layer to be added directly, but have subcheckboxes to check on or off
            // this function will only attempt to check the checkboxes one layer lower than them, any of those will then call the checkboxes below them with checkmidtier
            onCheckTopLevelCheckBoxes: function ( event ) {
                let checked  = event.srcElement.checked;
                
                //first go up to the details element as the parent element
                let parentElementDetails = event.srcElement.parentElement.parentElement;
                console.log("onCheckCheckBoxes");
                // then iterate through all the child elements that are lists with class smk-folder
                
                for (let listItem in parentElementDetails.childNodes){
                    if(!isNaN(listItem)){
                        if (parentElementDetails.childNodes[listItem].className == "smk-folder"){
                            
                            let detailsElement = parentElementDetails.childNodes[listItem].childNodes[0];

                            let summaryElement = detailsElement.childNodes[0];

                            let inputElement = summaryElement.childNodes[0];

                            if (inputElement.checked ==  checked ){
                                //box is already set correctly, no click
                            } else {
                                inputElement.click();
                            }       
                        }
                    }
                }
            },



             //this function handles the mid tier checks
            onCheckMidLevelCheckBoxes: function ( event ) {
                let checked  = event.srcElement.checked;
                
                //first go up to the details element as the parent element
                let parentElementDetails = event.srcElement.parentElement.parentElement;
                console.log("onCheckCheckBoxes");
                // then iterate through all the child elements that are lists with class smk-folder
                

                for (let listItem in parentElementDetails.childNodes){
                    if(!isNaN(listItem)){
                        if (parentElementDetails.childNodes[listItem].className == "smk-folder"){
                            
                            let divElement = parentElementDetails.childNodes[listItem].childNodes[0];

                            let inputElement = divElement.childNodes[0];

                            if (inputElement.checked ==  checked ){
                                //box is already set correctly, no click
                            } else {
                                inputElement.click();
                            }  
                        }
                    }
                }
            },

            // this function adds the mpcm Layer ID to the checkedArcGISLayers array 
            onCheckAddIDTocheckedArcGISLayers: function( event ) {
                let mpcmId  = event.srcElement.id;

                // if we're hitting a checkbox and the item is already in the array, then we're removing it from the array because we've become unchecked
                if (this.checkedLayersArcGIS.includes(mpcmId)){
                    for ( let id in this.checkedLayersArcGIS){
                        if ( this.checkedLayersArcGIS[id] == mpcmId ){

                            this.checkedLayersArcGIS = this.checkedLayersArcGIS.filter(item => item !== mpcmId);

                            break;
                        }
                    }
                } else {
                    // otherwise this must be a check and we're adding this element to the array
                    this.checkedLayersArcGIS.push(mpcmId);
                }

                
                console.log("onCheckAddIDTocheckedArcGISLayers");
            },
        

            // this function adds the mpcm Layer ID to the checkedArcGISLayers array 
            onCheckAddTocheckedWMSLayers: function( event ) {
                // need to get all the values that setLayerImport will later need to add the layer correctly
                let isObjectPresent = false;
                //once they're all collected in a nice json object that object can be assigned to the checkedLayersWMS array

                console.log("The id is: ",event.srcElement.id);
                console.log("The style name is: ",event.srcElement.attributes.item(2).nodeValue);
                console.log("The style title is: ",event.srcElement.attributes.item(3).nodeValue);
                console.log("The full object is: ",event.srcElement.attributes.item(4).nodeValue);

                
                let layerName = event.srcElement.id;
                let styleName = event.srcElement.attributes.item(2).nodeValue;
                let styleTitle = event.srcElement.attributes.item(3).nodeValue;
                let layerObject = event.srcElement.attributes.item(4).nodeValue;
                layerObject = JSON.parse(layerObject);


                // if item is already present it needs to be removed because this only triggers on a new checkbox
                if (this.checkedLayersWMS.length > 0){
                    for ( let jsonObject in this.checkedLayersWMS){
                        if(this.checkedLayersWMS[jsonObject].styleName == styleName){
                            isObjectPresent = true;
                            this.checkedLayersWMS = this.checkedLayersWMS.filter(item => item.styleName !== styleName);
                            break;
                        }
                    }
                }
                
                if (!isObjectPresent){
                    let jsonLayerObject = '{ "layerName": "", "styleName": "", "styleTitle": "", "layerObject": "" }'
                    jsonLayerObject = JSON.parse(jsonLayerObject);

                    jsonLayerObject.layerName = layerName;
                    jsonLayerObject.styleName = styleName;
                    jsonLayerObject.styleTitle = styleTitle;
                    jsonLayerObject.layerObject = layerObject

                    // otherwise this must be a check and we're adding this element to the array
                    this.checkedLayersWMS.push(jsonLayerObject);
                }
            },

            //imports a layer to the leaflet map directly and then updates the layers via rebuild map
            setLayerImport: async function  () {
                
                this.layerLoading = true;
                
                //This is what will need to be looped through to add the the multiple layers to the map/////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                // it will need to be adjusted to get these(layerName, styleName, layerObject) values from the checkedLayersWMS array instead of the event values


                for (let jsonLayerInfoFromCheck in this.checkedLayersWMS){

                    //used to inform users of progress
                    this.transferFileNumber = jsonLayerInfoFromCheck;

                    let layerName = this.checkedLayersWMS[jsonLayerInfoFromCheck].layerName;
                    let styleName = this.checkedLayersWMS[jsonLayerInfoFromCheck].styleName
                    let layerObject = this.checkedLayersWMS[jsonLayerInfoFromCheck].layerObject
                    
    
                    


                                   
                    let url = this.service;
                    const json = await asyncGetFeaturesFromWMS( layerName, url);
                    console.log("The json feature list is: ");
                    console.log(json);
                    this.jsonFeatures = json.features;

                    this.styleName = styleName;
                    this.layerName = layerName;
                    
                    //directly adds a layer to the map, should no longer be needed
                    /*
                    let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;
                    var wmsLayer = L.tileLayer.wms( this.service ,{ 
                        layers: this.layerName,
                        styles: this.styleName,
                        format: 'image/png',
                        transparent: true
                    }).addTo(map); 
                    */
                    
                    
                    // The below does add the information to smk

                    //creating the json layer info in the same style as map-config.json
                    let jsonLayerInfo = '{  "type": null, "id": null, "title": null, "isVisible": true, "attribution": "", "metadataUrl": "", "opacity": 0.65,  "isQueryable": true, "attributes": [], "serviceUrl":null, "layerName": null, "styleName": null }';

                    let title = layerObject.layerTitle;
                    let id = layerName + "-" + styleName;

                    
                    jsonLayerInfo = JSON.parse(jsonLayerInfo);
                    jsonLayerInfo.type = "wms";
                    jsonLayerInfo.id = id;
                    jsonLayerInfo.title = title;
                    jsonLayerInfo.serviceUrl = this.service;
                    jsonLayerInfo.layerName = layerName;
                    jsonLayerInfo.styleName = styleName;

                    // creating the json attribute information in the same style as map-config.json
                    for (let propertyID in this.jsonFeatures[0].properties) {
                        // creating the json attribute information in the same style as map-config.json
                        let jsonAttribute = '{"id": null,"name": null,"title": null,"visible": true}';
                        jsonAttribute = JSON.parse(jsonAttribute);

                        jsonAttribute.id = propertyID;
                        jsonAttribute.name = propertyID;
                        
                        let attributeTitle = propertyID;
                        attributeTitle = attributeTitle.replace(/_/g, " ");
                        jsonAttribute.title = attributeTitle

                        jsonLayerInfo.attributes.push(jsonAttribute);
                    }
                    
                    console.log("json layer info is: ", jsonLayerInfo);
                    SMK.MAP[1].layers.push(jsonLayerInfo);
                    
                    // creating the json  tool information in the same style as map-config.json
                    let jsonToolLayerInfo = '{  "id": "", "type": "layer", "title": "", "isVisible": true }';
                    jsonToolLayerInfo  = JSON.parse(jsonToolLayerInfo);
                    jsonToolLayerInfo.id = id;
                    jsonToolLayerInfo.title = title;
                    // if too many layers are visible at once things tend to slow down, so if there are more than four they're defaulted not visible
                    if (this.checkedLayersWMS.length > 4){
                        jsonToolLayerInfo.isVisible = false;
                    }


                    for (let tool in SMK.MAP[1].tools) {
                        if (SMK.MAP[1].tools[tool].type == "layers" ){
                            SMK.MAP[1].tools[tool].display.push(jsonToolLayerInfo);
                        }
                    }
                }

                this.layerLoading = false;
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                //Now that the layer is properly in the system, we should go ahead and export all our data and rebuild with it
                SMK.UTIL.rebuidMapWithSessionExportJSONObject( SMK.MAP[1] );


            },

            //in theory this adds the selected feature to the map (Not functional)
            setFeatureImport: function  ( event ) {
                console.log("The event is: ",event);
                console.log("The id is: ", JSON.stringify(event.srcElement.id));
        
            },


            // this handles a WMS URL being passed in and returns all the layers(And their styles) found at that URL
            // currently slicing to ensure the request does a get capabilities no matter what
            // should leave the link alone and let getLayersFromWMS to do all the link parsing and determine what to return
            fetchLayersFromURL: async function ( event ) {

                if ( this.selected == 'wms') {
                    //console.log ("The url is", event.srcElement.id)
                    this.service = event.srcElement.id;
                    this.wmsFetched = false;
                    this.layerLoading = false;
                    this.arcGISFetched = false;
                    this.wmsFetched = false;
                    this.loading = false;
                    this.featureListShow = false;
                    this.layerListShow = false;
                    this.esriLayerListShow = false;
                    this.checkedLayersArcGIS = [];
                    this.checkedLayersWMS = [];


                    
                    //currently this is stripping out everything after the ? if it exists to insist on doing a get capabilities request
                    if (this.service.includes("?")) {
                    this.service = this.service.slice(0, (this.service.indexOf("?"))) ;
                    //console.log("The url post slice is: ", this.service)
                    }
                    this.service = this.service.trim() + "?service=WMS&request=GetCapabilities";
                    //console.log("after trim and concat is: ", this.service)
                    
                    // retrieving all the layers and their styles
                    this.loading = true;
                    let wmsANDLayerArr = await asyncGetLayersFromWMS ( this.service );
                    
                    this.loading = false;
                    this.wmsFetched = true;
                    this.service = wmsANDLayerArr[0];
                    this.items = wmsANDLayerArr[1];
                    this.layerListShow = true;
                }
                if (this.selected == 'arcGIS') {
                    this.wmsFetched = false;
                    this.layerLoading = false;
                    this.arcGISFetched = false;
                    this.wmsFetched = false;
                    this.loading = false;
                    this.featureListShow = false;
                    this.layerListShow = false;
                    this.esriLayerListShow = false;
                    this.checkedLayersArcGIS = [];
                    this.checkedLayersWMS = [];

                    //currently hardcoding to only use this service, in the future will allow for other services to be selected earlier on
                    this.service = "https://maps.gov.bc.ca/arcgis/rest/services/mpcm/bcgw/MapServer";

                    this.loading = true;
                    // waits while fetching all the information from the service and URL, could take some time for that to render
                    let jsonArrayOfDyanmicLayerIDNames = await asyncGetLayersFromEsriDynamic( this.service, this.ESRIURL );
                    this.loading = false;
                    this.arcGISFetched = true;

                    this.items = jsonArrayOfDyanmicLayerIDNames;
                    this.esriLayerListShow = true;
                    
                }
                if (this.selected == 'KML'){
                    this.wmsFetched = false;
                    this.layerLoading = false;
                    this.arcGISFetched = false;
                    this.wmsFetched = false;
                    this.loading = false;
                    this.featureListShow = false;
                    this.layerListShow = false;
                    this.esriLayerListShow = false;
                    await asyncAddKMLLayerToMap( this.KMLURL);
                }
            },

            // this function is going to add a dynamic layer to the map after fetching the relevant information
            
            fetchEsriLayerInfo: async function ( event ) {
                
                let lotsOfLayers = false;
                
                this.layerLoading = true;
                if (this.checkedLayersArcGIS.length > 5){
                    console.log("Due to importing more than five layers at a time they're being started turned off for stability.");
                    lotsOfLayers = true;
                }

                for (let id in this.checkedLayersArcGIS) {
                    console.log("Id is: ", id , " and we're going to call the data fetch from here to retrieve it");
                    
                    this.transferFileNumber = id;

                    let esriLayerXML = await asyncGetEsriLayerData( this.ESRIURL, this.checkedLayersArcGIS[id]);
                    
                    console.log("esri layer XML in detail is: ", esriLayerXML);


                    /// actually all I need to do is build the dynamic object the way it is in map-config.json, and then since we're passing it in we don't even need
                    // to actually add it to the map, just assign the information to smk in a way that it can be exported later

                    addEsriLayerToSMK( esriLayerXML, lotsOfLayers );

                    

                }
                
                this.layerLoading = false;
                //Now that the layer is properly in the system, we should go ahead and export all our data and rebuild with it
                SMK.UTIL.rebuidMapWithSessionExportJSONObject( SMK.MAP[1] );
            },


            importGeoJSON: function (event) {
                console.log("The file list object is: ", event.target.files);
                for (let file in event.target.files) {
                    //making sure it has a type to make sure it's a file object
                    if (event.target.files[file].type) {
                        console.log("The file is: ", event.target.files[file]);
                        let reader = new FileReader();
                        reader.onload = e => {
                            // we have the GeoJSON here so we're going to add it to the map
                            console.log("The reader onload result is: ", e.target.result);
                            this.geoJSONFileUploadSuccess = SMK.UTIL.addGeoJSONFileToMap( e.target.result, this.color, this.stroke, this.fill, this.opacity, this.strokeWidth, this.lineCap, this.lineJoin, 
                                this.dashArray, this.dashOffset, this.fillColor, this.fillOpacity, this.fillRule );

                            event.target.value = null;
                            
                            
                        };
                        this.geoJSONfileValue = event.target.files[file].name
                        reader.readAsText(event.target.files[file]);
                }
                }
            }
          }
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function layerimportTool( option ) {
        
        this.makePropWidget( 'icon', null ) //'help' )

        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            widgetComponent:'layerimport-widget',
            panelComponent: 'layerimport-panel',
            // title:          'layerimport SMK',
            // position:       'menu'
            content:        null
            
        }, option ) )

    }

    function getEsriLayerFromXML (esriXML){
        let jsonLayerInfo = '{  "type": "esri-dynamic", "id": null, "title": null, "isVisible": true, "attribution": "Copyright 2019 DataBC, Government of British Columbia", "metadataUrl": "", "opacity": 0.65,  "minScale": "", "maxScale": "", "isQueryable": true, "attributes": [], "mpcmId": "", "mpcmWorkspace": "", "serviceUrl": "https://maps.gov.bc.ca/arcgis/rest/services/mpcm/bcgw/MapServer", "dynamicLayers": [] }';

        jsonLayerInfo = JSON.parse(jsonLayerInfo);
        
        
        for (let childNode in esriXML.childNodes[0].childNodes ) {
            switch(esriXML.childNodes[0].childNodes[childNode].nodeName) {
                case "layerId":
                    jsonLayerInfo.mpcmId = esriXML.childNodes[0].childNodes[childNode].firstChild.textContent;
                    break;
                case "layerDisplayName":
                    jsonLayerInfo.title = esriXML.childNodes[0].childNodes[childNode].firstChild.textContent;
                    jsonLayerInfo.id = esriXML.childNodes[0].childNodes[childNode].firstChild.textContent;
                    break;
                case "maxScale":
                    jsonLayerInfo.maxScale = esriXML.childNodes[0].childNodes[childNode].firstChild.textContent;
                    break;
                case "minScale":
                    jsonLayerInfo.minScale = esriXML.childNodes[0].childNodes[childNode].firstChild.textContent;
                    break;
                case "workspaceName":
                    jsonLayerInfo.mpcmWorkspace = esriXML.childNodes[0].childNodes[childNode].firstChild.textContent;
                    break;
                case "dynamicJson":
                    let dynamicJSON = esriXML.childNodes[0].childNodes[childNode].firstChild.textContent;
                    // sometimes the json being recieved is not correctly formed, in that case it's dynamic content is skipped
                    // this should be considered a temporary fix as relevant data is being lost
                    try{
                        dynamicJSON = JSON.parse(dynamicJSON);  
                        dynamicJSON = JSON.stringify(dynamicJSON);
                        jsonLayerInfo.dynamicLayers.push(dynamicJSON);
                    } catch (error){
                        console.error(error);
                    }
                    break;
                case "properties":
                    for (let propertyNodes in esriXML.childNodes[0].childNodes[childNode].childNodes){
                        if ( propertyNodes == "0" || propertyNodes == "1" || propertyNodes == "2"){
                            let elementKey = esriXML.childNodes[0].childNodes[childNode].childNodes[propertyNodes].getElementsByTagName("key");
                            if (elementKey[0].childNodes[0].textContent == "metadata.url"){
                                let elementValue = esriXML.childNodes[0].childNodes[childNode].childNodes[propertyNodes].getElementsByTagName("value")
                                jsonLayerInfo.metadataUrl = elementValue[0].childNodes[0].textContent;
                            }  
                        }
                    }
                    break;
                case "fields":
                    ///aka attributes
                    console.log("Still need to do field handling")
                    // need to loop over each attribute folder
                    for (let fieldNodes in esriXML.childNodes[0].childNodes[childNode].childNodes){
                        if(!isNaN(fieldNodes)){
                            let fieldNameNode = esriXML.childNodes[0].childNodes[childNode].childNodes[fieldNodes].getElementsByTagName("fieldName");
                            let fieldAliasNode = esriXML.childNodes[0].childNodes[childNode].childNodes[fieldNodes].getElementsByTagName("fieldAlias");

                            let fieldName = fieldNameNode[0].childNodes[0].textContent;
                            let fieldAlias = fieldAliasNode[0].childNodes[0].textContent;

                            //create the individual attribute
                            let jsonAttribute = '{"id": null,"name": null,"title": null,"visible": true}';
                            jsonAttribute = JSON.parse(jsonAttribute);

                            jsonAttribute.id = fieldName;
                            jsonAttribute.name = fieldName;
                            jsonAttribute.title  = fieldAlias
                            
                            jsonLayerInfo.attributes.push(jsonAttribute);

                        }
                        
                    }
                    break;
                default:
                 
                 }    
        }
        

        return jsonLayerInfo;
    }

    function addEsriLayerToSMK ( esriXML, tooManyLayers ){
        //creating the json layer info in the same style as map-config.json
        let jsonLayerInfo = getEsriLayerFromXML( esriXML );

        console.log("json layer info is: ", jsonLayerInfo);
        SMK.MAP[1].layers.push(jsonLayerInfo);

        
        // creating the json  tool information in the same style as map-config.json
        let jsonToolLayerInfo = '{  "id": "", "type": "layer", "title": "", "isVisible": true }';
        jsonToolLayerInfo  = JSON.parse(jsonToolLayerInfo);
        jsonToolLayerInfo.id = jsonLayerInfo.id;
        jsonToolLayerInfo.title = jsonLayerInfo.title;
        if (tooManyLayers){
            jsonToolLayerInfo.isVisible = false;
        }


        for (let tool in SMK.MAP[1].tools) {
            if (SMK.MAP[1].tools[tool].type == "layers" ){
                SMK.MAP[1].tools[tool].display.push(jsonToolLayerInfo);
            }
        }

        

    }

    //add a KML Layer to the map from a URL, depending on if it has a network link or not it will be handled differently
    async function asyncAddKMLLayerToMap ( kMLURL) {
        let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;
        console.log("KML URL is: ", kMLURL);

        const response = await fetch(kMLURL, {});
        const text = await response.text();
        console.log("raw text returned from fetch: ", text);
        //need to check if the kml document has a network link, if it does it needs to be handled seperately 
        // if it doesn't we can convert it to GeoJSON and then pass it to the geoJSON add to map function
        let hasNetworkLink = false;
        if (text.includes("<NetworkLink>")){
            hasNetworkLink = true;
            console.log("includes a network link");
        }
        let parser = new DOMParser();
        let kml = parser.parseFromString(text,"text/xml");
        console.log( "XML doc returned from KML request is: ", kml );

        
        if (!hasNetworkLink) {
        console.log("No network link, can be converted and added to map");
        let geoJSON = toGeoJSON.kml(kml);
        console.log(geoJSON);
        SMK.UTIL.addGeoJSONFileToMap( geoJSON, this.color, this.stroke, this.fill, this.opacity, this.strokeWidth, this.lineCap, this.lineJoin, 
            this.dashArray, this.dashOffset, this.fillColor, this.fillOpacity, this.fillRule );
        } 
        else if (hasNetworkLink) {
            console.log("Has a network link, will need to be handled");

            // digs until it finds a link, either .kml or oterwise. If it's .kml we call this function again either until we get a kml file without a network link that resolves into geoJSON
            // or until we get a network link that resolves into a wms link in which case that can be handled also
            let firstKMLNetworkLink = digThroughKMLForNetworkLinkLink( kml ); 

            console.log("substring looks like: ", firstKMLNetworkLink.substring( firstKMLNetworkLink.length - 4) );
            if ( firstKMLNetworkLink.substring( firstKMLNetworkLink.length - 4) == ".kml") {
                console.log("first link is a kml link so we're recursing, kml link is: ", firstKMLNetworkLink);
                asyncAddKMLLayerToMap(firstKMLNetworkLink);

            } else {
                console.log("some other link, maybe wms that needs to be handled accordingly, some other link is: ", firstKMLNetworkLink);
            }
        }
    }

    // this is called when we don't know where the network link is in the kml, once it's found we'll need to call the dig through networklink to find kml
    function digThroughKMLForNetworkLinkLink ( kml ) {
        for (let childNode in kml.childNodes ) {
            if (kml.childNodes[childNode].childNodes.length > 0 && kml.childNodes[childNode].getElementsByTagName("NetworkLink")[0].nodeName == "NetworkLink" ){
                // here we can probably can call the dig through kml for link function
                return digThroughKMLNetworkLinkNodeForLinkTag(kml.childNodes[childNode].getElementsByTagName("NetworkLink")[0] );
            } else if ( kml.childNodes[childNode].childNodes.length > 0 ) {
                digThroughKMLForNetworkLinkLink( kml.childNodes[childNode] );
            } else if ( childNode == kml.childNodes.length - 1){
                return false;
            }
        }
    }

    // this is called to find the link within a network link tag, this way we're not finding other links that may be elsewhere in the kml
    function digThroughKMLNetworkLinkNodeForLinkTag ( kml ) {
        for (let childNode in kml.childNodes ) {
            console.log("The child node is: ", kml.childNodes[childNode]);

            if (kml.childNodes[childNode].childNodes.length > 0 && kml.childNodes[childNode].nodeName == "Link" ){  

                return kml.childNodes[childNode].getElementsByTagName("href")[0].childNodes[0].nodeValue;

            } else if ( kml.childNodes[childNode].childNodes.length > 0 ) {
                digThroughKMLNetworkLinkNodeForLinkTag( kml.childNodes[childNode] );
                
                //this means we've checked everything at this level
            } else if ( childNode == kml.childNodes.length - 1) {

                return false;
            }
            
        }

    }

    // returns the xml of esri layer data
    async function asyncGetEsriLayerData ( serviceUrl, id ) {
        
        let URL = serviceUrl + id;

        const response = await fetch(URL, {});
        let text = await response.text();
        //console.log(text)

        // removing opening quotes if they exist
        if (text.charAt(0) === '"' && text.charAt(text.length -1) === '"') {
            
            //console.log(text.substr(1,text.length -2));

            text = text.substr(1,text.length -2);
        }

        console.log("Post quotes removal",text);

        text = text.replace(/\\/g, "");

        console.log("Post forward slash removal",text);

        //handling weird headers and setting them correctly 
        let newHeaderXML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        let textIndex = text.indexOf(">");
        text = text.slice(textIndex + 1);
        text = newHeaderXML + text;

        console.log("Post new header replacement",text);
        
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(text,"text/xml");

        

        return xmlDoc;

    }

    // Returns an array with all the Layer names and their Styles in an array from an XML sources
    function getLayerNamesFromXML( xmlData ){
        //console.log(xmlData)
        let layerNames = [];
        let txt = xmlData.getElementsByTagName("Capability")[0].getElementsByTagName("Layer")[0];
        let array = Array.from(txt.childNodes);
        array.forEach( function (item) {
            if (item.nodeName == 'Layer') {
                let arrayOfJSONStyles = [];
                let numberOfChildren = item.getElementsByTagName('Style');
                let styleNo = 0;
                // Loop through every available style for a given layer, adding them to an array 
                while (styleNo < numberOfChildren.length) {
                    
                    let jSONStyles = '{  "name": null, "title": null   }';

                    jSONStyles = JSON.parse(jSONStyles);
                    jSONStyles.name = ((item.getElementsByTagName("Style")[styleNo].getElementsByTagName("Name")[0].childNodes[0].nodeValue));
                    jSONStyles.title = ((item.getElementsByTagName("Style")[styleNo].getElementsByTagName("Title")[0].childNodes[0].nodeValue));

                    // avoid adding duplicate values
                    if (arrayOfJSONStyles.length == 0){
                        // first one can be added
                        arrayOfJSONStyles.push(jSONStyles);
                    } else {
                        for (let existingStyle in arrayOfJSONStyles){
                            if (arrayOfJSONStyles[existingStyle].name == jSONStyles.name && arrayOfJSONStyles[existingStyle].title == jSONStyles.title){
                                //match, don't push
                                break;
                            } else if (existingStyle == arrayOfJSONStyles.length - 1 ){
                                //checked all existing styles, no match was found so add it
                                arrayOfJSONStyles.push(jSONStyles);
                            }
                        }
                    }
                    styleNo++;
                }
                
                // this JSON object will contain the name of the layer and the array of JSON object styles belonging to that layer
                let nameAndStyleJSON = '{ "layerName": null, "layerTitle": null, "stylesArr": null    }'
                nameAndStyleJSON = JSON.parse(nameAndStyleJSON);
                nameAndStyleJSON.layerName = item.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
                nameAndStyleJSON.layerTitle = item.getElementsByTagName("Title")[0].childNodes[0].nodeValue;
                nameAndStyleJSON.stylesArr = arrayOfJSONStyles;

                layerNames.push(nameAndStyleJSON);
            
            }
            
        } );
        //console.log(layerNames)
        return layerNames;

    }

    //This needs to parse if the url is just the simple geo request or a layer name or whatever
    //returns an array with the first element being the service value, and the second being the array of layers
    async function asyncGetLayersFromWMS (wmsURL) {
        
        const response = await fetch(wmsURL, {});
        const text = await response.text();
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(text,"text/xml");
        let wmsServiceAndLayerNamesArray = [];
        wmsServiceAndLayerNamesArray.push(getWMSServiceOnlineResource (xmlDoc));
        wmsServiceAndLayerNamesArray.push(getLayerNamesFromXML(xmlDoc));

        return wmsServiceAndLayerNamesArray;

    }

    //returns the online resource value from the xmlData which is the url that should have the requests directed to it
    function getWMSServiceOnlineResource (xmlData) {
        let onlineResourceURL;
        let txt = xmlData.getElementsByTagName("Service")[0].getElementsByTagName("OnlineResource")[0];

        onlineResourceURL = txt.attributes[1].nodeValue; 

        return onlineResourceURL;

    }

    //currently running into CORS issues
    async function asyncGetLayersFromEsriDynamic (serviceURL, esriDynamicURL) {
        console.log('the url of esri prod is:', esriDynamicURL );

        
        const response = await fetch(esriDynamicURL);
        let text = await response.text();
        //console.log(text)

        // removing opening quotes if they exist
        if (text.charAt(0) === '"' && text.charAt(text.length -1) === '"') {
            
            //console.log(text.substr(1,text.length -2));

            text = text.substr(1,text.length -2);
        }

        //handling weird headers and setting them correctly 
        let newHeaderXML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        let textIndex = text.indexOf(">");
        text = text.slice(textIndex + 1);
        text = newHeaderXML + text;
        
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(text,"text/xml");

        let jSONDataArr = [];
        jSONDataArr = getJSONDataFromEsriXML( xmlDoc );

        console.log(jSONDataArr);

        return jSONDataArr;
    
    }

    // given the MPCM esri XML document return an array filled with JSON objects containing the superstructure
    // used in processing the esri layers information xml document
    class MPCMInfoLayer {
        constructor() {
            this.jsonObject =   '{ "id": 0, "mpcmId": null,"label": null, "subLayers": [] }';
            this.jsonObject = JSON.parse(this.jsonObject);

        }
        setId(id){
            this.jsonObject.id = id;

        }

        setLabel(label){
            this.jsonObject.label = label;

        }

        setMpcmId(mpcmId){
            this.jsonObject.mpcmId = mpcmId;
        }

        setSubLayers(subLayers){
            this.jsonObject.subLayers.push( subLayers );
        }

        getJsonObject(){
            return this.jsonObject;
        }

    }

    // part of processing the esri layers information
    function processFolders( folders, parent, id){
        if (folders != null) {
            for (let i = 0; i < folders.length; i++) {
                let folder = folders.item(i);

                name = folder.getElementsByTagName("folderName").item(0).textContent;
                if(!name.toLowerCase().includes("(internal access)") && !name.toLowerCase().includes(" - internal")) {
                    //for each folder, create a root layer object. Add to a tree node. No parent
                    let layer = new MPCMInfoLayer();

                    layer.setId(id);
                    layer.setLabel(name);

                    parent.setSubLayers(layer);
                    id++;

                    // Each root node folder may have layer and/or folders within
                    // we'll need to add each of them here.
                    
                    let subfolderElement = folder.getElementsByTagName("folders").item(0);

                    if(subfolderElement != null) {
                        subfoldersNodes = subfolderElement.childNodes;
                        id = processFolders(subfolderNodes, layer, id);
                    }

                    let sublayerElement = folder.getElementsByTagName("layers").item(0);

                    if(sublayerElement != null) {
                        let subLayerNodes = sublayerElement.childNodes;
                        id = processLayers(subLayerNodes, layer, id);
                    }

                }
            }
        }

        return id;
      }

      // part of processing the esri layers information
    function processLayers(layers, parent, id) {
        if (layers != null) {
            for (let i = 0; i < layers.length; i++) {
                let layerElement = layers.item(i);

                let layer = new MPCMInfoLayer();

                let layerName = layerElement.getElementsByTagName("layerDisplayName").item(0).textContent;

                if(!layerName.toLowerCase().includes("(internal access)") && !layerName.toLowerCase().includes(" - internal")) {
            	
                    layer.setId(id);
                    layer.setMpcmId(layerElement.getElementsByTagName("layerId").item(0).textContent);
                    layer.setLabel(layerElement.getElementsByTagName("layerDisplayName").item(0).textContent);
                    
                    parent.setSubLayers(layer);
                    id++;
            	}

            }
        }
        return id
    }

    //returns a json structure from the esri xml document
    function getJSONDataFromEsriXML( xmlDoc ) {

        //array of all the nodes
        let jSONDataArr = [];

        console.log("The XML doc is: ", xmlDoc);

        let foldersElement = xmlDoc.getElementsByTagName("folders").item(0);
        console.log(foldersElement);

        let foldersNodes = foldersElement.childNodes;
        console.log(foldersNodes);

        let itemId = 1;

        if ( foldersNodes != null){
            for (let i = 0; i < foldersNodes.length; i++) {

                // these are the main outer folders within which are folderName like Administrative Boundaries, then the subfolders with layers ect
                let folder =  foldersNodes.item(i);
                console.log(folder);

                let rootLayer = new MPCMInfoLayer();

                rootLayer.setId(itemId);
                console.log(folder.getElementsByTagName("folderName").item(0));
                console.log(folder.getElementsByTagName("folderName").item(0).textContent);
                rootLayer.setLabel(folder.getElementsByTagName("folderName").item(0).textContent);

                jSONDataArr.push(rootLayer);
                itemId++;

                let subfolderElement = folder.getElementsByTagName("folders").item(0);
                if (subfolderElement != null) {
                    let subfoldersNodes = subfolderElement.childNodes;
                    itemId = processFolders( subfoldersNodes, rootLayer, itemId);

                }

                let sublayerElement = folder.getElementsByTagName("layers").item(0);

                if(sublayerElement != null) {
                    let sublayerNodes = sublayerElement.childNodes;
                    itemId = processLayers(sublayerNodes, rootLayer, itemId);
                }

                console.log("Root layer currently looks like: ", rootLayer.getJsonObject());

            }

        }

        return jSONDataArr

    }

    
    //gets a list of all the feature layers from a layer name and WMS returning all the features available to that layer, these can be display
    //currently not required
    async function asyncGetFeaturesFromWMS (layerName, wmsURLService) {
        console.log('the url of the wms is:', wmsURLService );

        var url = ( wmsURLService + "?service=wfs&version=2.0.0&request=GetFeature&typeNames=" + layerName  + "&outputformat=application%2Fjson");
        console.log('The url in asyncGetFeaturesFromWMS is', url);
        const response = await fetch(url, {});
        const json = await response.json();

        return json;

    }
    
    SMK.TYPE.layerimportTool = layerimportTool

    $.extend( layerimportTool.prototype, SMK.TYPE.Tool.prototype )
    layerimportTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    layerimportTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this
        
        smk.on( this.id, {
            'activate': function () {
          
                if ( !self.enabled ) return
        
                self.active = !self.active
                
            }

        } )

    } )

    return layerimportTool
} )
