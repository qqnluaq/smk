include.module( 'tool-internal-layers-config', [], function ( inc ) {
    "use strict";

    return function ( cfg ) {
        return Object.assign( {
            internalLayers: [],
        }, cfg )
    }
} )
