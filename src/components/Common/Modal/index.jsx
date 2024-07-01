import { faCross, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import {
  Modal as Modal_ReactStrap,
  ModalHeader as ModalHeader_Reactstrap,
  ModalBody as ModalBody_Reactstrap,
  ModalFooter as ModalFooter_Reactstrap,
} from "reactstrap";

import { Button } from "reactstrap";

export const Modal = (props) => {
  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      props.onClose();
    }
    
    if (e.key === "Enter" && props.onConfirm) {
      props.onConfirm();
    }
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <Modal_ReactStrap onKeyDown={onKeyDown} {...props}>
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onClose: props.onClose,
            onConfirm: props.onConfirm,
          });
        }
        return child;
      })}
    </Modal_ReactStrap>
  );
};

export const ModalHeader = (props) => {
  return (
    <ModalHeader_Reactstrap {...props} className="modal-header">
      {props.children}
      <div className="modal-close-button">
        <Button size="sm" close onClick={props.onClose}></Button>
      </div>
    </ModalHeader_Reactstrap>
  );
};

export const ModalBody = (props) => {
  return (
    <ModalBody_Reactstrap {...props}>{props.children}</ModalBody_Reactstrap>
  );
};

export const ModalFooter = (props) => {
  return (
    <ModalFooter_Reactstrap {...props}>{props.children}</ModalFooter_Reactstrap>
  );
};
