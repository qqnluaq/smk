include.module( 'layer-esri3d.layer-vector-tile-esri3d-js', [ 'layer.layer-vector-tile-js', 'types-esri3d', 'util-esri3d', 'turf' ], function () {
    "use strict";

    var E = SMK.TYPE.Esri3d
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function VectorTileEsri3dLayer() {
        SMK.TYPE.Layer[ 'vector-tile' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( VectorTileEsri3dLayer.prototype, SMK.TYPE.Layer[ 'vector-tile' ].prototype )

    SMK.TYPE.Layer[ 'vector-tile' ][ 'esri3d' ] = VectorTileEsri3dLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    VectorTileEsri3dLayer.prototype.canAddToMap = function () {
        return this.config.isOnMap !== false
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'vector-tile' ][ 'esri3d' ].create = function ( layers, zIndex ) {
        var self = this;

        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )
            
        return new E.layers.VectorTileLayer( { portalItem: { id: layers[ 0 ].config.itemId } } )   
    }
} )
