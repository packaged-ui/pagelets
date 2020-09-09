import {ActionProcessor} from '../processor';
import {load, Request} from '../../pagelets';

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
