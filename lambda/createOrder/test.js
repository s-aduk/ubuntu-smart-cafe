process.env.TABLE_NAME = 'UbuntuCafeOrders';
// no SES_FROM_EMAIL set -> should skip email path entirely

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);
ddbMock.on(PutCommand).resolves({});

const { handler } = require('./index.js');

async function run() {
  // 1. Valid table order
  const validEvent = {
    body: JSON.stringify({
      customer: { name: 'Ama Owusu', phone: '+233 24 555 0182', email: 'ama@example.com' },
      items: [
        { id: 'jollof-suya', name: 'Smoked Jollof Rice with Grilled Suya', price: 28, quantity: 2 },
        { id: 'bissap', name: 'West African Bissap', price: 8, quantity: 2 },
      ],
      subtotal: 72,
      fulfillment: { type: 'table', tableNumber: '5' },
    }),
  };
  const res1 = await handler(validEvent);
  console.log('TEST 1 (valid table order):', res1.statusCode, res1.body);
  if (res1.statusCode !== 201) throw new Error('Expected 201');
  const parsed = JSON.parse(res1.body);
  if (!parsed.orderId || !parsed.orderId.startsWith('ORD-')) throw new Error('Bad orderId format');
  if (parsed.status !== 'Pending') throw new Error('Expected status Pending');

  // check what was actually sent to DynamoDB
  const calls = ddbMock.commandCalls(PutCommand);
  console.log('PutCommand Item:', JSON.stringify(calls[0].args[0].input.Item, null, 2));

  // 2. Missing customer name -> 400
  const badEvent = { body: JSON.stringify({ customer: { phone: '123' }, items: [], subtotal: 0, fulfillment: {} }) };
  const res2 = await handler(badEvent);
  console.log('TEST 2 (invalid payload):', res2.statusCode, res2.body);
  if (res2.statusCode !== 400) throw new Error('Expected 400');

  // 3. Pickup fulfillment (no tableNumber)
  const pickupEvent = {
    body: JSON.stringify({
      customer: { name: 'Kwabena Asante', phone: '+233 20 111 4477' },
      items: [{ id: 'lamb-tagine', name: 'North African Lamb Tagine', price: 32, quantity: 1 }],
      subtotal: 32,
      fulfillment: { type: 'pickup' },
    }),
  };
  const res3 = await handler(pickupEvent);
  console.log('TEST 3 (pickup order):', res3.statusCode, res3.body);
  if (res3.statusCode !== 201) throw new Error('Expected 201 for pickup order');

  // 4. table type but missing tableNumber -> 400
  const badTableEvent = {
    body: JSON.stringify({
      customer: { name: 'X', phone: '123' },
      items: [{ id: 'a', name: 'A', price: 1, quantity: 1 }],
      subtotal: 1,
      fulfillment: { type: 'table' },
    }),
  };
  const res4 = await handler(badTableEvent);
  console.log('TEST 4 (table w/o tableNumber):', res4.statusCode, res4.body);
  if (res4.statusCode !== 400) throw new Error('Expected 400 for missing tableNumber');

  console.log('\nALL createOrder TESTS PASSED');
}

run().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
