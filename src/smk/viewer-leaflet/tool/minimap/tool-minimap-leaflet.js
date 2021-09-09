include.module( 'tool-minimap-leaflet', [ 'leaflet', 'tool-minimap' ], function () {
    "use strict";

    SMK.TYPE.MinimapTool.addInitializer( function ( smk ) {
        if ( smk.$device == 'mobile' ) return

        smk.addToStatus( $( '<div class="smk-spacer">' ).height( 170 ).get( 0 ) )

        var ly = smk.$viewer.createBasemapLayer( this.baseMap || "Topographic" );

        ( new L.Control.MiniMap( ly[ 0 ], Object.assign( { toggleDisplay: true }, this.option ) ) )
            .addTo( smk.$viewer.map );
    } )

} )
