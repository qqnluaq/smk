include.module( 'tool-current-location', [ 
    'tool', 
    'tool-widget', 
    'tool-internal-layers',
    'tool-current-location.widget-current-location-html', 
], function ( inc ) {
    "use strict";

    Vue.component( 'current-location-widget', {
        extends: SMK.COMPONENT.ToolWidgetBase,
        template: inc[ 'tool-current-location.widget-current-location-html' ],
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return SMK.TYPE.Tool.define( 'CurrentLocationTool', {
        construct: function () {
            SMK.TYPE.ToolWidget.call( this, 'current-location-widget' )       
            SMK.TYPE.ToolInternalLayers.call( this )
        },

        initialize: function ( smk ) {
            var self = this
        
            smk.$viewer.displayContextInitialized.then( function () {
                self.setInternalLayerVisible( true )
            } )

            smk.on( this.id, {
                'trigger': function () {
                    self.clearInternalLayer( 'current-location' )
                    self.showStatusMessage( 'Locating...', 'progress', null )

                    smk.$viewer.getCurrentLocation().then( function ( location ) {
                        self.showStatusMessage( 'Current location found' )
                        // console.log( location )
                        smk.$viewer.setView( {
                            center: [ location.longitude, location.latitude ],
                            zoom: self.zoom
                        } )
                        
                        self.loadInternalLayer( 'current-location', turf.point( [ 
                            location.longitude, 
                            location.latitude 
                        ] ) )

                        self.currentLocation = location
                    } )
                    .catch( function () {
                        self.showStatusMessage( 'Unable to get location', 'warning' )
                    } )
                },               
            } )   

            smk.$viewer.changedView( function () {
                if ( self.currentLocation && smk.hasToolType( 'location' ) )
                    smk.$viewer.pickedLocation( {
                        map: self.currentLocation
                    } )

                self.currentLocation = null
            } )
        }
    } )
} )
