// src/utils/api.js
//
// Single seam between the frontend and the AWS serverless backend.
// Every network call in the app funnels through this file, so wiring up
// the real infrastructure later is a one-line change: set
// NEXT_PUBLIC_API_BASE_URL to the deployed API Gateway invoke URL.
//
// Intended shape of the backend, once built:
//   API Gateway (REST or HTTP API)
//     POST /orders  -> Lambda (createOrder)  -> DynamoDB.putItem
//                                             -> (optional) SES confirmation email
//     GET  /orders  -> Lambda (listOrders)   -> DynamoDB.scan / query
//     PATCH /orders/{orderId} -> Lambda (updateOrderStatus) -> DynamoDB.updateItem
//
// Until that API Gateway URL exists, every function below falls back to a
// simulated response (with a realistic delay) so the full loading ->
// success UI flow can be built and demoed end-to-end today.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, options = {}) {
  if (!API_BASE_URL) {
    // No infrastructure deployed yet — signal callers to use their fallback.
    throw new ApiError('NEXT_PUBLIC_API_BASE_URL is not configured.', 0);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed (${res.status})`, res.status);
  }

  // 204 No Content, etc.
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
 * @param {{name: string, phone: string, email: string}} orderData.customer
 * @param {Array<{id: string, name: string, price: number, quantity: number}>} orderData.items
 * @param {number} orderData.subtotal
 * @param {{type: 'table' | 'pickup', tableNumber?: string}} orderData.fulfillment
 * @returns {Promise<{orderId: string, status: string}>}
 */
export async function submitOrder(orderData) {
  try {
    return await request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  } catch (err) {
    console.warn(
      '[api] submitOrder: no backend configured yet, using a simulated response.',
      err.message
    );
    await simulateLatency();
    return {
      orderId: `MOCK-${Date.now().toString(36).toUpperCase()}`,
      status: 'received',
      receivedAt: new Date().toISOString(),
    };
  }
}

/**
 * GET /orders
 *
 * Populates the Owner Admin Dashboard. Once the backend exists, this reads
 * live rows out of DynamoDB via API Gateway. Until then, it resolves with
 * realistic mock data so the dashboard UI can be fully built and tested.
 *
 * @returns {Promise<Array<Order>>}
 */
export async function fetchOrders() {
  try {
    return await request('/orders', { method: 'GET' });
  } catch (err) {
    console.warn(
      '[api] fetchOrders: no backend configured yet, using mock orders.',
      err.message
    );
    await simulateLatency(700);
    return MOCK_ORDERS;
  }
}

/**
 * PATCH /orders/{orderId}
 *
 * Updates an order's status (e.g. Pending -> Preparing -> Ready ->
 * Completed). Until the backend exists, the admin dashboard applies this
 * change to its local state only.
 *
 * @param {string} orderId
 * @param {string} status
 */
export async function updateOrderStatus(orderId, status) {
  try {
    return await request(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    console.warn(
      '[api] updateOrderStatus: no backend configured yet, updating locally only.',
      err.message
    );
    await simulateLatency(400);
    return { orderId, status };
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
