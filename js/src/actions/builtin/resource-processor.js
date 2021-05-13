import {ActionProcessor} from '../processor';
import {loadCss, loadScripts} from '../../resources';

export class ResourceActionProcessor extends ActionProcessor
{
  get action()
  {
    return 'resource';
  }

  process(action, request, response, options)
  {
    switch(action.type)
    {
      case 'css':
        if(action.inline)
        {
          const hash = hashFnv32a(action.data, true);
          if(document.querySelector(`[hash="${hash}"]`))
          {
            return;
          }
          const styleEle = document.createElement('style');
          styleEle.setAttribute('hash', hash);
          styleEle.type = 'text/css';
          if(styleEle.styleSheet)
          {
            // This is required for IE8 and below.
            styleEle.styleSheet.cssText = action.data;
          }
          else
          {
            styleEle.appendChild(document.createTextNode(action.data));
          }
          document.head.append(styleEle);
          break;
        }
        return loadCss([action.data], action.options);
      case 'js':
        if(action.inline)
        {
          const fn = new Function(action.data);
          fn();
          break;
        }
        return loadScripts([action.data], action.options);
    }

    return new Promise(resolve => resolve());
  }
}

/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {boolean} [asString=false] set to true to return the hash value as
 *     8-digit hex string instead of an integer
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */
function hashFnv32a(str, asString, seed)
{
  /*jshint bitwise:false */
  var i, l,
    hval = (seed === undefined) ? 0x811c9dc5 : seed;

  for(i = 0, l = str.length; i < l; i++)
  {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  if(asString)
  {
    // Convert to 8 digit hex string
    return ('0000000' + (hval >>> 0).toString(16)).substr(-8);
  }
  return hval >>> 0;
}
