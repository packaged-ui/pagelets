import {port as _p, server as _s} from './_setup.js';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import http from 'http';
import {Pagelets} from '../index.js';
import multipart from 'parse-multipart-data';

chai.use(chaiAsPromised);
chai.should();

const server = http.createServer(
  function (req, res)
  {
    if(req.url === '/fail')
    {
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end();
      return;
    }

    let body = '';
    req.on('data', function (data)
    {
      body += data;
    });

    req.on('end', function ()
    {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      if(req.method.toLowerCase() === 'get')
      {
        const [, query] = req.url.split('?');
        let data = Object.fromEntries((new URLSearchParams(query)).entries());
        data = Object.keys(data).length > 0 && JSON.stringify(data) || 'abc123';
        res.end(data);
      }
      else
      {
        let data = {};
        const _boundary = multipart.getBoundary(req.headers['content-type']);
        if(req.headers['content-type'] && _boundary)
        {
          multipart.parse(Buffer.from(body, 'utf8'), _boundary)
                   .forEach((d) => {data[d.name] = d.data.toString();});
        }
        else
        {
          data = Object.fromEntries((new URLSearchParams(body)).entries());
        }

        data = Object.keys(data).length > 0 && JSON.stringify(data) || 'abc123';
        res.end(data);
      }
    });
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
      chai.assert.equal(res.statusCode, 200);
      done();
    });
  });
  it('server return 400', function (done)
  {
    http.get(_s + '/fail', function (res)
    {
      chai.assert.equal(res.statusCode, 400);
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
  it('invalid status code', function ()
  {
    const req = new Pagelets.Request({url: _s + '/fail'});
    chai.assert.isFulfilled(Pagelets.load(req), 'request failed');
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
      chai.assert.equal(req.getPushUrl, _s + '/test-url');
      chai.assert.deepEqual(req.data, formData);
      return _assertRawResponse(req, JSON.stringify(formData));
    });
    it('get form-action query', function ()
    {
      const form = _getElement('form', {method: 'get', action: _s + '/test-url?foo=bar'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-url?foo=bar');
      chai.assert.equal(req.getRequestMethod(), 'get');
      chai.assert.equal(req.getPushUrl, _s + '/test-url?foo=bar');
      chai.assert.deepEqual(req.data, formData);
      return _assertRawResponse(req, JSON.stringify(Object.assign({foo: 'bar'}, formData)));
    });
    it('get form-data-uri', function ()
    {
      const form = _getElement('form', {method: 'get', action: _s + '/test-url', 'data-uri': _s + '/test-data-url'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-data-url');
      chai.assert.equal(req.getRequestMethod(), 'get');
      chai.assert.equal(req.getPushUrl, _s + '/test-url');
      chai.assert.deepEqual(req.data, formData);
      return _assertRawResponse(req, JSON.stringify(formData));
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
      chai.assert.equal(req.getPushUrl, _s + '/test-url');
      chai.assert.deepEqual(req.data, formData);
      return _assertRawResponse(req, JSON.stringify(Object.assign({foo: 'bar'}, formData)));
    });
  });

  describe('POST', function ()
  {
    it('post form-action', function ()
    {
      const form = _getElement(
        'form',
        {method: 'post', enctype: 'application/x-www-form-urlencoded', action: _s + '/test-url'}
      );
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-url');
      chai.assert.deepEqual(req.data, formData);
      return _assertRawResponse(req, JSON.stringify(formData));
    });
    it('post form-action query', function ()
    {
      const form = _getElement('form', {method: 'post', action: _s + '/test-url?foo=bar'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-url?foo=bar');
      chai.assert.deepEqual(req.data, formData);
      return _assertRawResponse(req, JSON.stringify(formData));
    });
    it('post form-data-uri', function ()
    {
      const form = _getElement('form', {method: 'post', action: _s + '/test-url', 'data-uri': _s + '/test-data-url'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-data-url');
      chai.assert.deepEqual(req.data, formData);
      return _assertRawResponse(req, JSON.stringify(formData));
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
      chai.assert.deepEqual(req.data, formData);
      return _assertRawResponse(req, JSON.stringify(formData));
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
      chai.assert.equal(req.getRequestMethod(), 'delete');
      chai.assert.deepEqual(req.data, formData);
      return _assertRawResponse(req, JSON.stringify(formData));
    });
    it('delete form-action query', function ()
    {
      const form = _getElement('form', {method: 'delete', action: _s + '/test-url?foo=bar'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-url?foo=bar');
      chai.assert.equal(req.getRequestMethod(), 'delete');
      chai.assert.deepEqual(req.data, formData);
      return _assertRawResponse(req, JSON.stringify(formData));
    });
    it('delete form-data-uri', function ()
    {
      const form = _getElement('form', {method: 'delete', action: _s + '/test-url', 'data-uri': _s + '/test-data-url'});
      _formAdd(form, formData);
      const req = Pagelets.Request.fromElement(form);
      chai.assert.equal(req.url, _s + '/test-data-url');
      chai.assert.equal(req.getRequestMethod(), 'delete');
      chai.assert.deepEqual(req.data, formData);
      return _assertRawResponse(req, JSON.stringify(formData));
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
      chai.assert.equal(req.getRequestMethod(), 'delete');
      chai.assert.deepEqual(req.data, formData);
      return _assertRawResponse(req, JSON.stringify(formData));
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

function _assertRawResponse(req, expect)
{
  return Pagelets.load(req)
                 .then(function (r) {return r.response.rawResponse;})
                 .should
                 .eventually
                 .deep
                 .equal(expect);
}
