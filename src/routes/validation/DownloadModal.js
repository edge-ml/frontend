import { Modal, ModalFooter, ModalBody, ModalHeader, Button } from 'reactstrap';
import CodeView from '../../components/ApiSnippetsModal/CodeView';
import { downloadDeploymentModel } from '../../services/ApiServices/MLDeploymentService';
import { downloadBlob } from '../../services/helpers';

const DownloadModal = ({ model, onClose }) => {
  if (!model) {
    return null;
  }

  const downloadModel = async () => {
    const blob = await downloadDeploymentModel(model._id, 'C');
    downloadBlob(blob, `${model.name}_${'C'}.${'zip'}`);
  };

  const getCode = () => {
    return `#include "model.hpp"
#include <iostream>

int main() {
  cout << "SamplingRate: " << get_sampling_rate() << endl;
  add_datapoint(${model.timeSeries.map((elm) => 'val_' + elm).join(', ')});
  int res = predict();
  cout << "Result: " << res << " <==> " << class_to_label(res) << endl;
  return 0;
}`;
  };

  return (
    <Modal isOpen={model} size="xl">
      <ModalHeader>Download: {model.name}</ModalHeader>
      <ModalBody>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <b>Language:</b> C++
          </div>
          <Button onClick={downloadModel}>Download</Button>
        </div>
        <div className="pt-2"></div>
        <div>
          <b>Code</b>
          <CodeView language={'cpp'} code={getCode()}></CodeView>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default DownloadModal;
