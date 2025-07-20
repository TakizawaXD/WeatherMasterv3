# 🔒 Guía de Seguridad - WeatherMaster

## 📋 Índice de Seguridad
1. [Principios de Seguridad](#principios-de-seguridad)
2. [Autenticación y Autorización](#autenticación-y-autorización)
3. [Protección de Datos](#protección-de-datos)
4. [Seguridad de Red](#seguridad-de-red)
5. [Monitoreo y Auditoría](#monitoreo-y-auditoría)

## 🛡️ Principios de Seguridad

### **1. Defensa en Profundidad**
- **Múltiples capas** de seguridad
- **Validación** en frontend y backend
- **Encriptación** en tránsito y reposo
- **Monitoreo** continuo de amenazas

### **2. Principio de Menor Privilegio**
- **Acceso mínimo** necesario
- **Roles específicos** por función
- **Revisión periódica** de permisos
- **Rotación** de credenciales

### **3. Seguridad por Diseño**
- **Secure by default** en configuraciones
- **Validación** de entrada obligatoria
- **Sanitización** automática de datos
- **Logging** de eventos de seguridad

## 🔐 Autenticación y Autorización

### **Gestión de API Keys**

#### **Almacenamiento Seguro**
```bash
# Variables de entorno (NUNCA en código)
VITE_OPENWEATHER_API_KEY=tu-api-key-aqui

# AWS Secrets Manager
aws secretsmanager create-secret \
  --name "weathermaster/api-keys" \
  --description "API keys para WeatherMaster" \
  --secret-string '{"openweather":"tu-api-key-aqui"}'
```

#### **Rotación de API Keys**
```javascript
// Servicio de rotación automática
class ApiKeyManager {
  private currentKey: string;
  private backupKey: string;
  
  async rotateKey(): Promise<void> {
    try {
      // Obtener nueva clave
      const newKey = await this.generateNewKey();
      
      // Validar nueva clave
      await this.validateKey(newKey);
      
      // Actualizar configuración
      this.backupKey = this.currentKey;
      this.currentKey = newKey;
      
      console.log('✅ API key rotada exitosamente');
    } catch (error) {
      console.error('❌ Error en rotación de API key:', error);
      // Mantener clave actual
    }
  }
}
```

### **Validación de Entrada**

#### **Sanitización de Datos**
```typescript
// Sanitizador de entrada
export class InputSanitizer {
  static sanitizeCity(input: string): string {
    if (!input || typeof input !== 'string') {
      throw new Error('Entrada inválida');
    }
    
    return input
      .trim()
      .replace(/[<>\"'&]/g, '') // Remover caracteres peligrosos
      .replace(/[^\w\s\-\.]/g, '') // Solo caracteres alfanuméricos
      .substring(0, 100); // Limitar longitud
  }
  
  static validateApiKey(key: string): boolean {
    const apiKeyPattern = /^[a-f0-9]{32}$/i;
    return apiKeyPattern.test(key);
  }
}
```

#### **Validación de Esquemas**
```typescript
// Validador de respuestas API
interface ApiResponseValidator {
  validateWeatherResponse(data: any): boolean;
  validateForecastResponse(data: any): boolean;
}

export class WeatherApiValidator implements ApiResponseValidator {
  validateWeatherResponse(data: any): boolean {
    const requiredFields = ['main', 'weather', 'wind', 'sys'];
    
    return requiredFields.every(field => {
      if (!(field in data)) {
        console.warn(`⚠️ Campo requerido faltante: ${field}`);
        return false;
      }
      return true;
    });
  }
  
  validateForecastResponse(data: any): boolean {
    if (!data.list || !Array.isArray(data.list)) {
      console.warn('⚠️ Formato de pronóstico inválido');
      return false;
    }
    
    return data.list.length > 0;
  }
}
```

## 🛡️ Protección de Datos

### **Encriptación en Tránsito**

#### **HTTPS Obligatorio**
```javascript
// Forzar HTTPS en producción
if (import.meta.env.PROD && location.protocol !== 'https:') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}

// Headers de seguridad
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://api.openweathermap.org",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

#### **Configuración TLS**
```nginx
# Configuración Nginx para TLS
server {
    listen 443 ssl http2;
    server_name weathermaster.com;
    
    # Certificados SSL
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    
    # Configuración TLS segura
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
}
```

### **Protección de Datos Sensibles**

#### **Ofuscación de API Keys**
```typescript
// Servicio de ofuscación
export class SecurityService {
  private static readonly KEY_PREFIX = 'wm_';
  
  static obfuscateApiKey(key: string): string {
    if (!key) return '';
    
    const visible = key.substring(0, 8);
    const hidden = '*'.repeat(key.length - 8);
    
    return `${visible}${hidden}`;
  }
  
  static validateKeyFormat(key: string): boolean {
    // Validar formato sin exponer la clave
    return key.length === 32 && /^[a-f0-9]+$/i.test(key);
  }
}
```

#### **Limpieza de Logs**
```typescript
// Logger seguro
export class SecureLogger {
  static log(message: string, data?: any): void {
    const sanitizedData = this.sanitizeLogData(data);
    console.log(`[${new Date().toISOString()}] ${message}`, sanitizedData);
  }
  
  private static sanitizeLogData(data: any): any {
    if (!data) return data;
    
    const sanitized = { ...data };
    
    // Remover datos sensibles
    const sensitiveKeys = ['apiKey', 'token', 'password', 'secret'];
    sensitiveKeys.forEach(key => {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
```

## 🌐 Seguridad de Red

### **Content Security Policy (CSP)**

#### **Configuración CSP Estricta**
```html
<!-- Meta tag CSP -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://openweathermap.org;
  connect-src 'self' https://api.openweathermap.org;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
">
```

#### **CSP Dinámico**
```typescript
// Generador de CSP dinámico
export class CSPGenerator {
  static generateCSP(environment: 'development' | 'production'): string {
    const basePolicy = {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", "data:", "https://openweathermap.org"],
      'connect-src': ["'self'", "https://api.openweathermap.org"],
      'font-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"]
    };
    
    if (environment === 'development') {
      basePolicy['script-src'].push("'unsafe-eval'");
      basePolicy['connect-src'].push("ws://localhost:*");
    } else {
      basePolicy['upgrade-insecure-requests'] = [];
    }
    
    return Object.entries(basePolicy)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }
}
```

### **Rate Limiting**

#### **Limitación de Requests**
```typescript
// Rate limiter del lado cliente
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests = 60; // 60 requests por minuto
  private readonly windowMs = 60 * 1000; // 1 minuto
  
  canMakeRequest(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Limpiar requests antiguos
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      console.warn(`⚠️ Rate limit excedido para: ${identifier}`);
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const requests = this.requests.get(identifier) || [];
    const now = Date.now();
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}
```

### **Protección DDoS**

#### **Detección de Patrones Anómalos**
```typescript
// Detector de anomalías
export class AnomalyDetector {
  private requestPatterns: Map<string, RequestPattern> = new Map();
  
  analyzeRequest(ip: string, userAgent: string): ThreatLevel {
    const pattern = this.getOrCreatePattern(ip);
    pattern.addRequest(userAgent);
    
    // Detectar patrones sospechosos
    if (pattern.getRequestsPerMinute() > 100) {
      return ThreatLevel.HIGH;
    }
    
    if (pattern.hasRepeatedUserAgent() && pattern.getRequestsPerMinute() > 30) {
      return ThreatLevel.MEDIUM;
    }
    
    return ThreatLevel.LOW;
  }
  
  private getOrCreatePattern(ip: string): RequestPattern {
    if (!this.requestPatterns.has(ip)) {
      this.requestPatterns.set(ip, new RequestPattern());
    }
    return this.requestPatterns.get(ip)!;
  }
}

enum ThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}
```

## 📊 Monitoreo y Auditoría

### **Logging de Seguridad**

#### **Sistema de Auditoría**
```typescript
// Logger de eventos de seguridad
export class SecurityAuditLogger {
  private static instance: SecurityAuditLogger;
  
  static getInstance(): SecurityAuditLogger {
    if (!this.instance) {
      this.instance = new SecurityAuditLogger();
    }
    return this.instance;
  }
  
  logSecurityEvent(event: SecurityEvent): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: event.type,
      severity: event.severity,
      source: event.source,
      details: this.sanitizeDetails(event.details),
      userAgent: navigator.userAgent,
      ip: this.getClientIP()
    };
    
    // Enviar a servicio de logging
    this.sendToSecurityService(logEntry);
    
    // Log local para desarrollo
    if (import.meta.env.DEV) {
      console.log('🔒 Security Event:', logEntry);
    }
  }
  
  private sanitizeDetails(details: any): any {
    // Remover información sensible de los logs
    const sanitized = { ...details };
    delete sanitized.apiKey;
    delete sanitized.token;
    return sanitized;
  }
}

interface SecurityEvent {
  type: 'api_key_rotation' | 'rate_limit_exceeded' | 'invalid_input' | 'csp_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  details: any;
}
```

### **Alertas de Seguridad**

#### **Sistema de Notificaciones**
```typescript
// Servicio de alertas
export class SecurityAlertService {
  private static readonly ALERT_THRESHOLDS = {
    rate_limit_violations: 10,
    invalid_inputs: 50,
    api_errors: 25
  };
  
  private violationCounts: Map<string, number> = new Map();
  
  checkAndAlert(eventType: string): void {
    const count = this.violationCounts.get(eventType) || 0;
    this.violationCounts.set(eventType, count + 1);
    
    const threshold = SecurityAlertService.ALERT_THRESHOLDS[eventType as keyof typeof SecurityAlertService.ALERT_THRESHOLDS];
    
    if (threshold && count >= threshold) {
      this.sendAlert({
        type: eventType,
        count,
        threshold,
        timestamp: new Date().toISOString()
      });
      
      // Reset counter
      this.violationCounts.set(eventType, 0);
    }
  }
  
  private async sendAlert(alert: SecurityAlert): Promise<void> {
    // Enviar alerta a sistema de monitoreo
    console.warn('🚨 Security Alert:', alert);
    
    // En producción, enviar a servicio de alertas
    if (import.meta.env.PROD) {
      await fetch('/api/security/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
    }
  }
}

interface SecurityAlert {
  type: string;
  count: number;
  threshold: number;
  timestamp: string;
}
```

### **Métricas de Seguridad**

#### **Dashboard de Seguridad**
```typescript
// Métricas de seguridad
export class SecurityMetrics {
  private metrics: Map<string, number> = new Map();
  
  incrementMetric(metric: string): void {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + 1);
  }
  
  getSecurityReport(): SecurityReport {
    return {
      totalRequests: this.metrics.get('total_requests') || 0,
      blockedRequests: this.metrics.get('blocked_requests') || 0,
      rateLimitViolations: this.metrics.get('rate_limit_violations') || 0,
      invalidInputs: this.metrics.get('invalid_inputs') || 0,
      apiErrors: this.metrics.get('api_errors') || 0,
      lastUpdated: new Date().toISOString()
    };
  }
  
  exportMetrics(): string {
    const report = this.getSecurityReport();
    return JSON.stringify(report, null, 2);
  }
}

interface SecurityReport {
  totalRequests: number;
  blockedRequests: number;
  rateLimitViolations: number;
  invalidInputs: number;
  apiErrors: number;
  lastUpdated: string;
}
```

## 🔧 Configuración de Seguridad

### **Variables de Entorno Seguras**
```bash
# Configuración de seguridad
VITE_SECURITY_LEVEL=high
VITE_ENABLE_CSP=true
VITE_ENABLE_RATE_LIMITING=true
VITE_LOG_SECURITY_EVENTS=true

# Configuración de API
VITE_API_TIMEOUT=10000
VITE_MAX_RETRIES=3
VITE_ENABLE_API_VALIDATION=true
```

### **Checklist de Seguridad**

#### **Pre-Despliegue**
- [ ] ✅ API keys configuradas en variables de entorno
- [ ] ✅ HTTPS habilitado y configurado
- [ ] ✅ CSP implementado y probado
- [ ] ✅ Rate limiting configurado
- [ ] ✅ Validación de entrada implementada
- [ ] ✅ Logging de seguridad activado
- [ ] ✅ Headers de seguridad configurados
- [ ] ✅ Certificados SSL válidos

#### **Post-Despliegue**
- [ ] ✅ Monitoreo de seguridad activo
- [ ] ✅ Alertas configuradas
- [ ] ✅ Logs de auditoría funcionando
- [ ] ✅ Métricas de seguridad recopilándose
- [ ] ✅ Plan de respuesta a incidentes definido
- [ ] ✅ Rotación de credenciales programada

---

**¡Tu aplicación WeatherMaster está protegida con las mejores prácticas de seguridad! 🔒**

*La seguridad es un proceso continuo. Mantén actualizadas las dependencias y revisa regularmente las configuraciones de seguridad.*