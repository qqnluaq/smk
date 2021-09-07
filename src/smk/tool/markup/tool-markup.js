include.module( 'tool-markup', [ 
    'tool',
    'tool-widget'
], function ( inc ) {
    "use strict";

    Vue.component( 'markup-widget', {
        extends: SMK.COMPONENT.ToolWidgetBase,
    } )

    return SMK.TYPE.Tool.define( 'MarkupTool', 
        function () {
            SMK.TYPE.ToolWidget.call( this, 'markup-widget' )
        
            this.defineProp( 'drawMode' )
        },
        function ( smk ) {
            var self = this
        
            smk.on( this.id, {
                'activate': function () {
                    if ( !self.enabled ) return
                },
            } )

            this.changedActive( function () {
                if ( self.active ) {
                    SMK.HANDLER.get( self.id, 'activated' )( smk, self )                    
                }
                else {
                    SMK.HANDLER.get( self.id, 'deactivated' )( smk, self )
                }
            } )

            SMK.HANDLER.get( self.id, 'initialized' )( smk, self )    
        }
    )
} )
