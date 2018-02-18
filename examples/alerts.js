'use strict';

const Mcp9808 = require('../');

Mcp9808.open({
  i2cBusNumber: 1, // optional, default 1
  i2cAddress: 0x18, // optional, default 0x18
  alertGpioNumber: 27,
  lowerAlertTemperature: 25,
  upperAlertTemperature: 35,
  criticalTemperature: 45
}).then((sensor) => {
  sensor.on('alert', (temp) => {
    console.log('  alert ' + temp.celsius + '°C');
    if (temp.critical) {
      console.log('    critical')
    }
    if (temp.aboveUpperLimit) {
      console.log('    above upper limit');
    }
    if (temp.belowLowerLimit) {
      console.log('    below lower limit');
    }
  });

  sensor.enableAlerts();

  setInterval(() => {
    sensor.temperature().then((temp) => {
      console.log(temp.celsius + '°C');
    });
  }, 1000);
}).catch((err) => {
  console.log(err.stack);
});

