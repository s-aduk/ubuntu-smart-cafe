process.env.TABLE_NAME = 'UbuntuCafeOrders';

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);
const { handler } = require('./index.js');

async function run() {
  // 1. Valid update
  ddbMock.on(UpdateCommand).resolves({});
  const res1 = await handler({
    pathParameters: { orderId: 'ORD-10231' },
    body: JSON.stringify({ status: 'Ready' }),
  });
  console.log('TEST 1 (valid status update):', res1.statusCode, res1.body);
  if (res1.statusCode !== 200) throw new Error('Expected 200');

  // 2. Invalid status value
  const res2 = await handler({
    pathParameters: { orderId: 'ORD-10231' },
    body: JSON.stringify({ status: 'Cancelled' }),
  });
  console.log('TEST 2 (invalid status enum):', res2.statusCode, res2.body);
  if (res2.statusCode !== 400) throw new Error('Expected 400');

  // 3. Missing orderId path param
  const res3 = await handler({ body: JSON.stringify({ status: 'Ready' }) });
  console.log('TEST 3 (missing orderId):', res3.statusCode, res3.body);
  if (res3.statusCode !== 400) throw new Error('Expected 400');

  // 4. Order doesn't exist -> ConditionalCheckFailedException -> 404
  const err = new Error('conditional check failed');
  err.name = 'ConditionalCheckFailedException';
  ddbMock.on(UpdateCommand).rejects(err);
  const res4 = await handler({
    pathParameters: { orderId: 'ORD-NOPE' },
    body: JSON.stringify({ status: 'Ready' }),
  });
  console.log('TEST 4 (nonexistent order):', res4.statusCode, res4.body);
  if (res4.statusCode !== 404) throw new Error('Expected 404');

  console.log('\nALL updateOrderStatus TESTS PASSED');
}

run().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
