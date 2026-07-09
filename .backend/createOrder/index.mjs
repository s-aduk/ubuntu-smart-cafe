import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "Orders";

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);

        const orderId = `ORD-${Date.now()}`;

        const order = {
            orderId,
            customer: body.customer,
            items: body.items,
            subtotal: body.subtotal,
            fulfillment: body.fulfillment,
            status: "Pending",
            receivedAt: new Date().toISOString()
        };

        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: order
            })
        );

        return {
            statusCode: 201,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                orderId,
                status: order.status,
                receivedAt: order.receivedAt
            })
        };

    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Failed to create order",
                error: error.message
            })
        };
    }
};