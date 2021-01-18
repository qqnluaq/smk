include.module( 'tool-base-config', [], function ( inc ) {
    "use strict";

    return function ( cfg ) {
        return Object.assign( {
            type: null,
            instance: null,
            order: 1,
            enabled: false,
            title: null,
            icon: 'widgets',
            showTitle: false,
        }, cfg )
    }
} )
