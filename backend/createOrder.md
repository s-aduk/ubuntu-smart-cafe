# `createOrder.py` — Lambda for `POST /orders`

A Python Lambda function that receives an order from the cafe's frontend, validates the data, recalculates the subtotal server-side (so the client can't manipulate prices), writes the order to a DynamoDB table, and returns a confirmation with the `orderId`.

Triggered by `POST /orders` through API Gateway REST API.

---

## What the Lambda does (step by step)

### 1. Parse the request body

```python
body = json.loads(event.get('body', ''))
```

API Gateway passes the HTTP request body as a JSON string inside `event['body']`. The Lambda parses it into a Python dictionary.

If the body is not valid JSON (e.g. someone sends `not json`), the `json.loads` raises `json.JSONDecodeError` and the Lambda returns a `400` error.

### 2. Validate `customer` and `items`

```python
customer = body.get('customer')
items = body.get('items')
```

Two fields are required at the top level:

- **`customer`** — must be an object with at least `name` and `phone`
- **`items`** — must be a non-empty array of item objects

If either is missing or invalid, the Lambda returns `400` with a descriptive message.

### 3. Validate each item

Every item in the `items` array must have four fields:

| Field | Type | Validation |
|---|---|---|
| `id` | string | Must exist |
| `name` | string | Must exist |
| `price` | number | Must be >= 0 |
| `quantity` | integer | Must be >= 1 |

```python
for item in items:
    if not all(k in item for k in ('id', 'name', 'price', 'quantity')):
        return build_response(400, ...)
    if not isinstance(item['price'], (int, float)) or item['price'] < 0:
        return build_response(400, ...)
    if not isinstance(item['quantity'], int) or item['quantity'] <= 0:
        return build_response(400, ...)
```

If any item fails validation, the entire request is rejected. This prevents malformed data from reaching the database.

### 4. Recalculate subtotal server-side

```python
subtotal = 0
for item in items:
    subtotal += item['price'] * item['quantity']
```

**The `subtotal` sent by the frontend is ignored.** The Lambda calculates it from scratch using the item-level `price` and `quantity` values. This means:

- If a bug in the frontend sends a wrong subtotal, the database still has the correct value.
- A malicious client cannot send `subtotal: 0` for expensive items.
- The frontend's submitted `subtotal` is purely cosmetic for display — the server is the source of truth.

### 5. Build the order document

```python
order = {
    'orderId': f"ORD-{uuid.uuid4().hex[:8].upper()}",
    'customer': customer,
    'items': items,
    'subtotal': subtotal,
    'fulfillment': body.get('fulfillment', {'type': 'pickup'}),
    'status': 'Pending',
    'receivedAt': datetime.now(timezone.utc).isoformat()
}
```

| Field | How it's set | Notes |
|---|---|---|
| `orderId` | `ORD-` + 8 random uppercase hex chars | e.g. `ORD-A3F2B9C1`. Unique per order, generated with `uuid.uuid4()`. |
| `customer` | From request body | Passed through as-is after validation |
| `items` | From request body | Passed through as-is after validation |
| `subtotal` | Recalculated by Lambda | Server-computed, not trusted from client |
| `fulfillment` | From request body | Defaults to `{'type': 'pickup'}` if not provided |
| `status` | Always `'Pending'` | New orders always start in Pending status |
| `receivedAt` | UTC ISO 8601 timestamp | Set at the moment the Lambda runs |

### 6. Write to DynamoDB

```python
table.put_item(Item=order)
```

Writes the order document to the `orderData` DynamoDB table. The table is referenced through an environment variable so the code does not hardcode the table name.

If the write fails (network issue, throttling, insufficient permissions), the exception is caught, logged to CloudWatch, and a `500` response is returned.

### 7. Return the confirmation

```python
return build_response(201, {
    'orderId': order['orderId'],
    'status': order['status'],
    'subtotal': order['subtotal'],
    'receivedAt': order['receivedAt'],
    'message': 'Order received successfully'
})
```

The frontend uses `orderId` and `status` to display on the order confirmation screen. The `subtotal` is returned so the frontend can display the server-verified total.

---

## Expected request format

