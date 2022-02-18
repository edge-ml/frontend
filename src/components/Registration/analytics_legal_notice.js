import React, { Component } from 'react';

class LegalNotice extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.props.setWhite(false);
    this.props.setBottom(false);
  }
  render() {
    return (
      <div
        className="kaggleContainer"
        style={{
          position: 'relative',
          background: 'white',
          paddingTop: 100,
          paddingLeft: 20,
          paddingRight: 20,
          width: '100%',
          height: '100%',
          left: 0,
          overflowX: 'none',
          overflowY: 'scroll',
          color: 'Black',
          zIndex: 2
        }}
      >
        <div
          style={{
            width: '100%',
            position: 'fixed',
            zIndex: 1,
            top: 0,
            left: 0,
            height: 80,
            backgroundColor: 'white'
          }}
        ></div>{' '}
        <h1 style={{ color: 'rgb(8,93,126)' }}>Legal Notice</h1>{' '}
        <p>
          Information in accordance with Section 5 TMG
          <br></br>Südendstraße 8B<br></br>76137 Karlsruhe<br></br>
          <h3 className="mt-5">
            <b>Contact Information</b>
          </h3>
          <b>Telephone:</b> 0721 60909333<br></br>
          <b>E-Mail:</b>{' '}
          <a href="mailto:hello@discovid.ai">hello@discovid.ai</a>
          <br></br>
          <b>Internet address:</b>{' '}
          <a href="discovid.ai" target="_blank">
            discovid.ai
          </a>
          <br></br>
          <h3 className="mt-5">
            <b>Google Analytics Privacy Policy</b>
          </h3>
          <div className="my-3">
            Our website uses “Google Analytics” to collect information about the
            use of our site. Google Analytics collects information such as how
            often users visit our site, what pages they visit when they do so,
            and what other sites they used prior to coming to our site. We use
            the information we get from Google Analytics to improve our site.
            Google Analytics collects only the IP address assigned to you on the
            date you visit our site, rather than your name or other identifying
            information. We do not combine the information collected through the
            use of Google Analytics with personally identifiable information.
            Although Google Analytics plants a permanent cookie on your web
            browser to identify you as a unique user the next time you visit our
            site, the cookie cannot be used by anyone but Google. Google’s
            ability to use and share information collected by Google Analytics
            about your visits to our site is restricted by the Google Analytics
            Terms of Use.{' '}
            <a
              href=" https://marketingplatform.google.com/about/analytics/terms/us/"
              target="_blank"
            >
              {' '}
              https://marketingplatform.google.com/about/analytics/terms/us/
            </a>
            <br></br>
            You can prevent Google Analytics from recognizing you on return
            visits to this site by disabling cookies on your browser.{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank">
              https://tools.google.com/dlpage/gaoptout
            </a>
          </div>
          <h3 className="mt-5">
            <b>Disclaimer</b>
          </h3>
          <div className="my-3">
            <b>Accountability for content</b>
            <br></br>
            The contents of our pages have been created with the utmost care.
            However, we cannot guarantee the contents' accuracy, completeness or
            topicality. According to statutory provisions, we are furthermore
            responsible for our own content on these web pages. In this matter,
            please note that we are not obliged to monitor the transmitted or
            saved information of third parties, or investigate circumstances
            pointing to illegal activity. Our obligations to remove or block the
            use of information under generally applicable laws remain unaffected
            by this as per §§ 8 to 10 of the Telemedia Act (TMG).
          </div>
          <div className="my-3">
            <b>Accountability for links</b>
            <br></br>
            Responsibility for the content of external links (to web pages of
            third parties) lies solely with the operators of the linked pages.
            No violations were evident to us at the time of linking. Should any
            legal infringement become known to us, we will remove the respective
            link immediately.
          </div>
          <div className="my-3">
            <b>Copyright</b>
            <br></br> Our web pages and their contents are subject to German
            copyright law. Unless expressly permitted by law, every form of
            utilizing, reproducing or processing works subject to copyright
            protection on our web pages requires the prior consent of the
            respective owner of the rights. Individual reproductions of a work
            are only allowed for private use. The materials from these pages are
            copyrighted and any unauthorized use may violate copyright laws.
          </div>
          <br></br>
          <i>Source: </i>
          <a href="http://www.translate-24h.de" target="_blank">
            translate-24h
          </a>{' '}
          <br></br>
        </p>
      </div>
    );
  }
}

export default LegalNotice;
