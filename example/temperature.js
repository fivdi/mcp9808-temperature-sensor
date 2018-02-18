'use strict';

const Mcp9808 = require('../');

let tempSensor;

Mcp9808.open({
  i2cBusNumber: 1, // optional, default 1
  i2cAddress: 0x18 // optional, default 0x18
}).then((sensor) => {
  tempSensor = sensor;
  return tempSensor.temperature();
}).then((temp) => {
  console.log(temp.celsius + '°C');
  return tempSensor.close();
}).catch((err) => {
  console.log(err);
});

