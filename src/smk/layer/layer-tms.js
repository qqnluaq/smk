include.module( 'layer.layer-tms-js', [ 'layer.layer-js' ], function () {
    "use strict";

    function TmsLayer() {
        SMK.TYPE.Layer.prototype.constructor.apply( this, arguments )
    }

    $.extend( TmsLayer.prototype, SMK.TYPE.Layer.prototype )

    SMK.TYPE.Layer[ 'tms' ] = TmsLayer
} )
