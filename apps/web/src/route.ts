/**
 * an array of routes that are accesible to the public
 * those routes do not require authentication
 * @type {string[]}
 */
export const PublicRoutes = ["/"];

/**
 * the prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */

export const apiAuthPrefix = "/api/auth";

/**
 * the default redirect path after logged in
 * @type {string}
 */

export const DEFAULT_LOGIN_REDIRECT = "/";
