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
                defaultTools: [ "about", "baseMaps", "coordinate", "directions", "identify",  "layers", "location", "markup", "measure", "menu", "minimap","pan", "scale", "search", "version","zoom", "print", "sessionimport", "sessionexport", "label", "layerimport", "help", "mapimageexport"],
                customTools: ["query--pub:WHSE_FOREST_VEGETATION.PEST_INFESTATION_POLY-QUERY_LYR--search-infestations"],
                defaultToolWikiLinks: {
                    "about": [true, "https://github.com/CEBergin/smk-client/wiki/USER---About-Tool"],
                    "baseMaps": [true, "https://github.com/CEBergin/smk-client/wiki/USER---Base-Maps"],
                    "coordinate": [false, "No Wiki Link"],
                    "directions": [false,"No Longer Supported"],
                    "identify":[true,  "https://github.com/CEBergin/smk-client/wiki/USER---Identify-Tool"],
                    "layers": [true, "https://github.com/CEBergin/smk-client/wiki/USER---Layers"],
                    "location": [true, "https://github.com/CEBergin/smk-client/wiki/USER---Search-For-Location"] ,
                    "markup": [true, "https://github.com/CEBergin/smk-client/wiki/USER---Drawing-Tools"],
                    "measure":[true, "https://github.com/CEBergin/smk-client/wiki/USER---Measurement-Tool"],
                    "menu": [true, "https://github.com/CEBergin/smk-client/wiki/USER---Overall-SMK-Functionality"],
                    "minimap": [false,"It's in the bottom right hand corner. It's a mini-map."],
                    "pan": [false,"No Wiki Link"],
                    "scale": [false,"No Wiki Link"],
                    "search": [true, "https://github.com/CEBergin/smk-client/wiki/USER---Search-For-Location"],
                    "version": [false,"No Wiki Link"],
                    "zoom": [false,"No Wiki Link"],
                    "print": [true, "https://github.com/CEBergin/smk-client/wiki/USER---Print-Functionality"],
                    "sessionimport":[true, "https://github.com/CEBergin/smk-client/wiki/USER---Session-Import-&-Session-Export"],
                    "sessionexport":[true, "https://github.com/CEBergin/smk-client/wiki/USER---Session-Import-&-Session-Export"],
                    "label":[true, "https://github.com/CEBergin/smk-client/wiki/USER-Label"],
                    "layerimport": [true, "https://github.com/CEBergin/smk-client/wiki/USER---Layer-Import"],
                    "help": [false, "Wait, if you don't know how this works, how did you get here?"],
                    "mapimageexport": [true, "https://github.com/CEBergin/smk-client/wiki/USER---Map-Image-Export"]

                }




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
