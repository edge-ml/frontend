import { WebSensorApiSensor } from './WebSensorApiSensor';
import { DeviceMotionSensor } from './DeviceMotionSensor';
import { BatterySensor } from './BatterySensor';

/**
 * Sensor interface:
 * interface:
 *  - name: string
 *  - shortComponents: string[]
 *  - components: string[]
 *  - listen: (opts: SensorOptions) => void
 *  - stop: () => void
 *  - detection: () => boolean
 *  - properties: { fixedFrequency: boolean }
 *  - static trigger: () => void
 * events/payloads:
 *  - warn: string
 *  - error: any
 *  - data: Record<keyof typeof this.components, number>, { timestamp: number }
 */

const PERMAPIASK =
  (...permnames) =>
  async () =>
    Promise.all(
      permnames.map(async (permname) => {
        if (!navigator.permissions || !navigator.permissions.query) return; // safari doesn't have this
        return navigator.permissions
          .query({ name: permname })
          .then((result) => {
            if (result.state === 'denied') {
              throw new Error(`Permission "${permname}" is denied.`);
            }
          });
      })
    );

const XYZMAP = ({ name }, { x, y, z }) => ({
  [name + 'X']: x,
  [name + 'Y']: y,
  [name + 'Z']: z,
});

const QUATMAP = ({ name }, { quaternion: [c1, c2, c3, c4] }) => ({
  [name + '1']: c1,
  [name + '2']: c2,
  [name + '3']: c3,
  [name + '4']: c4,
});

export const SENSORS = [
  new WebSensorApiSensor(
    'Accelerometer',
    window.Accelerometer,
    ['X', 'Y', 'Z'],
    XYZMAP,
    PERMAPIASK('accelerometer')
  ),
  new WebSensorApiSensor(
    'LinearAccelerationSensor',
    window.LinearAccelerationSensor,
    ['X', 'Y', 'Z'],
    XYZMAP,
    PERMAPIASK('accelerometer')
  ),
  new WebSensorApiSensor(
    'GravitySensor',
    window.GravitySensor,
    ['X', 'Y', 'Z'],
    XYZMAP,
    PERMAPIASK('accelerometer')
  ),
  new WebSensorApiSensor(
    'Gyroscope',
    window.Gyroscope,
    ['X', 'Y', 'Z'],
    XYZMAP,
    PERMAPIASK('gyroscope')
  ),
  new WebSensorApiSensor(
    'RelativeOrientationSensor',
    window.RelativeOrientationSensor,
    ['1', '2', '3', '4'],
    QUATMAP,
    PERMAPIASK('accelerometer', 'gyroscope')
  ),
  new WebSensorApiSensor(
    'AbsoluteOrientationSensor',
    window.AbsoluteOrientationSensor,
    ['1', '2', '3', '4'],
    QUATMAP,
    PERMAPIASK('accelerometer', 'gyroscope', 'magnetometer')
  ),
  new WebSensorApiSensor(
    'AmbientLightSensor',
    window.AmbientLightSensor,
    ['Illuminance'],
    ({ name }, { illuminance }) => ({
      [name + 'Illuminance']: illuminance,
    }),
    PERMAPIASK('ambient-light-sensor')
  ),
  new WebSensorApiSensor(
    'Magnetometer',
    window.Magnetometer,
    ['X', 'Y', 'Z'],
    XYZMAP,
    PERMAPIASK('magnetometer')
  ),

  new DeviceMotionSensor(
    'DeviceMotion',
    DeviceMotionEvent,
    'devicemotion',
    [
      'AccelX',
      'AccelY',
      'AccelZ',
      'AccelWithGravityX',
      'AccelWithGravityY',
      'AccelWithGravityZ',
      'RotationRateAlpha',
      'RotationRateBeta',
      'RotationRateGamma',
    ],
    (
      { name },
      _,
      { acceleration, accelerationIncludingGravity, rotationRate }
    ) => ({
      [name + 'AccelX']: acceleration.x,
      [name + 'AccelY']: acceleration.y,
      [name + 'AccelZ']: acceleration.z,
      [name + 'AccelWithGravityX']: accelerationIncludingGravity.x,
      [name + 'AccelWithGravityY']: accelerationIncludingGravity.y,
      [name + 'AccelWithGravityZ']: accelerationIncludingGravity.z,
      [name + 'RotationRateAlpha']: rotationRate.alpha,
      [name + 'RotationRateBeta']: rotationRate.beta,
      [name + 'RotationRateGamma']: rotationRate.gamma,
    })
  ),
  new DeviceMotionSensor(
    'DeviceOrientation',
    DeviceOrientationEvent,
    'deviceorientation',
    [
      'RotationAlpha',
      'RotationBeta',
      'RotationGamma',
      'CompassAccuracy',
      'CompassHeading',
    ],
    (
      { name },
      _,
      { alpha, beta, gamma, webkitCompassAccuracy, webkitCompassHeading }
    ) => ({
      [name + 'RotationAlpha']: alpha,
      [name + 'RotationBeta']: beta,
      [name + 'RotationGamma']: gamma,
      [name + 'CompassAccuracy']: webkitCompassAccuracy,
      [name + 'CompassHeading']: webkitCompassHeading,
    })
  ),

  new BatterySensor(),
].filter((x) => x);

export const SUPPORTED_SENSORS = SENSORS.filter((sensor) => sensor.detection());
