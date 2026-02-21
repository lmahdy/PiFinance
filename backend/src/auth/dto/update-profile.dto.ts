import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  avatar?: string; // data URL or URL

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;
}
