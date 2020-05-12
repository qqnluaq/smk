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

        var opt = {
            url:            ly.config.serviceUrl,
            nativeZooms:    ly.config.zoomLevels
        }

        if ( ly.config.zoomMin ) 
            if ( ly.config.zoomMinVisibleBelow )
                opt.minNativeZoom = ly.config.zoomMin
            else
                opt.minZoom = ly.config.zoomMin

        if ( ly.config.zoomMax )
            if ( ly.config.zoomMaxVisibleAbove )
                opt.maxNativeZoom = ly.config.zoomMax
            else
                opt.maxZoom = ly.config.zoomMax

        var layerMixin = this.getTileLayerMixin( ly.id, ly.config.cache )

        var layer = new ( L.esri.TiledMapLayer.extend( { includes: layerMixin } ) )( opt )
        
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
