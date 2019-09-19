'use strict';

const Mcp9808 = require('../');

Mcp9808.open().then(sensor => {
  const startTime = process.hrtime();
  let readCount = 0;

  const next = _ => {
    sensor.temperature().then(temperature => {
      readCount += 1;

      if (readCount % 1000 === 0) {
        console.log('  ' + readCount + ', ' + temperature.celsius + '°C');
      }

      if (readCount < 5000) {
        next();
      } else {
        const time = process.hrtime(startTime);
        const readsPerSecond = Math.floor(
          readCount / (time[0] + time[1] / 1E9)
        );

        console.log('  ' + readsPerSecond + ' reads per second');

        return sensor.close();
      }
    }).catch(console.log);
  };

  next();
}).catch(console.log);

