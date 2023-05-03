import Loader from '../../modules/loader';
import logoSvg from '../../logo.svg';
import {
  DATASET_STORE,
  DATASET_STORE_ENDPOINTS,
} from '../../services/ApiServices/ApiConstants';

const DownloadDataset = (props) => {
  const id = props.match.params.id;
  // window.open(`${DATASET_STORE}${DATASET_STORE_ENDPOINTS.CSV}download/${id}`, "_blank");

  return (
    <div className="vh-100">
      <div className="d-flex flex-column align-items-center h-75">
        <div className="d-flex justify-content-center align-items-center">
          <img style={{ width: '256px' }} src={logoSvg} />
          <b>
            <div
              className="pl-4"
              style={{ color: 'black', fontSize: 'xxx-large' }}
            >
              edge-ml
            </div>
          </b>
        </div>
        <h3 className="self-algin-center font-bold p-3">
          <strong>Hang tight. We are working on your download.</strong>
        </h3>
        <Loader loading={true}></Loader>
      </div>
    </div>
  );
};

export default DownloadDataset;
