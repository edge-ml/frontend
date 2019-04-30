import React, { Component } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Card,
  CardHeader,
  CardBody
} from 'reactstrap';
import './VideoPanel.css';

class VideoPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      duration: undefined,
      isScrubbingOutsideVideo: false
    };

    this.videoReference = React.createRef();
    this.onSetTime = this.onSetTime.bind(this);
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
            <b>no video available at this point in time</b>
          </div>
        </div>
        <video
          style={{
            display: 'block',
            lineHeight: 0,
            visibility:
              this.state.isScrubbingOutsideVideo ||
              this.videoReference === undefined
                ? 'hidden'
                : 'visible'
          }}
          width="100%"
          height="auto"
          ref={this.videoReference}
          controls
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
