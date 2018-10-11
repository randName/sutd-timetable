module.exports = {
  devServer: {
    host: process.env.HOST,
    port: process.env.PORT,
    public: process.env.PUBLIC_IP + ':' + process.env.PORT
  }
}
