import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  ArrowRight, 
  BookOpen, 
  Code, 
  Lightbulb, 
  Trophy, 
  Target, 
  Calendar,
  Sparkles,
  Zap,
  Copy,
  CheckSquare,
  Square,
  Award,
  ChevronRight,
  TrendingUp,
  Briefcase,
  RotateCcw,
  Clock,
  Download,
  ExternalLink,
  Layers,
  Globe,
  Database,
  Server,
  Cpu,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateRoadmapPdf } from '../lib/pdfGenerator';

// =========================================================================
// REAL-WORLD INDUSTRY-STANDARD ROADMAPS (ACCREDITED STEP-BY-STEP CURRICULA)
// =========================================================================

export interface StandardTask {
  type: 'project' | 'skill' | 'cert' | 'deliverable' | 'course';
  title: string;
  hours: number;
  platform?: string;
  tech?: string[];
  details: string;
}

export interface StandardWeek {
  week: number;
  title: string;
  tasks: StandardTask[];
}

export interface StandardSprint {
  sprint_number: number;
  phase: string;
  theme: string;
  milestone_goal: string;
  practical_project: string;
  certification_focus: {
    name: string;
    issuer: string;
    exam_code?: string;
    url?: string;
  };
  weeks: StandardWeek[];
}

export interface RoleRoadmapDefinition {
  id: string;
  title: string;
  roleName: string;
  category: string;
  summary: string;
  icon: 'code' | 'globe' | 'server' | 'database' | 'cpu' | 'shield' | 'mobile';
  sprints: StandardSprint[];
}

