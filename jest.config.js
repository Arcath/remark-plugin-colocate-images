const configs = require('kcd-scripts/config')

module.exports = Object.assign(configs.jest, {
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "collectCoverage": true
})