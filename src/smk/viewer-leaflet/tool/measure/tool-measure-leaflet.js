include.module( 'tool-measure-leaflet', [ 'leaflet', 'tool-measure', 'turf' ], function () {
    "use strict";

    SMK.TYPE.MeasureTool.addInitializer( function ( smk ) {
        var self = this

        self.viewer.leaflet = true

        smk.$viewer.map.createPane( 'hiddenPane', smk.addToContainer( '<div style="display:none"></div>' ) )

        self.showStatusMessage( "Select measurement method" )

        this.control = L.control.measure( {
            position: 'topright',
            primaryLengthUnit: 'meters',
            secondaryLengthUnit: 'kilometers',
            primaryAreaUnit: 'hectares',
            secondaryAreaUnit: 'sqmeters',
            activeColor: '#38598a',
            completedColor: '#036',
            popupOptions: {
                pane: 'hiddenPane'
            }
        } )

        this.control.addTo( smk.$viewer.map )

        SMK.UTIL.wrapFunction( this.control, '_handleMeasureClick', function ( inner ) {
            return function ( ev ) {
                if ( self.maxPoints != null && ( this._latlngs.length + 1 ) >= self.maxPoints ) {
                    inner.call( this, ev )
                    this._handleMeasureDoubleClick()
                    return
                }

                return inner.call( this, ev )
            }
        } )

        SMK.UTIL.wrapFunction( this.control, '_handleMeasureDoubleClick', function ( inner ) {
            return function ( ev ) {
                if ( self.minPoints != null && this._latlngs.length < self.minPoints ) {
                    return
                }

                self.latlngs = JSON.parse( JSON.stringify( this._latlngs ))

                inner.call( this, ev )

                if ( self.measureDistance ) {
                    var resultFeature = L.polyline( self.latlngs, this._symbols.getSymbol('resultLine'));                    
                    this._layer.clearLayers()
                    resultFeature.addTo( this._layer )
                }
            }
        } )

        SMK.UTIL.wrapFunction( this.control, '_addMeasureArea', function ( inner ) {
            return function ( latlngs ) {
                if ( !self.measureArea ) return

                return inner.call( this, latlngs )
            }
        } )

        SMK.UTIL.wrapFunction( this.control, '_handleMeasureMove', function ( inner ) {
            return function ( ev ) {
                inner.call( this, ev )

                var result = {}

                var pts = this._latlngs.concat( this._measureDrag.getLatLng() ).map( function ( pt ) { return [ pt.lng, pt.lat ] } )
                // result.count = pts.length

                if ( pts.length > 2 ) {
                    var poly = pts.concat( [ pts[ 0 ] ] )
                    result.area = turf.area( turf.polygon( [ poly ] ) )
                    result.length = turf.length( turf.lineString( poly ), { units: 'meters' } )
                    result.count = pts.length
                }
                else if ( pts.length > 1 ) {
                    result.length = turf.length( turf.lineString( pts ), { units: 'meters' } )
                    result.count = pts.length
                }
                // console.log( pts )
                displayResult( result )
            }
        } )

        smk.$viewer.map.on( {
            'measurefinish': function ( ev ) {
                self.busy = false
                displayResult( {
                    count:  ev.pointCount,
                    area:   ev.area,
                    length: ev.length,
                } )

                if ( self.measureDistance ) 
                    smk.emit( self.id, 'measure-distance', {
                        count:  ev.pointCount,
                        length: ev.length,
                        points: self.latlngs
                    } )

                if ( self.measureArea ) 
                    smk.emit( self.id, 'measure-area', {
                        count:  ev.pointCount,
                        length: ev.length,
                        area:   ev.area,
                        points: self.latlngs
                    } )
            }
        } )

        function displayResult( res ) {
            self.results = []

            if ( !res.count ) return

            if ( self.measureArea ) {
                self.showStatusMessage()
                self.results.push( {
                    title:  'Number of edges',
                    value:  res.count,
                    // unit:   'vertices'
                } )

                if ( res.area )
                    self.results.push( {
                        title:  'Area',
                        value:  res.area,
                        dim:    2
                    } )

                if ( res.length )
                    self.results.push( {
                        title:  'Perimeter',
                        value:  res.length,
                        dim:    1
                    } )
            }
            else if ( self.measureDistance ) {
                self.showStatusMessage()
                self.results.push( {
                    title:  'Number of edges',
                    value:  res.count - 1,
                    // unit:   'vertices'
                } )

                self.results.push( {
                    title:  'Length',
                    value:  res.length,
                    dim:    1
                } )
            }
        }

        this.changedActive( function () {
            if ( self.active ) {
                self.control._layer.addTo( smk.$viewer.map )
            }
            else {
                self.control._layer.removeFrom( smk.$viewer.map )
            }
        } )

        smk.on( this.id, {
            'start-area': function ( ev ) {
                self.busy = true
                self.control._layer.clearLayers()
                self.results = []
                self.measureDistance = false
                self.measureArea = true
                self.showStatusMessage( "Click on map to set first point", 'progress' )

                self.minPoints = 3
                self.maxPoints = null

                self.control._startMeasure()
            },

            'start-distance': function ( ev ) {
                self.busy = true
                self.control._layer.clearLayers()
                self.results = []
                self.measureDistance = true
                self.measureArea = false
                self.showStatusMessage( "Click on map to set starting point", 'progress' )

                self.minPoints = 2
                self.maxPoints = null

                self.control._startMeasure()
            },

            'cancel': function ( ev ) {
                self.busy = false
                self.results = []
                self.measureDistance = false
                self.measureArea = false
                self.showStatusMessage( "Select measurement method" )

                self.control._finishMeasure()
            },

        } )

    } )

} )

