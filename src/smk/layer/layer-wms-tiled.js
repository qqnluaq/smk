include.module( 'layer.layer-wms-tiled-js', [ 'layer.layer-js' ], function () {
    "use strict";

    function WmsTiledLayer() {
        SMK.TYPE.Layer.prototype.constructor.apply( this, arguments )
    }

    $.extend( WmsTiledLayer.prototype, SMK.TYPE.Layer.prototype )

    SMK.TYPE.Layer[ 'wms-tiled' ] = WmsTiledLayer
} )
