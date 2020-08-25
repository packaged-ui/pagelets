import {ContentActionProcessor} from './actions/builtin/content-processor';
import {LocationActionProcessor} from './actions/builtin/location-processor';
import {ResourceActionProcessor} from './actions/builtin/resource-processor';
import {RefreshActionProcessor} from './actions/builtin/refresh-processor';
import {SynchronousActionProcessor} from './actions/builtin/synchronous-processor';
import {addProcessor} from './pagelets';

addProcessor(new ContentActionProcessor());
addProcessor(new LocationActionProcessor());
addProcessor(new ResourceActionProcessor());
addProcessor(new RefreshActionProcessor());
addProcessor(new SynchronousActionProcessor());

export * from './pagelets';
export {CustomActionProcessor} from './actions/builtin/custom-processor';
