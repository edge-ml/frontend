module.exports.fakeExperiment1 = [
  {
    _id: '5fbba596f5ae3a001299207d',
    name: 'TestExp',
    instructions: [
      {
        _id: '5fbba596f5ae3a001299207f',
        duration: 10000,
        labelingId: '5fbba57bf5ae3a001299207c',
        labelType: '5fbba57bf5ae3a001299207a'
      },
      {
        _id: '5fbba596f5ae3a001299207e',
        duration: 10000,
        labelingId: '5fbba57bf5ae3a001299207c',
        labelType: '5fbba57bf5ae3a001299207b'
      }
    ],
    __v: 0
  }
];

module.exports.fakeLabelingData1 = {
  labelings: [
    {
      labels: ['5fbba57bf5ae3a001299207a', '5fbba57bf5ae3a001299207b'],
      _id: '5fbba57bf5ae3a001299207c',
      name: 'State',
      __v: 0
    }
  ],
  labels: [
    {
      _id: '5fbba57bf5ae3a001299207a',
      name: 'Sleeping',
      color: '#2751DE',
      __v: 0
    },
    {
      _id: '5fbba57bf5ae3a001299207b',
      name: 'Awake',
      color: '#549064',
      __v: 0
    }
  ]
};
