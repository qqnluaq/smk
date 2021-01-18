include.module( 'tool-about-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-panel-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ](
        inc[ 'tool-panel-config' ]( {
            type: 'about',
            enabled: false,
            order: 1,
            icon: 'help',
            position: 'list-menu',
            title: 'About SMK',
            content: 'Welcome to SMK'
        } ) ) )
    )
} )
