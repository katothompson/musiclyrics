import test from 'ava';
const app = require('./billboardapi.js')
const request = require('supertest')(app);

test('hello world', async t => {
      const res = await request.get('/');
      t.is(res.status, 200);
})
test('get billboard returns object', async t => {
      const res = await request.get('/billboard');
      t.is(typeof(res), 'object')
      //console.log(res)
})
test('body is 500 long', async t => {
      const res = await request.get('/billboard');
      t.is(res.body.length, 5100) 
})
