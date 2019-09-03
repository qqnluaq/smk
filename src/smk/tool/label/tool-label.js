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
                SMK.MAP[1].$viewer.map._layers[id].bindTooltip(content).openTooltip();
        
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
            content = obj._tooltip._content
        }
        return content
    }

    


    SMK.TYPE.labelTool = labelTool

    $.extend( labelTool.prototype, SMK.TYPE.Tool.prototype )
    labelTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    labelTool.prototype.afterInitialize.push( function ( smk ) {
        
        var self = this

        smk.on( this.id, {
            'activate': function () {
           
            
        arrayOfDrawings = []

        
                    
                        
               
            
            
            

         /////////////////////////////////////////////////////////////////// TEST TEST TEST////////////////////////////////
         console.log(smk.$viewer.map.pm)
         for (let drawing in smk.$viewer.map._layers) {
            if (smk.$viewer.map._layers[drawing]._mRadius && smk.$viewer.map._layers[drawing]._latlng) {
                
                //checking for _content which would be there if a tooltip had occured
                let content = checkForContent( smk.$viewer.map._layers[drawing] )
                
                
                console.log(drawing)
                let drawingObj = { drawing: drawing, content: content, type: "Circle"}
                arrayOfDrawings.push(drawingObj)
                console.log(smk.$viewer.map._layers[drawing])
                
            // handle support for lines and polygons
            } else if (smk.$viewer.map._layers[drawing]._latlngs && smk.$viewer.map._layers[drawing]._path) {
                if ( smk.$viewer.map._layers[drawing]._path.attributes[6].nodeValue == "none") {
                    
                    //checking for _content which would be there if a tooltip had occured
                    let content = checkForContent( smk.$viewer.map._layers[drawing] )
                        
                    
                    console.log(drawing)
                    let drawingObj = { drawing: drawing, content: content, type: "Line"}
                    arrayOfDrawings.push(drawingObj)
                    console.log(smk.$viewer.map._layers[drawing])
                } else { //if nodeValue is not "none" then it's a polygon
                    
                    //checking for _content which would be there if a tooltip had occured
                    let content = checkForContent( smk.$viewer.map._layers[drawing] )
                    
                    
                    console.log(drawing)
                    let drawingObj = { drawing: drawing, content: content, type: "Polygon"}
                    arrayOfDrawings.push(drawingObj)
                    console.log(smk.$viewer.map._layers[drawing])
                }
              
                // handle exporting of markers
            } else if (smk.$viewer.map._layers[drawing]._icon && smk.$viewer.map._layers[drawing]._latlng && smk.$viewer.map._layers[drawing]._shadow) {
                
                //checking for _content which would be there if a tooltip had occured
                let content = checkForContent( smk.$viewer.map._layers[drawing] )
                console.log(drawing)
                let drawingObj = { drawing: drawing, content: content, type: "Marker"}
                arrayOfDrawings.push(drawingObj)
                console.log(smk.$viewer.map._layers[drawing])
                
            }
        }


        if ( !self.enabled ) return
        
        self.active = !self.active

































            }
        } )

    } )

    return labelTool
} )
