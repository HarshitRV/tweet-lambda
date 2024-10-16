import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreatePostResponse, postToX } from 'ai-tweet-gen';
import { generatePostGemini } from 'ai-tweet-gen';
import { GetSecretValueCommand, GetSecretValueCommandOutput, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

const getSecrets = async (): Promise<GetSecretValueCommandOutput> => {
    const secretName = "tweet-lambda" as const;
    const region = "ap-south-1" as const;

    const client = new SecretsManagerClient({
        region
    });

    try {
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
            })
        );

        return JSON.parse(response.SecretString || "");
    } catch (error) {
        throw error;
    }
}

const generateTweet = async (): Promise<CreatePostResponse> => {
    const secret = await getSecrets();

    const tweet = await generatePostGemini({
        apiKey: secret['GEMINI_API_KEY'],
    })

    if (!tweet) {
        throw new Error("Failed to generate tweet");
    }

    const response = await postToX({
        postContent: tweet,
        twitterClientConfigs: {
            appKey: secret['TWITTER_APP_KEY'],
            appSecret: secret['TWITTER_APP_SECRET'],
            accessToken: secret['TWITTER_ACCESS_TOKEN'],
            accessSecret: secret['TWITTER_ACCESS_SECRET']
        }
    })

    if (!response) {
        throw new Error("Failed to post tweet");
    }

    return response
}

export const tweetHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const result = await generateTweet();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Tweet posted: ${result.text}`,
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error posting tweet',
            }),
        };
    }
};