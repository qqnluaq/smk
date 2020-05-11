include.module( 'tool-offline', [ 
    'tool.tool-base-js', 
    'tool.tool-widget-js', 
    'tool.tool-panel-js', 
    'component-command-button',
    'tool-offline.panel-offline-html' 
], function ( inc ) {
    "use strict";

    Vue.component( 'offline-widget', {
        extends: SMK.COMPONENT.ToolWidgetBase,
    } )

    Vue.component( 'offline-panel', {
        extends: SMK.COMPONENT.ToolPanelBase,
        template: inc[ 'tool-offline.panel-offline-html' ],
        props: {
            tileStat: Array,
            viewStat: Object,
            loading: Object
        },
    } )
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    return SMK.TYPE.Tool.define( 'OfflineTool', 
        function () {
            SMK.TYPE.ToolWidget.call( this, 'offline-widget' )
            SMK.TYPE.ToolPanel.call( this, 'offline-panel' )
        
            this.defineProp( 'tileStat' )
            this.defineProp( 'viewStat' )
            this.defineProp( 'loading' )

            this.icon = 'save_alt'
            this.title = 'Offline Tiles'
        },
        function ( smk ) {
            var self = this

            this.offlineCache = smk.$viewer.getTileCache( 'offline' )
            self.offlineLayerIds = smk.$viewer.getCachedLayerIds( 'offline' )

            this.changedActive( function () {
                if ( self.active ) {
                    self.update( smk )
                }
                else {
                }
            } )

            smk.on( this.id, {  
                'save-tiles': function ( ev ) {
                    self.loading = {
                        progress: 0,
                        total: 0
                    }
                    self.busy = true
                    var promises = []

                    self.offlineLayerIds.forEach( function ( id ) {
                        if ( !smk.$viewer.visibleLayer[ id ] ) return

                        var ly = smk.$viewer.visibleLayer[ id ]
                        var tis = SMK.TYPE.TileCacheIDB.convertLayerBoundsToTileInfos( 
                            ly, 
                            smk.$viewer.map.getBounds(), 
                            ly._clampZoom( smk.$viewer.map.getZoom() )
                        )

                        self.loading.total += tis.length 

                        tis.forEach( function ( ti ) {
                            promises.push( self.offlineCache.putTile( id, ti )
                                .then( function () { self.loading.progress += 1 } )
                                .catch( function () { self.loading.progress += 1 } )
                            )
                        } )
                    } )

                    Promise.all( promises ).then( function () {
                        self.busy = false
                        self.loading = null
                        self.update( smk )
                    } )
                },

                'clear-tiles': function () {
                    self.busy = true
                    Promise.all( self.offlineLayerIds.map( function ( id ) {
                        return self.offlineCache.clearTiles( id )
                    } ) ).then( function () {
                        self.busy = false
                        self.update( smk )
                    } )
                }
            } )

            smk.$viewer.changedView( function () {
                self.viewStat = smk.$viewer.getView()
            } )

            this.cachedTiles = L.layerGroup( { pane: 'markerPane' } )

            self.changedActive( function () {
                self.visible = self.active
            } )
    
            self.changedVisible( function () {
                if ( self.visible ) {
                    self.cachedTiles.addTo( smk.$viewer.map )
                }
                else {
                    smk.$viewer.map.removeLayer( self.cachedTiles )
                }
            } )
        },
        {
            update: function ( smk ) {
                var self = this

                this.tileStat = []
                this.cachedTiles.clearLayers()

                this.offlineLayerIds.forEach( function ( id ) {
                    var stat = {
                        id: id,
                        count: 0,
                        zoom: {},
                        size: 0
                    }
                    self.tileStat.push( stat )

                    self.offlineCache.getAllTiles( id ).then( function ( tileInfos ) {
                        if ( tileInfos.length == 0 ) return 

                        stat.count = tileInfos.length
                        tileInfos.forEach( function ( t ) {
                            stat.zoom[ t.z ] = ( stat.zoom[ t.z ] || 0 ) + 1
                            stat.size += t.blob.size
                        } )                       
                        
                        if ( !smk.$viewer.visibleLayer[ id ] ) return

                        var geojson = SMK.TYPE.TileCacheIDB.convertTileInfosToGeojson( smk.$viewer.visibleLayer[ id ], tileInfos )
                        self.cachedTiles.addLayer( L.geoJSON( geojson ) )
                    } )    
                } )
            }
        }
    )
} )
