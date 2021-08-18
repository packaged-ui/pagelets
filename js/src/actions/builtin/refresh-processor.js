import {ActionProcessor} from '../processor.js';
import {refresh} from '../../pagelets.js';

export class RefreshActionProcessor extends ActionProcessor
{
  get action()
  {
    return 'refresh';
  }

  /**
   * @param action
   * @param {PageletRequest} request
   * @param {PageletResponse} response
   * @param {Pagelets~InitOptions} options
   * @returns {Promise<unknown>}
   */
  process(action, request, response, options)
  {
    return new Promise(
      resolve =>
      {
        let targetElement;
        if(action.target)
        {
          targetElement = options.listenElement.getElementById(action.target);
        }
        else
        {
          targetElement = request.getResolvedTarget;
        }

        refresh(targetElement);
        resolve();
      });
  }
}
