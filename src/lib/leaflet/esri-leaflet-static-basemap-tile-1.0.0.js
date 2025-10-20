/* esri-leaflet-static-basemap-tile - v1.0.0 - Fri Jan 31 2025 14:26:53 GMT-0800 (Pacific Standard Time)
 * Copyright (c) 2025 Environmental Systems Research Institute, Inc.
 * Apache-2.0 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('leaflet'), require('esri-leaflet')) :
  typeof define === 'function' && define.amd ? define(['exports', 'leaflet', 'esri-leaflet'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.L = global.L || {}, global.L.esri = global.L.esri || {}, global.L.esri.Static = {}), global.L, global.L.esri));
})(this, (function (exports, leaflet, esriLeaflet) { 'use strict';

  var name = "esri-leaflet-static-basemap-tile";
  var description = "Esri's static basemap tile layer plugin for Leaflet.";
  var version$1 = "1.0.0";
  var author = "George Owen (https://www.linkedin.com/in/geoowen/)";
  var contributors = [
  	"Patrick Arlt <parlt@esri.com> (http://patrickarlt.com)",
  	"Gavin Rehkemper <grehkemper@esri.com> (https://gavinr.com)"
  ];
  var bugs = {
  	url: "https://github.com/Esri/esri-leaflet-static-basemap-tile/issues"
  };
  var peerDependencies = {
  	"esri-leaflet": ">2.3.0",
  	leaflet: "^1.5.0"
  };
  var devDependencies = {
  	"@rollup/plugin-commonjs": "^24.0.1",
  	"@rollup/plugin-json": "^6.0.0",
  	"@rollup/plugin-node-resolve": "^15.0.1",
  	"@rollup/plugin-terser": "^0.3.0",
  	"chokidar-cli": "^3.0.0",
  	eslint: "^7.13.0",
  	"eslint-config-semistandard": "^15.0.1",
  	"eslint-config-standard": "^15.0.1",
  	"eslint-plugin-chai-friendly": "^0.6.0",
  	"eslint-plugin-import": "^2.22.1",
  	"eslint-plugin-node": "^11.1.0",
  	"eslint-plugin-promise": "^4.2.1",
  	"eslint-plugin-standard": "^4.1.0",
  	"esri-leaflet": "^3.0.0",
  	"gh-release": "^7.0.2",
  	"http-server": "^14.1.1",
  	karma: "^6.4.1",
  	"karma-chrome-launcher": "^3.1.0",
  	"karma-coverage": "^2.2.0",
  	"karma-edgium-launcher": "github:matracey/karma-edgium-launcher",
  	"karma-firefox-launcher": "^2.1.2",
  	"karma-mocha": "^2.0.1",
  	"karma-mocha-reporter": "^2.2.5",
  	"karma-safari-launcher": "~1.0.0",
  	"karma-sinon-chai": "^2.0.2",
  	"karma-sourcemap-loader": "^0.3.8",
  	leaflet: "^1.5.0",
  	mkdirp: "^2.1.3",
  	mocha: "^10.2.0",
  	"npm-run-all": "^4.1.5",
  	rollup: "^2.79.1",
  	semistandard: "^16.0.0",
  	sinon: "^15.0.1",
  	"sinon-chai": "3.7.0",
  	snazzy: "^9.0.0"
  };
  var files = [
  	"src/**/*.js",
  	"dist/*.js",
  	"dist/*.js.map",
  	"dist/*.json",
  	"index.d.ts"
  ];
  var homepage = "https://github.com/Esri/esri-leaflet-static-basemap-tile#readme";
  var jspm = {
  	registry: "npm",
  	format: "es6",
  	main: "src/EsriLeafletStaticBasemapTile.js"
  };
  var keywords = [
  	"arcgis",
  	"leaflet",
  	"leafletjs",
  	"maps"
  ];
  var license = "Apache-2.0";
  var main = "dist/esri-leaflet-static-basemap-tile-debug.js";
  var module = "src/EsriLeafletStaticBasemapTile.js";
  var browser = "dist/esri-leaflet-static-basemap-tile-debug.js";
  var types = "index.d.ts";
  var readmeFilename = "README.md";
  var repository = {
  	type: "git",
  	url: "git+https://github.com/Esri/esri-leaflet-static-basemap-tile.git"
  };
  var scripts = {
  	prebuild: "mkdirp dist",
  	build: "rollup -c profiles/debug.js & rollup -c profiles/production.js",
  	"build-dev": "rollup -c profiles/debug.js",
  	fix: "semistandard --fix",
  	lint: "eslint src/**/*.js",
  	"start-watch": "chokidar src -c \"npm run build\"",
  	"start-watch-dev": "chokidar src -c \"npm run build-dev\"",
  	start: "run-p start-watch serve",
  	"start-dev": "run-p start-watch-dev serve",
  	dev: "npm run start-dev",
  	serve: "http-server -p 8765 -c-1 -o",
  	pretest: "npm run build-dev",
  	test: "npm run lint && karma start",
  	release: "./scripts/release.sh"
  };
  var semistandard = {
  	globals: [
  		"expect",
  		"L",
  		"XMLHttpRequest",
  		"sinon",
  		"xhr",
  		"proj4"
  	]
  };
  var packageInfo = {
  	name: name,
  	description: description,
  	version: version$1,
  	author: author,
  	contributors: contributors,
  	bugs: bugs,
  	peerDependencies: peerDependencies,
  	devDependencies: devDependencies,
  	files: files,
  	homepage: homepage,
  	"jsnext:main": "src/EsriLeafletStaticBasemapTile.js",
  	jspm: jspm,
  	keywords: keywords,
  	license: license,
  	main: main,
  	module: module,
  	browser: browser,
  	types: types,
  	readmeFilename: readmeFilename,
  	repository: repository,
  	scripts: scripts,
  	semistandard: semistandard
  };

  /* Copyright 2024 Esri
   *
   * Licensed under the Apache License Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  // URL of the static basemap tiles service
  const baseUrl = 'https://static-map-tiles-api.arcgis.com/arcgis/rest/services/static-basemap-tiles-service/v1/';

  /**
   * Utility to establish a URL for the static basemap tiles API
   *
   * @param {string} style
   * @param {string} accessToken
   * @param {Object} [options] Optional list of parameters: language.
   * @returns {string} the URL
   */
  function getStaticBasemapTilesUrl (style, accessToken, options) {
    if (!accessToken) throw new Error('An access token is required to access the static basemap tiles service.');

    // Tile endpoint in {z}/{y}/{x} format
    let url = baseUrl + style + '/static/tile/{z}/{y}/{x}?token=' + accessToken;

    // Handle additional service parameters
    if (options.language) {
      url += '&language=' + options.language;
    }

    return url;
  }

  /**
   * Utility that retrieves attribution data for a given style
   * @param {string} style
   * @param {string} accessToken
   * @returns The attribution data from the '/static' endpoint of a style enumeration
   */
  async function fetchAttribution (style, accessToken) {
    const attributionUrl = baseUrl + style + '/static';
    return new Promise((resolve, reject) => {
      esriLeaflet.request(attributionUrl, { token: accessToken }, (error, resp) => {
        if (error) reject(error);
        resolve(resp.copyrightText);
      });
    });
  }

  /**
   * Utility to make a /self request to the static basemap tiles service
   * @param {string} accessToken
   * @returns {Object} A list of all supported basemap styles, including thumbnail URLs and supported language codes.
   */
  async function getSelf (accessToken) {
    if (!accessToken) throw new Error('An access token is required to access the static basemap tiles service.');

    const selfUrl = baseUrl + 'self';
    return new Promise((resolve, reject) => {
      esriLeaflet.request(selfUrl, { token: accessToken }, (error, resp) => {
        if (error) reject(error);
        resolve(resp);
      });
    });
  }

  var EsriUtil = {
    getSelf: getSelf
  };

  /* Copyright 2024 Esri
   *
   * Licensed under the Apache License Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  // import { Util } from 'esri-leaflet';

  // In the future, get this from Esri Leaflet Util:
  const POWERED_BY_ESRI_ATTRIBUTION_STRING = 'Powered by <a href="https://www.esri.com">Esri</a>';

  var StaticBasemapTileLayer = leaflet.TileLayer.extend({
    initialize: function (style, options) {
      if (options) {
        leaflet.setOptions(this, options);
      }
      // support outdated casing apiKey of apikey
      if (this.options.apiKey) {
        this.options.apikey = this.options.apiKey;
      }
      // propagate apikey to token and vice versa
      if (this.options.apikey) {
        this.options.token = this.options.apikey;
      } else if (this.options.token) {
        this.options.apikey = this.options.token;
      }
      // if no access token provided
      if (!this.options.token) {
        throw new Error(
          'An ArcGIS access token is required for static basemap tiles. To learn more, go to https://developers.arcgis.com/documentation/security-and-authentication/'
        );
      }
      // If no style passed in, or an invalid style is passed
      if (!style || typeof style !== 'string' || style.length === 0) {
        throw new Error(
          'A valid style enum is required for staticBasemapTileLayer (e.g. \'arcgis/streets\').'
        );
      }
      // Set layer pane
      if (options.pane) {
        this.options.pane = options.pane;
      } else if (style.includes('/labels')) {
        this.options.pane = 'esri-labels';
      }

      this.options.zoomOffset = -1;
      this.options.tileSize = 512;

      // Remove slash if style enum begins with one
      if (style[0] === '/') {
        style = style.substring(1, style.length);
      }
      // Save style into "this.options" for use elsewhere in the module.
      this.options.style = style;
      this.serviceUrl = getStaticBasemapTilesUrl(style, this.options.token, this.options);

      leaflet.TileLayer.prototype.initialize.call(this, this.serviceUrl, this.options);
    },
    onAdd: function (map) {
      // Setup Esri attribution
      this._setupAttribution();

      this._initPane();

      leaflet.TileLayer.prototype.onAdd.call(this, map);
    },
    onRemove: function (map) {
      this._removeAttribution();
      leaflet.TileLayer.prototype.onRemove.call(this, map);
    },
    _setupAttribution: function () {
      if (!this._map) return;
      fetchAttribution(this.options.style, this.options.token).then(attribution => {
        // Add attribution directly to map
        this.currentAttribution = `${POWERED_BY_ESRI_ATTRIBUTION_STRING} | ${attribution}`;
        this._map.attributionControl.addAttribution(this.currentAttribution);
      });
    },
    _removeAttribution: function () {
      if (this.currentAttribution) {
        this._map.attributionControl.removeAttribution(this.currentAttribution);
        this.currentAttribution = undefined;
      }
    },
    _initPane: function () {
      if (this._map.getPane(this.options.pane)) return;

      const pane = this._map.createPane(this.options.pane);
      pane.style.pointerEvents = 'none';

      // Default value for tileLayer
      let zIndex = 200;
      if (this.options.pane === 'esri-labels') zIndex = 300;
      pane.style.zIndex = zIndex;
    }
  });

  function staticBasemapTileLayer (key, options) {
    return new StaticBasemapTileLayer(key, options);
  }

  /* Copyright 2024 Esri
   *
   * Licensed under the Apache License Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  const version = packageInfo.version;

  exports.StaticBasemapTileLayer = StaticBasemapTileLayer;
  exports.Util = EsriUtil;
  exports.VERSION = version;
  exports.staticBasemapTileLayer = staticBasemapTileLayer;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=esri-leaflet-static-basemap-tile-debug.js.map
