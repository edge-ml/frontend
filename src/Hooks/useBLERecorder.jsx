import { useState, useEffect, useRef } from "react";
import { adjectives, names } from "../routes/export/nameGeneration";
import { uniqueNamesGenerator } from "unique-names-generator";
import { getLabelings } from "../services/ApiServices/LabelingServices";
import {
  floatToBytes,
  intToBytes,
  parseData,
  getBaseDataset,
  parseTimeSeriesData,
} from "../services/bleService";
import {
  createDataset,
  appendToDataset,
} from "../services/ApiServices/DatasetServices";

const useBLERecorder = (bleDeviceHandler) => {
  const [datasetName, setDatasetName] = useState("");
  const [recorderState, setRecorderState] = useState("ready"); // ready, startup, recording, finalizing
  const [selectedSensors, setSelectedSensors] = useState(new Set());
  const [stream, setStream] = useState(true);
  const [fullSampleRate, setFullSampleRate] = useState(false);
  const [labelings, setLabelings] = useState([]);
  const [selectedLabeling, setSelectedLabeling] = useState(undefined);
  const [currentLabel, setCurrentLabel] = useState({
    start: undefined,
    end: undefined,
    color: undefined,
    id: undefined,
    plotId: 0,
  });
  const [prevLabel, setPrevLabel] = useState({
    start: undefined,
    end: undefined,
    color: undefined,
    id: undefined,
    plotId: -1,
  });

  // Store sensor sample rates separately
  const [sensorSampleRates, setSensorSampleRates] = useState({});

  // Function to change sample rate for a sensor
  const onChangeSampleRate = (sensorKey, newSampleRate) => {
    const rate = Number(newSampleRate);
    if (isNaN(rate) || rate < 0 || rate > 50) {
      return; // Ignore invalid values
    }
    setSensorSampleRates((prev) => ({
      ...prev,
      [sensorKey]: rate,
    }));
  };


  console.log(selectedSensors);

  const [currentData, setCurrentData] = useState([]);
  const [sensorKeys, setSensorKeys] = useState([]);

  const labelingData = useRef([]);
  const shortcutKeys = "1234567890abcdefghijklmnopqrstuvwxyz";

  const newDataset = useRef(null);
  const recordedData = useRef([]);
  const recordingSensors = useRef(new Set());
  const uploadCounter = useRef(new Map());

  const setDatasetNameAsync = async (name) => {
    return new Promise((resolve) => {
      setDatasetName(name);
      resolve();
    });
  };

  const configureSingleSensor = async (sensorId, sampleRate, latency) => {
    if (!bleDeviceHandler.device.gatt.connected) {
      return;
    }
    var configPacket = new Uint8Array(9);
    configPacket[0] = sensorId;
    configPacket.set(floatToBytes(sampleRate), 1);
    configPacket.set(intToBytes(latency), 5);
    await bleDeviceHandler.sensorConfigCharacteristic.writeValue(configPacket);
  };

  const unSubscribeAllSensors = async () => {
    for (const bleKey of Object.keys(bleDeviceHandler.sensors)) {
      await configureSingleSensor(bleKey, 0, 0);
    }
  };

  const prepareRecording = async (sensorsToRecord, latency) => {
    for (const bleKey of Object.keys(bleDeviceHandler.sensors)) {
      if (sensorsToRecord.has(bleKey)) {
        await configureSingleSensor(
          bleKey,
          bleDeviceHandler.sensors[bleKey].sampleRate,
          latency
        );
        recordedData.current = [];
        recordingSensors.current = sensorsToRecord;
      } else {
        await configureSingleSensor(bleKey, 0, 0);
      }
    }
  };

  const uploadCache = async (data) => {
    const parsedData = parseTimeSeriesData(
      newDataset.current,
      data,
      recordingSensors.current,
      bleDeviceHandler.sensors
    );
    addToUploadCounter(parsedData);
    await appendToDataset(newDataset.current, parsedData);
  };

  const addToUploadCounter = (data) => {
    data.forEach((elm) => {
      if (uploadCounter.current.has(elm.name)) {
        var old_ctr = uploadCounter.current.get(elm.name);
        uploadCounter.current.set(elm.name, old_ctr + elm.data.length);
      } else {
        uploadCounter.current.set(elm.name, elm.data.length);
      }
    });
  };

  const handleSensorData = (value) => {
    var sensor = value.getUint8(0);
    var timestamp = value.getUint32(2, true);
    if (!recordingSensors.current.has(sensor)) {
      return;
    }
    var parsedData = parseData(bleDeviceHandler.sensors[sensor], value);
    recordedData.current.push({
      sensor: sensor,
      time: timestamp,
      data: parsedData,
    });
    if (
      recordedData.current.length > 1000 ||
      timestamp - recordedData.current[0].time > 300000
    ) {
      uploadCache(recordedData.current);
      recordedData.current = [];
    }
    setCurrentData((prev) => [
      ...prev,
      { sensor: sensor, time: timestamp, data: parsedData },
    ]);
  };

  useEffect(() => {
    if (!bleDeviceHandler || !bleDeviceHandler.device) return;

    const startNotifications = async () => {
      if (!bleDeviceHandler.device.gatt.connected) {
        return;
      }
      const gattServer = bleDeviceHandler.device.gatt;
      const sensorService = await gattServer.getPrimaryService(
        bleDeviceHandler.constructor.sensorServiceUuid
      );
      const sensorDataCharacteristic = await sensorService.getCharacteristic(
        bleDeviceHandler.constructor.sensorDataCharacteristicUuid
      );
      bleDeviceHandler.sensorDataCharacteristic = sensorDataCharacteristic;

      await sensorDataCharacteristic.startNotifications();

      sensorDataCharacteristic.addEventListener(
        "characteristicvaluechanged",
        handleSensorData
      );
    };

    if (recorderState === "recording" && stream) {
      startNotifications();
    } else if (bleDeviceHandler.sensorDataCharacteristic) {
      bleDeviceHandler.sensorDataCharacteristic.removeEventListener(
        "characteristicvaluechanged",
        handleSensorData
      );
      bleDeviceHandler.sensorDataCharacteristic.stopNotifications();
    }
  }, [bleDeviceHandler, recorderState, stream]);

  const onClickRecord = async () => {
    switch (recorderState) {
      case "ready": {
        if (selectedSensors.size === 0) {
          alert("Please select at least one sensor before recording.");
          return;
        }
        if (datasetName === "") {
          const generatedName = uniqueNamesGenerator({
            dictionaries: [adjectives, names],
            length: 2,
          });
          await setDatasetNameAsync(generatedName);
        }
        setRecorderState("startup");
        const baseDataset = getBaseDataset(
          [...selectedSensors].map((elm) => bleDeviceHandler.sensors[elm]),
          datasetName
        );
        newDataset.current = await createDataset(baseDataset);
        await prepareRecording(selectedSensors, 0);
        setRecorderState("recording");
        break;
      }
      case "recording":
        if (currentLabel.id !== undefined && currentLabel.end === undefined) {
          const timestamp = Date.now();

          const currentLabelingData =
            labelingData.current[labelingData.current.length - 1];
          currentLabelingData.end = timestamp;
          const newCurrentLabel = {
            ...currentLabel,
            end: timestamp,
          };
          // Add label logic can be implemented here if needed
          setCurrentLabel(newCurrentLabel);
        }

        setRecorderState("finalizing");
        await unSubscribeAllSensors();
        setRecorderState("ready");
        setDatasetName("");
        resetLabelingState();
        setCurrentData([]);
        break;
      default:
        break;
    }
  };

  const onDatasetNameChanged = (e) => {
    setDatasetName(e.target.value);
  };

  const onToggleSensor = (sensorBleKey) => {
    const tmpSelectedSensors = new Set(selectedSensors);
    if (tmpSelectedSensors.has(sensorBleKey)) {
      tmpSelectedSensors.delete(sensorBleKey);
    } else {
      tmpSelectedSensors.add(sensorBleKey);
    }
    setSelectedSensors(tmpSelectedSensors);
  };

  const onToggleStream = () => {
    setStream(!stream);
  };

  const onToggleSampleRate = () => {
    setFullSampleRate(!fullSampleRate);
  };

  const toggleLabelingActive = (labelIdx) => {
    const timestamp = Date.now();
    const keyPressedLabel = selectedLabeling.labels[labelIdx];

    if (currentLabel.id === undefined) {
      labelingData.current = [
        {
          start: timestamp,
          labelType: keyPressedLabel._id,
          labelingId: selectedLabeling._id,
        },
      ];
      setCurrentLabel({
        start: timestamp,
        end: undefined,
        color: keyPressedLabel.color,
        labelingId: selectedLabeling._id,
        type: keyPressedLabel._id,
        id: keyPressedLabel._id,
        plotId: 0,
      });
    } else if (currentLabel.id === keyPressedLabel._id && currentLabel.end === undefined) {
      const currentLabelingData = labelingData.current[labelingData.current.length - 1];
      currentLabelingData.end = timestamp;
      const newCurrentLabel = { ...currentLabel, end: timestamp };
      // Add label logic can be implemented here if needed
      setCurrentLabel(newCurrentLabel);
    } else if (currentLabel.end !== undefined) {
      labelingData.current.push({
        start: timestamp,
        labelType: keyPressedLabel._id,
        labelingId: selectedLabeling._id,
      });
      setCurrentLabel((prev) => ({
        start: timestamp,
        end: undefined,
        color: keyPressedLabel.color,
        id: keyPressedLabel._id,
        plotId: prev.plotId + 1,
        type: keyPressedLabel._id,
        labelingId: selectedLabeling._id,
      }));
    } else if (currentLabel.end === undefined && currentLabel.id !== keyPressedLabel._id) {
      const currentLabelingData = labelingData.current[labelingData.current.length - 1];
      currentLabelingData.end = timestamp - 1;
      labelingData.current.push({
        start: timestamp,
        labelType: keyPressedLabel._id,
        labelingId: selectedLabeling._id,
      });
      setCurrentLabel((prev) => ({
        start: timestamp,
        end: undefined,
        color: keyPressedLabel.color,
        id: keyPressedLabel._id,
        plotId: prev.plotId + 1,
      }));
    }
  };

  const resetLabelingState = () => {
    labelingData.current = [];
    setCurrentLabel({
      start: undefined,
      end: undefined,
      color: undefined,
      id: undefined,
      plotId: 0,
    });
    setPrevLabel({
      start: undefined,
      end: undefined,
      color: undefined,
      id: undefined,
      plotId: -1,
    });
  };

  const handleLabelingSelect = (labeling) => {
    setSelectedLabeling(labeling);
  };

  const handleKeyDown = (e) => {
    if (recorderState !== "recording") {
      return;
    }
    const labelIdx = shortcutKeys.indexOf(e.key);
    if (
      labelIdx !== -1 &&
      selectedLabeling &&
      labelIdx < selectedLabeling.labels.length
    ) {
      toggleLabelingActive(labelIdx);
    }
  };

  const fetchLabelings = async () => {
    const res = await getLabelings();
    setLabelings(res);
  };

  useEffect(() => {
    fetchLabelings();
  }, []);

  return {
    datasetName,
    recorderState,
    selectedSensors,
    onClickRecord,
    stream,
    fullSampleRate,
    labelings,
    selectedLabeling,
    currentLabel,
    prevLabel,
    currentData,
    sensorKeys,
    onDatasetNameChanged,
    onToggleSensor,
    onToggleStream,
    onToggleSampleRate,
    toggleLabelingActive,
    resetLabelingState,
    handleLabelingSelect,
    handleKeyDown,
    onChangeSampleRate,
    sensorSampleRates,
  };
};

export default useBLERecorder;
