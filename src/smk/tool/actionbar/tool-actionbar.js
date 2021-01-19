include.module( 'tool-actionbar', [ 'tool', 'tool-actionbar.actionbar-html' ], function ( inc ) {
    "use strict";

    return SMK.TYPE.Tool.define( 'ActionBarTool',
        function () {
            this.model = {
                widgets: []
            }
        },
        function ( smk ) {
            this.vm = new Vue( {
                el: smk.addToOverlay( inc[ 'tool-actionbar.actionbar-html' ] ),
                data: this.model,
                methods: {
                    trigger: function ( toolId, event, arg, comp ) {
                        smk.emit( toolId, event, arg, comp )
                    }
                }
            } )   
        },
        {
            addTool: function ( tool, smk ) {
                var self = this
        
                if ( tool.makeWidgetComponent ) {
                    this.model.widgets.push( tool.makeWidgetComponent() )
                }
        
                smk.getSidepanel().addTool( tool, smk )
        
                return true
            }
        }
    )
} )
