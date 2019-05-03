import React, { Component } from 'react';
import { Card, Button } from 'reactstrap';
import './VideoPanel.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExpandArrowsAlt,
  faCompressArrowsAlt
} from '@fortawesome/free-solid-svg-icons';

class VideoPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      duration: undefined,
      isScrubbingOutsideVideo: false,
      pip: {
        isEnabled: false
      }
    };

    this.videoReference = React.createRef();
    this.onSetTime = this.onSetTime.bind(this);
    this.onTogglePictureInPicture = this.onTogglePictureInPicture.bind(this);
  }

  onSetTime(time) {
    if (!this.videoReference) return;

    this.videoReference.current.currentTime = time;

    if (
      (this.videoReference.current.duration < time || time < 0) &&
      !this.state.isScrubbingOutsideVideo
    ) {
      this.setState({
        isScrubbingOutsideVideo: true
      });
    } else if (
      this.state.isScrubbingOutsideVideo &&
      !(this.videoReference.current.duration < time || time < 0)
    ) {
      this.setState({
        isScrubbingOutsideVideo: false
      });
    }
  }

  onTogglePictureInPicture() {
    this.setState({
      pip: {
        isEnabled: !this.state.pip.isEnabled
      }
    });

    if (
      !this.state.pip.isEnabled &&
      this.videoReference &&
      !document.pictureInPicture
    ) {
      this.videoReference.current.requestPictureInPicture();
    } else if (this.videoReference) {
      this.videoReference.current.exitPictureInPicture();
    }
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
    this.setState({
      duration: this.videoReference.current.duration
    });
  };

  render() {
    return (
      <Card className={'VideoPanel'} style={{ overflow: 'hidden' }}>
        <Button
          style={{ position: 'absolute', right: '0px', top: '0px' }}
          onClick={this.onTogglePictureInPicture}
        >
          <FontAwesomeIcon
            icon={
              !this.state.pip.isEnabled
                ? faExpandArrowsAlt
                : faCompressArrowsAlt
            }
          />
        </Button>
        <div
          style={{
            background: 'gray',
            position: 'absolute',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
            zIndex: -1,
            color: 'black',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '44%',
              textAlign: 'center',
              width: '100%',
              color: 'lightgray'
            }}
          >
            {!this.state.pip.isEnabled ? (
              <b>no video available at this point in time</b>
            ) : (
              <b>picture in picture enabled</b>
            )}
          </div>
        </div>
        <video
          style={{
            display: 'block',
            lineHeight: 0,
            visibility:
              this.state.isScrubbingOutsideVideo ||
              this.videoReference === undefined ||
              this.state.pip.isEnabled
                ? 'hidden'
                : 'visible'
          }}
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
