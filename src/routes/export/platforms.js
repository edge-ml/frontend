import React from 'react';
import PrismCode from 'react-prism';
import 'prismjs';
import 'prismjs/components/prism-python';

// values should come with model
export const platforms = [
  {
    value: 'python',
    label: 'Python',
    prism: ({ code }) => (
      <PrismCode component="pre" className="language-python">
        {code}
      </PrismCode>
    ),
    extension: 'py'
  },
  {
    value: 'c',
    label: 'C',
    prism: ({ code }) => (
      <PrismCode component="pre" className="language-c">
        {code}
      </PrismCode>
    ),
    extension: 'c'
  },
  {
    value: 'c-embedded',
    label: 'C (for embedded)',
    prism: ({ code }) => (
      <PrismCode component="pre" className="language-c">
        {code}
      </PrismCode>
    ),
    extension: 'c'
  },
  {
    value: 'javascript',
    label: 'Javascript',
    prism: ({ code }) => (
      <PrismCode component="pre" className="language-javascript">
        {code}
      </PrismCode>
    ),
    extension: 'js'
  },
  {
    value: 'arduino_cpp',
    label: 'Arduino Cpp',
    prism: ({ code }) => (
      <PrismCode component="pre" className="language-c">
        {code}
      </PrismCode>
    ),
    extension: 'hpp'
  }
];
