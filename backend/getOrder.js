// Import individual components from the DynamoDB client package
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: 'eu-north-1' });
const ddb = DynamoDBDocumentClient.from(ddbClient);

async function handler(event) {
    // Extract orderId safely from the API Gateway event paths or query params
    const orderId = event.pathParameters?.orderId || event.queryStringParameters?.orderId;
    
    if (!orderId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing orderId parameter" }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }

    const params = {
        TableName: 'orderData',
        Key: { orderId }
    };

    try {
        const command = new GetCommand(params);
        const { Item } = await ddb.send(command);
        if (Item) {
            return {
                statusCode: 200,
                body: JSON.stringify(Item),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*' // Prevents browser CORS blocks
                }
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "No order data found" }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }
    } catch (err) {
        console.error("Unable to retrieve data:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to retrieve order data" }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
}

export { handler };