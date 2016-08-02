/**
@module ember
@submodule ember-routing
*/

import Service from 'ember-runtime/system/service';

import { get } from 'ember-metal/property_get';
import { readOnly } from 'ember-runtime/computed/computed_macros';
import { routeArgs } from 'ember-routing/utils';
import assign from 'ember-metal/assign';

/**
  The Routing service is used by LinkComponent, and provides facilities for
  the component/view layer to interact with the router.

  While still private, this service can eventually be opened up, and provides
  the set of API needed for components to control routing without interacting
  with router internals.

  @private
  @class RoutingService
*/
export default Service.extend({
  router: null,

  targetState: readOnly('router.targetState'),
  currentState: readOnly('router.currentState'),
  currentRouteName: readOnly('router.currentRouteName'),
  currentPath: readOnly('router.currentPath'),

  availableRoutes() {
    return Object.keys(get(this, 'router').router.recognizer.names);
  },

  hasRoute(routeName) {
    return get(this, 'router').hasRoute(routeName);
  },

  transitionTo(routeName, models, queryParams, shouldReplace) {
    let router = get(this, 'router');

    let transition = router._doTransition(routeName, models, queryParams);

    if (shouldReplace) {
      transition.method('replace');
    }

    return transition;
  },

  normalizeQueryParams(routeName, models, queryParams) {
    let router = get(this, 'router');
    router._prepareQueryParams(routeName, models, queryParams);
  },

  generateURL(routeName, models, queryParams) {
    let router = get(this, 'router');
    if (!router.router) { return; }

    let visibleQueryParams = assign({}, queryParams);

    // If we're going to an engine, we skip normalizing query params
    if (!router._engineInfoByRoute[routeName]) {
      this.normalizeQueryParams(routeName, models, visibleQueryParams);
    }

    let args = routeArgs(routeName, models, visibleQueryParams);
    return router.generate.apply(router, args);
  },

  isActiveForRoute(contexts, queryParams, routeName, routerState, isCurrentWhenSpecified) {
    let router = get(this, 'router');

    let handlers = router.router.recognizer.handlersFor(routeName);
    let leafName = handlers[handlers.length - 1].handler;
    let maximumContexts = numberOfContextsAcceptedByHandler(routeName, handlers);

    // NOTE: any ugliness in the calculation of activeness is largely
    // due to the fact that we support automatic normalizing of
    // `resource` -> `resource.index`, even though there might be
    // dynamic segments / query params defined on `resource.index`
    // which complicates (and makes somewhat ambiguous) the calculation
    // of activeness for links that link to `resource` instead of
    // directly to `resource.index`.

    // if we don't have enough contexts revert back to full route name
    // this is because the leaf route will use one of the contexts
    if (contexts.length > maximumContexts) {
      routeName = leafName;
    }

    return routerState.isActiveIntent(routeName, contexts, queryParams, !isCurrentWhenSpecified);
  }
});

function numberOfContextsAcceptedByHandler(handler, handlerInfos) {
  let req = 0;
  for (let i = 0; i < handlerInfos.length; i++) {
    req = req + handlerInfos[i].names.length;
    if (handlerInfos[i].handler === handler) {
      break;
    }
  }

  return req;
}
