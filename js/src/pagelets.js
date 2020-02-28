import Request from '@packaged-ui/request';
import History from 'html5-history-api';
import {loadCss, loadScripts} from './resources';

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
 * Pagelet Request
 * @typedef {Object} Pagelets~Request
 * @property {string}  url       - URL of the resource to request
 * @property {boolean}  [triggerOnRequest] - trigger events on the request instead of document
 * @property {Element} [sourceElement] - element requesting the pagelet
 * @property {Element|string} [targetElement] - element to receive the pagelet
 * @property {string}  [pushUrl] - URL to set in the address bar
 * @property {{}}  [headers] - object containing custom headers for the request
 * @property {{}}  [data]    - object containing post data
 * @property {string}  [method]  - request method to use
 */

/**
 * Pagelet Resources Response
 * @typedef {Object} PageletResponse~Resources
 * @property {Array} [js]
 * @property {Array} [css]
 */

/**
 * Pagelet Location Response
 * @typedef {Object} PageletResponse~Location
 * @property {string} url
 * @property {boolean} replaceHistory
 * @property {boolean} reloadWindow
 */

/**
 * Pagelet Response
 * @typedef {Object} Pagelets~Response
 * @property {number}  status - HTTP status code
 * @property {string}  statusText - HTTP status message
 * @property {object}  headers - HTTP response headers
 * @property {string}  [content] - content to return and render into the target
 * @property {string}  [contentType] - content type
 * @property {object}  [meta] - meta data provided by the backend, which can be read in events
 * @property {object}  [reloadPagelet] - Reload pagelet containers by selectors
 * @property {PageletResponse~Location} [location] - Set the window url
 * @property {PageletResponse~Resources} [resources] - Resources that should be loaded into the document
 */

/**
 * @typedef {Object} Pagelets~State
 * @property {string} targetPageletId
 * @property {?string} targetId
 * @property {string} pushUrl
 * @property {string} ajaxUrl
 */


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
 * @type {Pagelets~InitOptions}
 */
const _defaultOptions = {
  selector: 'a[data-uri],button[data-uri],[href][data-target]',
  allowPersistentTargets: true,
  listenElement: document,
  minRefreshRate: 500,
};

/**
 * @augments {Pagelets~Request}
 */
class PageletRequest extends EventTarget
{
  /**
   * @param {Pagelets~Request} [properties]
   */
  constructor(properties)
  {
    super();
    Object.assign(this, properties);
  }

  /**
   * @returns {Element}
   */
  get getResolvedTarget()
  {
    if(this.targetElement instanceof Element)
    {
      return this.targetElement;
    }
    const targetId = this.targetElement || _options.defaultTarget;
    const target = (targetId && '#' + targetId) || 'body';
    return _options.listenElement.querySelector(target);
  }

  get getPushUrl()
  {
    return this.pushUrl || (this.sourceElement && this.sourceElement.getAttribute('href')) || null;
  }

  /**
   * @param {string} eventType
   * @param {object=} [data={}]
   */
  triggerEvent(eventType, data)
  {
    const event = new CustomEvent(
      eventType,
      {detail: Object.assign({}, data, {request: this}), bubbles: true, cancelable: true},
    );
    return (this.triggerOnRequest ? this : _options.listenElement).dispatchEvent(event);
  }
}

export {PageletRequest as Request};

/**
 * @augments {Pagelets~Response}
 */
class PageletResponse
{
  constructor(properties)
  {
    Object.assign(this, properties);
  }
}

let _options = Object.assign({}, _defaultOptions);
let _isInitialized = false;

/**
 * (Re)Initialize pagelets with specified options
 * @param {Pagelets~InitOptions} [options]
 */
export function init(options = {})
{
  _options = Object.assign({}, _defaultOptions, options);
  if(_isInitialized)
  {
    return;
  }
  _isInitialized = true;
  _doInit() || document.addEventListener('readystatechange', _doInit);
}

function _doInit()
{
  if(document.readyState === 'complete')
  {
    _pushState(
      _options.listenElement.querySelector((_options.defaultTarget && '#' + _options.defaultTarget) || 'body'),
      window.location.toString(),
      window.location.toString(),
      true,
    );

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
            load(new PageletRequest(
              {
                url: link.getAttribute('data-uri') || link.getAttribute('href'),
                pushUrl: link.getAttribute('href'),
                sourceElement: link,
                targetElement: link.getAttribute('data-target'),
              }));
          }
        }
      },
    );

    _initialiseNewPagelets();
    return true;
  }
  return false;
}

/**
 * @param {PageletRequest|Object} request
 * @private
 */
