import React, { Component } from 'react';
import { Button, Card, CardHeader, CardBody } from 'reactstrap';
import './VideoPanel.css';

class VideoPanel extends Component {
  constructor(props) {
    super(props);

    this.videoReference = React.createRef();
    this.onSetTime = this.onSetTime.bind(this);
  }

  onSetTime(time) {
    if (!this.videoReference) return;

    this.videoReference.current.currentTime = time;
  }

  componentDidMount() {
    this.videoReference.current.addEventListener('loadedmetadata', this.seek);
  }

  componentWillUnmount() {
    this.videoReference.current.removeEventListener(
      'loadedmetadata',
      this.seek
    );
  }

  seek = () => {
    this.videoReference.current.currentTime = 0;
  };

  render() {
    return (
      <Card className={'p-0'} style={{ overflow: 'hidden' }}>
        <video
          style={{ display: 'block', lineHeight: 0 }}
          width="100%"
          height="auto"
          ref={this.videoReference}
        >
          <source
            src="http://mirrors.standaloneinstaller.com/video-sample/page18-movie-4.mp4"
            type="video/mp4"
          />
        </video>
      </Card>
    );
  }
}
export default VideoPanel;
