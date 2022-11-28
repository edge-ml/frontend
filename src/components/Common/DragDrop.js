import React, { Component } from 'react';

class DragDrop extends Component {
  constructor(props) {
    super(props);

    this.state = { inputKey: 0 };
    this.onCancel = this.onCancel.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onFileInput = this.onFileInput.bind(this);
  }

  onFileInput(e) {
    var files = e.target.files;
    this.props.onFileInput(files);
    this.setState({ inputKey: this.state.inputKey + 1 });
  }

  onCancel(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  onDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files;
    this.props.onFileInput(files);
  }

  render() {
    return (
      <div style={this.props.style}>
        <div
          style={{
            cursor: 'pointer !important',
            border: '3px dashed black',
            borderRadius: '0.25rem',
            height: 'inherit',
          }}
          onDrop={this.onDrop}
          onDragOver={this.onCancel}
          onDragEnter={this.onCancel}
        >
          <input
            onDrop={this.onDrop}
            onDragOver={this.onCancel}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{
              cursor: 'pointer',
              opacity: 0,
              position: 'absolute',
              boxSizing: 'inherit',
              height: 'inherit',
            }}
            id="fileInput"
            data-testid="fileInput"
            accept=".csv"
            onChange={this.onFileInput}
            type="file"
            key={this.state.inputKey}
            multiple
            className="custom-file-input"
          />
          <div
            onDrop={this.onDrop}
            onDragOver={this.onCancel}
            onDragEnter={this.onCancel}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'inherit',
              fontSize: 'larger',
              fontWeight: 'bold',
            }}
          >
            {' '}
            <div className="mt-2">
              Drag 'n' drop some files here, or{' '}
              <a style={{ cursor: 'pointer' }} href="#">
                {' click here '}
              </a>{' '}
              to select files
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DragDrop;
