import Request from '@packaged-ui/request';
import History from 'html5-history-api';
import EventTarget from '@ungap/event-target';
import {ActionIterator} from './actions/actionIterator.js';
import {pushState} from './pushState.js';
import {onReadyState, readyStates} from '@packaged-ui/ready-promise';

/**
 * Initialisation options
 * @typedef {Object} Pagelets~InitOptions
 * @property {string}         [selector] - Which "click" event elements to react to
 * @property {string}         [formSelector] - Which "submit" event elements to react to
 * @property {string}         [defaultTarget] - If no data-target specified, which container to load the content into
 * @property {boolean}        [allowPersistentTargets] - If a page has been reloaded, allow pagelets to load into containers of the same name
 * @property {Node}           [listenElement] - Listen to links within this container only
 * @property {int}            [minRefreshRate] - Minimum time to wait between pagelet refreshes
 * @property {ActionIterator} [iterator] - set the default iterator
 * @property {boolean}        [composedEvents] - events dispatched by pagelets will be "composed" (bubble out of shadow dom)
 */

/**
 * Pagelet Request
 * @typedef {Object} Pagelets~Request
 * @property {string}  url       - URL of the resource to request
 * @property {ActionIterator}  [iterator] - action iterator to use when processing the response
 * @property {Element} [sourceElement] - element requesting the pagelet
 * @property {Element|string} [targetElement] - element to receive the pagelet
 * @property {string}  [pushUrl] - URL to set in the address bar
 * @property {{}}  [headers] - object containing custom headers for the request
 * @property {{}}  [data]    - object containing post data
 * @property {string}  [method]  - request method to use
 * @property {boolean}  [withCredentials]  - set withCredentials
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
 * @property {Array}   [actions] - actions
 */

const _location = (History && History.location) || window.location;

export const events = {
  PREPARE:   'prepare',
  PROGRESS:  'progress',
  REQUESTED: 'requested',
  RETRIEVED: 'retrieved',
  RENDERED:  'rendered',
  COMPLETE:  'complete',
  CANCELLED: 'cancelled',
  ERROR:     'error',
};

const _pageletStates = {
  NONE:       '',
  REQUESTED:  'requested',
  LOADING:    'loading',
  LOADED:     'loaded',
  REFRESHING: 'refreshing',
  ERROR:      'error',
};

/**
 * default pagelet initialization options
 * @type {Pagelets~InitOptions}
 */
const _defaultOptions = {
  selector:               'a[data-uri],button[data-uri],[href][data-target]',
  formSelector:           'form[data-uri],form[data-target]',
  allowPersistentTargets: true,
  listenElement:          document,
  minRefreshRate:         500,
  iterator:               new ActionIterator(),
  composedEvents:         false,
};

/**
 * @extends {Pagelets~Request}
 */
class PageletRequest extends EventTarget {
  /**
   * @param {Pagelets~Request} [properties]
   */
  constructor(properties)
  {
    super();
    properties.iterator = properties.iterator || _options.iterator;
    Object.assign(this, properties);
  }

  addProcessor(processor)
  {
    if(Object.is(this.iterator, _options.iterator))
    {
      this.iterator = _options.iterator.clone();
    }
    this.iterator.addProcessor(processor);
    return this;
  }

  /**
   * @returns {Element|null}
   */
  get getResolvedTarget()
  {
    if(this.targetElement === false)
    {
      return null;
    }
    if(this.targetElement instanceof Element)
    {
      return this.targetElement;
    }

    let targetId = this.targetElement || _options.defaultTarget;
    let target = document.body;

    if (targetId && _options.listenElement.getElementById(targetId))
    {
      target = _options.listenElement.getElementById(targetId) || target;
    }
    else if (targetId && this.sourceElement && this.sourceElement.getRootNode() instanceof ShadowRoot)
    {
      target = this.sourceElement.getRootNode().getElementById(targetId) || target;
    }
    return target
  }

  /**
   * @returns {String|null}
   */
  get getRequestedTarget()
  {
    if(typeof this.targetElement === 'string')
    {
      return this.targetElement;
    }
    if(this.targetElement instanceof Element)
    {
      return this.targetElement.id;
    }
    return null;
  }

  getRequestMethod()
  {
    return (this.method || '').toLowerCase() || 'get';
  }

  get getPushUrl()
  {
    return this.pushUrl || (this.sourceElement && this.sourceElement.getAttribute('href')) || null;
  }

