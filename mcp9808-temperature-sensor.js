'use strict';

const EventEmitter = require('events');
const Gpio = require('onoff').Gpio;
const i2c = require('i2c-bus');
const mutexify = require('mutexify');

const DEFAULT_I2C_BUS = 1;
const DEFAULT_I2C_ADDRESS = 0x18;

const MANUFACTURER_ID = 0x54;
const DEVICE_ID = 0x04;

const CONFIGURATION_REG = 0x01;
const UPPER_ALERT_TEMP_REG = 0x02;
const LOWER_ALERT_TEMP_REG = 0x03;
const CRITICAL_TEMP_REG = 0x04;
const TEMP_REG = 0x05;
const MANUFACTURER_ID_REG = 0x06;
const DEVICE_ID_REVISION_REG = 0x07;
const RESOLUTION_REG = 0x08;

const MIN_TEMPERATURE = -256;
const MAX_TEMPERATURE = 0xffc / 16; // 255.75

const MIN_RESOLUTION = 0;
const MAX_RESOLUTION = 3;

const MIN_HYSTERESIS = 0;
const MAX_HYSTERESIS = 3;

const CONFIGURATION_BITS = 0x7ff;

const HYSTERESIS_BITS = 0x0600;
const SHUTDOWN_BIT = 0x0100;
const INTERRUPT_CLEAR_BIT = 0x0020;
const ALERT_ENABLED_BIT = 0x0008;
const ALERT_MODE_BIT = 0x0001;

const configRegLock = mutexify();

const validateOpenOptions = (options) => {
  if (typeof options !== 'object') {
    return 'Expected options to be of type object.' +
      ' Got type ' + typeof options + '.';
  }

  if (options.i2cBusNumber !== undefined &&
      (!Number.isSafeInteger(options.i2cBusNumber) ||
       options.i2cBusNumber < 0
      )
     ) {
    return 'Expected i2cBusNumber to be a non-negative integer.' +
      ' Got "' + options.i2cBusNumber + '".';
  }

  if (options.i2cAddress !== undefined &&
      (!Number.isSafeInteger(options.i2cAddress) ||
       options.i2cAddress < 0 ||
       options.i2cAddress > 0x7f
      )
     ) {
    return 'Expected i2cAddress to be an integer' +
      ' >= 0 and <= 0x7f. Got "' + options.i2cAddress + '".';
  }

  if (options.alertGpioNumber !== undefined &&
      (!Number.isSafeInteger(options.alertGpioNumber) ||
       options.alertGpioNumber < 0
      )
     ) {
    return 'Expected alertGpioNumber to be a non-negative integer. ' +
      'Got "' + options.alertGpioNumber + '".';
  }

  if (options.lowerAlertTemperature !== undefined &&
      (typeof options.lowerAlertTemperature !== 'number' ||
       options.lowerAlertTemperature < MIN_TEMPERATURE ||
       options.lowerAlertTemperature > MAX_TEMPERATURE
      )
     ) {
    return 'Expected lowerAlertTemperature to be a number >= ' +
      MIN_TEMPERATURE + ' and <= ' + MAX_TEMPERATURE +
      '. Got "' + options.lowerAlertTemperature + '".';
  }

  if (options.upperAlertTemperature !== undefined &&
      (typeof options.upperAlertTemperature !== 'number' ||
       options.upperAlertTemperature < MIN_TEMPERATURE ||
       options.upperAlertTemperature > MAX_TEMPERATURE
      )
     ) {
    return 'Expected upperAlertTemperature to be a number >= ' +
      MIN_TEMPERATURE + ' and <= ' + MAX_TEMPERATURE +
      '. Got "' + options.upperAlertTemperature + '".';
  }

  if (options.criticalTemperature !== undefined &&
      (typeof options.criticalTemperature !== 'number' ||
       options.criticalTemperature < MIN_TEMPERATURE ||
       options.criticalTemperature > MAX_TEMPERATURE
      )
     ) {
    return 'Expected criticalTemperature to be a number >= ' +
      MIN_TEMPERATURE + ' and <= ' + MAX_TEMPERATURE +
      '. Got "' + options.criticalTemperature + '".';
  }

  if (options.criticalTemperature !== undefined &&
      (typeof options.criticalTemperature !== 'number' ||
       options.criticalTemperature < MIN_TEMPERATURE ||
       options.criticalTemperature > MAX_TEMPERATURE
      )
     ) {
    return 'Expected criticalTemperature to be a number >= ' +
      MIN_TEMPERATURE + ' and <= ' + MAX_TEMPERATURE +
      '. Got "' + options.criticalTemperature + '".';
  }

  if (options.resolution !== undefined &&
      (!Number.isSafeInteger(options.resolution) ||
       options.resolution < MIN_RESOLUTION ||
       options.resolution > MAX_RESOLUTION
      )
     ) {
    return 'Expected resolution to be an integer >= ' +
      MIN_RESOLUTION + ' and <= ' + MAX_RESOLUTION +
      '. Got "' + options.resolution + '".';
  }

  if (options.hysteresis !== undefined &&
      (!Number.isSafeInteger(options.hysteresis) ||
       options.hysteresis < MIN_HYSTERESIS ||
       options.hysteresis > MAX_HYSTERESIS
      )
     ) {
    return 'Expected hysteresis to be an integer >= ' +
      MIN_HYSTERESIS + ' and <= ' + MAX_HYSTERESIS +
      '. Got "' + options.hysteresis + '".';
  }

  if (options.lowerAlertTemperature !== undefined ||
      options.upperAlertTemperature !== undefined ||
      options.criticalTemperature !== undefined) {

    if (options.lowerAlertTemperature === undefined ||
        options.upperAlertTemperature === undefined ||
        options.criticalTemperature === undefined) {
      return 'Expected all alert temperatures' +
        ' or no alert temperatures to be specified.';
    }

    let lowerAlertTemperature =
      Math.round(options.lowerAlertTemperature * 4) / 4;
    let upperAlertTemperature =
      Math.round(options.upperAlertTemperature * 4) / 4;
    let criticalTemperature =
      Math.round(options.criticalTemperature * 4) / 4;

    if (lowerAlertTemperature >= upperAlertTemperature) {
      return 'Expected lowerAlertTemperature to be < upperAlertTemperature.';
    }

    if (upperAlertTemperature >= criticalTemperature) {
      return 'Expected upperAlertTemperature to be < criticalTemperature.';
    }
  }

  return null;
};

