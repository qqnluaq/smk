include.module( 'util-esri3d', [ 'types-esri3d', 'terraformer' ], function ( inc ) {
    "use strict";

    var geojsonType = {
        Point: function ( obj ) {
            return [ Object.assign( { type: 'point' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        MultiPoint: function ( obj ) {
            return obj.coordinates.reduce( function ( acc, c ) {
                return acc.concat( convertGeojson( { type: 'Point', coordinates: c } ) )
            }, [] )
        },

        LineString: function ( obj ) {
            return [ Object.assign( { type: 'polyline' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        MultiLineString: function ( obj ) {
            return [ Object.assign( { type: 'polyline' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        Polygon: function ( obj ) {
            return [ Object.assign( { type: 'polygon' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        MultiPolygon: function ( obj ) {
            return [ Object.assign( { type: 'polygon' }, Terraformer.ArcGIS.convert( obj ) ) ]
        },

        GeometryCollection: function ( obj ) {
            return obj.geometries.reduce( function ( acc, g ) {
                return acc.concat( convertGeojson( g ) )
            }, [] )
        },

        FeatureCollection:  function ( obj, symbols ) {
            return obj.features.reduce( function ( acc, f ) {
                return acc.concat( convertGeojson( f, symbols ) )
            }, [] )
        },

        Feature:  function ( obj, symbols ) {
            return convertGeojson( obj.geometry ).reduce( function ( acc, g ) {
                return acc.concat( symbols.reduce( function ( acc, s ) {
                    return {
                        attributes: Object.assign( { _geojsonGeometry: obj.geometry }, obj.properties ),
                        geometry:   g,
                        symbol:     s[ g.type ] //, obj.properties )
                    }    
                }, [] ) )
            }, [] ) 
        },
    }

    function convertGeojson( geojson, symbols ) {
        return geojsonType[ geojson.type || 'Feature' ]( geojson, symbols )
    }

    Object.assign( window.SMK.UTIL, {
        geoJsonToEsriGraphics: function ( geojson, symbols ) {
            return convertGeojson( geojson, symbols )
        },

        smkStyleToEsriSymbol: function ( styleConfig, viewer ) {
            var line = {
                type: 'line-3d',
                symbolLayers: [ {
                    type: 'line',
                    size: styleConfig.strokeWidth,
                    material: {
                        color: color( styleConfig.strokeColor, styleConfig.strokeOpacity ),
                    },
                    cap: styleConfig.strokeCap,
                    join: styleConfig.strokeJoin
                } ]
            }

            var point
            if ( styleConfig.markerUrl ) {
                var sz = styleConfig.markerSize,
                    cx = sz[ 0 ] / 2,
                    cy = sz[ 1 ] / 2,
                    off = styleConfig.markerOffset,
                    ox = off[ 0 ] || cx,
                    oy = off[ 1 ] || cy,
                    x = ox / sz[ 0 ] - 0.5,
                    y = oy / sz[ 1 ] - 0.5
                point = {
                    type: 'point-3d',
                    symbolLayers: [
                        {
                            type:       'icon',
                            size:       Math.max.apply( Math, styleConfig.markerSize ) + 'px',
                            anchor:     'relative',
                            anchorPosition: { x: x, y: y },
                            resource: {
                                href: viewer.resolveAttachmentUrl( styleConfig.markerUrl, null, 'png' )
                            }
                        }
                    ]
                }
            }
            else {
                point = {
                    type: 'point-3d',
                    symbolLayers: [ {
                        type: 'icon',
                        size: styleConfig.strokeWidth * 2,
                        resource: {
                            primitive: 'circle'
                        },
                        material: {
                            color: color( styleConfig.fillColor, styleConfig.fillOpacity ),
                        },
                        outline: {
                            size: styleConfig.strokeWidth / 2,
                            color: color( styleConfig.strokeColor, styleConfig.strokeOpacity ),
                        }
                    } ]
                }
            }

            var fill = {
                type: 'polygon-3d',
                symbolLayers: []
            }

            if ( styleConfig.fill )
                 fill.symbolLayers.push( {
                    type: 'fill',
                    material: {
                        color: color( styleConfig.fillColor, styleConfig.fillOpacity )
                    },
                } )

            if ( styleConfig.stroke !== false )
                fill.symbolLayers.push( line.symbolLayers[ 0 ] )

            return {
                point: point,
                // multipoint: Object.assign( point, { outline: line } ),
                polyline: line,
                polygon: fill
            }

            function color( c, a ) {
                var ec = new SMK.TYPE.Esri3d.Color( c )
                ec.a = a
                return ec
            }
        }

    } )

} )