  /**
   * @param {string} eventType
   * @param {object=} [data={}]
   * @param {boolean=} [cancelable=false]
   */
  triggerEvent(eventType, data = {}, cancelable = false)
  {
    const event = new CustomEvent(
      eventType,
      {
        detail:     Object.assign({}, data, {request: this}),
        bubbles:    true,
        cancelable: cancelable,
        composed:   _options.composedEvents,
      },
    );
    // trigger event on the request object first, then trigger it against the listen element
    return this.dispatchEvent(event)
      && (this.sourceElement && this.sourceElement.isConnected ? this.sourceElement : _options.listenElement)
        .dispatchEvent(event);
  }

  static fromElement(element)
  {
    const request = new PageletRequest(
      {
        url:           element.getAttribute('data-uri'),
        sourceElement: element,
        targetElement: element.getAttribute('data-target'),
      });

    if(element instanceof HTMLFormElement)
    {
      request.url = request.url || element.getAttribute('action');
      request.data = new FormData(element);
      request.method = element.getAttribute('method').toLowerCase() || undefined;

      if((!request.pushUrl) && element.method === 'get')
      {
        request.pushUrl = element.getAttribute('action') || request.url;
      }
    }
    return request;
  }
}

export {PageletRequest as Request};

/**
 * @extends {Pagelets~Response}
 */
class PageletResponse {
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
  onReadyState(readyStates.loaded).subscribe(_doInit);
  onReadyState(readyStates.complete).subscribe(_initialiseNewPagelets);
}

function _doInit()
{
  pushState(
    _resolveTarget(_options.defaultTarget),
    window.location.toString(),
    window.location.toString(),
    true,
  );

  _options.listenElement.addEventListener(
    'click',
    (e) => {
      if(e.target instanceof Element)
      {
        const path = e.path || e.composedPath();
        let link = e.target.closest(_options.selector);
        if(link === null && path && path.length > 0)
        {
          link = path[0].closest(_options.selector);
        }
        if(link)
        {
          const href = link.getAttribute('href');
          if(/^data:/.test(href))
          {
            return;
          }
          e.preventDefault();
          load(new PageletRequest(
            {
              url:           link.getAttribute('data-uri') || href,
              pushUrl:       href,
              sourceElement: link,
              targetElement: link.getAttribute('data-target'),
            }));
        }
      }
    },
  );

  _options.listenElement.addEventListener(
    'submit',
    (e) => {
      if(_options.formSelector && e.target.matches(_options.formSelector))
      {
        load(PageletRequest.fromElement(e.target)).catch((error) => console.log(error));
        e.preventDefault();
      }
    },
  );

  _initialiseNewPagelets();
}

