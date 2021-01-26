include.module( 'layer-esri3d.layer-cluster-esri3d-js', [ 'layer.layer-cluster-js', 'types-esri3d', 'util-esri3d', 'turf' ], function () {
    "use strict";

    var E = SMK.TYPE.Esri3d
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function ClusterEsri3dLayer() {
        SMK.TYPE.Layer[ 'cluster' ].prototype.constructor.apply( this, arguments )
    }

    $.extend( ClusterEsri3dLayer.prototype, SMK.TYPE.Layer[ 'cluster' ].prototype )

    SMK.TYPE.Layer[ 'cluster' ][ 'esri3d' ] = ClusterEsri3dLayer
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    ClusterEsri3dLayer.prototype.getFeaturesInArea = function ( area, view, option ) {
    }
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer[ 'cluster' ][ 'esri3d' ].create = function ( layers, zIndex ) {
        var self = this;

        if ( layers.length != 1 ) throw new Error( 'only 1 config allowed' )
            
        return SMK.UTIL.resolved()
            .then( function ( reproject ) {
                var renderer = new E.renderers.ClassBreaksRenderer()
                renderer.field = "clusterCount";

                var symbol = new E.symbols.SimpleMarkerSymbol( { 
                    size: 22, 
                    color: '#fabf4f',
                    style: 'square',
                    outline: {
                        width: 0
                    }
                } )
                renderer.addClassBreakInfo(0, Infinity, symbol);

                var flareRenderer = new E.renderers.ClassBreaksRenderer()
                flareRenderer.field = "clusterCount";

                var flareSymbol = new E.symbols.SimpleMarkerSymbol({ 
                    size: 11, 
                    color: '#fabf4f',
                    style: 'square',
                    outline: {
                        width: 0,
                        color: '#fabf4f'
                    }
                });
                flareRenderer.addClassBreakInfo(0, Infinity, flareSymbol);

                var layer = new E.fcl.FlareClusterLayer_v4.FlareClusterLayer( {
                    clusterToScale: 10,
                    clusterRenderer: renderer,
                    textSymbol: new E.symbols.TextSymbol({
                        color: 'white',
                        haloColor: 'black',
                        haloSize: 1,
                        font: {
                            size: 13
                        }
                    }),
                    flareTextSymbol: new E.symbols.TextSymbol({
                        color: 'black',
                        font: {
                            size: 10
                        }
                    }),
                    // areaRenderer: areaRenderer,
                    // singlePopupTemplate: popupTemplate,
                    // clusterAreaDisplay: 'activated'
                    flareRenderer: flareRenderer,
                    spatialReference: { "wkid": 4326 },
                    displayFlares: true,
                    displaySubTypeFlares: true,
                    subTypeFlareProperty: "STAGE_OF_CONTROL_DESC",
                    singleFlareTooltipProperty: "INCIDENT_NUMBER_LABEL",
                    maxSingleFlareCount: 8,
                    clusterRatio: 75,
                    symbolPropertyName: 'symbol',
                } )   

                // doesn't work in 3d
                // layer.on( "flare-clicked", function (flare) {
                //     console.log('flare clicked', flare);
                // } )

                // layer.on( "cluster-clicked", function (cluster) {
                //     console.log('cluster clicked', cluster);
                // } )

                self.eachLayer( function ( id, ly, lyVis ) {
                    if ( ly.config.clusterId == layers[ 0 ].config.id ) { 
                        ly.finishedLoading( function () {
                            layer.filterData( function ( ft ) {
                                return ft.layerId != ly.id
                            } )
                            layer.addData( ly.getData() )
                        } )

                        if ( ly.getData ) {
                            layer.filterData( function ( ft ) {
                                return ft.layerId != ly.id
                            } )
                            layer.addData( ly.getData() )
                        }
                    }
                } )

                return layer
            } )
    }

} )
