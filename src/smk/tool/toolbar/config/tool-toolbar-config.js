include.module( 'tool-toolbar-config', [
    'tool-base-config'
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ]( {
            type: 'toolbar',
            enabled: true
        } )
    )
} )
