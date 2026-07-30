include.module( 'layer-esri3d.layer-tile-esri3d-js', [ 'layer.layer-esri-tiled-js', 'types-esri3d', 'util-esri3d', 'turf' ], function () {
    "use strict";

    var E = SMK.TYPE.Esri3d
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function TileEsri3dLayer() {
        SMK.TYPE.Layer[ 'esri-tiled' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( TileEsri3dLayer.prototype, SMK.TYPE.Layer[ 'esri-tiled' ].prototype )

    SMK.TYPE.Layer[ 'esri-tiled' ][ 'esri3d' ] = TileEsri3dLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    TileEsri3dLayer.prototype.canAddToMap = function () {
        return this.config.isOnMap !== false
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'esri-tiled' ][ 'esri3d' ].create = function ( layers, zIndex ) {
        var self = this;

        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )
            
        return new E.layers.TileLayer( { url: layers[ 0 ].config.url } )   
    }
} )
