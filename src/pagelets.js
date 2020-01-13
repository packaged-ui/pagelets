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

const _pageletClasses = {
  REQUESTED: 'requested',
  LOADING: 'loading',
  LOADED: 'loaded',
  REFRESHING: 'refreshing',
  ERROR: 'error',
};

/**
 * Initialisation options
 * @typedef {Object} Pagelets~InitOptions
 * @property {?string}  selector - Which clicked elements to react to
 * @property {?string}  defaultTarget - If no data-target specified, which container to load the content into
 * @property {?boolean} allowPersistentTargets - If a page has been reloaded, allow pagelets to load into containers of the same name
 * @property {?Node}    listenElement - Listen to links within this container only
 */

/**
 * Pagelet Request
 * @typedef {Object} Pagelets~Request
 * @property {string}  url       - URL of the resource to request
 * @property {Element} [sourceElement] - element requesting the pagelet
 * @property {Element} [targetElement] - element to receive the pagelet
 * @property {string}  [pushUrl] - URL to set in the address bar
 * @property {object}  [headers] - object containing custom headers for the request
 * @property {object}  [data]    - object containing post data
 * @property {string}  [method]  - request method to use
 */

/**
 * Pagelet Resources Response
 * @typedef {Object} Pagelets~ResourcesResponse
 * @property {?Array} js
 * @property {?Array} css
 */

/**
 * Pagelet Response
 * @typedef {Object} Pagelets~Response
 * @property {string}  [reloadPage] - Force the page to refresh
 * @property {string}  [reloadPagelet] - Reload pagelet containers by selectors
 * @property {string}  [pushUrl] - Push a specific url to the address bar history
 * @property {boolean} [replaceHistory] - replace the current browser history
 * @property {object}  [meta] - metadata provided by the backend, which can be read in events
 * @property {string}  [contentType] - content type
 * @property {string}  [markup] - content to return and render into the target
 * @property {Pagelets~ResourcesResponse} [resources] - Listen to links within this container only
 */

/**
 * @type {Pagelets~InitOptions}
 */
const _defaultOptions = {
  selector: '[data-uri],[data-target]',
  defaultTarget: null,
  allowPersistentTargets: true,
  listenElement: document,
};

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
      //noinspection JSValidateTypes
      /**
       * @type {Element}
       */
      const link = e.target;
      if(link.matches(_options.selector))
      {
        e.preventDefault();
        const ajaxUrl = link.getAttribute('data-uri') || link.getAttribute('href');

        const request = {
          url: ajaxUrl,
          pushUrl: link.getAttribute('href'),
          sourceElement: link,
          targetElement: '#' + link.getAttribute('data-target'),
        };
        load(request);
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
 * @param {Pagelets~Request} pageletRequest
 * @private
 */
export function load(pageletRequest)
{
  pageletRequest = _normalizeRequest(pageletRequest);
  return new Promise(
    (resolve, reject) =>
    {
      const targetElement = _resolveElement(pageletRequest.targetElement);
      const targetSelector = targetElement.getAttribute('id') || '';

      targetElement.classList.add(_pageletClasses.REQUESTED);

      if(_triggerEvent(targetElement, events.PREPARE))
      {
        (new Request())
          .setUrl(pageletRequest.url)
          .setMethod(pageletRequest.method || (pageletRequest.data ? Request.POST : Request.GET))
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
                case 'abort':
                  _triggerEvent(targetElement, events.CANCELLED);
                  break;
                case 'error':
                  _triggerEvent(targetElement, events.ERROR);
                  break;
                case 'progress':
                  _triggerEvent(targetElement, events.PROGRESS);
                  break;
              }
            })
          .setData(pageletRequest.data)
          .send()
          .then(
            (xhr) =>
            {
              const pageletObjects = {request: pageletRequest, response: _normalizeResponse(xhr)};
              if(_triggerEvent(targetElement, events.RETRIEVED, pageletObjects))
              {
                _handleResponse(targetElement, pageletObjects.response);
                _triggerEvent(targetElement, events.COMPLETE, pageletObjects)
              }
              let pushUrl = pageletObjects.response.pushUrl || pageletObjects.request.pushUrl;
              if((!pushUrl) && pageletObjects.request.sourceElement)
              {
                pushUrl = pageletObjects.request.sourceElement.getAttribute('href')
              }
              if(pushUrl && pushUrl !== '#')
              {
                _pushState(_resolveElement(targetElement), pushUrl, pageletObjects.request.url);
              }
              resolve(pageletObjects);
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
      if(!pageletElement.initialized)
      {
        pageletElement.initialized = true;
        load({url: pageletElement.getAttribute('data-self-uri'), targetElement: pageletElement});
      }
    }
  );
}

const _pageletIds = {};

/**
 * @typedef {Object} Pagelets~State
 * @property {string} targetPageletId
 * @property {?string} targetId
 * @property {string} pushUrl
 * @property {string} ajaxUrl
 */

function _pushState(targetEle, pushUrl, ajaxUrl)
{
  // assign target an id, store globally so that when we popstate we can find where it should go.  If it does not exist, then we must reload the page.
  targetEle.pageletId = targetEle.pageletId || _randomString(36);
  _pageletIds[targetEle.pageletId] = targetEle;
  const state = {targetPageletId: targetEle.pageletId, targetId: targetEle.getAttribute('id'), pushUrl, ajaxUrl};
  History.pushState(state, null, pushUrl);
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

/**
 * @param {Pagelets~Request} request
 * @return {Pagelets~Request}
 * @private
 */
function _normalizeRequest(request)
{
  request.targetElement = request.targetElement || _options.defaultTarget || 'body';
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
        markup: responseString,
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
      pageletElement.textContent = response.markup;
      break;
    case 'text/html':
      pageletElement.innerHTML = response.markup;
      break;
  }

  if(_triggerEvent(pageletElement, events.RENDERED, {response}))
  {
    _initialiseNewPagelets(pageletElement);
  }
}
