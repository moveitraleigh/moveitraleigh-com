const webpack = require('webpack')

module.exports = {
  mode: "development",
  plugins: [
    new webpack.DefinePlugin({
      "BRANCH_ENV": JSON.stringify(process.env.BRANCH.toUpperCase()),
      "global.GENTLY": false 
    })
  ],
}

