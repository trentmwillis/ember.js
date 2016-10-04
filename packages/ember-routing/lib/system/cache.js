import { Object as EmberObject } from 'ember-runtime';

/**
  A two-tiered caching class. Caches values according to a "bucket" first and
  then the actual key.

  @private
  @class BucketCache
  @extends Ember.Object
*/
export default EmberObject.extend({
  init() {
    this.cache = {};
  },

  has(bucketKey) {
    return bucketKey in this.cache;
  },

  stash(bucketKey, key, value) {
    console.log('STASH', ...arguments);
    let bucket = this.cache[bucketKey];
    if (!bucket) {
      bucket = this.cache[bucketKey] = {};
    }
    bucket[key] = value;
  },

  lookup(bucketKey, prop, defaultValue) {
    console.log('LOOKUP', ...arguments);

    let cache = this.cache;
    if (!(bucketKey in cache)) {
      return defaultValue;
    }

    let bucket = cache[bucketKey];
    if (prop in bucket) {
      return bucket[prop];
    } else {
      return defaultValue;
    }
  }
});
