include.module( 'layer-image', [ 'layer' ], function () {
    "use strict";

    function ImageLayer() {
        SMK.TYPE.Layer.prototype.constructor.apply( this, arguments )
    }

    $.extend( ImageLayer.prototype, SMK.TYPE.Layer.prototype )

    SMK.TYPE.Layer[ 'image' ] = ImageLayer
} )
