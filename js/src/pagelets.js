import Request from '@packaged-ui/request';
import History from "html5-history-api";

const _location = History.location || window.location;

export const events = {
  PREPARE: 'prepare',
  PROGRESS: 'progress',
  REQUESTED: 'requested',
  RETRIEVED: 'retrieved',
  RENDERED: 'rendered',
  COMPLETE: 'complete',
  CANCELLED: 'cancelled',
  ERROR: 'error',
};

const _pageletStates = {
  NONE: '',
  REQUESTED: 'requested',
  LOADING: 'loading',
  LOADED: 'loaded',
  REFRESHING: 'refreshing',
  ERROR: 'error',
};

/**
 * Initialisation options
 * @typedef {Object} Pagelets~InitOptions
 * @property {string}  [selector] - Which clicked elements to react to
 * @property {string}  [defaultTarget] - If no data-target specified, which container to load the content into
 * @property {boolean} [allowPersistentTargets] - If a page has been reloaded, allow pagelets to load into containers of the same name
 * @property {Node}    [listenElement] - Listen to links within this container only
 * @property {int}     [minRefreshRate] - Minimum time to wait between pagelet refreshes
 */

/**
 * @type {Pagelets~InitOptions}
 */
const _defaultOptions = {
  selector: '[data-uri],[data-target]',
  allowPersistentTargets: true,
  listenElement: document,
  minRefreshRate: 500,
};

/**
 * Pagelet Request
 * @typedef {Object} Pagelets~Request
 * @property {string}  url       - URL of the resource to request
 * @property {Element} [sourceElement] - element requesting the pagelet
 * @property {Element|string} [targetElement] - element to receive the pagelet
 * @property {string}  [pushUrl] - URL to set in the address bar
 * @property {object}  [headers] - object containing custom headers for the request
 * @property {object}  [data]    - object containing post data
 * @property {string}  [method]  - request method to use
 */

/**
 * Pagelet Resources Response
 * @typedef {Object} Pagelets~Response~Resources
 * @property {?Array} js
 * @property {?Array} css
 */

/**
 * Pagelet Location Response
 * @typedef {Object} Pagelets~Response~Location
 * @property {string} url
 * @property {boolean} replaceHistory
 * @property {boolean} reloadWindow
 */

/**
 * Pagelet Response
 * @typedef {Object} Pagelets~Response
 * @property {string}  [content] - content to return and render into the target
 * @property {string}  [contentType] - content type
 * @property {object}  [meta] - meta data provided by the backend, which can be read in events
 * @property {object}  [reloadPagelet] - Reload pagelet containers by selectors
 * @property {Pagelets~Response~Location} [location] - Set the window url
 * @property {Pagelets~Response~Resources} [resources] - Resources that should be loaded into the document
 */

let _options = Object.assign({}, _defaultOptions);

/**
 * (Re)Initialize pagelets with specified options
 * @param {Pagelets~InitOptions} [options={}]
 */
export function init(options = {})
{
  _options = Object.assign({}, _defaultOptions, options);

  _options.listenElement.addEventListener(
    'click',
    (e) =>
    {
      if(e.target instanceof Element)
      {
        const link = e.target.closest(_options.selector);
        if(link)
        {
          e.preventDefault();
          load(
            {
              url: link.getAttribute('data-uri') || link.getAttribute('href'),
              pushUrl: link.getAttribute('href'),
              sourceElement: link,
              targetElement: _normalizeTarget(link.getAttribute('data-target')),
            });
        }
      }
    }
  );

  if(document.readyState === 'complete')
  {
    _initialiseNewPagelets();
  }
  else
  {
    document.addEventListener('readystatechange', () =>
    {
      if(document.readyState === 'complete')
      {
        _initialiseNewPagelets();
      }
    });
  }
}

/**
 * @param {Pagelets~Request} request
 * @private
 */
