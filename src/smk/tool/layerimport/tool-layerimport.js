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
                //ESRIURL: 'https://mpcm-catalogue.api.gov.bc.ca/catalogV2/PROD/',
                //ESRIURL: 'https://apps.gov.bc.ca/pub/mpcm/services/catalog/PROD/',
                ESRIURL: 'http://localhost:8080/smks-api/LayerLibrary/test/test/',
                KMLURL: 'https://openmaps.gov.bc.ca/kml/geo/layers/WHSE_IMAGERY_AND_BASE_MAPS.AIMG_HIST_INDEX_MAPS_POINT_loader.kml',
                
                featureListShow: false,
                layerListShow: false,
                esriLayerListShow: false,
                jsonFeatures: null,
                styleName: null,
                selected: 'GeoJSON',
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
        
            //imports a layer to the leaflet map directly (doesn't currently let smk know the layer has been added)
            setLayerImport: async function  ( event ) {
                
                console.log("The event is: ",event);
                console.log("The id is: ",event.srcElement.id);
                console.log("The style name is: ",event.srcElement.attributes.item(1).nodeValue);
                console.log("The style title is: ",event.srcElement.attributes.item(2).nodeValue);
                console.log("The full object is: ",event.srcElement.attributes.item(3).nodeValue);
                
                let layerName = event.srcElement.id;
                let styleName = event.srcElement.attributes.item(1).nodeValue;
                let layerObject = event.srcElement.attributes.item(3).nodeValue;
                layerObject = JSON.parse(layerObject);
 
                // this does load the features from the wms server, it seems features are not the same as attributes however which this does not get (I think, needs checking)                
                let url = this.service;
                const json = await asyncGetFeaturesFromWMS( layerName, url);
                console.log("The json feature list is: ");
                console.log(json);
                this.jsonFeatures = json.features;

                /*
                this.layerListShow = false;
                this.featureListShow = true;
                */

                this.styleName = styleName;
                this.layerName = layerName;
                
                //directly adds a layer to the map
                let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;
                var wmsLayer = L.tileLayer.wms( this.service ,{ 
                    layers: this.layerName,
                    styles: this.styleName,
                    format: 'image/png',
                    transparent: true
                }).addTo(map);
                
                // need to have all the SMK json information here so we can add it to SMKs layers and tools otherwise it's not really being properly intergrated into the system
                // The below does add the information to smk, it does not refresh any of the smk tools to recognize it, which eventually needs to happen

                //creating the json layer info in the same style as map-config.json
                let jsonLayerInfo = '{  "type": null, "id": null, "title": null, "isVisible": true, "attribution": "", "metadataUrl": "", "opacity": 0.65,  "isQueryable": true, "attributes": [], "serviceUrl":null, "layerName": null, "styleName": null }';

                let title = (layerName + "-" + styleName);
                title = title.replace(/_/g, " ");
                let id = layerName + "-" + styleName;

                
                jsonLayerInfo = JSON.parse(jsonLayerInfo);
                jsonLayerInfo.type = "wms";
                jsonLayerInfo.id = id;
                jsonLayerInfo.title = title;
                jsonLayerInfo.serviceUrl = this.service;
                jsonLayerInfo.layerName = layerName;
                jsonLayerInfo.styleName = styleName;

                // creating the json attribute information in the same style as map-config.json, but we don't seem to have true atttribute data yet
                let jsonAttribute = '{"id": null,"name": null,"title": null,"visible": true}';
                jsonAttribute = JSON.parse(jsonAttribute);
                
                
                for (let object in this.jsonFeatures) {

                    jsonAttribute.id = this.jsonFeatures[object].id;
                    jsonAttribute.name = this.jsonFeatures[object].id;
                    jsonAttribute.title =this.jsonFeatures[object].id;

                    jsonLayerInfo.attributes.push(jsonAttribute);
                }
                
                console.log("json layer info is: ", jsonLayerInfo);
                SMK.MAP[1].layers.push(jsonLayerInfo);
                
                // creating the json  tool information in the same style as map-config.json
                let jsonToolLayerInfo = '{  "id": "", "type": "layer", "title": "", "isVisible": true }';
                jsonToolLayerInfo  = JSON.parse(jsonToolLayerInfo);
                jsonToolLayerInfo.id = id;
                jsonToolLayerInfo.title = title;


                for (let tool in SMK.MAP[1].tools) {
                    if (SMK.MAP[1].tools[tool].type == "layers" ){
                        SMK.MAP[1].tools[tool].display.push(jsonToolLayerInfo);
                    }
                }
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
                    
                    //currently this is stripping out everything after the ? if it exists to insist on doing a get capabilities request
                    if (this.service.includes("?")) {
                    this.service = this.service.slice(0, (this.service.indexOf("?"))) ;
                    //console.log("The url post slice is: ", this.service)
                    }
                    this.service = this.service.trim() + "?service=WMS&request=GetCapabilities";
                    //console.log("after trim and concat is: ", this.service)
                    
                    // retrieving all the layers and their styles
                    let wmsANDLayerArr = await asyncGetLayersFromWMS ( this.service );
                    this.service = wmsANDLayerArr[0];
                    this.items = wmsANDLayerArr[1];
                    this.layerListShow = true;
                }
                if (this.selected == 'arcGIS') {

                    //currently hardcoding to only use this service, in the future will allow for other services to be selected earlier on
                    this.service = "https://maps.gov.bc.ca/arcgis/rest/services/mpcm/bcgw/MapServer";

                    // waits while fetching all the information from the service and URL, could take some time for that to render
                    let jsonArrayOfDyanmicLayerIDNames = await asyncGetLayersFromEsriDynamic( this.service, this.ESRIURL );
                    this.items = jsonArrayOfDyanmicLayerIDNames;
                    this.esriLayerListShow = true;
                    
                }
                if (this.selected == 'KML'){
                    await asyncAddKMLLayerToMap( this.KMLURL);
                }
            },

            // this function is going to add a dynamic layer to the map after fetching the relevant information
            //currently waiting for the data source to send us the individual data, currently not functional
            fetchEsriLayerInfo: async function ( event ) {
                let id  = event.srcElement.id;
                console.log("Id is: ", id , " and we're going to call the data fetch from here to retrieve it");
                let esriLayerData = [];
                esriLayerData = await asyncGetEsriLayerData( this.ESRIURL, id);
                console.log("esri layer data in detail is: ", esriLayerData);
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
                            addGeoJSONFileToMap( e.target.result, this.color, this.stroke, this.fill, this.opacity, this.strokeWidth, this.lineCap, this.lineJoin, 
                                this.dashArray, this.dashOffset, this.fillColor, this.fillOpacity, this.fillRule );

                            event.target.value = null
                            this.geoJSONFileUploadSuccess = true
                            
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
        addGeoJSONFileToMap( geoJSON, this.color, this.stroke, this.fill, this.opacity, this.strokeWidth, this.lineCap, this.lineJoin, 
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
        let esriLayerInfo = [];
        let URL = serviceUrl + id;

        const response = await fetch(URL, {});
        const text = await response.text();

        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(text,"text/xml");

        esriLayerInfo.push(xmlDoc);

        return esriLayerInfo;

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
                let numberOfChildren = item.getElementsByTagName('Style').length;
                let x = 0;
                // Loop through every available style for a given layer, adding them to an array 
                while (x < numberOfChildren) {
                    let jSONStyles = '{  "name": null, "title": null   }';

                    jSONStyles = JSON.parse(jSONStyles);
                    jSONStyles.name = ((item.getElementsByTagName("Style")[x].getElementsByTagName("Name")[0].childNodes[0].nodeValue));
                    jSONStyles.title = ((item.getElementsByTagName("Style")[x].getElementsByTagName("Title")[0].childNodes[0].nodeValue));

                    arrayOfJSONStyles.push(jSONStyles);
                    x++;
                }
                
                // this JSON object will contain the name of the layer and the array of JSON object styles belonging to that layer
                let nameAndStyleJSON = '{ "layerName": null, "stylesArr": null    }'
                nameAndStyleJSON = JSON.parse(nameAndStyleJSON);
                nameAndStyleJSON.layerName = item.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
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

    //print a geoJSONfile to a leaflet map
    function addGeoJSONFileToMap( geoJSONFile, color, stroke, fill, opacity, strokeWidth, lineCap, lineJoin, dashArray, dashOffset, fillColor, fillOpacity, fillRule ) {

        console.log ("color, stroke, fill, opacity, strokeWidth, lineCap, lineJoin, dashArray, dashOffset, fillColor, fillOpacity, is: ", 
        color, stroke, fill, opacity, strokeWidth, lineCap, lineJoin, dashArray, dashOffset, fillColor, fillOpacity, fillRule);

        //used to give each geometry collections added in the file to the map an ID that will be combined with date to be unique to this session
        // useful when trying to rebuild geomtry collections later
        let geometryCollectionCounter = 0;
        
        let date = new Date();
        let featureCollectionTimeAdded = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(); 

        let geoJSONStyle = {
            "color": color,
            "weight": strokeWidth,
            "opacity": opacity,
            "stroke": stroke,
            "fill": fill,
            "lineCap": lineCap,
            "lineJoin": lineJoin,
            "dashArray": dashArray,
            "dashOffset": dashOffset,
            "fillColor": fillColor,
            "fillOpacity": fillOpacity,
            "fillRule": fillRule,
            
        }

        console.log(geoJSONFile);
        geoJSONFile = JSON.parse(geoJSONFile);
        console.log("GeoJSON file parsed: ", geoJSONFile);

        let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;

        if (geoJSONFile.type == "Feature") {

            switch(geoJSONFile.geometry.type) {
                case "GeometryCollection":
                    addGeoJSONGeometryCollectionAndStyleToMap(geoJSONFile, null, geoJSONStyle, map, "GeometryCollection", geometryCollectionCounter, "No Collection");
                    geometryCollectionCounter += 1;
                    break;
                case "Point":
                    addGeoJSONPointAsCircleMarker(geoJSONFile, null, geoJSONStyle, map, "Point", "No Collection", "No Geo Collection", "No Geo Collection");
                    break;
                case "MultiPoint":
                    addGeoJSONMultiPointsAsCircleMarker(geoJSONFile, null, geoJSONStyle, map, "MultiPoint", "No Collection", "No Geo Collection", "No Geo Collection")
                    break;
                default:
                    L.geoJSON(geoJSONFile, {
                        style: geoJSONStyle,
                        originalGeoJSONType: geoJSONFile.geometry.type,
                        featureCollectionTime: "No Collection",
                        alt: "No Collection"
                    }).addTo(map);
            }

            
            
        
        } else if ( geoJSONFile.type == "FeatureCollection") {
            for ( let feature in geoJSONFile.features){
                if (geoJSONFile.features[feature].type == "Feature") {
                    switch(geoJSONFile.features[feature].geometry.type) {
                        // the types are passed in to addgeoJSONFeatureAndStyleToMap so that leaflet has access to them in objects, useful elsewhere
                        case "Point":
                            addGeoJSONPointAsCircleMarker(geoJSONFile, feature, geoJSONStyle, map, "Point", featureCollectionTimeAdded, "No Geo Collection", "No Geo Collection");
                            break;
                        case "LineString":
                            addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "LineString", featureCollectionTimeAdded);
                            break;
                        case "Polygon":
                            addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "Polygon", featureCollectionTimeAdded);
                            break;
                        case "MultiPoint":
                            addGeoJSONMultiPointsAsCircleMarker(geoJSONFile, feature, geoJSONStyle, map, "MultiPoint", featureCollectionTimeAdded, "No Geo Collection", "No Geo Collection")
                            break;
                        case "MultiLineString":
                            addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "MultiLineString", featureCollectionTimeAdded);
                            break;
                        case "MultiPolygon":
                            addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "MultiPolygon", featureCollectionTimeAdded);
                            break;
                        case "GeometryCollection":
                            addGeoJSONGeometryCollectionAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "GeometryCollection", geometryCollectionCounter, featureCollectionTimeAdded);
                            geometryCollectionCounter += 1
                            break;
                        default:
                            console.log("Not one of the defaults")       
                    }
                // line strings are here also in case they're in included inside a file without being in a feature
                }  else if (geoJSONFile.features[feature].type == "LineString") {
                    addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "LineString", featureCollectionTimeAdded);
                }
            }
        }
    }


    function addGeoJSONPointAsCircleMarker (geoJSONFile, feature, geoJSONStyle, map, type, featureCollectionTimeAdded, geometryCollectionCounter, geoCollectionHour) {
        
        console.log("Inside add geo JSON Point as circle marker")
        let geojsonMarkerOptions = {
            radius: 1,
            fillColor: geoJSONStyle.fillColor,
            color: geoJSONStyle.color,
            weight: geoJSONStyle.weight,
            opacity: geoJSONStyle.opacity,
            fillOpacity: geoJSONStyle.fillOpacity,
            featureCollectionTime: featureCollectionTimeAdded,
            originalGeoJSONType: type,
            style: geoJSONStyle,
            creationID: geometryCollectionCounter,
            geoCollectionHour: geoCollectionHour
            

        };

        if (feature == null && featureCollectionTimeAdded == "No Collection" && geometryCollectionCounter == "No Geo Collection"){
            // handles if there is no feature collection and no geometry collection aka just adding a feature by itself

            let geoJSONPointCoords = geoJSONFile.geometry.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[1]
            latlng[1] = geoJSONPointCoords[0]

            L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);

        } else if (geometryCollectionCounter != "No Geo Collection" && featureCollectionTimeAdded != "No Collection"){
            //handles if there is a geometry collection and a feature collection
            let geoJSONPointCoords = geoJSONFile.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[0][1]
            latlng[1] = geoJSONPointCoords[0][0]

            L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);

        } else if (geometryCollectionCounter != "No Geo Collection") {
            // handles if there is just a geo collection
            let geoJSONPointCoords = geoJSONFile.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[0][1]
            latlng[1] = geoJSONPointCoords[0][0]

            L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        
            
        

        } else {
            // else handles if there is just a feature collection
            let geoJSONPointCoords = geoJSONFile.features[feature].geometry.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[1]
            latlng[1] = geoJSONPointCoords[0]


            L.geoJSON(geoJSONFile.features[feature], {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        }
    }




    function addGeoJSONMultiPointsAsCircleMarker (geoJSONFile, feature, geoJSONStyle, map, type, featureCollectionTimeAdded, geometryCollectionCounter, geoCollectionHour) {
        
        
        console.log("Inside add geo JSON Point as circle marker")
        let geojsonMarkerOptions = {
            radius: 1,
            fillColor: geoJSONStyle.fillColor,
            color: geoJSONStyle.color,
            weight: geoJSONStyle.weight,
            opacity: geoJSONStyle.opacity,
            fillOpacity: geoJSONStyle.fillOpacity,
            featureCollectionTime: featureCollectionTimeAdded,
            originalGeoJSONType: type,
            id : multiPointCollectionCounter,
            style: geoJSONStyle,
            creationID: geometryCollectionCounter,
            geoCollectionHour: geoCollectionHour


        };

        if (feature == null && featureCollectionTimeAdded == "No Collection" && geometryCollectionCounter == "No Geo Collection"){
            // handles if there is no feature collection and no geometry collection aka just adding a feature by itself
            let geoJSONPointCoords = geoJSONFile.geometry.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[0][1]
            latlng[1] = geoJSONPointCoords[0][0]

            L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);


        } else if (geometryCollectionCounter != "No Geo Collection" && featureCollectionTimeAdded != "No Collection"){
            //handles if there is a geometry collection and a feature collection

            let geoJSONPointCoords = geoJSONFile.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[0][1]
            latlng[1] = geoJSONPointCoords[0][0]


            L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);


        } else if (geometryCollectionCounter != "No Geo Collection") {
            // handles if there is just a geo collection
            let geoJSONPointCoords = geoJSONFile.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[0][1]
            latlng[1] = geoJSONPointCoords[0][0]

            L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);


        } else {
            // else handles if there is just a feature collection
            let geoJSONPointCoords = geoJSONFile.features[feature].geometry.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[0][1]
            latlng[1] = geoJSONPointCoords[0][0]

            L.geoJSON(geoJSONFile.features[feature], {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            
        }

        multiPointCollectionCounter += 1

    }










    //default function used to add most features to a map
    function addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, type, featureCollectionTimeAdded) {
        
        L.geoJSON(geoJSONFile.features[feature], {
            style: geoJSONStyle,
            originalGeoJSONType: type,
            featureCollectionTime: featureCollectionTimeAdded,
            originalGeoJSONFeatureCollection: geoJSONFile,
        }).addTo(map);

    }

        //need to be able to identify geometry collections created in the session
        // need to break the geometry collection objects into individual types, but add the information that they're originally from a geometry collection
        // and include information on which geometry collection they're from so they can be re-assembled
    function addGeoJSONGeometryCollectionAndStyleToMap(geoJSONFileGeoCollection, feature, geoJSONStyle, map, type, geometryCollectionCounter, featureCollectionTimeAdded){
        let date = new Date();
        let time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(); 

        console.log("The geometry collection looks like: ", geoJSONFileGeoCollection)
        


        // in case the geometry collection isn't part of a feature collection
        if (feature == null && featureCollectionTimeAdded == "No Collection"){
            for (let geometry in geoJSONFileGeoCollection.geometry.geometries){
                //console.log("The inner geometries should be: ", geoJSONFileGeoCollection.geometry.geometries[geometry])

                if (geoJSONFileGeoCollection.geometry.geometries[geometry].type == "MultiPoint"){


                    addGeoJSONMultiPointsAsCircleMarker(geoJSONFileGeoCollection.geometry.geometries[geometry], null, geoJSONStyle, map, "MultiPoint", "No Collection", geometryCollectionCounter, time)

                } else if(geoJSONFileGeoCollection.geometry.geometries[geometry].type == "Point") {
                    addGeoJSONPointAsCircleMarker(geoJSONFileGeoCollection.geometry.geometries[geometry], null, geoJSONStyle, map, "Point", "No Collection", geometryCollectionCounter, time)

                } else {
                    L.geoJSON(geoJSONFileGeoCollection.geometry.geometries[geometry], {
                        style: geoJSONStyle,
                        originalGeoJSONType: type,
                        geoCollectionSubType: geoJSONFileGeoCollection.geometry.geometries[geometry].type,
                        hour: time,
                        creationID: geometryCollectionCounter,
                        originalGeometryCollectionObject: geoJSONFileGeoCollection,
                        featureCollectionTime: featureCollectionTimeAdded

                    }).addTo(map);
                }
            }

        } else {
            for (let geometry in geoJSONFileGeoCollection.features[feature].geometry.geometries){
                //console.log("The inner geometries should be: ", geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry])

                if (geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry].type == "MultiPoint"){
                    addGeoJSONMultiPointsAsCircleMarker(geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry], feature, geoJSONStyle, map, "MultiPoint", featureCollectionTimeAdded, geometryCollectionCounter, time)

                } else if(geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry].type == "Point") {
                    addGeoJSONPointAsCircleMarker(geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry], feature, geoJSONStyle, map, "Point", featureCollectionTimeAdded, geometryCollectionCounter, time)

                } else {
                L.geoJSON(geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry], {
                    style: geoJSONStyle,
                    originalGeoJSONType: type,
                    geoCollectionSubType: geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry].type,
                    hour: time,
                    creationID: geometryCollectionCounter,
                    originalGeometryCollectionObject: geoJSONFileGeoCollection.features[feature],
                    featureCollectionTime:featureCollectionTimeAdded

                }).addTo(map);
            }
        }
    }
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
                
                console.log("smk is: ", smk);
                console.log("smk.$viewer.map is: ", smk.$viewer.map);
                
                if ( !self.enabled ) return
        
                self.active = !self.active
                
            }

        } )

    } )

    return layerimportTool
} )
