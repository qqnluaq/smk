include.module( 'tool-bookmarks', [
    'tool',
    'tool-widget',
    'tool-panel',
    'viewer',
    'leaflet',
    'tool-bookmarks.panel-bookmarks-html'
], function ( inc ) {
    "use strict";

    Vue.component( 'bookmarks-widget', {
        extends: SMK.COMPONENT.ToolWidgetBase,
    } )

    Vue.component( 'bookmarks-panel', {
        extends: SMK.COMPONENT.ToolPanelBase,
        template: inc[ 'tool-bookmarks.panel-bookmarks-html' ],
        props: [ 'bookmarks' ]
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return SMK.TYPE.Tool.define( 'BookmarksTool',
        function () {
            SMK.TYPE.ToolWidget.call( this, 'bookmarks-widget' )
            SMK.TYPE.ToolPanel.call( this, 'bookmarks-panel' )

            this.defineProp( 'bookmarks' )
        },
        function ( smk ) {
            var self = this

            smk.on( this.id, {
                'activate': function () {
                    if ( !self.enabled ) return
                },

                'show-bookmark': function ( ev ) {
                    smk.$viewer.setView( ev )
                }
            } )
        }
    )
} )
