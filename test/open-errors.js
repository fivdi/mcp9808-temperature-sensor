'use strict';

const assert = require('assert');
const mcp9808 = require('../');

// options
mcp9808.open('not an options object').
then(sensor => assert(false, 'Expected open to reject invalid options object.')).
catch(err => {
  if (err.message !== 'Expected options to be of type object. Got type string.') {
    console.log(err.stack);
  }
});

// i2cBusNumber
mcp9808.open({i2cBusNumber: 'a string'}).
then(sensor => assert(false, 'Expected open to reject invalid i2cBusNumber.')).
catch(err => {
  if (err.message !== 'Expected i2cBusNumber to be a non-negative integer. Got "a string".') {
    console.log(err.stack);
  }
});

mcp9808.open({i2cBusNumber: -1}).
then(sensor => assert(false, 'Expected open to reject invalid i2cBusNumber.')).
catch(err => {
  if (err.message !== 'Expected i2cBusNumber to be a non-negative integer. Got "-1".') {
    console.log(err.stack);
  }
});

mcp9808.open({i2cBusNumber: 1.5}).
then(sensor => assert(false, 'Expected open to reject invalid i2cBusNumber.')).
catch(err => {
  if (err.message !== 'Expected i2cBusNumber to be a non-negative integer. Got "1.5".') {
    console.log(err.stack);
  }
});

// i2cAddress
mcp9808.open({i2cAddress: 'a string'}).
then(sensor => assert(false, 'Expected open to reject invalid i2cAddress.')).
catch(err => {
  if (err.message !== 'Expected i2cAddress to be an integer >= 0 and <= 0x7f. Got "a string".') {
    console.log(err.stack);
  }
});

mcp9808.open({i2cAddress: -1}).
then(sensor => assert(false, 'Expected open to reject invalid i2cAddress.')).
catch(err => {
  if (err.message !== 'Expected i2cAddress to be an integer >= 0 and <= 0x7f. Got "-1".') {
    console.log(err.stack);
  }
});

mcp9808.open({i2cAddress: 128}).then(sensor =>
  assert(false, 'Expected open to reject invalid i2cAddress.')
).catch(err => {
  if (err.message !== 'Expected i2cAddress to be an integer >= 0 and <= 0x7f. Got "128".') {
    console.log(err.stack);
  }
});

mcp9808.open({i2cAddress: 1.5}).
then(sensor => assert(false, 'Expected open to reject invalid i2cAddress.')).
catch(err => {
  if (err.message !== 'Expected i2cAddress to be an integer >= 0 and <= 0x7f. Got "1.5".') {
    console.log(err.stack);
  }
});

// alertGpioNumber
mcp9808.open({alertGpioNumber: 'a string'}).
then(sensor => assert(false, 'Expected open to reject invalid alertGpioNumber.')).
catch(err => {
  if (err.message !== 'Expected alertGpioNumber to be a non-negative integer. Got "a string".') {
    console.log(err.stack);
  }
});

mcp9808.open({alertGpioNumber: -1}).
then(sensor => assert(false, 'Expected open to reject invalid alertGpioNumber.')).
catch(err => {
  if (err.message !== 'Expected alertGpioNumber to be a non-negative integer. Got "-1".') {
    console.log(err.stack);
  }
});

mcp9808.open({alertGpioNumber: 1.5}).
then(sensor => assert(false, 'Expected open to reject invalid alertGpioNumber.')).
catch(err => {
  if (err.message !== 'Expected alertGpioNumber to be a non-negative integer. Got "1.5".') {
    console.log(err.stack);
  }
});

// lowerAlertTemperature
mcp9808.open({lowerAlertTemperature: 'a string'}).
then(sensor => assert(false, 'Expected open to reject invalid lowerAlertTemperature.')).
catch(err => {
  if (err.message !== 'Expected lowerAlertTemperature to be a number >= -256 and <= 255.75. Got "a string".') {
    console.log(err.stack);
  }
});

mcp9808.open({lowerAlertTemperature: -300}).
then(sensor => assert(false, 'Expected open to reject invalid lowerAlertTemperature.')).
catch(err => {
  if (err.message !== 'Expected lowerAlertTemperature to be a number >= -256 and <= 255.75. Got "-300".') {
    console.log(err.stack);
  }
});

mcp9808.open({lowerAlertTemperature: 300}).
then(sensor => assert(false, 'Expected open to reject invalid lowerAlertTemperature.')).
catch(err => {
  if (err.message !== 'Expected lowerAlertTemperature to be a number >= -256 and <= 255.75. Got "300".') {
    console.log(err.stack);
  }
});

// upperAlertTemperature
mcp9808.open({upperAlertTemperature: 'a string'}).
then(sensor => assert(false, 'Expected open to reject invalid upperAlertTemperature.')).
catch(err => {
  if (err.message !== 'Expected upperAlertTemperature to be a number >= -256 and <= 255.75. Got "a string".') {
    console.log(err.stack);
  }
});

