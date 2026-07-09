process.env.TABLE_NAME = 'UbuntuCafeOrders';

const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const ddbMock = mockClient(DynamoDBDocumentClient);

const sampleOrders = [
  { orderId: 'ORD-A', status: 'Pending', total: 10, receivedAt: '2026-07-09T10:00:00.000Z' },
  { orderId: 'ORD-B', status: 'Ready', total: 20, receivedAt: '2026-07-09T12:00:00.000Z' },
  { orderId: 'ORD-C', status: 'Preparing', total: 30, receivedAt: '2026-07-09T11:00:00.000Z' },
];

ddbMock.on(ScanCommand).resolves({ Items: sampleOrders });

const { handler } = require('./index.js');

async function run() {
  const res = await handler();
  console.log('STATUS:', res.statusCode);
  const body = JSON.parse(res.body);
  console.log('ORDER IDS IN RETURNED ORDER:', body.map((o) => o.orderId));
  if (res.statusCode !== 200) throw new Error('Expected 200');
  if (body.length !== 3) throw new Error('Expected 3 orders');
  // newest first: ORD-B (12:00) should be first
  if (body[0].orderId !== 'ORD-B') throw new Error('Expected ORD-B first (newest)');
  console.log('\nALL listOrders TESTS PASSED');
}

run().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
