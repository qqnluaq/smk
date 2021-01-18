include.module( 'tool-widget-config', [], function ( inc ) {
    "use strict";

    return function ( cfg ) {
        return Object.assign( {
            showWidget: true,
        }, cfg )
    }
} )
