module.exports = {
  publicPath: '',
  outputDir: 'dist',
  productionSourceMap: false,
  devServer: {
    allowedHosts: [ process.env.PUBLIC_IP ],
    public: process.env.PUBLIC_IP + ':' + process.env.PORT
  }
}
