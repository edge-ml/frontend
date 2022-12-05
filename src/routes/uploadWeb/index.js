import React, { useState, useRef, useMemo, useEffect } from 'react';
import { SensorList } from './SensorList';
import { UploadWebView } from './UploadWebView';

import { SUPPORTED_SENSORS } from '../../services/WebSensorServices';
import { RecorderSettings } from './RecorderSettings';
import { throttle, debounce } from '../../services/helpers';
import { RecordingController } from './RecordingController';
import { SensorGraphs } from './SensorGraphs';
import { usePersistedState } from '../../services/ReactHooksService';

const mergeSingle = (replacer) => (key, value) => {
  replacer((prev) => ({ ...prev, [key]: value }));
};

const GRAPH_UPDATE_INTERVAL = 750;
const GRAPH_MAX_SECONDS = 5;

export const UploadWebPage = () => {
  const sensors = SUPPORTED_SENSORS;
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
    'routes:uploadWeb:index.selectedSensors'
  );
  const [sensorRates, setSensorRates] = usePersistedState(
    sensors.reduce((acc, { name }) => {
      acc[name] = 50;
      return acc;
    }, {}),
    'routes:uploadWeb:index.sensorRates'
  );
  const [dataPreview, _setDataPreview] = usePersistedState(
    true,
    'routes:uploadWeb:index.dataPreview'
  );
  const dataPreviewRef = useRef(dataPreview);
  const setDataPreview = (up) => {
    dataPreviewRef.current = up;
    _setDataPreview(up);
  };

  const [recorderState, setRecorderState] = useState('ready'); // ready, starting, recording, stopping
  const [datasetName, setDatasetName] = useState('');

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
    setErrors(controller.getErrors());
  }, 150);

  const handleRecordButton = async () => {
    switch (recorderState) {
      case 'ready':
        setRecorderState('starting');
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
        controllerRef.current.on('received-data', (controller) => {
          syncUI(controller); // throttled
        });
        controllerRef.current.on('error', onError);

        await controllerRef.current.start();
        setRecorderState('recording');
        break;
      case 'recording':
        setRecorderState('stopping');
        await controllerRef.current.stop();
        setRecorderState('ready');
        break;
      default:
    }
  };

  return (
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
      graph={
        Object.keys(visibleStore).length !== 0 ||
        recorderState === 'recording' ||
        recorderState === 'stopping' ? (
          <SensorGraphs
            sensorStore={visibleStore}
            dataPreview={dataPreview}
            setDataPreview={setDataPreview}
          />
        ) : null
      }
    />
  );
};
