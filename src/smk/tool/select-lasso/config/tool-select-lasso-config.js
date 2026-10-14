include.module( 'tool-select-lasso-config', [
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
                type: 'select-lasso',
                enabled: false,
                order: 6,
                position: 'list-menu',
                icon: 'filter_tilt_shift',
                title: 'Selected Features',
                command: {
                    clear: true,
                    remove: true,
                }
            } 
        ) ) ) ) ) )
    )

    SMK.CONFIG.viewer.displayContext.push( {
        id: 'select-lasso',
        items: [ {
            id: 'SelectLassoListTool',
            type: 'group',
            title: 'Selected Features',
            class: 'smk-inline-legend',
            isVisible: false,
            isInternal: true,
            showItem: false,
            items: [
                { id: 'SelectLassoListTool--highlight-point' },
                { id: 'SelectLassoListTool--highlight-line' },
                { id: 'SelectLassoListTool--highlight-polygon' },
            ]
        } ]
    } )

} )
