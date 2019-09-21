'use strict';

const mcp9808 = require('../');

mcp9808.open().then(sensor =>
  sensor.temperature().
  then(temp => console.log(temp.celsius + '°C')).
  then(_ => sensor.close())
).catch(console.log);

