include.module( 'tool-select-config', [
    'tool-base-config',
    'tool-widget-config',
    'tool-panel-config',
    'tool-panel-feature-config',
    'tool-internal-layers-config',
    'tool-feature-list-config'
], function ( inc ) {
    "use strict";

    SMK.CONFIG.tools.push(
        inc[ 'tool-base-config' ](
        inc[ 'tool-widget-config' ](
        inc[ 'tool-panel-config' ](
        inc[ 'tool-panel-feature-config' ]( 
        inc[ 'tool-internal-layers-config' ]( 
        inc[ 'tool-feature-list-config' ]( 
            {
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
            } 
        ) ) ) ) ) )
    )

    SMK.CONFIG.viewer.displayContext.push( {
        id: 'select',
        items: [ {
            id: 'SelectListTool',
            type: 'group',
            title: 'Selected Features',
            class: 'smk-inline-legend',
            isVisible: false,
            isInternal: true,
            showItem: false,
            items: [
                { id: 'SelectListTool--highlight-point' },
                { id: 'SelectListTool--highlight-line' },
                { id: 'SelectListTool--highlight-polygon' },
            ]
        } ]
    } )

} )
