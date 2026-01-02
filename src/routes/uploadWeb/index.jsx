import React, { useState, useRef, useMemo, useEffect } from "react";
import { SensorList } from "../../components/SensorList/SensorList";
import { UploadWebView } from "./UploadWebView";

import { SUPPORTED_SENSORS } from "../../services/WebSensorServices";
import { RecorderSettings } from "./RecorderSettings";
import { throttle, debounce } from "../../services/helpers";
import { RecordingController } from "./RecordingController";
import { SensorGraphs } from "./SensorGraphs";
import { usePersistedState } from "../../services/ReactHooksService";
import { FloatingActionButtons } from "./FloatingActionButtons";
import Loader from "../../modules/loader";

const mergeSingle = (replacer) => (key, value) => {
  replacer((prev) => ({ ...prev, [key]: value }));
};

const GRAPH_UPDATE_INTERVAL = 750;
const GRAPH_MAX_SECONDS = 5;

export const UploadWebPage = () => {
  const [availableSensors, setAvailableSensors] = useState(SUPPORTED_SENSORS);
  const [isCheckingSensors, setIsCheckingSensors] = useState(true);
  const sensors = availableSensors;
  const SENSOR_COMPONENT_TO_SENSOR_NAME = useMemo(() => {
    const obj = {};
    for (const sensor of sensors) {
      for (const component of sensor.components) {
        obj[component] = sensor.name;
      }
    }
    return obj;
  }, [sensors]);

  const [selectedSensors, setSelectedSensors] = usePersistedState(
    {},
    "routes:uploadWeb:index.selectedSensors"
  );
  const [sensorRates, setSensorRates] = usePersistedState(
    sensors.reduce((acc, { name }) => {
      acc[name] = 50;
      return acc;
    }, {}),
    "routes:uploadWeb:index.sensorRates"
  );
  const [dataPreview, _setDataPreview] = usePersistedState(
    true,
    "routes:uploadWeb:index.dataPreview"
  );
  const dataPreviewRef = useRef(dataPreview);
  const setDataPreview = (up) => {
    dataPreviewRef.current = up;
    _setDataPreview(up);
  };

  const [recorderState, setRecorderState] = useState("ready"); // ready, starting, recording, stopping
  const [datasetName, setDatasetName] = useState("");

  const controllerRef = useRef(null);
  useEffect(
    () => () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    },
    []
  );

  const [visibleStore, setVisibleStore] = useState({}); // { sensorA: { sensorAX: [{ datapoint: 5, timestamp: 1234 }, ], }, }
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    const checkSensors = async () => {
      const checks = await Promise.all(
        SUPPORTED_SENSORS.map(async (sensor) => {
          if (typeof sensor.checkAvailability === "function") {
            try {
              const ok = await sensor.checkAvailability();
              return { sensor, ok };
            } catch (error) {
              return { sensor, ok: false };
            }
          }
          if (typeof sensor.checkPermissions === "function") {
            try {
              await sensor.checkPermissions();
              return { sensor, ok: true };
            } catch (error) {
              return { sensor, ok: false };
            }
          }
          return { sensor, ok: true };
        })
      );
      if (!isMounted) {
        return;
      }
      const supported = checks.filter((item) => item.ok).map((item) => item.sensor);
      setAvailableSensors(supported);
      setSelectedSensors((prevSelected) => {
        const nextSelected = { ...prevSelected };
        checks.forEach(({ sensor, ok }) => {
          if (!ok) {
            delete nextSelected[sensor.name];
          }
        });
        return nextSelected;
      });
      setIsCheckingSensors(false);
    };
    checkSensors();
    return () => {
      isMounted = false;
    };
  }, []);

  const syncUI = throttle((controller) => {
    if (!dataPreviewRef.current) {
      return;
    }

    const timeseries = controller.getTimeseries();

    const obj = {};
    for (const [component, timeserie] of Object.entries(timeseries)) {
      obj[SENSOR_COMPONENT_TO_SENSOR_NAME[component]] =
        obj[SENSOR_COMPONENT_TO_SENSOR_NAME[component]] || {};
      obj[SENSOR_COMPONENT_TO_SENSOR_NAME[component]][component] =
        timeserie.slice(
          -sensorRates[SENSOR_COMPONENT_TO_SENSOR_NAME[component]] *
            GRAPH_MAX_SECONDS
        );
    }
    setVisibleStore(obj);
  }, GRAPH_UPDATE_INTERVAL);

  const onError = debounce((controller) => {
    const nextErrors = controller.getErrors();
    setErrors(nextErrors);
    const fatalFragments = [
      "Cannot connect to the sensor.",
      "Sensor is not supported by the User Agent.",
      "Sensor construction was blocked by the Permissions Policy.",
      "Permission to access sensor was denied.",
      "Permission to",
    ];
    const isFatalError = (info) => {
      if (!info || info.isWarning) {
        return false;
      }
      const message = String(info.error || "");
      return fatalFragments.some((fragment) => message.includes(fragment));
    };
    setAvailableSensors((prevSensors) =>
      prevSensors.filter((sensor) => !isFatalError(nextErrors[sensor.name]))
    );
    setSelectedSensors((prevSelected) => {
      const nextSelected = { ...prevSelected };
      for (const [name, info] of Object.entries(nextErrors)) {
        if (isFatalError(info)) {
          delete nextSelected[name];
        }
      }
      return nextSelected;
    });
  }, 150);

  const handleRecordButton = async () => {
    switch (recorderState) {
      case "ready":
        setRecorderState("starting");
        if (controllerRef.current) {
          await controllerRef.current.stop();
        }
        const selectedNames = Object.entries(selectedSensors)
          .filter(([k, v]) => v)
          .map(([k, v]) => k);
        const mySensors = sensors.filter(({ name }) =>
          selectedNames.includes(name)
        );

        for (const Class of Array.from(
          new Set(mySensors.map((x) => x.constructor))
        )) {
          if (Class.trigger) {
            await Class.trigger();
          }
        }

        setVisibleStore({});
        setErrors({});

        controllerRef.current = new RecordingController(
          mySensors,
          sensorRates,
          datasetName
        );
        controllerRef.current.on("received-data", (controller) => {
          syncUI(controller); // throttled
        });
        controllerRef.current.on("error", onError);

        await controllerRef.current.start();
        setRecorderState("recording");
        break;
      case "recording":
        setRecorderState("stopping");
        await controllerRef.current.stop();
        setRecorderState("ready");
        break;
      default:
    }
  };

  if (sensors.length === 0) {
    return (
      <div className="h-100 d-flex justify-content-center align-items-center">
        <h4>Your device does not support any Web-Sensors</h4>
      </div>
    );
  }

  return (
    <Loader loading={isCheckingSensors}>
      <UploadWebView
        sensorList={
          <SensorList
            sensors={sensors.map((x) => ({
              ...x,
              sampleRate: sensorRates[x.name],
            }))}
            selectedSensors={selectedSensors}
            setSensor={mergeSingle(setSelectedSensors, selectedSensors)}
            setSensorRate={mergeSingle(setSensorRates, sensorRates)}
          />
        }
        datasetSettings={
          <RecorderSettings
            recorderState={recorderState}
            datasetName={datasetName}
            onDatasetNameChanged={setDatasetName}
            onClickRecordButton={handleRecordButton}
            errors={errors}
            selectedSensors={selectedSensors}
          />
        }
        // graph={
        //   Object.keys(visibleStore).length !== 0 ||
        //   recorderState === 'recording' ||
        //   recorderState === 'stopping' ? (
        //     <SensorGraphs
        //       sensorStore={visibleStore}
        //       dataPreview={dataPreview}
        //       setDataPreview={setDataPreview}
        //     />
        //   ) : null
        // }
        fabs={
          <FloatingActionButtons
            recorderState={recorderState}
            datasetName={datasetName}
            onClickRecordButton={handleRecordButton}
            selectedSensors={selectedSensors}
          />
        }
      />
    </Loader>
  );
};

export default UploadWebPage;
