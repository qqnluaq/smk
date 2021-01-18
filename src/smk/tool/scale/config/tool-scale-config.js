include.module( 'tool-scale-config', [
    'tool-base-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ]( {
            type: 'scale',
            order: 2,
            showFactor: true,
            showBar: true,
            showZoom: false,
        } )
    )
} )
