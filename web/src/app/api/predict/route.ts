import { NextResponse } from 'next/server';
import { SageMakerRuntimeClient, InvokeEndpointCommand } from "@aws-sdk/client-sagemaker-runtime";


interface SageMakerError extends Error {
    message: string;
    code?: string;
}


const sagemakerClient = new SageMakerRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    }
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Sending data:', JSON.stringify(body));

        const command = new InvokeEndpointCommand({
            EndpointName: process.env.SAGEMAKER_ENDPOINT_NAME as string,
            ContentType: 'application/json',
            Accept: 'application/json',
            Body: new TextEncoder().encode(JSON.stringify(body))
        });

        const response = await sagemakerClient.send(command);
        const responseBody = new TextDecoder().decode(response.Body);
        console.log('Raw response:', responseBody);

        // Parse the response and round to 2 decimal places
        const predictionValue = Number(JSON.parse(responseBody)[0]).toFixed(2);


        const featureImportance = [
            { name: 'Study Hours', importance: 0.20 },
            { name: 'Previous Grade', importance: 0.18 },
            { name: 'Attendance', importance: 0.15 },
            { name: 'Project Score', importance: 0.12 },
            { name: 'Quiz Average', importance: 0.10 },
            { name: 'Tutorial', importance: 0.08 },
            { name: 'Study Group', importance: 0.07 },
            { name: 'Sleep', importance: 0.05 },
            { name: 'Stress', importance: 0.03 },
            { name: 'Extracurricular', importance: 0.02 }
        ];

        return NextResponse.json({
            prediction: Number(predictionValue),
            featureImportance
        });
    } catch (error: unknown) {
        const sageMakerError = error as SageMakerError;
        console.error('Error:', sageMakerError);
        return NextResponse.json({ 
            error: 'Prediction failed', 
            details: sageMakerError.message 
        }, { 
            status: 500 
        });
    }
}