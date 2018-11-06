const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  mode: "development",
  plugins: [
    new webpack.DefinePlugin({
      "BRANCH_ENV": JSON.stringify(process.env.BRANCH_ENV.toUpperCase()),
      "global.GENTLY": false 
    })
  ],
}

