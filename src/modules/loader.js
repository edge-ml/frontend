import React, { Component } from 'react';
import { PacmanLoader as LoaderAnimation } from 'react-spinners';

class Loader extends Component {
	render() {
		if(this.props.loading === true){
			return(
				<LoaderAnimation
					className="loader"
					sizeUnit={"px"}
					size={50}
					color={'rgba(0, 0, 255, 0.5)'}
					loading={true}
				/>
			);
		}else{
			return this.props.children;
		}
	}
}

export default Loader;
