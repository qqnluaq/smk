include.module( 'tool-search-esri3d', [ 'esri3d', 'types-esri3d', 'util-esri3d', 'tool-search' ], function ( inc ) {
    "use strict";

    SMK.TYPE.SearchListTool.addInitializer( function ( smk ) {
        var self = this

        smk.$viewer.handlePick( 3, function ( location ) {
            if ( !self.active ) return

            return smk.$viewer.view.hitTest( location.screen )
                .then( function ( hit ) {
                    // console.log( arguments  )
                    if ( hit.results.length == 0 ) return
                    if ( !hit.results[ 0 ].graphic ) return

                    smk.$viewer.searched.pick( hit.results[ 0 ].graphic.attributes.id )
                    return true
                } )
        } )

     } )

} )
