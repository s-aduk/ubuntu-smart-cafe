# Amazon SES Email Notification Integration

## Overview

This document explains the integration of **Amazon Simple Email Service (SES)** into the Ubuntu Cafe & Lounge serverless ordering system.

The purpose of this integration is to automatically send order confirmation emails to customers after their order has been successfully saved in DynamoDB.

## Architecture

Before SES integration:

```
Customer
   |
   v
API Gateway
   |
   v
Lambda (createOrder)
   |
   v
DynamoDB
```

After SES integration:

```
Customer
   |
   v
API Gateway
   |
   v
Lambda (createOrder)
   |
   +----------------+
   |                |
   v                v
DynamoDB          Amazon SES
(Store Order)     (Send Email)
                    |
                    v
             Customer Email
```

---

# SES Configuration Steps

## 1. Verify Email Identity

Amazon SES requires a verified sender identity before emails can be sent.

A sender identity can be:

* Email address (recommended for testing)
* Domain (recommended for production)

Example:

```
FROM_EMAIL=verified-email@example.com
```

Steps:

1. Open AWS Console
2. Navigate to Amazon SES
3. Select the deployment region
4. Go to:

```
SES → Configuration → Verified identities
```

5. Create identity
6. Select Email address
7. Verify the email through the confirmation link sent by AWS

---

# 2. SES Sandbox Environment

New SES accounts start in sandbox mode.

In sandbox mode:

* Sender email must be verified
* Recipient email must also be verified

Example:

```
Sender:
ubuntu-cafe@example.com ✅

Recipient:
customer@example.com ✅
```

For production usage:

Request production access from:

```
SES → Account dashboard → Request production access
```

Recommended sending type:

```
Transactional emails
```

Use case:

```
Sending customer order confirmation emails after online purchases.
```

---

# 3. IAM Permissions

The Lambda execution role requires permission to send emails through SES.

The following permissions are added:

```yaml
ses:SendEmail
ses:SendRawEmail
```

Example IAM policy:

```yaml
- Effect: Allow
  Action:
    - ses:SendEmail
    - ses:SendRawEmail
  Resource: "*"
```

The Lambda role now has:

```
Lambda Execution Role

├── DynamoDB PutItem
│
└── SES SendEmail
```

---

# 4. Lambda Environment Variables

The Lambda function requires the verified sender email.

CloudFormation configuration:

```yaml
Environment:
  Variables:
    TABLE_NAME: !Ref OrderTable
    FROM_EMAIL: your-verified-email@example.com
```

Variables:

| Variable   | Purpose                             |
| ---------- | ----------------------------------- |
| TABLE_NAME | DynamoDB table used to store orders |
| FROM_EMAIL | Verified SES sender address         |

---

# 5. Lambda SES Integration

The Lambda creates an SES client:

```python
ses = boto3.client('ses')
```

After successfully saving an order:

```python
table.put_item(Item=order)
```

Lambda sends an email:

```python
ses.send_email(
    Source=os.environ['FROM_EMAIL'],
    Destination={
        'ToAddresses': [
            customer['email']
        ]
    },
    Message={
        'Subject': {
            'Data': 'Ubuntu Cafe Order Confirmation'
        }
    }
)
```

---

# Email Flow

When a customer places an order:

1. API Gateway receives the request

2. Lambda validates:

   * Customer information
   * Items
   * Quantity
   * Prices

3. Lambda calculates the subtotal

4. Order is saved:

```
DynamoDB
 |
 └── orderData
       |
       └── ORD-XXXXXXXX
```

5. Lambda sends confirmation email using SES

6. API returns:

```json
{
    "message": "Order received successfully"
}
```

---

# Error Handling

Email delivery failure does not fail the order.

The Lambda separates DynamoDB and SES operations.

Example:

```
DynamoDB ✅
SES ❌

Result:
Order saved successfully
Email failure logged in CloudWatch
```

This prevents customers from receiving incorrect messages that their order failed.

---

# Testing

Example request:

```json
{
    "customer": {
        "name": "Blessing Osarmwense",
        "phone": "+233245550182",
        "email": "customer@example.com"
    },
    "items": [
        {
            "id": "coffee",
            "name": "Coffee",
            "price": 10,
            "quantity": 2
        }
    ]
}
```

Expected:

DynamoDB:

```
Order saved
```

SES:

```
Ubuntu Cafe Order Confirmation
```

Customer receives:

```
Hello Blessing,

Your order has been received.

Order ID: ORD-XXXXXXXX
Total: ₦20
Status: Pending
```

---

# Deployment

Deploy CloudFormation changes:

```bash
aws cloudformation deploy \
--template-file template.yaml \
--stack-name ubuntu-cafe-create-order \
--capabilities CAPABILITY_IAM \
--region eu-north-1
```

---

# Technologies Used
* Amazon SES
* AWS CloudFormation
* Python
* Boto3

---

# Future Improvements

Possible improvements:

* Move email sending to an asynchronous architecture using Amazon SQS
* Use Amazon EventBridge for order event
* Monitor SES metrics using CloudWatch

---

## Author

Ubuntu Cafe & Lounge Serverless Ordering System

