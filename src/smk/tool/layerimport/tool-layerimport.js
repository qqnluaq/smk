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
                //URL: 'https://openmaps.gov.bc.ca/geo/pub/ows',
                URL: 'https://openmaps.gov.bc.ca/geo/pub/REG_LEGAL_AND_ADMIN_BOUNDARIES.QSOI_BC_REGIONS/ows?service=WMS&request=GetCapabilities',
                featureListShow: false,
                layerListShow: false,
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
                
                let layerName = event.srcElement.id
                
                let styleName = event.srcElement.attributes.item(1).nodeValue


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
            
                console.log(smk.$viewer.map)


                
                let url = 'https://maps.gov.bc.ca/arcgis/rest/services/mpcm/bcgw/MapServer';
                let dynamicLayer = '{"id":7557,"minScale":20000000,"maxScale":0,"source":{"type":"dataLayer","dataSource":{"type":"table","workspaceId":"MPCM_ALL_PUB","dataSourceName":"WHSE_WILDLIFE_MANAGEMENT.WLD_WILD_MTN_SHEEP_DISTRIB_SP","gdbVersion":""}},"drawingInfo":{"renderer":{"type":"uniqueValue","field1":"SPECIES_COMMON_NAME","field2":null,"field3":null,"defaultSymbol":null,"defaultLabel":null,"uniqueValueInfos":[{"symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[93,44,112,255],"outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,0,0,0],"width":1}},"value":"Bighorn Sheep","label":"Bighorn Sheep","description":""},{"symbol":{"type":"esriSFS","style":"esriSFSSolid","color":[240,118,5,255],"outline":{"type":"esriSLS","style":"esriSLSSolid","color":[0,0,0,0],"width":1}},"value":"Thinhorn Sheep","label":"Thinhorn Sheep","description":""}],"fieldDelimiter":","},"transparency":40,"labelingInfo":null}}'
                dynamicLayer = JSON.parse(dynamicLayer)

                
                let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;

                var layer = L.esri.dynamicMapLayer( {
                    url:            url,
                    opacity:        0.65,
                    dynamicLayers:  dynamicLayer,
                    maxZoom:        100000,
                    minZoom:        0
    
                }).addTo(map);
                

                
                
                
                


                if ( !self.enabled ) return
        
                self.active = !self.active
                
                


            }


        } )

    } )

    return layerimportTool
} )
