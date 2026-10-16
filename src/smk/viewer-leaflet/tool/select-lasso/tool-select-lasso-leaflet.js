include.module( 'tool-select-lasso-leaflet', [
    'leaflet',
    'tool-select-lasso',
    'tool-leaflet',
    // 'tool-leaflet.tool-feature-list-leaflet-js'
], function ( inc ) {
    "use strict";

    SMK.TYPE.SelectLassoListTool.addInitializer( function () {
        this.styleFeature = function () {
            var self = this
            return function () {
                return Object.assign( {
                    color:       'blue',
                    weight:      3,
                    opacity:     0.7,
                    dashArray:   '6,6',
                    lineCap:     'butt',
                    fillOpacity: 0.0,
                }, self.style )
            }
        }
    } )

    SMK.TYPE.SelectLassoListTool.addInitializer( function ( smk ) {
        var self = this

        // L.control.lasso( {} ).addTo( smk.$viewer.map )

        var options = {}
        self.lasso = L.lasso( smk.$viewer.map, options);

        smk.$viewer.map.on( 'lasso.finished', function (event) {
            // console.log(event)
            var layerFeatures = event.layers.reduce( function ( acc, ly ) {
                var feature = ly.toGeoJSON()
                if( !acc[ ly._smk_layer_id ] ) acc[ ly._smk_layer_id ] = []
                acc[ ly._smk_layer_id ].push( feature )
                // console.log(feature)
                return acc
            }, {} )
            // console.log(layerFeatures)

            Object.keys( layerFeatures ).forEach( function ( id ) {
                self.featureSet.add( id, layerFeatures[ id ] )
            } )
        })

        smk.$viewer.map.on( 'lasso.enabled', function (event) {
            // console.log(event)
            self.featureSet.clear()
            self.active = true
        })

        smk.$viewer.map.on( 'lasso.disabled', function (event) {
            self.active = false            
            self.disabledDelay = setTimeout( function() {
                // console.log(event)
                self.disabledDelay = null
            }, 2500 )
        })

        self.changedActive( function () {
            if ( self.active ) {
                self.lasso.enable()
                // console.log('active')
            }
            else {
                self.lasso.disable()
                // console.log('inactive')
            }
        } )

        // inc[ 'tool-leaflet.tool-feature-list-leaflet-js' ].call( this, smk )

        // self.featureSet.addedFeatures( function ( ev ) {
        //     ev.features.forEach( function ( f ) {
        //         switch ( turf.getType( f ) ) {
        //         case 'Point':
        //             self.highlight[ f.id ] = L.circleMarker( L.GeoJSON.coordsToLatLng( f.geometry.coordinates ), {
        //                     radius: 20
        //                 } )
        //                 .setStyle( self.styleFeature()() )
        //             break;

        //         case 'MultiPoint':
        //             break;

        //         default:
        //             self.highlight[ f.id ] = L.geoJSON( f.geometry, {
        //                 style: self.styleFeature()
        //             } )
        //         }
        //     } )
        // } )

    } )
} )


