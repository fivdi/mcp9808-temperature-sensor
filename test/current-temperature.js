'use strict';

const mcp9808 = require('../');

const currentTemperature = () =>
  mcp9808.open().then(sensor =>
    sensor.temperature().
    then(temp =>
      sensor.close().
      then(_ => Promise.resolve(temp.celsius))
    )
  );

module.exports = currentTemperature;

