import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsString()
  fName: string;

  @IsString()
  lName: string;

  @IsEmail()
  @IsString()
  email: string;
}
