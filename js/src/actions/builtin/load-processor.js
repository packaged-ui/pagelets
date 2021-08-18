import {ActionProcessor} from '../processor.js';
import {load, Request} from '../../pagelets.js';

export class LoadActionProcessor extends ActionProcessor
{
  get action()
  {
    return 'load';
  }

  process(action, request, response, options)
  {
    return load(new Request(
      {
        url: action.url,
        targetElement: action.target || request.targetElement,
      }));
  }
}