export function load(request)
{
  request = _normalizeRequest(request);
  return new Promise(
    (resolve, reject) =>
    {
      const targetElement = _resolveElement(request.targetElement);
      _setPageletState(targetElement, _pageletStates.REQUESTED);

      if(targetElement.pageletRequest)
      {
        targetElement.pageletRequest.abort();
      }

      const targetSelector = targetElement.getAttribute('id') || '';

      if(_triggerEvent(targetElement, events.PREPARE))
      {
        const req = targetElement.pageletRequest = (new Request());
        req
          .setUrl(request.url)
          .setMethod(request.method || (request.data ? Request.POST : Request.GET))
          .setHeaders(
            {
              'x-requested-with': 'XMLHttpRequest',
              'x-pagelet-request': '1',
              'x-pagelet-target': targetSelector
            })
          .setEventCallback(
            (e) =>
            {
              switch(e.type)
              {
                case 'loadstart':
                  _setPageletState(
                    targetElement,
                    targetElement.getAttribute('data-self-uri') === request.url ? _pageletStates.REFRESHING : _pageletStates.LOADING
                  );
                  break;
                case 'progress':
                  _triggerEvent(targetElement, events.PROGRESS);
                  break;
                case 'abort':
                  _setPageletState(targetElement, _pageletStates.NONE);
                  _triggerEvent(targetElement, events.CANCELLED);
                  break;
                case 'error':
                  _setPageletState(targetElement, _pageletStates.ERROR);
                  _triggerEvent(targetElement, events.ERROR);
                  break;
              }
            })
          .setData(request.data);

        req
          .send()
          .then(
            (xhr) =>
            {
              _setPageletState(targetElement, _pageletStates.LOADED);
              const response = _normalizeResponse(xhr);
              const pageletObjects = {request: request, response: response};
              if(_triggerEvent(targetElement, events.RETRIEVED, pageletObjects))
              {
                _handleResponse(targetElement, response);
                _triggerEvent(targetElement, events.COMPLETE, pageletObjects)
              }

              if(response.location)
              {
                if(response.location.reloadWindow)
                {
                  if(response.location.replaceHistory)
                  {
                    _location.replace(response.location.url);
                  }
                  else
                  {
                    _location.assign(response.location.url);
                  }
                }
                else
                {
                  _pushState(targetElement, response.location.url, request.url, response.location.replaceHistory);
                }
              }
              else
              {
                let requestPushUrl = request.pushUrl
                  || (request.sourceElement ? request.sourceElement.getAttribute('href') : null);
                if(requestPushUrl)
                {
                  _pushState(targetElement, requestPushUrl, request.url, false);
                }
              }
              resolve(pageletObjects);
            })
          .then(
            () =>
            {
              targetElement.setAttribute('data-self-uri', request.url);
              _setPageletState(targetElement, _pageletStates.NONE);
            });

        _triggerEvent(targetElement, events.REQUESTED);
      }
      else
      {
        reject('prepare was cancelled')
      }
    });
}

function _initialiseNewPagelets(parentElement)
{
  parentElement = parentElement || _options.listenElement;

  const pageletElements = parentElement.querySelectorAll('[data-self-uri]');
  pageletElements.forEach(
    (pageletElement) =>
    {
      if(!pageletElement.pageletInitialized)
      {
        pageletElement.pageletInitialized = true;
        _refreshPagelet(pageletElement);
      }
    });
}

function _queueRefresh(element)
{
  if(element.hasAttribute('data-refresh'))
  {
    const refreshTime = Math.max(_options.minRefreshRate, element.getAttribute('data-refresh'));
    setTimeout(() => {_refreshPagelet(element)}, refreshTime);
  }
}

function _refreshPagelet(element)
{
  load(
    {
      url: element.getAttribute('data-self-uri'),
      sourceElement: element,
      targetElement: element
    });
}

function _setPageletState(element, state)
{
  if(state)
  {
    element.setAttribute('data-pagelet-state', state);
  }
  else
  {
    element.removeAttribute('data-pagelet-state');
  }
}

const _pageletIds = {};

/**
 * @typedef {Object} Pagelets~State
 * @property {string} targetPageletId
 * @property {?string} targetId
 * @property {string} pushUrl
 * @property {string} ajaxUrl
 */

