include.module( 'tool-query-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-panel-config',
    'tool-panel-feature-config'
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ](
        inc[ 'tool-panel-config' ](
        inc[ 'tool-panel-feature-config' ]( {
            type: 'query',
            instance: true,
            order: 5,
            within: false,
            command: {
                within: true,
                select: true,
            },
        } ) ) ) )
    )
} )
