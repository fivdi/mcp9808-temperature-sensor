'use strict';

const mcp9808 = require('../');
const currentTemperature = require('./current-temperature');

currentTemperature().then(currentTemp =>
  mcp9808.open({
    alertGpioNumber: 27,
    lowerAlertTemperature: currentTemp - 10,
    upperAlertTemperature: currentTemp + 10,
    criticalTemperature: currentTemp + 20
  })
).then(sensor => {
  let watchdog = setTimeout(_ => {
    throw new Error('Expected an alert event with no alerts.');
  }, 1000);

  sensor.on('alert', temperature => {
    if (!temperature.belowLowerLimit &&
        !temperature.aboveUpperLimit &&
        !temperature.critical) {
      clearTimeout(watchdog);
      setTimeout(_ => sensor.close().catch(console.log), 100);
    }    
  });

  return sensor.enableAlerts();
}).catch(console.log);

