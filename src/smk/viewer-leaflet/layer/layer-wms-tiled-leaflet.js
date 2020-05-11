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

        var opt = {
            layers:         ly.config.layerName,
            styles:         ly.config.styleName,
            version:        ly.config.version || '1.1.1',
            attribution:    ly.config.attribution,
            opacity:        ly.config.opacity,
            cql_filter:     ly.config.where || 'include',
            nativeZooms:    ly.config.zoomLevels,
            format:         'image/png',
            transparent:    true,
            zIndex:         zIndex
        }

        if ( !opt.styles ) delete opt.styles

        var serviceUrl  = ly.config.serviceUrl

        var layerMixin  = this.getTileLayerMixin( ly.id, ly.config.cache )

        var layer = new ( L.TileLayer.WMS.extend( { includes: layerMixin } ) )( serviceUrl, opt )

        layer.on( 'load', function ( ev ) {
            ly.loading = false
        } )

        layer.on( 'loading', function ( ev ) {
            ly.loading = true
        } )

        return layer
    }
} )
