include.module( 'base-map.national-geographic-v2-js', [], function ( inc ) {
    "use strict";

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
            url: '3d1a30626bbc46c582f148b9252676ce'
        } )

        defineBaseMap( '--national-geographic-v2-tiles', {
            type: 'esri-tiled-map',
            url: 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/NatGeoStyleBase/MapServer',
        } )             

        defineBaseMap( '--national-geographic-v2-hillshade-tiles', {
            type: 'esri-tiled-map',
            url: 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer',
        } )                    
    }
} )
