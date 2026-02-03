export class LoginResponseDto {
    access_token: string;
    refresh_token: string;
    user: UserInfoDto;
}

export class UserInfoDto {
    id: number;
    email: string;
    name: string;
    role: string;
}
