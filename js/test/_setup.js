/* setup.js */
import {JSDOM} from 'jsdom';

export const port = 8876;
export const server = 'http://127.0.0.1:' + port;

export const jsdom = new JSDOM('<!doctype html><html lang="en"><body></body></html>', {url: server});
const {window} = jsdom;

function copyProps(src, target)
{
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
global.requestAnimationFrame = function (callback)
{
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id)
{
  clearTimeout(id);
};
copyProps(window, global);

// mockEventTarget.js

// copy the code from https://developer.mozilla.org/en-US/docs/Web/API/EventTarget#Simple_implementation_of_EventTarget
var EventTarget = function ()
{
  this.listeners = {};
};

EventTarget.prototype.listeners = null;
EventTarget.prototype.addEventListener = function (type, callback)
{
  if(!(type in this.listeners))
  {
    this.listeners[type] = [];
  }
  this.listeners[type].push(callback);
};

EventTarget.prototype.removeEventListener = function (type, callback)
{
  if(!(type in this.listeners))
  {
    return;
  }
  var stack = this.listeners[type];
  for(var i = 0, l = stack.length; i < l; i++)
  {
    if(stack[i] === callback)
    {
      stack.splice(i, 1);
      return;
    }
  }
};

EventTarget.prototype.dispatchEvent = function (event)
{
  if(!(event.type in this.listeners))
  {
    return true;
  }
  var stack = this.listeners[event.type].slice();

  for(var i = 0, l = stack.length; i < l; i++)
  {
    stack[i].call(this, event);
  }
  return !event.defaultPrevented;
};

// make the EventTarget global
global.EventTarget = EventTarget;
