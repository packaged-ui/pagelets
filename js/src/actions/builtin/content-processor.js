import {ActionProcessor} from '../processor.js';

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
        if(action.target !== false)
        {
          let targetElement;
          if(action.target)
          {
            targetElement = options.listenElement.getElementById(action.target);
          }
          else
          {
            targetElement = request.getResolvedTarget;
            if(targetElement && request.getRequestMethod() === 'get')
            {
              targetElement.setAttribute('data-self-uri', request.url);
            }
          }

          if(targetElement)
          {
            targetElement.innerHTML = action.content;
          }
          else
          {
            console.warn('content target does not exist', request, action);
          }
        }
        resolve();
      });
  }
}
