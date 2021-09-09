include.module( 'tool-minimap-config', [
    'tool-base-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ]( {
            type: 'minimap',
            order: 1,
            baseMap: null,
            option: {}
        } )
    )
} )
