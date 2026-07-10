import {ActionProcessor} from '../processor.js';

/**
 * Extract a filename from a Content-Disposition header value.
 * @param {string|null|undefined} disposition
 * @returns {string}
 */
export function filenameFromDisposition(disposition)
{
  if(!disposition || !disposition.includes('attachment'))
  {
    return '';
  }
  const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
  return matches && matches[1] ? matches[1].replace(/['"]/g, '').trim() : '';
}

/**
 * Handles a `download` action by streaming the response blob to the browser
 * via a synthetic anchor. The blob is built from the raw response bytes, so
 * binary payloads (pdf, images, zip, ...) are preserved.
 */
export class DownloadActionProcessor extends ActionProcessor
{
  get action()
  {
    return 'download';
  }

  /**
   * @param action
   * @param {PageletRequest} request
   * @param {PageletResponse} response
   * @param {Pagelets~InitOptions} options
   * @returns {Promise<unknown>}
   */
  process(action, request, response, options)
  {
    return new Promise(
      (resolve) =>
      {
        const listen = (options && options.listenElement) || document;
        const doc = listen.ownerDocument || listen;
        const blobUrl = URL.createObjectURL(action.blob);
        const a = doc.createElement('a');
        a.href = blobUrl;
        a.download = action.filename || '';
        // target opts the link out of any global click handler that hijacks navigation
        a.target = '_self';
        (doc.body || doc.documentElement).appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
        resolve();
      });
  }
}