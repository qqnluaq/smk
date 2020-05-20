var tg = require( './lib/tag-gen' )

tg.globOption.cwd = __dirname

var t = new tg.TagSet()

// ==================================================================================
// viewer agnostic libraries
// ==================================================================================

t.script( 'jquery', 'lib/jquery-3.3.1.min.js' )

t.script( 'vue', 'lib/vue-2.5.11.js' )
// t.script( 'vue', 'lib/vue-2.5.11.min.js' )
t.script( 'vue-config', 'smk/vue-config.js' )

t.script( 'turf', 'lib/turf-5.1.6.min.js' )

t.script( 'proj4', 'lib/proj4-2.4.4.min.js' )

t.sequence( 'terraformer' )
    .script( 'lib/terraformer/terraformer-1.0.7.js' )
    .script( 'lib/terraformer/terraformer-arcgis-parser-1.0.5.js' )
    // .script( 'lib/terraformer/terraformer-wkt-parser-1.1.2.js' )

t.style( 'material-icons', 'https://fonts.googleapis.com/icon?family=Material+Icons', { external: true } )

// ==================================================================================
// smk base
// ==================================================================================

t.script( 'smk-map',    'smk/smk-map.js' )
t.script( 'util',       'smk/util.js' )
t.script( 'event',      'smk/event.js' )
t.script( 'viewer',     'smk/viewer.js' )
t.script( 'feature-set','smk/feature-set.js' )
t.script( 'projections','smk/projections.js' )
t.script( 'layer-display','smk/layer-display.js' )

t.group( 'tool' )
    .dir( 'smk/tool/*' )

t.group( 'layer' )
    .dir( 'smk/layer/**/*' )

t.group( 'query' )
    .dir( 'smk/query/**/*' )

t.group( 'sidepanel' )
    .dir( 'smk/sidepanel/**/*' )

// t.group( 'feature-list' )
    // .dir( 'smk/feature-list/**/*' )

// t.group( 'widgets' )
    // .dir( 'smk/widgets/*' )

// t.group( 'widget-address-search' )
    // .dir( 'smk/widgets/address-search/*' )

t.group( 'api' )
    .dir( 'smk/api/*' )

tg.forEachDir( 'smk/component/*/', function ( fn, bn ) {
    t.group( 'component-' + bn )
        .dir( fn + '/**' )
} )
t.group( 'component' )
    .dir( 'smk/component/*' )

t.script( 'tile-cache-idb',     'smk/tile-cache-idb.js' )
t.script( 'feature-cache-idb',     'smk/feature-cache-idb.js' )

// ==================================================================================
// smk tools
// ==================================================================================

t.group( 'tool-about' )
    .dir( 'smk/tool/about/*' )

t.group( 'tool-baseMaps' )
    .dir( 'smk/tool/baseMaps/*' )

t.group( 'tool-bespoke' )
    .dir( 'smk/tool/bespoke/*' )

t.group( 'tool-coordinate' )
    .dir( 'smk/tool/coordinate/*' )

t.sequence( 'check-directions' )
    .script( 'smk/tool/directions/check/lib/sortable-1.7.0.min.js')
    .script( 'smk/tool/directions/check/lib/vuedraggable-2.16.0.min.js')
    .dir( 'smk/tool/directions/check/*' )
t.group( 'tool-directions' )
    .dir( 'smk/tool/directions/*' )
t.group( 'tool-directions-route' )
    .dir( 'smk/tool/directions-route/*' )
t.group( 'tool-directions-options' )
    .dir( 'smk/tool/directions-options/*' )

t.group( 'tool-dropdown' )
    .dir( 'smk/tool/dropdown/*' )

t.group( 'check-identify' )
    .dir( 'smk/tool/identify/check/*' )
t.group( 'tool-identify' )
    .dir( 'smk/tool/identify/*' )
t.group( 'tool-identify-feature' )
    .dir( 'smk/tool/identify-feature/*' )

