import {ActionProcessor} from '../processor';

export class SynchronousActionProcessor extends ActionProcessor
{
  get action()
  {
    return 'synchronous';
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
    return request.iterator.iterate(
      action.actions,
      request,
      response,
      Object.assign({}, options, {synchronous: true})
    );
  }
}
