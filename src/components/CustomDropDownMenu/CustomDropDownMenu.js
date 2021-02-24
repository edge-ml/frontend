import React, { Component } from 'react';
import classNames from 'classnames';

import './CustomDropDownMenu.css';

class CustomDropDownMenu extends Component {
  constructor() {
    super();

    this.state = {
      showMenu: false
    };

    this.showMenu = this.showMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
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

  onItemClick(e) {
    this.setState({
      showMenu: !this.state.showMenu
    });
  }

  render() {
    return (
      <div style={{ position: 'relative' }}>
        <div
          style={{ display: 'inline-block', cursor: 'pointer' }}
          onClick={this.showMenu}
        >
          {this.props.content}
        </div>

        {this.state.showMenu && this.props.children ? (
          <div
            style={{ position: 'absolute', zIndex: 100 }}
            className={classNames(
              'menu',
              'dropDown',
              { 'dropDown-right': this.props.right },
              { 'dropDown-left': this.props.left }
            )}
            ref={element => {
              this.dropdownMenu = element;
            }}
          >
            {this.props.children.map((item, index) => (
              <div
                style={{ cursor: 'pointer' }}
                onClick={this.onItemClick}
                key={index}
                className="customDropDownItem"
              >
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
