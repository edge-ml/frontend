import React, { Component } from 'react';
import { Input } from 'reactstrap';
import { betterModulo } from '../../services/helpers';

import './AutocompleteInput.css';

class AutocompleteInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
      menuOpen: false,
      selectedIndex: -1,
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
  }

  onInputChange(e) {
    if (e.target.value === '') {
      this.closeMenu();
    }
    if (this.props.getsuggestions && e.target.value !== '') {
      this.props
        .getsuggestions(e.target.value)
        .then((data) => {
          let newData = data;
          if (this.props.filter) {
            newData = data.filter((elm) => !this.props.filter.includes(elm));
          }
          this.setState({
            suggestions: newData.slice(0, 5), // Show top 5 results
          });
          this.openMenu();
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (this.props.onChange) {
      this.props.onChange(e);
    }
  }

  openMenu() {
    this.setState({ menuOpen: true }, () => {
      document.addEventListener('click', this.closeMenu);
      document.addEventListener('keydown', this.onKeyDown);
    });
  }

  closeMenu() {
    this.setState({ menuOpen: false }, () => {
      document.removeEventListener('click', this.closeMenu);
      document.removeEventListener('keydown', this.onKeyDown);
    });
  }

  onMouseOver(e, index) {
    this.setState({
      selectedIndex: index,
    });
  }

  onKeyDown(e) {
    var selectedIndex = 0;
    if (this.state.suggestions.length !== 0) {
      switch (e.key) {
        case 'ArrowDown':
          selectedIndex = betterModulo(
            this.state.selectedIndex + 1,
            this.state.suggestions.length
          );
          break;
        case 'ArrowUp':
          selectedIndex = betterModulo(
            this.state.selectedIndex - 1,
            this.state.suggestions.length
          );
          break;
        case 'Enter':
          const newEvent = e;
          newEvent.target.value =
            this.state.suggestions[this.state.selectedIndex];
          this.props.onClick && this.props.onClick(newEvent);
          this.closeMenu();
          break;
        default:
          break;
      }
    }
    if (e.key === 'Escape') {
      this.closeMenu();
      return;
    }
    this.setState({
      selectedIndex: selectedIndex,
    });
  }

  onItemClick(e, index) {
    const newEvent = e;
    newEvent.target.value = this.state.suggestions[index];
    this.props.onClick && this.props.onClick(newEvent);
    this.closeMenu();
    e.preventDefault();
  }

  render() {
    const inputProps = { ...this.props, getsuggestions: undefined };
    return (
      <div className="autocomplete-wrapper">
        <Input
          id="autoCompleteInput"
          {...inputProps}
          autoComplete="off"
          onChange={this.onInputChange}
          onClick={(e) => e.preventDefault()}
        ></Input>
        {this.state.menuOpen ? (
          <div className="autocomplete-menu" id="autocomplete-menu">
            {this.state.suggestions.map((item, index) => {
              return (
                <div
                  id={item}
                  key={item}
                  onMouseEnter={(e) => this.onMouseOver(e, index)}
                  onClick={(e) => this.onItemClick(e, index)}
                  className={
                    index === this.state.selectedIndex
                      ? 'autocomplete-button select'
                      : 'autocomplete-button'
                  }
                >
                  {item}
                </div>
              );
            })}
            {this.state.suggestions.length === 0 ? (
              <div className="autocomplete-button">No results</div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}

export default AutocompleteInput;
