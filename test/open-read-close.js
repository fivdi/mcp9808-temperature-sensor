'use strict';

const assert = require('assert');
const Mcp9808 = require('../');

let tempSensor;

Mcp9808.open().then((sensor) => {
  tempSensor = sensor;
  return tempSensor.temperature();
}).then((temp) => {
  console.log('  temperature = ' + temp.celsius + '°C');
  assert(
    temp.celsius >= -40 && temp.celsius <= 125,
    'Temperature outside possible range.'
  );
  return tempSensor.close();
}).catch((err) => {
  console.log(err.stack);
});

