'use strict';

const mcp9808 = require('../');
const currentTemperature = require('./current-temperature');

currentTemperature().then(currentTemp =>
  mcp9808.open({
    alertGpioNumber: 27,
    lowerAlertTemperature: currentTemp + 10,
    upperAlertTemperature: currentTemp + 20,
    criticalTemperature: currentTemp + 30
  })
).then(sensor => {
  let watchdog = setTimeout(_ => {
    throw new Error('Expected a belowLowerLimit alert event.');
  }, 1000);

  sensor.on('alert', temperature => {
    if (temperature.belowLowerLimit) {
      clearTimeout(watchdog);
      setTimeout(_ => sensor.close().catch(console.log), 100);
    }    
  });

  return sensor.enableAlerts();
}).catch(console.log);