class I2cMcp9808 {
  constructor(i2cBus, i2cAddress) {
    this._i2cBus = i2cBus;
    this._i2cAddress = i2cAddress;
  }

  writeByte(register, byte) {
    return new Promise((resolve, reject) => {
      this._i2cBus.writeByte(this._i2cAddress, register, byte, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  readWord(register) {
    return new Promise((resolve, reject) => {
      this._i2cBus.readWord(this._i2cAddress, register, (err, word) => {
        if (err) {
          reject(err);
        } else {
          resolve((word >> 8) + ((word & 0xff) << 8));
        }
      });
    });
  }

  writeWord(register, word) {
    return new Promise((resolve, reject) => {
      word = (word >> 8) + ((word & 0xff) << 8);

      this._i2cBus.writeWord(this._i2cAddress, register, word, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  softReset() {
    return this.configuration(0, SHUTDOWN_BIT).then(() => {
      return this.configuration(0, ALERT_ENABLED_BIT);
    }).then(() => {
      // TODO - can this be removed?
      return this.configuration(0, ALERT_MODE_BIT);
    }).then(() => {
      return Promise.all([
        this.lowerAlertTemperature(0),
        this.upperAlertTemperature(0),
        this.criticalTemperature(0)
      ]);
    }).then(() => {
      return this.resolution(Mcp9808.RESOLUTION_1_16);
    }).then(() => {
      return this.configuration(
        INTERRUPT_CLEAR_BIT,
        CONFIGURATION_BITS ^ INTERRUPT_CLEAR_BIT
      );
    });
  }

  configuration(bitsToSet, bitsToReset) {
    let releaseConfigRegLock;

    // To modify bits in the configuration register it's necessary to read
    // the register, modify the required bits and write back to the
    // register. In order to prevent parallel asynchronous operations that
    // are modifying the configuration register from stepping on each other
    // here a mutex is needed.
    return new Promise((resolve, reject) => {
      configRegLock((release) => {
        releaseConfigRegLock = release;
        resolve();
      });
    }).then(() => {
      return this.readWord(CONFIGURATION_REG);
    }).then((config) => {
      config |= bitsToSet;
      config &= (~bitsToReset & 0xffff);

      return this.writeWord(CONFIGURATION_REG, config);
    }).then(() => {
      releaseConfigRegLock();
    }, (err) => {
      releaseConfigRegLock();
      return Promise.reject(err);
    });
  }

  writeTemperature(tempRegister, temp) {
    return Promise.resolve().then(() => {
      let rawTemp = temp < 0 ? temp + 256 : temp;

      rawTemp = (Math.round(rawTemp * 4) << 2);
      if (temp < 0) {
        rawTemp |= 0x1000;
      }

      return this.writeWord(tempRegister, rawTemp);
    });
  }

  temperature() {
    return this.readWord(TEMP_REG).then((rawTemp) => {
      let temp = (rawTemp & 0x0fff) / 16;

      if (rawTemp & 0x1000) {
        temp -= 256;
      }

      return {
        celsius: temp,
        belowLowerLimit: !!(rawTemp & 0x2000),
        aboveUpperLimit: !!(rawTemp & 0x4000),
        critical: !!(rawTemp & 0x8000),
        rawTemp: rawTemp
      };
    });
  }

  lowerAlertTemperature(temp) {
    return this.writeTemperature(LOWER_ALERT_TEMP_REG, temp);
  }

  upperAlertTemperature(temp) {
    return this.writeTemperature(UPPER_ALERT_TEMP_REG, temp);
  }

  criticalTemperature(temp) {
    return this.writeTemperature(CRITICAL_TEMP_REG, temp);
  }

  manufacturerId() {
    return this.readWord(MANUFACTURER_ID_REG);
  }

  deviceId() {
    return this.readWord(DEVICE_ID_REVISION_REG).then((word) => {
      return word >> 8;
    });
  }

  resolution(val) {
    return this.writeByte(RESOLUTION_REG, val);
  }

  hysteresis(val) {
    return this.configuration(
      (val << 9) & HYSTERESIS_BITS,
      (~val << 9) & HYSTERESIS_BITS
    );
  }

  enableAlerts() {
    // Don't set alertEnabled and alertMode at the same time. If done, there
    // will be no interrupt if the application is started and the current
    // temperature is > upperAlertTemperature and < criticalTemperature.
    return this.configuration(ALERT_ENABLED_BIT, 0).then(() => {
      return this.configuration(ALERT_MODE_BIT, 0);
    });
  }
}

class Mcp9808 extends EventEmitter {
  static get RESOLUTION_1_2() {return 0;}
  static get RESOLUTION_1_4() {return 1;}
  static get RESOLUTION_1_8() {return 2;}
  static get RESOLUTION_1_16() {return 3;}

  static get HYSTERESIS_0() {return 0;}
  static get HYSTERESIS_1_5() {return 1;}
  static get HYSTERESIS_3() {return 2;}
  static get HYSTERESIS_6() {return 3;}

  constructor(i2cBus, i2cMcp9808, alertGpio) {
    super();

    this._i2cBus = i2cBus;
    this._i2cMcp9808 = i2cMcp9808;
    this._alertGpio = alertGpio;
  }

  static open(options) {
    let i2cMcp9808;
    let tempSensor;

    return new Promise((resolve, reject) => {
      options = options || {};

      let errMsg = validateOpenOptions(options);

      if (errMsg) {
        reject(new Error(errMsg));
      } else {
        const i2cBusNumber = options.i2cBusNumber === undefined ?
          DEFAULT_I2C_BUS : options.i2cBusNumber;

        const i2cBus = i2c.open(i2cBusNumber, (err) => {
          if (err) {
            reject(err);
          } else {
            let alertGpio = null;
            let lastAlertWasCritical = false;

            if (options.alertGpioNumber !== undefined) {
              alertGpio = new Gpio(options.alertGpioNumber, 'in', 'both');

              alertGpio.watch((err, value) => {
                if (err) {
                  tempSensor.emit('error', err);
                  return;
                }

                let fallingEdge = (value === 0);

                tempSensor.temperature().then((temp) => {
                  if (fallingEdge || lastAlertWasCritical) {
                    tempSensor.emit('alert', temp);
                  }

                  lastAlertWasCritical = temp.critical;

                  if (fallingEdge && !temp.critical) {
                    return i2cMcp9808.configuration(INTERRUPT_CLEAR_BIT, 0);
                  }
                }).catch((err) => {
                  tempSensor.emit('error', err);
                });
              });
            }

            const i2cAddress = options.i2cAddress === undefined ?
              DEFAULT_I2C_ADDRESS : options.i2cAddress;

            i2cMcp9808 = new I2cMcp9808(i2cBus, i2cAddress);

            resolve(new Mcp9808(i2cBus, i2cMcp9808, alertGpio));
          }
        });
      }
    }).then((sensor) => {
      tempSensor = sensor;
      return i2cMcp9808.manufacturerId();
    }).then((manufacturerId) => {
      if (manufacturerId !== MANUFACTURER_ID) {
        return Promise.reject(new Error(
          'Expected manufacturer ID to be 0x' + MANUFACTURER_ID.toString(16) +
          '. Got 0x' + manufacturerId.toString(16) +
          '. MCP9808 sensor not found.'
        ));
      }
      return i2cMcp9808.deviceId();
    }).then((deviceId) => {
      if (deviceId !== DEVICE_ID) {
        return Promise.reject(new Error(
          'Expected device ID to be 0x' + DEVICE_ID.toString(16) +
          '. Got 0x' + deviceId.toString(16) +
          '. MCP9808 sensor not found.'
        ));
      }
      return i2cMcp9808.softReset();
    }).then(() => {
      if (options.lowerAlertTemperature !== undefined) {
        return Promise.all([
          i2cMcp9808.lowerAlertTemperature(options.lowerAlertTemperature),
          i2cMcp9808.upperAlertTemperature(options.upperAlertTemperature),
          i2cMcp9808.criticalTemperature(options.criticalTemperature)
        ]);
      }
    }).then(() => {
      if (options.hysteresis !== undefined) {
        return i2cMcp9808.hysteresis(options.hysteresis);
      }
    }).then(() => {
      if (options.resolution !== undefined) {
        return i2cMcp9808.resolution(options.resolution);
      }
    }).then(() => {
      return tempSensor;
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this._alertGpio !== null) {
        this._alertGpio.unexport();
      }

      this._i2cBus.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  enableAlerts() {
    return this._i2cMcp9808.enableAlerts();
  }

  temperature() {
    return this._i2cMcp9808.temperature();
  }
}

module.exports = Mcp9808;

