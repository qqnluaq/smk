include.module( 'layer-leaflet.layer-tiled-leaflet-js', [ 'layer.layer-tiled-js' ], function () {
    "use strict";

    function TiledLeafletLayer() {
        SMK.TYPE.Layer[ 'tiled' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( TiledLeafletLayer.prototype, SMK.TYPE.Layer[ 'tiled' ].prototype )

    SMK.TYPE.Layer[ 'tiled' ][ 'leaflet' ] = TiledLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'tiled' ][ 'leaflet' ].create = function ( layers, zIndex ) {
        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )

        var ly = layers[ 0 ]        
        var serviceUrl  = ly.config.serviceUrl
        var offline  = ly.config.offline

        var config = SMK.UTIL.clone( ly.config )
        delete config.serviceUrl 
        delete config.offline 

        var layer = offline ? L.tileLayer.offline( serviceUrl, config ) : L.tileLayer( serviceUrl, config )

        layer.on( 'load', function ( ev ) {
            layers.forEach( function ( ly ) {
                ly.loading = false
            } )
        } )

        layer.on( 'loading', function ( ev ) {
            layers.forEach( function ( ly ) {
                ly.loading = true
            } )
        } )

        return layer
    }

} )
