include.module( 'base-map.topographic-v2-js', [], function ( inc ) {
    "use strict";

    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'topographic-v2', {
            type: 'composite',
            title: 'Topographic',
            layers: [
                '--canada-topographic-v2-hillshade',
                '--canada-topographic-v2-vector',
                '--world-topographic-v2-hillshade',
                // '--world-topographic-v2-vector',
            ]
        } )

        defineBaseMap( '--canada-topographic-v2-vector', {
            type: 'esri-vector-tile',
            url: '4dd425da08fe4df7afc30112d6e716be'
        } )

        defineBaseMap( '--canada-topographic-v2-hillshade', {
            type: 'esri-tiled-map',
            url: 'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Hillshade/MapServer',
        } )

        defineBaseMap( '--world-topographic-v2-vector', {
            type: 'esri-vector-tile',
            url: '6d0ed88458c6429d99331260fb7bf2b0'
        } )

        defineBaseMap( '--world-topographic-v2-hillshade', {
            type: 'esri-tiled-map',
            url: 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer',
        } )


    }
} )
