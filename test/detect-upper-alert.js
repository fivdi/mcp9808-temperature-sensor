'use strict';

const Mcp9808 = require('../');
const currentTemperature = require('./current-temperature');

currentTemperature().then(currentTemp =>
  Mcp9808.open({
    alertGpioNumber: 27,
    lowerAlertTemperature: currentTemp - 20,
    upperAlertTemperature: currentTemp - 10,
    criticalTemperature: currentTemp + 10
  })
).then(sensor => {
  let watchdog = setTimeout(_ => {
    throw new Error('Expected a aboveUpperLimit alert event.');
  }, 1000);

  sensor.on('alert', temperature => {
    if (temperature.aboveUpperLimit) {
      clearTimeout(watchdog);
      setTimeout(_ => sensor.close().catch(console.log), 100);
    }    
  });

  return sensor.enableAlerts();
}).catch(console.log);