t.group( 'check-layers' )
    .dir( 'smk/tool/layers/check/*' )
t.group( 'tool-layers' )
    .dir( 'smk/tool/layers/*' )

t.group( 'tool-legend' )
    .dir( 'smk/tool/legend/*' )

t.group( 'tool-list-menu' )
    .dir( 'smk/tool/list-menu/*' )

t.group( 'tool-location' )
    .dir( 'smk/tool/location/*' )

t.group( 'tool-markup' )
    .dir( 'smk/tool/markup/*' )

t.group( 'tool-measure' )
    .dir( 'smk/tool/measure/*' )

t.group( 'tool-menu' )
    .dir( 'smk/tool/menu/*' )

t.group( 'tool-minimap' )
    .dir( 'smk/tool/minimap/*' )

t.group( 'tool-offline' )
    .dir( 'smk/tool/offline/*' )

t.group( 'tool-pan' )
    .dir( 'smk/tool/pan/*' )

t.group( 'check-query' )
    .dir( 'smk/tool/query/check/*' )
t.group( 'tool-query' )
    .dir( 'smk/tool/query/*' )
t.group( 'tool-query-results' )
    .dir( 'smk/tool/query-results/*' )
t.group( 'tool-query-feature' )
    .dir( 'smk/tool/query-feature/*' )

t.group( 'check-query-place' )
    .dir( 'smk/tool/query-place/check/*' )
t.group( 'tool-query-place' )
    .dir( 'smk/tool/query-place/*' )

t.group( 'tool-scale' )
    .dir( 'smk/tool/scale/*' )

t.group( 'check-search' )
    .dir( 'smk/tool/search/check/*' )
t.group( 'tool-search' )
    .dir( 'smk/tool/search/*' )
t.group( 'tool-search-location' )
    .dir( 'smk/tool/search-location/*' )

t.group( 'check-select' )
    .dir( 'smk/tool/select/check/*' )
t.group( 'tool-select' )
    .dir( 'smk/tool/select/*' )
t.group( 'tool-select-feature' )
    .dir( 'smk/tool/select-feature/*' )

t.group( 'tool-shortcut-menu' )
    .dir( 'smk/tool/shortcut-menu/*' )

t.group( 'tool-toolbar' )
    .dir( 'smk/tool/toolbar/*' )

t.group( 'tool-version' )
    .dir( 'smk/tool/version/*' )

t.group( 'tool-zoom' )
    .dir( 'smk/tool/zoom/*' )

// ==================================================================================
// leaflet
// ==================================================================================

t.group( 'layer-leaflet' )
    .dir( 'smk/viewer-leaflet/layer/**/*' )
    .dir( 'lib/leaflet/marker-cluster*' )
    .script( 'lib/leaflet/NonTiledLayer-src.js' )
    .script( "lib/leaflet/leaflet-heat.js" )

t.script( 'feature-list-leaflet', 'smk/viewer-leaflet/feature-list-leaflet.js' )
t.script( 'feature-list-clustering-leaflet', 'smk/viewer-leaflet/feature-list-clustering-leaflet.js' )

t.group( 'viewer-leaflet' )
    .script( 'smk/viewer-leaflet/viewer-leaflet.js' )
    .style( 'smk/viewer-leaflet/viewer-leaflet.css' )

t.sequence( 'leaflet' )
    .script( 'lib/leaflet/leaflet-1.5.1.js' )
    // .script( 'lib/leaflet/leaflet-1.5.1.min.js' )
    .style( 'lib/leaflet/leaflet-1.5.1.css' )
    // .script( 'lib/leaflet/esri-leaflet-2.3.0.min.js' )
    .script( 'lib/leaflet/leaflet-continuous-zoom.js')
    // .script( 'lib/leaflet/leaflet-offline-2.0.0-b2.js' )
    .script( 'lib/leaflet/idb-5.0.2.min.js' )
    .script( 'lib/leaflet/esri-leaflet-2.3.2.js' )
    // .script( 'lib/leaflet/esri-leaflet-renderers.js' )
    .script( 'lib/leaflet/esri-leaflet-renderers-2.0.6.js' )
    .script( 'lib/leaflet/esri-leaflet-legend-compat-src-2.0.1.js')


