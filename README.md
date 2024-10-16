# Tweet Lambda

This AWS Lambda function generates and posts tweets using the `ai-tweet-gen` library and AWS Secrets Manager for secure storage of API keys.

## Project Structure

```sh
.
├── src
│   ├── handlers
│   │   └── tweet-lambda.ts
├── .gitignore
├── package.json
├── README.md
├── serverless.yml
├── yarn.lock
```

## Prerequisites

- [Node.js 20.x](https://nodejs.org/en/download/package-manager)
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate permissions
- [Serverless Framework](https://www.serverless.com/)

## Setup

1. **Install Dependencies**

   ```sh
    yarn install
   ```

2. **Configure AWS Secrets Manager**

   Create a new secret with the following key-value pairs:

   - `TWITTER_APP_KEY`
   - `TWITTER_APP_SECRET`
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_SECRET`

3. **Configure Serverless Framework**

Update the `provider` section in `serverless.yml` with your AWS account ID and region.

```yml
    org: <your-serverless-org-name>
    app: <your-serverless-app-name>
    service: <your-lambda-name>

    provider:
      name: aws
      runtime: nodejs20.x
      stage: dev
      region: ap-south-1

    iam:
      role:
        statements:
          - Effect: Allow
            Action:
              - secretsmanager:GetSecretValue
            Resource:
              - <YOUR_SECRET_MANAGER_ARN>
    functions:
      hello:
        handler: src/handlers/tweet-lambda.tweetHandler
        events:
          - http:
              path: tweet
              method: get
```

## Deployment

```sh
serverless deploy
```

## Usage

The Lambda function is triggered via API Gateway. It generates a tweet using the `generatePostGemini` function and posts it to Twitter using the `postToX` function.

### Example Request

```sh
curl -X GET https://<api-id>.execute-api.<region>.amazonaws.com/dev/tweet
```

### Example Response

```json
{
  "statusCode": 200,
  "body": "{\"message\":\"Tweet posted successfully!\"}"
}
```

## License

This project is open source and available under the [MIT License](LICENSE).
