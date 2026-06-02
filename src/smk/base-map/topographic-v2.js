include.module( 'base-map.topographic-v2-js', [], function ( inc ) {
    "use strict";

    // taken from 
    // https://www.arcgis.com/home/item.html?id=67372ff42cd145319639a99152b15bc3
    
    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'topographic-v2', {
            type: 'composite',
            title: 'Topographic',
            layers: [
                '--topographic-v2-hillshade',
                '--topographic-v2-vector',
            ]
        } )

        defineBaseMap( '--topographic-v2-hillshade', {
            type: 'esri-tiled-map',
            url: 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer',
            internal: true,
        } )

        defineBaseMap( '--topographic-v2-vector', {
            type: 'esri-vector-tile',
            url: '7dc6cea0b1764a1f9af2e679f642f0f5',
            internal: true,
        } )
    }
} )
