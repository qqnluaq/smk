include.module( 'tool-sessionexport', [ 'tool', 'widgets', 'tool-sessionexport.panel-sessionexport-html' ], function ( inc ) {
    "use strict";

    
    var jsonDownloadValue = "Normal"
    var dynamicLink = "Placeholder"

    
    

    Vue.component( 'sessionexport-widget', {
        extends: inc.widgets.toolButton,
    } )

    Vue.component( 'sessionexport-panel', {
        extends: inc.widgets.toolPanel,
        template: inc[ 'tool-sessionexport.panel-sessionexport-html' ],
        props: [ 'content' ],
        
        data: function() {
            return {
              jsonDownloadLink: jsonDownloadValue,
              titleCheck: dynamicLink
            }
          }
        
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    function sessionexportTool( option ) {
        
        this.makePropWidget( 'icon', null ) //'help' )

        this.makePropPanel( 'content', null )

        SMK.TYPE.Tool.prototype.constructor.call( this, $.extend( {
            widgetComponent:'sessionexport-widget',
            panelComponent: 'sessionexport-panel',
            // title:          'sessionexport SMK',
            // position:       'menu'
            content:        null
            
        }, option ) )

    }

    // returns a nice geoJSON object with or without styles
    class GeoJSONcreator {

        //feature collection time is the time that the feature collection was created, used to group parts of feature collections that are seperated back together
        // multiPointID is used to put back together multi points that get seperated
        // geometryCollectionIDAndMultiPoint is used to put points and multi points back into their respective geocollections
        // geometryCollection hour is used in tandem with geometryCollectionIDAndMultiPoint to reassmble multi points and points with their geo collections
        
        constructor(mainType,  geometryType, coordinates, propertyName, propertyContent, propertyStyle, radius, featureCollectionTime, multiPointID, geometryCollectionIDPointAndMultiPoint, geometryCollectionHour ){
            this.mainType = mainType;
            this.geometryType = geometryType;
            this.coordinates = coordinates;
            this.name = propertyName;
            this.content = propertyContent;
            this.style = propertyStyle;
            this.radius = radius;
            this.featureCollectionTime = featureCollectionTime;
            this.multiPointID = multiPointID;
            this.geometryCollectionIDPointAndMultiPoint = geometryCollectionIDPointAndMultiPoint;
            this.geometryCollectionHour = geometryCollectionHour;
        }


        getGeoJSONObjectWithStyle(){
            let geoJSON = '{"type": "","geometry": {"type": "","coordinates": ""}, "properties": { "name" : "", "content": "", "style" : "", "radius" : "", "featureCollectionTime": null, "multiPointID": null, "geometryCollectionIDPointAndMultiPoint": null, "geometryCollectionHour": null } }';
            geoJSON = JSON.parse(geoJSON);

            geoJSON.type = this.mainType;
            geoJSON.geometry.type = this.geometryType;
            geoJSON.geometry.coordinates = this.coordinates;
            geoJSON.properties.name = this.name;
            geoJSON.properties.content = this.content;
            geoJSON.properties.style = this.style;
            geoJSON.properties.radius = this.radius;
            geoJSON.properties.featureCollectionTime = this.featureCollectionTime;
            geoJSON.properties.multiPointID = this.multiPointID;
            geoJSON.properties.geometryCollectionIDPointAndMultiPoint = this.geometryCollectionIDPointAndMultiPoint;
            geoJSON.properties.geometryCollectionHour = this.geometryCollectionHour;
            
            return geoJSON;
        }

    }


    // Gets JSON Layer information from smk and then assigns that to an object which can be downloaded
    // Going to build an entire JSON object structured after map-config.json
    // first need to build the map-config.json equivalent object, then can start copying data into it, then it can be provided as a
    // downloadable object
    function createJsonLink ( smk ) {

        let blob = new Blob([JSON.stringify(copyIntoJSONObject( smk ), null, 2)], {type : 'application/json'});
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = 'map-config.json';
        a.innerHTML = 'download JSON';
        jsonDownloadValue = a;
        a.dispatchEvent(new MouseEvent(`click`, {bubbles: true, cancelable: true, view: window}));
    }


    // creates a JSON object using the same structure as the eventual format as a map-config file
    function createSMKJSONObject () {

        let smkJSONHolder = {
                "lmfId": null,
                "lmfRevision" : null,
                "version" : null,
                "name": null,
                "project": null,
                "createdBy" : null,
                "createdDate" : null,
                "modifiedBy" : null, 
                "modifiedDate" : null,
                "published": null,
                "surround": {
                    "type": null,
                    "title": null,
                    "imageSrc": null
                },
                "viewer": {
                    "type": null,
                    "location": {
                        "extent": [],
                        "center": [],
                        "zoom": null
                    },
                "baseMap" : null,
                "activeTool" : null,
                "clusterOption": {
                    "showCoverageOnHover": null
                },
                "device": null,
                "themes": [],
                "deviceAutoBreakpoint": null,
                "panelWidth": null
            },
            "layers": [ 
                {}

            ],
            "tools": [
                {}
            ],
            "_id": null,
            "_rev": null,
            "drawings": [
            ]

            
            }

            return smkJSONHolder

    }

    //check if the passed object has tooltip, if it does it has content to be returned
    function checkForContent ( obj) {
        let content = null
        if ( obj._tooltip ) {
            content = obj._tooltip._content;
        }
        return content;
    }

    // copy over the current values from smk into our json object holder
    function copyFromsmk ( jsonObjectHolder, smk) {
        if ( jsonObjectHolder.hasOwnProperty("lmfId")  && smk.hasOwnProperty('lmfId')){
            //////console.log ("both have a lmfid property")
            jsonObjectHolder.lmfId = smk.lmfId;
        }
        if ( jsonObjectHolder.hasOwnProperty("lmfRevision")  && smk.hasOwnProperty('lmfRevision')){
            //////console.log ("both have a lmfRevision property")
            jsonObjectHolder.lmfRevision = smk.lmfRevision;
        }
        if ( jsonObjectHolder.hasOwnProperty("version")  && smk.hasOwnProperty('version')){
            //////console.log ("both have a version property")
            jsonObjectHolder.version = smk.version;
        }
        if ( jsonObjectHolder.hasOwnProperty("name")  && smk.hasOwnProperty('name')){
            //////console.log ("both have a name property")
            jsonObjectHolder.name = smk.name;
        }
        if ( jsonObjectHolder.hasOwnProperty("project")  && smk.hasOwnProperty('project')){
            //////console.log ("both have a project property")
            jsonObjectHolder.project = smk.project;
        }
        if ( jsonObjectHolder.hasOwnProperty("createdBy")  && smk.hasOwnProperty('createdBy')){
            //////console.log ("both have a createdBy property")
            jsonObjectHolder.createdBy = smk.createdBy;
        }
        if ( jsonObjectHolder.hasOwnProperty("createdDate")  && smk.hasOwnProperty('createdDate')){
            //////console.log ("both have a createdDate property")
            jsonObjectHolder.createdDate = smk.createdDate;
        }
        if ( jsonObjectHolder.hasOwnProperty("modifiedBy")  && smk.hasOwnProperty('modifiedBy')){
            //////console.log ("both have a modifiedBy property")
            jsonObjectHolder.modifiedBy = smk.modifiedBy;
        }
        if ( jsonObjectHolder.hasOwnProperty("modifiedDate")  && smk.hasOwnProperty('modifiedDate')){
            //////console.log ("both have a modifiedDate property")
            jsonObjectHolder.modifiedDate = smk.modifiedDate;
        }
        if ( jsonObjectHolder.hasOwnProperty("published")  && smk.hasOwnProperty('published')){
            //////console.log ("both have a published property")
            jsonObjectHolder.published = smk.published;
        }
        if ( jsonObjectHolder.hasOwnProperty("surround")  && smk.hasOwnProperty('surround')){
            //////console.log ("both have a surround property")
            jsonObjectHolder.surround = smk.surround;
        }
        if ( jsonObjectHolder.hasOwnProperty("viewer")  && smk.hasOwnProperty('viewer')){
            jsonObjectHolder.viewer = smk.viewer;
            
            // handle basemap
            let baseMap;
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Topo_Map")) {
                baseMap = "Topographic"; 
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Street_Map")) {
                baseMap = "Streets";
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Imagery")) {
                baseMap = "Imagery";
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Ocean_Base")) {
                baseMap = "Oceans";
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("NatGeo_World_Map")) {
                baseMap = "NationalGeographic";
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Dark_Gray_Base")) {
                baseMap = "DarkGray";
                
            }
            if ( smk.$viewer.currentBasemap[0]._url.includes("World_Light_Gray_Base")) {
                baseMap = "Gray";
                
            }
            jsonObjectHolder.viewer.baseMap = baseMap;
        }
        if ( jsonObjectHolder.hasOwnProperty("layers")  && smk.hasOwnProperty('layers')){
            //////console.log ("both have a layers property")
            jsonObjectHolder.layers = smk.layers;
        }
        if ( jsonObjectHolder.hasOwnProperty("tools")  && smk.hasOwnProperty("tools")){
            //////console.log ("both have a tools property")
            jsonObjectHolder.tools = smk.tools;
        }
        if ( jsonObjectHolder.hasOwnProperty("_id")  && smk.hasOwnProperty('_id')){
            //////console.log ("both have a _id property")
            jsonObjectHolder._id = smk._id;
        }
        if ( jsonObjectHolder.hasOwnProperty("_rev")  && smk.hasOwnProperty('_rev')){
            //////console.log ("both have a _rev property")
            jsonObjectHolder._rev = smk._rev;
        }
        return jsonObjectHolder
    }

    // takes the empty JSON holder and the smk object and fills the smkJSON holder with the useful values of smk to create a JSON file that can be used as a map-config
    // or at least as a similar file
    // should come back and clean this up into a readable for loop going through smk and checking all it's properties against jsonObjectHolder's properties that way

    // has to check state to see if the layers are enabled or disabled as well via checking smk.$viewer.visibleLayer
    function copyIntoJSONObject ( smk ){
        let jsonObjectHolder = createSMKJSONObject()

        jsonObjectHolder = copyFromsmk ( jsonObjectHolder, smk)

        // check state and set it appropriately for the various tool displayers
        // first turn everything off
        for (let tool in jsonObjectHolder.tools) {
            //////console.log(jsonObjectHolder.tools[y])
            if (jsonObjectHolder.tools[tool].type == "layers") {
                for ( let item in jsonObjectHolder.tools[tool].display) {
                    //////console.log(jsonObjectHolder.tools[y].display[x])
                    jsonObjectHolder.tools[tool].display[item].isVisible = false;
                }
            }
        }
        // then compare the tools display state to every visible layer, if there is a match then turn on the visibility
        for (let x in smk.$viewer.visibleLayer) {
            for (let y in jsonObjectHolder.tools) {
                if (jsonObjectHolder.tools[y].type == "layers") {
                    for ( let j in jsonObjectHolder.tools[y].display) {
                        if ( x == jsonObjectHolder.tools[y].display[j].id ) { 
                            jsonObjectHolder.tools[y].display[j].isVisible = true;
                        }

                        
                    }
                }
            }
        }
        // Going to get a list of all the layers currently in the system
        // then iterate through all existing objects to check for duplicates, if no duplicates are found then add both the tool version
        // and the layer version to  jsonLayersAndToolsToBeAdded array,
        //this allows for layers that have been added through tool-layer import to be carried into the main system
        let arrayOfJSONLayersAndTools = getArrayOfJSONLayers( smk )
        // need to first loop through all layers, to check for matches, if there is a match then don't add it
        
        // this object is going to store all the new layers that we'll add in the step during a for loop where no matches were found for that layer
        let jsonLayersAndToolsToBeAdded = []
        for (let newLayers in arrayOfJSONLayersAndTools) {
            for (let layer in jsonObjectHolder.layers) {
                //console.log("existing layer is: ", jsonObjectHolder.layers[layer].id)
                //console.log("possible new layer is: ", arrayOfJSONLayersAndTools[newLayers].jsonLayerInfo.id)
                if (jsonObjectHolder.layers[layer].id == arrayOfJSONLayersAndTools[newLayers].jsonLayerInfo.id) {
                    //console.log("Match, this layer should not be added")
                    break;
                } 
                // this should mean we're in the last length of the loop and there has not been a match, and therefore this layer should be added
                //console.log("Layer number is: ", layer)
                //console.log("total length is: ", jsonObjectHolder.layers.length)
                if (layer == (jsonObjectHolder.layers.length - 1)) {
                    //console.log("this one should be added")
                    //console.log("NOT MATCH existing layer is: ", jsonObjectHolder.layers[layer].id)
                    //console.log("NOT MATCH possible new layer is: ", arrayOfJSONLayersAndTools[newLayers].jsonLayerInfo.id)

                    jsonLayersAndToolsToBeAdded.push(arrayOfJSONLayersAndTools[newLayers]);
                }
            }       
        }
        // now to add these layers and tools into the main jsonObjectHolder object so they will be exported correctly
        for (let layerTool in jsonLayersAndToolsToBeAdded) {
            jsonObjectHolder.layers.push(jsonLayersAndToolsToBeAdded[layerTool].jsonLayerInfo)

            for (let tool in jsonObjectHolder.tools) {
                if (jsonObjectHolder.tools[tool].type == "layers" ){
                    jsonObjectHolder.tools[tool].display.push(jsonLayersAndToolsToBeAdded[layerTool].jsonToolLayerInfo);
                }
            }
        }
        // can find co-ordinates and zoom here, but only if it's changed
        if (smk.$viewer.map._animateToCenter){
            //////console.log(smk.$viewer.map._animateToCenter)
            jsonObjectHolder.viewer.location.center[0] = smk.$viewer.map._animateToCenter.lng;
            jsonObjectHolder.viewer.location.center[1] = smk.$viewer.map._animateToCenter.lat;
        }
        
        if (smk.$viewer.map._animateToZoom){
            //////console.log(smk.$viewer.map._animateToZoom)
            jsonObjectHolder.viewer.location.zoom = smk.$viewer.map._animateToZoom;
        }

        //handle all the exports of leaflet drawing layers as well as GeoJSON layers here
        if (smk.$viewer.type == "leaflet") {
            jsonObjectHolder = handleLeafletDrawingsAndGeoJSONLayers( smk, jsonObjectHolder );
        } else {
            ////console.log ("No esri3D support for circles yet, sorry.")
        }
        return jsonObjectHolder;
    }

    // Takes all the Layer information that comes from drawings or GeoJSON and converts it to GeoJSON for export 
    function fillDrawingsWithGeoJSON ( smk, jsonObjectHolder){
        let arrayOfGeometryCollections = []
        let arrayOfMultiPoints = []

        //this is a loop through every layer on the map
        for (let drawing in smk.$viewer.map._layers) {
       
            // if (typeof smk.$viewer.map._layers[drawing].options.style == "undefined") is true it means these are leaflet drawn drawings and not geoJson imports
            // this if is for leaflet layers created by the leaflet drawing tool
            if (typeof smk.$viewer.map._layers[drawing].options.style == "undefined") {

                    let drawingObj = getLeaftletDrawing(drawing, smk )
                    //check if drawing exists, and then convert it to geoJSON before adding it to the jsonObjectHolder
                    if (drawingObj != null) {
                        let geoJSONDrawingObj = convertLeafletDrawingToGeoJSON(drawingObj);
                        jsonObjectHolder.drawings.push( geoJSONDrawingObj );
                    }
                
                } else if (typeof smk.$viewer.map._layers[drawing].options.style !== "undefined" && typeof smk.$viewer.map._layers[drawing]._latlngs !== "undefined") {
                    // these should be all the layers imported through the geojson import tool in layerimport AKA were originally in GeoJSON
                    // need to handle geometry collections differently than straight geoJSON features
                    if (smk.$viewer.map._layers[drawing].options.originalGeoJSONType == "GeometryCollection"){
                        // check if arrayOfGeometryCollection already has a geometry collection in it
                        // if it does we need to find which element contains the other geometry collection pieces
                        if (arrayOfGeometryCollections.length != 0) {
                            for ( let element in arrayOfGeometryCollections) {
                                if (  checkForMatchingGeometryCollectionIDsAndHour(arrayOfGeometryCollections[element], smk.$viewer.map._layers[drawing])) {
                                    arrayOfGeometryCollections[element].arrayOfGeoCollectionElements.push(smk.$viewer.map._layers[drawing])
                                } else {
                                    // only should be added if we've already checked the other elements in the array to make sure there was nothing there
                                    if (element == arrayOfGeometryCollections.length - 1) {
                                        //must be a part of a different geometry collection
                                        arrayOfGeometryCollections.push(  createJSONGeometryCollectionObject(smk.$viewer.map._layers[drawing])   );
                                    }
                                }
                            }                          
                        } else {
                            // if the array doesn't have any elements in it, we can add the first element to the array which contains this geometry element
                            // as well as it's ID and Time for identification
                            arrayOfGeometryCollections.push(  createJSONGeometryCollectionObject(smk.$viewer.map._layers[drawing])   );
                        }
                    } else {
                        // handles everything that isn't a GeoJSON Geometry Collection
                        let geoJSONFromImport = retrieveExistingGeoJSONFromLeaflet(smk.$viewer.map._layers[drawing]);
                        jsonObjectHolder.drawings.push(geoJSONFromImport);
                    }

                // handles addition of point and multi point markers that only have a _latlng not a _latlngs
                } else if (typeof smk.$viewer.map._layers[drawing].options.style !== "undefined" && typeof smk.$viewer.map._layers[drawing]._latlng !== "undefined") {
                    if (smk.$viewer.map._layers[drawing].options.originalGeoJSONType == "MultiPoint") {
                        //multi points require special handling of their GeoJSON once retrieved to be reassembled into their multiarray form rather than seperate multipoint arrays
                        if (arrayOfMultiPoints.length != 0) {
                            for ( let element in arrayOfMultiPoints) {
                                if (  checkForMatchingMultiPointIDs(arrayOfMultiPoints[element], smk.$viewer.map._layers[drawing])) {
                                    arrayOfMultiPoints[element].arrayOfMultiPointElements.push(    smk.$viewer.map._layers[drawing]  )
                                } else {
                                    // only should be added if we've already checked the other elements in the array to make sure there was nothing there
                                    if (element == arrayOfMultiPoints.length - 1) {
                                    arrayOfMultiPoints.push( createJSONMultiPointCollectionObject(smk.$viewer.map._layers[drawing] ));
                                    }
                                }
                            }                          
                        } else {
                            // if the array doesn't have any elements in it, we can add the first element to the array which contains this multipoint element
                            // as well as it's ID and Time for identification
                            arrayOfMultiPoints.push( createJSONMultiPointCollectionObject(smk.$viewer.map._layers[drawing] ));
                        }
                    } else {
                        let geoJSONFromImport = retrieveExistingGeoJSONFromLeaflet(smk.$viewer.map._layers[drawing]);
                        jsonObjectHolder.drawings.push(geoJSONFromImport);
                    }
             }
        }
        // with all the multi point collections gathered together we need to assemble each element into the array (containing seperate multi points) into one multi point for each array element
        if (arrayOfMultiPoints.length != 0) {
            for (let multiPointElement in arrayOfMultiPoints){
                let multiPointGeoJSON = reassembleMultiPoints(arrayOfMultiPoints[multiPointElement]);
                jsonObjectHolder.drawings.push(multiPointGeoJSON);
            }
        }

        // Once all the geomtry collections are, well collected they need to be built into their correct geoJSON, 
        if (arrayOfGeometryCollections.length != 0) {
            //console.log("need to process all elements in the geometry collection array here");
            //console.log("All the geometry collection elements should be in this array sorted by collection: ", arrayOfGeometryCollections);
            for (let element in arrayOfGeometryCollections){
                let geoJSONFromImport = reassambleGeoJSONGeometryCollection(arrayOfGeometryCollections[element]);
                //console.log("The returned value from reassmbleGeoJSONGeometryCollection looks like: ", geoJSONFromImport)
                jsonObjectHolder.drawings.push(geoJSONFromImport);
                //console.log("After pushing the geoJSONFromImport onto jsonObjectHolder.drawings it looks like: ", jsonObjectHolder.drawings)
            }
        }

        // Now that the geometry collections are collected and identified, and all the multipoints and points are assemblemed in JSON, the two can be combined
        // we can loop through the available drawings for geometry collections, and then if a point matches their ID and hour it can be added to that geometry collection
        // if an encountered point has no collection then we can break
        // we'll make the changes into a copied version of jsonObjectHolder and then assign that to the actual jsonObjectHolder once the changes are made

        let tempJsonObjectHolder = jsonObjectHolder.drawings;
        for ( let maybeGeoCollection in jsonObjectHolder.drawings){
            // is this a geometry collection or is it a geometry collection inside a feature, both are fine
            if (jsonObjectHolder.drawings[maybeGeoCollection].type == "Feature" && jsonObjectHolder.drawings[maybeGeoCollection].geometry.type == "GeometryCollection" ){
                for (let maybeGeoCollectionElement in jsonObjectHolder.drawings){
                    if (isPointOrMultiFromGeoCollection(jsonObjectHolder.drawings[maybeGeoCollectionElement], jsonObjectHolder.drawings[maybeGeoCollection] ) ) {

                        // because features keep their properties above their geometry, the properties need to be grabbed and recombined with the geometry collection to fit in a geo collection
                        let tempJsonPointOrMultiPointObject = jsonObjectHolder.drawings[maybeGeoCollectionElement].geometry;
                        tempJsonPointOrMultiPointObject.properties = (jsonObjectHolder.drawings[maybeGeoCollectionElement].properties);
                        tempJsonObjectHolder[maybeGeoCollection].geometry.geometries.push(tempJsonPointOrMultiPointObject);

                    }
                }
            }
        }
        // Now that all the points and multi points that should be inside their geoCollections are safely inside we'll copy over everything inside a geoCollection, or outside that has the
        // No Geo Collection value for their geometryCollectionIDPointAndMultiPoint
        jsonObjectHolder.drawings = []
        for (let drawing in tempJsonObjectHolder){
            if ( typeof tempJsonObjectHolder[drawing].properties != "undefined" && typeof tempJsonObjectHolder[drawing].properties.geometryCollectionIDPointAndMultiPoint != "undefined" && tempJsonObjectHolder[drawing].geometry.type != "GeometryCollection" && tempJsonObjectHolder[drawing].properties.geometryCollectionIDPointAndMultiPoint != "No Geo Collection" && tempJsonObjectHolder[drawing].properties.geometryCollectionIDPointAndMultiPoint != null){
                console.log("This element should be inside a geocollection already, and since it isn't it's not getting transfered over")
            } else {
                jsonObjectHolder.drawings.push(tempJsonObjectHolder[drawing])
            }  
        }
        return jsonObjectHolder;
    }

    //first check if feature is a point or multi point
    // if not then return
    // then if it is,
    // check if it's geometryCollectionIDPointAndMultiPoint equals "No Geo Collection", if so then return
    // if not then compare it's geometryCollectionIDPointAndMultiPoint and geometryCollecionHour for a match
    function isPointOrMultiFromGeoCollection ( maybeGeoCollectionPointOrMultiPoint, geoCollection){
        let match = false
        //checking if it's a point or multi point, if it isn't return false
        if (maybeGeoCollectionPointOrMultiPoint.geometry.type == "Point" || maybeGeoCollectionPointOrMultiPoint.geometry.type == "MultiPoint"){
                // checking if it's part of a geo collection, if it isn't return false
            if (maybeGeoCollectionPointOrMultiPoint.properties.geometryCollectionIDPointAndMultiPoint == "No Geo Collection"){
                return match;
            }
            //checking if ID's and hours match
            if (maybeGeoCollectionPointOrMultiPoint.properties.geometryCollectionIDPointAndMultiPoint == geoCollection.geometryCollectionIDPointAndMultiPoint && maybeGeoCollectionPointOrMultiPoint.properties.geometryCollectionHour == geoCollection.geometryCollectionHour){
                
                match = true;
                return match;
            }
        }
        return match;
    }


    function createJSONMultiPointCollectionObject ( geoJSONFromLeaflet ) {
        let jsonArrayElements = '{ "id": "", "arrayOfMultiPointElements": [] }'
        jsonArrayElements = JSON.parse(jsonArrayElements)
        jsonArrayElements.id = geoJSONFromLeaflet.options.id
        jsonArrayElements.arrayOfMultiPointElements.push(geoJSONFromLeaflet)

        return jsonArrayElements

    }

    function reassembleMultiPoints( multiPointElements){

        let multiPointGeoJSONIndividual = [];

        for (let individualMultiPoints in multiPointElements.arrayOfMultiPointElements){
            multiPointGeoJSONIndividual.push(retrieveExistingGeoJSONFromLeaflet(multiPointElements.arrayOfMultiPointElements[individualMultiPoints]));
        }

        for (let singleMultiPoint in multiPointGeoJSONIndividual){
            if (singleMultiPoint != 0) {

            multiPointGeoJSONIndividual[0].geometry.coordinates[0].push(multiPointGeoJSONIndividual[singleMultiPoint].geometry.coordinates[0]);
            }
        }
        return multiPointGeoJSONIndividual[0];

    }

    function checkForMatchingMultiPointIDs (arrayOfMultiPoints, multiPointElement){
        let match = false
        if (arrayOfMultiPoints.id == multiPointElement.options.id ){
            match = true;
        }
        return match
    }


    function handleLeafletDrawingsAndGeoJSONLayers ( smk, jsonObjectHolder ){
                   // geometry collections can be multiple objects and must be stored in an array of their subelements until they can be all collected at once
                    jsonObjectHolder = fillDrawingsWithGeoJSON(smk, jsonObjectHolder)
                   //  wrap everything that comes from a feature collection in it's feature collection, that way markers which are outside their feature collections
                   // will not interfere, eg we will only check markers outside feature elements versus markers inside feature elements

                   // we can assume that points appear by themselves, or as part of a collection which contains other non point elements
                   console.log("Before building the feature collection objects the drawing array looks like: ", jsonObjectHolder.drawings)

                   let arrayOfFeatureCollections = []
                   for ( let drawing in jsonObjectHolder.drawings){
                        let featureCollection = '{ "type": "FeatureCollection", "features" : [], "properties": { "featureCollectionID" : null}} ';
                        featureCollection = JSON.parse(featureCollection);
                        let featureCollectionID = null

                        console.log("This drawing looks like: ", jsonObjectHolder.drawings[drawing])
                        switch(jsonObjectHolder.drawings[drawing].geometry.type) {
                            case "Point":
                                console.log(jsonObjectHolder.drawings[drawing].properties.featureCollectionTime)
                                featureCollectionID = getFeatureElementFeatureCollectionTime( jsonObjectHolder.drawings[drawing])
                                console.log("The feature collection ID is: ", featureCollectionID)
                                arrayOfFeatureCollections = buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing])
                                break;
                            case "LineString":
                                console.log(jsonObjectHolder.drawings[drawing].properties.featureCollectionTime)
                                featureCollectionID = getFeatureElementFeatureCollectionTime( jsonObjectHolder.drawings[drawing])
                                console.log("The feature collection ID is: ", featureCollectionID)
                                arrayOfFeatureCollections = buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing])
                                break;
                            case "Polygon":
                                console.log(jsonObjectHolder.drawings[drawing].properties.featureCollectionTime)
                                featureCollectionID = getFeatureElementFeatureCollectionTime( jsonObjectHolder.drawings[drawing])
                                console.log("The feature collection ID is: ", featureCollectionID)
                                arrayOfFeatureCollections = buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing])
                                break;
                            case "MultiPoint":
                                console.log(jsonObjectHolder.drawings[drawing].properties.featureCollectionTime)
                                featureCollectionID = getFeatureElementFeatureCollectionTime( jsonObjectHolder.drawings[drawing])
                                console.log("The feature collection ID is: ", featureCollectionID)
                                arrayOfFeatureCollections = buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing])
                                break;
                            case "MultiLineString":
                                console.log(jsonObjectHolder.drawings[drawing].properties.featureCollectionTime)
                                featureCollectionID = getFeatureElementFeatureCollectionTime( jsonObjectHolder.drawings[drawing])
                                console.log("The feature collection ID is: ", featureCollectionID)
                                arrayOfFeatureCollections = buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing])
                                break;
                            case "MultiPolygon":
                                console.log(jsonObjectHolder.drawings[drawing].properties.featureCollectionTime)
                                featureCollectionID = getFeatureElementFeatureCollectionTime( jsonObjectHolder.drawings[drawing])
                                console.log("The feature collection ID is: ", featureCollectionID)
                                arrayOfFeatureCollections = buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing])
                                break;
                            case "GeometryCollection":
                            
                                featureCollectionID = getFeatureElementFeatureCollectionTimeForGeometryCollection( jsonObjectHolder.drawings[drawing].geometry )
                                console.log("The feature collection ID is: ", featureCollectionID)
                                arrayOfFeatureCollections = buildingAFeatureCollection ( arrayOfFeatureCollections, featureCollection, featureCollectionID, jsonObjectHolder.drawings[drawing])
                                break;
                            default:
                                console.log("Not one of the choices")  


                        }
                   }
                   // now that all the featureCollections have been built it should be safe to add them to the jsonObjectHolder, though ideally we'll clear out any element with
                   // a feature collection id first, which works fine for non-markers. All loose markers outside collections 

                   // remove all features with feature elements
                   // create a temporary array to hold the drawings we want to keep
                   let tempDrawings = []
                   for ( let drawing in jsonObjectHolder.drawings) {
                       
                       if ( typeof jsonObjectHolder.drawings[drawing].properties =="undefined" || jsonObjectHolder.drawings[drawing].properties.featureCollectionTime != null){

                           // this if handles the loose No Collection features which are supposed to be kept as they were added outside a feature collection (for non-geo collection)
                            if (typeof jsonObjectHolder.drawings[drawing].properties !="undefined" && jsonObjectHolder.drawings[drawing].properties.featureCollectionTime == "No Collection"){
                                tempDrawings.push(jsonObjectHolder.drawings[drawing])

                            // the else-if on the other hand handles loose No Collection features which are kept as they're added outside a feature collection but are GeometryCollections
                            } else if(typeof jsonObjectHolder.drawings[drawing].geometry.type !="undefined" && jsonObjectHolder.drawings[drawing].geometry.type == "GeometryCollection"){
                                for ( let geometryCollectionElement in jsonObjectHolder.drawings[drawing].geometry.geometries){
                                    if (typeof jsonObjectHolder.drawings[drawing].geometry.geometries[geometryCollectionElement].properties !="undefined" && jsonObjectHolder.drawings[drawing].geometry.geometries[geometryCollectionElement].properties.featureCollectionTime == "No Collection"){
                                        tempDrawings.push(jsonObjectHolder.drawings[drawing])
                                        break
                                    }
                                }
                            } else {
                                //this deletes all the elements that are part of feature collections and are already safely in those feature collections
                                delete jsonObjectHolder.drawings[drawing];
                            }
                        
                       } else {
                           tempDrawings.push(jsonObjectHolder.drawings[drawing])
                       }

                   }

                   jsonObjectHolder.drawings = tempDrawings;

                   // once they're all removed the json object holder drawings can have the feature element collections added
                   for (let featureCollectionFromArray in arrayOfFeatureCollections){
                       jsonObjectHolder.drawings.push(arrayOfFeatureCollections[featureCollectionFromArray])
                   }


        return jsonObjectHolder
    }



    function buildingAFeatureCollection( arrayOfFeatureCollections, featureCollectionJSON, featureCollectionID, geoJSONFeature ){

        //First we check if the array of feature collections is empty, if it is we skip to the else where we put the first element in it
        // However if it's not empty we start comparing it's feature collection ID, with the feature collection ID of the element we're looking to add
        // If there is a match, great add that feature to the feature collection object inside the array
        // if there isn't a match we need to wait until we've checked every element of the array, if there still isn't a match we need to create a new array element and push that
        
        // This if handles points being added which still do not have proper processing AND any feature that isn't part of a collection
        if (featureCollectionID == null || featureCollectionID == "No Collection"){
            return arrayOfFeatureCollections
        }

        console.log("The array of feature collections currently looks like: ", arrayOfFeatureCollections)
        console.log("our feature collection JSON looks like: ", featureCollectionJSON)
        console.log("The current feature collection ID is: ", featureCollectionID)
        console.log("The current geoJSON feature we're looking to add to the feature collection is: ", geoJSONFeature)

        if (arrayOfFeatureCollections.length != 0) {
            for (let featureCollection in arrayOfFeatureCollections){
                
                // this is the simplest option, we looked for a match and found one so we're adding this feature to that collection
                if (arrayOfFeatureCollections[featureCollection].properties.featureCollectionID == featureCollectionID) {
                    arrayOfFeatureCollections[featureCollection].features.push(geoJSONFeature)
                    break;

                } else {
                    // this is where we checked all existing elements and couldn't find a match so we've added one
                    if (featureCollection == arrayOfFeatureCollections.length - 1){
                        featureCollectionJSON.properties.featureCollectionID = featureCollectionID
                        featureCollectionJSON.features.push(geoJSONFeature)
                        arrayOfFeatureCollections.push( featureCollectionJSON)
                    }
                }
           }
           // this else handles the condition where there isn't anything in the array of feature collections yet so we need to place the first feature collection object into it with the first feature
        } else {
            featureCollectionJSON.properties.featureCollectionID = featureCollectionID
            featureCollectionJSON.features.push(geoJSONFeature)
            arrayOfFeatureCollections.push( featureCollectionJSON)
        }


        console.log("After all transformations to the array of feature collections it looks like: ", arrayOfFeatureCollections)
        return arrayOfFeatureCollections
    }


    function getFeatureElementFeatureCollectionTime ( feature ){
        return feature.properties.featureCollectionTime;
        
    }

    function getFeatureElementFeatureCollectionTimeForGeometryCollection ( feature ){
        for ( let geometry in feature.geometries){

           if(feature.geometries[geometry].properties.featureCollectionTime != null) {
               return feature.geometries[geometry].properties.featureCollectionTime
           }
        }
        console.log("Wait.")
    }

    function reassambleGeoJSONGeometryCollection( element ){
        let geoJSONGeomtryCollectionObj = '{ "type": "Feature", "geometry": { "type": "GeometryCollection", "geometries": [] }, "geometryCollectionIDPointAndMultiPoint": null, "geometryCollectionHour": null }';
        geoJSONGeomtryCollectionObj = JSON.parse(geoJSONGeomtryCollectionObj);
        console.log("The element is: ", element)

        let geometryCollectionID = element.arrayOfGeoCollectionElements[0].options.creationID;
        let hour = element.arrayOfGeoCollectionElements[0].options.hour;
        
        let originalGeoJSONGeometryCollection = element.arrayOfGeoCollectionElements[0].options.originalGeometryCollectionObject;
        console.log("the original Geometry collection looked like: ", originalGeoJSONGeometryCollection);
        
        for (let geoInformation in element.arrayOfGeoCollectionElements){
            console.log(" a element[geoInformation] contains: ", element.arrayOfGeoCollectionElements[geoInformation]);

            // this function is designed to return the element as a feature object, so once we have the information we need
            // it needs to be pulled out of the geoJSON and assigned to our geometry collection object
           let geoJSON = retrieveExistingGeoJSONFromLeaflet( element.arrayOfGeoCollectionElements[geoInformation]);
           console.log("function created geoJSON is: ", geoJSON);
            let geoJSONGeometryCollectionJSON = '{ "type": "", "coordinates": "", "properties": { "name" : null, "content" : null, "style" : null, "radius" : null, "featureCollectionTime": null }}';

            geoJSONGeometryCollectionJSON = JSON.parse(geoJSONGeometryCollectionJSON);
            geoJSONGeometryCollectionJSON.type = geoJSON.geometry.type;
            geoJSONGeometryCollectionJSON.coordinates = geoJSON.geometry.coordinates;

            geoJSONGeometryCollectionJSON.properties.name =  geoJSON.geometry.type;
            geoJSONGeometryCollectionJSON.properties.content = geoJSON.properties.content;
            geoJSONGeometryCollectionJSON.properties.style = geoJSON.properties.style;
            geoJSONGeometryCollectionJSON.properties.featureCollectionTime = geoJSON.properties.featureCollectionTime;

            geoJSONGeomtryCollectionObj.geometryCollectionIDPointAndMultiPoint = geometryCollectionID;
            geoJSONGeomtryCollectionObj.geometryCollectionHour = hour;

            geoJSONGeomtryCollectionObj.geometry.geometries.push(geoJSONGeometryCollectionJSON);

        }

        console.log("The finalized new geoJSONGeomtryCollectionObj looks like: ", geoJSONGeomtryCollectionObj)

        return geoJSONGeomtryCollectionObj

    }

    function comparePoints( originalPoint, currentPoint){
        let match = false;
        console.log("inside compare points with points: ", originalPoint.coordinates, currentPoint.geometry.coordinates )
        if ( JSON.stringify(originalPoint.coordinates) === JSON.stringify(currentPoint.geometry.coordinates)){
            match = true
            console.log("The two points matched!")
        }
        return match
    }


    function checkForMatchingGeometryCollectionIDsAndHour( arrayOfGeoCollectionElementsElement, geoJSONFromLeaflet ){
        let match = false
        //console.log("array ID is: ", arrayOfGeoCollectionElementsElement.id, "and geoJSON id is: ", geoJSONFromLeaflet.options.creationID)
        //console.log("array hour is: ", arrayOfGeoCollectionElementsElement.hour, " and geoJSON hour is: ", geoJSONFromLeaflet.options.hour)

        if (arrayOfGeoCollectionElementsElement.id == geoJSONFromLeaflet.options.creationID && arrayOfGeoCollectionElementsElement.hour == geoJSONFromLeaflet.options.hour){
            match = true;
            //(console.log("Match!"))
        }
        return match
    }

    function createJSONGeometryCollectionObject ( geoJSONFromLeaflet){
        let jsonArrayElements = '{ "id": "", "hour": "", "arrayOfGeoCollectionElements": [] }'
        jsonArrayElements = JSON.parse(jsonArrayElements)
        jsonArrayElements.id = geoJSONFromLeaflet.options.creationID
        jsonArrayElements.hour = geoJSONFromLeaflet.options.hour
        jsonArrayElements.arrayOfGeoCollectionElements.push(geoJSONFromLeaflet)

        return jsonArrayElements
    }

    // retrieves actual json data from the information leaflet has in smk.$viewer.map._layers and returns a GeoJSON object
    function retrieveExistingGeoJSONFromLeaflet ( geoJSONFromLeaflet ){
        let rebuiltGeoJSON = null;
        let geoJSONObject = null;
        let toolTipInfo = null;

        if (typeof geoJSONFromLeaflet._tooltip != "undefined" && geoJSONFromLeaflet._tooltip != null){
            toolTipInfo = geoJSONFromLeaflet._tooltip._content;
        }

        //console.log("The passed in object is: ", geoJSONFromLeaflet )
        //console.log("The styling for this object is: ", geoJSONFromLeaflet.options.style);
        //console.log("The co-ords for imported geoJson layers is: ", geoJSONFromLeaflet._latlngs);
        // if the object we're coming from is a GeometryCollection we want to base the switch on it's subtype rather than original type
        if ( geoJSONFromLeaflet.options.originalGeoJSONType == "GeometryCollection"){
            switch(geoJSONFromLeaflet.options.geoCollectionSubType) {
                case "Point":
                    geoJSONObject = new GeoJSONcreator("Feature", "Point", convertLeafletLatLngToGeoJSONPointAndMultiPoints(geoJSONFromLeaflet._latlng, "Point"), "Point", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null,  geoJSONFromLeaflet.options.creationID, geoJSONFromLeaflet.options.geoCollectionHour)
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "LineString":
                    geoJSONObject = new GeoJSONcreator("Feature", "LineString", convertLeafletLatLngArrayToGeoJSONStandard(geoJSONFromLeaflet._latlngs), "LineString", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null)
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "Polygon":
                    geoJSONObject = new GeoJSONcreator("Feature", "Polygon", convertLeafletLatLngArrayToGeoJSONStandardForPolygons(geoJSONFromLeaflet._latlngs), "Polygon", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null)
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "MultiPoint":
                    geoJSONObject = new GeoJSONcreator("Feature", "MultiPoint", convertLeafletLatLngToGeoJSONPointAndMultiPoints(geoJSONFromLeaflet._latlng, "MultiPoint"), "MultiPoint", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, geoJSONFromLeaflet.options.id, geoJSONFromLeaflet.options.creationID, geoJSONFromLeaflet.options.geoCollectionHour)
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "MultiLineString":
                    geoJSONObject = new GeoJSONcreator("Feature", "MultiLineString", convertLatLngArrayToGeoJSONStandardForMultiLineStrings(geoJSONFromLeaflet._latlngs), "MultiLineString", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null)
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "MultiPolygon":
                    geoJSONObject = new GeoJSONcreator("Feature", "MultiPolygon", convertLatLngArrayToGeoJSONStandardForMultiPolygons(geoJSONFromLeaflet._latlngs), "MultiPolygon", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null)
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                default:
                    console.log("Not one of the defaults")  
            }
        } else {
            switch(geoJSONFromLeaflet.options.originalGeoJSONType) {
                case "Point":
                    geoJSONObject = new GeoJSONcreator("Feature", "Point", convertLeafletLatLngToGeoJSONPointAndMultiPoints(geoJSONFromLeaflet._latlng, "Point"), "Point", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, geoJSONFromLeaflet.options.creationID, geoJSONFromLeaflet.options.geoCollectionHour)
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "LineString":
                    console.log("inside line string case, latlngs are: ", geoJSONFromLeaflet._latlngs)
                    console.log("inside line string case, latlngs[0] is: ", geoJSONFromLeaflet._latlngs[0])
    
                    geoJSONObject = new GeoJSONcreator("Feature", "LineString", convertLeafletLatLngArrayToGeoJSONStandard(geoJSONFromLeaflet._latlngs), "LineString", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null)
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "Polygon":
                    geoJSONObject = new GeoJSONcreator("Feature", "Polygon", convertLeafletLatLngArrayToGeoJSONStandardForPolygons(geoJSONFromLeaflet._latlngs), "Polygon", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null)
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "MultiPoint":
                    geoJSONObject = new GeoJSONcreator("Feature", "MultiPoint", convertLeafletLatLngToGeoJSONPointAndMultiPoints(geoJSONFromLeaflet._latlng ,"MultiPoint"), "MultiPoint", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, geoJSONFromLeaflet.options.id, geoJSONFromLeaflet.options.creationID, geoJSONFromLeaflet.options.geoCollectionHour)
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "MultiLineString":
                    geoJSONObject = new GeoJSONcreator("Feature", "MultiLineString", convertLatLngArrayToGeoJSONStandardForMultiLineStrings(geoJSONFromLeaflet._latlngs), "MultiLineString", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null)
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                case "MultiPolygon":
                    geoJSONObject = new GeoJSONcreator("Feature", "MultiPolygon", convertLatLngArrayToGeoJSONStandardForMultiPolygons(geoJSONFromLeaflet._latlngs), "MultiPolygon", toolTipInfo, geoJSONFromLeaflet.options.style, null, geoJSONFromLeaflet.options.featureCollectionTime, null, null, null)
                    rebuiltGeoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                    break;
                default:
                    console.log("Not one of the defaults")  
            }
        }
        return rebuiltGeoJSON
    }

       //leaflet does lat, then lng, everything else is lng then lat
    // for multiple points
    function convertLeafletLatLngArrayToGeoJSONStandardForPolygons( latlngs ) {
        
        let holdingArray = [];
        let firstPoint = null;
        console.log("The latlngs object is: ", latlngs)
        //for points that don't have an array of latlngs and just have one
        console.log("Should have multiple latlngs")
        // in this case there are multiple to look for

        for (let outerArr in latlngs){
            let convertedLNGLATS = [];
            for (let latlng in latlngs[outerArr]){
                let convertedLNGLAT = [];
                convertedLNGLAT.push(latlngs[outerArr][latlng].lng);
                convertedLNGLAT.push(latlngs[outerArr][latlng].lat);
                convertedLNGLATS.push(convertedLNGLAT);
                // need to handle storage of the first geometry point so we don't forget it becuase leaflet likes to ignore the extra point
                if ( latlng == 0){      
                    firstPoint = convertedLNGLAT;
                }
                 //then if we're done the loop need to add that last element back on before we move on
                 if ( latlng == (latlngs[outerArr].length - 1) ){
                            
                    convertedLNGLATS.push(firstPoint);
                    firstPoint = null
                }

            }
            
            holdingArray.push(convertedLNGLATS)
        }

        return holdingArray;
    
    }

     //converted for and multi line strings
    function convertLatLngArrayToGeoJSONStandardForMultiLineStrings( latlngs ) {
        
        let outerArray = [];
        console.log("The latlngs object is: ", latlngs)
        
        // in this case there are multiple to look for
        for (let collectionOfCoords in latlngs){
            let convertedLNGLATS = [];
            for ( let latlng in latlngs[collectionOfCoords]) {
                let convertedLNGLAT = [];
                convertedLNGLAT.push(latlngs[collectionOfCoords][latlng].lng);
                convertedLNGLAT.push(latlngs[collectionOfCoords][latlng].lat);
                convertedLNGLATS.push(convertedLNGLAT);
            }
        outerArray.push(convertedLNGLATS);
        }
        return outerArray;
    }

         //converted for and multi line polygons
    function convertLatLngArrayToGeoJSONStandardForMultiPolygons( latlngs ) {

        let finalArray = []
        let firstPoint = null
        
        console.log("The latlngs object of the multipolygon is: ", latlngs)
        
        for ( let outerArrayElements in latlngs){
            let outerArray = []
            for (let middleArrayElements in latlngs[outerArrayElements]){
                let middleArray = [];
                for ( let latlng in latlngs[outerArrayElements][middleArrayElements]) {

                    
                    let convertedLNGLAT = [];
                    convertedLNGLAT.push(latlngs[outerArrayElements][middleArrayElements][latlng].lng);
                    convertedLNGLAT.push(latlngs[outerArrayElements][middleArrayElements][latlng].lat);
                    // need to handle storage of the first geometry point so we don't forget it becuase leaflet likes to ignore the extra point
                    if ( latlng == 0){
                        
                        firstPoint = convertedLNGLAT;
                        
                    }

                    middleArray.push(convertedLNGLAT);
                    //then if we're done the loop need to add that last element back on before we move on
                    if ( latlng == (latlngs[outerArrayElements][middleArrayElements].length - 1) ){
                        
                        middleArray.push(firstPoint);
                        firstPoint = null
                    }

                }
                outerArray.push(middleArray)
            }
            finalArray.push(outerArray)
        }
        return finalArray;
    }

    function convertLeafletDrawingToGeoJSON (leafletDrawingObject ){

        
        let geoJSON = null;
        let geoJSONObject = null;

        console.log("the drawing object is: ", leafletDrawingObject)

        switch (leafletDrawingObject.type){
            case "circle":
                geoJSONObject = new GeoJSONcreator("Feature", "Point", convertLeafletLatLngToGeoJSONStandard(leafletDrawingObject), leafletDrawingObject.type, leafletDrawingObject.content, null, leafletDrawingObject.radius, null, null, null);
                geoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                break;
            case "line":
                geoJSONObject = new GeoJSONcreator("Feature", "LineString", convertLeafletLatLngArrayToGeoJSONStandard(leafletDrawingObject.latlngs), leafletDrawingObject.type, leafletDrawingObject.content, null, null, null, null, null);
                geoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                break;
            case "polygon":
                geoJSONObject = new GeoJSONcreator("Feature", "Polygon", convertLeafletLatLngArrayToGeoJSONStandard(leafletDrawingObject.latlngs[0]), leafletDrawingObject.type, leafletDrawingObject.content, null, null, null, null, null);
                geoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                break;
            case "marker":
                geoJSONObject = new GeoJSONcreator("Feature", "Point", convertLeafletLatLngToGeoJSONStandard(leafletDrawingObject), leafletDrawingObject.type, leafletDrawingObject.content, null, null, null, null, null);
                geoJSON = geoJSONObject.getGeoJSONObjectWithStyle();
                break;
            default:
                return null
        }

        return geoJSON;

    }

    //leaflet does lat, then lng, everything else is lng then lat
    // for multiple points
    function convertLeafletLatLngArrayToGeoJSONStandard( latlngs ) {
        let convertedLNGLATS = [];
        console.log("The latlngs object is: ", latlngs)
        //for points that don't have an array of latlngs and just have one
        console.log("Should have multiple latlngs")
        // in this case there are multiple to look for
        for (let latlng in latlngs){
            let convertedLNGLAT = [];
            convertedLNGLAT.push(latlngs[latlng].lng);
            convertedLNGLAT.push(latlngs[latlng].lat);
            convertedLNGLATS.push(convertedLNGLAT);
            
        }
        return convertedLNGLATS;
    
    }

    //leaflet does lat, then lng, everything else is lng then lat
    //for a single point
    function convertLeafletLatLngToGeoJSONStandard( latlng ) {
        let convertedLNGLATS = [];
        console.log("The latlng object is: ", latlng)
        //for points that don't have an array of latlngs and just have one
        console.log("Should only have a single latlng")
        convertedLNGLATS.push(latlng.latlng.lng);
        convertedLNGLATS.push(latlng.latlng.lat);

        return convertedLNGLATS;
    }

    
    //leaflet does lat, then lng, everything else is lng then lat
    //for a single point
    function convertLeafletLatLngToGeoJSONPointAndMultiPoints( latlng, type ) {
        let convertedLNGLATS = [];
        if (type == "Point") {
        
        console.log("The latlng object is: ", latlng)
        //for points that don't have an array of latlngs and just have one
        console.log("Should only have a single latlng")
        convertedLNGLATS.push(latlng.lng);
        convertedLNGLATS.push(latlng.lat);

        } else if (type == "MultiPoint"){
        console.log("The latlng object is: ", latlng)
        //for points that don't have an array of latlngs and just have one
        console.log("Should only have a single latlng")
        convertedLNGLATS.push(latlng.lng);
        convertedLNGLATS.push(latlng.lat);
        let outerArray = []
        outerArray.push(convertedLNGLATS)
        return outerArray
        }

        return convertedLNGLATS;
    }
    
    function getLeaftletDrawing(drawing, smk) {

         // handle the export of circles created in leaflet here
        if (smk.$viewer.map._layers[drawing]._mRadius && smk.$viewer.map._layers[drawing]._latlng  ) {
            ////console.log("_mRadius exists and is: ", smk.$viewer.map._layers[drawing]._mRadius)
            

            let radius = smk.$viewer.map._layers[drawing]._mRadius;
            ////console.log(radius)
            ////console.log("_latling exists and is: ", smk.$viewer.map._layers[drawing]._latlng)
            let latlng = smk.$viewer.map._layers[drawing]._latlng;
            //checking for _content which would be there if a tooltip had occured
            let content = checkForContent( smk.$viewer.map._layers[drawing] );
            let circleObj = { type: "circle", latlng, radius, content};

            return circleObj;

        // handle support for lines and polygons
        } else if (smk.$viewer.map._layers[drawing]._latlngs && smk.$viewer.map._layers[drawing]._path ) {
            if ( smk.$viewer.map._layers[drawing]._path.attributes[6].nodeValue == "none") {
                // handle retriveing the latlangs needed for making a line, and give it the type of "line"
                ////console.log("This is a line!")
                ////console.log("_latlngs exists and is: ", smk.$viewer.map._layers[drawing]._latlngs)
                let latlngs = smk.$viewer.map._layers[drawing]._latlngs;
                //checking for _content which would be there if a tooltip had occured
                let content = checkForContent( smk.$viewer.map._layers[drawing] );
                
                let lineObj = { type: "line", latlngs, content };
                return lineObj;

                
            } else { //if nodeValue is not "none" then it's a polygon
                ////console.log("This is a polygon")
                ////console.log("_latlngs exists and is: ", smk.$viewer.map._layers[drawing]._latlngs)
                let latlngs = smk.$viewer.map._layers[drawing]._latlngs;
                //checking for _content which would be there if a tooltip had occured
                let content = checkForContent( smk.$viewer.map._layers[drawing] );
                
                
                let polygonObj = { type: "polygon", latlngs, content};
                return polygonObj;
                
            }
          
            // handle exporting of markers
        } else if (smk.$viewer.map._layers[drawing]._icon && smk.$viewer.map._layers[drawing]._latlng && smk.$viewer.map._layers[drawing]._shadow  ) {
            let latlng = smk.$viewer.map._layers[drawing]._latlng;
            //checking for _content which would be there if a tooltip had occured
            let content = checkForContent( smk.$viewer.map._layers[drawing] );
            let markerObj = { type: "marker", latlng, content  };
            return markerObj;
            

        }


    }

    //grab all the layer info needed required to recreate a layer on load, and return a JSON of that info that can be parse and inserted into
    // the existing map_config.json structure
    function getArrayOfJSONLayers( smk ) {

        //final return value holder
        let arrayOfJSONLayers = [];

        let type = null;
        let id = null;
        let title = null;
        let isVisible = true;
        let attribution = '';
        let metadataURL = '';
        let opacity = 0.65;
        let isQueryable = true;
        let attributes = [];

        let serviceUrl = null;
        let layerName = null;
        let styleName = null;

        //this loop creates a JSON object for each WMS layer it finds, then add it to the array of all the JSON layer objects we have
        for (let layer in smk.$viewer.map._layers ) {
            //console.log(smk.$viewer.map._layers[layer])
            if (smk.$viewer.map._layers[layer].options && smk.$viewer.map._layers[layer].wmsParams) {

                let jsonToolAndLayerInfoCombined = '{ "jsonLayerInfo": "", "jsonToolLayerInfo": ""}';
                jsonToolAndLayerInfoCombined = JSON.parse(jsonToolAndLayerInfoCombined);

                //console.log('The service URL is: ', smk.$viewer.map._layers[layer]._url)
                //console.log('The layer is: ', smk.$viewer.map._layers[layer].options.layers)
                //console.log('The style is: ', smk.$viewer.map._layers[layer].options.styles)

                type = smk.$viewer.map._layers[layer].wmsParams.service;
                serviceUrl = smk.$viewer.map._layers[layer]._url;
                layerName = smk.$viewer.map._layers[layer].options.layers;
                styleName = smk.$viewer.map._layers[layer].options.styles;

                //console.log("layer name is: ", layerName)
                //console.log("The style name is: ", styleName)

                id = (layerName + "-" + styleName);

                //This title name is a placeholder
                title = (layerName + "-" + styleName);
                title = title.replace(/_/g, " ");
                //console.log("placeholder title is: ", title)
                //console.log("ID is: ", id)

                let jsonLayerInfo = '{  "type": null, "id": null, "title": null, "isVisible": true, "attribution": "", "metadataUrl": "", "opacity": 0.65,  "isQueryable": true, "attributes": [], "serviceUrl":null, "layerName": null, "styleName": null }';

                jsonLayerInfo = JSON.parse(jsonLayerInfo);
                jsonLayerInfo.type = type.toLowerCase();
                jsonLayerInfo.id = id;
                jsonLayerInfo.title = title;
                jsonLayerInfo.serviceUrl = serviceUrl;
                jsonLayerInfo.layerName = layerName;
                jsonLayerInfo.styleName = styleName;

                //console.log("json layer info is: ", jsonLayerInfo)

                let jsonToolLayerInfo = '{  "id": "", "type": "layer", "title": "", "isVisible": true }';
                jsonToolLayerInfo  = JSON.parse(jsonToolLayerInfo);
                jsonToolLayerInfo.id = id;
                jsonToolLayerInfo.title = title ;

                jsonToolAndLayerInfoCombined.jsonLayerInfo = jsonLayerInfo;
                jsonToolAndLayerInfoCombined.jsonToolLayerInfo = jsonToolLayerInfo;

                 // Should be adding to the array here
                arrayOfJSONLayers.push(jsonToolAndLayerInfoCombined);
            }
            
        }
        
        return (arrayOfJSONLayers);
        
    }







    SMK.TYPE.sessionexportTool = sessionexportTool

    $.extend( sessionexportTool.prototype, SMK.TYPE.Tool.prototype )
    sessionexportTool.prototype.afterInitialize = []
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    sessionexportTool.prototype.afterInitialize.push( function ( smk ) {
        smk.on( this.id, {
            'activate': function () {
           
            //This is creating an update to date link of the JSON file to download
            //often disabled during testing and should be re-enabled
            createJsonLink( smk );

            ////console.log(getArrayOfJSONLayers( smk ))

            }
        } )

    } )

    return sessionexportTool
} )
