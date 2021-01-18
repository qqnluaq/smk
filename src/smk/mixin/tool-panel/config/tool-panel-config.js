include.module( 'tool-panel-config', [], function ( inc ) {
    "use strict";

    return function ( cfg ) {
        return Object.assign( {
            showPanel: true,
            showHeader: true,
            showSwipe: false,
            expand: 0,
        }, cfg )
    }
} )
