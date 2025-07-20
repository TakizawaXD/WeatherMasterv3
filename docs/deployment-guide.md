# 🚀 Guía Completa de Despliegue - WeatherMaster

## 📋 Índice
1. [Preparación para Despliegue](#preparación-para-despliegue)
2. [Despliegue en AWS](#despliegue-en-aws)
3. [Despliegue en Netlify](#despliegue-en-netlify)
4. [Configuración de Dominio](#configuración-de-dominio)
5. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)

## 🛠️ Preparación para Despliegue

### **1. Verificación de Configuración**
```bash
# Verificar variables de entorno
echo $VITE_OPENWEATHER_API_KEY

# Ejecutar tests
npm run test

# Verificar build
npm run build
```

### **2. Optimización para Producción**
```bash
# Análisis de bundle
npm run build:analyze

# Optimización de imágenes
npm run optimize:images

# Minificación adicional
npm run build:prod
```

## ☁️ Despliegue en AWS

### **Opción 1: AWS Amplify (Recomendado)**

#### **Configuración Inicial**
```bash
# Instalar Amplify CLI
npm install -g @aws-amplify/cli

# Configurar credenciales AWS
amplify configure
```

#### **Inicialización del Proyecto**
```bash
# Inicializar Amplify
amplify init

# Configuración recomendada:
# - Project name: weathermaster
# - Environment: prod
# - Default editor: Visual Studio Code
# - App type: javascript
# - Framework: react
# - Source directory: src
# - Build directory: dist
# - Build command: npm run build
# - Start command: npm run dev
```

#### **Configurar Hosting**
```bash
# Agregar hosting
amplify add hosting

# Seleccionar:
# - Hosting with Amplify Console
# - Manual deployment

# Publicar
amplify publish
```

#### **Variables de Entorno en Amplify**
```bash
# En la consola de AWS Amplify, agregar:
VITE_OPENWEATHER_API_KEY=tu-api-key-aqui
VITE_CACHE_EXPIRY_MINUTES=15
```

### **Opción 2: AWS S3 + CloudFront**

#### **1. Crear Bucket S3**
```bash
# Crear bucket
aws s3 mb s3://weathermaster-prod

# Configurar como sitio web estático
aws s3 website s3://weathermaster-prod \
  --index-document index.html \
  --error-document index.html
```

#### **2. Configurar Políticas**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::weathermaster-prod/*"
    }
  ]
}
```

#### **3. Subir Archivos**
```bash
# Build para producción
npm run build

# Sincronizar con S3
aws s3 sync dist/ s3://weathermaster-prod \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --exclude "service-worker.js"

# Archivos HTML sin caché
aws s3 sync dist/ s3://weathermaster-prod \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --include "*.html" \
  --include "service-worker.js"
```

#### **4. Configurar CloudFront**
```json
{
  "CallerReference": "weathermaster-2025",
  "Comment": "WeatherMaster CDN Distribution",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-weathermaster-prod",
        "DomainName": "weathermaster-prod.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-weathermaster-prod",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200"
      }
    ]
  }
}
```

### **Opción 3: AWS ECS con Docker**

#### **1. Crear Dockerfile**
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar archivos build
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración Nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### **2. Configuración Nginx**
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
}
```

#### **3. Desplegar en ECS**
```bash
# Construir imagen
docker build -t weathermaster:latest .

# Tag para ECR
docker tag weathermaster:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/weathermaster:latest

# Push a ECR
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/weathermaster:latest

# Crear servicio ECS
aws ecs create-service \
  --cluster weathermaster-cluster \
  --service-name weathermaster-service \
  --task-definition weathermaster:1 \
  --desired-count 2
```

## 🌐 Despliegue en Netlify

### **Opción 1: Despliegue Directo**

#### **1. Preparar Build**
```bash
npm run build
```

