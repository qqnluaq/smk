include.module( 'tool-layerimport', [ 'tool', 'widgets', 'tool-layerimport.panel-layerimport-html' ], function ( inc ) {
    "use strict";

    
    var arrayOfLayerNames
    var wmsService
    
    

    Vue.component( 'layerimport-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'layerimport-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-layerimport.panel-layerimport-html' ],
        props: [ 'content' ],
        data: function() {
            return {
                items: arrayOfLayerNames,
                service: wmsService,
                URL: ''
            }
          },
          methods: {
            // this handles a layer being selected and outputs all the features attached to that layer
            setLayerImport: function  ( event ) {
                
                console.log("The event is: ",event)
                console.log("The id is: ",event.srcElement.id)
                
                let layerName = event.srcElement.id
                let url = wmsService.slice(0, wmsService.indexOf("wms?")) 


                getFeaturesFromWMS( layerName, url)
                console.log(layerName)
                
        
            },
            // this handles a WMS URL being passed in and returns all the layers found at that URL
            fetchLayersFromURL: function ( event ) {
                console.log ("The url is", event.srcElement.id)
                wmsService = event.srcElement.id;
                wmsService = wmsService.slice(0, (wmsService.indexOf("?") + 1 )) 
                console.log("The url post slice is: ". wmsService)
                
                getLayersFromWMS ( wmsService )
                

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


    // Returns an array with all the Layer names in an array from an XML sources
    function getLayerNamesFromXML( xmlData ){
        console.log(xmlData)
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
                console.log(item.getElementsByTagName("Name")[0].childNodes[0].nodeValue);
                layerNames.push(item.getElementsByTagName("Name")[0].childNodes[0].nodeValue)
            }
            
        } );
        console.log(layerNames)
        return layerNames



    }

    //This needs to parse if the url is just the simple geo request or a layer name or whatever
    // intention is to pass a wmsURL and set our arrayOfLayerNames with all the possible layers at that wmsURL
    function getLayersFromWMS ( wmsURL) {

            wmsURL = wmsURL.trim() + "?service=WMS&request=GetCapabilities"
            
            

            //get capabilities request for when we don't know the layer they want specfically 
            //wmsService = 'https://openmaps.gov.bc.ca/geo/wms?service=WMS&request=GetCapabilities'
            
            fetch(wmsURL)
                .then(
                    function(response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                        return;
                    }

                    // Examine the text in the response
                    response.text().then(function(data) {
                        //console.log(data);
                        //console.log($.parseXML(data))
                        let parser = new DOMParser();
                        let xmlDoc = parser.parseFromString(data,"text/xml");
                        arrayOfLayerNames = getLayerNamesFromXML(xmlDoc)
                        
                    });
                    }
                )
                .catch(function(err) {
                    console.log('Fetch Error :-S', err);
                });




    }
    
    //gets a list of all the feature layers from a layer name and WMS returning all the features available to that layer, these can be display
    function getFeaturesFromWMS ( layerName, wmsURLService) {
        console.log('the url of the wms is:', wmsURLService )

        var url = ( wmsURLService + "wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=" + layerName  + "&outputformat=application%2Fjson")
        console.log('The url is', url)
        fetch(url)
                .then(
                    function(response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(function(data) {
                    console.log('data from the feature request is',data);
               
                    });
                    }
                )
                .catch(function(err) {
                    console.log('Fetch Error :-S', err);
                });


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
            
            

                //feature request, directly getting all the features based on a layer name, outputs in JSON!
                /*
                fetch('https://openmaps.gov.bc.ca/geo/pub/WHSE_FOREST_VEGETATION.PEST_INFESTATION_POLY/ows?service=WFS&request=GetFeature&typeNames=WHSE_FOREST_VEGETATION.PEST_INFESTATION_POLY&outputformat=application%2Fjson')
                .then(
                    function(response) {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(function(data) {
                    console.log(data);
               
                    });
                    }
                )
                .catch(function(err) {
                    console.log('Fetch Error :-S', err);
                });
                */

                    /*
                var nexrad = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
                    layers: 'nexrad-n0r-900913',
                    format: 'image/png',
                    transparent: true,
                    attribution: "Weather data © 2012 IEM Nexrad"
                }).addTo(map);
                */
                //console.log(smk)
                //console.log(smk.$tool)
            



               if ( !self.enabled ) return
        
               self.active = !self.active
            //var wmsLayer = L.tileLayer.wms( 'https://openmaps.gov.bc.ca/geo/pub/ows' ,{ layers: 'WHSE_FOREST_VEGETATION.PEST_INFESTATION_POLY' }).addTo(map);



            }


        } )

    } )

    return layerimportTool
} )
