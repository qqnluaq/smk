include.module( 'tool-print',  [ 'tool', 'widgets', 'tool-print.panel-print-html', 'lprint'], function ( inc ) {
    "use strict";

    

    let pressed = false;

    Vue.component( 'print-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'print-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-print.panel-print-html' ],
        props: [ 'content' ],
        data: function() {
            return {
                modeToUse: L.control.browserPrint.mode.auto(), 
                printID: "Auto",
            }
          },
        methods: {

        print: function  ( event ) {

            this.printID = event.srcElement.id;

            switch(this.printID) {
                case "Auto":
                    this.modeToUse = L.control.browserPrint.mode.auto();
                    break;
                case "Landscape":
                    this.modeToUse = L.control.browserPrint.mode.landscape();
                    break;
                case "Portrait":
                    this.modeToUse = L.control.browserPrint.mode.portrait();
                    break;
                case "DefaultPrint":
                    preparePrint();
                    break;
                case "Custom":
                    this.modeToUse = L.control.browserPrint.mode.custom();
                    changeCursorToPrintSelector();
                    break;
                default:
                    console.log("These are buttons, do I really need a default case? May as well.");
              } 
        },

        printOK: function ( event ){

            let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;
            map.printControl.print(this.modeToUse);
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

    function printCheck(){
        let mainSmkElement = document.getElementById("smk-map-frame");
        let isElasticPanelExpanded = true;
        // making sure the element is closed so we can print
        let smkOverlayElements = mainSmkElement.getElementsByClassName("smk-overlay");
        for (let element in smkOverlayElements){
            if (!isNaN(element)){
                let toolBarElements = smkOverlayElements[element].getElementsByClassName("smk-sidepanel smk-expanded");
                if (toolBarElements.length == 0){
                    isElasticPanelExpanded = false;
                    break; 
                }
            }
        }
        if (!isElasticPanelExpanded){
            window.print();
        }
    }

    //prepare print prepares for a browser print by closing the print panel so it's not in the browser print
    function preparePrint(){
        
        let mainSmkElement = document.getElementById("smk-map-frame");

        // closing the expande element so it's not in the way for printing
        let smkOverlayElements = mainSmkElement.getElementsByClassName("smk-overlay");
        for (let element in smkOverlayElements){
            if (!isNaN(element)){
                let toolBarElements = smkOverlayElements[element].getElementsByClassName("smk-toolbar");
                   let classElements = toolBarElements[0].getElementsByClassName("smk-tool smk-tool smk-print-tool smk-tool-active smk-tool-enabled");
                   classElements[0].childNodes[0].click();
                   break;
            }
        }
        setTimeout(function(){
            printCheck();
        }, 500);
    }



    function changeCursorToPrintSelector(){

        let browserPrint = document.getElementsByClassName("leaflet-control-browser-print leaflet-bar leaflet-control");
        console.log(browserPrint);
        let customButtom =browserPrint[0].childNodes[5].childNodes[0];
        console.log(customButtom);
        customButtom.click()

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
                        L.control.browserPrint.mode.landscape("TABLOID VIEW", "Letter"),
                        "Portrait",
                        L.control.browserPrint.mode.auto("Automatic", "Letter"),
                        L.control.browserPrint.mode.custom("Select a Zone", "Letter")
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
