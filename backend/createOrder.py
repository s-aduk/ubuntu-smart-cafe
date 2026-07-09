import json
import uuid
import os
import boto3
from datetime import datetime, timezone

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

ses = boto3.client(
    'ses',
    region_name=os.environ['AWS_REGION']
)


def build_response(status_code, body):
    return {
        'statusCode': status_code,
        'body': json.dumps(body),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }


def handler(event, context):
    try:
        body = json.loads(event.get('body', ''))
    except (json.JSONDecodeError, TypeError):
        return build_response(400, {'message': 'Invalid JSON in request body'})

    customer = body.get('customer')
    items = body.get('items')

    if not customer or not isinstance(items, list) or len(items) == 0:
        return build_response(400, {
            'message': 'customer object and a non-empty items array are required'
        })

    if not customer.get('name') or not customer.get('phone'):
        return build_response(400, {
            'message': 'customer name and phone are required'
        })

    subtotal = 0
    for item in items:
        if not all(k in item for k in ('id', 'name', 'price', 'quantity')):
            return build_response(400, {
                'message': 'Each item must have id, name, price, and quantity'
            })
        if not isinstance(item['price'], (int, float)) or item['price'] < 0:
            return build_response(400, {
                'message': f"Invalid price for item '{item.get('id')}'"
            })
        if not isinstance(item['quantity'], int) or item['quantity'] <= 0:
            return build_response(400, {
                'message': f"Invalid quantity for item '{item.get('id')}'"
            })
        subtotal += item['price'] * item['quantity']

    order = {
        'orderId': f"ORD-{uuid.uuid4().hex[:8].upper()}",
        'customer': customer,
        'items': items,
        'subtotal': subtotal,
        'fulfillment': body.get('fulfillment', {'type': 'pickup'}),
        'status': 'Pending',
        'receivedAt': datetime.now(timezone.utc).isoformat()
    }
try:
    table.put_item(Item=order)

except Exception as e:
    print(f"DynamoDB put_item failed: {e}")
    return build_response(
        500,
        {
            'message': 'Failed to save order'
        }
    )


# Send confirmation email
try:
    if customer.get('email'):

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
                },
                'Body': {
                    'Text': {
                        'Data': (
                            f"Hello {customer['name']},\n\n"
                            f"Your order has been received.\n\n"
                            f"Order ID: {order['orderId']}\n"
                            f"Total: ₦{order['subtotal']}\n"
                            f"Status: {order['status']}\n\n"
                            "Thank you for choosing Ubuntu Cafe & Lounge."
                        )
                    }
                }
            }
        )

except Exception as e:
    print(f"SES email failed: {e}")


return build_response(201, {
        'orderId': order['orderId'],
        'status': order['status'],
        'subtotal': order['subtotal'],
        'receivedAt': order['receivedAt'],
        'message': 'Order received successfully'

             })
