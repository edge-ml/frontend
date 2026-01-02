import SimpleEventEmitter from "../SimpleEventEmitter";

/**
 * Web Sensor API based Sensors
 */
class WebSensorApiSensor extends SimpleEventEmitter {
  constructor(sensorName, Sensor, shortComponents, mapComponents, askPermission) {
    super();
    this._sensorName = sensorName;
    this.name = sensorName;
    this.ssssSensor = Sensor;
    this.shortComponents = shortComponents;
    this.components = shortComponents.map((x) => sensorName + x);
    this._mapComponents = mapComponents;
    this._askPermission = askPermission;

    this._sensor = null;

    this.properties = {
      fixedFrequency: false,
    };
  }

  checkPermissions = async () => {
    await this._askPermission();
    return true;
  };

  checkAvailability = async (timeoutMs = 500) => {
    await this.checkPermissions();
    return new Promise((resolve) => {
      let settled = false;
      const finish = (result) => {
        if (settled) {
          return;
        }
        settled = true;
        this.off("data", handleData);
        this.off("error", handleError);
        this.stop();
        resolve(result);
      };
      const handleData = () => finish(true);
      const handleError = () => finish(false);

      this.on("data", handleData);
      this.on("error", handleError);
      this.listen({ frequency: 1 }).catch(() => finish(false));
      setTimeout(() => finish(true), timeoutMs);
    });
  };

  listen = async (opts = {}) => {
    this.stop();

    try {
      await this._askPermission();
      this._sensor = new this.ssssSensor({ ...opts });
      this._sensor.onerror = (event) => {
        // Handle runtime errors.
        this.stop();
        if (event.error.name === "NotAllowedError") {
          this.emit("error", "Permission to access sensor was denied.");
        } else if (event.error.name === "NotReadableError") {
          this.emit("error", "Cannot connect to the sensor.");
        }
      };
      this._sensor.onreading = (e) => {
        this.emit("data", this._mapComponents(this, this._sensor, e), {
          timestamp: Date.now(),
        });
      };
      this._sensor.start();
    } catch (error) {
      // Handle construction errors.
      this.stop();
      if (error.name === "SecurityError") {
        this.emit(
          "error",
          "Sensor construction was blocked by the Permissions Policy."
        );
      } else if (error.name === "ReferenceError") {
        this.emit("error", "Sensor is not supported by the User Agent.");
      } else {
        throw error;
      }
    }
  };

  stop = () => {
    if (this._sensor && this._sensor.stop) {
      this._sensor.stop();
      this._sensor = null;
    }
  };

  detection = () => (typeof window !== "undefined" ? this.name in window : false);
}

export default WebSensorApiSensor;
