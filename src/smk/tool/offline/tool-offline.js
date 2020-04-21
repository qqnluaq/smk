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
            tileStat: Object,
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

            this.getLayer = function () {
                return smk.$viewer.visibleLayer[ "osm-streets-tiled-offline" ]
            }

            this.changedActive( function () {
                if ( self.active ) {
                    var ly = self.getLayer()
                    if ( !ly ) return

                    if ( !self.tileUrl ) {
                        self.tileUrl = ly._url
                        self.saveTilesCtrl = L.control.savetiles( ly, {
                            // saveWhatYouSee: true
                        } )
                        self.saveTilesCtrl._map = smk.$viewer.map

                        ly.on( 'savestart', function ( ev ) {
                            console.log('savestart',ev._tilesforSave.length)
    
                            self.busy = true
                            self.loading = {
                                progress: 0,
                                total: ev._tilesforSave.length
                            }
                            // progress = 0
                            // document.getElementById('total').innerHTML = e._tilesforSave.length
                        } )
    
                        ly.on( 'savetileend', function ( ev ) {
                            console.log('savetileend')
                            self.loading.progress += 1
                            // progress += 1
                            // document.getElementById('progress').innerHTML = progress
                        } )
    
                        ly.on( 'saveend', function ( ev ) {
                            console.log('saveend')
                            self.loading = null
                            self.busy = false
                            self.update( smk )
                        } )    
                    }

                    self.update( smk )
                }
                else {
                }
            } )

            smk.on( this.id, {  
                'save-tiles': function ( ev ) {
                    var ly = self.getLayer()
                    if ( !ly ) return

                    // self.busy = true
                    self.saveTilesCtrl._saveTiles()
                    // self.busy = false
                    // self.update( smk )
                },

                'clear-tiles': function () {
                    self.busy = true
                    LeafletOffline.truncate()
                    self.busy = false
                    self.update( smk )
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
                this.tileStat = {
                    count: 0,
                    zoom: {},
                    size: 0
                }             
                this.cachedTiles.clearLayers()

                var ly = self.getLayer()
                if ( !ly ) return

                return LeafletOffline.getStorageInfo( self.tileUrl )
                    .then( function ( tiles ) {
                        console.log(tiles.length)
                        tiles.reduce( function ( accum, t ) {
                            accum.zoom[ t.z ] = ( accum.zoom[ t.z ] || 0 ) + 1
                            accum.size += t.blob.size
                            
                            return accum
                        }, self.tileStat )
                        self.tileStat.count = tiles.length

                        return LeafletOffline.getStoredTilesAsJson( ly, tiles )
                    } )
                    .then( function ( geojson ) {
                        if ( !geojson ) return

                        self.cachedTiles.addLayer( L.geoJSON( geojson ) )//, {
                            // style: self.styleFeature()
                        // } ))
                    } )
            }
        }
    )
} )
