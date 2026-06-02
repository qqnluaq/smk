include.module( 'base-map.base-map-js', [ 
    'base-map.legacy-js', 
    'base-map.composite-js', 

    'base-map.bc-basemap-js',
    'base-map.bc-basemap-hillshade-js',
    'base-map.topographic-v2-js',
    'base-map.imagery-v2-js',
    'base-map.streets-v2-js',
    'base-map.streets-night-js',
    'base-map.oceans-v2-js',
    'base-map.national-geographic-v2-js',
    'base-map.light-gray-v2-js',
], function ( inc ) {
    "use strict";

    return function ( defineBaseMap, defineBaseMapType ) {
        inc[ 'base-map.composite-js'                ]( defineBaseMap, defineBaseMapType )

        inc[ 'base-map.bc-basemap-js'               ]( defineBaseMap, defineBaseMapType )
        inc[ 'base-map.bc-basemap-hillshade-js'     ]( defineBaseMap, defineBaseMapType )
        inc[ 'base-map.topographic-v2-js'           ]( defineBaseMap, defineBaseMapType )
        inc[ 'base-map.imagery-v2-js'               ]( defineBaseMap, defineBaseMapType )
        inc[ 'base-map.streets-v2-js'               ]( defineBaseMap, defineBaseMapType )
        inc[ 'base-map.streets-night-js'            ]( defineBaseMap, defineBaseMapType )	
        inc[ 'base-map.oceans-v2-js'                ]( defineBaseMap, defineBaseMapType )
        inc[ 'base-map.national-geographic-v2-js'   ]( defineBaseMap, defineBaseMapType )
        inc[ 'base-map.light-gray-v2-js'            ]( defineBaseMap, defineBaseMapType )

        inc[ 'base-map.legacy-js'                   ]( defineBaseMap, defineBaseMapType )
    }
} )
