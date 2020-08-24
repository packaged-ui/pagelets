import History from 'html5-history-api';
import {ActionProcessor} from '../processor';
import {pushState} from '../../pushState';

const _location = History.location || window.location;

export class LocationActionProcessor extends ActionProcessor
{
  get action()
  {
    return 'location';
  }

  process(action, request, response, options)
  {
    return new Promise(
      resolve =>
      {
        if(action.reload)
        {
          if(action.replace)
          {
            _location.replace(action.url);
          }
          else
          {
            _location.assign(action.url);
          }
        }
        else
        {
          pushState(
            request.getResolvedTarget,
            action.url,
            request.url,
            action.replace,
          );
        }
        resolve();
      });
  }
}
