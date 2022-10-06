import {ApiProperty} from '@nestjs/swagger'

export class UploadAvatarDto{
    @ApiProperty({ description: "Image file to upload. (jpg, jpeg or png... not more than 5MB)"})
    file: Buffer;
}