import React, { Component } from "react";
import { SimpleGrid } from "@mantine/core";
import "./BleNotActivated.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChrome, faEdge } from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

class BleNotActivated extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="bleNotActivatedPage">
        <div className="shadow p-3 mb-5 bg-white rounded">
          <h3 className="heading">
            Bluetooth is currently not activated in your Browser
          </h3>
          <div>See below how to activate this feature</div>
        </div>
        <SimpleGrid cols={3}>
          <div className="shadow p-3 mb-5 bg-white rounded">
            <div className="cardHeader">
              <FontAwesomeIcon size="2x" icon={faChrome} />
              <div className="headerText">Chrome</div>
            </div>
            <hr />
            <div>
              Web Bluetooth is part of the experimental features in Chrome.
              Learn{" "}
              <a
                target="_blank"
                href="https://support.google.com/chrome/answer/10612145?hl=en" rel="noreferrer"
              >
                here
              </a>{" "}
              how to activate them
            </div>
          </div>
          <div className="shadow p-3 mb-5 bg-white rounded">
            <div className="cardHeader">
              <FontAwesomeIcon size="2x" icon={faEdge} />
              <div className="headerText">Edge</div>
            </div>
            <hr />
            <div>
              You don't have to do anything. Web Bluetooth works out of the
              box
            </div>
          </div>
          <div className="shadow p-3 mb-5 bg-white rounded">
            <div className="cardHeader">
              <FontAwesomeIcon size="2x" icon={faGlobe} />
              <div className="headerText">Others</div>
            </div>
            <hr />
            <div>Other browsers currently do not support this feature</div>
          </div>
        </SimpleGrid>
      </div>
    );
  }
}

export default BleNotActivated;
