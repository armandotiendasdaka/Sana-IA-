**ESPECIFICACIÓN TÉCNICA: PROYECTO "SANA" (MVP)**

**1\. VISIÓN DEL SISTEMA: SINERGIA INGENIERÍA-MEDICINA**

**Sana** es un motor de **Inferencia Clínica**. Utiliza la metodología de los **5 Porqués** para realizar un análisis de "Causa Raíz", cruzando síntomas narrativos con biomarcadores de laboratorio (Data Hard).

**El objetivo:** Detectar la "Falla de Sistema" (Patología Solapada) mediante evidencia científica y validación de datos.

**2\. PROTOCOLO DE INTERACCIÓN (SANA v1.0)**

**Fase 1: Captura de Datos (Anamnesis de Ingeniería)**

- **IA (Sana):** "Hola, soy Sana. Cuéntame tu situación: ¿qué síntomas tienes, qué tratamiento sigues y cuánto tiempo llevas sin ver mejoría?"
- **Usuario:** "Tensión alta hace 2 años, tomo Losartán, pero sigo en 150/90. Siento calambres y debilidad".
- **Lógica Interna (Cerebro IA):** Detecta **Inconsistencia Terapéutica**. (Si Fármaco A + Tiempo X ≠ Resultado esperado → Buscar Variable Oculta).

**Fase 2: Validación Científica (Capa de Datos Duros)**

- **IA (Sana):** "Entiendo. Para que la IA analice tu caso con precisión médica, necesito ver tus últimos laboratorios. Sube una foto de tu química sanguínea".
- **Proceso (OCR + Análisis):** La IA escanea los valores. Supongamos que detecta **Potasio: 3.1 mEq/L**.
- **Sinergia Médica:** La IA correlaciona automáticamente: _Hipertensión Resistente + Hipopotasemia (Potasio bajo) = Posible Hiperaldosteronismo Primario._

**Fase 3: Verificación de Hipótesis (Interrogatorio Dirigido)**

- **IA (Sana):** (Sin usar tecnicismos) "¿Has notado si te levantas con frecuencia a orinar en la madrugada?"
- **Usuario:** "Sí, 3 o 4 veces por noche".
- **Lógica Interna (Cerebro IA):** Validación de Nicturia. Los 3 puntos (Tensión, Potasio, Nicturia) cierran el círculo de la sospecha clínica validada científicamente.

**Fase 4: Output de Ingeniería Médica (El Reporte)**

- **Sana:** "María, el análisis de tus datos sugiere que tu tratamiento no funciona porque la causa podría ser un desequilibrio hormonal (Glándula Suprarrenal) y no un problema cardíaco común".
- **Entregable (PDF para el Médico):** Un informe con lenguaje técnico avanzado: _"Se sugiere descarte de Hiperaldosteronismo Primario debido a Hipertensión Grado II refractaria y niveles de Potasio plasmático en 3.1 mEq/L. Recomendación: Evaluación por Endocrinología"_.

**3\. ARQUITECTURA PARA ARMANDO (BACKEND)**

1.  **Motor de Razonamiento:** Gemini no debe "adivinar". Debe usar **RAG (Retrieval-Augmented Generation)** con bases de datos médicas validadas para cruzar síntomas.
2.  **Precisión OCR:** El sistema debe reconocer unidades de medida (mg/dL, mEq/L) para evitar errores de interpretación.
3.  **Filtro Científico:** Si el usuario no sube exámenes, la IA debe advertir que su conclusión es una "hipótesis preliminar" hasta validar los datos.

**NOTA: _SANA_** _es la unión de la lógica de procesos con la medicina avanzada. Estamos construyendo una herramienta que piensa como un especialista senior, buscando el error en el sistema que el diagnóstico estándar no pudo ver. Armando, enfócate en la_ **_correlación de datos_**_: si el examen dice X y el síntoma dice Y, la IA debe saber que la respuesta es Z."_

### REQUERIMIENTOS TÉCNICOS PARA DESARROLLO (BACKEND)

Armando, para aterrizar el MVP de **SANA** a nivel de código, necesito que definas los siguientes puntos de arquitectura:

1.  **Selección de Modelo (LLM):** He validado que **Gemini 1.5 Pro** es la mejor opción por su ventana de contexto y capacidad multimodal. ¿Cómo ves la integración de la API para el procesamiento de imágenes (OCR) y el razonamiento clínico en un solo llamado?

1.  **Estructuración de Datos (JSON Output):** Necesito que la IA no entregue solo texto plano. Debe devolver un objeto estructurado que separe:

- - status_inconsistencia: (Boolean)
    - biomarcadores_detectados: (Array de valores encontrados en el examen)
    - hipotesis_causa_raiz: (String)
    - especialista_sugerido: (String)

1.  **Módulo de Visión (OCR):** ¿Usaremos directamente la capacidad de visión de Gemini o prefieres un pre-procesamiento con herramientas tipo Google Document AI para limpiar los datos del laboratorio antes de que la IA los analice?

1.  **Seguridad de Datos (HIPAA Compliance):** Aunque es un MVP, debemos prever el manejo de datos sensibles de salud. ¿Qué estrategia de encriptación sugieres para el almacenamiento de los resultados de laboratorio?