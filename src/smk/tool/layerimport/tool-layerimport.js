include.module( 'tool-layerimport', [ 'tool', 'widgets', 'tool-layerimport.panel-layerimport-html' ], function ( inc ) {
    "use strict";

    

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
                //WMSURL: 'https://openmaps.gov.bc.ca/geo/pub/ows',
                WMSURL: 'https://openmaps.gov.bc.ca/geo/pub/REG_LEGAL_AND_ADMIN_BOUNDARIES.QSOI_BC_REGIONS/ows?service=WMS&request=GetCapabilities',
                //ESRIURL: 'https://mpcm-catalogue.api.gov.bc.ca/catalogV2/PROD/',
                //ESRIURL: 'https://apps.gov.bc.ca/pub/mpcm/services/catalog/PROD/',
                ESRIURL: 'http://localhost:8080/smks-api/LayerLibrary/test/test/',
                featureListShow: false,
                layerListShow: false,
                esriLayerListShow: false,
                jsonFeatures: null,
                styleName: null,
                selected: 'ARCGis'
                
            }
          },
          methods: {
            // this handles a layer being selected and outputs to console all the features attached to that layer
            // next need to display a list of features so they can be added to the map selectively
            setLayerImport: async function  ( event ) {
                
                console.log("The event is: ",event)
                console.log("The id is: ",event.srcElement.id)
                console.log("The style name is: ",event.srcElement.attributes.item(1).nodeValue) 
                console.log("The style title is: ",event.srcElement.attributes.item(2).nodeValue)
                console.log("The full object is: ",event.srcElement.attributes.item(3).nodeValue)
                
                let layerName = event.srcElement.id
                
                let styleName = event.srcElement.attributes.item(1).nodeValue

                let layerObject = event.srcElement.attributes.item(3).nodeValue
                layerObject = JSON.parse(layerObject);
                console.log("Hopefully the layer object is: ", layerObject)
                console.log("Hopefully the layer object type is: ", layerObject.layerName)

                 //Showing features is not currently required as their information is superfluous
                //In theory, could at least exit back out here after adding a layer, or do anything
                //This did load all the features from a WMS and displayed them (fully functional, but not really useful)
                /*
                let url = this.service
                const json = await asyncGetFeaturesFromWMS( layerName, url);
                console.log("The json is: ")
                console.log(json)
                this.jsonFeatures = json.features

                this.layerListShow = false;
                this.featureListShow = true;
                */

                this.styleName = styleName
                this.layerName = layerName
                


                
                //testing out direct adding of layers to map
                let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;
                var wmsLayer = L.tileLayer.wms( this.service ,{ 
                    layers: this.layerName,
                    styles: this.styleName,
                    format: 'image/png',
                    transparent: true
                }).addTo(map);
                
                // need to have all the SMK json information here so we can add it to SMKs layers and tools otherwise it's not really being properly intergrated into the system
                let jsonLayerInfo = '{  "type": null, "id": null, "title": null, "isVisible": true, "attribution": "", "metadataUrl": "", "opacity": 0.65,  "isQueryable": true, "attributes": [], "serviceUrl":null, "layerName": null, "styleName": null }';

                let title = (layerName + "-" + styleName)
                title = title.replace(/_/g, " ")
                let id = layerName + "-" + styleName

                jsonLayerInfo = JSON.parse(jsonLayerInfo)
                jsonLayerInfo.type = "wms"
                jsonLayerInfo.id = id
                jsonLayerInfo.title = title
                jsonLayerInfo.serviceUrl = this.service
                jsonLayerInfo.layerName = layerName
                jsonLayerInfo.styleName = styleName

                console.log("json layer info is: ", jsonLayerInfo)
                SMK.MAP[1].layers.push(jsonLayerInfo)
                
                let jsonToolLayerInfo = '{  "id": "", "type": "layer", "title": "", "isVisible": true }'
                jsonToolLayerInfo  = JSON.parse(jsonToolLayerInfo)
                jsonToolLayerInfo.id = id
                jsonToolLayerInfo.title = title


                for (let tool in SMK.MAP[1].tools) {
                    if (SMK.MAP[1].tools[tool].type == "layers" ){
                        SMK.MAP[1].tools[tool].display.push(jsonToolLayerInfo)
                    }
    
                    
                }
                
        
            },
            //in theory this adds the selected feature to the map (Not functional)
            setFeatureImport: function  ( event ) {
                
                
                console.log("The event is: ",event)
                console.log("The id is: ", JSON.stringify(event.srcElement.id))
        
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
                    this.service = this.service.slice(0, (this.service.indexOf("?"))) 
                    //console.log("The url post slice is: ", this.service)
                    }
                    this.service = this.service.trim() + "?service=WMS&request=GetCapabilities"
                    //console.log("after trim and concat is: ", this.service)
                    
                    // retrieving all the layers and their styles
                    let wmsANDLayerArr = await asyncGetLayersFromWMS ( this.service );
                    this.service = wmsANDLayerArr[0];

                    //console.log("The object is: ", wmsANDLayerArr)
                    //console.log("Array 0 is: ", wmsANDLayerArr[0])
                    //console.log("Array 1 is: ", wmsANDLayerArr[1])
                    //console.log("Array 1, subarray 0 is: ", wmsANDLayerArr[1][0])
                    //console.log("Layer name is: ", wmsANDLayerArr[1][0].layerName);
                    //console.log("Style array is: ", wmsANDLayerArr[1][0].stylesArr);

                    this.items = wmsANDLayerArr[1];
                    this.layerListShow = true
                }
                if (this.selected == 'ARCGis') {

                    this.service = "https://maps.gov.bc.ca/arcgis/rest/services/mpcm/bcgw/MapServer"

                    let jsonArrayOfDyanmicLayerIDNames = await asyncGetLayersFromEsriDynamic( this.service, this.ESRIURL )
                    this.items = jsonArrayOfDyanmicLayerIDNames
                    this.esriLayerListShow = true
                    // need an await here where we fetch the layers from the provided service url


                }
                

            },

            // this function is going to add a dynamic layer to the map after fetching the relevant information
            fetchEsriLayerInfo: async function ( event ) {
                let id  = event.srcElement.id;
                console.log("Id is: ", id , " and we're going to call the data fetch from here to retrieve it")

                let esriLayerData = []
                esriLayerData = await asyncGetEsriLayerData( this.ESRIURL, id)

                console.log("esri layer data in detail is: ", esriLayerData)

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

    async function asyncGetEsriLayerData ( serviceUrl, id ) {
        let esriLayerInfo = []

        let URL = serviceUrl + id
        console.log("complete URL is: ", URL)

        const response = await fetch(URL, {});
        const text = await response.text();

        console.log(text)

        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(text,"text/xml");

        esriLayerInfo.push(xmlDoc)

        return esriLayerInfo

    }

    // Returns an array with all the Layer names and their Styles in an array from an XML sources
    function getLayerNamesFromXML( xmlData ){
        //console.log(xmlData)
        let layerNames = []

        let txt = xmlData.getElementsByTagName("Capability")[0].getElementsByTagName("Layer")[0];
        //console.log(txt)
        //console.log("child nodes?")
        //console.log(txt.childNodes)
        let array = Array.from(txt.childNodes);
        //console.log('child array is: ')
        //console.log(array)
        array.forEach( function (item) {
            //console.log(item);
            //console.log("node name is:")
            //console.log(item.nodeName)
            if (item.nodeName == 'Layer') {
                //console.log(item.getElementsByTagName("Name")[0].childNodes[0].nodeValue);
                

                let arrayOfJSONStyles = []


                let numberOfChildren = item.getElementsByTagName('Style').length
                //console.log(numberOfChildren)
                let x = 0;
                // Loop through every available style for a given layer, adding them to an array 
                while (x < numberOfChildren) {
                    //console.log("the ", x, "style")
                    //console.log((item.getElementsByTagName("Style")[x].getElementsByTagName("Name")[0].childNodes[0].nodeValue))
                    let jSONStyles = '{  "name": null, "title": null   }';

                    
                    jSONStyles = JSON.parse(jSONStyles)
                    jSONStyles.name = ((item.getElementsByTagName("Style")[x].getElementsByTagName("Name")[0].childNodes[0].nodeValue))
                    jSONStyles.title = ((item.getElementsByTagName("Style")[x].getElementsByTagName("Title")[0].childNodes[0].nodeValue))

                    //console.log('The json styles object is: ', jSONStyles)
                    arrayOfJSONStyles.push(jSONStyles)
                    x++
                }
                
                // this JSON object will contain the name of the layer and the array of JSON object styles belonging to that layer
                let nameAndStyleJSON = '{ "layerName": null, "stylesArr": null    }'
                nameAndStyleJSON = JSON.parse(nameAndStyleJSON)
                nameAndStyleJSON.layerName = item.getElementsByTagName("Name")[0].childNodes[0].nodeValue
                nameAndStyleJSON.stylesArr = arrayOfJSONStyles

                
                
                layerNames.push(nameAndStyleJSON)
                

            }
            
        } );
        //console.log(layerNames)
        return layerNames



    }

    //This needs to parse if the url is just the simple geo request or a layer name or whatever
    //returns an array with the first element being the service value, and the second being the array of layers
    async function asyncGetLayersFromWMS (wmsURL) {
        console.log('the url of the wms is:', wmsURL )

        
        const response = await fetch(wmsURL, {});
        const text = await response.text();
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(text,"text/xml");
        let wmsServiceAndLayerNamesArray = []
        wmsServiceAndLayerNamesArray.push(getWMSServiceOnlineResource (xmlDoc))
        wmsServiceAndLayerNamesArray.push(getLayerNamesFromXML(xmlDoc))

        return wmsServiceAndLayerNamesArray


        

    }

    //returns the online resource value from the xmlData which is the url that should have the requests directed to it
    function getWMSServiceOnlineResource (xmlData) {
        console.log("inside getWMSServiceOnlineResource")

        console.log(xmlData)
        let onlineResourceURL
        let txt = xmlData.getElementsByTagName("Service")[0].getElementsByTagName("OnlineResource")[0];
        console.log(txt)
        
        console.log(txt.attributes[1].nodeValue)
        
        onlineResourceURL = txt.attributes[1].nodeValue
        
        
        console.log("now leaving getWMSServiceOnlineResource")
        return onlineResourceURL


    }
    

    //currently running into CORS issues
    async function asyncGetLayersFromEsriDynamic (serviceURL, esriDynamicURL) {
        console.log('the url of esri prod is:', esriDynamicURL )

        
        const response = await fetch(esriDynamicURL);
        let text = await response.text();
        //console.log(text)

        // removing opening quotes if they exist
        if (text.charAt(0) === '"' && text.charAt(text.length -1) === '"') {
            
            //console.log(text.substr(1,text.length -2));

            text = text.substr(1,text.length -2);
        }

        //handling weird headers and setting them correctly 
        let newHeaderXML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        let textIndex = text.indexOf(">")
        text = text.slice(textIndex + 1)
        text = newHeaderXML + text
        

        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(text,"text/xml");

        //console.log(xmlDoc)


        let jSONDataArr = []
        jSONDataArr = getJSONDataFromEsriXML( xmlDoc )

        console.log(jSONDataArr)

        return jSONDataArr
       
        
    
    }

    // given the MPCM esri XML document return an array filled with JSON objects containing the superstructure

    class MPCMInfoLayer {
        constructor() {
            this.jsonObject =   '{ "id": 0, "mpcmId": null,"label": null, "subLayers": [] }'
            this.jsonObject = JSON.parse(this.jsonObject)

        }
        setId(id){
            this.jsonObject.id = id 

        }

        setLabel(label){
            this.jsonObject.label = label

        }

        setMpcmId(mpcmId){
            this.jsonObject.mpcmId = mpcmId
        }

        setSubLayers(subLayers){
            this.jsonObject.subLayers.push( subLayers )
        }

        getJsonObject(){
            return this.jsonObject
        }

    }

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
                        id = processLayers(subLayerNodes, layer, id)
                    }


                }
            }
        }


        return id;
      }

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
                    id++
            	}



            }
        }
        return id
    }


    function getJSONDataFromEsriXML( xmlDoc ) {

        //array of all the nodes
        let jSONDataArr = []

        console.log("The XML doc is: ", xmlDoc)

        let foldersElement = xmlDoc.getElementsByTagName("folders").item(0)
        console.log(foldersElement)

        let foldersNodes = foldersElement.childNodes
        console.log(foldersNodes)

        let itemId = 1;


        if ( foldersNodes != null){
            for (let i = 0; i < foldersNodes.length; i++) {

                // these are the main outer folders within which are folderName like Administrative Boundaries, then the subfolders with layers ect
                let folder =  foldersNodes.item(i);
                console.log(folder)

                let rootLayer = new MPCMInfoLayer();

                rootLayer.setId(itemId);
                console.log(folder.getElementsByTagName("folderName").item(0))
                console.log(folder.getElementsByTagName("folderName").item(0).textContent)
                rootLayer.setLabel(folder.getElementsByTagName("folderName").item(0).textContent)

                jSONDataArr.push(rootLayer);
                itemId++;

                let subfolderElement = folder.getElementsByTagName("folders").item(0);
                if (subfolderElement != null) {
                    let subfoldersNodes = subfolderElement.childNodes
                    itemId = processFolders( subfoldersNodes, rootLayer, itemId)

                }

                let sublayerElement = folder.getElementsByTagName("layers").item(0);

                if(sublayerElement != null) {
                    let sublayerNodes = sublayerElement.childNodes;
                    itemId = processLayers(sublayerNodes, rootLayer, itemId);
                }


                console.log("Root layer currently looks like: ", rootLayer.getJsonObject())

            }



        }



        return jSONDataArr


    }






    /*
    //gets a list of all the feature layers from a layer name and WMS returning all the features available to that layer, these can be display
    //currently not required
    async function asyncGetFeaturesFromWMS (layerName, wmsURLService) {
        console.log('the url of the wms is:', wmsURLService )

        var url = ( wmsURLService + "?service=wfs&version=2.0.0&request=GetFeature&typeNames=" + layerName  + "&outputformat=application%2Fjson")
        console.log('The url in asyncGetFeaturesFromWMS is', url)
        const response = await fetch(url, {});
        const json = await response.json();

        return json

    }
    */

    SMK.TYPE.layerimportTool = layerimportTool

    $.extend( layerimportTool.prototype, SMK.TYPE.Tool.prototype )
    layerimportTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    layerimportTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this
        
        smk.on( this.id, {
            'activate': function () {
                
                console.log("smk is: ", smk)
                console.log("smk.$viewer.map is: ", smk.$viewer.map)
                
                
                
                /*
                // This currently is returning a 400 Error parsing dynamic layers
                let url = 'https://maps.gov.bc.ca/arcgis/rest/services/mpcm/bcgw/MapServer';
                let dynamicLayer =  "{\"id\":7590,\"source\":{\"type\":\"dataLayer\",\"dataSource\":{\"type\":\"table\",\"workspaceId\":\"MPCM_ALL_PUB\",\"dataSourceName\":\"WHSE_IMAGERY_AND_BASE_MAPS.BCNC_BC_NETWORK_COVERAGE_SV\",\"gdbVersion\":\"\"}},\"drawingInfo\":{\"renderer\":{\"type\":\"classBreaks\",\"field\":\"PERCENT_SERVED_50_MBPS\",\"classificationMethod\":\"esriClassifyManual\",\"minValue\":-999,\"classBreakInfos\":[{\"symbol\":{\"type\":\"esriSFS\",\"style\":\"esriSFSSolid\",\"color\":[0,0,0,0],\"outline\":{\"type\":\"esriSLS\",\"style\":\"esriSLSSolid\",\"color\":[156,156,156,255],\"width\":1}},\"classMaxValue\":-999,\"label\":\"No reported dwellings\",\"description\":\"\"},{\"symbol\":{\"type\":\"esriSFS\",\"style\":\"esriSFSSolid\",\"color\":[255,200,0,255],\"outline\":{\"type\":\"esriSLS\",\"style\":\"esriSLSSolid\",\"color\":[156,156,156,255],\"width\":1}},\"classMaxValue\":0,\"label\":\"0\",\"description\":\"\"},{\"symbol\":{\"type\":\"esriSFS\",\"style\":\"esriSFSSolid\",\"color\":[255,106,20,255],\"outline\":{\"type\":\"esriSLS\",\"style\":\"esriSLSSolid\",\"color\":[156,156,156,255],\"width\":1}},\"classMaxValue\":20.99,\"label\":\"0.1 - 20.9\",\"description\":\"\"},{\"symbol\":{\"type\":\"esriSFS\",\"style\":\"esriSFSSolid\",\"color\":[234,82,87,255],\"outline\":{\"type\":\"esriSLS\",\"style\":\"esriSLSSolid\",\"color\":[156,156,156,255],\"width\":1}},\"classMaxValue\":40.99,\"label\":\"21 - 40.9\",\"description\":\"\"},{\"symbol\":{\"type\":\"esriSFS\",\"style\":\"esriSFSSolid\",\"color\":[207,56,137,255],\"outline\":{\"type\":\"esriSLS\",\"style\":\"esriSLSSolid\",\"color\":[156,156,156,255],\"width\":1}},\"classMaxValue\":60.99,\"label\":\"41 - 60.9\",\"description\":\"\"},{\"symbol\":{\"type\":\"esriSFS\",\"style\":\"esriSFSSolid\",\"color\":[151,17,202,255],\"outline\":{\"type\":\"esriSLS\",\"style\":\"esriSLSSolid\",\"color\":[156,156,156,255],\"width\":1}},\"classMaxValue\":80.99,\"label\":\"61 - 80.9\",\"description\":\"\"},{\"symbol\":{\"type\":\"esriSFS\",\"style\":\"esriSFSSolid\",\"color\":[0,0,255,255],\"outline\":{\"type\":\"esriSLS\",\"style\":\"esriSLSSolid\",\"color\":[156,156,156,255],\"width\":1}},\"classMaxValue\":100,\"label\":\"81 - 100\",\"description\":\"\"}]},\"transparency\":75,\"labelingInfo\":null}}"
                dynamicLayer = JSON.parse(dynamicLayer)

                
                let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;

                let layer = L.esri.dynamicMapLayer( {
                    url:            url,
                    opacity:        0.65,
                    dynamicLayers:  dynamicLayer,
                    maxZoom:        100000,
                    minZoom:        0
                }).addTo(map);
                */
                
        

                
                
                
                


                if ( !self.enabled ) return
        
                self.active = !self.active
                
                


            }


        } )

    } )

    return layerimportTool
} )
