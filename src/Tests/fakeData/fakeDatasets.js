export const fakeDataset_One = {
  isPublished: false,
  device: null,
  experiments: null,
  _id: '5f45114480d85700190a9ec4',
  start: 1595506316000,
  end: 1595506319000,
  name: 'fakeDAtaset_One',
  timeSeries: [
    {
      data: [1, 2, 3, 4],
      offset: 0,
      _id: '5f45114480d85700190a9ec5',
      name: 'u1',
      unit: 't1',
      start: 1595506316000,
      end: 1595506319000,
      samplingRate: 1,
    },
  ],
  userId: '5f4390ab80d85700190a9ec3',
  events: [],
  fusedSeries: [],
  labelings: [
    {
      labels: [
        {
          _id: '5f731a8d20901e0019d9f31e',
          start: 1595506317380.651,
          type: '5f1dd1b837eeaa00196310bd',
          end: 1595506317754.973,
        },
      ],
      _id: '5f731a8d20901e0019d9f31d',
      labelingId: '5f1dd1b837eeaa00196310bf',
      creator: '5f4390ab80d85700190a9ec3',
    },
    {
      labels: [
        {
          _id: '5f731aa620901e0019d9f324',
          start: 1595506317334.5388,
          type: '5f1dd1f337eeaa00196310c1',
          end: 1595506317950.2712,
        },
        {
          _id: '5f731aab20901e0019d9f333',
          start: 1595506318438.517,
          type: '5f1dd1f337eeaa00196310c1',
          end: 1595506318823.689,
        },
        {
          _id: '5f731ab020901e0019d9f345',
          start: 1595506318102.17,
          type: '5f1dd1f337eeaa00196310c0',
          end: 1595506318243.2188,
        },
      ],
      _id: '5f731aa620901e0019d9f323',
      labelingId: '5f1dd1f437eeaa00196310c2',
      creator: '5f4390ab80d85700190a9ec3',
    },
  ],
  results: [],
  __v: 0,
};

export const fakeLabeling_One = [
  { _id: '5f1dd1b837eeaa00196310bf', name: 'label1' },
  { _id: '5f1dd1f437eeaa00196310c2', name: 'label2' },
];

export const fakeDataset_Two = {
  isPublished: false,
  device: null,
  experiments: null,
  _id: '5f8058e30509a30012b357ff',
  start: 1595506316,
  end: 1595506325,
  timeSeries: [
    {
      data: [1, 2, 4, 8, 8, 8, 8, 8, 12, 16],
      offset: 0,
      _id: '5f8058e30509a30012b35800',
      name: 'f2',
      unit: 'u2',
      start: 1595506316,
      end: 1595506325,
      samplingRate: 1,
    },
  ],
  userId: '5f7dde3dfe99230012ae2af4',
  events: [],
  fusedSeries: [],
  labelings: [],
  results: [],
  __v: 0,
};

export const fakeDatasetCombination_one_two = {
  isPublished: false,
  device: null,
  experiments: null,
  _id: '5f8058d10509a30012b357fd',
  start: 1595506316,
  end: 1595506319,
  timeSeries: [
    {
      data: [1, 2, 3, 4],
      offset: 0,
      _id: '5f8058d10509a30012b357fe',
      name: 'f1',
      unit: 'u1',
      start: 1595506316,
      end: 1595506319,
      samplingRate: 1,
    },
    {
      data: [1, 2, 4, 8, 8, 8, 8, 8, 12, 16],
      offset: 0,
      _id: '5f8071120509a30012b35801',
      name: 'n2',
      unit: 'u2',
      start: 1595506316,
      end: 1595506325,
      samplingRate: 1,
    },
  ],
  userId: '5f7dde3dfe99230012ae2af4',
  events: [],
  fusedSeries: [],
  labelings: [],
  results: [],
  __v: 0,
};
