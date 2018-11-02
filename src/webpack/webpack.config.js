const webpack = require('webpack')

module.exports = {
  mode: "development",
  plugins: [
    new webpack.DefinePlugin({ "BRANCH_ENV": process.env.BRANCH.toUpperCase() }),
    new webpack.DefinePlugin({ "global.GENTLY": false })
  ],
}

