include.module( 'base-map.light-gray-v2-js', [], function ( inc ) {
    "use strict";

    // taken from 
    // https://www.arcgis.com/home/item.html?id=979c6cc89af9449cbeb5342a439c6a76
    
    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'light-gray-v2', {
            type: 'composite',
            title: 'Light Gray',
            layers: [
                // '--light-gray-v2-label', // doesn't display
                '--light-gray-v2-vector',
            ]
        } )

        defineBaseMap( '--light-gray-v2-vector', {
            type: 'esri-vector-tile',
            url: '291da5eab3a0412593b66d384379f89f',
            internal: true,
        } )

        defineBaseMap( '--light-gray-v2-label', {
            type: 'esri-vector-tile',
            url: '1768e8369a214dfab4e2167d5c5f2454',
            internal: true,
        } )
    }
} )
