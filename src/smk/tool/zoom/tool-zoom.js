include.module( 'tool-zoom', [ 
    'tool', 
    'tool-widget', 
    'tool-zoom.widget-zoom-html', 
], function ( inc ) {
    "use strict";

    Vue.component( 'zoom-widget', {
        extends: SMK.COMPONENT.ToolWidgetBase,
        template: inc[ 'tool-zoom.widget-zoom-html' ],
        props: [ 'control' ]
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return SMK.TYPE.Tool.define( 'ZoomTool', {
        construct: function () {
            SMK.TYPE.ToolWidget.call( this, 'zoom-widget' )       

            this.defineProp( 'control' )
        },

        initialize: function ( smk ) {
            var self = this
        
            // smk.on( this.id, {
            //     'trigger-zoom-in': function () {
            //         console.log('trigger-zoom-in')
            //     },               
            //     'trigger-zoom-out': function () {
            //         console.log('trigger-zoom-out')
            //     },               
            // } )   
        }
    } )
} )