export const REAL_ROLE_ROADMAPS: Record<string, RoleRoadmapDefinition> = {
  'full-stack': {
    id: 'full-stack',
    title: 'Full-Stack Software Engineer Roadmap',
    roleName: 'Full Stack Engineer',
    category: 'Web & Systems',
    summary: 'The battle-tested curriculum from HTML/JS and modern React/Next.js to scalable Node.js/PostgreSQL backends, Redis caching, and Docker cloud deployments.',
    icon: 'globe',
    sprints: [
      {
        sprint_number: 1,
        phase: 'Phase 1: Days 1-30',
        theme: 'Sprint 1: Modern Frontend Core & Component Architecture',
        milestone_goal: 'Master TypeScript, React 18 component composition, responsive Tailwind CSS layouts, and client-side state normalization.',
        practical_project: 'Build a fully responsive SaaS interactive dashboard with TypeScript, Tailwind CSS, and client-side persistence.',
        certification_focus: {
          name: 'Meta Front-End Developer Professional Certificate',
          issuer: 'Meta (Coursera)',
          url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer'
        },
        weeks: [
          {
            week: 1,
            title: 'Modern ES6+, TypeScript Strict Mode & DOM Mastery',
            tasks: [
              { type: 'skill', title: 'Deep dive into JavaScript Closures, Event Loop & Promises', hours: 8, tech: ['JavaScript', 'TypeScript', 'DOM'], details: 'Understand microtasks vs macrotasks, async/await error propagation, and prototypal inheritance.' },
              { type: 'skill', title: 'Set up strict TypeScript configurations and interface inheritance', hours: 6, tech: ['TypeScript', 'Generics'], details: 'Define utility types (Pick, Omit, Record) and write type-safe API request/response contracts.' }
            ]
          },
          {
            week: 2,
            title: 'React 18 Architecture, Hooks & Tailwind CSS',
            tasks: [
              { type: 'project', title: 'Construct modular React components with custom hooks', hours: 10, tech: ['React 18', 'Tailwind CSS'], details: 'Build reusable modal, table, and form primitives with accessible keyboard navigation and zero re-render waste.' },
              { type: 'deliverable', title: 'Deploy frontend bundle with zero console warnings to Vercel', hours: 4, platform: 'Vercel / GitHub Actions', details: 'Set up automated CI linting and preview deployments on git push.' }
            ]
          }
        ]
      },
      {
        sprint_number: 2,
        phase: 'Phase 1: Days 1-30',
        theme: 'Sprint 2: Server-Side Rendering (SSR) & Next.js 14 App Router',
        milestone_goal: 'Master Next.js App Router, React Server Components (RSC), server actions, dynamic routing, and Core Web Vitals optimization.',
        practical_project: 'Build a production-ready multi-page web platform with server-side rendered dynamic routes and SEO meta tags.',
        certification_focus: {
          name: 'Next.js Certified Developer',
          issuer: 'Vercel Academy',
          url: 'https://nextjs.org/learn'
        },
        weeks: [
          {
            week: 3,
            title: 'Next.js App Router, Server Components & Streaming',
            tasks: [
              { type: 'skill', title: 'Implement React Server Components and suspense boundaries', hours: 8, tech: ['Next.js 14', 'RSC', 'Streaming'], details: 'Separate server data-fetching logic from interactive client components with Suspense fallback skeletons.' },
              { type: 'project', title: 'Implement Next.js Server Actions with Zod validation', hours: 8, tech: ['Server Actions', 'Zod'], details: 'Perform server-side form mutations with optimistic UI updates and validation error handling.' }
            ]
          },
          {
            week: 4,
            title: 'Client Data Caching, SEO & Core Web Vitals',
            tasks: [
              { type: 'deliverable', title: 'Audit and achieve 95+ Google Lighthouse performance score', hours: 6, tech: ['Lighthouse', 'Web Vitals'], details: 'Optimize Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and next/image assets.' }
            ]
          }
        ]
      },
      {
        sprint_number: 3,
        phase: 'Phase 2: Days 31-60',
        theme: 'Sprint 3: High-Concurrency Backend APIs & Database Modeling',
        milestone_goal: 'Design RESTful API architectures, database connection pools, B-tree indexes in PostgreSQL/MongoDB, and secure JWT authentication.',
        practical_project: 'Build an authenticated RESTful microservice with PostgreSQL/MongoDB, Prisma ORM, and rate limiting.',
        certification_focus: {
          name: 'Node.js Application Developer (JSNAD)',
          issuer: 'The Linux Foundation & OpenJS',
          url: 'https://training.linuxfoundation.org/certification/jsnad/'
        },
        weeks: [
          {
            week: 5,
            title: 'API Architecture, Middlewares & Connection Pooling',
            tasks: [
              { type: 'skill', title: 'Design RESTful API contracts with Express/Fastify and OpenAPI', hours: 8, tech: ['Node.js', 'Express', 'OpenAPI'], details: 'Enforce uniform response structures, centralized error handling middlewares, and request correlation IDs.' },
              { type: 'skill', title: 'Configure database connection pooling and relational schemas', hours: 8, tech: ['PostgreSQL', 'Prisma', 'MongoDB'], details: 'Design normalized tables, foreign keys, compound indexes, and ACID transaction boundaries.' }
            ]
          },
          {
            week: 6,
            title: 'Stateless Authentication, JWT Rotation & Role-Based Access (RBAC)',
            tasks: [
              { type: 'project', title: 'Implement secure access token rotation with HttpOnly refresh cookies', hours: 10, tech: ['JWT', 'Bcrypt', 'Cookies'], details: 'Prevent XSS and CSRF token theft with rotating refresh tokens and bcrypt password hashing.' }
            ]
          }
        ]
      },
      {
        sprint_number: 4,
        phase: 'Phase 2: Days 31-60',
        theme: 'Sprint 4: Low-Latency Caching & Background Task Workers',
        milestone_goal: 'Integrate Redis in-memory caching to achieve sub-10ms response times, and offload heavy background tasks with BullMQ.',
        practical_project: 'Build an asynchronous task processing service with Redis caching and automated retry queues.',
        certification_focus: {
          name: 'Redis Certified Developer',
          issuer: 'Redis University',
          url: 'https://university.redis.com/'
        },
        weeks: [
          {
            week: 7,
            title: 'In-Memory Caching & Cache-Aside Strategy',
            tasks: [
              { type: 'skill', title: 'Implement Cache-Aside pattern with TTL and atomic invalidation', hours: 8, tech: ['Redis', 'Cache-Aside'], details: 'Eliminate database bottlenecks by caching high-frequency queries and handling cache stampedes.' }
            ]
          },
          {
            week: 8,
            title: 'Background Job Queues & Asynchronous Workers',
            tasks: [
              { type: 'project', title: 'Build worker queue handling PDF generation and email dispatches', hours: 10, tech: ['BullMQ', 'Redis Streams'], details: 'Configure concurrency limits, exponential backoff retries, and dead letter queues (DLQ).' }
            ]
          }
        ]
      },
      {
        sprint_number: 5,
        phase: 'Phase 3: Days 61-90',
        theme: 'Sprint 5: Docker Containerization & Cloud Deployment',
        milestone_goal: 'Containerize frontend and backend services using multi-stage Dockerfiles and deploy with automated GitHub Actions CI/CD.',
        practical_project: 'Build a containerized multi-container full-stack application orchestrated with Docker Compose and cloud deployment.',
        certification_focus: {
          name: 'Docker Certified Associate (DCA)',
          issuer: 'Docker Inc.',
          url: 'https://www.docker.com/'
        },
        weeks: [
          {
            week: 9,
            title: 'Multi-Stage Dockerfiles & Image Minimization',
            tasks: [
              { type: 'skill', title: 'Create production multi-stage Alpine Docker images', hours: 8, tech: ['Docker', 'Alpine', 'Linux'], details: 'Shrink image sizes from 1GB to <80MB running under a non-root security context.' }
            ]
          },
          {
            week: 10,
            title: 'Automated CI/CD Workflows & Cloud Hosting',
            tasks: [
              { type: 'project', title: 'Write GitHub Actions pipeline for automated testing and deploy', hours: 8, tech: ['GitHub Actions', 'AWS/Render'], details: 'Automate linting, unit tests, Docker build, and seamless zero-downtime deployment.' }
            ]
          }
        ]
      },
      {
        sprint_number: 6,
        phase: 'Phase 3: Days 61-90',
        theme: 'Sprint 6: Scalability, System Design & Portfolio Finalization',
        milestone_goal: 'Conduct load testing, implement Prometheus metrics, benchmark database latency, and publish a flagship production GitHub repository.',
        practical_project: 'Publish a flagship production-grade full-stack web application with complete architectural diagrams and live demo.',
        certification_focus: {
          name: 'AWS Certified Cloud Practitioner or Developer Associate',
          issuer: 'Amazon Web Services',
          url: 'https://aws.amazon.com/certification/'
        },
        weeks: [
          {
            week: 11,
            title: 'Load Testing, Latency Benchmarking & Metrics',
            tasks: [
              { type: 'skill', title: 'Benchmark API under 500 concurrent requests with Autocannon / k6', hours: 8, tech: ['k6', 'Prometheus'], details: 'Identify database slow queries, memory leaks, and CPU saturation bottlenecks under sustained load.' }
            ]
          },
          {
            week: 12,
            title: 'Architectural Documentation & Portfolio Showcase',
            tasks: [
              { type: 'deliverable', title: 'Write comprehensive system architecture documentation and README', hours: 8, tech: ['Architecture Diagrams', 'README'], details: 'Include Mermaid architecture flowcharts, API schemas, and deployment instructions.' }
            ]
          }
        ]
      }
    ]
  },
  'frontend': {
    id: 'frontend',
    title: 'Modern Frontend Engineer Roadmap',
    role: 'Frontend Engineer',
    category: 'UI & Web Architecture',
    summary: 'The accredited roadmap from JavaScript ES6+ internals to advanced React 18, Next.js, state machines, Web Vitals, and browser rendering optimization.',
    icon: 'code',
    sprints: [
      {
        sprint_number: 1,
        phase: 'Phase 1: Days 1-30',
        theme: 'Sprint 1: JavaScript & TypeScript Mastery',
        milestone_goal: 'Master JS execution contexts, event loop, closures, TypeScript generics, and DOM performance.',
        practical_project: 'Build a vanilla TypeScript component library with custom event emitters and zero dependencies.',
        certification_focus: { name: 'Meta Front-End Developer Certificate', issuer: 'Meta (Coursera)' },
        weeks: [
          {
            week: 1,
            title: 'Browser Internals & Modern JavaScript',
            tasks: [
              { type: 'skill', title: 'Master Event Loop, Microtask Queue & V8 Memory Management', hours: 8, details: 'Understand how browsers parse HTML/CSS, calculate styles, layout, paint, and composite.' },
              { type: 'skill', title: 'Write advanced TypeScript generics and discriminating unions', hours: 6, details: 'Enforce type safety across complex asynchronous states without using `any`.' }
            ]
          },
          {
            week: 2,
            title: 'Modern CSS, Flexbox, Grid & Tailwind CSS',
            tasks: [
              { type: 'project', title: 'Build responsive layouts with modern CSS variables and dark mode', hours: 10, details: 'Master subgrid, container queries, clamp(), and accessible WCAG contrast standards.' }
            ]
          }
        ]
      },
      {
        sprint_number: 2,
        phase: 'Phase 1: Days 1-30',
        theme: 'Sprint 2: Advanced React 18 & Component Patterns',
        milestone_goal: 'Master compound component patterns, custom hooks, render optimization, and concurrent features.',
        practical_project: 'Build an accessible headless UI component library (Dropdown, Modal, Tabs) with ARIA support.',
        certification_focus: { name: 'React Advanced Certification', issuer: 'Meta' },
        weeks: [
          {
            week: 3,
            title: 'Compound Components & Custom Hooks',
            tasks: [
              { type: 'skill', title: 'Implement custom hooks for window resize, debouncing, and local storage', hours: 8, details: 'Encapsulate stateful logic cleanly with proper dependency arrays.' }
            ]
          },
          {
            week: 4,
            title: 'Render Profiling & Memoization Optimization',
            tasks: [
              { type: 'project', title: 'Profile and eliminate unnecessary component re-renders', hours: 8, details: 'Use React DevTools Profiler, React.memo, useMemo, and useCallback strategically.' }
            ]
          }
        ]
      },
      {
        sprint_number: 3,
        phase: 'Phase 2: Days 31-60',
        theme: 'Sprint 3: Next.js 14, SSR & State Management',
        milestone_goal: 'Master Next.js App Router, React Server Components (RSC), and global client state (Zustand / TanStack Query).',
        practical_project: 'Build a high-performance content platform with server-side rendering and client-side cached query feeds.',
        certification_focus: { name: 'Next.js App Router Specialist', issuer: 'Vercel' },
        weeks: [
          {
            week: 5,
            title: 'Next.js 14 App Router, RSC & Server Actions',
            tasks: [
              { type: 'skill', title: 'Implement Server Components with streaming data loaders', hours: 8, details: 'Use Suspense boundaries for instant loading states and progressive hydration.' }
            ]
          },
          {
            week: 6,
            title: 'Server State Management with TanStack Query',
            tasks: [
              { type: 'project', title: 'Implement infinite scrolling with automated cache invalidation', hours: 10, details: 'Handle optimistic mutations, stale-while-revalidate, and background refetching.' }
            ]
          }
        ]
      },
      {
        sprint_number: 4,
        phase: 'Phase 2: Days 31-60',
        theme: 'Sprint 4: Testing & Web Performance Optimization',
        milestone_goal: 'Write unit and integration tests with Vitest / React Testing Library and achieve 100/100 Core Web Vitals.',
        practical_project: 'Set up end-to-end testing with Playwright and automate Lighthouse performance budgets in CI.',
        certification_focus: { name: 'Web Performance & Core Web Vitals', issuer: 'Google Chrome Team' },
        weeks: [
          {
            week: 7,
            title: 'Unit & Integration Testing (Vitest + RTL)',
            tasks: [
              { type: 'skill', title: 'Write tests verifying user interactions, accessibility, and error states', hours: 8, details: 'Test components with mock service workers (MSW) without mocking implementation details.' }
            ]
          },
          {
            week: 8,
            title: 'Core Web Vitals & Bundle Size Reduction',
            tasks: [
              { type: 'project', title: 'Slash JavaScript bundle size by 40% with dynamic imports', hours: 8, details: 'Analyze webpack/vite bundles, lazy load heavy libraries, and optimize critical rendering paths.' }
            ]
          }
        ]
      }
    ]
  },
  'backend': {
    id: 'backend',
    title: 'Backend & Distributed Systems Roadmap',
    role: 'Backend Engineer',
    category: 'Server & Databases',
    summary: 'The authentic backend path: protocol design, relational and NoSQL databases, in-memory caching, message streaming, and distributed microservices.',
    icon: 'server',
    sprints: [
      {
        sprint_number: 1,
        phase: 'Phase 1: Days 1-30',
        theme: 'Sprint 1: Languages, HTTP Protocols & RESTful API Contracts',
        milestone_goal: 'Master Node.js/Go/Python async runtimes, HTTP/2, REST principles, and clean layered architectures.',
        practical_project: 'Build a production REST API with controller-service-repository patterns and OpenAPI specs.',
        certification_focus: { name: 'Node.js Application Developer (JSNAD)', issuer: 'Linux Foundation' },
        weeks: [
          {
            week: 1,
            title: 'Network Protocols & Async Event Loop',
            tasks: [
              { type: 'skill', title: 'Master HTTP/1.1 vs HTTP/2 vs HTTP/3 and WebSocket protocols', hours: 8, details: 'Understand TCP handshakes, TLS 1.3 encryption, and head-of-line blocking.' }
            ]
          },
          {
            week: 2,
            title: 'Clean Architecture & Validation',
            tasks: [
              { type: 'project', title: 'Implement controller, service, repository layering with Zod/Joi', hours: 10, details: 'Decouple domain logic from database drivers and HTTP transport protocols.' }
            ]
          }
        ]
      },
      {
        sprint_number: 2,
        phase: 'Phase 1: Days 1-30',
        theme: 'Sprint 2: Relational Databases & Query Optimization',
        milestone_goal: 'Master PostgreSQL schemas, B-tree indexes, execution plans (EXPLAIN ANALYZE), and ACID transactions.',
        practical_project: 'Benchmark and optimize a high-volume PostgreSQL database table holding 1,000,000 rows.',
        certification_focus: { name: 'PostgreSQL Certified Associate', issuer: 'PostgreSQL Professional' },
        weeks: [
          {
            week: 3,
            title: 'Database Indexing & Query Execution Plans',
            tasks: [
              { type: 'skill', title: 'Master B-Tree, Hash, and GIN indexes with EXPLAIN ANALYZE', hours: 8, details: 'Identify sequential scans, eliminate N+1 queries, and write efficient composite indexes.' }
            ]
          },
          {
            week: 4,
            title: 'Transactions, Row Locking & Migrations',
            tasks: [
              { type: 'project', title: 'Implement optimistic vs pessimistic locking for financial transactions', hours: 10, details: 'Prevent race conditions and double-spending bugs using isolation levels.' }
            ]
          }
        ]
      },
      {
        sprint_number: 3,
        phase: 'Phase 2: Days 31-60',
        theme: 'Sprint 3: Low-Latency Caching & Rate Limiting with Redis',
        milestone_goal: 'Implement Redis caching patterns, distributed locks (Redlock), and Token Bucket rate limiters.',
        practical_project: 'Build an API rate limiter and distributed session manager with Redis.',
        certification_focus: { name: 'Redis Certified Developer', issuer: 'Redis University' },
        weeks: [
          {
            week: 5,
            title: 'Redis Caching & Invalidation Patterns',
            tasks: [
              { type: 'skill', title: 'Implement Cache-Aside, Write-Through, and Cache Stampede protection', hours: 8, details: 'Use TTLs, mutex locks, and probabilistic early expiration algorithms.' }
            ]
          },
          {
            week: 6,
            title: 'Distributed Rate Limiting & Throttling',
            tasks: [
              { type: 'project', title: 'Build sliding-window rate limiter handling 50,000 requests/minute', hours: 10, details: 'Implement Redis sorted sets (ZSET) to throttle abusive traffic accurately.' }
            ]
          }
        ]
      },
      {
        sprint_number: 4,
        phase: 'Phase 2: Days 31-60',
        theme: 'Sprint 4: Asynchronous Messaging & Event Streams (Kafka/RabbitMQ)',
        milestone_goal: 'Master decoupled event-driven systems using Apache Kafka and RabbitMQ with idempotent processing.',
        practical_project: 'Build an event-driven order processing pipeline with Kafka partitions and consumer groups.',
        certification_focus: { name: 'Confluent Certified Developer for Apache Kafka', issuer: 'Confluent' },
        weeks: [
          {
            week: 7,
            title: 'Message Queues vs Log Streams',
            tasks: [
              { type: 'skill', title: 'Master Kafka Topics, Partitions, Offsets, and Consumer Rebalancing', hours: 8, details: 'Ensure ordered message consumption and handle poison pill messages with DLQs.' }
            ]
          },
          {
            week: 8,
            title: 'Idempotency & Event Sourcing',
            tasks: [
              { type: 'project', title: 'Implement idempotent event consumers with deduplication keys', hours: 10, details: 'Guarantee exactly-once processing semantics across unreliable network boundaries.' }
            ]
          }
        ]
      }
    ]
  },
  'devops': {
    id: 'devops',
    title: 'DevOps, SRE & Cloud Native Roadmap',
    role: 'Cloud / DevOps Engineer',
    category: 'Infrastructure & SRE',
    summary: 'The comprehensive cloud-native path: Linux system administration, Docker containers, Kubernetes cluster management, Terraform IaC, and GitOps CI/CD.',
    icon: 'server',
    sprints: [
      {
        sprint_number: 1,
        phase: 'Phase 1: Days 1-30',
        theme: 'Sprint 1: Linux Internals, Shell & Docker Containerization',
        milestone_goal: 'Master Linux kernel primitives (cgroups, namespaces), shell scripting, and multi-stage Docker builds.',
        practical_project: 'Package a multi-tier microservice into optimized Docker containers running non-root with Alpine.',
        certification_focus: { name: 'Linux Foundation Certified System Administrator (LFCS)', issuer: 'Linux Foundation' },
        weeks: [
          {
            week: 1,
            title: 'Linux Systems Administration & Bash Automation',
            tasks: [
              { type: 'skill', title: 'Master Linux permissions, systemd services, and networking (iptables)', hours: 8, details: 'Write shell scripts automating log rotation, disk monitoring, and process supervision.' }
            ]
          },
          {
            week: 2,
            title: 'Production Dockerfile Engineering',
            tasks: [
              { type: 'project', title: 'Build hardened multi-stage Docker containers with security scanning', hours: 10, details: 'Scan images with Trivy to eliminate CVE vulnerabilities and minimize layer sizes.' }
            ]
          }
        ]
      },
      {
        sprint_number: 2,
        phase: 'Phase 1: Days 1-30',
        theme: 'Sprint 2: Kubernetes Container Orchestration',
        milestone_goal: 'Master Kubernetes core resources (Pods, Deployments, Services, Ingress, ConfigMaps, PVCs) and Helm charts.',
        practical_project: 'Deploy a high-availability auto-scaling microservices cluster on Kubernetes with zero downtime.',
        certification_focus: { name: 'Certified Kubernetes Administrator (CKA)', issuer: 'CNCF & Linux Foundation' },
        weeks: [
          {
            week: 3,
            title: 'Kubernetes Architecture & Core Primitives',
            tasks: [
              { type: 'skill', title: 'Master Pod lifecycles, liveness/readiness probes, and ClusterIP networking', hours: 8, details: 'Configure rolling updates and zero-downtime graceful shutdown termination hooks.' }
            ]
          },
          {
            week: 4,
            title: 'Ingress, Cert-Manager & Helm Packaging',
            tasks: [
              { type: 'project', title: 'Package microservices into reusable Helm charts with automated SSL renewal', hours: 10, details: 'Set up Nginx Ingress Controller with Let’s Encrypt automated TLS certificates.' }
            ]
          }
        ]
      },
      {
        sprint_number: 3,
        phase: 'Phase 2: Days 31-60',
        theme: 'Sprint 3: Infrastructure as Code (Terraform) on AWS',
        milestone_goal: 'Provision multi-region cloud VPCs, subnets, NAT gateways, and managed Kubernetes clusters using Terraform.',
        practical_project: 'Write modular Terraform code to provision an entire production AWS cloud environment from scratch.',
        certification_focus: { name: 'HashiCorp Certified: Terraform Associate', issuer: 'HashiCorp' },
        weeks: [
          {
            week: 5,
            title: 'Terraform State Management & Modules',
            tasks: [
              { type: 'skill', title: 'Configure remote S3 state backend with DynamoDB lock tables', hours: 8, details: 'Prevent state file corruption and structure clean reusable cloud modules.' }
            ]
          },
          {
            week: 6,
            title: 'Cloud VPC Networking & IAM Security',
            tasks: [
              { type: 'project', title: 'Provision multi-AZ public and private subnets with least-privilege IAM', hours: 10, details: 'Deploy bastion hosts, NAT gateways, and security group firewall rules.' }
            ]
          }
        ]
      },
      {
        sprint_number: 4,
        phase: 'Phase 2: Days 31-60',
        theme: 'Sprint 4: CI/CD GitOps & Observability (Prometheus/Grafana)',
        milestone_goal: 'Automate GitOps delivery with ArgoCD and configure real-time monitoring and alerting with Prometheus.',
        practical_project: 'Deploy an automated GitOps release pipeline and custom Prometheus Grafana SRE dashboard.',
        certification_focus: { name: 'AWS Certified DevOps Engineer Professional', issuer: 'AWS' },
        weeks: [
          {
            week: 7,
            title: 'GitOps Continuous Delivery with ArgoCD',
            tasks: [
              { type: 'skill', title: 'Implement automated GitOps sync from git repository to Kubernetes cluster', hours: 8, details: 'Configure automated drift detection, canary deployments, and instant rollbacks.' }
            ]
          },
          {
            week: 8,
            title: 'SRE Observability & Alerting',
            tasks: [
              { type: 'project', title: 'Build Grafana dashboard tracking P99 latency, error rate, and saturation', hours: 10, details: 'Configure Alertmanager alerts sending instant notifications to Slack on SLA breaches.' }
            ]
          }
        ]
      }
    ]
  },
  'ai-ml': {
    id: 'ai-ml',
    title: 'AI, Machine Learning & MLOps Roadmap',
    role: 'AI / ML Engineer',
    category: 'Data Science & AI',
    summary: 'The complete AI engineer path: Python, statistics, PyTorch deep learning, LLM fine-tuning, RAG with vector databases, and scalable model serving.',
    icon: 'cpu',
    sprints: [
      {
        sprint_number: 1,
        phase: 'Phase 1: Days 1-30',
        theme: 'Sprint 1: Math Foundations, Python & Data Engineering',
        milestone_goal: 'Master linear algebra, multivariable calculus, probability, NumPy matrix manipulation, and Pandas pipelines.',
        practical_project: 'Build an end-to-end data cleaning, feature engineering, and visualization pipeline on raw datasets.',
        certification_focus: { name: 'IBM Data Science Professional Certificate', issuer: 'IBM (Coursera)' },
        weeks: [
          {
            week: 1,
            title: 'Linear Algebra, Matrix Calculus & NumPy',
            tasks: [
              { type: 'skill', title: 'Master Eigenvalues, SVD, Gradient Descent, and vectorized tensor math', hours: 8, details: 'Implement backpropagation and matrix multiplication from scratch without high-level frameworks.' }
            ]
          },
          {
            week: 2,
            title: 'Data Wrangling with Pandas & Feature Engineering',
            tasks: [
              { type: 'project', title: 'Clean real-world missing data, handle outliers, and encode features', hours: 10, details: 'Perform exploratory data analysis (EDA) with Seaborn and Matplotlib.' }
            ]
          }
        ]
      },
      {
        sprint_number: 2,
        phase: 'Phase 1: Days 1-30',
        theme: 'Sprint 2: Classic Machine Learning & Scikit-Learn',
        milestone_goal: 'Master regression, classification, random forests, gradient boosting (XGBoost/LightGBM), and hyperparameter tuning.',
        practical_project: 'Train and validate a high-accuracy predictive model with cross-validation and ROC-AUC benchmarking.',
        certification_focus: { name: 'Machine Learning Specialization', issuer: 'DeepLearning.AI (Andrew Ng)' },
        weeks: [
          {
            week: 3,
            title: 'Supervised & Unsupervised Learning Algorithms',
            tasks: [
              { type: 'skill', title: 'Master Logistic Regression, SVMs, Decision Trees, and K-Means Clustering', hours: 8, details: 'Understand bias-variance tradeoff, regularization (L1/L2), and confusion matrices.' }
            ]
          },
          {
            week: 4,
            title: 'Ensemble Learning & Gradient Boosting (XGBoost)',
            tasks: [
              { type: 'project', title: 'Tune XGBoost model with Optuna to minimize validation loss', hours: 10, details: 'Perform k-fold cross validation and analyze SHAP feature importance values.' }
            ]
          }
        ]
      },
      {
        sprint_number: 3,
        phase: 'Phase 2: Days 31-60',
        theme: 'Sprint 3: Deep Learning, PyTorch & Neural Networks',
        milestone_goal: 'Master PyTorch tensors, autograd, CNNs for computer vision, RNNs/LSTMs, and the Transformer Attention Mechanism.',
        practical_project: 'Build, train, and evaluate a custom deep neural network in PyTorch with GPU acceleration.',
        certification_focus: { name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI' },
        weeks: [
          {
            week: 5,
            title: 'PyTorch Fundamentals, Custom Datasets & Training Loops',
            tasks: [
              { type: 'skill', title: 'Implement custom PyTorch Datasets, Dataloaders, and training loops', hours: 8, details: 'Write loss functions, AdamW optimizers, learning rate schedulers, and checkpointing.' }
            ]
          },
          {
            week: 6,
            title: 'The Transformer Architecture & Self-Attention',
            tasks: [
              { type: 'project', title: 'Implement Multi-Head Self-Attention from scratch in PyTorch', hours: 10, details: 'Understand query, key, value projections, positional encodings, and causal masking.' }
            ]
          }
        ]
      },
      {
        sprint_number: 4,
        phase: 'Phase 2: Days 31-60',
        theme: 'Sprint 4: Large Language Models, RAG & MLOps Deployment',
        milestone_goal: 'Build production Retrieval-Augmented Generation (RAG) pipelines with vector databases and deploy models with FastAPI.',
        practical_project: 'Deploy a production RAG application with LangChain, Pinecone/Qdrant, and Dockerized FastAPI.',
        certification_focus: { name: 'TensorFlow Developer or AWS Machine Learning Specialty', issuer: 'Google / AWS' },
        weeks: [
          {
            week: 7,
            title: 'Embeddings, Vector Databases & RAG Architecture',
            tasks: [
              { type: 'skill', title: 'Build RAG pipeline with chunking, semantic search, and reranking', hours: 8, details: 'Integrate OpenAI/HuggingFace embeddings with Qdrant/Chroma for hallucination-free retrieval.' }
            ]
          },
          {
            week: 8,
            title: 'Model Serving, Quantization & MLOps',
            tasks: [
              { type: 'project', title: 'Deploy sub-100ms model inference API using vLLM and FastAPI in Docker', hours: 10, details: 'Implement 4-bit/8-bit quantization and monitor inference latency in production.' }
            ]
          }
        ]
      }
    ]
  }
};

// Helper: match incoming targetRole string to standard role roadmap
function resolveRoadmapForRole(targetRoleStr?: string): RoleRoadmapDefinition {
  if (!targetRoleStr) return REAL_ROLE_ROADMAPS['full-stack'];
  const r = targetRoleStr.toLowerCase();

  if (r.includes('front') || r.includes('react') || r.includes('ui') || r.includes('web design')) {
    return REAL_ROLE_ROADMAPS['frontend'];
  }
  if (r.includes('back') || r.includes('node') || r.includes('api') || r.includes('distributed')) {
    return REAL_ROLE_ROADMAPS['backend'];
  }
  if (r.includes('devops') || r.includes('cloud') || r.includes('sre') || r.includes('infrastructure') || r.includes('kubernetes')) {
    return REAL_ROLE_ROADMAPS['devops'];
  }
  if (r.includes('ai') || r.includes('data') || r.includes('ml') || r.includes('machine learning') || r.includes('python')) {
    return REAL_ROLE_ROADMAPS['ai-ml'];
  }
  return REAL_ROLE_ROADMAPS['full-stack'];
}

interface CareerRoadmapTabProps {
  roadmap?: any;
  isTemporary?: boolean;
  onClearTemporary?: () => void;
  onNavigate?: (tab: string) => void;
}

export function CareerRoadmapTab({ 
  roadmap, 
  isTemporary = false, 
  onClearTemporary,
  onNavigate 
}: CareerRoadmapTabProps) {
  // Determine candidate's target role name
  const candidateRoleName = roadmap?.targetRole || 
    roadmap?.title?.replace("Learning Roadmap for ", "")?.replace("Target Opportunity Sprint Roadmap: ", "")?.replace("30-60-90 Day Career Roadmap for ", "") || 
    "Full Stack Engineer";

  // Match the authentic default roadmap for this role
  const defaultRoadmap = useMemo(() => resolveRoadmapForRole(candidateRoleName), [candidateRoleName]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>(defaultRoadmap.id);
  const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>({});

  // Sync role when resume changes
  useEffect(() => {
    setSelectedRoleId(defaultRoadmap.id);
  }, [defaultRoadmap.id]);

  const currentRoleRoadmap = REAL_ROLE_ROADMAPS[selectedRoleId] || defaultRoadmap;

  // Use sprints from candidate's roadmap if valid and populated, otherwise use authentic role curriculum
  const activeSprints: StandardSprint[] = useMemo(() => {
    if (roadmap?.sprints && Array.isArray(roadmap.sprints) && roadmap.sprints.length > 0) {
      // Validate that sprints have weeks
      const hasValidWeeks = roadmap.sprints.some((s: any) => s.weeks && s.weeks.length > 0);
      if (hasValidWeeks && selectedRoleId === defaultRoadmap.id) {
        return roadmap.sprints;
      }
    }
    return currentRoleRoadmap.sprints;
  }, [roadmap, currentRoleRoadmap, selectedRoleId, defaultRoadmap.id]);

  // Initial check-all
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    activeSprints.forEach((sprint: any, sIdx: number) => {
      sprint.weeks?.forEach((week: any, wIdx: number) => {
        week.tasks?.forEach((task: any, tIdx: number) => {
          initial[`${sIdx}-${wIdx}-${tIdx}`] = true;
        });
      });
    });
    setSelectedTasks(initial);
  }, [activeSprints]);

  const toggleSelect = (sIdx: number, wIdx: number, tIdx: number) => {
    const key = `${sIdx}-${wIdx}-${tIdx}`;
    setSelectedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAll = (val: boolean) => {
    const updated: Record<string, boolean> = {};
    activeSprints.forEach((sprint: any, sIdx: number) => {
      sprint.weeks?.forEach((week: any, wIdx: number) => {
        week.tasks?.forEach((task: any, tIdx: number) => {
          updated[`${sIdx}-${wIdx}-${tIdx}`] = val;
        });
      });
    });
    setSelectedTasks(updated);
    toast.success(val ? "All tasks selected!" : "Deselected all tasks.");
  };

  const copyToClipboard = () => {
    let md = `# Real Career Learning Roadmap: ${currentRoleRoadmap.title}\n`;
    md += `Target Role: ${currentRoleRoadmap.roleName}\n\n`;
    md += `${currentRoleRoadmap.summary}\n\n`;

    activeSprints.forEach((sprint, sIdx) => {
      md += `## SPRINT ${sprint.sprint_number || sIdx + 1}: ${sprint.theme}\n`;
      md += `Phase: ${sprint.phase} | Milestone Goal: ${sprint.milestone_goal}\n`;
      if (sprint.practical_project) md += `Project Deliverable: ${sprint.practical_project}\n`;
      if (sprint.certification_focus?.name) md += `Target Certification: ${sprint.certification_focus.name}\n\n`;

      sprint.weeks?.forEach((week) => {
        md += `### Week ${week.week}: ${week.title}\n`;
        week.tasks?.forEach((task, tIdx) => {
          const key = `${sIdx}-${week.week}-${tIdx}`;
          const isDone = selectedTasks[key] !== false ? '[ ]' : '[x]';
          md += `- ${isDone} **[${task.type.toUpperCase()}]** ${task.title} (${task.hours}h)\n`;
          if (task.details) md += `  - Details: ${task.details}\n`;
        });
        md += `\n`;
      });
    });

    navigator.clipboard.writeText(md).then(() => {
      toast.success("Roadmap checklist copied to clipboard!");
    }).catch(() => {
      toast.error("Failed writing to clipboard.");
    });
  };

  // Calculate task counts
  let totalTasks = 0;
  let doneTasks = 0;
  activeSprints.forEach((sprint: any, sIdx: number) => {
    sprint.weeks?.forEach((week: any, wIdx: number) => {
      week.tasks?.forEach((_: any, tIdx: number) => {
        totalTasks++;
        if (selectedTasks[`${sIdx}-${wIdx}-${tIdx}`] !== false) {
          doneTasks++;
        }
      });
    });
  });

  const completionPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 100;
  const isTemp = isTemporary || roadmap?.isTemporary;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 px-2 sm:px-4">
      
      {/* On-The-Fly Temporary Roadmap Banner */}
      {isTemp && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  On-The-Fly Target Role Roadmap
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Custom View
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Viewing authentic step-by-step roadmap for <strong>&ldquo;{currentRoleRoadmap.roleName}&rdquo;</strong>.
              </p>
            </div>
          </div>

          {onClearTemporary && (
            <Button
              onClick={onClearTemporary}
              variant="outline"
              size="sm"
              className="rounded-xl border-amber-500/40 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs gap-1.5 h-10 px-4 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return to Scanned Profile</span>
            </Button>
          )}
        </motion.div>
      )}

      {/* HEADER SECTION */}
      <section className="text-center space-y-5 relative pt-2">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 blur-[100px] -z-10 rounded-full" />
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-1 border border-primary/20">
          <Target className="w-3.5 h-3.5" />
          <span>Real-World Technical Career Roadmap</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-foreground">
          {currentRoleRoadmap.title}
        </h1>

        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed px-4">
          The accredited, step-by-step career path followed by engineers to become a production-ready <strong className="text-foreground">&ldquo;{currentRoleRoadmap.roleName}&rdquo;</strong>.
        </p>

        {/* ROLE SELECTION PILLS */}
        <div className="pt-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
            Select Target Engineering Path:
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Object.values(REAL_ROLE_ROADMAPS).map((r) => {
              const isSelected = r.id === selectedRoleId;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                  )}
                >
                  <span>{r.roleName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => {
              toast.info("Generating Career Roadmap (PDF)...");
              generateRoadmapPdf({
                candidateName: "Candidate",
                targetRole: currentRoleRoadmap.roleName,
                roadmap: {
                  title: currentRoleRoadmap.title,
                  sprints: activeSprints
                }
              });
              toast.success("Career Roadmap (PDF) downloaded!");
            }}
            className="rounded-2xl h-11 px-5 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2 text-xs cursor-pointer"
            title="Download Career Roadmap as PDF"
          >
            <Download className="w-4 h-4" />
            <span>Download Roadmap (PDF)</span>
          </Button>

          <Button
            onClick={copyToClipboard}
            className="rounded-2xl h-11 px-6 font-black bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg flex items-center gap-2 text-xs cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            Copy Roadmap Checklist
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => selectAll(true)}
            className="rounded-xl h-11 border text-xs font-bold px-4 cursor-pointer"
          >
            Select All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => selectAll(false)}
            className="rounded-xl h-11 border text-xs font-bold px-4 text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 cursor-pointer"
          >
            Deselect All
          </Button>
        </div>
      </section>

      {/* Week-by-Week Roadmap Timeline */}
      <section className="space-y-12">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
              Sprint & Weekly Milestone Path
            </h2>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {activeSprints.length} Sprints • 30-60-90 Days
          </span>
        </div>

        <div className="space-y-12 relative px-2">
          <div className="absolute top-0 bottom-0 left-[2.5rem] w-1 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent hidden md:block" />

          {activeSprints.map((sprint, sIdx) => (
            <div key={sIdx} className="relative">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                
                {/* Sprint Number Badge */}
                <div className="md:w-28 shrink-0 relative">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg md:text-xl shadow-xl shadow-primary/25 md:sticky md:top-24 z-20 mx-auto md:mx-0">
                    {sprint.sprint_number || sIdx + 1}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card border border-border rounded-lg flex items-center justify-center text-primary text-[9px] font-black shadow-sm">
                      S{sIdx + 1}
                    </div>
                  </div>
                </div>

                {/* Sprint Content */}
                <div className="flex-1 space-y-6">
                  <div className="glass p-6 md:p-7 rounded-[2rem] border border-border bg-card/80 shadow-md space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                          SPRINT {sprint.sprint_number || sIdx + 1}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold">
                          {sprint.phase || (sIdx < 2 ? "Phase 1: Days 1-30" : sIdx < 4 ? "Phase 2: Days 31-60" : "Phase 3: Days 61-90")}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg md:text-xl font-black tracking-tight text-foreground">
                      {sprint.theme}
                    </h3>

                    {/* Milestone Goal & Practical Project Callouts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      {sprint.milestone_goal && (
                        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                          <span className="font-black text-[10px] uppercase text-primary flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5" />
                            Milestone Goal
                          </span>
                          <p className="text-muted-foreground leading-relaxed">
                            {sprint.milestone_goal}
                          </p>
                        </div>
                      )}

                      {sprint.practical_project && (
                        <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-1">
                          <span className="font-black text-[10px] uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <Code className="w-3.5 h-3.5" />
                            Hands-on Production Deliverable
                          </span>
                          <p className="text-foreground/90 font-medium leading-relaxed">
                            {sprint.practical_project}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Recommended Certification Banner */}
                    {sprint.certification_focus && (
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="font-bold text-foreground">
                            Target Certification: <strong className="text-emerald-600 dark:text-emerald-400">{sprint.certification_focus.name}</strong>
                            {sprint.certification_focus.issuer && ` (${sprint.certification_focus.issuer})`}
                          </span>
                        </div>
                        {sprint.certification_focus.url && (
                          <a 
                            href={sprint.certification_focus.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shrink-0 hover:bg-emerald-700 transition-all flex items-center gap-1"
                          >
                            <span>Explore Exam</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {sprint.weeks?.map((week, wIdx) => (
                      <Card key={wIdx} className="glass border border-border/80 rounded-[2rem] overflow-hidden shadow-md bg-card/60">
                        <div className="p-6 md:p-7 space-y-5">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-black">
                              Week {week.week}
                            </span>
                            <h4 className="font-extrabold text-base tracking-tight leading-snug text-foreground">
                              {week.title}
                            </h4>
                          </div>

                          <div className="space-y-3.5">
                            {week.tasks?.map((task, tIdx) => {
                              const isChecked = selectedTasks[`${sIdx}-${wIdx}-${tIdx}`] !== false;
                              return (
                                <div 
                                  key={tIdx}
                                  onClick={() => toggleSelect(sIdx, wIdx, tIdx)}
                                  className={cn(
                                    "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none",
                                    isChecked 
                                      ? "bg-muted/40 border-border hover:bg-muted/60" 
                                      : "bg-muted/10 border-transparent opacity-60 hover:opacity-100"
                                  )}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {isChecked ? (
                                      <CheckSquare className="w-4 h-4 text-primary" />
                                    ) : (
                                      <Square className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className={cn(
                                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                                        (task.type === 'course' || task.type === 'cert') ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                                        (task.type === 'project' || task.type === 'deliverable') ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                                        "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                      )}>
                                        {task.type}
                                      </span>
                                      {task.hours && (
                                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {task.hours}h
                                        </span>
                                      )}
                                      {task.platform && (
                                        <span className="text-[10px] text-muted-foreground truncate">
                                          • {task.platform}
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-xs font-bold text-foreground">
                                      {task.title}
                                    </p>

                                    {task.details && (
                                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                        {task.details}
                                      </p>
                                    )}

                                    {task.tech && task.tech.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {task.tech.map((tc, tcIdx) => (
                                          <span key={tcIdx} className="text-[9px] font-medium px-2 py-0.5 rounded bg-background text-muted-foreground border border-border">
                                            {tc}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
