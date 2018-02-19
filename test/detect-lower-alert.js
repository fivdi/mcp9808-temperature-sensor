'use strict';

const Mcp9808 = require('../');
const currentTemperature = require('./current-temperature');

currentTemperature().then((currentTemp) => {
  return Mcp9808.open({
    alertGpioNumber: 27,
    lowerAlertTemperature: currentTemp + 10,
    upperAlertTemperature: currentTemp + 20,
    criticalTemperature: currentTemp + 30
  });
}).then((sensor) => {
  let watchdog = setTimeout(() => {
    throw new Error('Expected a belowLowerLimit alert event.');
  }, 1000);

  sensor.on('alert', (tempData) => {
    if (tempData.belowLowerLimit) {
      clearTimeout(watchdog);

      setTimeout(() => {
        sensor.close().catch((err) => {
          console.log(err.stack);
        });
      }, 100);
    }    
  });

  return sensor.enableAlerts();
}).catch((err) => {
  console.log(err.stack);
});

