import {ActionProcessor} from '../processor';
import {loadCss, loadScripts} from '../../resources';

export class ResourceActionProcessor extends ActionProcessor
{
  get action()
  {
    return 'resource';
  }

  process(action, request, response, options)
  {
    switch(action.type)
    {
      case 'css':
        if(action.inline)
        {
          console.warn('inline css not currently supported');
          break;
        }
        return loadCss([action.data]);
      case 'js':
        if(action.inline)
        {
          console.warn('inline js not currently supported');
          break;
        }
        return loadScripts([action.data]);
    }

    return new Promise(resolve => resolve());
  }
}
