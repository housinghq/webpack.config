import webpack            from 'webpack';
import config             from '../../config';
import BundleTracker      from 'webpack-bundle-tracker';
import AssetsPlugin       from 'assets-webpack-plugin';
import path               from 'path';
import yamljs             from 'yamljs';
import ExtractTextPlugin  from 'extract-text-webpack-plugin';
import CompressionPlugin  from 'compression-webpack-plugin';
var autoprefixer          = require('autoprefixer');
var precss                = require('precss');

var paths = config.get('utils_paths');
var env = process.env.NODE_ENV;
var Config = yamljs.load(path.resolve(__dirname, "../../config/application.yml"));
var cdn = Config.cdn_path;
var manifest = (function(){
  try{
    return require(path.resolve(__dirname, "../../") + '/manifest.json');
  } catch(e){
    return {};
  }
})()

var webpackConfig = {
  name    : 'app',
  target  : 'web',
  entry   : {
    // multiple entry points for multiple html files and some common component files
    app : [
      paths.project(config.get('dir_src')) + '/app.js'
    ],
    homeView : [
      paths.project(config.get('dir_src')) + '/views/homeView.js'
    ],
    resaleDedicatedView : [
      paths.project(config.get('dir_src')) + '/views/resaleDedicatedView.js'
    ],
    projectsDedicatedView : [
      paths.project(config.get('dir_src')) + '/views/projectsDedicatedView.js'
    ],
    searchView : [
      paths.project(config.get('dir_src')) + '/views/searchView.js'
    ],
    loginView : [
     paths.project(config.get('dir_src')) + '/views/loginView.js'
    ],
    vouchersListing: [
      paths.project(config.get('dir_src')) + '/views/vouchers/vouchersListing.js'
    ],
    userProfileView : [
     paths.project(config.get('dir_src')) + '/views/userProfileView.js'
    ],
    shortlistedView : [
     paths.project(config.get('dir_src')) + '/views/shortlistedView.js'
    ],
    contactedView : [
     paths.project(config.get('dir_src')) + '/views/contactedView.js'
    ],
    savedSearchView : [
     paths.project(config.get('dir_src')) + '/views/savedSearchView.js'
    ],
    editProfileView : [
     paths.project(config.get('dir_src')) + '/views/editProfileView.js'
    ],
    'pushNotificationsView' : [
      paths.project(config.get('dir_src')) + '/views/pushNotificationsView.js'
    ],
    'localitySelect' : [
      paths.project(config.get('dir_src')) + '/components/localitySelect.js'
    ],
    'appBannerView' : [
      paths.project(config.get('dir_src')) + '/views/appBannerView.js'
    ],
    'propertyValuation': [
      paths.project(config.get('dir_src')) + '/views/propertyValuation.js'
    ],
    'propertyReport': [
      paths.project(config.get('dir_src')) + '/views/propertyReport.js'
    ],
    'bottomNotification' : [
      paths.project(config.get('dir_src')) + '/views/bottomNotification.js'
    ],
    'offlineView' : [
      paths.project(config.get('dir_src')) + '/views/offlineView.js'
    ],
    vendor : config.get('vendor_dependencies')
  },

  output : {
    filename   : '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    path       : paths.project(config.get('dir_dist')),
    publicPath : cdn + '/'
  },

  // production-only config, a MUST for long-term caching
  recordsPath : path.resolve(__dirname, `../../tmp/webpack_config/webpack-records.json`),

  plugins : [
    new webpack.optimize.CommonsChunkPlugin({
      names: ['app', 'vendor', 'manifest'],
      minChunks: Infinity
    }),
    new webpack.DefinePlugin(config.get('globals')),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new BundleTracker(),
    new AssetsPlugin(),
    new ExtractTextPlugin('[name].[chunkhash].css', {disable: false, allChunks: true}),
    new webpack.optimize.UglifyJsPlugin({
      mangle  : true,
      compress: {
        sequences   : true,
        dead_code   : true,
        conditionals: true,
        booleans    : true,
        unused      : true,
        if_return   : true,
        join_vars   : true,
        drop_console: true,
        warnings: false
      }
    }),
    new CompressionPlugin({
      asset: '{file}.gz',
      algorithm: 'gzip',
      regExp: /\.js$|\.html$|\.css$/,
      threshold: 1024,
      minRatio: 0.9
    })
  ],
  resolve : {
    extensions : ['', '.js', '.jsx'],
    alias      : config.get('utils_aliases')
  },
  module : {
    loaders : [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          cacheDirectory: true,
          plugins: ['transform-runtime', 'add-module-exports'],
          presets: ['es2015', 'react', 'stage-0'],
        }
      },
      {
        test: /\w*\.ttf(\?.*)?$/,
        loader: path.resolve(__dirname, "hash-loader"), // custom hash-loader to extract image/svg/font files
        query: {mimetype: "application/octet-stream", cdn_base: cdn, manifest: manifest, env: env}
      },
      {
        test: /\w*\.woff(\?.*)?$/,
        loader: path.resolve(__dirname, "hash-loader"),
        query: {mimetype: "application/font-woff", cdn_base: cdn, manifest: manifest, env: env}
      },
      {
        test: /\w*\.woff2(\?.*)?$/,
        loader: path.resolve(__dirname, "hash-loader"),
        query: {mimetype: "application/font-woff2", cdn_base: cdn, manifest: manifest, env: env}
      },
      {
        test: /\w*\.eot(\?.*)?$/,
        loader: path.resolve(__dirname, "hash-loader"),
        query: {mimetype: "application/octet-stream", cdn_base: cdn, manifest: manifest, env: env}
      },
      {
        test: /\w*\.svg(\?.*)?$/,
        loader: path.resolve(__dirname, "hash-loader"),
        query: {mimetype: "image/svg+xml", cdn_base: cdn, manifest: manifest, env: env}
      },
      {
        test: /\.png$/,
        loader: path.resolve(__dirname, "hash-loader"),
        query: { mimetype: "image/png", cdn_base: cdn, manifest: manifest, env: env}
      },
      {
        test: /\.jpg$/,
        loader: path.resolve(__dirname, "hash-loader"),
        query: { mimetype: "image/jpg", cdn_base: cdn, manifest: manifest, env: env}
      },
      {
        test: /\.gif/,
        loader: path.resolve(__dirname, "hash-loader"),
        query: { mimetype: "image/gif", cdn_base: cdn, manifest: manifest, env: env }
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style-loader!css-loader!postcss-loader!sass-loader")
      }
    ]
  },
  sassLoader : {
    includePaths : paths.src('styles')
  },
  postcss: function () {
      return [precss, autoprefixer];
  }
};

export default webpackConfig;
