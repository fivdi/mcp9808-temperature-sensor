[![Build Status](https://travis-ci.org/fivdi/mcp9808-temperature-sensor.svg?branch=master)](https://travis-ci.org/fivdi/mcp9808-temperature-sensor)
[![npm Version](http://img.shields.io/npm/v/mcp9808-temperature-sensor.svg)](https://www.npmjs.com/package/mcp9808-temperature-sensor)
[![Downloads Per Month](http://img.shields.io/npm/dm/mcp9808-temperature-sensor.svg)](https://www.npmjs.com/package/mcp9808-temperature-sensor)

# mcp9808-temperature-sensor

MCP9808 I2C temperature sensor module for Node.js on Linux boards like the
Raspberry Pi or BeagleBone.

Supports Node.js versions 6, 8, 10 and 12.

## Contents

 * [Features](#features)
 * [Installation](#installation)
 * [Usage](#usage)
   * [Circuit](#circuit)
   * [Report the Temperature](#report-the-temperature)
   * [Alerts](#alerts)
 * [API](#api)
 * [Related Packages](#related-packages)

## Features

 * Simple temperature sensing
 * Alert detection
 * Real hardware interrupts used to detect alerts, no polling needed
 * Promise based asynchronous API

## Installation

```
npm install mcp9808-temperature-sensor
```

## Usage

#### Circuit

<img src="https://raw.githubusercontent.com/fivdi/mcp9808-temperature-sensor/master/examples/circuit.png">

Note that neither the 10kΩ pull-up resistor nor the wire connecting Alert on
the MCP9808 breakout board to GPIO27 on the Raspberry Pi are needed for the
"Report the Temperature" example. They are needed for the "Alerts" example.

#### Report the Temperature

Log the temperature in degrees Celsius to the console.

```js
const mcp9808 = require('mcp9808-temperature-sensor');

mcp9808.open().then(sensor =>
  sensor.temperature().
  then(temp => console.log(temp.celsius + '°C')).
  then(_ => sensor.close())
).catch(console.log);
```

#### Alerts

Fire alert events if the temperature drops below 25°C, goes above 35°C or
becomes critical at 45°C.

A hair dryer or blow dryer can be used to blow hot air over the MCP9808
temperature sensor and increase its temperature.

```js
const mcp9808 = require('mcp9808-temperature-sensor');

mcp9808.open({
  i2cBusNumber: 1, // optional, default 1
  i2cAddress: 0x18, // optional, default 0x18
  alertGpioNumber: 27,
  lowerAlertTemperature: 25,
  upperAlertTemperature: 35,
  criticalTemperature: 45
}).then(sensor => {
  setInterval(_ => {
    sensor.temperature().then(temp => console.log(temp.celsius + '°C'));
  }, 1000);

  sensor.on('alert', temp => {
    console.log('  alert ' + temp.celsius + '°C');
    if (temp.critical) {
      console.log('    critical');
    }
    if (temp.aboveUpperLimit) {
      console.log('    above upper limit');
    }
    if (temp.belowLowerLimit) {
      console.log('    below lower limit');
    }
  });

  return sensor.enableAlerts();
}).catch(console.log);
```

## API

### Functions

- [open([options])](#openoptions)

### Class Mcp9808

- [close()](#close)
- [temperature()](#temperature)
- [enableAlerts()](#enablealerts)

### Events

- [Event: 'alert'](#event-alert)
- [Event: 'error'](#event-error)

### Constants

- [RESOLUTION_1_2](#resolution_1_2)
- [RESOLUTION_1_4](#resolution_1_4)
- [RESOLUTION_1_8](#resolution_1_8)
- [RESOLUTION_1_16](#resolution_1_16)
- [HYSTERESIS_0](#hysteresis_0)
- [HYSTERESIS_1_5](#hysteresis_1_5)
- [HYSTERESIS_3](#hysteresis_3)
- [HYSTERESIS_6](#hysteresis_6)

#### open([options])
Returns a promise for an Mcp9808 object.

The following options are supported:
- i2cBusNumber - integer, I2C bus number, optional, default 1
- i2cAddress - integer, MCP9808 I2C address, optional, default 0x18
- alertGpioNumber - integer, GPIO number of the GPIO used for alert interrupt
detection, see [onoff](https://github.com/fivdi/onoff), optional, no default,
none used if none specified
- lowerAlertTemperature - number, alert lower temperature boundary, optional,
default 0°C
- upperAlertTemperature - number, alert upper temperature boundary, optional,
default 0°C
- criticalTemperature - number, alert critical temperature boundary, optional,
default 0°C
- resolution - integer, sensor resolution, see
[resolution constants](#resolution_1_2), optional, default 0.0625°C
- hysteresis - hysteresis for lower, upper and critical temperatures,
see [hysteresis constants](#hysteresis_0), optional, default 0°C

#### close()
Returns a promise which will resolve when all resources used by the Mcp9808
object have been freed.

#### temperature()
Returns a promise for an object containing
[temperature data](#temperature-data).

#### enableAlerts()
Returns a promise which will resolve when alerts have been enabled for the
Mcp9808.

### Event: 'alert'
- temperatureData - object containing [temperature data](#temperature-data)

Fired when an alert is detected.

### Event: 'error'
- err - Error object

Fired when an error occurs during alert detection.

### RESOLUTION_1_2
0.5°C resolution.

### RESOLUTION_1_4
0.25°C resolution.

### RESOLUTION_1_8
0.125°C resolution.

### RESOLUTION_1_16
0.0625°C resolution.

### HYSTERESIS_0
0°C hysteresis.

### HYSTERESIS_1_5
1.5°C hysteresis.

### HYSTERESIS_3
3°C hysteresis.

### HYSTERESIS_6
6°C hysteresis.

### Temperature Data
- celsius - number, temperature in degrees Celsius
- belowLowerLimit - boolean, true if temperature less than lower limit, else
false
- aboveUpperLimit - boolean, true if temperature greater than upper limit,
else false
- critical - boolean, true if temperature greater than or equal to critical
temperature, else false

## Related Packages

- [onoff](https://github.com/fivdi/onoff) - GPIO access and interrupt detection
- [i2c-bus](https://github.com/fivdi/i2c-bus) - I2C serial bus access

