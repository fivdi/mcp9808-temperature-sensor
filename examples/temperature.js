'use strict';

const Mcp9808 = require('../');

Mcp9808.open().then(sensor =>
  sensor.temperature().
  then(temp => console.log(temp.celsius + '°C')).
  then(_ => sensor.close())
).catch(console.log);

