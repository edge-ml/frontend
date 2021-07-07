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
  const javaTime = useServerTime ? '' : '1618760114000L, ';
  const nodeTime = useServerTime ? '' : 'time = 1618760114000, ';
  const language = platform === 'java' ? 'java' : 'javascript';
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

  const code = platform === 'java' ? codeJava : codeNode;
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
        <code className={`language-${code.language}`}>{code.code}</code>
      </pre>
    </div>
  );
};

export default CodeSnippet;
