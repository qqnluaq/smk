include.module( 'tool-location-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-panel-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ](
        inc[ 'tool-panel-config' ]( {
            type: 'location',
            enabled: true,
            showHeader: false
        } ) )
    )
} )
