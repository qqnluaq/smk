include.module( 'tool-pan', [ 
    'tool', 
    'tool-widget', 
    'tool-pan.widget-pan-html', 
], function ( inc ) {
    "use strict";

    Vue.component( 'pan-widget', {
        extends: SMK.COMPONENT.ToolWidgetBase,
        template: inc[ 'tool-pan.widget-pan-html' ],
        props: [ 'control', 'navMode', 'compassStyle' ],
        computed: {
            navModePanClasses: function () {
                var c = Object.assign( {}, this.classes )
                c[ 'smk-tool-active' ] = this.navMode == 'pan'
                return c
            },
            navModeRotateClasses: function () {
                var c = Object.assign( {}, this.classes )
                c[ 'smk-tool-active' ] = this.navMode == 'rotate'
                return c
            }
        }
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return SMK.TYPE.Tool.define( 'PanTool', {
        construct: function () {
            SMK.TYPE.ToolWidget.call( this, 'pan-widget' )       

            this.defineProp( 'control' )
            this.defineProp( 'navMode' )
            this.defineProp( 'compassStyle' )

            this.navMode = 'pan'
        },

        initialize: function ( smk ) {
            var self = this
        
            // smk.on( this.id, {
            //     'trigger-compass': function () {
            //         console.log('trigger-compass')
            //     },               
            //     'trigger-nav-mode-pan': function () {
            //         console.log('trigger-nav-mode-pan')
            //     },               
            //     'trigger-nav-mode-rotate': function () {
            //         console.log('trigger-nav-mode-rotate')
            //     },               
            // } )   
        }
    } )
} )
