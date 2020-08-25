import {ActionProcessor} from '../processor';

export class CustomActionProcessor extends ActionProcessor
{
  constructor(action, fn)
  {
    super();
    this._fn = fn;
    this._action = action;
  }

  get action()
  {
    return this._action;
  }

  process(action, request, response, options)
  {
    return new Promise(
      resolve =>
      {
        this._fn(action);
        resolve();
      });
  }
}
