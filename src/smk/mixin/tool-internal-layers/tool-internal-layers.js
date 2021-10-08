include.module( 'tool-internal-layers', [
], function ( inc ) {
    "use strict";

    SMK.TYPE.ToolInternalLayers = function () {
        this.internalLayers = []

        this.$initializers.push( function ( smk ) {
            var self = this

            this.internalLayers.forEach( function ( ly ) {               
                ly.id = self.id + '--' + ly.id
                ly.type = 'vector'
                ly.isVisible = true
                ly.isQueryable = false
                ly.isInternal = true

                smk.$viewer.addLayer( ly )
            } )

            this.setInternalLayerVisible = function ( visible ) {
                smk.$viewer.displayContext[ self.type ].setItemVisible( self.id, visible )
            }

            this.getInternalLayer = function ( id ) {
                if ( !smk.$viewer.layerId[ this.id + '--' + id ] ) throw Error( 'internal layer ' + id + ' not defined' )

                return smk.$viewer.layerId[ this.id + '--' + id ]
            }

            this.clearInternalLayer = function ( id ) {
                this.getInternalLayer( id ).clear()
            }

            this.loadInternalLayer = function ( id, geojson ) {
                this.getInternalLayer( id ).load( geojson )
            }

        } )
    }
} )

