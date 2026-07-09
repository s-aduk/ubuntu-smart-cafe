// lambda/createOrder/index.js
//
// Handles: POST /orders
//
// Matches the request/response contract documented in
// AWS_DEPLOYMENT_GUIDE.md (§2.3). The frontend's submitOrder() in
// src/utils/api.js sends the request body exactly as validated below, and
// expects { orderId, status, receivedAt } back.
//
// Environment variables:
//   TABLE_NAME     - DynamoDB table name (required)
//   SES_FROM_EMAIL - Verified SES sender address (optional; if unset,
//                    confirmation emails are skipped entirely)
//   ALLOWED_ORIGIN - Value for Access-Control-Allow-Origin (optional,
//                    defaults to '*'). See the CORS note in lambda/README.md
//                    before enabling CORS in *both* API Gateway and here.

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const VALID_FULFILLMENT_TYPES = ['table', 'pickup'];

exports.handler = async (event) => {
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return respond(400, { message: 'Request body must be valid JSON.' });
  }

  const validationError = validateOrder(payload);
  if (validationError) {
    return respond(400, { message: validationError });
  }

  const { customer, items, subtotal, fulfillment } = payload;

  const orderId = generateOrderId();
  const receivedAt = new Date().toISOString();

  const order = {
    orderId,
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: (customer.email || '').trim(),
    },
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
    })),
    // Stored as `total` so it matches the shape GET /orders returns
    // (see AWS_DEPLOYMENT_GUIDE.md §2.3) — the incoming field is called
    // `subtotal` on the request, `total` from here on at rest and in
    // every response.
    total: Number(subtotal),
    fulfillment:
      fulfillment.type === 'table'
        ? { type: 'table', tableNumber: String(fulfillment.tableNumber).trim() }
        : { type: 'pickup' },
    status: 'Pending',
    receivedAt,
  };

  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: order,
        // Guards against orderId collisions rather than silently overwriting
        // an existing order.
        ConditionExpression: 'attribute_not_exists(orderId)',
      })
    );
  } catch (err) {
    console.error('Failed to write order to DynamoDB:', err);
    return respond(500, { message: 'Could not save the order. Please try again.' });
  }

  // Fire-and-forget: a failed confirmation email should never fail the
  // order itself. The order is already safely in DynamoDB at this point.
  if (order.customer.email && SES_FROM_EMAIL) {
    try {
      await sendConfirmationEmail(order);
    } catch (err) {
      console.error('SES confirmation email failed (order was still saved):', err);
    }
  }

  return respond(201, {
    orderId: order.orderId,
    status: order.status,
    receivedAt: order.receivedAt,
  });
};

function validateOrder(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'Request body is required.';
  }

  const { customer, items, subtotal, fulfillment } = payload;

  if (!customer || typeof customer !== 'object') {
    return 'customer is required.';
  }
  if (!customer.name || typeof customer.name !== 'string' || !customer.name.trim()) {
    return 'customer.name is required.';
  }
  if (!customer.phone || typeof customer.phone !== 'string' || !customer.phone.trim()) {
    return 'customer.phone is required.';
  }

  if (!Array.isArray(items) || items.length === 0) {
    return 'items must be a non-empty array.';
  }
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || typeof item.name !== 'string') {
      return 'Each item requires an id and a name.';
    }
    if (typeof item.price !== 'number' || item.price < 0) {
      return 'Each item requires a non-negative numeric price.';
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      return 'Each item requires a positive numeric quantity.';
    }
  }

  if (typeof subtotal !== 'number' || subtotal < 0) {
    return 'subtotal must be a non-negative number.';
  }

  if (!fulfillment || !VALID_FULFILLMENT_TYPES.includes(fulfillment.type)) {
    return `fulfillment.type must be one of: ${VALID_FULFILLMENT_TYPES.join(', ')}.`;
  }
  if (fulfillment.type === 'table' && !String(fulfillment.tableNumber || '').trim()) {
    return 'fulfillment.tableNumber is required when fulfillment.type is "table".';
  }

  return null;
}

function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

async function sendConfirmationEmail(order) {
  const itemLines = order.items
    .map((item) => `  ${item.quantity} x ${item.name} — $${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const fulfillmentLine =
    order.fulfillment.type === 'table'
      ? `Dine-in at Table ${order.fulfillment.tableNumber}`
      : 'Pickup';

  const bodyText = [
    `Thank you, ${order.customer.name}!`,
    '',
    `Your order ${order.orderId} has been received.`,
    '',
    itemLines,
    '',
    `Total: $${order.total.toFixed(2)}`,
    `Fulfillment: ${fulfillmentLine}`,
    '',
    '— Ubuntu Cafe & Lounge',
  ].join('\n');

  await ses.send(
    new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      Destination: { ToAddresses: [order.customer.email] },
      Message: {
        Subject: { Data: `Ubuntu Cafe & Lounge — Order ${order.orderId} Confirmed` },
        Body: { Text: { Data: bodyText } },
      },
    })
  );
}

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
