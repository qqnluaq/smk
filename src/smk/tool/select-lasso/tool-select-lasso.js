include.module( 'tool-select-lasso', [
    'tool-select-lasso.tool-select-lasso-list-js',
    'tool-select-lasso.tool-select-lasso-feature-js',
], function ( inc ) {
    "use strict";

    return SMK.TYPE.Tool.defineComposite( [
        inc[ 'tool-select-lasso.tool-select-lasso-list-js' ],
        inc[ 'tool-select-lasso.tool-select-lasso-feature-js' ]
    ] )
} )
