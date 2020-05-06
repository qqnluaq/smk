include.module( 'layer-leaflet.layer-esri-tiled-leaflet-js', [ 'layer.layer-esri-tiled-js' ], function () {
    "use strict";

    function EsriTiledLeafletLayer() {
        SMK.TYPE.Layer[ 'esri-tiled' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( EsriTiledLeafletLayer.prototype, SMK.TYPE.Layer[ 'esri-tiled' ].prototype )

    SMK.TYPE.Layer[ 'esri-tiled' ][ 'leaflet' ] = EsriTiledLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'esri-tiled' ][ 'leaflet' ].create = function ( layers, zIndex ) {
        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )
        var ly = layers[ 0 ]        

        var serviceUrl  = ly.config.serviceUrl
        var layerMixin = this.getTileLayerMixin( ly.id, ly.config.cache )
        // var opacity     = ly.config.opacity

        var minZoom
        if ( ly.config.minScale )
            minZoom = this.getZoomBracketForScale( ly.config.minScale )[ 1 ]

        var maxZoom
        if ( ly.config.maxScale )
            maxZoom = this.getZoomBracketForScale( ly.config.maxScale )[ 1 ]

        var layer = new ( L.esri.TiledMapLayer.extend( {
            includes: layerMixin
        } ) )( { url: serviceUrl } )
    
        // var layer = L.esri.tiledMapLayer({
        // var layer = new TileLayerEsriOffline({
        //     url: serviceUrl,
        //     nativeZooms: [ 5, 7, 9, 11, 13 ]
        // } );
        
        layer.on( 'load', function ( ev ) {
            if ( layer._currentImage )
                layer._currentImage.setZIndex( zIndex )

            ly.loading = false
        } )

        layer.on( 'loading', function ( ev ) {
            ly.loading = true
        } )

        return layer
    }
} )
