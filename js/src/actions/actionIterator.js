export class ActionIterator
{
  constructor()
  {
    this._processors = new Map();
  }

  iterate(actions, request, response, options)
  {
    return Promise
      .all(
        (actions || []).map(
          (action) =>
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
          }));
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
}
