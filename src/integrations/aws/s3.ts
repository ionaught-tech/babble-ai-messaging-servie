import {
    PutObjectCommandInput,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";

export const uploadS3 = async (uploadParams: PutObjectCommandInput) => {
    const s3 = new S3Client({
        region: "ap-south-1",
        requestChecksumCalculation: "WHEN_REQUIRED",
    });
    const command = new PutObjectCommand(uploadParams);
    return await s3.send(command);
};