import React, { Component } from 'react';
import {
	Col, Row,
	Button, ButtonGroup,
} from 'reactstrap';

import { view } from 'react-easy-state';

import { TrashcanIcon, QuestionIcon } from 'react-octicons';

import State from '../state';

class DatasetToolbar extends Component {
	constructor(props){
		super(props);
		this.stateButtonHandler = this.stateButtonHandler.bind(this);
		this.deleteButtonHandler = this.deleteButtonHandler.bind(this);
	}

	componentDidMount(){
	}

	stateButtonHandler(id, e){
		console.log(State.datasetPage.edit.selectedBand);
		State.datasetPage.edit.selectedBand.svgElem.attr({
			fill: State.datasetPage.states[id].color,
		});
	}

	deleteButtonHandler(e){
		State.datasetPage.chart.xAxis.removePlotBand(State.datasetPage.edit.selectedBand.id);
		State.datasetPage.edit.enabled = false;
		State.datasetPage.edit.selectedBand = -1;
	}

	render(){
		return(
			<Row className="clearfix">
				<Col>
					<Button className="float-left" color="secondary" disabled={true}>Selected Band: {(State.datasetPage.edit.selectedBand === -1) ? (<QuestionIcon className="svg-white"/>) : State.datasetPage.edit.selectedBand.id}</Button>
				</Col>
				<Col>
					<ButtonGroup className="float-right">
						{State.datasetPage.states.map((state, id) => <Button disabled={!State.datasetPage.edit.enabled} key={id} color={state.buttonColor} onClick={(...props) => this.stateButtonHandler(id, ...props)}>{state.name}</Button>)}
						<Button color="secondary" disabled={!State.datasetPage.edit.enabled} onClick={this.deleteButtonHandler}><TrashcanIcon className="svg-white"/></Button>
					</ButtonGroup>
				</Col>
			</Row>
		)
	}
}

export default view(DatasetToolbar);
