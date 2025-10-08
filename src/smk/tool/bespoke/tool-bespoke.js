include.module( 'tool-bespoke', [ 
    'tool', 
    'tool-widget', 
    'tool-panel', 
    'tool-bespoke.panel-bespoke-html', 
    'vue-config' 
], function ( inc ) {
    "use strict";

    Vue.component( 'bespoke-widget', {
        extends: SMK.COMPONENT.ToolWidgetBase,
    } )

    Vue.component( 'bespoke-panel', {
        extends: SMK.COMPONENT.ToolPanelBase,
        template: inc[ 'tool-bespoke.panel-bespoke-html' ],
        props: [ 'content', 'component' ]
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return SMK.TYPE.Tool.define( 'BespokeTool', 
        function () {
            SMK.TYPE.ToolWidget.call( this, 'bespoke-widget' )
            SMK.TYPE.ToolPanel.call( this, 'bespoke-panel' )
        
            this.defineProp( 'content' )
            this.defineProp( 'component' )
        },
        function ( smk ) {
            var self = this
        
            smk.on( this.id, {
                'activate': function () {
                    if ( !self.enabled ) return
    
                    if ( SMK.HANDLER.has( self.id, 'triggered' ) ) {
                        self.active = false
                        SMK.HANDLER.get( self.id, 'triggered' )( smk, self )
                    }
                },
    
                'swipe-up': function ( ev ) {                
                    smk.$sidepanel.setExpand( 2 )
                },
    
                'swipe-down': function ( ev ) {
                    smk.$sidepanel.incrExpand( -1 )
                }
            } )
    
            if ( !this.component )
                this.content = { 
                    createContent: function ( el ) {
                        SMK.HANDLER.get( self.id, 'activated' )( smk, self, el )
                    }
                }
    
            this.changedActive( function () {
                if ( self.active ) {
                    if ( self.component )
                        SMK.HANDLER.get( self.id, 'activated' )( smk, self )
                }
                else {
                    SMK.HANDLER.get( self.id, 'deactivated' )( smk, self )
                }
            } )
    
            SMK.HANDLER.get( self.id, 'initialized' )( smk, self )    
        },
        {
            configure: function ( name, option ) {
                Object.assign( this, option )
        
                if ( this.instance ) {
                    this.id = name + '--' + this.instance
        
                    // if ( this.parentId && !this.parentId.includes( '--' ) )
                    //     this.parentId = this.parentId + '--' + this.instance
                }
                else {
                    this.id = name
                }
        
                return this
            }
        }
    )
} )
