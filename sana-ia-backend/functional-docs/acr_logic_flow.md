# Lógica de Diagnóstico y ACR (Análisis Causa Raíz)

Este diagrama representa el motor de decisión basado en el procedimiento **PR-DTI-001**.

```mermaid
flowchart TD
    Start([Inicio: Síntoma Usuario]) --> Disclaimer{¿Acepta Disclaimer?}
    
    Disclaimer -- No --> EndTerm([Fin del Proceso])
    Disclaimer -- Si --> NLP[IA Traducción / NLP]
    
    subgraph "Fase de Seguridad"
        NLP --> Extract[Extraer Variables Críticas (Dolor, Tensión, etc)]
        Extract --> Vital{¿Emergencia Vital?}
        Vital -- SI --> ER[ALERTA: Urgencias Médicas Inmediatas]
    end
    
    subgraph "Motor ACR - Ingeniería R.F.G."
        Vital -- NO --> RFG[Captura Gestión R.F.G.]
        RFG --> Context[Validar: Entorno, Hábitos, Nutrición, Estrés]
        Context --> FiveWhys[Algoritmo 5 Porqués]
        
        FiveWhys --> Correlation{¿Correlación Físico-Gestión?}
        
        Correlation -- No --> Inconsistency[Detectar Inconsistencia / Falta Info]
        Inconsistency --> RequestLabs[Solicitar Data Hard / Laboratorios]
        
        Correlation -- Si --> RootCause
    end
    
    subgraph "Validación Data Hard"
        RequestLabs --> OCR[Procesamiento OCR Imagen]
        OCR --> Biomarkers[Extracción Biomarcadores]
        Biomarkers --> CrossRef[Cruce: Síntoma + Biomarcador]
        CrossRef --> RootCause[Identificar Causa Raíz Probable]
        CrossRef --> Solapamiento[Analizar Solapamiento (Mecánico vs Químico)]
    end
    
    subgraph "Output"
        RootCause --> Report[Generar Informe Técnico]
        Solapamiento --> Report
        Report --> Specialist[Sugerir Especialista (ej: Endocrino)]
        Specialist --> FinalOutput([Entregable al Usuario])
    end
    
    ER --> End([Fin por Emergencia])
    FinalOutput --> EndNormal([Fin Proceso])
```
