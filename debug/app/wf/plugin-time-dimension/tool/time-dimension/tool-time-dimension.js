include.module( 'tool-time-dimension', [ 'tool' ], function () {
    "use strict";

    return SMK.TYPE.Tool.define( 'TimeDimensionTool', null, function ( smk ) {
        SMK.HANDLER.get( this.id, 'initialized' )( smk, this )
    } )
} )

