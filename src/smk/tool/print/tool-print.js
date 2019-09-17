include.module( 'tool-print',  [ 'tool', 'widgets', 'tool-print.panel-print-html', 'lprint' ], function ( inc ) {
    "use strict";

    

    let pressed = false;

    Vue.component( 'print-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'print-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-print.panel-print-html' ],
        props: [ 'content' ],
        methods: {

        Print: function  ( event ) {

            let id = event.srcElement.id;
            let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;
            let modeToUse;
           
            switch(id) {
                case "auto":
                    modeToUse = L.control.browserPrint.mode.auto();
                    map.printControl.print(modeToUse);
                    break;
                case "landscape":
                    modeToUse = L.control.browserPrint.mode.landscape();
                    map.printControl.print(modeToUse);
                    break;
                case "portrait":
                    modeToUse = L.control.browserPrint.mode.portrait();
                    map.printControl.print(modeToUse);
                    break;
                case "defaultPrint":
                    window.print();
                    break;
                default:
                    console.log("These are buttons, do I really need a default case? May as well.");
              } 

            
            

        }

        }
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
        var self = this
        
        smk.on( this.id, {
            'activate': function () {
            
            
            
            
            if (pressed == false) {
                
            let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;

            
            
            L.control.browserPrint(
                {
                    title: 'Forest Health',
                    closePopupsOnPrint: false,
                    printModes: [
                        L.control.browserPrint.mode.landscape("TABLOID VIEW", "tabloid"),
                        "Portrait",
                        L.control.browserPrint.mode.auto("Automatico", "B4"),
                        L.control.browserPrint.mode.custom("Séléctionnez la zone", "B5")
                    ],
                    manualMode: false
                }).addTo(map);

            pressed = true
            }
           
 
            if ( !self.enabled ) return
        
            self.active = !self.active
            }
        } )

    } )

    return PrintTool
} )
