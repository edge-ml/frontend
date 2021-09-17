import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';
import { Button } from 'reactstrap';

const onCopytoClipBoard = code => {
  console.log(code.code);
  navigator.clipboard.writeText(code.code);
};

const generateCode = (
  platform,
  backendUrl,
  datasetName,
  deviceApiKey,
  useServerTime
) => {
  const javaTime = useServerTime ? '' : '1618760114000L, ';
  const nodeTime = useServerTime ? '' : 'time = 1618760114000, ';
  datasetName = datasetName ? datasetName : 'DATASET_NAME';
  var language;
  var code;

  const codeArduino = `#include <EdgeML.h>
  
  // WiFi credentials
  const char* ssid = "YOUR_SSID";
  const char* password =  "YOUR_PASSWORD";
  
  IncrementalRecorder *incRec;
  
  void setup()
  {
    // Connect to WiFi
    Serial.begin(115200);
    while(!Serial);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.println("Connecting to WiFi..");
    }
  
    Recorder *rec = new Recorder("${backendUrl}", "${deviceApiKey}");
    
    // This generates a dataset with the name DATASET_NAME. 
    // You now can add data to this dataset.
    incRec = rec->getIncrementalRecorder("${datasetName}");
    
    int sensorValue;

    // Record 1000 datapoints with a frequency of 10Hz.
    int iterDelay = 100;
    for (int i = 0; i < 1000; i++) {
      unsigned long startTime = millis();
      
      // Get the current value of the potentiometer.
      sensorValue = readSensor();
      
      // Add the obtained value to the dataset.
      incRec->addDataPoint("SENSOR_NAME", sensorValue);
      
      unsigned long endTime = millis();
      delay(iterDelay - (endTime - startTime));
    }
  
    // Needs to be called at the end of the data recording session.
    // Uploads all remaining datapoints to the server.
    // Not calling this may lead to data loss.
    incRec->onComplete();
  }
  
  void loop()
  {
    // Don't need the loop in this example.
  }`;

  const codeNode = `const datasetCollector = require("explorer-node").datasetCollector;

  // Generate collector function
  const collector = await datasetCollector(
    (url = "${backendUrl}"),
    (key = "${deviceApiKey}"),
    (name = "${datasetName}"),
    (useDeviceTime = ${useServerTime})
  );
  if (collector.error) {
    // Error occurred, cannot use the collector as a function to upload datasetincrements
    console.log(collector.error);
    return;
  }
  
  try {
    // time should be a unix timestamp
    collector.addDataPoint(${nodeTime}sensorName = "sensorName", value = 1.23);
  
    // Tells the libarary that all data has been recorded.
    // Uploads all remaining datapoints to the server
    collector.onComplete();
  } catch (e) {
    console.log(e);
  }`;

  const codeJava = `Recorder recorder = new Recorder("${backendUrl}", "${deviceApiKey}");
  try {
    IncrementalRecorder incRecorder = recorder.getIncrementalDataset("${datasetName}", ${useServerTime}); // true to use deviceTime
  
    incRecorder.addDataPoint(${javaTime}"accX", 123);
  
    // Wait until all values have been send
    incRecorder.onComplete();
  } catch (Exception e) {
      e.printStackTrace();
  }`;

  switch (platform) {
    case 'Java':
      language = 'java';
      code = codeJava;
      break;
    case 'Node.js':
      language = 'javascript';
      code = codeNode;
      break;
    case 'Arduino':
      language = 'cpp';
      code = codeArduino;
      break;
  }

  return { language: language, code: code };
};

const CodeSnippet = props => {
  const code = generateCode(
    props.platform,
    props.backendUrl,
    props.datasetName,
    props.deviceApiKey,
    props.useServertime
  );

  setTimeout(Prism.highlightAll, 10);

  useEffect(() => {
    Prism.highlightAll();
  }, []);
  return (
    <div className="Code">
      <pre className={`language-${code.language}`}>
        <code className={`language-${code.language}`} data-prismjs-copy="Copy">
          {code.code}
        </code>
      </pre>
      <Button color="primary" onClick={() => onCopytoClipBoard(code)}>
        Copy Code
      </Button>
    </div>
  );
};

export default CodeSnippet;
