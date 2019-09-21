'use strict';

const mcp9808 = require('../');
const currentTemperature = require('./current-temperature');

currentTemperature().then(currentTemp =>
  mcp9808.open({
    alertGpioNumber: 27,
    lowerAlertTemperature: currentTemp - 30,
    upperAlertTemperature: currentTemp - 20,
    criticalTemperature: currentTemp - 10
  })
).then(sensor => {
  let watchdog = setTimeout(_ => {
    throw new Error('Expected a critical alert event.');
  }, 1000);

  sensor.on('alert', temperature => {
    if (temperature.critical) {
      clearTimeout(watchdog);
      setTimeout(_ => sensor.close().catch(console.log), 100);
    }    
  });

  return sensor.enableAlerts();
}).catch(console.log);

