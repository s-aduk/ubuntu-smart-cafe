// lambda/updateOrderStatus/index.js
//
// Handles: PATCH /orders/{orderId}
//
// Matches the request/response contract documented in
// AWS_DEPLOYMENT_GUIDE.md (§2.3). The frontend's updateOrderStatus() in
// src/utils/api.js calls this when the owner changes an order's status in
// OrdersDashboard.jsx. The frontend already updates its own local state
// optimistically, so this handler's response body isn't strictly required
// beyond a 2xx — but it returns { orderId, status } for parity.
//
// Environment variables:
//   TABLE_NAME     - DynamoDB table name (required)
//   ALLOWED_ORIGIN - Value for Access-Control-Allow-Origin (optional,
//                    defaults to '*'). See the CORS note in lambda/README.md.

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.TABLE_NAME;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// Must match the four status strings the frontend's status badge/select
// know how to render (see OrdersDashboard.jsx: STATUS_OPTIONS).
const VALID_STATUSES = ['Pending', 'Preparing', 'Ready', 'Completed'];

exports.handler = async (event) => {
  const orderId = event.pathParameters && event.pathParameters.orderId;
  if (!orderId) {
    return respond(400, { message: 'orderId path parameter is required.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return respond(400, { message: 'Request body must be valid JSON.' });
  }

  const { status } = payload;
  if (!VALID_STATUSES.includes(status)) {
    return respond(400, {
      message: `status must be one of: ${VALID_STATUSES.join(', ')}.`,
    });
  }

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { orderId },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': status },
        // Ensures we return a clean 404 instead of silently creating a
        // new item if the orderId doesn't exist.
        ConditionExpression: 'attribute_exists(orderId)',
      })
    );
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return respond(404, { message: `Order ${orderId} not found.` });
    }
    console.error('Failed to update order status:', err);
    return respond(500, { message: 'Could not update the order. Please try again.' });
  }

  return respond(200, { orderId, status });
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
