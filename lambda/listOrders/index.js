// lambda/listOrders/index.js
//
// Handles: GET /orders
//
// Matches the response contract documented in AWS_DEPLOYMENT_GUIDE.md
// (§2.3) — returns an array of order objects. The frontend's
// fetchOrders() in src/utils/api.js populates the Owner Admin Dashboard
// (OrdersDashboard.jsx) directly from this response.
//
// Environment variables:
//   TABLE_NAME     - DynamoDB table name (required)
//   ALLOWED_ORIGIN - Value for Access-Control-Allow-Origin (optional,
//                    defaults to '*'). See the CORS note in lambda/README.md.
//
// Note: this uses a table Scan, which is fine at café scale but doesn't
// paginate or filter server-side. If the order volume grows enough that a
// full-table scan becomes slow or expensive, add a Global Secondary Index
// (e.g. on `status` or a coarse date bucket) and switch this to a Query.

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.TABLE_NAME;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

exports.handler = async () => {
  let items = [];
  let lastEvaluatedKey;

  try {
    // Paginate through the full scan — a single Scan call caps out at 1MB,
    // which is fine for a while but shouldn't silently drop orders once
    // the table grows.
    do {
      const result = await ddb.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );
      items = items.concat(result.Items || []);
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);
  } catch (err) {
    console.error('Failed to scan orders table:', err);
    return respond(500, { message: 'Could not load orders. Please try again.' });
  }

  items.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));

  return respond(200, items);
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    },
    body: JSON.stringify(body),
  };
}
