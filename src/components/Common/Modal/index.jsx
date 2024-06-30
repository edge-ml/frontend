import { faCross, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import {
    Modal as Modal_ReactStrap,
    ModalHeader as ModalHeader_Reactstrap,
    ModalBody as ModalBody_Reactstrap,
    ModalFooter as ModalFooter_Reactstrap
} from "reactstrap"

import {Button} from "reactstrap"


export const Modal = (props) => {
    return (
        <Modal_ReactStrap {...props}>
            {props.children}
        </Modal_ReactStrap>
    )
}

export const ModalHeader = (props) => {
    return (
        <ModalHeader_Reactstrap {...props} className="modal-header">
            {props.children}
            <div className="modal-close-button">
                <Button outline color="danger">
                    <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                </Button>
            </div>
        </ModalHeader_Reactstrap>
    )
}

export const ModalBody = (props) => {
    return (
        <ModalBody_Reactstrap {...props}>
            {props.children}
        </ModalBody_Reactstrap>
    )
}

export const ModalFooter = (props) => {
    return (
        <ModalFooter_Reactstrap {...props}>
            {props.children}
        </ModalFooter_Reactstrap>
    )
}

