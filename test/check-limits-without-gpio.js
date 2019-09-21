'use strict';

const assert = require('assert');
const mcp9808 = require('../');
const currentTemperature = require('./current-temperature');

// check belowLowerLimit
currentTemperature().then(currentTemp =>
  mcp9808.open({
    lowerAlertTemperature: currentTemp + 10,
    upperAlertTemperature: currentTemp + 20,
    criticalTemperature: currentTemp + 30
  })
).then(sensor =>
  sensor.temperature().then(temp =>
    assert(
      temp.belowLowerLimit === true &&
      temp.aboveUpperLimit === false &&
      temp.critical === false,
      'Expected belowLowerLimit only.'
    )
  ).then(_ => sensor.close())
// check all false
).then(_ => currentTemperature()).then(currentTemp =>
  mcp9808.open({
    lowerAlertTemperature: currentTemp - 10,
    upperAlertTemperature: currentTemp + 10,
    criticalTemperature: currentTemp + 20
  })
).then(sensor =>
  sensor.temperature().then(temp =>
    assert(
      temp.belowLowerLimit === false &&
      temp.aboveUpperLimit === false &&
      temp.critical === false,
      'Expected all false.'
    )
  ).then(_ => sensor.close())
// check aboveUpperLimit only
).then(_ => currentTemperature()).then(currentTemp =>
  mcp9808.open({
    lowerAlertTemperature: currentTemp - 20,
    upperAlertTemperature: currentTemp - 10,
    criticalTemperature: currentTemp + 10
  })
).then(sensor =>
  sensor.temperature().then(temp =>
    assert(
      temp.belowLowerLimit === false &&
      temp.aboveUpperLimit === true &&
      temp.critical === false,
      'Expected aboveUpperLimit only.'
    )
  ).then(_ => sensor.close())
// check critical and aboveUpperLimit only
).then(_ => currentTemperature()).then(currentTemp =>
  mcp9808.open({
    lowerAlertTemperature: currentTemp - 30,
    upperAlertTemperature: currentTemp - 20,
    criticalTemperature: currentTemp - 10
  })
).then(sensor =>
  sensor.temperature().then(temp =>
    assert(
      temp.belowLowerLimit === false &&
      temp.aboveUpperLimit === true &&
      temp.critical === true,
      'Expected critical and aboveUpperLimit only.'
    )
  ).then(_ => sensor.close())
).catch(console.log);

