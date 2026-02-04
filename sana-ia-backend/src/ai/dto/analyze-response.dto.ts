export interface Biomarker {
    name: string;
    value: number;
    unit: string;
    normalRange: string;
    status: 'low' | 'normal' | 'high';
}

export class AnalyzeResponseDto {
    statusInconsistency: boolean;
    detectedBiomarkers: Biomarker[];
    rootCauseHypothesis: string;
    suggestedSpecialist: string;
    confidenceLevel: number;
    requiresHardData: boolean;
    isEmergency: boolean;
    disclaimer: string;
    fiveWhysTrace: string[];
}
