import {ContentActionProcessor} from './actions/builtin/content-processor';
import {LocationActionProcessor} from './actions/builtin/location-processor';
import {ResourceActionProcessor} from './actions/builtin/resource-processor';
import {RefreshActionProcessor} from './actions/builtin/refresh-processor';
import {addProcessor} from './pagelets';

addProcessor(new ContentActionProcessor());
addProcessor(new LocationActionProcessor());
addProcessor(new ResourceActionProcessor());
addProcessor(new RefreshActionProcessor());

export * from './pagelets';
