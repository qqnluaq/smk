include.module( 'base-map.national-geographic-v2-js', [], function ( inc ) {
    "use strict";

    // taken from
    // https://www.arcgis.com/home/item.html?id=f33a34de3a294590ab48f246e99958c9
    
    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'national-geographic-v2', {
            type: 'composite',
            title: 'National Geographic',
            layers: [
                '--national-geographic-v2-vector',
                '--national-geographic-v2-tiles',
                '--national-geographic-v2-hillshade-tiles',
            ]
        } )

        defineBaseMap( '--national-geographic-v2-vector', {
            type: 'esri-vector-tile',
            url: '3d1a30626bbc46c582f148b9252676ce',
            internal: true,
        } )

        defineBaseMap( '--national-geographic-v2-tiles', {
            type: 'esri-tiled-map',
            url: 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/NatGeoStyleBase/MapServer',
            internal: true,
        } )             

        defineBaseMap( '--national-geographic-v2-hillshade-tiles', {
            type: 'esri-tiled-map',
            url: 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer',
            internal: true,
        } )                    
    }
} )
