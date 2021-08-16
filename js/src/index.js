import {ContentActionProcessor} from './actions/builtin/content-processor.js';
import {LocationActionProcessor} from './actions/builtin/location-processor.js';
import {LoadActionProcessor} from './actions/builtin/load-processor.js';
import {ResourceActionProcessor} from './actions/builtin/resource-processor.js';
import {RefreshActionProcessor} from './actions/builtin/refresh-processor.js';
import {SynchronousActionProcessor} from './actions/builtin/synchronous-processor.js';
import {LogActionProcessor} from './actions/builtin/log-processor.js';
import {addProcessor} from './pagelets.js';

addProcessor(new ContentActionProcessor());
addProcessor(new LocationActionProcessor());
addProcessor(new LoadActionProcessor());
addProcessor(new ResourceActionProcessor());
addProcessor(new RefreshActionProcessor());
addProcessor(new SynchronousActionProcessor());
addProcessor(new LogActionProcessor());

export * from './pagelets.js';
export {CustomActionProcessor} from './actions/builtin/custom-processor.js';
