# Resumen del Módulo de IA - SANA

## 📋 Estado Actual

El módulo de IA está **implementado y funcional**, integrando **Gemini 1.5 Pro** como motor de inferencia clínica.

---

## 🏗️ Estructura del Módulo

```
src/ai/
├── ai.module.ts          # Módulo NestJS
├── ai.controller.ts      # Endpoint POST /ai/analyze (protegido con JWT)
├── ai.service.ts         # Lógica de integración con Gemini
├── dto/
│   ├── analyze-input.dto.ts    # Validación de entrada (symptoms, treatment, duration)
│   ├── analyze-response.dto.ts # Tipado de respuesta
│   └── index.ts
├── prompts/
│   └── system-prompt.ts  # System prompt + prompt builder
└── schemas/
    └── ai-response.schema.ts  # Validación con Zod
```

---

## ✅ Lo que se implementó

| Componente | Descripción |
|------------|-------------|
| **AiService** | Servicio que conecta con Gemini 1.5 Pro, envía el prompt estructurado y parsea la respuesta JSON |
| **System Prompt** | Instrucciones del rol de SANA: metodología de 5 Porqués, detección de emergencias, formato JSON |
| **Validación Zod** | Schema `AiResponseSchema` para validar y tipar la respuesta de la IA |
| **DTOs** | `AnalyzeInputDto` (entrada validada) + `AnalyzeResponseDto` (tipado de salida) |
| **Controller** | Endpoint `POST /ai/analyze` protegido con `JwtAuthGuard` |
| **Fallback seguro** | Si la IA falla, retorna respuesta neutral sugiriendo Medicina General |

---

## 📦 Respuesta Estructurada

```json
{
  "statusInconsistency": true,
  "detectedBiomarkers": [],
  "rootCauseHypothesis": "Hipótesis médica basada en ACR",
  "suggestedSpecialist": "Endocrinología",
  "confidenceLevel": 45,
  "requiresHardData": true,
  "isEmergency": false,
  "disclaimer": "Este análisis es REFERENCIAL...",
  "fiveWhysTrace": ["Paso 1", "Paso 2", "..."]
}
```

---

## ⚙️ Configuración Requerida (.env)

```env
GEMINI_API_KEY=tu_api_key_aqui
GEMINI_MODEL=gemini-1.5-pro  # Opcional, default: gemini-1.5-pro
```

---

## 🔜 Próximos Pasos

### Alta Prioridad
1. **Módulo de OCR** - Procesar imágenes de laboratorios para extraer biomarcadores
2. **Persistencia de consultas** - Guardar historial de análisis en la BD (tabla `consultations`)
3. **Integración con User** - Asociar análisis al usuario autenticado

### Media Prioridad
4. **Generador de PDF** - Crear informe técnico descargable para el médico
5. **Interrogatorio dirigido** - Endpoint para preguntas de seguimiento basadas en la hipótesis
6. **RAG con base médica** - Conectar con documentos médicos validados para mejorar precisión

### Mejoras Futuras
7. **Speech-to-Text** - Entrada de síntomas por voz
8. **Cache de respuestas** - Evitar llamadas repetidas a Gemini
9. **Métricas y logging** - Dashboard de uso del módulo de IA
10. **Tests E2E** - Cobertura de pruebas para el flujo completo

---

## 📌 Notas Importantes

- El endpoint requiere **autenticación JWT** para acceder
- La IA siempre retorna `requiresHardData: true` si no hay biomarcadores de laboratorio
- Se detectan automáticamente **emergencias vitales** (ACV, infarto, etc.)
- El disclaimer legal se incluye en **cada respuesta**
