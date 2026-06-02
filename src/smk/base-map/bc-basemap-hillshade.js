include.module( 'base-map.bc-basemap-hillshade-js', [], function ( inc ) {
    "use strict";

    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'bc-basemap-hillshade', {
            type: 'esri-vector-tile',
            title: 'BC (Hillshade)',
            url: 'bbe05270d3a642f5b62203d6c454f457'
        } )
    }
} )
