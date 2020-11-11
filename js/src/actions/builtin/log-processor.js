import {ActionProcessor} from '../processor';

export class LogActionProcessor extends ActionProcessor
{
  get action()
  {
    return 'log';
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
        if(!console[action.level])
        {
          action.level = 'log';
        }
        console[action.level](action.message);
        resolve();
      });
  }
}
