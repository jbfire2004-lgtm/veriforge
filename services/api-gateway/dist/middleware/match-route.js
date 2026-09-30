"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouteMatcher = createRouteMatcher;
exports.isPublicPath = isPublicPath;
function createRouteMatcher(routes) {
    return function matchRoute(req, _res, next) {
        const path = req.path;
        const route = routes.find((r) => path === r.prefix || path.startsWith(`${r.prefix}/`));
        if (route) {
            req.matchedRoute = route;
        }
        next();
    };
}
function isPublicPath(route, path) {
    return route.publicPaths.some((re) => re.test(path));
}
//# sourceMappingURL=match-route.js.map