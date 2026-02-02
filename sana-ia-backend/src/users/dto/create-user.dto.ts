import { 
  IsEmail, 
  IsString, 
  MinLength, 
  IsDateString, 
  IsBoolean, 
  IsInt, 
  IsNotEmpty, 
  MaxLength 
} from 'class-validator';

export class CreateUserDto {

    @IsEmail({}, { message: 'El formato del correo es inválido' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password: string;

    @IsDateString() 
    birthDate: Date;

    @IsBoolean()
    disclaimerAccepted: boolean;

    @IsInt()
    roleId: number;

}