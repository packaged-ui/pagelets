import History from 'html5-history-api';

const _stateMap = new Map();

export function pushState(targetEle, pushUrl, ajaxUrl, replaceHistory)
{
  if(pushUrl && pushUrl === '#')
  {
    return;
  }
  // assign target an id, store globally so that when we popstate we can find where it should go.  If it does not exist, then we must reload the page.
  const state = {stateId: _randomString(36), targetId: targetEle.getAttribute('id'), pushUrl, ajaxUrl};
  _stateMap.set(state.stateId, targetEle);

  if(replaceHistory)
  {
    History.replaceState(state, null, pushUrl);
  }
  else
  {
    History.pushState(state, null, pushUrl);
  }
}

/**
 * @param stateId
 * @returns {Element}
 */
export function getStateElement(stateId)
{
  return _stateMap.get(stateId);
}

function _randomString(length)
{
  let string = '';
  while(string.length < length)
  {
    string += parseInt(Math.random().toFixed(16).slice(2, 19)).toString(36);
  }
  return string.slice(0, length);
}
