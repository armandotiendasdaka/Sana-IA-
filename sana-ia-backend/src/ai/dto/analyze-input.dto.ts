import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AnalyzeInputDto {
    @IsString()
    @IsNotEmpty({ message: 'Los síntomas son requeridos' })
    @MaxLength(2000, { message: 'La descripción no puede exceder 2000 caracteres' })
    symptoms: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    currentTreatment?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    durationWithoutImprovement?: string;
}
