'use strict';

const assert = require('assert');
const Mcp9808 = require('../');

Mcp9808.open().then(sensor =>
  sensor.temperature().
  then(temperature => console.log('  temperature = ' + temperature.celsius + '°C')).
  then(_ => sensor.close())
).catch(console.log);

