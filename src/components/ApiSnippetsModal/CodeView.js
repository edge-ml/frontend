import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';
import { Button } from 'reactstrap';

const CodeView = ({ language, code }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  const onCopytoClipBoard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="Code">
      <pre className={`language-${language}`}>
        <code className={`language-${language}`} data-prismjs-copy="Copy">
          {code}
        </code>
      </pre>
      <Button color="primary" onClick={() => onCopytoClipBoard()}>
        Copy Code
      </Button>
    </div>
  );
};

export default CodeView;
