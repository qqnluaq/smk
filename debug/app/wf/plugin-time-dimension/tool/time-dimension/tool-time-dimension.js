include.module( 'tool-time-dimension', [ 'tool' ], function () {
    "use strict";

    return SMK.TYPE.Tool.define( 'TimeDimensionTool', {
        construct: null,
        initialize: function ( smk ) {
            var self = this

            SMK.HANDLER.get( this.id, 'initialized' )( smk, this )

            this.model = {
                time: null,
                visible: false
            }

            this.vm = new Vue( {
                el: smk.addToOverlay( '<div class="smk-time-dimension" v-if="visible">{{ time }}</div>' ),
                data: this.model,
            } )

            this.changedVisible( function () {
                self.model.visible = self.visible 
            } )
        },
        methods: {
            updateTime( t ) {
                this.model.time = t.toLocaleString()
            }
        }
    } )
} )

