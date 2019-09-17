include.module( 'util', null, function ( inc ) {
    "use strict";

    //used by import geojson to keep track of the many multipoint collections
    var multiPointCollectionCounter;

    Object.assign( window.SMK.UTIL, {

        makePromise: function( withFn ) {
            return new Promise( withFn || function () {} )
        },

        resolved: function() {
            return Promise.resolve.apply( Promise, arguments )
        },

        rejected: function() {
            return Promise.reject.apply( Promise, arguments )
        },

        waitAll: function ( promises ) {
            return Promise.all( promises )
        },

        type: function( val ) {
            var t = typeof val
            if ( t != 'object' ) return t
            if ( Array.isArray( val ) ) return 'array'
            if ( val === null ) return 'null'
            return 'object'
        },

        templatePattern: /<%=\s*(.*?)\s*%>/g,
        templateReplace: function ( template, replacer ) {
            if ( !replacer ) return template

            var m = template.match( this.templatePattern );
            if ( !m ) return template;

            replacer = ( function ( inner ) {
                return function ( param, match ) {
                    var r = inner.apply( null, arguments )
                    return r == null ? match : r
                }
            } )( replacer )

            if ( m.length == 1 && m[ 0 ] == template ) {
                var x = this.templatePattern.exec( template );
                return replacer( x[ 1 ], template )
            }

            return template.replace( this.templatePattern, function ( match, parameterName ) {
                return replacer( parameterName, match )
            } )
        },

        isDeepEqual: function( a, b ) {
            var at = this.type( a );
            var bt = this.type( b );

            if ( at != bt ) return false;

            switch ( at ) {
            case 'array':
                if ( a.length != b.length ) return false;

                for ( var i1 = 0; i1 < a.length; i1 += 1 )
                    if ( !SMK.UTIL.isDeepEqual( a[ i1 ], b[ i1 ] ) )
                        return false

                return true;

            case 'object':
                var ak = Object.keys( a ).sort();
                var bk = Object.keys( b ).sort();

                if ( !SMK.UTIL.isDeepEqual( ak, bk ) )
                    return false

                for ( var i2 = 0; i2 < ak.length; i2 += 1 )
                    if ( !SMK.UTIL.isDeepEqual( a[ ak[ i2 ] ], b[ ak[ i2 ] ] ) )
                        return false

                return true;

            case 'string':
                return a == b;

            default:
                return String( a ) == String( b )
            }

            throw new Error( 'not supposed to be here' )
        },

        grammaticalNumber: function ( num, zero, one, many ) {
            if ( one == null ) one = zero
            if ( many == null ) many = one
            switch ( num ) {
                case 0: return zero == null ? '' : zero.replace( '{}', num )
                case 1: return one == null ? '' : one.replace( '{}', num )
                default: return many == null ? '' : many.replace( '{}', num )
            }
        },

        makeSet: function ( values ) {
            return values.reduce( function ( accum, v ) { accum[ v ] = true; return accum }, {} )
        },

        makeDelayedCall: function ( fn, option ) {
            var timeoutId

            function cancel() {
                if ( timeoutId ) clearTimeout( timeoutId )
                timeoutId = null
            }

            var delayedCall = function () {
                var ctxt = option.context || this
                var args = option.arguments || [].slice.call( arguments )

                cancel()

                timeoutId = setTimeout( function () {
                    timeoutId = null
                    fn.apply( ctxt, args )
                }, option.delay || 200 )
            }

            delayedCall.cancel = cancel

            return delayedCall
        },

        extractCRS: function ( obj ) {
            if ( obj.properties )
                if ( obj.properties.name )
                    return obj.properties.name

            throw new Error( 'unable to determine CRS from: ' + JSON.stringify( obj ) )
        },

        reproject: function ( geojson, crs ) {
            var self = this

            return include( 'projections' ).then( function ( inc ) {
                var proj = proj4( self.extractCRS( crs ) )

                return self.traverse.GeoJSON( geojson, {
                    coordinate: function ( c ) {
                        return proj.inverse( c )
                    }
                } )
            } )
        },

        traverse: {
            GeoJSON: function ( geojson, cb ) {
                Object.assign( {
                    coordinate: function ( c ) { return c }
                }, cb )

                return this[ geojson.type ]( geojson, cb )
            },

            Point: function ( obj, cb ) {
                return {
                    type: 'Point',
                    coordinates: cb.coordinate( obj.coordinates )
                }
            },

            MultiPoint: function ( obj, cb ) {
                return {
                    type: 'MultiPoint',
                    coordinates: obj.coordinates.map( function ( c ) { return cb.coordinate( c ) } )
                }
            },

            LineString: function ( obj, cb ) {
                return {
                    type: 'LineString',
                    coordinates: obj.coordinates.map( function ( c ) { return cb.coordinate( c ) } )
                }
            },

            MultiLineString: function ( obj, cb ) {
                return {
                    type: 'MultiLineString',
                    coordinates: obj.coordinates.map( function ( ls ) { return ls.map( function ( c ) { return cb.coordinate( c ) } ) } )
                }
            },

            Polygon: function ( obj, cb ) {
                return {
                    type: 'Polygon',
                    coordinates: obj.coordinates.map( function ( ls ) { return ls.map( function ( c ) { return cb.coordinate( c ) } ) } )
                }
            },

            MultiPolygon: function ( obj, cb ) {
                return {
                    type: 'MultiPolygon',
                    coordinates: obj.coordinates.map( function ( ps ) { return ps.map( function ( ls ) { return ls.map( function ( c ) { return cb.coordinate( c ) } ) } ) } )
                }
            },

            GeometryCollection: function ( obj, cb ) {
                var self = this
                return {
                    type: 'GeometryCollection',
                    geometries: obj.geometries.map( function ( g ) { return self[ g.type ]( g, cb ) } )
                }
            },

            FeatureCollection:  function ( obj, cb ) {
                var self = this
                return {
                    type: 'FeatureCollection',
                    features: obj.features.map( function ( f ) { return self[ f.type ]( f, cb ) } )
                }
            },

            Feature: function( obj, cb ) {
                return {
                    type: 'Feature',
                    geometry: this[ obj.geometry.type ]( obj.geometry, cb ),
                    properties: obj.properties
                }
            }
        },

        circlePoints: function ( center, radius, segmentCount ) {
            var points = []
            for( var i = 0; i <= segmentCount; i += 1 )
                points.push( [
                    center.x + radius * Math.cos( 2 * Math.PI * i / segmentCount ),
                    center.y + radius * Math.sin( 2 * Math.PI * i / segmentCount )
                ] )

            return points
        },

        findNearestSite: function ( location ) {
            var query = {
                point:              [ location.longitude, location.latitude ].join( ',' ),
                outputSRS:          4326,
                locationDescriptor: 'routingPoint',
                maxDistance:        1000,
            }

            return SMK.UTIL.makePromise( function ( res, rej ) {
                $.ajax( {
                    timeout:    10 * 1000,
                    dataType:   'json',
                    url:        'https://geocoder.api.gov.bc.ca/sites/nearest.geojson',
                    data:       query,
                } ).then( res, rej )
            } )
            .then( function ( data ) {
                return {
                    longitude:           data.geometry.coordinates[ 0 ],
                    latitude:            data.geometry.coordinates[ 1 ],
                    civicNumber:         data.properties.civicNumber,
                    civicNumberSuffix:   data.properties.civicNumberSuffix,
                    fullAddress:         data.properties.fullAddress,
                    localityName:        data.properties.localityName,
                    localityType:        data.properties.localityType,
                    streetName:          data.properties.streetName,
                    streetType:          data.properties.streetType,
                    // blockID
                    // changeDate1
                    // electoralArea
                    // fullSiteDescriptor
                    // isOfficial
                    // isStreetDirectionPrefix
                    // isStreetTypePrefix
                    // locationDescriptor
                    // locationPositionalAccuracy
                    // provinceCode
                    // siteID
                    // siteName
                    // siteRetireDate
                    // siteStatus
                    // streetDirection
                    // streetQualifier
                    // unitDesignator
                    // unitNumber
                    // unitNumberSuffix
                }
            } )
        },

        wrapFunction: function ( obj, fName, outer ) {
            return ( obj[ fName ] = ( function ( inner ) {
                return outer.call( null, inner )
            } )( obj[ fName ] ) )
        },

        asyncReduce: function ( cb, accum ) {
            var self = this

            return this.resolved()
                .then( function () { return accum } )
                .then( function ( arg ) {
                    var done
                    return cb( arg, function ( res ) { done = true; return res } )
                        .then( function ( res ) {
                            if ( done ) return res
                            return self.asyncReduce( cb, res )
                        } )
                } )
        },

        projection: function ( key ) {
            var keys = [].slice.call( arguments )

            return function ( obj ) {
                return keys.reduce( function ( accum, k ) {
                    if ( k in obj ) accum[ k ] = obj[ k ]
                    return accum
                }, {} )
            }
        },

        makeId: function () {
            var a = [].slice.call( arguments )
            return a
                .filter( function ( v ) { return v !== undefined } )
                .map( function ( v ) { return ( '' + v ).toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /^[-]|[-]$/g, '' ) } )
                .map( function ( v ) { return v ? v : '~' } )
                .join( '=' )
        },

        /////////////////////////////////////////////////////// START OF GEO JSON IMPORT SUPPORT ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        

            //print a geoJSONfile to a leaflet map
        addGeoJSONFileToMap: function ( geoJSONFile, color, stroke, fill, opacity, strokeWidth, lineCap, lineJoin, dashArray, dashOffset, fillColor, fillOpacity, fillRule ) {

        console.log ("color, stroke, fill, opacity, strokeWidth, lineCap, lineJoin, dashArray, dashOffset, fillColor, fillOpacity, is: ", 
        color, stroke, fill, opacity, strokeWidth, lineCap, lineJoin, dashArray, dashOffset, fillColor, fillOpacity, fillRule);

        //used to give each geometry collections added in the file to the map an ID that will be combined with date to be unique to this session
        // useful when trying to rebuild geomtry collections later
        let geometryCollectionCounter = 0;
        
        let date = new Date();
        let featureCollectionTimeAdded = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(); 

        let geoJSONStyle = {
            "color": color,
            "weight": strokeWidth,
            "opacity": opacity,
            "stroke": stroke,
            "strokeWidth": strokeWidth,
            "fill": fill,
            "lineCap": lineCap,
            "lineJoin": lineJoin,
            "dashArray": dashArray,
            "dashOffset": dashOffset,
            "fillColor": fillColor,
            "fillOpacity": fillOpacity,
            "fillRule": fillRule,
            
        }
        
        console.log(geoJSONFile);
        geoJSONFile = JSON.parse(geoJSONFile);
        console.log("GeoJSON file parsed: ", geoJSONFile);

        let map = SMK.MAP[1].$viewer.currentBasemap[0]._map;

        if (geoJSONFile.type == "Feature") {

            switch(geoJSONFile.geometry.type) {
                case "GeometryCollection":
                    SMK.UTIL.addGeoJSONGeometryCollectionAndStyleToMap(geoJSONFile, null, geoJSONStyle, map, "GeometryCollection", geometryCollectionCounter, "No Collection");
                    geometryCollectionCounter += 1;
                    break;
                case "Point":
                    SMK.UTIL.addGeoJSONPointAsCircleMarker(geoJSONFile, null, geoJSONStyle, map, "Point", "No Collection", "No Geo Collection", "No Geo Collection");
                    break;
                case "MultiPoint":
                    SMK.UTIL.addGeoJSONMultiPointsAsCircleMarker(geoJSONFile, null, geoJSONStyle, map, "MultiPoint", "No Collection", "No Geo Collection", "No Geo Collection")
                    break;
                default:
                    let mapLayer = L.geoJSON(geoJSONFile, {
                        style: geoJSONStyle,
                        originalGeoJSONType: geoJSONFile.geometry.type,
                        featureCollectionTime: "No Collection",
                        alt: "No Collection"
                    }).addTo(map);
                    this.ifContentExists(mapLayer, geoJSONFile);
            }
        } else if ( geoJSONFile.type == "FeatureCollection") {
            for ( let feature in geoJSONFile.features){
                if (geoJSONFile.features[feature].type == "Feature") {
                    switch(geoJSONFile.features[feature].geometry.type) {
                        // the types are passed in to addgeoJSONFeatureAndStyleToMap so that leaflet has access to them in objects, useful elsewhere
                        case "Point":
                            SMK.UTIL.addGeoJSONPointAsCircleMarker(geoJSONFile, feature, geoJSONStyle, map, "Point", featureCollectionTimeAdded, "No Geo Collection", "No Geo Collection");
                            break;
                        case "LineString":
                            SMK.UTIL.addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "LineString", featureCollectionTimeAdded);
                            break;
                        case "Polygon":
                            SMK.UTIL.addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "Polygon", featureCollectionTimeAdded);
                            break;
                        case "MultiPoint":
                            SMK.UTIL.addGeoJSONMultiPointsAsCircleMarker(geoJSONFile, feature, geoJSONStyle, map, "MultiPoint", featureCollectionTimeAdded, "No Geo Collection", "No Geo Collection")
                            break;
                        case "MultiLineString":
                            SMK.UTIL.addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "MultiLineString", featureCollectionTimeAdded);
                            break;
                        case "MultiPolygon":
                            SMK.UTIL.addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "MultiPolygon", featureCollectionTimeAdded);
                            break;
                        case "GeometryCollection":
                            SMK.UTIL.addGeoJSONGeometryCollectionAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "GeometryCollection", geometryCollectionCounter, featureCollectionTimeAdded);
                            geometryCollectionCounter += 1
                            break;
                        default:
                            console.log("Not one of the defaults")       
                    }
                // line strings are here also in case they're in included inside a file without being in a feature
                }  else if (geoJSONFile.features[feature].type == "LineString") {
                    SMK.UTIL.addgeoJSONFeatureAndStyleToMap(geoJSONFile, feature, geoJSONStyle, map, "LineString", featureCollectionTimeAdded);
                }
            }
        } else {
            return false;
        }
        return true;
    },


    ifContentExists: function ( leafletMapLayer, geoJSONFile) {
            if (typeof geoJSONFile.properties != "undefined"){
                if (geoJSONFile.properties.content != null) {
                    leafletMapLayer.bindTooltip(geoJSONFile.properties.content, {
                        permanent: true
                    }).openTooltip();
                }
            }
    },

    addGeoJSONPointAsCircleMarker: function (geoJSONFile, feature, geoJSONStyle, map, type, featureCollectionTimeAdded, geometryCollectionCounter, geoCollectionHour) {
        
        console.log("Inside add geo JSON Point as circle marker")
        let geojsonMarkerOptions = {
            radius: 1,
            fillColor: geoJSONStyle.fillColor,
            color: geoJSONStyle.color,
            weight: geoJSONStyle.weight,
            opacity: geoJSONStyle.opacity,
            fillOpacity: geoJSONStyle.fillOpacity,
            featureCollectionTime: featureCollectionTimeAdded,
            originalGeoJSONType: type,
            style: geoJSONStyle,
            creationID: geometryCollectionCounter,
            geoCollectionHour: geoCollectionHour
            

        };
        let mapLayer;

        if (feature == null && featureCollectionTimeAdded == "No Collection" && geometryCollectionCounter == "No Geo Collection"){
            // handles if there is no feature collection and no geometry collection aka just adding a feature by itself

            let geoJSONPointCoords = geoJSONFile.geometry.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[1]
            latlng[1] = geoJSONPointCoords[0]
            

            mapLayer = L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile);
            

        } else if (geometryCollectionCounter != "No Geo Collection" && featureCollectionTimeAdded != "No Collection"){
            //handles if there is a geometry collection and a feature collection
            let geoJSONPointCoords = geoJSONFile.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[0][1]
            latlng[1] = geoJSONPointCoords[0][0]

            mapLayer = L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile);

        } else if (geometryCollectionCounter != "No Geo Collection") {
            // handles if there is just a geo collection
            let geoJSONPointCoords = geoJSONFile.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[0][1]
            latlng[1] = geoJSONPointCoords[0][0]

            mapLayer = L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile);
        
            
        

        } else {
            // else handles if there is just a feature collection
            let geoJSONPointCoords = geoJSONFile.features[feature].geometry.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[1]
            latlng[1] = geoJSONPointCoords[0]


            mapLayer = L.geoJSON(geoJSONFile.features[feature], {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile.features[feature]);
        }


        
    },




    addGeoJSONMultiPointsAsCircleMarker: function (geoJSONFile, feature, geoJSONStyle, map, type, featureCollectionTimeAdded, geometryCollectionCounter, geoCollectionHour) {
        
        
        console.log("Inside add geo JSON Point as circle marker")
        let geojsonMarkerOptions = {
            radius: 1,
            fillColor: geoJSONStyle.fillColor,
            color: geoJSONStyle.color,
            weight: geoJSONStyle.weight,
            opacity: geoJSONStyle.opacity,
            fillOpacity: geoJSONStyle.fillOpacity,
            featureCollectionTime: featureCollectionTimeAdded,
            originalGeoJSONType: type,
            id : multiPointCollectionCounter,
            style: geoJSONStyle,
            creationID: geometryCollectionCounter,
            geoCollectionHour: geoCollectionHour


        };
        let mapLayer;

        if (feature == null && featureCollectionTimeAdded == "No Collection" && geometryCollectionCounter == "No Geo Collection"){
            // handles if there is no feature collection and no geometry collection aka just adding a feature by itself
            let geoJSONPointCoords = geoJSONFile.geometry.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[0][1]
            latlng[1] = geoJSONPointCoords[0][0]

            mapLayer = L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile);


        } else if (geometryCollectionCounter != "No Geo Collection" && featureCollectionTimeAdded != "No Collection"){
            //handles if there is a geometry collection and a feature collection

            let geoJSONPointCoords = geoJSONFile.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[0][1]
            latlng[1] = geoJSONPointCoords[0][0]


            mapLayer = L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile);


        } else if (geometryCollectionCounter != "No Geo Collection") {
            // handles if there is just a geo collection
            let geoJSONPointCoords = geoJSONFile.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[0][1]
            latlng[1] = geoJSONPointCoords[0][0]

            mapLayer = L.geoJSON(geoJSONFile, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile);


        } else {
            // else handles if there is just a feature collection
            let geoJSONPointCoords = geoJSONFile.features[feature].geometry.coordinates;
            let latlng = []
            latlng[0] = geoJSONPointCoords[0][1]
            latlng[1] = geoJSONPointCoords[0][0]

            mapLayer = L.geoJSON(geoJSONFile.features[feature], {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            this.ifContentExists(mapLayer, geoJSONFile.features[feature]);
            
        }
        multiPointCollectionCounter += 1
    },

    //default function used to add most features to a map
    addgeoJSONFeatureAndStyleToMap: function(geoJSONFile, feature, geoJSONStyle, map, type, featureCollectionTimeAdded) {
        
        let mapLayer = L.geoJSON(geoJSONFile.features[feature], {
            style: geoJSONStyle,
            originalGeoJSONType: type,
            featureCollectionTime: featureCollectionTimeAdded,
            originalGeoJSONFeatureCollection: geoJSONFile,
        }).addTo(map);
        this.ifContentExists(mapLayer, geoJSONFile.features[feature]);

    },

        //need to be able to identify geometry collections created in the session
        // need to break the geometry collection objects into individual types, but add the information that they're originally from a geometry collection
        // and include information on which geometry collection they're from so they can be re-assembled
    addGeoJSONGeometryCollectionAndStyleToMap: function(geoJSONFileGeoCollection, feature, geoJSONStyle, map, type, geometryCollectionCounter, featureCollectionTimeAdded){
        let date = new Date();
        let time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(); 

        console.log("The geometry collection looks like: ", geoJSONFileGeoCollection)
        let mapLayer;
        


        // in case the geometry collection isn't part of a feature collection
        if (feature == null && featureCollectionTimeAdded == "No Collection"){
            for (let geometry in geoJSONFileGeoCollection.geometry.geometries){
                //console.log("The inner geometries should be: ", geoJSONFileGeoCollection.geometry.geometries[geometry])

                if (geoJSONFileGeoCollection.geometry.geometries[geometry].type == "MultiPoint"){


                    SMK.UTIL.addGeoJSONMultiPointsAsCircleMarker(geoJSONFileGeoCollection.geometry.geometries[geometry], null, geoJSONStyle, map, "MultiPoint", "No Collection", geometryCollectionCounter, time)

                } else if(geoJSONFileGeoCollection.geometry.geometries[geometry].type == "Point") {
                    SMK.UTIL.addGeoJSONPointAsCircleMarker(geoJSONFileGeoCollection.geometry.geometries[geometry], null, geoJSONStyle, map, "Point", "No Collection", geometryCollectionCounter, time)

                } else {
                    mapLayer = L.geoJSON(geoJSONFileGeoCollection.geometry.geometries[geometry], {
                        style: geoJSONStyle,
                        originalGeoJSONType: type,
                        geoCollectionSubType: geoJSONFileGeoCollection.geometry.geometries[geometry].type,
                        hour: time,
                        creationID: geometryCollectionCounter,
                        originalGeometryCollectionObject: geoJSONFileGeoCollection,
                        featureCollectionTime: featureCollectionTimeAdded

                    }).addTo(map);
                    this.ifContentExists(mapLayer, geoJSONFileGeoCollection.geometry.geometries[geometry]);
                }
            }

        } else {
            for (let geometry in geoJSONFileGeoCollection.features[feature].geometry.geometries){
                //console.log("The inner geometries should be: ", geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry])

                if (geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry].type == "MultiPoint"){
                    SMK.UTIL.addGeoJSONMultiPointsAsCircleMarker(geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry], feature, geoJSONStyle, map, "MultiPoint", featureCollectionTimeAdded, geometryCollectionCounter, time)

                } else if(geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry].type == "Point") {
                    SMK.UTIL.addGeoJSONPointAsCircleMarker(geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry], feature, geoJSONStyle, map, "Point", featureCollectionTimeAdded, geometryCollectionCounter, time)

                } else {
                mapLayer = L.geoJSON(geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry], {
                    style: geoJSONStyle,
                    originalGeoJSONType: type,
                    geoCollectionSubType: geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry].type,
                    hour: time,
                    creationID: geometryCollectionCounter,
                    originalGeometryCollectionObject: geoJSONFileGeoCollection.features[feature],
                    featureCollectionTime:featureCollectionTimeAdded

                }).addTo(map);
                this.ifContentExists(mapLayer, geoJSONFileGeoCollection.features[feature].geometry.geometries[geometry]);
            }
        }
    }
}
///////////////////////////////////////////////////end of geoJSON importing support //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
















    } )

} )