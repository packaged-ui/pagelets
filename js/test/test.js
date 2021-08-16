import chai from 'chai';
import jsdom from 'jsdom-global';
import http from 'http';
import chaiAsPromised from 'chai-as-promised';
import {Pagelets} from '../index.js';

chai.use(chaiAsPromised);
chai.should();

const _p = 8876;
const _s = 'http://127.0.0.1:' + _p;

jsdom(undefined, {url: _s});

const server = http.createServer(
  function (req, res)
  {
    if(req.url === '/fail')
    {
      res.writeHead(400);
      res.end('request failed');
      return;
    }

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello, world!\n');
  }
);

before(function () {server.listen(_p);});

after(function () {server.close();});

describe('test server', function ()
{
  it('server return 200', function (done)
  {
    http.get(_s, function (res)
    {
      chai.assert.equal(200, res.statusCode);
      done();
    });
  });
  it('server return 400', function (done)
  {
    http.get(_s + '/fail', function (res)
    {
      chai.assert.equal(400, res.statusCode);
      res.on('data', function (chunk) {chai.assert.equal('request failed', chunk);});
      done();
    });
  });
});

describe('invalid checks', function ()
{
  it('invalid url', function ()
  {
    const req = new Pagelets.Request({url: 'data://failure'});
    return chai.assert.isRejected(Pagelets.load(req), 'invalid url');
  });
  it('invalid response', function ()
  {
    const req = new Pagelets.Request({url: _s + '/fail'});
    return chai.assert.isRejected(Pagelets.load(req), 'request failed');
  });
});

describe('fromElement', function ()
{
  const formData = {test1: '1', test2: '2'};
  describe('GET', function ()
  {
    it('get form-action', function ()
    {
      const form = _getElement('form', {method: 'get', action: _s + '/test-url'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-url');
      chai.assert.equal(req.getRequestMethod(), 'get');
      chai.assert.equal(req.getRequestUrl(), _s + '/test-url?test1=1&test2=2');
      chai.assert.equal(req.getPushUrl, _s + '/test-url');
      chai.assert.deepEqual(req.data, formData);
    });
    it('get form-action query', function ()
    {
      const form = _getElement('form', {method: 'get', action: _s + '/test-url?foo=bar'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-url?foo=bar');
      chai.assert.equal(req.getRequestMethod(), 'get');
      chai.assert.equal(req.getRequestUrl(), _s + '/test-url?foo=bar&test1=1&test2=2');
      chai.assert.equal(req.getPushUrl, _s + '/test-url?foo=bar');
      chai.assert.deepEqual(req.data, formData);
    });
    it('get form-data-uri', function ()
    {
      const form = _getElement('form', {method: 'get', action: _s + '/test-url', 'data-uri': _s + '/test-data-url'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-data-url');
      chai.assert.equal(req.getRequestMethod(), 'get');
      chai.assert.equal(req.getRequestUrl(), _s + '/test-data-url?test1=1&test2=2');
      chai.assert.equal(req.getPushUrl, _s + '/test-url');
      chai.assert.deepEqual(req.data, formData);
    });
    it('get form-data-uri query', function ()
    {
      const form = _getElement(
        'form',
        {method: 'get', action: _s + '/test-url', 'data-uri': _s + '/test-data-url?foo=bar'}
      );
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-data-url?foo=bar');
      chai.assert.equal(req.getRequestMethod(), 'get');
      chai.assert.equal(req.getRequestUrl(), _s + '/test-data-url?foo=bar&test1=1&test2=2');
      chai.assert.equal(req.getPushUrl, _s + '/test-url');
      chai.assert.deepEqual(req.data, formData);
    });
  });

  describe('POST', function ()
  {
    it('post form-action', function ()
    {
      const form = _getElement('form', {method: 'post', action: _s + '/test-url'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-url');
      chai.assert.equal(req.getRequestUrl(), _s + '/test-url');
      chai.assert.deepEqual(req.data, formData);
    });
    it('post form-action query', function ()
    {
      const form = _getElement('form', {method: 'post', action: _s + '/test-url?foo=bar'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-url?foo=bar');
      chai.assert.equal(req.getRequestUrl(), _s + '/test-url?foo=bar');
      chai.assert.deepEqual(req.data, formData);
    });
    it('post form-data-uri', function ()
    {
      const form = _getElement('form', {method: 'post', action: _s + '/test-url', 'data-uri': _s + '/test-data-url'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-data-url');
      chai.assert.equal(req.getRequestUrl(), _s + '/test-data-url');
      chai.assert.deepEqual(req.data, formData);
    });
    it('post form-data-uri', function ()
    {
      const form = _getElement(
        'form',
        {method: 'post', action: _s + '/test-url', 'data-uri': _s + '/test-data-url?foo=bar'}
      );
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-data-url?foo=bar');
      chai.assert.equal(req.getRequestUrl(), _s + '/test-data-url?foo=bar');
      chai.assert.deepEqual(req.data, formData);
    });
  });

  describe('DELETE', function ()
  {
    it('delete form-action', function ()
    {
      const form = _getElement('form', {method: 'delete', action: _s + '/test-url'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-url');
      chai.assert.equal(req.getRequestUrl(), _s + '/test-url');
      chai.assert.equal(req.getRequestMethod(), 'delete');
      chai.assert.deepEqual(req.data, formData);
    });
    it('delete form-action query', function ()
    {
      const form = _getElement('form', {method: 'delete', action: _s + '/test-url?foo=bar'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-url?foo=bar');
      chai.assert.equal(req.getRequestUrl(), _s + '/test-url?foo=bar');
      chai.assert.equal(req.getRequestMethod(), 'delete');
      chai.assert.deepEqual(req.data, formData);
    });
    it('delete form-data-uri', function ()
    {
      const form = _getElement('form', {method: 'delete', action: _s + '/test-url', 'data-uri': _s + '/test-data-url'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-data-url');
      chai.assert.equal(req.getRequestUrl(), _s + '/test-data-url');
      chai.assert.equal(req.getRequestMethod(), 'delete');
      chai.assert.deepEqual(req.data, formData);
    });
    it('delete form-data-uri', function ()
    {
      const form = _getElement(
        'form',
        {method: 'delete', action: _s + '/test-url', 'data-uri': _s + '/test-data-url?foo=bar'}
      );
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-data-url?foo=bar');
      chai.assert.equal(req.getRequestUrl(), _s + '/test-data-url?foo=bar');
      chai.assert.equal(req.getRequestMethod(), 'delete');
      chai.assert.deepEqual(req.data, formData);
    });
  });
});

function _getElement(tag, attributes = {})
{
  const ele = document.createElement(tag);
  Object.keys(attributes).forEach(
    function (k)
    {
      ele.setAttribute(k, attributes[k]);
    }
  );
  return ele;
}

function _formAdd(form, inputs = {})
{
  Object.keys(inputs).forEach(
    function (k)
    {
      const ele = _getElement('input', {type: 'hidden', name: k, value: inputs[k]});
      form.append(ele);
    }
  );
}
