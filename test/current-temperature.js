'use strict';

const Mcp9808 = require('../');

let tempSensor;
let celsius;

const currentTemperature = () => {
  return Mcp9808.open().then((sensor) => {
    tempSensor = sensor;
    return tempSensor.temperature();
  }).then((temp) => {
    celsius = temp.celsius;
    return tempSensor.close();
  }).then(() => {
    return celsius;
  });
};

module.exports = currentTemperature;

