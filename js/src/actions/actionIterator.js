export class ActionIterator
{
  constructor()
  {
    this._processors = new Map();
  }

  iterate(actions, request, response, options)
  {
    actions = (actions || []);
    return actions.reduce(
      async (p, action) =>
      {
        if(options.synchronous)
        {
          await p;
        }
        return this._getPromiseForAction(action, request, response, options);
      }, Promise.resolve());
  }

  /**
   * @param {ActionProcessor} processor
   */
  addProcessor(processor)
  {
    this._processors.set(processor.action, processor);
  }

  clone()
  {
    const c = new ActionIterator();
    this._processors.forEach(
      (value, key) =>
      {
        c.addProcessor(Object.assign(Object.create(Object.getPrototypeOf(value)), value));
      });
    return c;
  }

  _getPromiseForAction(action, request, response, options)
  {
    /**
     *
     * @type {ActionProcessor}
     */
    const processor = this._processors.get(action.action);
    if(processor)
    {
      return processor.process(action, request, response, options);
    }
    return new Promise(resolve => resolve());
  }
}
