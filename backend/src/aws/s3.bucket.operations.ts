import {S3} from 'aws-sdk'


export class S3BucketOperations {


    // this method uploads a file to the Elixir.io bucket
    /**
     * It uploads a file to an S3 bucket
     * @param {Buffer} body - The image file that we want to upload.
     * @param {string} fileName - The name of the file that will be saved in S3.
     * @returns A promise
     */
    async uploadProfileAvatar(body: Buffer, fileName: string) {
        const bucket = process.env.S3_BUCKET

        const s3 = new S3()
        const params = {Bucket: bucket, Key: fileName, Body: body}
        return s3.upload(params).promise()
    }


    /**
     * It deletes a profile avatar from S3
     * @param {string} fileName - The name of the file to be deleted.
     */
    async deleteProfileAvatar(fileName: string) {
        const bucket = process.env.S3_BUCKET

        const s3 = new S3()
        const params = {Bucket: bucket, Key: fileName}
        s3.deleteObject(params).promise()
    }
}