t.group( 'tool-coordinate-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/coordinate/**/*' )

t.group( 'tool-directions-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/directions/**/*' )

t.group( 'tool-identify-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/identify/**/*' )

t.group( 'tool-legend-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/legend/**/*' )

t.group( 'tool-location-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/location/**/*' )

t.sequence( 'tool-markup-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/markup/**/*' )

t.group( 'tool-minimap-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/minimap/**/*' )

t.group( 'tool-pan-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/pan/**/*' )

t.group( 'tool-measure-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/measure/**/*' )

t.group( 'tool-query-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/query/**/*' )

t.group( 'tool-query-place-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/query-place/**/*' )

t.group( 'tool-scale-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/scale/**/*' )

t.group( 'tool-search-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/search/**/*' )

t.group( 'tool-select-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/select/**/*' )

t.group( 'tool-zoom-leaflet' )
    .dir( 'smk/viewer-leaflet/tool/zoom/**/*' )


// ==================================================================================
// esri3d
// ==================================================================================

t.group( 'layer-esri3d' )
    .dir( 'smk/viewer-esri3d/layer/**/*' )

t.script( 'types-esri3d', 'smk/viewer-esri3d/types-esri3d.js' )

t.script( 'util-esri3d', 'smk/viewer-esri3d/util-esri3d.js' )

t.group( 'viewer-esri3d' )
    .script( 'smk/viewer-esri3d/viewer-esri3d.js' )
    .style( 'smk/viewer-esri3d/viewer-esri3d.css' )

t.script( 'feature-list-esri3d', 'smk/viewer-esri3d/feature-list-esri3d.js' )

t.sequence( 'esri3d' )
    .tag( 'leaflet' )
    .style( 'https://js.arcgis.com/4.8/esri/css/main.css', { external: true } )
    .script( 'https://js.arcgis.com/4.8/', { external: true } )
    // .script( 'lib/toGeoJSON.js' )
    // .script( 'https://unpkg.com/terraformer@1.0.7' )
    // .script( 'https://unpkg.com/terraformer-arcgis-parser@1.0.5' )
    // .script( 'https://unpkg.com/terraformer-wkt-parser@1.1.2' )


t.group( 'tool-coordinate-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/coordinate/**/*' )

t.group( 'tool-directions-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/directions/**/*' )

t.group( 'tool-identify-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/identify/**/*' )

t.group( 'tool-markup-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/markup/**/*' )

t.group( 'tool-location-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/location/**/*' )

t.group( 'tool-measure-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/measure/**/*' )

t.group( 'tool-minimap-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/minimap/**/*' )

t.group( 'tool-pan-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/pan/**/*' )

t.group( 'tool-query-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/query/**/*' )

t.group( 'tool-scale-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/scale/**/*' )

t.group( 'tool-search-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/search/**/*' )

t.group( 'tool-select-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/select/**/*' )

t.group( 'tool-zoom-esri3d' )
    .dir( 'smk/viewer-esri3d/tool/zoom/**/*' )

// ==================================================================================
// smk themes
// ==================================================================================

t.group( 'theme-base' )
    .dir( 'theme/_base/**/*' )
    .tag( 'material-icons' )

t.group( 'theme-alpha' )
    .dir( 'theme/alpha/**/*' )

t.group( 'theme-beta' )
    .dir( 'theme/beta/**/*' )

t.group( 'theme-gamma' )
    .dir( 'theme/gamma/**/*' )

t.group( 'theme-delta' )
    .dir( 'theme/delta/**/*' )

t.group( 'theme-wf' )
    .dir( 'theme/wf/**/*' )


process.stdout.write( JSON.stringify( t, null, '    ' ) )
