import React from 'react';
import PrismCode from 'react-prism';
import 'prismjs';
import 'prismjs/components/prism-python';

// values should come with model
export const platforms = [
  {
    value: 'python',
    label: 'Python/pickle',
    samples: [
      // code: ({ link: string }) => string
      {
        value: 'remote',
        label: 'Model download over the internet',
        code: ({ link }) =>
          `# here comes the code, with download link: ${link}
def doSomethingWithTheLink() -> Work:
    return 42`
      },
      {
        value: 'local',
        label: 'Local model file',
        code: () =>
          `# here comes the code that uses local file
def doSomethingWithoutInternet() -> Work:
    return 4242424242`
      }
    ],
    path: `/export/python`,
    prism: ({ code }) => (
      <PrismCode component="pre" className="language-python">
        {code}
      </PrismCode>
    )
  }
];
