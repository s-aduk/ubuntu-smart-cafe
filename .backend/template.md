# `template.yaml` — CloudFormation Stack for `POST /orders`

A raw CloudFormation template (no SAM transform) that deploys everything needed to accept and store orders: a DynamoDB table, a Python Lambda function, an IAM role, and an API Gateway REST API.

When deployed, it creates a live endpoint at:

```
POST https://{api-id}.execute-api.{region}.amazonaws.com/prod/orders
```

---

## What each resource does

### `OrderTable` — DynamoDB Table

The database where every order is stored.

```
Table name:  orderData
Primary key: orderId (String, HASH key)
Billing:     PAY_PER_REQUEST
```

- **Why `orderId` as HASH key?** Each order has a unique ID. The front-end generates display-friendly IDs like `ORD-A3F2B9C1`, and DynamoDB uses this key for direct lookups (`GetItem`).
- **Why `PAY_PER_REQUEST`?** For a single cafe, traffic is unpredictable and low-volume. Pay-per-request means no capacity planning — you pay only for the reads and writes you actually use. Switch to provisioned capacity if traffic becomes consistent and high-volume.

---

### `LambdaExecutionRole` — IAM Role

An IAM role that gives the Lambda function the minimum permissions it needs.

**Trust policy:** Allows the Lambda service (`lambda.amazonaws.com`) to assume this role.

**Permissions attached:**
1. **`AWSLambdaBasicExecutionRole`** (AWS managed policy) — allows the Lambda to write logs to CloudWatch. Without this, you cannot debug errors.
2. **Inline policy — `DynamoDBWrite`** — allows `dynamodb:PutItem` on the `OrderTable` only.

**Why only `PutItem`?** This Lambda only writes orders. It doesn't need `GetItem`, `Scan`, `DeleteItem`, or any other DynamoDB action. Scoping the policy to exactly one action follows the principle of least privilege: if the function is compromised, an attacker can only write to one table and cannot read or delete existing data.

---

### `CreateOrderFunction` — Lambda Function

The actual code that runs when `POST /orders` is called.

| Property | Value | Why |
|---|---|---|
| **FunctionName** | `ubuntu-cafe-create-order` | Human-readable name in the AWS console |
| **Runtime** | `python3.13` | Latest Python runtime as of 2026 |
| **Handler** | `index.handler` | See note below |
| **Code** | `ZipFile` (inline) | The Python source is embedded directly in the template — no S3 bucket needed |
| **Env var** | `TABLE_NAME: !Ref OrderTable` | Passes the DynamoDB table name to the code at deploy time |

**Why is the handler `index.handler`?** CloudFormation's `ZipFile` property always saves the inline code as `index.py` inside the Lambda deployment package, regardless of what the source file is named on disk. The handler must match the filename and function name, so it becomes `index.handler`.

**How environment variables work:** `!Ref OrderTable` resolves to the physical name of the DynamoDB table (`orderData`) when CloudFormation creates the stack. The Lambda reads this at runtime via `os.environ['TABLE_NAME']`. This means the code never hardcodes the table name — if you delete and recreate the stack, the Lambda automatically gets the new table name.

---

### `LambdaInvokePermission` — Resource Policy

By default, no one can invoke a Lambda function except through the AWS console or CLI. API Gateway needs explicit permission.

This resource grants API Gateway permission to invoke the Lambda, but only for:
- **Principal**: `apigateway.amazonaws.com`
- **SourceArn**: `arn:aws:execute-api:{region}:{account}:{api-id}/*/POST/orders`

The `SourceArn` ensures that only `POST /orders` on this specific API can trigger the function. A different API or a different endpoint on the same API cannot invoke it.

---

### `OrdersApi` — REST API

The HTTP endpoint definition.

| Property | Value |
|---|---|
| **Name** | `UbuntuCafeOrders` |
| **Type** | REST API (not HTTP API) |
| **Endpoint** | `REGIONAL` |

**REST API vs HTTP API:** REST API gives more control over integration responses, method responses, and deployments. The extra features come at a slightly higher cost, but for a production cafe ordering system, the control is worth it.

**REGIONAL vs EDGE:** A regional endpoint serves traffic from a single AWS region. An edge-optimized endpoint uses CloudFront points of presence (POPs) to serve traffic globally. For a single-location cafe in one country, a regional endpoint is simpler and cheaper.

**Resource tree:**

```
/                  (root — no method defined here)
└── /orders        (OrdersResource — POST method defined)
```

