include.module( 'tool-select-lasso.tool-select-lasso-list-js', [
    'tool',
    'tool-widget',
    'tool-feature-list',
    'tool-internal-layers',
    'component-feature-list',
    'component-command-button',
    'tool-select-lasso.panel-select-lasso-html'
], function ( inc ) {
    "use strict";

    Vue.component( 'select-lasso-widget', {
        extends: SMK.COMPONENT.ToolWidgetBase,
    } )

    Vue.component( 'select-lasso-panel', {
        extends: SMK.COMPONENT.ToolPanelBase,
        template: inc[ 'tool-select-lasso.panel-select-lasso-html' ],
        props: [ 'layers', 'highlightId', 'command' ],
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return SMK.TYPE.Tool.define( 'SelectLassoListTool',
        function () {
            SMK.TYPE.ToolWidget.call( this, 'select-lasso-widget' )
            SMK.TYPE.ToolPanel.call( this, 'select-lasso-panel' )
            SMK.TYPE.ToolInternalLayers.call( this )
            SMK.TYPE.ToolFeatureList.call( this, function ( smk ) { return smk.$viewer.selected } )

            this.defineProp( 'command' )
        },
        function ( smk ) {
            var self = this

            self.showStatusMessage( 'Click on map to identify features and then add them to the selection.' )

            self.changedActive( function () {
                if ( self.active ) {
                    // console.log('active')
                    smk.$viewer.selected.pick()
                }
                else {
                    // console.log('inactive')
                }
            } )

            smk.on( this.id, {
                'clear': function ( ev ) {
                    self.showStatusMessage( 'Click on map to identify features and then add them to the selection.' )
                }
            } )

            self.featureSet
                .addedFeatures( updateMessage )
                .removedFeatures( updateMessage )

            function updateMessage() {

                var stat = smk.$viewer.selected.getStats()

                if ( stat.featureCount == 0 ) {
                    self.showStatusMessage()
                    return
                }

                var sub = ''
                // if ( stat.vertexCount > stat.featureCount )
                    // sub = '<div class="smk-submessage">' + SMK.UTIL.grammaticalNumber( stat.vertexCount, null, null, 'with {} vertices' ) + '</div>'

                self.showStatusMessage( '<div>Selection contains ' + SMK.UTIL.grammaticalNumber( stat.featureCount, null, 'a feature', '{} features' ) + '</div>' + sub )
            }

            setTimeout( function() {
                self.setInternalLayerVisible( true )
            }, 1000 )

        }
    )

    // return SelectTool
} )
