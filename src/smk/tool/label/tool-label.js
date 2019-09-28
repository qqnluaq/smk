include.module( 'tool-label', [ 'tool', 'widgets', 'tool-label.panel-label-html' ], function ( inc ) {
    "use strict";

    
    var arrayOfDrawings
    
    Vue.component( 'label-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'label-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-label.panel-label-html' ],
        props: [ 'content' ],
        
        data: function() {
            return {
                items: arrayOfDrawings,
            }
          },
          methods: {
            setLabel: function  ( event ) {
                console.log("The event is: ",event)
                console.log("The id is: ",event.srcElement.id)
                console.log("The content is: ",event.srcElement.attributes.content.textContent)
                let id = event.srcElement.id
                let content = event.srcElement.attributes.content.textContent

                //need to check if a tooltip already exists as to update the Tooltip content rather than create it
                if (SMK.MAP[1].$viewer.map._layers[id].getTooltip() ){
                    SMK.MAP[1].$viewer.map._layers[id].setTooltipContent(content)
                } else {
                SMK.MAP[1].$viewer.map._layers[id].bindTooltip(content, {
                    permanent: true
                }).openTooltip();
                }
            },

            destroyLabel: function ( event ) {
                let id = event.srcElement.id
                SMK.MAP[1].$viewer.map._layers[id].closeTooltip()
                SMK.MAP[1].$viewer.map._layers[id].unbindTooltip()
            },

            showLabelTemp: function ( event ) {
                let id = event.srcElement.id
                // if there is an existing tooltip don't open a new one
                if (SMK.MAP[1].$viewer.map._layers[id].getTooltip() ){
                } else {
                    // if there isn't a tool tip this should be displayed so we know what layer we're working with.
                    SMK.MAP[1].$viewer.map._layers[id].bindTooltip("  Here. ").openTooltip();
                }
            },

            removeLabelTemp: function (event) {
                let id = event.srcElement.id
                let currentTooltip = SMK.MAP[1].$viewer.map._layers[id].getTooltip()
                //checking the tooltip string to see if it's the same one we just made by comparing exact text
                if ( currentTooltip._content == "  Here. ") {
                    SMK.MAP[1].$viewer.map._layers[id].closeTooltip()
                    SMK.MAP[1].$viewer.map._layers[id].unbindTooltip()
                }
            }

          }
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function labelTool( option ) {
        
        this.makePropWidget( 'icon', null ) //'help' )
        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            widgetComponent:'label-widget',
            panelComponent: 'label-panel',
            // title:          'label SMK',
            // position:       'menu'
            content:        null
            
        }, option ) )
    }

    function checkForContent ( obj) {
        let content = null
        if ( obj._tooltip ) {
            content = obj._tooltip._content;
        }
        return content;
    }

    function pushToArrayOfDrawings (smk, drawing, drawingType) {
        //checking for _content which would be there if a tooltip had occured
        let content = checkForContent( smk.$viewer.map._layers[drawing] );
        let drawingObj = { drawing: drawing, content: content, type: drawingType};
        return drawingObj
    }   

    function isGeoJSON( smk, layerID ){
        let match = false;
        if (typeof smk.$viewer.map._layers[layerID].options != "undefined" && typeof smk.$viewer.map._layers[layerID].options.originalGeoJSONType != "undefined"){
            if (typeof smk.$viewer.map._layers[layerID]._latlng != "undefined" || typeof smk.$viewer.map._layers[layerID]._latlngs != "undefined"){
                match = true;
            }
        }
        return match;
    }

    // with the original layer that has all the information, we want to open a tooltip attached to that, and close the tooltip at the layer opened by util.js
    function transferToolTips ( smk, layerID){
        let content;
        let geoType;
        if (typeof smk.$viewer.map._layers[layerID].feature != "undefined" && typeof smk.$viewer.map._layers[layerID].feature.properties != "undefined" && typeof smk.$viewer.map._layers[layerID].feature.properties.content != "undefined"){
            content = smk.$viewer.map._layers[layerID].feature.properties.content;
        } else if (typeof smk.$viewer.map._layers[layerID].feature != "undefined" && typeof smk.$viewer.map._layers[layerID].feature.geometry.properties != "undefined") {
            // part of a geometry collection, so content is nested differently
            content = smk.$viewer.map._layers[layerID].feature.geometry.properties.content;
        } else{
            // no content to add to tooltips, also means no content to close
            return;
        }
        for (let layerToRemove in smk.$viewer.map._layers){
            // the comparsion between layerToRemove and layerID is because the layer to remove is always a few layers higher, and we don't want to chance matching earlier content
            if( layerToRemove > layerID && typeof smk.$viewer.map._layers[layerToRemove]._tooltip != "undefined" 
            && smk.$viewer.map._layers[layerToRemove]._tooltip != null
            && typeof smk.$viewer.map._layers[layerToRemove]._tooltip._content != "undefined"
            && smk.$viewer.map._layers[layerToRemove]._tooltip._content == content){
                content = smk.$viewer.map._layers[layerToRemove]._tooltip._content;
                
                smk.$viewer.map._layers[layerToRemove].closeTooltip();
                smk.$viewer.map._layers[layerToRemove].unbindTooltip();

                smk.$viewer.map._layers[layerID].bindTooltip(content, {
                    permanent: true
                }).openTooltip();
                break;
            }
        }
    }


    SMK.TYPE.labelTool = labelTool

    $.extend( labelTool.prototype, SMK.TYPE.Tool.prototype )
    labelTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    labelTool.prototype.afterInitialize.push( function ( smk ) {
        
        var self = this;

        smk.on( this.id, {
            'activate': function () {
           
        arrayOfDrawings = []
       
         //Handles all the various layers on the map
         for (let layer in smk.$viewer.map._layers) {
            /// handle various GeoJSON Drawn Labels
            if(isGeoJSON(smk, layer)){
                // Now that we know it's geoJSON we can close the label created by util.js on geojson creation by finding matching values, then open a tooltip for the correct layer
                transferToolTips( smk, layer );
                arrayOfDrawings.push(pushToArrayOfDrawings(smk, layer, smk.$viewer.map._layers[layer].options.originalGeoJSONType));
            } else if (smk.$viewer.map._layers[layer]._mRadius && smk.$viewer.map._layers[layer]._latlng) {
                arrayOfDrawings.push(pushToArrayOfDrawings(smk, layer, "Circle"));
            // handle support for lines and polygons
            } else if (smk.$viewer.map._layers[layer]._latlngs && smk.$viewer.map._layers[layer]._path) {
                if ( smk.$viewer.map._layers[layer]._path.attributes[6].nodeValue == "none") {
                    arrayOfDrawings.push(pushToArrayOfDrawings(smk, layer, "Line"));
                } else {
                     //if nodeValue is not "none" then it's a polygon
                     arrayOfDrawings.push(pushToArrayOfDrawings(smk, layer, "Polygon"));
                }
                // handle exporting of markers
            } else if (smk.$viewer.map._layers[layer]._icon && smk.$viewer.map._layers[layer]._latlng && smk.$viewer.map._layers[layer]._shadow) {
                arrayOfDrawings.push(pushToArrayOfDrawings(smk, layer, "Marker"));
            }
        }

        if ( !self.enabled ) return
        
        self.active = !self.active
            }
        } )
    } )
    return labelTool
} )
