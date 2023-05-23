import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';
import { Button } from 'reactstrap';
import CodeView from './CodeView';

import { codeJava, codeArduino, codeNode, codeJs } from './Code';

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

  // eslint-disable-next-line default-case
  switch (platform) {
    case 'Java':
      language = 'java';
      code = codeJava(
        backendUrl,
        deviceApiKey,
        datasetName,
        useServerTime,
        javaTime
      );
      break;
    case 'Node.js':
      language = 'javascript';
      code = codeNode(
        backendUrl,
        deviceApiKey,
        datasetName,
        useServerTime,
        nodeTime
      );
      break;
    case 'Arduino':
      language = 'cpp';
      code = codeArduino(backendUrl, deviceApiKey, datasetName);
      break;
    case 'Javascript':
      language = 'javascript';
      code = codeJs(
        backendUrl,
        deviceApiKey,
        datasetName,
        useServerTime,
        nodeTime
      );
      break;
  }

  return { language: language, code: code };
};

const CodeSnippet = (props) => {
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

  return <CodeView code={code.code} language={code.language}></CodeView>;
};

export default CodeSnippet;
