include.module( 'layer-leaflet.layer-wms-tiled-leaflet-js', [ 'layer.layer-wms-tiled-js' ], function () {
    "use strict";

    function WmsTiledLeafletLayer() {
        SMK.TYPE.Layer[ 'wms-tiled' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( WmsTiledLeafletLayer.prototype, SMK.TYPE.Layer[ 'wms-tiled' ].prototype )

    SMK.TYPE.Layer[ 'wms-tiled' ][ 'leaflet' ] = WmsTiledLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'wms-tiled' ][ 'leaflet' ].create = function ( layers, zIndex ) {
        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )
        var ly = layers[ 0 ]        

        var serviceUrl  = ly.config.serviceUrl
        var layerMixin = this.getTileLayerMixin( ly.id, ly.config.cache )
        // var offline  = ly.config.offline

        var config = SMK.UTIL.clone( ly.config )
        delete config.serviceUrl 
        delete config.cache
        config.format = 'image/png'
        config.transparent = true

        var layer = new ( L.TileLayer.WMS.extend( {
            includes: layerMixin
        } ) )( serviceUrl, config )

        // var layer = offline ? L.tileLayer.offline( serviceUrl, config ) : new TileLayerWMSOffline( serviceUrl, config )

        layer.on( 'load', function ( ev ) {
            ly.loading = false
        } )

        layer.on( 'loading', function ( ev ) {
            ly.loading = true
        } )

        return layer
    }
} )
