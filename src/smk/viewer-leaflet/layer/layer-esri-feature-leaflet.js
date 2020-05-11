include.module( 'layer-leaflet.layer-esri-feature-leaflet-js', [ 'layer.layer-esri-feature-js' ], function () {
    "use strict";

    function EsriFeatureLeafletLayer() {
        SMK.TYPE.Layer[ 'esri-feature' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( EsriFeatureLeafletLayer.prototype, SMK.TYPE.Layer[ 'esri-feature' ].prototype )

    SMK.TYPE.Layer[ 'esri-feature' ][ 'leaflet' ] = EsriFeatureLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'esri-feature' ][ 'leaflet' ].create = function ( layers, zIndex ) {
        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )
        var ly = layers[ 0 ]

        var opt = {
            url: ly.config.serviceUrl
        }

        if ( ly.config.zoomMin ) {
            opt.minZoom = ly.config.zoomMin
            // if ( ly.config.zoomMinVisibleBelow )
            //     opt.minNativeZoom = ly.config.zoomMin
        }

        if ( ly.config.zoomMax ) {
            opt.maxZoom = ly.config.zoomMax
            // if ( ly.config.zoomMaxVisibleAbove )
            //     opt.maxNativeZoom = ly.config.zoomMax
        }

        if ( ly.config.where )
            opt.where = ly.config.where

        if ( ly.config.drawingInfo ) {
            opt.drawingInfo = ly.config.drawingInfo
            if ( opt.drawingInfo.renderer && opt.drawingInfo.renderer.symbol && opt.drawingInfo.renderer.symbol.url )
                // opt.drawingInfo.renderer.symbol.url = this.resolveUrl( opt.drawingInfo.renderer.symbol.url )
                opt.drawingInfo.renderer.symbol.url = ( new URL( opt.drawingInfo.renderer.symbol.url, document.location ) ).toString()
        }
        
        var layer = L.esri.featureLayer( opt )
        
        if ( ly.legendCacheResolve ) {
            layer.legend( function ( err, leg ) {
                ly.legendCacheResolve( err ? null : leg.layers[ 0 ].legend )
                ly.legendCacheResolve = null
            } )
        }

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
