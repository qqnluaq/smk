include.module( 'tool-identify-esri3d', [ 
    'esri3d', 
    'types-esri3d', 
    'util-esri3d', 
    'tool-identify', 
    'tool-esri3d',
    // 'tool-esri3d.tool-feature-list-esri3d-js'
], function ( inc ) {
    "use strict";

    var E = SMK.TYPE.Esri3d

    SMK.TYPE.IdentifyListTool.prototype.styleFeature = function ( override ) {
        return Object.assign( {
            strokeColor:    'black',
            strokeWidth:    8,
            strokeOpacity:  0.8,
            fillColor:      'white',
            fillOpacity:    0.5,
        }, this.style, override )
    }

    SMK.TYPE.IdentifyListTool.addInitializer( function ( smk ) {
        var self = this

        // inc[ 'tool-esri3d.tool-feature-list-esri3d-js' ].call( this, smk )

        smk.$viewer.handlePick( 3, function ( location ) {
            if ( !self.active ) return

            return smk.$viewer.view.hitTest( location.screen )
                .then( function ( hit ) {
                    if ( hit.results.length == 0 ) return
                    if ( !hit.results[ 0 ].graphic ) return
                    if ( !hit.results[ 0 ].graphic.attributes.$identifyMarker ) return

                    smk.$viewer.identified.pick( self.firstId )
                    return true
                } )
        } )

    } )

} )
