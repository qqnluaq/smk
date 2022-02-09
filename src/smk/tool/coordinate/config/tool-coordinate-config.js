include.module( 'tool-coordinate-config', [
    'tool-base-config'
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ]( {
            type: 'coordinate',
            format: 'DD'
        } )
    )
} )
