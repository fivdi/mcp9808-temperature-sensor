'use strict';

const Mcp9808 = require('../');
const currentTemperature = require('./current-temperature');

currentTemperature().then((currentTemp) => {
  return Mcp9808.open({
    alertGpioNumber: 27,
    lowerAlertTemperature: currentTemp - 10,
    upperAlertTemperature: currentTemp + 10,
    criticalTemperature: currentTemp + 20
  });
}).then((sensor) => {
  let watchdog = setTimeout(() => {
    throw new Error('Expected an alert event with no alerts.');
  }, 1000);

  sensor.on('alert', (tempData) => {
    if (!tempData.belowLowerLimit &&
        !tempData.aboveUpperLimit &&
        !tempData.critical) {
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

