import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-java';

const generateCode = (
  platform,
  backendUrl,
  datasetName,
  deviceApiKey,
  useServerTime
) => {
  const language = platform === 'java' ? 'java' : 'javascript';
  const codeNode = `const datasetCollector = require("explorer-node").datasetCollector;

  // Generate collector function
  const collector = await datasetCollector(
  url="explorerBackendUrl", 
  key="deviceApiKey", 
  name="datasetName",
  useServerTime=false
  );
  if (collector.error) {
    console.log(collector.error);
    return;
  }

  // This is an example
  await collector(timeSeriesName="sensorName", datapoint=1.23, timestamp=1618760114)`;

  const codeJava = `Recorder recorder = new Recorder(
  "explorerBackendUrl",
  "deviceApiKey"
  );
  IncrementalRecorder incRecorder = recorder.getIncrementalDataset("datasetName", false);
  
  // This is an example
  boolean res = incRecorder.addDataPoint("accX", 123, 1595506316000);`;

  const code = platform === 'java' ? codeJava : codeNode;
  var templateCode = code
    .replace('explorerBackendUrl', backendUrl)
    .replace('datasetName', datasetName)
    .replace('deviceApiKey', deviceApiKey)
    .replace('useServerTime=false', 'useServerTime=' + useServerTime);
  if (!useServerTime) {
    templateCode = templateCode
      .replace(
        `incRecorder.addDataPoint("accX", 123, 1595506316000);`,
        `incRecorder.addDataPoint("accX", 123);`
      )
      .replace(
        `collector(timeSeriesName="sensorName", datapoint=1.23, timestamp=1618760114)`,
        `collector(timeSeriesName="sensorName", datapoint=1.23)`
      );
  }

  return { language: language, code: templateCode };
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
        <code className={`language-${code.language}`}>{code.code}</code>
      </pre>
    </div>
  );
};

export default CodeSnippet;
