include.module( 'tool-markup-leaflet', [ 'leaflet', 'tool-markup' ], function () {
    "use strict";

    SMK.TYPE.MarkupTool.addInitializer( function ( smk ) {
        var self = this

        this.changedActive( function () {
            if ( self.active ) {
                self.removeMarkup()

                smk.$viewer.map.on( 'pm:create', function( ev ) {
                    // console.log('pm:create',ev)
                    self.prevLayer = ev.layer
                    self.active = false
                    SMK.HANDLER.get( self.id, 'markup-created' )( smk, self, ev.layer.toGeoJSON() )
                } )

                smk.$viewer.map.pm.enableDraw( self.drawMode )
            }
            else {
                smk.$viewer.map.pm.disableDraw()
                smk.$viewer.map.off( 'pm:create' )
            }
        } )

        this.removeMarkup = function () {
            if ( self.prevLayer ) {
                self.prevLayer.remove()
                self.prevLayer = null
            }
        }

    } )
} )
