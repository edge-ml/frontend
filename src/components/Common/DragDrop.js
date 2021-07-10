import React, { Component } from 'react';

class DragDrop extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.onCancel = this.onCancel.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onFileInput = this.onFileInput.bind(this);
  }

  onFileInput(e) {
    var files = e.target.files;
    this.props.onFileInput(files);
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
      <div>
        <div
          style={{
            cursor: 'pointer !important',
            border: '3px dashed black',
            borderRadius: '0.25rem'
          }}
          onDrop={this.onDrop}
          onDragOver={this.onCancel}
          onDragEnter={this.onCancel}
        >
          <input
            onDrop={this.onDrop}
            onDragOver={this.onCancel}
            onDragEnter={e => {
              e.preventDefault(), e.stopPropagation();
            }}
            style={{
              cursor: 'pointer !important',
              opacity: 0,
              position: 'absolute',
              boxSizing: 'inherit'
            }}
            id="fileInput"
            data-testid="fileInput"
            accept=".csv"
            onChange={this.onFileInput}
            type="file"
            multiple
            className="custom-file-input"
          />
          <div
            onDrop={this.onDrop}
            onDragOver={this.onCancel}
            onDragEnter={this.onCancel}
            style={{ textAlign: 'center', margin: '8px' }}
          >
            {' '}
            Drag 'n' drop some files here, or click to select files
          </div>
        </div>
      </div>
    );
  }
}

export default DragDrop;
