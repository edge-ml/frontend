module.exports.processedCsvNoLabels = [
  [
    ['time', 'sensor_accX[m/s²]', 'sensor_accY[m/s²]', 'sensor_accZ[m/s²]'],
    ['1628168415000', '2', '2', '2'],
    ['1628168416000', '4', '2', '4'],
    ['1628168417000', '8', '3', '8'],
    ['1628168418000', '16', '4', '16'],
    ['1628168419000', '16', '4', '16']
  ]
];

module.exports.proccessedCsvLabels = [
  [
    [
      'time',
      'sensor_accX[m/s²]',
      'sensor_accY[m/s²]',
      'sensor_accZ[m/s²]',
      'label_labeling1_label1',
      'label_labeling1_label2'
    ],
    ['1628168415000', '2', '2', '2', 'x', ''],
    ['1628168416000', '4', '2', '4', 'x', ''],
    ['1628168417000', '8', '3', '8', '', 'x'],
    ['1628168418000', '16', '4', '16', '', 'x'],
    ['1628168419000', '16', '4', '16', '', 'x']
  ]
];

module.exports.generatedDatasetNoLabels = {
  datasets: [
    {
      end: 1628168419000,
      start: 1628168415000,
      timeSeries: [
        {
          data: [
            { datapoint: 2, timestamp: 1628168415000 },
            { datapoint: 4, timestamp: 1628168416000 },
            { datapoint: 8, timestamp: 1628168417000 },
            { datapoint: 16, timestamp: 1628168418000 },
            { datapoint: 16, timestamp: 1628168419000 }
          ],
          end: 1628168419000,
          name: 'accX',
          start: 1628168415000,
          unit: 'm/s²'
        },
        {
          data: [
            { datapoint: 2, timestamp: 1628168415000 },
            { datapoint: 2, timestamp: 1628168416000 },
            { datapoint: 3, timestamp: 1628168417000 },
            { datapoint: 4, timestamp: 1628168418000 },
            { datapoint: 4, timestamp: 1628168419000 }
          ],
          end: 1628168419000,
          name: 'accY',
          start: 1628168415000,
          unit: 'm/s²'
        },
        {
          data: [
            { datapoint: 2, timestamp: 1628168415000 },
            { datapoint: 4, timestamp: 1628168416000 },
            { datapoint: 8, timestamp: 1628168417000 },
            { datapoint: 16, timestamp: 1628168418000 },
            { datapoint: 16, timestamp: 1628168419000 }
          ],
          end: 1628168419000,
          name: 'accZ',
          start: 1628168415000,
          unit: 'm/s²'
        }
      ]
    }
  ],
  labelings: [[]]
};

module.exports.generatedDatasetLabels = {
  datasets: [
    {
      end: 1628168419000,
      start: 1628168415000,
      timeSeries: [
        {
          data: [
            { datapoint: 2, timestamp: 1628168415000 },
            { datapoint: 4, timestamp: 1628168416000 },
            { datapoint: 8, timestamp: 1628168417000 },
            { datapoint: 16, timestamp: 1628168418000 },
            { datapoint: 16, timestamp: 1628168419000 }
          ],
          end: 1628168419000,
          name: 'accX',
          start: 1628168415000,
          unit: 'm/s²'
        },
        {
          data: [
            { datapoint: 2, timestamp: 1628168415000 },
            { datapoint: 2, timestamp: 1628168416000 },
            { datapoint: 3, timestamp: 1628168417000 },
            { datapoint: 4, timestamp: 1628168418000 },
            { datapoint: 4, timestamp: 1628168419000 }
          ],
          end: 1628168419000,
          name: 'accY',
          start: 1628168415000,
          unit: 'm/s²'
        },
        {
          data: [
            { datapoint: 2, timestamp: 1628168415000 },
            { datapoint: 4, timestamp: 1628168416000 },
            { datapoint: 8, timestamp: 1628168417000 },
            { datapoint: 16, timestamp: 1628168418000 },
            { datapoint: 16, timestamp: 1628168419000 }
          ],
          end: 1628168419000,
          name: 'accZ',
          start: 1628168415000,
          unit: 'm/s²'
        }
      ]
    }
  ],
  labelings: [
    [
      {
        datasetLabel: {
          labels: [
            { end: '1628168416000', name: 'label1', start: '1628168415000' },
            { end: '1628168419000', name: 'label2', start: '1628168417000' }
          ],
          name: 'labeling1'
        },
        labeling: { name: 'labeling1' },
        labels: [
          { color: '#ff00ff', isNewLabel: true, name: 'label1' },
          { color: '#ff00ff', isNewLabel: true, name: 'label2' }
        ]
      }
    ]
  ]
};
