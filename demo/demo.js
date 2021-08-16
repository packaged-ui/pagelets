import {Pagelets} from '../js/index.js';
import {ActionProcessor} from '../js/src/actions/processor.js';

Pagelets.init();

for(let eventName in Pagelets.events)
{
  document.addEventListener(
    Pagelets.events[eventName], function (e)
    {
      //console.log(e.type, e.detail.request);
    },
  );
}

class MyItemsProcessor extends ActionProcessor
{
  constructor(wait)
  {
    super();
    this._wait = wait;
  }

  get action()
  {
    return 'my-items';
  }

  process(action, request, response, options)
  {
    return new Promise(
      resolve =>
      {
        const target = request.getResolvedTarget;
        let content = '';
        action.items.forEach(
          (itm) =>
          {
            content += `<div>${itm}</div>`;
          });
        if(target)
        {
          target.innerHTML = content;
        }
        if(this._wait)
        {
          setTimeout(resolve, this._wait);
        }
        else
        {
          resolve();
        }
      });
  }
}

Pagelets.addProcessor(new MyItemsProcessor(5000));

document.addEventListener('click', function (e)
{
  if(e.target.matches('#custom-request'))
  {
    const request = new Pagelets.Request(
      {
        url: 'custom.json',
        targetElement: 'container',
      });
    request.addProcessor(new MyItemsProcessor());

    Pagelets.load(request);
  }
});
