import { useState, useEffect, useRef } from "react";
import { adjectives, names } from "../routes/export/nameGeneration";
import { uniqueNamesGenerator } from "unique-names-generator";
import { getLabelings } from "../services/ApiServices/LabelingServices";

const useBLERecorder = (bleDeviceProcessor) => {
  const [datasetName, setDatasetName] = useState("");
  const [recorderState, setRecorderState] = useState("ready"); // ready, startup, recording, finalizing
  const [selectedSensors, setSelectedSensors] = useState(new Set());
  const [latency] = useState(0);
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

  const labelingData = useRef([]);
  const shortcutKeys = "1234567890abcdefghijklmnopqrstuvwxyz";

  const setDatasetNameAsync = async (name) => {
    return new Promise((resolve) => {
      setDatasetName(name);
      resolve();
    });
  };

  const onClickRecordButton = async () => {
    switch (recorderState) {
      case "ready":
        if (datasetName === "") {
          const generatedName = uniqueNamesGenerator({
            dictionaries: [adjectives, names],
            length: 2,
          });
          await setDatasetNameAsync(generatedName);
        }
        setRecorderState("startup");
        await bleDeviceProcessor.current.startRecording(
          selectedSensors,
          latency,
          datasetName
        );
        setRecorderState("recording");
        break;
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
          bleDeviceProcessor.current.addLabel(newCurrentLabel);
          setCurrentLabel(newCurrentLabel);
        }

        setRecorderState("finalizing");
        await bleDeviceProcessor.current.stopRecording();
        setRecorderState("ready");
        setDatasetName("");
        resetLabelingState();
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
      bleDeviceProcessor.current.addLabel(newCurrentLabel);
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
      setPrevLabel(currentLabel);
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
      setPrevLabel({ ...currentLabel, end: timestamp - 120 });
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
    latency,
    stream,
    fullSampleRate,
    labelings,
    selectedLabeling,
    currentLabel,
    prevLabel,
    onClickRecordButton,
    onDatasetNameChanged,
    onToggleSensor,
    onToggleStream,
    onToggleSampleRate,
    toggleLabelingActive,
    resetLabelingState,
    handleLabelingSelect,
    handleKeyDown,
  };
};

export default useBLERecorder;