export function load(request)
{
  if(!(request instanceof PageletRequest))
  {
    request = new PageletRequest(request);
  }
  return new Promise(
    (resolve) =>
    {
      const targetElement = request.getResolvedTarget;
      _setPageletState(targetElement, _pageletStates.REQUESTED);

      if(targetElement.pageletRequest)
      {
        targetElement.pageletRequest.abort();
      }

      const targetSelector = targetElement.getAttribute('id') || '';

      if(request.triggerEvent(events.PREPARE))
      {
        if((!request.url) || /^#/.test(request.url))
        {
          _setPageletState(targetElement, _pageletStates.ERROR);
          request.triggerEvent(events.ERROR, {error: 'invalid url'});
          return;
        }

        const req = targetElement.pageletRequest = (new Request());
        req
          .setUrl(request.url)
          .setMethod(request.method || (request.data ? Request.POST : Request.GET))
          .setHeaders(
            {
              'x-requested-with': 'XMLHttpRequest',
              'x-pagelet-request': '1',
              'x-pagelet-target': targetSelector,
              'x-pagelet-fragment': request.url.replace(/^.*?(#|$)/, ''),
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
                  request.triggerEvent(events.PROGRESS);
                  break;
                case 'abort':
                  _setPageletState(targetElement, _pageletStates.NONE);
                  request.triggerEvent(events.CANCELLED);
                  break;
                case 'error':
                  _setPageletState(targetElement, _pageletStates.ERROR);
                  request.triggerEvent(events.ERROR);
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
              const response = _createResponseFromXhr(xhr);
              const pageletObjects = {request: request, response: response};
              if(request.triggerEvent(events.RETRIEVED, pageletObjects))
              {
                _handleResponse(request, response)
                  .then(
                    () =>
                    {
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
                          _pushState(
                            targetElement,
                            response.location.url,
                            request.url,
                            response.location.replaceHistory,
                          );
                        }
                      }
                      else
                      {
                        let requestPushUrl = request.getPushUrl;
                        if(requestPushUrl)
                        {
                          _pushState(targetElement, requestPushUrl, request.url, false);
                        }
                      }

                      request.triggerEvent(events.COMPLETE, pageletObjects);
                    });
              }
              resolve(pageletObjects);
            })
          .then(
            () =>
            {
              _setPageletState(targetElement, _pageletStates.NONE);
            });

        request.triggerEvent(events.REQUESTED);
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

/**
 * @param {Element} element
 * @private
 */
function _refreshPagelet(element)
{
  load(new PageletRequest(
    {
      url: element.getAttribute('data-self-uri'),
      sourceElement: element,
      targetElement: element,
    }));
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
    else if((!!_options.allowPersistentTargets) && state.targetId)
    {
      targetElement = _options.listenElement.querySelector('#' + state.targetId);
    }

    if(targetElement)
    {
      load(new PageletRequest({url: state.ajaxUrl, targetElement: targetElement}));
    }
    else
    {
      _location.replace(state.pushUrl);
    }
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
 *
 * @param {XMLHttpRequest} xhr
 * @return {PageletResponse}
 * @private
 */
function _createResponseFromXhr(xhr)
{
  const contentTypeHeader = xhr.getResponseHeader('content-type');
  let [contentType] = contentTypeHeader.split(';');

  const responseString = xhr.responseText.replace(/^while\(1\);|for\(;;\);|\)]}'/, '');

  const xhrProps = {
    status: xhr.status,
    statusText: xhr.statusText,
    headers: _headersToObject(xhr.getAllResponseHeaders()),
  };

  switch(contentType)
  {
    case '':
    case 'text/plain':
    case 'text/html':
      return new PageletResponse(Object.assign({content: responseString}, xhrProps));
    case 'application/json':
    case 'application/javascript':
      return new PageletResponse(Object.assign(JSON.parse(responseString), xhrProps));
    default:
      throw 'not a valid response';
  }
}

function _headersToObject(headers)
{
  const headerMap = {};
  headers.trim().split(/[\r\n]+/).forEach(
    (line) =>
    {
      const parts = line.split(': ');
      const header = parts.shift();
      headerMap[header] = parts.join(': ');
    });
  return headerMap;
}

/**
 * @param {PageletRequest} request
 * @param {PageletResponse} response
 * @return {Promise}
 * @private
 */
function _handleResponse(request, response)
{
  const targetElement = request.getResolvedTarget;
  if(response.hasOwnProperty('content'))
  {
    targetElement.innerHTML = response.content;
    targetElement.setAttribute('data-self-uri', request.url);
  }

  if(response.hasOwnProperty('reloadPagelet'))
  {
    Object.keys(response.reloadPagelet)
          .forEach(
            (key) =>
            {
              const reloadTarget = response.reloadPagelet[key];
              const pagelet = _options.listenElement.querySelector('#' + key);
              if(pagelet)
              {
                load(new PageletRequest(
                  {
                    url: reloadTarget ? reloadTarget : pagelet.getAttribute('data-self-uri'),
                    targetElement: key,
                  }));
              }
            });
  }

  return Promise
    .all(
      [
        loadCss(response.resources && response.resources.css || []),
        loadScripts(response.resources && response.resources.js || []),
      ])
    .then(
      () =>
      {
        if(request.triggerEvent(events.RENDERED, {response}))
        {
          _initialiseNewPagelets(targetElement);
          _queueRefresh(targetElement);
        }
      })
    .catch(
      () =>
      {
        _setPageletState(targetElement, _pageletStates.ERROR);
        request.triggerEvent(events.ERROR);
      },
    );
}
