import {Pagelets} from '../js/index.js';

Pagelets.init();

const existing = {
  'actions': [
    {
      'target': 'container',
      'content': 'This is the content from the response',
      'inline': false,
      'options': [],
      'action': 'content'
    }
  ]
};

const response = new Pagelets.Response(existing);
const request = new Pagelets.Request({
  iterator: Pagelets.getIterator()
});

Pagelets.iterateResponse(response, request);
