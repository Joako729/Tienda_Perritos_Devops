# 🐾 Tienda Perritos DevOps - Automatización y Orquestación Cloud

Este repositorio contiene la implementación técnica y el código fuente para la automatización del ciclo de Integración y Entrega Continua (CI/CD) de la plataforma "Tienda Perritos DevOps". El proyecto abarca desde la contenerización local hasta la orquestación en alta disponibilidad en Amazon Web Services (AWS).

---

## 👨‍💻 Equipo de Ingeniería
* **Integrantes:** Joaquin Caceres y Marcelo Apablaza
* **Sección:** 001D
* **Asignatura:** Introducción a Herramientas DevOps (ISY1101)
* **Docente:** Rafael Videla

---

## 🏛️ 1. Arquitectura del Sistema (Tres Capas)
El sistema está diseñado bajo un estricto patrón de microservicios desacoplados con comunicación unidireccional para garantizar seguridad y aislamiento de red:

1. **Capa de Presentación (Frontend):** Servidor web `Nginx`. Expuesto al internet público mediante un servicio `LoadBalancer` de AWS en el puerto 80.
2. **Capa de Lógica de Negocio (Backend):** API RESTful en `Node.js`. Opera de manera interna y privada mediante un servicio `ClusterIP`.
3. **Capa de Persistencia (Base de Datos):** Motor relacional `MySQL`. Totalmente aislado de internet, expuesto solo al Backend mediante `ClusterIP` en el puerto 3306.

---

## 🐳 2. Contenerización y Desarrollo Local
Para garantizar la paridad entre desarrollo y producción (evitando el "en mi máquina sí funciona"), la aplicación fue contenerizada aplicando políticas de **Image Hardening**:
* **Multi-stage Builds:** Separación de la fase de compilación y ejecución para no incluir herramientas de desarrollo en el contenedor final.
* **Imágenes Minimalistas:** Uso de distribuciones `Alpine Linux`, logrando contenedores livianos (<50MB) y reduciendo vulnerabilidades (CVEs).
* **Entorno Local:** Orquestado mediante `docker-compose.yml`, permitiendo levantar redes, volúmenes y variables con el comando unificado: `docker-compose up -d --build`.

---

## ⚙️ 3. Pipeline CI/CD Totalmente Automatizado
El ciclo de vida del software está gobernado por **GitHub Actions**, ejecutando un flujo de trabajo (workflow) ante cada integración en la rama principal (`main`):

1. **Build & Test:** Aprovisionamiento de un runner aislado para compilar y validar dependencias.
2. **Push a Amazon ECR:** Las imágenes se construyen y envían al Elastic Container Registry de AWS. Cada imagen se etiqueta de forma inmutable usando el hash del commit (`$GITHUB_SHA`), erradicando el uso del tag genérico `latest` para garantizar trazabilidad.
3. **Deploy (Rolling Update):** Actualización progresiva en Kubernetes. Los manifiestos despliegan nuevos Pods sin destruir los antiguos hasta verificar su salud, logrando un despliegue con cero tiempo de inactividad (Zero Downtime).

---

## ☁️ 4. Infraestructura Cloud y Escalabilidad (AWS EKS)
La plataforma de producción está alojada en AWS bajo los siguientes estándares de resiliencia:
* **VPC y Subredes:** Red segmentada lógicamente. El LoadBalancer opera en subredes públicas (Multi-AZ), mientras que los *Worker Nodes* y la base de datos se alojan en subredes privadas sin IP pública.
* **Orquestación EKS:** Uso de Amazon Elastic Kubernetes Service para abstraer la gestión del Control Plane y garantizar alta disponibilidad nativa.
* **Autoescalado Dinámico:** Implementación de **Horizontal Pod Autoscaler (HPA)**. Si el consumo de CPU del Backend supera el 70%, el clúster escala dinámicamente aprovisionando entre 1 y 5 réplicas para soportar picos de demanda.

---

## 🔐 5. Seguridad Perimetral y Gestión de Secretos (IAM)
* **Defensa en Capas:** Los **Security Groups** de AWS actúan como firewalls restrictivos. Solo el LoadBalancer admite tráfico de internet (`0.0.0.0/0`), mientras que los nodos internos deniegan peticiones externas.
* **Mínimo Privilegio:** GitHub Actions se autentica en AWS mediante roles restringidos. Los secretos, tokens y credenciales de bases de datos no se guardan en el código (hardcoding), sino que se administran mediante **GitHub Secrets** y **Kubernetes Secrets**, inyectándose directamente en la memoria RAM de los contenedores.

---

## 📊 6. Observabilidad
El ecosistema es monitoreado mediante herramientas nativas para garantizar mantenibilidad predictiva:
* **Métricas Cloud:** Auditoría del consumo físico (CPU/RAM de instancias EC2) a través de **AWS CloudWatch**.
* **Auditoría de Contenedores:** Inspección de transacciones internas (stdout/stderr) a través de `kubectl logs`, lo que permite validar empíricamente el correcto "handshake" entre el Backend y la Base de Datos.

---

## 📝 Política de Commits
Este repositorio utiliza la convención **Conventional Commits** para mantener un historial trazable y automatizable. 
Ejemplos utilizados: `feat:` (nuevas características), `fix:` (solución de errores), `docs:` (actualización de documentación).


Este repositorio contiene la implementación técnica y el código fuente para la automatización del ciclo de Integración y Entrega Continua (CI/CD) de la plataforma "Tienda Perritos DevOps". El proyecto abarca desde la contenerización local hasta la orquestación en alta disponibilidad en Amazon Web Services (AWS).

---
