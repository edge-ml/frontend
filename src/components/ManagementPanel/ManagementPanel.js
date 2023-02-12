import React, { Component } from 'react';
import { Button, Card, CardHeader, CardBody } from 'reactstrap';
import './ManagementPanel.css';

class ManagementPanel extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     isHelpModalOpen: false,
  //   };

  //   this.toggleHelpModal = this.toggleHelpModal.bind(this);
  //   this.downloadDataSet = this.downloadDataSet.bind(this);
  // }

  // toggleHelpModal() {
  //   this.setState({ isHelpModalOpen: !this.state.isHelpModalOpen });
  // }

  // downloadDataSet() {
  //   downloadSingleDataset(
  //     this.props.dataset,
  //     this.props.labelings,
  //     this.props.labels
  //   );
  // }

  render() {
    return null;
    // return (
    //   <Card>
    //     <CardHeader>
    //       <b>Management</b>
    //     </CardHeader>
    //     <CardBody>
    //       <Button
    //         id="buttonDownloadDataset"
    //         block
    //         outline
    //         color="primary"
    //         onClick={this.downloadDataSet}
    //       >
    //         Download as CSV
    //       </Button>
    //       <Button
    //         id="buttonDeleteDataset"
    //         block
    //         outline
    //         color="danger"
    //         onClick={() => {
    //           if (window.confirm('Are you sure to delete this dataset?')) {
    //             this.props.onDeleteDataset();
    //           }
    //         }}
    //       >
    //         Delete Dataset
    //       </Button>
    //       <hr />
    //       <Button
    //         id="buttonOpenHelpModal"
    //         block
    //         outline
    //         color="secondary"
    //         onClick={this.toggleHelpModal}
    //       >
    //         Help
    //       </Button>
    //     </CardBody>
    //     <HelpModal
    //       isOpen={this.state.isHelpModalOpen}
    //       onCloseModal={this.toggleHelpModal}
    //     />
    //   </Card>
    // );
  }
}
export default ManagementPanel;
