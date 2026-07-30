include.module( 'layer.layer-vector-tile-js', [ 'layer.layer-js' ], function () {
    "use strict";

    function VectorTileLayer() {
        SMK.TYPE.Layer.prototype.constructor.apply( this, arguments )
    }

    $.extend( VectorTileLayer.prototype, SMK.TYPE.Layer.prototype )

    SMK.TYPE.Layer[ 'vector-tile' ] = VectorTileLayer
} )