#### **2. Configurar netlify.toml**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### **3. Variables de Entorno**
```bash
# En Netlify Dashboard > Site Settings > Environment Variables
VITE_OPENWEATHER_API_KEY=tu-api-key-aqui
VITE_CACHE_EXPIRY_MINUTES=15
NODE_VERSION=18
```

### **Opción 2: Netlify CLI**
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Inicializar sitio
netlify init

# Deploy
netlify deploy --prod
```

## 🌍 Configuración de Dominio

### **Configurar Dominio Personalizado**

#### **Para AWS CloudFront**
```bash
# Crear certificado SSL
aws acm request-certificate \
  --domain-name weathermaster.com \
  --domain-name www.weathermaster.com \
  --validation-method DNS

# Configurar Route 53
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://dns-changes.json
```

#### **Para Netlify**
```bash
# Agregar dominio personalizado
netlify domains:add weathermaster.com

# Configurar DNS
# CNAME: www.weathermaster.com -> amazing-app-123456.netlify.app
# A: weathermaster.com -> 75.2.60.5
```

### **Configuración DNS**
```dns
; Registros DNS recomendados
weathermaster.com.     300 IN A     75.2.60.5
www.weathermaster.com. 300 IN CNAME amazing-app-123456.netlify.app.

; Para AWS CloudFront
weathermaster.com.     300 IN A     d123456789.cloudfront.net.
www.weathermaster.com. 300 IN CNAME d123456789.cloudfront.net.
```

## 📊 Monitoreo y Mantenimiento

### **1. Configurar Monitoreo**

#### **AWS CloudWatch**
```bash
# Crear alarma para errores 4xx
aws cloudwatch put-metric-alarm \
  --alarm-name "WeatherMaster-4xx-Errors" \
  --alarm-description "High 4xx error rate" \
  --metric-name 4xxErrorRate \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

#### **Netlify Analytics**
```javascript
// Configurar analytics en index.html
<script>
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }
</script>
```

### **2. Configurar CI/CD**

#### **GitHub Actions para AWS**
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_OPENWEATHER_API_KEY: ${{ secrets.OPENWEATHER_API_KEY }}
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://weathermaster-prod --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

#### **GitHub Actions para Netlify**
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_OPENWEATHER_API_KEY: ${{ secrets.OPENWEATHER_API_KEY }}
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### **3. Backup y Recuperación**

#### **Backup de Configuración**
```bash
# Backup de variables de entorno
aws ssm get-parameters-by-path \
  --path "/weathermaster/prod" \
  --recursive \
  --with-decryption > backup-env-$(date +%Y%m%d).json

# Backup de configuración CloudFront
aws cloudfront get-distribution-config \
  --id $DISTRIBUTION_ID > backup-cf-$(date +%Y%m%d).json
```

#### **Plan de Recuperación**
1. **Identificar problema** (monitoreo automático)
2. **Rollback automático** a versión anterior
3. **Notificación** al equipo de desarrollo
4. **Análisis post-mortem** y mejoras

### **4. Optimización Continua**

#### **Performance Monitoring**
```javascript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Enviar métricas a servicio de analytics
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

#### **Error Tracking**
```javascript
// Configurar Sentry o similar
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

## 🔧 Troubleshooting

### **Problemas Comunes**

#### **Build Failures**
```bash
# Limpiar caché
npm run clean
rm -rf node_modules package-lock.json
npm install

# Verificar variables de entorno
echo $VITE_OPENWEATHER_API_KEY
```

#### **Errores de CORS**
```javascript
// Configurar proxy en vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.openweathermap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
```

#### **Problemas de SSL**
```bash
# Verificar certificado
openssl s_client -connect weathermaster.com:443 -servername weathermaster.com

# Renovar certificado en AWS
aws acm request-certificate \
  --domain-name weathermaster.com \
  --validation-method DNS
```

---

**¡Tu aplicación WeatherMaster está lista para producción! 🚀**

*Para soporte adicional, consulta la documentación completa o contacta al equipo de desarrollo.*