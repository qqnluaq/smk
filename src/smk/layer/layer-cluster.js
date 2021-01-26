include.module( 'layer.layer-cluster-js', [ 'layer.layer-js' ], function () {
    "use strict";

    function ClusterLayer() {
        SMK.TYPE.Layer.prototype.constructor.apply( this, arguments )

        this.config.isQueryable = false
    }

    $.extend( ClusterLayer.prototype, SMK.TYPE.Layer.prototype )

    SMK.TYPE.Layer[ 'cluster' ] = ClusterLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
} )
