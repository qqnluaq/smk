include.module( 'tool-help',  [ 'tool', 'widgets', 'tool-help.panel-help-html'], function ( inc ) {
    "use strict";

    

    let pressed = false;

    Vue.component( 'help-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'help-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-help.panel-help-html' ],
        props: [ 'content' ],
        data: function() {
            return {
                toolbar: SMK.MAP[1].$toolbar.model.tools,
                defaultTools: [ "about", "baseMaps", "coordinate", "directions", "identify",  "layers", "location", "markup", "measure", "menu", "minimap","pan", "scale", "search", "version","zoom", "print", "sessionimport", "sessionexport", "label", "layerimport", "help"],
                customTools: ["query--pub:WHSE_FOREST_VEGETATION.PEST_INFESTATION_POLY-QUERY_LYR--search-infestations"]
            }
          },
        methods: {

        help: function  ( event ) {

           console.log("hello this is help!")
 
        }

        }
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function helpTool( option ) {
        
        this.makePropWidget( 'icon', null ) //'help' )

        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            widgetComponent:'help-widget',
            panelComponent: 'help-panel',
            // title:          'help SMK',
            // position:       'menu'
            content:        null
            
        }, option ) )

    }






    SMK.TYPE.helpTool = helpTool

    $.extend( helpTool.prototype, SMK.TYPE.Tool.prototype )
    helpTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    helpTool.prototype.afterInitialize.push( function ( smk ) {
        var self = this
        
        smk.on( this.id, {
            'activate': function () {





            if ( !self.enabled ) return
        
            self.active = !self.active

            }
        } )

    } )

    return helpTool
} )
