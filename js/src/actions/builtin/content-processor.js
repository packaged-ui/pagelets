import {ActionProcessor} from '../processor';
import Request from '@packaged-ui/request';

export class ContentActionProcessor extends ActionProcessor
{
  get action()
  {
    return 'content';
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

        targetElement.innerHTML = action.content;
        if(request.getRequestMethod() === Request.GET)
        {
          targetElement.setAttribute('data-self-uri', request.url);
        }
        resolve();
      });
  }
}
