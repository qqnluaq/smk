include.module( 'tool-bookmarks-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-panel-config',
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ](
        inc[ 'tool-panel-config' ]( {
            type: 'bookmarks',
            enabled: false,
            order: 3,
            position: [ 'shortcut-menu', 'list-menu' ],
            icon: 'bookmark',
            title: 'Bookmarks'
        } ) ) )
    )
} )
