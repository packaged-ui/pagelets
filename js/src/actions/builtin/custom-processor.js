import {ActionProcessor} from '../processor';

export class CustomActionProcessor extends ActionProcessor
{
  constructor(fn)
  {
    super();
    this._fn = fn;
    this._action = null;
  }

  get action()
  {
    return this._action;
  }

  setAction(action)
  {
    this._action = action;
    return this;
  }

  process(action, request, response, options)
  {
    return new Promise(
      resolve =>
      {
        this.fn(action);
        resolve();
      });
  }
}
