include.module( 'tool-version-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-panel-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ](
        inc[ 'tool-panel-config' ]( {
            type: 'version',
            title: 'Version Info',
            position: 'list-menu',
            order: 99,
            icon: 'build',
            build: SMK.BUILD,
        } ) ) )
    )
} )
