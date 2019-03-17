'use strict';

const Mcp9808 = require('../');
const currentTemperature = require('./current-temperature');

let currentTemp;
let tempSensor;

// check belowLowerLimit
currentTemperature().then((temp) => {
  currentTemp = temp;

  return Mcp9808.open({
    lowerAlertTemperature: currentTemp + 10,
    upperAlertTemperature: currentTemp + 20,
    criticalTemperature: currentTemp + 30
  });
}).then((sensor) => {
  tempSensor = sensor;

  return tempSensor.temperature();
}).then((tempData) => {
  if (tempData.belowLowerLimit !== true ||
      tempData.aboveUpperLimit !== false ||
      tempData.critical !== false) {
    return Promise.reject(new Error(
      'Expected belowLowerLimit only.'
    ));
  }

  return tempSensor.close();
// check all false
}).then(() => {
  return Mcp9808.open({
    lowerAlertTemperature: currentTemp - 10,
    upperAlertTemperature: currentTemp + 10,
    criticalTemperature: currentTemp + 20
  });
}).then((sensor) => {
  tempSensor = sensor;

  return tempSensor.temperature();
}).then((tempData) => {
  if (tempData.belowLowerLimit !== false ||
      tempData.aboveUpperLimit !== false ||
      tempData.critical !== false) {
    return Promise.reject(new Error(
      'Expected all false.'
    ));
  }

  return tempSensor.close();
// check aboveUpperLimit only
}).then(() => {
  return Mcp9808.open({
    lowerAlertTemperature: currentTemp - 20,
    upperAlertTemperature: currentTemp - 10,
    criticalTemperature: currentTemp + 10
  });
}).then((sensor) => {
  tempSensor = sensor;

  return tempSensor.temperature();
}).then((tempData) => {
  if (tempData.belowLowerLimit !== false ||
      tempData.aboveUpperLimit !== true ||
      tempData.critical !== false) {
    return Promise.reject(new Error(
      'Expected aboveUpperLimit only.'
    ));
  }

  return tempSensor.close();
// check critical and aboveUpperLimit only
}).then(() => {
  return Mcp9808.open({
    lowerAlertTemperature: currentTemp - 30,
    upperAlertTemperature: currentTemp - 20,
    criticalTemperature: currentTemp - 10
  });
}).then((sensor) => {
  tempSensor = sensor;

  return tempSensor.temperature();
}).then((tempData) => {
  if (tempData.belowLowerLimit !== false ||
      tempData.aboveUpperLimit !== true ||
      tempData.critical !== true) {
    return Promise.reject(new Error(
      'Expected critical and aboveUpperLimit only.'
    ));
  }

  return tempSensor.close();
}).catch((err) => {
  console.log(err.stack);
});

