import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'El formato del correo es inválido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password: string;
}
