include.module( 'base-map.bc-basemap-js', [], function ( inc ) {
    "use strict";

    return function ( defineBaseMap, defineBaseMapType ) {
        defineBaseMap( 'bc-basemap', {
            type: 'esri-vector-tile',
            title: 'BC',
            url: 'b1624fea73bd46c681fab55be53d96ae'
        } )
    }
} )
