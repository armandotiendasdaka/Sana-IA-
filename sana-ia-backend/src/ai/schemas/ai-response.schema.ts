import { z } from 'zod';

export const BiomarkerSchema = z.object({
    name: z.string(),
    value: z.number(),
    unit: z.string(),
    normalRange: z.string(),
    status: z.enum(['low', 'normal', 'high']),
});

export const AiResponseSchema = z.object({
    statusInconsistency: z.boolean(),
    detectedBiomarkers: z.array(BiomarkerSchema).default([]),
    rootCauseHypothesis: z.string(),
    suggestedSpecialist: z.string(),
    confidenceLevel: z.number().min(0).max(100),
    requiresHardData: z.boolean(),
    isEmergency: z.boolean(),
    disclaimer: z.string(),
    fiveWhysTrace: z.array(z.string()).default([]),
});

export type AiResponseType = z.infer<typeof AiResponseSchema>;