mcp9808.open({upperAlertTemperature: -400}).
then(sensor => assert(false, 'Expected open to reject invalid upperAlertTemperature.')).
catch(err => {
  if (err.message !== 'Expected upperAlertTemperature to be a number >= -256 and <= 255.75. Got "-400".') {
    console.log(err.stack);
  }
});

mcp9808.open({upperAlertTemperature: 400}).
then(sensor => assert(false, 'Expected open to reject invalid upperAlertTemperature.')).
catch(err => {
  if (err.message !== 'Expected upperAlertTemperature to be a number >= -256 and <= 255.75. Got "400".') {
    console.log(err.stack);
  }
});

// criticalTemperature
mcp9808.open({criticalTemperature: 'a string'}).
then(sensor => assert(false, 'Expected open to reject invalid criticalTemperature.')).
catch(err => {
  if (err.message !== 'Expected criticalTemperature to be a number >= -256 and <= 255.75. Got "a string".') {
    console.log(err.stack);
  }
});

mcp9808.open({criticalTemperature: -500}).
then(sensor => assert(false, 'Expected open to reject invalid criticalTemperature.')).
catch(err => {
  if (err.message !== 'Expected criticalTemperature to be a number >= -256 and <= 255.75. Got "-500".') {
    console.log(err.stack);
  }
});

mcp9808.open({criticalTemperature: 500}).
then(sensor => assert(false, 'Expected open to reject invalid criticalTemperature.')).
catch(err => {
  if (err.message !== 'Expected criticalTemperature to be a number >= -256 and <= 255.75. Got "500".') {
    console.log(err.stack);
  }
});

// resolution
mcp9808.open({resolution: 'a string'}).
then(sensor => assert(false, 'Expected open to reject invalid resolution.')).
catch(err => {
  if (err.message !== 'Expected resolution to be an integer >= 0 and <= 3. Got "a string".') {
    console.log(err.stack);
  }
});

mcp9808.open({resolution: -1}).
then(sensor => assert(false, 'Expected open to reject invalid resolution.')).
catch(err => {
  if (err.message !== 'Expected resolution to be an integer >= 0 and <= 3. Got "-1".') {
    console.log(err.stack);
  }
});

mcp9808.open({resolution: 4}).
then(sensor => assert(false, 'Expected open to reject invalid resolution.')).
catch(err => {
  if (err.message !== 'Expected resolution to be an integer >= 0 and <= 3. Got "4".') {
    console.log(err.stack);
  }
});

// hysteresis
mcp9808.open({hysteresis: 'a string'}).
then(sensor => assert(false, 'Expected open to reject invalid hysteresis.')).
catch(err => {
  if (err.message !== 'Expected hysteresis to be an integer >= 0 and <= 3. Got "a string".') {
    console.log(err.stack);
  }
});

mcp9808.open({hysteresis: -1}).
then(sensor => assert(false, 'Expected open to reject invalid hysteresis.')).
catch(err => {
  if (err.message !== 'Expected hysteresis to be an integer >= 0 and <= 3. Got "-1".') {
    console.log(err.stack);
  }
});

mcp9808.open({hysteresis: 4}).
then(sensor => assert(false, 'Expected open to reject invalid hysteresis.')).
catch(err => {
  if (err.message !== 'Expected hysteresis to be an integer >= 0 and <= 3. Got "4".') {
    console.log(err.stack);
  }
});

// alert temperatures
mcp9808.open({lowerAlertTemperature: 20}).
then(sensor => assert(false, 'Expected open to reject if correct number of alert temperatures not specified.')).
catch(err => {
  if (err.message !== 'Expected all alert temperatures or no alert temperatures to be specified.') {
    console.log(err.stack);
  }
});

mcp9808.open({lowerAlertTemperature: 20, upperAlertTemperature: 30}).
then(sensor => assert(false, 'Expected open to reject if correct number of alert temperatures not specified.')).
catch(err => {
  if (err.message !== 'Expected all alert temperatures or no alert temperatures to be specified.') {
    console.log(err.stack);
  }
});

mcp9808.open({upperAlertTemperature: 30, criticalTemperature: 40}).
then(sensor => assert(false, 'Expected open to reject if correct number of alert temperatures not specified.')).
catch(err => {
  if (err.message !== 'Expected all alert temperatures or no alert temperatures to be specified.') {
    console.log(err.stack);
  }
});

mcp9808.open({lowerAlertTemperature: 30, upperAlertTemperature: 30, criticalTemperature: 40}).
then(sensor => assert(false, 'Expected open to reject bad temperatures.')).
catch(err => {
  if (err.message !== 'Expected lowerAlertTemperature to be < upperAlertTemperature.') {
    console.log(err.stack);
  }
});

mcp9808.open({lowerAlertTemperature: 20, upperAlertTemperature: 40, criticalTemperature: 40}).
then(sensor => assert(false, 'Expected open to reject bad temperatures.')).
catch(err => {
  if (err.message !== 'Expected upperAlertTemperature to be < criticalTemperature.') {
    console.log(err.stack);
  }
});


