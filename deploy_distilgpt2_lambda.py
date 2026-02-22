import boto3

lambda_client = boto3.client('lambda')
apigw_client = boto3.client('apigatewayv2')

# Upload Lambda Layer
with open('layer.zip', 'rb') as f:
    layer_response = lambda_client.publish_layer_version(
        LayerName='distilgpt2-deps',
        Content={'ZipFile': f.read()},
        CompatibleRuntimes=['python3.10']
    )
layer_arn = layer_response['LayerVersionArn']

# Upload Lambda Function
with open('distilgpt2_lambda.zip', 'rb') as f:
    lambda_response = lambda_client.create_function(
        FunctionName='distilgpt2-autofix',
        Runtime='python3.10',
        Role='arn:aws:iam::<your-account-id>:role/<your-lambda-role>',
        Handler='distilgpt2_lambda.lambda_handler',
        Code={'ZipFile': f.read()},
        Layers=[layer_arn],
        Timeout=30,
        MemorySize=2048
    )
function_arn = lambda_response['FunctionArn']

# Create API Gateway
api_response = apigw_client.create_api(
    Name='distilgpt2-autofix-api',
    ProtocolType='HTTP'
)
api_id = api_response['ApiId']

# Create Lambda Integration
integration_response = apigw_client.create_integration(
    ApiId=api_id,
    IntegrationType='AWS_PROXY',
    IntegrationUri=function_arn,
    PayloadFormatVersion='2.0'
)
integration_id = integration_response['IntegrationId']

# Create Route
apigw_client.create_route(
    ApiId=api_id,
    RouteKey='POST /autofix',
    Target=f'integrations/{integration_id}'
)

# Deploy API
apigw_client.create_stage(
    ApiId=api_id,
    StageName='prod',
    AutoDeploy=True
)

print(f"API endpoint: https://{api_id}.execute-api.<region>.amazonaws.com/prod/autofix")
