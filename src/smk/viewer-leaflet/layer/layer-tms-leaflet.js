include.module( 'layer-leaflet.layer-tms-leaflet-js', [ 'layer.layer-tms-js' ], function () {
    "use strict";

    function TmsLeafletLayer() {
        SMK.TYPE.Layer[ 'tms' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( TmsLeafletLayer.prototype, SMK.TYPE.Layer[ 'tms' ].prototype )

    SMK.TYPE.Layer[ 'tms' ][ 'leaflet' ] = TmsLeafletLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'tms' ][ 'leaflet' ].create = function ( layers, zIndex ) {
        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )
        var ly = layers[ 0 ]        
        
        var serviceUrl  = ly.config.serviceUrl
        var layerMixin = this.getTileLayerMixin( ly.id, ly.config.cache )

        var config = SMK.UTIL.clone( ly.config )
        delete config.serviceUrl 
        delete config.offline 

        var layer = new ( L.TileLayer.extend( {
            includes: layerMixin,

            getTileUrl: function (coords) {
                var data = {
                    r: L.Browser.retina ? '@2x' : '',
                    s: this._getSubdomain(coords),
                    x: coords.x,
                    y: coords.y,
                    z: coords.z || this._getZoomForUrl()
                }

                if (this._map && !this._map.options.crs.infinite) {
                    var invertedY = this._globalTileRange.max.y - coords.y;
                    if (this.options.tms) {
                        data['y'] = invertedY;
                    }
                    data['-y'] = invertedY;
                }
        
                return L.Util.template(this._url, L.Util.extend(data, this.options));
            }
        
        } ) )( serviceUrl, config )

        layer.on( 'load', function ( ev ) {
            ly.loading = false
        } )

        layer.on( 'loading', function ( ev ) {
            ly.loading = true
        } )

        return layer
    }

} )
