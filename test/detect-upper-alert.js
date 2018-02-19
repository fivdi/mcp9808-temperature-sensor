'use strict';

const Mcp9808 = require('../');
const currentTemperature = require('./current-temperature');

currentTemperature().then((currentTemp) => {
  return Mcp9808.open({
    alertGpioNumber: 27,
    lowerAlertTemperature: currentTemp - 20,
    upperAlertTemperature: currentTemp - 10,
    criticalTemperature: currentTemp + 10
  });
}).then((sensor) => {
  let watchdog = setTimeout(() => {
    throw new Error('Expected an aboveUpperLimit alert event.');
  }, 1000);

  sensor.on('alert', (tempData) => {
    if (tempData.aboveUpperLimit) {
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

