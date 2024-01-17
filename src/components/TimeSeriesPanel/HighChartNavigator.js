import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';

const navigatorOptions = (data) => {
  return {
    height: '100px',
    series: [{ data: data }],
    navigator: {
      enabled: true,
    },
  };
};

const HighChartsNavigator = ({ data }) => {
  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={navigatorOptions(data)}
        constructorType={'stockChart'}
        containerProps={{ style: { height: '100%' } }}
      ></HighchartsReact>
    </div>
  );
};

export default HighChartsNavigator;
