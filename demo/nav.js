document
  .querySelector('#custom-request')
  .addEventListener('click', function ()
  {
    const request = new Pagelets.Request(
      {
        url: 'custom.json',
        targetElement: 'container',
        triggerOnRequest: true,
      });

    request.addEventListener(Pagelets.events.RETRIEVED, function (e)
    {
      e.detail.response.content = '';
      for(let a in e.detail.response.items)
      {
        e.detail.response.content += `<div>${e.detail.response.items[a]}</div>`;
      }
    });

    Pagelets.load(request);
  });
