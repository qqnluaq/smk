include.module( 'tool-print',  [ 'tool', 'widgets', 'tool-print.panel-print-html', 'lprint' ], function ( inc ) {
    "use strict";

    

    let pressed = false;

    Vue.component( 'print-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'print-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-print.panel-print-html' ],
        props: [ 'content' ]
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function PrintTool( option ) {
        
        this.makePropWidget( 'icon', null ) //'help' )

        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            widgetComponent:'print-widget',
            panelComponent: 'print-panel',
            // title:          'Print SMK',
            // position:       'menu'
            content:        null
            
        }, option ) )

    }


 


    SMK.TYPE.PrintTool = PrintTool

    $.extend( PrintTool.prototype, SMK.TYPE.Tool.prototype )
    PrintTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    PrintTool.prototype.afterInitialize.push( function ( smk ) {

        
        smk.on( this.id, {
            'activate': function () {
            //window.print()
            
            console.log(pressed)
            if (pressed == false) {
                
            let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;
            L.control.browserPrint(
                {
                    title: 'Just print me!',
                }).addTo(map)
            L.control.browserPrint(
                {
                    title: 'Just print me!',
                }).addTo(map)

            pressed = true
            }
            console.log(pressed)
            
           
 


                

            }
        } )

    } )

    return PrintTool
} )
