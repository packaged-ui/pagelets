## Upgrade from v1 to v2

### Initialization options

- `handleForms` option has been replaced with `formSelector`.

### Form submit handling

- Submit handling used to only work if the form had a `data-uri`. It will now fail over to the form action.

### Pagelets.load

- Load promise should now always resolve or reject. used to go stale on invalid url and warn on request errors
- Text responses with a code of 200 have always been upgraded to a content action. This has been extended to any status
  code.
