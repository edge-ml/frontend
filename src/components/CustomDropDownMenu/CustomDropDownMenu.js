import React, { Component } from 'react';

import './CustomDropDownMenu.css';

class CustomDropDownMenu extends Component {
  constructor() {
    super();

    this.state = {
      showMenu: false
    };

    this.showMenu = this.showMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
  }

  showMenu(event) {
    event.preventDefault();

    this.setState({ showMenu: true }, () => {
      document.addEventListener('click', this.closeMenu);
    });
  }

  closeMenu(event) {
    if (this.dropdownMenu && !this.dropdownMenu.contains(event.target)) {
      this.setState({ showMenu: false }, () => {
        document.removeEventListener('click', this.closeMenu);
      });
    }
  }

  render() {
    console.log(this.props.children);
    return (
      <div>
        <div style={{ display: 'inline-block' }} onClick={this.showMenu}>
          {this.props.content}
        </div>

        {this.state.showMenu && this.props.children ? (
          <div
            style={{ position: 'absolute', zIndex: 100 }}
            className="menu dropDown"
            ref={element => {
              this.dropdownMenu = element;
            }}
          >
            {this.props.children.map((item, index) => (
              <div key={index} className="customDropDownItem">
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
}
export default CustomDropDownMenu;
