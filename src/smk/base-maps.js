include.module( 'base-maps', [ 'jquery', 'util', 'base-map-assets' ], function ( inc ) {
    "use strict";

    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMapType( 'composite', function ( cfg ) {
            return cfg.layers.reduce( function ( acc, ly ) {
                var lyConfig = defineBaseMap( ly )
                if ( !lyConfig ) throw Error( 'in composite layer ' + cfg.id + ', no base map defined for ' + ly )

                var lyType = defineBaseMapType( lyConfig.type )
                if ( !lyType ) throw Error( 'in composite layer ' + cfg.id + ', base map ' + ly + ' has unknown type ' + lyConfig.type )

                var lys
                try {
                    lys = lyType( lyConfig )
                }
                catch ( e ) {
                    throw Error( 'in composite layer ' + cfg.id + ', base map ' + ly + ' failed: ' + e )
                }

                return acc.concat( lys )
            }, [] )
        } )

        //
        // Legacy basemaps, all are marked as deprecated
        //

        defineBaseMap( 'Topographic', {
            deprecated: true,
            type: 'esri-basemap',
            order: 1,
            key: 'Topographic',
            title: 'Topographic',
            option: {
                maxNativeZoom: 16
            },
        } )

        defineBaseMap( 'Streets', {
            deprecated: true,
            type: 'esri-basemap',
            order: 2,
            key: 'Streets',
            title: 'Streets',
            option: {
                maxNativeZoom: 19,
                maxZoom: 30
            }
        } )

        defineBaseMap( 'Imagery', {
            deprecated: true,
            type: 'composite',
            order: 3,
            title: 'Imagery',
            layers: [
                'imagery-esri',
                'imagery-transportation-esri',
                'imagery-labels-esri'
            ]
        } )

            defineBaseMap( 'imagery-esri', {
                internal: true,
                deprecated: true,
                type: 'esri-basemap',
                order: 3,
                key: 'Imagery',
                title: 'Imagery',
                option: {
                    maxNativeZoom: 20,
                    maxZoom: 30
                },
            } )

            defineBaseMap( 'imagery-transportation-esri', {
                internal: true,
                deprecated: true,
                type: 'esri-basemap',
                order: 3,
                key: 'ImageryTransportation',
                title: 'Imagery Transportation',
                option: {
                    maxNativeZoom: 19,
                    maxZoom: 30,
                    tileSize: 512,
                    zoomOffset: -1
                },
            } )

            defineBaseMap( 'imagery-labels-esri', {
                internal: true,
                deprecated: true,
                type: 'esri-basemap',
                order: 3,
                key: 'ImageryLabels',
                title: 'Imagery Labels',
                option: {
                    maxNativeZoom: 19,
                    maxZoom: 30,
                    tileSize: 512,
                    zoomOffset: -1
                },
            } )

        defineBaseMap( 'Oceans', {
            deprecated: true,
            type: 'esri-basemap',
            order: 4,
            key: 'Oceans',
            title: 'Oceans',
            labels: [ 'OceansLabels' ],
        } )

        defineBaseMap( 'NationalGeographic', {
            deprecated: true,
            type: 'esri-basemap',
            order: 5,
            key: 'NationalGeographic',
            title: 'National Geographic',
        } )

        defineBaseMap( 'ShadedRelief', {
            deprecated: true,
            type: 'esri-basemap',
            order: 6,
            key: 'ShadedRelief',
            title: 'Shaded Relief',
        } )

        defineBaseMap( 'DarkGray', {
            deprecated: true,
            type: 'esri-basemap',
            order: 7,
            key: 'DarkGray',
            title: 'Dark Gray',
        } )

        defineBaseMap( 'Gray', {
            deprecated: true,
            type: 'esri-basemap',
            order: 8,
            key: 'Gray',
            title: 'Gray',
        } )

        //
        // Basemaps used by WFIM
        //

        // =======================================================================================================================
        // BC Basemap without hillshade	

        // =======================================================================================================================
        // BC Basemap with hillshade	


        var bcHillshadeStyle = JSON.parse( inc[ 'base-map-assets' ][ 'base-map-assets.vector-basemap-bc-hillshade-json' ] )

        defineBaseMap( 'bc-hillshade2', {
            type: 'esri-vector-tile',
            order: 25,
            title: 'BC (hillshade)',
            url: 'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer',
            option: {
                style: function ( style ) {
                    return bcHillshadeStyle
                }
            }
        } )

 
        defineBaseMap( 'bc-hillshade', {
            type: 'composite',
            order: 22,
            title: 'BC (Hillshade)',
            layers: [
                'bc-hillshade-tiles',
                'bc-hillshade-vector',
            ]
        } )


        var bcHillshadeTilesStyle = JSON.parse( inc[ 'base-map-assets' ][ 'base-map-assets.vector-basemap-bc-hillshade-tiles-json' ] )

        // defineBaseMap( 'bc-hillshade', {
        //     type: 'esri-vector-tile',
        //     order: 25,
        //     title: 'BC (hillshade)',
        //     url: 'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer',
        //     option: {
        //         style: function ( style ) {
        //             return bcHillshadeStyle
        //         }
        //     }
        // } )


        defineBaseMap( 'bc-hillshade-tiles', {
            type: 'esri-vector-tile',
            order: 25,
            title: 'BC (hillshade)',
            url: "https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_Basemap_Vector_Hillshade/VectorTileServer",
            // option: {
            //     opacity: 0.7,
            //     style: function ( style ) {
            //         return bcHillshadeTilesStyle
            //     }
            // }
        } )

        var bcHillshadeVectorStyle = JSON.parse( inc[ 'base-map-assets' ][ 'base-map-assets.vector-basemap-bc-hillshade-vector-json' ] )

        defineBaseMap( 'bc-hillshade-vector', {
            type: 'esri-vector-tile',
            order: 25,
            title: 'BC (hillshade) x',
            url: "https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer",
            // option: {
            //     style: function ( style ) {
            //         return bcHillshadeVectorStyle
            //     }
            // }
        } )


        // =======================================================================================================================
        // Topography	

        // =======================================================================================================================
        // Imagery	

        // =======================================================================================================================
        // Streets	

        // =======================================================================================================================
        // Night	

        // =======================================================================================================================
        // Oceans	

        // =======================================================================================================================
        // National Geographic

        // =======================================================================================================================
        // Light Grey        

        defineBaseMap( 'bc-roads', {
            type: 'esri-vector-tile',
            order: 20,
            title: 'BC BaseMap Vector',
            url: 'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer',
            option: {
                maxNativeZoom: 17,
                maxZoom: 30
            }
        } )

        defineBaseMap( 'bc-roads-raster', {
            type: 'tile',
            order: 21,
            title: 'BC Roads Raster',
            url: "https://maps.gov.bc.ca/arcserver/rest/services/Province/roads_wm/MapServer/tile/{z}/{y}/{x}",
            option: {
                maxNativeZoom: 17,
                maxZoom: 30
            }
        } )

        defineBaseMap( 'topography', {
            type: 'composite',
            order: 22,
            title: 'Canada Topography',
            layers: [
                'topography-vector',
                'topography-hillshade'
            ]
        } )

            var topoStyle = JSON.parse( inc[ 'base-map-assets' ][ 'base-map-assets.vector-basemap-topo-json' ] )

            defineBaseMap( 'topography-vector', {
                type: 'esri-vector-tile',
                order: 11,
                title: 'Canada Topographic Vector',
                url: 'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer',
                option: {
                    style: function ( style ) {
                        return topoStyle
                    }
                }
            } )

            defineBaseMap( 'topography-hillshade', {
                type: 'esri-tiled-map',
                order: 13,
                title: 'Imagery',
                attribution: 'Copyright 117 DataBC, Government of British Columbia',
                option: {
                    minZoom: 4, 
                    maxZoom: 30
                },
                url: 'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Hillshade/MapServer',
            } )

        // defineBaseMap( 'imagery-esri-v2', {
        //     internal: true,
        //     type: 'esri-vector-basemap',
        //     order: 23,
        //     title: 'Imagery',
        //     key: 'arcgis/imagery',
        //     option: {
        //         token: '** NEEDS AN API TOKEN **',
        //         maxNativeZoom: 19,
        //         maxZoom: 30,
        //         tileSize: 512,
        //         zoomOffset: -1
        //     }
        // } )

        // defineBaseMap( 'streets-esri-v2', {
        //     type: 'esri-vector-basemap',
        //     order: 24,
        //     title: 'ESRI Streets',
        //     key: 'arcgis/streets',
        //     option: {
        //         token: '** NEEDS AN API TOKEN **',
        //         maxNativeZoom: 19,
        //         maxZoom: 30,
        //     }
        // } )

        var nightStyle = JSON.parse( inc[ 'base-map-assets' ][ 'base-map-assets.vector-basemap-night-json' ] )

        defineBaseMap( 'night', {
            type: 'esri-vector-tile',
            order: 25,
            title: 'Night',
            url: 'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer',
            option: {
                style: function ( style ) {
                    return nightStyle
                }
            }
        } )

        defineBaseMap( 'topography-v3', {
            internal: true,
            type: 'esri-vector-basemap',
            order: 23,
            title: 'Topographic',
            key: 'dc6cea0b1764a1f9af2e679f642f0f5',
            option: {
                // token: '** NEEDS AN API TOKEN **',
                maxNativeZoom: 19,
                maxZoom: 30,
                tileSize: 512,
                zoomOffset: -1
            }
        } )

        defineBaseMap( 'night', {
            type: 'esri-vector-tile',
            order: 25,
            title: 'Night',
            url: 'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer',
            option: {
                style: function ( style ) {
                    return nightStyle
                }
            }
        } )

        var streetsStyle = JSON.parse( inc[ 'base-map-assets' ][ 'base-map-assets.vector-basemap-streets-json' ] )

        defineBaseMap( 'streets-esri-v2', {
            type: 'esri-vector-tile',
            order: 25,
            title: 'Streets',
            url: 'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer',
            option: {
                style: function ( style ) {
                    return streetsStyle
                }
            }
        } )


        defineBaseMap( 'canadian-imagery', {
            type: 'composite',
            order: 22,
            title: 'Canada Imagery',
            layers: [
                'canadian-imagery-vector',
                'canadian-imagery-tiles'
            ]
        } )
                var imageryStyle = JSON.parse( inc[ 'base-map-assets' ][ 'base-map-assets.vector-basemap-imagery-json' ] )
                
                defineBaseMap( 'canadian-imagery-vector', {
                    type: 'esri-vector-tile',
                    order: 25,
                    title: 'Imagery',
                    url: 'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer',
                    option: {
                        style: function ( style ) {
                            return imageryStyle
                        }
                    }
                } )

                defineBaseMap( 'canadian-imagery-tiles', {
                    type: 'esri-tiled-map',
                    order: 25,
                    title: 'Imagery',
                    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
                } )             

    }
} )
