'use strict';

const Mcp9808 = require('../');

Mcp9808.open().then((tempSensor) => {
  const startTime = process.hrtime();
  let readCount = 0;

  const next = () => {
    tempSensor.temperature().then((temp) => {
      readCount += 1;
      if (readCount % 1000 === 0) {
        console.log('  ' + readCount + ', ' + temp.celsius + '°C');
      }
      if (readCount < 5000) {
        next();
      } else {
        const time = process.hrtime(startTime);
        const readsPerSecond = Math.floor(
          readCount / (time[0] + time[1] / 1E9)
        );

        console.log('  ' + readsPerSecond + ' reads per second');

        return tempSensor.close();
      }
    }).catch((err) => {
      console.log(err.stack);
    });
  };

  next();
}).catch((err) => {
  console.log(err.stack);
});

