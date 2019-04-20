// const feathers = require('@feathersjs/feathers');
// const app = feathers();

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const loggingMiddleware = require('./lib/logger').middleware;
const errorMiddleware = require('./lib/errors').middleware;
const authMiddleware = require('./lib/auth').middleware;
const router = require('./routes');

const PORT = 4000;

const app = new Koa();

app.use(bodyParser());
app.use((ctx, next) => { ctx.$ = ctx.state; return next(); });
app.use(cors());
app.use(bodyParser());
app.use(loggingMiddleware);
app.use(errorMiddleware);
app.use(authMiddleware);

app.use(router.routes());

// if no matching routes exist, we reach this middleware
app.use(async (ctx, next) => {
  ctx.throw('NotFound', 'Invalid URL');
});

(async () => {
  await app.listen(PORT);
  console.log(`Server is running on port http://localhost:${PORT} :D`);
})();


// app.use(cors());


// app.use('users', {
//   async get(query) {
//     // Return an object in the form of { name, text }
//     return {
//       name,
//       text: `You have to do ${name}`,
//     };
//   },
// });