const _currentRequests = new Map();

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
    (resolve, reject) => {
      if(request.triggerEvent(events.PREPARE, {}, true))
      {
        const targetElement = request.getResolvedTarget;
        _setPageletState(targetElement, _pageletStates.REQUESTED);

        if((!request.url) || /^#/.test(request.url) || /^data:/.test(request.url))
        {
          _setPageletState(targetElement, _pageletStates.ERROR);
          request.triggerEvent(events.ERROR, {error: 'invalid url'});
          throw 'invalid url';
        }

        // clear any existing timeout while we make a new request
        _clearRefresh(targetElement);

        // abort current request
        if(_currentRequests.has(targetElement))
        {
          _currentRequests.get(targetElement).abort();
          _currentRequests.delete(targetElement);
        }

        const req = new Request(request.url);
        _currentRequests.set(targetElement, req);

        req
          .setWithCredentials(request.withCredentials)
          .setMethod(request.getRequestMethod())
          .setHeaders(
            Object.assign(
              {},
              {
                'x-requested-with':   'XMLHttpRequest',
                'x-pagelet-request':  '1',
                'x-pagelet-target':   request.getRequestedTarget || '',
                'x-pagelet-fragment': request.url.replace(/^.*?(#|$)/, ''),
              },
              request.headers || {},
            ))
          .setEventCallback(
            (e) => {
              switch(e.type)
              {
                case 'loadstart':
                  _setPageletState(
                    targetElement,
                    targetElement.getAttribute('data-self-uri') === request.url ?
                      _pageletStates.REFRESHING :
                      _pageletStates.LOADING,
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

        const eventData = {request};
        req
          .send()
          .then(
            (xhr) => {
              _setPageletState(targetElement, _pageletStates.LOADED);
              eventData.response = _createResponseFromXhr(xhr);
            })
          .then(
            () => {
              if(request.triggerEvent(events.RETRIEVED, eventData, true))
              {
                return _handleResponse(request, eventData.response);
              }
            })
          .then(
            () => {
              request.triggerEvent(events.COMPLETE, eventData);
              _setPageletState(targetElement, _pageletStates.NONE);
              resolve(eventData);
            },
          )
          .catch(
            (e) => {
              _setPageletState(targetElement, _pageletStates.ERROR);
              request.triggerEvent(events.ERROR);
              reject(e);
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
    (pageletElement) => {
      if(!pageletElement.pageletInitialized)
      {
        pageletElement.pageletInitialized = true;
        refresh(pageletElement);
      }
    });
}

const _refreshHandlers = new WeakMap();

function _queueRefresh(element)
{
  _clearRefresh(element);
  if(!document.contains(element))
  {
    _refreshHandlers.delete(element);
  }
  else if(element.hasAttribute('data-refresh'))
  {
    const refreshTime = Math.max(_options.minRefreshRate, element.getAttribute('data-refresh'));
    _refreshHandlers.set(element, setTimeout(() => refresh(element), refreshTime));
  }
}

function _clearRefresh(element)
{
  if(_refreshHandlers.has(element))
  {
    clearTimeout(_refreshHandlers.get(element));
  }
}

/**
 * @param {Element} element
 * @private
 */
export function refresh(element)
{
  if(element)
  {
    const url = element.getAttribute('data-self-uri');
    if(url)
    {
      load(new PageletRequest(
        {
          url:           url,
          sourceElement: element,
          targetElement: element,
        }));
    }
    else
    {
      _initialiseNewPagelets(element);
    }
  }
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

window.addEventListener('popstate', (d) => {
  /**
   * @type {Pagelets~State}
   */
  const state = d.state;
  if(state)
  {
    // slice to copy array
    if(state.paths.length > 0)
    {
      state.paths.slice(0).reduce(
        async (p, {targetId, url}, i, arr) => {
          await p;
          const targetElement = _options.listenElement.getElementById(targetId);
          if(!targetElement)
          {
            // reload
            _location.replace(state.pushUrl);
            arr.splice(0);
            return Promise.resolve();
          }
          if(i === (arr.length - 1) || targetElement.getAttribute('data-self-uri') !== url)
          {
            return load(new PageletRequest({url, targetElement}));
          }
          return Promise.resolve();
        }, Promise.resolve());
    }
    else
    {
      _location.replace(state.pushUrl);
    }
  }
});

function _resolveTarget(targetId)
{
  return (targetId && _options.listenElement.getElementById(targetId)) || document.body;
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
  let [contentType] = (contentTypeHeader && contentTypeHeader.split(';')) || [''];

  const rawResponse = xhr.responseText.replace(/^while\(1\);|for\(;;\);|\)]}'/, '');

  const xhrProps = {
    status:      xhr.status,
    statusText:  xhr.statusText,
    rawResponse: rawResponse,
    headers:     _headersToObject(xhr.getAllResponseHeaders()),
  };

  switch(contentType)
  {
    case '':
    case 'text/plain':
    case 'text/html':
      const pageletProps = {};
      pageletProps.actions = [{action: 'content', content: rawResponse}];
      return new PageletResponse(Object.assign(pageletProps, xhrProps));
    case 'application/json':
    case 'application/javascript':
      return new PageletResponse(Object.assign(JSON.parse(rawResponse), xhrProps));
    default:
      throw 'not a valid response';
  }
}

function _headersToObject(headers)
{
  const headerMap = {};
  headers.trim().split(/[\r\n]+/).forEach(
    (line) => {
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
  return request
    .iterator
    .iterate(response.actions, request, response, _options)
    .then(
      () => {
        if(request.triggerEvent(events.RENDERED, {response}, true))
        {
          _initialiseNewPagelets(targetElement);
          _queueRefresh(targetElement);
        }

        const requestPushUrl = request.getPushUrl;
        if(requestPushUrl && requestPushUrl !== _location.href.substr(-requestPushUrl.length))
        {
          const hasLocation = response._processedActions
            && response._processedActions.reduce((p, t) => p || t.action === 'location', false);
          if(!hasLocation)
          {
            pushState(request.getResolvedTarget, requestPushUrl, request.url, false);
          }
        }
      },
    );
}

/**
 * Add a processor to the default iterator
 * @param {ActionProcessor} processor
 */
export function addProcessor(processor)
{
  _options.iterator.addProcessor(processor);
}