The `POST` method is defined directly on `/orders`, not on a child resource. This is simpler than using `/{orderId}` (which would be needed for `GET /orders/{orderId}` or `PATCH /orders/{orderId}`).

---

### `CreateOrderMethod` — API Gateway Method

Defines how `POST /orders` behaves.

**Integration type:** `AWS_PROXY` — the entire HTTP request (headers, body, query params) is passed directly to the Lambda as the `event` object. The Lambda's response is sent back to the caller as-is. No mapping templates, no transformations, no data loss. This is the simplest integration type and works well for JSON APIs.

**Integration HTTP method:** `POST` — API Gateway always uses `POST` to invoke a Lambda, even if the frontend calls the API with `GET` or `PATCH`. This is an internal detail and does not affect the external API contract.

**Method responses:** Defined for `201`, `400`, and `500` to match what the Lambda returns. These are optional for `AWS_PROXY` (API Gateway passes through whatever the Lambda returns), but defining them makes the API contract explicit in the template.

---

### `ApiDeployment` — API Deployment

Publishes the API configuration so it is accessible at a public URL.

**Depends on:** `CreateOrderMethod` — ensures the method is created before the deployment runs. Without this, the deployment might try to publish before the `POST /orders` method exists.

**Stage name:** Set by the `StageName` parameter (default: `prod`). The stage becomes part of the URL path: `/prod/orders`.

Every time you modify the API (add a method, change a resource), you need to create a new deployment. CloudFormation handles this automatically when the template changes.

---

## Parameters

| Parameter | Default | Description |
|---|---|---|
| `StageName` | `prod` | The API Gateway stage name (appears in the URL as `/{stage}/orders`) |

---

## Outputs

After the stack is created, CloudFormation returns these values:

| Output | What it contains | How to use |
|---|---|---|
| `ApiUrl` | `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}` | Set as `NEXT_PUBLIC_API_BASE_URL` in the frontend's `.env.local` |
| `OrderTableName` | `orderData` | Use for direct DynamoDB queries in the CLI or console |
| `CreateOrderFunctionArn` | `arn:aws:lambda:...:function:ubuntu-cafe-create-order` | Reference for CloudWatch alarms, monitoring, or cross-stack references |

---

## How to deploy

```bash
aws cloudformation deploy \
  --template-file backend/template.yaml \
  --stack-name ubuntu-cafe-create-order \
  --capabilities CAPABILITY_IAM \
  --region eu-north-1
```

| Flag | Why it's needed |
|---|---|
| `--template-file` | Path to the CloudFormation template |
| `--stack-name` | Name used to identify the stack in the AWS console |
| `--capabilities CAPABILITY_IAM` | Required because the template creates IAM resources (roles, policies). CloudFormation will not create IAM resources without explicit acknowledgement. |
| `--region` | Deploy to eu-north-1 (Stockholm). Change this to your preferred region. |

After deployment succeeds, copy the `ApiUrl` output and add it to the frontend:

```
NEXT_PUBLIC_API_BASE_URL=https://a5etjs06r2.execute-api.eu-north-1.amazonaws.com/prod
```

The frontend calls `submitOrder()` in `src/utils/api.js` — once `NEXT_PUBLIC_API_BASE_URL` is set, it stops using mock data and sends real requests to this API.

---

## How the resources connect

```
Browser / Frontend
       │
       │  POST /orders
       │  { customer, items, fulfillment }
       ▼
┌─────────────────────────────────────────┐
│  API Gateway                            │
│  ┌─────────────────────────────────┐   │
│  │  POST /orders                   │   │
│  │  Integration: AWS_PROXY         │   │
│  │  Passes full request to Lambda  │   │
│  └────────────┬────────────────────┘   │
└───────────────┼─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Lambda (CreateOrderFunction)           │
│  ┌─────────────────────────────────┐   │
│  │  1. Parse JSON from body        │   │
│  │  2. Validate customer + items   │   │
│  │  3. Recalculate subtotal        │   │
│  │  4. Generate orderId            │   │
│  │  5. Build order document        │   │
│  │  6. table.put_item() → DynamoDB │   │
│  │  7. Return 201 confirmation     │   │
│  └────────────┬────────────────────┘   │
└───────────────┼─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  DynamoDB (OrderTable)                  │
│  Table: orderData                       │
│  Key:   orderId (HASH)                  │
│  Item:  full order document             │
└─────────────────────────────────────────┘
                │
                ▼
Response: 201
{ orderId, status, subtotal, receivedAt, message }
```
