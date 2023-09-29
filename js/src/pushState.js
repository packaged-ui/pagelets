import History from 'html5-history-api';

/**
 * @typedef {Object} Pagelets~State~Path
 * @property {string} targetId
 * @property {string} url
 */

/**
 * @typedef {Object} Pagelets~State
 * @property {Pagelets~State~Path[]} paths
 * @property {string} pushUrl
 */

export function pushState(targetEle, pushUrl, ajaxUrl, replaceHistory)
{
  if(pushUrl && pushUrl === '#')
  {
    return;
  }

  const paths = [];
  let t = targetEle;
  do
  {
    if(t && t.matches('[data-self-uri]'))
    {
      paths.push({targetId: t.getAttribute('id'), url: t.getAttribute('data-self-uri')});
    }
  }
  while ((t = t.parentElement));

  // assign target an id, store globally so that when we popstate we can find where it should go.  If it does not exist, then we must reload the page.
  const state = {paths: paths.reverse(), pushUrl};
  if(replaceHistory)
  {
    History.replaceState(state, null, pushUrl);
  }
  else
  {
    History.pushState(state, null, pushUrl);
  }
}
