// src/utils/api.js
//
// Single seam between the frontend and the AWS serverless backend.
// Every network call in the app funnels through this file. To go live,
// the infrastructure team sets NEXT_PUBLIC_AWS_API_URL (in the AWS Amplify
// console, or a local .env.local) to the deployed API Gateway invoke URL
// and rebuilds — no other code changes needed.
//
// Intended shape of the backend, once built:
//   API Gateway (REST or HTTP API)
//     POST /orders            -> Lambda (createOrder)  -> DynamoDB.putItem
//                                                        -> (optional) SES confirmation email
//     GET  /orders             -> Lambda (listOrders)   -> DynamoDB.scan / query
//     PATCH /orders/{orderId}  -> Lambda (updateOrderStatus) -> DynamoDB.updateItem
//
// Graceful fallback: if NEXT_PUBLIC_AWS_API_URL is missing, or the request to
// it fails for any reason (offline backend, network error, 5xx, timeout),
// every function below falls back to a simulated response instead of
// breaking the UI. Callers can check the `simulated: true` flag on the
// result to surface an honest "this wasn't really saved yet" notice
// (see useToast() calls in CartPanel.jsx and OrdersDashboard.jsx) rather
// than silently pretending everything succeeded.
const API_URL = process.env.NEXT_PUBLIC_AWS_API_URL || 'YOUR_MOCK_API_FALLBACK';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Request to ${path} failed (${res.status})`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function simulateLatency(ms = 900) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * POST /orders
 *
 * Sends a new order to API Gateway, which invokes the Lambda function that
 * writes it to DynamoDB and (eventually) triggers an Amazon SES confirmation
 * email to the customer.
 *
 * @param {object} orderData
 * @returns {Promise<{orderId: string, status: string, simulated: boolean}>}
 */
export async function submitOrder(orderData) {
  try {
    const result = await request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return { ...result, simulated: false };
  } catch (err) {
    console.warn(
      '[api] submitOrder: AWS backend unreachable, using a simulated response.',
      err.message
    );
    await simulateLatency();
    return {
      orderId: `MOCK-${Date.now().toString(36).toUpperCase()}`,
      status: 'received',
      receivedAt: new Date().toISOString(),
      simulated: true,
    };
  }
}

/**
 * GET /orders
 *
 * Populates the Owner Admin Dashboard from DynamoDB via API Gateway. Falls
 * back to realistic mock orders if the backend isn't reachable yet.
 *
 * @returns {Promise<{orders: Array<object>, simulated: boolean}>}
 */
export async function fetchOrders() {
  try {
    const result = await request('/orders', { method: 'GET' });
    return { orders: result, simulated: false };
  } catch (err) {
    console.warn(
      '[api] fetchOrders: AWS backend unreachable, using mock orders.',
      err.message
    );
    await simulateLatency(700);
    return { orders: MOCK_ORDERS, simulated: true };
  }
}

/**
 * PATCH /orders/{orderId}
 *
 * Updates an order's status (Pending -> Preparing -> Ready -> Completed).
 * Falls back to a locally-accepted update if the backend isn't reachable.
 *
 * @param {string} orderId
 * @param {string} status
 * @returns {Promise<{orderId: string, status: string, simulated: boolean}>}
 */
export async function updateOrderStatus(orderId, status) {
  try {
    const result = await request(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return { ...result, simulated: false };
  } catch (err) {
    console.warn(
      '[api] updateOrderStatus: AWS backend unreachable, updating locally only.',
      err.message
    );
    await simulateLatency(400);
    return { orderId, status, simulated: true };
  }
}

// Sample rows so the Admin Dashboard renders something meaningful before
// the DynamoDB table has real orders in it. Shape mirrors what the real
// GET /orders Lambda is expected to return.
export const MOCK_ORDERS = [
  {
    orderId: 'ORD-10231',
    customer: { name: 'Ama Owusu', phone: '+233 24 555 0182', email: 'ama@example.com' },
    items: [
      { id: 'jollof-suya', name: 'Smoked Jollof Rice with Grilled Suya', price: 28, quantity: 2 },
      { id: 'bissap', name: 'West African Bissap', price: 8, quantity: 2 },
    ],
    fulfillment: { type: 'table', tableNumber: '5' },
    total: 72,
    status: 'Preparing',
    receivedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    orderId: 'ORD-10232',
    customer: { name: 'Kwabena Asante', phone: '+233 20 111 4477', email: 'kwabena@example.com' },
    items: [
      { id: 'lamb-tagine', name: 'North African Lamb Tagine', price: 32, quantity: 1 },
      { id: 'kenyan-espresso', name: 'Kenyan AA Espresso', price: 6, quantity: 1 },
    ],
    fulfillment: { type: 'pickup' },
    total: 38,
    status: 'Pending',
    receivedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    orderId: 'ORD-10229',
    customer: { name: 'Naledi Dlamini', phone: '+27 82 333 9021', email: 'naledi@example.com' },
    items: [
      { id: 'bobotie', name: 'South African Bobotie', price: 26, quantity: 3 },
      { id: 'rooibos-toddy', name: 'Rooibos & Amarula Toddy', price: 13, quantity: 3 },
    ],
    fulfillment: { type: 'table', tableNumber: '2' },
    total: 117,
    status: 'Ready',
    receivedAt: new Date(Date.now() - 1000 * 60 * 26).toISOString(),
  },
  {
    orderId: 'ORD-10225',
    customer: { name: 'Tendai Moyo', phone: '+263 77 222 6610', email: 'tendai@example.com' },
    items: [
      { id: 'injera-platter', name: 'Ethiopian Injera Platter', price: 30, quantity: 1 },
      { id: 'akara', name: 'Akara Fritters', price: 11, quantity: 1 },
    ],
    fulfillment: { type: 'pickup' },
    total: 41,
    status: 'Completed',
    receivedAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
  },
];
