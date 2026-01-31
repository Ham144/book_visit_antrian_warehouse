import { Expose } from "class-transformer";


export class ResponseChatDto {
    @Expose()
    settingName: string;
    @Expose()
    inUse:       boolean
    @Expose()
    createdById: String
    //:setting
    @Expose()
    activeAuthentication: string
    @Expose()
    createdAt:   string
    @Expose()
    updatedAt:   string
}