```json
{
    "customer": {
        "name": "Ama Owusu",
        "phone": "+233 24 555 0182",
        "email": "ama@example.com"
    },
    "items": [
        {
            "id": "jollof-suya",
            "name": "Smoked Jollof Rice with Grilled Suya",
            "price": 28,
            "quantity": 2
        },
        {
            "id": "bissap",
            "name": "West African Bissap",
            "price": 8,
            "quantity": 1
        }
    ],
    "fulfillment": {
        "type": "table",
        "tableNumber": "5"
    }
}
```

Notes on the request:
- `customer.email` is optional
- `fulfillment` is optional — defaults to `{'type': 'pickup'}`
- If `fulfillment.type` is `'table'`, include `tableNumber`

---

## Response format

### 201 — Order created

```json
{
    "orderId": "ORD-68CE48CA",
    "status": "Pending",
    "subtotal": 64,
    "receivedAt": "2026-07-09T09:54:42.646319+00:00",
    "message": "Order received successfully"
}
```

### 400 — Validation error

One of several messages depending on what was wrong:

```json
{ "message": "customer object and a non-empty items array are required" }
{ "message": "customer name and phone are required" }
{ "message": "Each item must have id, name, price, and quantity" }
{ "message": "Invalid price for item 'jollof-suya'" }
{ "message": "Invalid quantity for item 'jollof-suya'" }
{ "message": "Invalid JSON in request body" }
```

### 500 — Server error

```json
{ "message": "Failed to save order" }
```

The error details are logged to CloudWatch. The client only receives a generic message.

---

## CORS

Every response includes the header:

```
Access-Control-Allow-Origin: *
```

The frontend is a static site hosted on S3/CloudFront, which runs on a different origin than the API Gateway URL. Browsers block cross-origin requests unless the server explicitly allows it. This header tells the browser: "any origin is allowed to read this response."

---

## Environment variables

| Variable | Set by | Purpose |
|---|---|---|
| `TABLE_NAME` | CloudFormation `!Ref OrderTable` | Name of the DynamoDB table to write orders into |

The `AWS_REGION` variable is automatically set by the Lambda runtime to the region the function is deployed in. This is used implicitly by `boto3` when connecting to DynamoDB.

---

## Dependencies

Only `boto3` is needed, and it comes pre-installed in the Python 3.13 Lambda runtime. No additional deployment packages or layers are required.

---

## Test results

The Lambda was deployed to eu-north-1 and tested live on 2026-07-09. All scenarios passed:

| Test case | What was sent | Response |
|---|---|---|
| Valid order | Full customer, 2 items, table fulfillment | `201` — subtotal recalculated to `64` (28×2 + 8×1) |
| Missing customer | `{}` | `400` |
| Missing customer name | `{"customer": {"phone": "123"}, "items": [...]}` | `400` |
| Negative price | Item with `price: -5` | `400` |
| Malformed JSON | `not json` | `400` |

The data was also verified directly in DynamoDB using `aws dynamodb get-item`, confirming the full document was written correctly.

---

## Example curl

```bash
curl -X POST https://your-api-id.execute-api.eu-north-1.amazonaws.com/prod/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "Ama Owusu",
      "phone": "+233 24 555 0182"
    },
    "items": [
      { "id": "jollof-suya", "name": "Smoked Jollof Rice", "price": 28, "quantity": 2 },
      { "id": "bissap", "name": "West African Bissap", "price": 8, "quantity": 1 }
    ],
    "fulfillment": { "type": "table", "tableNumber": "5" }
  }'
```

---

## Connecting the frontend

The frontend calls `submitOrder()` in `src/utils/api.js` when a customer places an order. It currently falls back to simulated data because `NEXT_PUBLIC_API_BASE_URL` is not set.

To connect it to this Lambda:

1. Get the `ApiUrl` from the CloudFormation stack outputs:
   ```bash
   aws cloudformation describe-stacks --stack-name ubuntu-cafe-create-order \
     --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
     --output text
   ```
2. Create or edit `.env.local` in the project root:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://a5etjs06r2.execute-api.eu-north-1.amazonaws.com/prod
   ```
3. Restart the dev server (`npm run dev`).

The frontend will now send real `POST /orders` requests to this Lambda instead of using mock data. The order confirmation screen will display the real `orderId` returned by DynamoDB.
