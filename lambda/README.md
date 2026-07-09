# Lambda Functions — Ubuntu Cafe & Lounge

Three Node.js Lambda handlers implementing the backend contract documented
in `../AWS_DEPLOYMENT_GUIDE.md` (§2.3 Data Contract Specifications). Each
folder is a **self-contained, independently deployable** function — no
shared code or Lambda Layer required.

```
lambda/
├── createOrder/          POST   /orders
├── listOrders/            GET    /orders
└── updateOrderStatus/      PATCH  /orders/{orderId}
```

Each has been tested locally against a mocked DynamoDB client (see
`test.js` in each folder) — run `npm install && npm test` in any of them to
verify the logic yourself before deploying.

## Prerequisites

- Node.js 20.x (matches the recommended Lambda runtime)
- A DynamoDB table (see schema below)
- An IAM execution role per function, scoped as described below
- (Optional, `createOrder` only) an SES sending identity, if you want
  confirmation emails

## DynamoDB Table

| | |
|---|---|
| Table name | `UbuntuCafeOrders` (or your choice — set via `TABLE_NAME`) |
| Partition key | `orderId` (String) |
| Billing mode | On-Demand recommended |

Item shape written by `createOrder` / read by `listOrders`:

```json
{
  "orderId": "ORD-MRDW0638-WLO6",
  "customer": { "name": "...", "phone": "...", "email": "..." },
  "items": [{ "id": "...", "name": "...", "price": 28, "quantity": 2 }],
  "total": 72,
  "fulfillment": { "type": "table", "tableNumber": "5" },
  "status": "Pending",
  "receivedAt": "2026-07-09T19:15:49.076Z"
}
```

## Deploying Each Function

For each of the three folders:

```bash
cd lambda/createOrder        # (or listOrders / updateOrderStatus)
npm install --omit=dev        # production deps only — skips aws-sdk-client-mock
zip -r function.zip .          # includes index.js, package.json, node_modules
```

Then either:
- **AWS Console:** Lambda → Create function → Author from scratch → Node.js
  20.x → upload `function.zip`
- **AWS CLI:**
  ```bash
  aws lambda create-function \
    --function-name ubuntu-cafe-create-order \
    --runtime nodejs20.x \
    --handler index.handler \
    --role arn:aws:iam::<ACCOUNT_ID>:role/<EXECUTION_ROLE_NAME> \
    --zip-file fileb://function.zip
  ```

Repeat for `listOrders` and `updateOrderStatus`, adjusting the function
name, handler folder, and IAM role each time.

## Environment Variables

| Function | Variable | Required | Notes |
|----------|----------|----------|-------|
| All three | `TABLE_NAME` | Yes | DynamoDB table name |
| All three | `ALLOWED_ORIGIN` | No | CORS header value, defaults to `*` — see CORS note below |
| `createOrder` | `SES_FROM_EMAIL` | No | Verified SES sender address. If unset, confirmation emails are skipped entirely (order creation still succeeds) |

## IAM Policies (least privilege, one per function)

Replace `<REGION>`, `<ACCOUNT_ID>` with real values. Each policy is scoped
to this one table's ARN — avoid `dynamodb:*` or wildcard resources.

**`createOrder` execution role:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem"],
      "Resource": "arn:aws:dynamodb:<REGION>:<ACCOUNT_ID>:table/UbuntuCafeOrders"
    },
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    }
  ]
}
```
> Omit the `ses:SendEmail` statement entirely if you aren't using SES yet.
> Scope its `Resource` to your verified identity ARN once you have one,
> rather than leaving it as `*`.

**`listOrders` execution role:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:Scan"],
      "Resource": "arn:aws:dynamodb:<REGION>:<ACCOUNT_ID>:table/UbuntuCafeOrders"
    }
  ]
}
```

**`updateOrderStatus` execution role:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:UpdateItem"],
      "Resource": "arn:aws:dynamodb:<REGION>:<ACCOUNT_ID>:table/UbuntuCafeOrders"
    }
  ]
}
```

All three roles also need the standard
`AWSLambdaBasicExecutionRole` managed policy attached, for CloudWatch Logs.

## API Gateway Route Mapping

| Route | Method | Lambda |
|-------|--------|--------|
| `/orders` | `POST` | `createOrder` |
| `/orders` | `GET` | `listOrders` |
| `/orders/{orderId}` | `PATCH` | `updateOrderStatus` |

Use Lambda proxy integration on an HTTP API for all three.

## ⚠️ CORS: pick one place, not both

Each handler already returns `Access-Control-Allow-Origin` in its response
headers (defaulting to `*`, overridable via `ALLOWED_ORIGIN`). If you
**also** enable native CORS on the HTTP API routes in API Gateway, you can
end up with duplicate or conflicting CORS headers on some setups.

Pick one:
- **Simplest:** leave CORS off in API Gateway and rely on the headers each
  Lambda already returns (works out of the box, no extra config)
- **Or:** enable CORS in API Gateway and remove the
  `Access-Control-Allow-Origin` line from each function's `respond()`
  helper

Either is fine — just don't do both without checking the resulting
response headers in the browser network tab first.

## Verifying Against the Frontend

Once deployed, set `NEXT_PUBLIC_AWS_API_URL` to the API Gateway invoke URL
(see `AWS_DEPLOYMENT_GUIDE.md` Phase B) and confirm:
- Placing an order on `/order` no longer shows the "AWS Backend Offline"
  toast, and the new item appears in the DynamoDB table
- `/admin` lists that real order instead of the built-in mock data
- Changing an order's status in `/admin` persists after a page refresh