/**
 * @param targetEle
 * @param pushUrl
 * @param ajaxUrl
 * @param replaceHistory
 * @private
 */
function _pushState(targetEle, pushUrl, ajaxUrl, replaceHistory)
{
  if(pushUrl && pushUrl === '#')
  {
    return;
  }
  targetEle = _resolveElement(targetEle);
  // assign target an id, store globally so that when we popstate we can find where it should go.  If it does not exist, then we must reload the page.
  targetEle.pageletId = targetEle.pageletId || _randomString(36);
  _pageletIds[targetEle.pageletId] = targetEle;
  const state = {targetPageletId: targetEle.pageletId, targetId: targetEle.getAttribute('id'), pushUrl, ajaxUrl};
  if(replaceHistory)
  {
    History.replaceState(state, null, pushUrl);
  }
  else
  {
    History.pushState(state, null, pushUrl);
  }
}

window.addEventListener('popstate', (d) =>
{
  /**
   * @type {Pagelets~State}
   */
  const state = d.state;
  if(state)
  {
    let targetElement;

    // find targetId
    if(_pageletIds[state.targetPageletId] && _options.listenElement.contains(_pageletIds[state.targetPageletId]))
    {
      targetElement = _pageletIds[state.targetPageletId];
    }
    else if(!!_options.allowPersistentTargets)
    {
      targetElement = _options.listenElement.querySelector('#' + state.targetId);
    }

    if(targetElement)
    {
      load({url: state.ajaxUrl, targetElement: targetElement});
    }
    else
    {
      _location.replace(state.pushUrl);
    }
  }
  else
  {
    _location.reload();
  }
});

function _randomString(length)
{
  let string = '';
  while(string.length < length)
  {
    string += parseInt(Math.random().toFixed(16).slice(2, 19)).toString(36);
  }
  return string.slice(0, length);
}

/**
 * @param {Element} element
 * @param {string} eventType
 * @param {object=} [data={}]
 * @private
 */
function _triggerEvent(element, eventType, data = {})
{
  return element.dispatchEvent(new CustomEvent(eventType, {detail: data, bubbles: true, cancelable: true}));
}

function _normalizeTarget(id)
{
  if(!!id)
  {
    return '#' + id;
  }
  return 'body';
}

/**
 * @param {Pagelets~Request} request
 * @return {Pagelets~Request}
 * @private
 */
function _normalizeRequest(request)
{
  request.targetElement = request.targetElement || _normalizeTarget(_options.defaultTarget);
  return request;
}

/**
 * @param {Element|string} elementOrSelector
 * @returns {Element}
 * @private
 */
function _resolveElement(elementOrSelector)
{
  return (elementOrSelector instanceof Element)
    ? elementOrSelector
    : _options.listenElement.querySelector(elementOrSelector)
}

/**
 *
 * @param {XMLHttpRequest} xhr
 * @return {Pagelets~Response}
 * @private
 */
function _normalizeResponse(xhr)
{
  const contentTypeHeader = xhr.getResponseHeader('content-type');
  let [contentType] = contentTypeHeader.split(';');

  const responseString = xhr.responseText.replace(/^while\(1\);|for\(;;\);|\)]}'/, '');

  switch(contentType)
  {
    case '':
    case 'text/plain':
    case 'text/html':
      return {
        contentType: contentType || 'text/plain',
        content: responseString,
      };
    case 'application/json':
    case 'application/javascript':
      const parsed = JSON.parse(responseString);
      parsed.contentType = 'text/html';
      return parsed;
    default:
      throw 'not a valid response';
  }
}

/**
 *
 * @param {Element} pageletElement
 * @param {Pagelets~Response} response
 * @private
 */
function _handleResponse(pageletElement, response)
{
  switch(response.contentType)
  {
    case 'text/plain':
      pageletElement.textContent = response.content;
      break;
    case 'text/html':
      pageletElement.innerHTML = response.content;
      break;
  }

  if(_triggerEvent(pageletElement, events.RENDERED, {response}))
  {
    _initialiseNewPagelets(pageletElement);
    _queueRefresh(pageletElement);
  }
}
