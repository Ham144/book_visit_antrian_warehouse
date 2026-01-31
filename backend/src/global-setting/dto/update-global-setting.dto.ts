import { IsArray, IsString } from "class-validator";


export class updateGlobalSettingDto {
    settingName: string;
    inUse:       boolean
    createdById: String
    //:setting
    @IsArray()
    @IsString({each: true})
    activeAuthentication: string
    createdAt:   string
    updatedAt:   string
}