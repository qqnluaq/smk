include.module( 'tool-reset-view', [ 
    'tool', 
    'tool-widget', 
    'tool-reset-view.widget-reset-view-html', 
], function ( inc ) {
    "use strict";

    Vue.component( 'reset-view-widget', {
        extends: SMK.COMPONENT.ToolWidgetBase,
        template: inc[ 'tool-reset-view.widget-reset-view-html' ],
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return SMK.TYPE.Tool.define( 'ResetViewTool', 
        function () {
            SMK.TYPE.ToolWidget.call( this, 'reset-view-widget' )       
        },
        function ( smk ) {
            var self = this
        
            smk.on( this.id, {
                'trigger': function () {
                    smk.$viewer.setView( smk.viewer.location )
                },               
            } )   
        }
    )
} )
