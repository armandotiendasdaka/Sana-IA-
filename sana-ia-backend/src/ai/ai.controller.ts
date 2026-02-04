import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { AnalyzeInputDto, AnalyzeResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('analyze')
    @HttpCode(HttpStatus.OK)
    async analyzeSymptoms(@Body() analyzeInputDto: AnalyzeInputDto): Promise<AnalyzeResponseDto> {
        return this.aiService.analyzeSymptoms(analyzeInputDto);
    }
}
