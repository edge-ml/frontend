import React, { useState } from 'react';
import {
  Modal,
  ModalFooter,
  ModalBody,
  ModalHeader,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import CodeView from '../../components/ApiSnippetsModal/CodeView';
import {
  downloadDeploymentModel,
  downloadModalLink,
} from '../../services/ApiServices/MLDeploymentService';
import { downloadBlob } from '../../services/helpers';
import { getProject } from '../../services/LocalStorageService';

const DownloadModal = ({ model, onClose }) => {
  const [language, setLanguage] = useState('cpp');
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false); // State for language dropdown

  if (!model) {
    return null;
  }

  const downloadModel = async () => {
    if (language === 'python') {
      console.log('Downloading python');
      downloadModalLink(getProject(), model._id, 'python');
      return;
    }

    const blob = await downloadDeploymentModel(model._id, language);
    downloadBlob(blob, `${model.name}_${language}.zip`);
  };

  const getCode = () => {
    switch (language) {
      case 'cpp':
        return `#include "model.hpp"
#include <iostream>

int main() {
  cout << "SamplingRate: " << get_sampling_rate() << endl;
  add_datapoint(${model.timeSeries.map((elm) => 'val_' + elm).join(', ')});
  int res = predict();
  cout << "Result: " << res << " <==> " << class_to_label(res) << endl;
  return 0;
}`;
      // Add cases for other languages here
      default:
        return ''; // Handle unsupported languages
    }
  };

  const CodeSnippet = ({ language, code }) => {
    const genCode = getCode();

    if (code === '') {
      return (
        <div className="d-flex w-100 justify-content-center align-items-center mh-25 font-weight-bold">
          No sample code available
        </div>
      );
    }

    return (
      <div>
        <b>Code</b>
        <CodeView language={language} code={genCode}></CodeView>
      </div>
    );
  };

  return (
    <Modal isOpen={model} size="xl">
      <ModalHeader>Download: {model.name}</ModalHeader>
      <ModalBody>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <b className="mr-2">Language:</b>
            <Dropdown
              isOpen={languageDropdownOpen}
              toggle={() => setLanguageDropdownOpen(!languageDropdownOpen)}
            >
              <DropdownToggle caret>{language.toUpperCase()}</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => setLanguage('cpp')}>
                  C++
                </DropdownItem>
                <DropdownItem onClick={() => setLanguage('python')}>
                  Python
                </DropdownItem>
                {/* Add more language options as DropdownItems */}
              </DropdownMenu>
            </Dropdown>
          </div>
          <Button onClick={downloadModel}>Download</Button>
        </div>
        <div className="pt-2"></div>
        <CodeSnippet language={language} code={getCode()}></CodeSnippet>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default DownloadModal;
