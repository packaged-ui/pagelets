import {Pagelets} from '../index';
import {ActionProcessor} from '../js/src/actions/processor';

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
  get action()
  {
    return 'my-items';
  }

  process(action, request, response, options)
  {
    const target = request.getResolvedTarget;
    let content = '';
    action.items.forEach(
      (itm) =>
      {
        content += `<div>${itm}</div>`;
      });
    target.innerHTML = content;
  }
}

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