const _ = require('lodash');
const uuidv4 = require('uuid/v4');

function log(toLog) {
  console.log(toLog);
}

module.exports.middleware = async (ctx, next) => {
  const { req, res } = ctx;

  // skip logs for favicon
  if (req.url === '/favicon.ico') return next();

  ctx.$.requestStart = +new Date();
  ctx.$.requestId = uuidv4();

  const requestInfoToLog = {
    type: 'request',
    url: req.url,
    method: req.method,
    reqId: ctx.$.requestId,
    userAgent: req.headers['user-agent'],
    remoteIp: ctx.ip,
  };

  ctx.logContext = {};

  ctx.log = (meta, moreMeta) => {
    if (_.isString(meta)) meta = { message: meta, ...moreMeta };
    meta.apiVersion = ctx.$.version;
    if (ctx.$.authUser && ctx.$.authUser.id) {
      meta.user = _.pick(ctx.$.authUser, 'id', 'type', 'email');
    }
    if (req.originalUrl) meta.originalUrl = ctx.req.originalUrl;
    log({
      ...requestInfoToLog,
      context: ctx.logContext,
      ...meta,
    });
  };


  // run the actual request
  await next();

  let logRequest = true;
  if (req.headers['user-agent']) {
    if (req.headers['user-agent'].includes('ELB-HealthChecker')) logRequest = false;
  }
  if (logRequest) {
    const requestTime = +new Date() - ctx.$.requestStart;
    ctx.log({
      // TODO: add some colors to the status code and request time?
      message: `${requestInfoToLog.method} ${requestInfoToLog.url} ${res.statusCode} ${requestTime}ms`,
      timer: requestTime,
      statusCode: res.statusCode,
      error: ctx.$.capturedError,
    });
  }
};
