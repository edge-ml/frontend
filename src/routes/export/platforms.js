import React from 'react';
import PrismCode from 'react-prism';
import 'prismjs';
import 'prismjs/components/prism-python';

// values should come with model
export const platforms = [
  {
    value: 'python',
    label: 'Python/pickle',
    prism: ({ code }) => (
      <PrismCode component="pre" className="language-python">
        {code}
      </PrismCode>
    )
  }
];
