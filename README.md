# Pagelets

**[Upgrading from v1 to v2](UPGRADE.md)**

## Usage

### Initialize

Initialize pagelet events (link clicks and form submissions)

```js
Pagelets.init(options);
```

#### Options

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| selector | string | `a[data-uri],button[data-uri],[href][data-target]` | Which "click" event elements to react to |
| formSelector | string | `form[data-uri],form[data-target]` | Which "submit" event elements to react to |
| defaultTarget | string | `document.body` | If no data-target specified, which container to load the content into |
| allowPersistentTargets | boolean | `true` | If a page has been reloaded, allow pagelets to load into containers of the same name |
| listenElement | Node | `document` | Listen to links within this container only |
| minRefreshRate | int | `500` | Minimum time to wait between pagelet refreshes |
| iterator | ActionIterator | `new ActionIterator()` | set the default iterator |

### Manual request

Manually make pagelet request

```js
const req = new Pagelets.Request(options);
Pagelets.load(req)
        .then(({request, response}) =>
              {
                // process response (if necessary)
              })
        .catch((e) =>
               {
                 // error handling
               });
```

#### Pagelet Options

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| url _[required]_ | String | | URL of the resource to request |
| iterator | ActionIterator | _uses global options_ |  action iterator to use when processing the response |
| sourceElement | Element | |  element requesting the pagelet |
| targetElement | Element/String |  |  element to receive the default pagelet content |
| pushUrl | String |   |  URL to set in the address bar |
| headers | Object |  | object containing custom headers for the request |
| data | Object |   |  object containing post data |
| method | String |   |  request method to use |
| withCredentials | Boolean | `false` |  set withCredentials |
