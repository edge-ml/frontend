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

	stateButtonHandler(state_id, e){
		State.datasetPage.fixSelected();

		const band = State.datasetPage.edit.selectedBand;

		band.state = state_id;
		for(let elem of[band, band.lines.start, band.lines.end]){
			elem.svgElem.attr({
				fill: State.datasetPage.states[state_id].color,
				stroke: State.datasetPage.states[state_id].color,
			});
		}

		// store selection
		State.datasetPage.initialIndex = state_id;

		State.datasetPage.updateHighlight();
	}

	deleteButtonHandler(e){
		State.datasetPage.fixSelected();
		
		const band = State.datasetPage.edit.selectedBand;

		for(let item of [band.lines.start.id, band.lines.end.id, band.id]){
			State.datasetPage.chart.xAxis.removePlotBand(item);
		}

		State.datasetPage.edit.selectedBand = -1;
		State.datasetPage.sort();
	}

	render(){
		return(
			<Row className="clearfix">
				<Col>
					<ButtonGroup className="float-left">
						<Button
							color="light"
							disabled={true}
						>
							Selected Band: {
								(State.datasetPage.edit.selectedBand === -1) ? (<QuestionIcon/>) : State.datasetPage.edit.selectedBand.id.split('_')[1]
							}
						</Button>
					</ButtonGroup>
				</Col>
				<Col>
					<Button
						outline
						className="float-right button-toolbar button-toolbar-delete"
						color="danger"
						disabled={State.datasetPage.edit.selectedBand === -1}
						onClick={this.deleteButtonHandler}
					>
						<TrashcanIcon className="svg-red"/> Delete
					</Button>
					<Button className="float-right button-invisible">
					</Button>
					<ButtonGroup className="button-toolbar float-right">
						{State.datasetPage.states.map((state, id) =>
							<Button
								outline
								disabled={State.datasetPage.edit.selectedBand === -1}
								key={id}
								color={state.buttonColor}
								onClick={(...props) => this.stateButtonHandler(id, ...props)}
								active={State.datasetPage.edit.selectedBand.state === id}
								block={State.datasetPage.edit.selectedBand.state === id}
							>
								{state.name}
							</Button>
						)}
					</ButtonGroup>
				</Col>
			</Row>
		)
	}
}

export default view(DatasetToolbar);
