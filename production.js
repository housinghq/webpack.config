import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpackConfig from './base';
import CompressionPlugin from 'compression-webpack-plugin';
import path from 'path';

webpackConfig.module.loaders.forEach(loader => {
  if (/css/.test(loader.test)) {
    const [first, ...rest] = loader.loaders;
    const sassLoader = rest.pop()
    rest.push('postcss-loader')
    rest.push(sassLoader)
    loader.loader = ExtractTextPlugin.extract(first, rest.join('!'));
    delete loader.loaders;
  }
});

let branch = process.env.BRANCH_NAME;
if (!branch) {
  console.log('Required: BRANCH_NAME environment variable');
}
webpackConfig.recordsPath = path.resolve(__dirname,
  `../../tmp/webpack_config/${branch.replace(/[/.@]/g, '-')}/webpack-records.json`);

webpackConfig.output.filename = '[name].[chunkhash].js';
webpackConfig.output.chunkFilename = '[name].[chunkhash].js';

webpackConfig.plugins.push(
  new ExtractTextPlugin('[name].[chunkhash].css', {disable: false,allChunks: true}),
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
);

export default webpackConfig;
