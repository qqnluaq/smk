include.module( 'tool-select-config', [
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
            type: 'select',
            enabled: false,
            order: 6,
            position: 'list-menu',
            icon: 'select_all',
            title: 'Selected Features',
            command: {
                clear: true,
                remove: true,
            }
        } ) ) ) )
    )
} )
