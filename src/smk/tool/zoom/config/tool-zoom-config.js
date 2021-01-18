include.module( 'tool-zoom-config', [
    'tool-base-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ]( {
            type: 'zoom',
            enabled: false,
            order: 1,
            mouseWheel: true,
            doubleClick: true,
            box: true,
            control: true,
        } )
    )
} )
