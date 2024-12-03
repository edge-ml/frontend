import React, { useCallback, useEffect, useRef } from "react";
import {
  Modal as Modal_ReactStrap,
  ModalHeader as ModalHeader_Reactstrap,
  ModalBody as ModalBody_Reactstrap,
  ModalFooter as ModalFooter_Reactstrap,
  Button,
} from "reactstrap";

import "./index.css";

export const Modal = (props) => {
  const modalRef = useRef();

  const handleKeyDown = useCallback((e) => {
    if (!props.isOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      props.onClose();
    } else if (e.key === "Enter" && props.onConfirm) {
      e.preventDefault();
      e.stopPropagation();
      props.onConfirm();
    }
  });

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  // const onKeyDown = (e) => {
  //   if (e.key === "Escape") {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     props.onClose();
  //   } else if (e.key === "Enter" && props.onConfirm) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     props.onConfirm();
  //   }
  // };

  // useEffect(() => {
  //   document.addEventListener("keydown", onKeyDown);
  //   return () => {
  //     document.removeEventListener("keydown", onKeyDown);
  //   };
  // }, []);

  return (
    <Modal_ReactStrap {...props} ref={modalRef}>
      {React.Children.map(props.children, (child) => {
        return React.cloneElement(child, {
          onClose: props.onClose,
          onConfirm: props.onConfirm,
        });
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
