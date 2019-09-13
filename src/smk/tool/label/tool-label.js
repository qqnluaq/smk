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
                    console.log("Already an open tool tip")
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
                    console.log("Already an open tool tip")
                } else {
                    // if there isn't a tool tip this should be displayed so we know what layer we're working with.
                    SMK.MAP[1].$viewer.map._layers[id].bindTooltip("  Here. ").openTooltip();
                }
            },

            removeLabelTemp: function (event) {
                let id = event.srcElement.id
                let currentTooltip = SMK.MAP[1].$viewer.map._layers[id].getTooltip()
                console.log(currentTooltip._content)
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
       
         console.log(smk.$viewer.map.pm)
         //Handles all the various drawn objects on the map
         for (let drawing in smk.$viewer.map._layers) {
            if (smk.$viewer.map._layers[drawing]._mRadius && smk.$viewer.map._layers[drawing]._latlng) {

                arrayOfDrawings.push(pushToArrayOfDrawings(smk, drawing, "Circle"));
                
            // handle support for lines and polygons
            } else if (smk.$viewer.map._layers[drawing]._latlngs && smk.$viewer.map._layers[drawing]._path) {
                if ( smk.$viewer.map._layers[drawing]._path.attributes[6].nodeValue == "none") {
                    
                    
                    arrayOfDrawings.push(pushToArrayOfDrawings(smk, drawing, "Line"));

                } else {
                     //if nodeValue is not "none" then it's a polygon
                     arrayOfDrawings.push(pushToArrayOfDrawings(smk, drawing, "Polygon"));
                }
              
                // handle exporting of markers
            } else if (smk.$viewer.map._layers[drawing]._icon && smk.$viewer.map._layers[drawing]._latlng && smk.$viewer.map._layers[drawing]._shadow) {
                
                arrayOfDrawings.push(pushToArrayOfDrawings(smk, drawing, "Marker"));
                
            }
        }

        if ( !self.enabled ) return
        
        self.active = !self.active

            }
        } )

    } )

    return labelTool
} )
