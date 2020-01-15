function _filterScripts(arr)
{
  return arr
    .filter(function (url) {return !document.querySelector('script[src="' + url + '"]');});
}

function _loadScript(url)
{
  return new Promise(
    (resolve, reject) =>
    {
      const se = document.createElement('script');
      se.setAttribute('src', url);
      se.setAttribute('type', 'text/javascript');
      se.addEventListener('load', resolve);
      se.addEventListener('error', reject);
      document.getElementsByTagName('head')[0].appendChild(se);
    });
}

export function loadScripts(arr)
{
  return _loadMultiple(arr, _filterScripts, _loadScript);
}

function _filterCss(arr)
{
  return arr
    .filter(function (url) {return !document.querySelector('link[rel="stylesheet"][href="' + url + '"]');});
}

function _loadCss(url)
{
  return new Promise(
    (resolve, reject) =>
    {
      const se = document.createElement('link');
      se.setAttribute('href', url);
      se.setAttribute('rel', 'stylesheet');
      se.addEventListener('load', resolve);
      se.addEventListener('error', reject);
      document.getElementsByTagName('head')[0].appendChild(se);
    });
}

export function loadCss(arr)
{
  return _loadMultiple(arr, _filterCss, _loadCss);
}

function _loadMultiple(arr, filterFn, loadFn)
{
  return new Promise(
    (resolve, reject) =>
    {
      // reduce to unloaded
      arr = filterFn(arr);

      // if no scripts to load, run callback immediately
      if(arr.length <= 0)
      {
        resolve();
        return;
      }

      // ensure all scripts are loaded before running callback
      const totalCount = arr.length;
      let doneCount = 0;

      for(let i = 0; i < arr.length; i++)
      {
        loadFn(arr[i])
          .then(
            () =>
            {
              // add the returned content to a newly created script tag
              doneCount++;
              if(doneCount >= totalCount)
              {
                resolve();
              }
            })
          .catch(reject);
      }
    });
}
