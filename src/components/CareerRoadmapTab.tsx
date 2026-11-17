import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  ArrowRight, 
  BookOpen, 
  Code, 
  Lightbulb, 
  Trophy, 
  Target, 
  Sparkles, 
  Zap, 
  Copy, 
  CheckSquare, 
  Square, 
  Award, 
  ChevronRight, 
  Layers, 
  Server, 
  Database, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Activity, 
  Radio, 
  Workflow, 
  Clock, 
  Download, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ==========================================
// REAL-WORLD ARCHITECTURAL ROADMAP DATA
// ==========================================

export interface ArchitectureNode {
  id: string;
  name: string;
  subtitle: string;
  tier: string;
  latencyTarget: string;
  badge: string;
  iconType: 'globe' | 'shield' | 'server' | 'zap' | 'radio' | 'database' | 'activity' | 'workflow' | 'layers';
  summary: string;
  realWorldUseCase: string;
  coreConcepts: string[];
  patternsAndTradeoffs: string[];
  industryTools: string[];
  interviewQuestions: string[];
  recommendedDocUrl?: string;
}

export interface RoadmapTrack {
  id: string;
  title: string;
  role: string;
  description: string;
  overviewSummary: string;
  nodes: ArchitectureNode[];
}

export const ARCHITECTURE_TRACKS: RoadmapTrack[] = [
  {
    id: 'system-design',
    title: 'System Design & Distributed Architecture',
    role: 'Software Architect / Senior Backend Engineer',
    description: 'The authentic, end-to-end distributed systems blueprint used by top tech companies to scale from 1,000 to 10,000,000+ daily active users.',
    overviewSummary: 'Real system design follows an explicit multi-tiered architecture: Edge Routing ➔ Traffic Ingress & Rate Limiting ➔ Stateless Compute ➔ In-Memory Caching & Event Streaming ➔ Sharded Persistence & SRE Observability.',
    nodes: [
      {
        id: 'tier-1-edge',
        name: 'Edge & Network Ingress Layer',
        subtitle: 'Global DNS, Anycast & CDN Caching',
        tier: 'Tier 1: Global Edge',
        latencyTarget: '< 15ms',
        badge: 'Network Edge',
        iconType: 'globe',
        summary: 'Directs incoming user traffic to the closest geographical data center while terminating TLS and caching static media at the network edge.',
        realWorldUseCase: 'Cloudflare or AWS CloudFront serving images, JavaScript bundles, and static assets from 300+ edge locations worldwide without hitting origin servers.',
        coreConcepts: [
          'DNS Resolution & Anycast IP Routing (BGP protocol)',
          'CDN Edge Caching & Cache-Control headers (stale-while-revalidate)',
          'Edge SSL/TLS 1.3 Termination & HTTP/3 (QUIC protocol)',
          'DDoS Protection & Cloud WAF (Web Application Firewall)'
        ],
        patternsAndTradeoffs: [
          'Trade-off: Edge Caching speeds up assets but introduces cache invalidation lag.',
          'GeoDNS allows zero-downtime multi-region failover when a region goes offline.'
        ],
        industryTools: ['Cloudflare', 'AWS CloudFront', 'Fastly', 'Route 53', 'Akamai'],
        interviewQuestions: [
          'What happens when you type google.com into your browser? (Full network stack walk-through)',
          'How does Anycast routing distribute traffic across global data centers without a central load balancer?'
        ],
        recommendedDocUrl: 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/'
      },
      {
        id: 'tier-2-traffic',
        name: 'Traffic Ingress & Security Layer',
        subtitle: 'L4/L7 Load Balancing, API Gateway & Rate Limiting',
        tier: 'Tier 2: Traffic Gateway',
        latencyTarget: '< 25ms',
        badge: 'Gateway & Defense',
        iconType: 'shield',
        summary: 'Directs, authenticates, and rate-limits incoming HTTP/gRPC requests before distributing them across stateless application instances.',
        realWorldUseCase: 'An API Gateway that validates user JWT tokens and limits requests to 100 req/min per user before forwarding traffic to internal microservices.',
        coreConcepts: [
          'Layer 4 (Transport / TCP) vs Layer 7 (Application / HTTP) Load Balancing',
          'Load Balancing Algorithms: Round Robin, Least Connections, Consistent Hashing',
          'API Gateway: Centralized Authentication, SSL Offloading, Routing, CORS',
          'Rate Limiting Algorithms: Token Bucket, Leaky Bucket, Sliding Window Log'
        ],
        patternsAndTradeoffs: [
          'L4 is extremely fast (packet-level routing) but cannot inspect HTTP headers or cookies.',
          'L7 allows smart routing based on URI path (/api/v1/checkout) but incurs slight CPU overhead.'
        ],
        industryTools: ['Nginx', 'HAProxy', 'Envoy Proxy', 'Kong API Gateway', 'AWS ALB/NLB'],
        interviewQuestions: [
          'Design an API Rate Limiter that handles 100,000 requests per second across distributed servers.',
          'Explain the difference between Token Bucket and Leaky Bucket algorithms.'
        ],
        recommendedDocUrl: 'https://www.nginx.com/resources/glossary/load-balancing/'
      },
      {
        id: 'tier-3-compute',
        name: 'Application & Microservices Compute',
        subtitle: 'Stateless Service Mesh, gRPC & Business Logic',
        tier: 'Tier 3: Core Compute',
        latencyTarget: '< 40ms',
        badge: 'Stateless Core',
        iconType: 'server',
        summary: 'Executes core domain logic across horizontally scalable, stateless containerized services communicating via high-performance protocols.',
        realWorldUseCase: 'Separating an e-commerce platform into dedicated Order, Inventory, Payment, and Notification microservices.',
        coreConcepts: [
          'Stateless Architecture: Sessions stored in Redis/JWT rather than server memory',
          'Inter-Service Communication: REST (JSON) vs gRPC (HTTP/2 Protocol Buffers)',
          'Service Mesh (Istio / Envoy): Mutual TLS, canary deployments, tracing',
          'Horizontal Pod Autoscaling (HPA) based on CPU/RAM and queue backlog'
        ],
        patternsAndTradeoffs: [
          'Microservices allow independent deployment and language flexibility, but introduce network latency and distributed failure modes.',
          'Start with a modular monolith first; split into microservices only when domain boundaries and scale demand it.'
        ],
        industryTools: ['Node.js/TypeScript', 'Go', 'Docker', 'Kubernetes (K8s)', 'gRPC', 'Istio'],
        interviewQuestions: [
          'How do you handle a distributed transaction across Payment and Inventory services without 2-phase commit locking? (Saga Pattern)',
          'Why is gRPC significantly faster than standard JSON REST APIs for internal service communication?'
        ],
        recommendedDocUrl: 'https://microservices.io/patterns/microservices.html'
      },
      {
        id: 'tier-4-cache',
        name: 'In-Memory Caching Layer',
        subtitle: 'Redis Cluster & Sub-Millisecond Data Access',
        tier: 'Tier 4: Memory Cache',
        latencyTarget: '< 2ms',
        badge: 'Ultra Low-Latency',
        iconType: 'zap',
        summary: 'Stores frequently requested data in RAM to eliminate database bottlenecks and achieve sub-millisecond query response times.',
        realWorldUseCase: 'Caching user profile data and product catalog listings in Redis so 95% of reads never touch the primary database.',
        coreConcepts: [
          'Caching Patterns: Cache-Aside (Lazy Loading), Write-Through, Write-Behind, Refresh-Ahead',
          'Cache Invalidation Strategies: TTL (Time-To-Live), Event-driven purges',
          'Cache Eviction Policies: LRU (Least Recently Used), LFU (Least Frequently Used)',
          'Mitigating Pitfalls: Cache Penetration (Bloom filters), Cache Breakdown (Mutex locks), Cache Stampede / Avalanche'
        ],
        patternsAndTradeoffs: [
          'Cache-Aside ensures that only requested data is cached, but incurs a cache-miss latency spike on the initial request.',
          'In-memory storage is 10x-50x faster than SSD, but is volatile and significantly more expensive per gigabyte.'
        ],
        industryTools: ['Redis (Cluster / Sentinel)', 'Memcached', 'DragonflyDB', 'KeyDB'],
        interviewQuestions: [
          'How do you solve the Cache Avalanche problem when 100,000 cached keys expire at the exact same second?',
          'What is a Bloom Filter and how does it prevent Cache Penetration?'
        ],
        recommendedDocUrl: 'https://redis.io/docs/latest/develop/use/patterns/'
      },
      {
        id: 'tier-5-async',
        name: 'Asynchronous Messaging & Event Streams',
        subtitle: 'Kafka, RabbitMQ & Decoupled Processing',
        tier: 'Tier 5: Event Bus',
        latencyTarget: 'Async (< 100ms)',
        badge: 'Event-Driven',
        iconType: 'radio',
        summary: 'Decouples heavy or slow tasks from the user request cycle using distributed message queues and log-based event streams.',
        realWorldUseCase: 'When an order is placed, publishing an "OrderCreated" event to Kafka so Email, Analytics, and Shipping workers process it in parallel.',
        coreConcepts: [
          'Message Queues (RabbitMQ/SQS) vs Log-Based Event Streams (Apache Kafka)',
          'Kafka Architecture: Topics, Partitions, Consumer Groups, Offsets, Rebalance',
          'Idempotent Processing: Handling duplicate messages safely using deduplication keys',
          'Dead Letter Queues (DLQ) & Exponential Backoff retry policies',
          'Event Sourcing & CQRS (Command Query Responsibility Segregation)'
        ],
        patternsAndTradeoffs: [
          'Message queues decouple systems and absorb burst traffic, but introduce eventual consistency and out-of-order delivery challenges.'
        ],
        industryTools: ['Apache Kafka', 'RabbitMQ', 'Amazon SQS / SNS', 'Apache Pulsar', 'Redis Streams'],
        interviewQuestions: [
          'How does Kafka guarantee message ordering within a partition?',
          'How do you design an idempotent consumer that processes payment events without double-charging users?'
        ],
        recommendedDocUrl: 'https://kafka.apache.org/documentation/'
      },
      {
        id: 'tier-6-data',
        name: 'Database & Persistence Architecture',
        subtitle: 'SQL, NoSQL, Sharding & Read-Replicas',
        tier: 'Tier 6: Persistent Storage',
        latencyTarget: '< 15ms',
        badge: 'Data Integrity',
        iconType: 'database',
        summary: 'Stores application state with strict consistency (ACID) or high-throughput availability (BASE), scaled across replicas and shards.',
        realWorldUseCase: 'Sharding a multi-million user database horizontally across 16 PostgreSQL nodes using user_id hash modulo.',
        coreConcepts: [
          'SQL (PostgreSQL, MySQL) vs NoSQL (MongoDB, DynamoDB, Cassandra)',
          'Database Scaling: Master-Replica Replication (1 Write Master, N Read Replicas)',
          'Horizontal Sharding (Partitioning) & Consistent Hashing',
          'ACID Transactions (Atomicity, Consistency, Isolation, Durability) vs BASE',
          'CAP Theorem: Consistency vs Availability vs Partition Tolerance'
        ],
        patternsAndTradeoffs: [
          'Read replicas scale read queries infinitely, but introduce replication lag (stale reads).',
          'Sharding allows petabyte-scale storage, but makes cross-shard JOINs and transactions complex and expensive.'
        ],
        industryTools: ['PostgreSQL', 'MySQL', 'MongoDB Atlas', 'Amazon DynamoDB', 'Apache Cassandra', 'ClickHouse'],
        interviewQuestions: [
          'Explain the CAP Theorem and give a real-world scenario where you would choose Availability over Consistency.',
          'How do you shard a database table with 500 million rows without downtime?'
        ],
        recommendedDocUrl: 'https://www.postgresql.org/docs/'
      },
      {
        id: 'tier-7-sre',
        name: 'Observability, SRE & Fault Tolerance',
        subtitle: 'Prometheus, Distributed Tracing & Circuit Breakers',
        tier: 'Tier 7: Reliability & SRE',
        latencyTarget: 'Continuous',
        badge: 'High Reliability',
        iconType: 'activity',
        summary: 'Monitors system health, traces distributed requests across microservices, and prevents cascading failures with circuit breakers.',
        realWorldUseCase: 'A circuit breaker that stops calling an overloaded payment gateway after 5 failed attempts, serving a fallback response instead of hanging.',
        coreConcepts: [
          'The 3 Pillars of Observability: Metrics, Distributed Traces, Centralized Logs',
          'The 4 Golden Signals of SRE: Latency (P50, P95, P99), Traffic, Errors, Saturation',
          'Distributed Tracing: Trace IDs and Span IDs propagating across microservices',
          'Fault Tolerance Patterns: Circuit Breaker, Bulkhead, Retry with Jitter, Graceful Degradation'
        ],
        patternsAndTradeoffs: [
          'Observability adds ~1-2% compute overhead and storage costs, but reduces MTTR (Mean Time to Resolution) from hours to minutes.'
        ],
        industryTools: ['Prometheus', 'Grafana', 'OpenTelemetry', 'Jaeger', 'Datadog', 'ELK Stack / Loki'],
        interviewQuestions: [
          'What is the difference between average latency and P99 latency, and why do architects care about P99?',
          'Explain how the Circuit Breaker pattern works (Closed, Open, Half-Open states).'
        ],
        recommendedDocUrl: 'https://opentelemetry.io/docs/'
      }
    ]
  },
  {
    id: 'backend-architecture',
    title: 'Modern Backend & API Architecture',
    role: 'Backend Systems Engineer',
    description: 'The real-world engineering roadmap covering protocol design, database modeling, authentication architectures, and enterprise cloud deployments.',
    overviewSummary: 'Engineered for developers building high-throughput REST/gRPC backend services with clean domain modeling, connection pooling, and production CI/CD.',
    nodes: [
      {
        id: 'be-tier-1',
        name: 'Protocols & API Contract Design',
        subtitle: 'HTTP/1.1, HTTP/2, WebSockets & gRPC',
        tier: 'Foundation: Communication',
        latencyTarget: '< 20ms',
        badge: 'Protocol Specs',
        iconType: 'globe',
        summary: 'Designing robust client-server contracts utilizing appropriate communication protocols for synchronous and real-time bidirectional data flows.',
        realWorldUseCase: 'Using REST/JSON for external public endpoints, WebSockets for live chat notifications, and gRPC for high-speed backend services.',
        coreConcepts: [
          'HTTP Methods, Status Codes & Idempotency (POST vs PUT vs PATCH)',
          'WebSockets & Server-Sent Events (SSE) for real-time bidirectional feeds',
          'gRPC & Protocol Buffers for high-efficiency binary transport',
          'OpenAPI / Swagger documentation and contract-first API design'
        ],
        patternsAndTradeoffs: ['WebSockets keep long-lived TCP connections open, requiring stateful connection managers.'],
        industryTools: ['Postman', 'Protobuf', 'Swagger/OpenAPI', 'Socket.io', 'Fastify'],
        interviewQuestions: ['When would you use Server-Sent Events (SSE) over WebSockets?'],
        recommendedDocUrl: 'https://grpc.io/docs/'
      },
      {
        id: 'be-tier-2',
        name: 'Database Modeling & Indexing Mechanics',
        subtitle: 'B-Trees, Composite Indexes & Query Optimization',
        tier: 'Core: Data Engines',
        latencyTarget: '< 10ms',
        badge: 'Database Performance',
        iconType: 'database',
        summary: 'Architecting relational schemas with normalized relations, optimal B-tree indexes, and optimized query execution plans.',
        realWorldUseCase: 'Adding a composite index (tenant_id, created_at DESC) to speed up an order history query from 4.2 seconds to 8 milliseconds.',
        coreConcepts: [
          'B-Tree and Hash Indexes: How indexes work internally on disk',
          'EXPLAIN ANALYZE: Reading query execution plans and index scans',
          'Connection Pooling (PgBouncer) & Connection Limits',
          'Database Migrations & Zero-Downtime Schema Updates'
        ],
        patternsAndTradeoffs: ['Every index speeds up reads but slows down writes (INSERT/UPDATE/DELETE).'],
        industryTools: ['PostgreSQL', 'PgBouncer', 'Prisma', 'Drizzle ORM', 'Flyway'],
        interviewQuestions: ['Why does SELECT * FROM orders WHERE status = "pending" perform a full table scan even with an index?'],
        recommendedDocUrl: 'https://use-the-index-luke.com/'
      },
      {
        id: 'be-tier-3',
        name: 'Authentication, Authorization & Secrets',
        subtitle: 'OAuth2, JWT, RBAC & Secret Management',
        tier: 'Security: Zero-Trust',
        latencyTarget: '< 5ms',
        badge: 'Security & Auth',
        iconType: 'shield',
        summary: 'Securing API endpoints using stateless access tokens, refresh token rotation, role-based access control, and encrypted secret vaults.',
        realWorldUseCase: 'Implementing short-lived JWT access tokens (15-min) paired with secure HttpOnly refresh cookies stored in Redis.',
        coreConcepts: [
          'OAuth 2.0 Authorization Code Flow with PKCE',
          'JWT (JSON Web Tokens): Claims, Signing algorithms (RS256 vs HS256)',
          'Role-Based Access Control (RBAC) & Attribute-Based Access Control (ABAC)',
          'Secret Management & Encryption at Rest (KMS, Vault)'
        ],
        patternsAndTradeoffs: ['Stateless JWTs cannot be revoked immediately without checking a blacklist in Redis.'],
        industryTools: ['Auth0', 'HashiCorp Vault', 'AWS KMS', 'Passport.js', 'Jose JWT'],
        interviewQuestions: ['How do you immediately revoke an active JWT token before its expiration time?'],
        recommendedDocUrl: 'https://oauth.net/2/'
      },
      {
        id: 'be-tier-4',
        name: 'Background Jobs & Distributed Task Queues',
        subtitle: 'BullMQ, Celery & Scheduled Workflows',
        tier: 'Async: Job Processing',
        latencyTarget: 'Async',
        badge: 'Background Processing',
        iconType: 'zap',
        summary: 'Executing heavy computational workloads (PDF generation, email dispatch, video transcoding) asynchronously outside the HTTP request loop.',
        realWorldUseCase: 'Accepting a PDF export request, returning HTTP 202 Accepted immediately, and pushing a BullMQ job to a worker queue.',
        coreConcepts: [
          'Task Queue Mechanics: Producers, Brokers, Workers, Consumers',
          'Job Retry Strategies, Dead Letter Queues & Exponential Backoff',
          'Distributed Cron / Scheduled Tasks (Redis Redlock)',
          'Concurrency limits and worker thread pools'
        ],
        patternsAndTradeoffs: ['Worker servers must be horizontally scaled independently of HTTP web servers.'],
        industryTools: ['BullMQ (Redis)', 'Celery (Python)', 'Temporal.io', 'Sidekiq'],
        interviewQuestions: ['How do you ensure a cron job runs exactly once in a multi-server auto-scaling cluster?'],
        recommendedDocUrl: 'https://docs.bullmq.io/'
      }
    ]
  },
  {
    id: 'devops-cloud',
    title: 'DevOps, SRE & Cloud Architecture',
    role: 'Cloud / DevOps Architect',
    description: 'The real cloud-native architecture blueprint spanning container orchestration, infrastructure as code, CI/CD GitOps pipelines, and multi-region resilience.',
    overviewSummary: 'The production infrastructure stack powering modern high-availability applications on AWS/GCP with Kubernetes and Terraform.',
    nodes: [
      {
        id: 'do-tier-1',
        name: 'Linux Internals & Containerization',
        subtitle: 'Namespaces, Cgroups & Multi-Stage Docker',
        tier: 'Compute: Containers',
        latencyTarget: 'Kernel-level',
        badge: 'Container Runtime',
        iconType: 'server',
        summary: 'Building secure, lightweight OCI container images utilizing Linux kernel primitives and multi-stage build caching.',
        realWorldUseCase: 'Compiling a 1.2GB Node.js repo into a 45MB production Alpine Docker container running non-root.',
        coreConcepts: [
          'Linux Namespaces (PID, NET, IPC) and Cgroups (CPU/RAM limits)',
          'Multi-Stage Dockerfile optimizations & layer caching',
          'Container Security: Non-root users, vulnerability scanning (Trivy)',
          'Linux Networking: iptables, sockets, systemd services'
        ],
        patternsAndTradeoffs: ['Alpine images are tiny but use musl libc instead of glibc, causing occasional C-dependency compilation issues.'],
        industryTools: ['Docker', 'Podman', 'Trivy', 'Linux (Ubuntu/Alpine)', 'containerd'],
        interviewQuestions: ['What is the difference between a Linux Container and a Virtual Machine?'],
        recommendedDocUrl: 'https://docs.docker.com/develop/develop-images/multistage-build/'
      },
      {
        id: 'do-tier-2',
        name: 'Container Orchestration (Kubernetes)',
        subtitle: 'Pods, Deployments, Services & Ingress',
        tier: 'Orchestration: K8s',
        latencyTarget: 'Cluster-wide',
        badge: 'Cluster Management',
        iconType: 'workflow',
        summary: 'Automating deployment, scaling, health-checking, and zero-downtime rolling upgrades across distributed server fleets.',
        realWorldUseCase: 'Managing a Kubernetes cluster on AWS EKS with Horizontal Pod Autoscalers that scale from 5 to 50 pods during traffic spikes.',
        coreConcepts: [
          'Kubernetes Architecture: Control Plane (API Server, etcd) vs Worker Nodes',
          'Core Primitives: Pods, Deployments, ReplicaSets, Services (ClusterIP/NodePort)',
          'Ingress Controllers & Cert-Manager for automatic SSL certificate renewal',
          'Liveness & Readiness Probes for zero-downtime rolling deployments',
          'ConfigMaps, Secrets, and Persistent Volume Claims (PVC)'
        ],
        patternsAndTradeoffs: ['Kubernetes provides unmatched self-healing and scaling, but introduces high operational and cognitive complexity.'],
        industryTools: ['Kubernetes', 'Helm', 'kubectl', 'AWS EKS', 'k9s'],
        interviewQuestions: ['What happens inside Kubernetes when a container fails its Liveness probe vs its Readiness probe?'],
        recommendedDocUrl: 'https://kubernetes.io/docs/home/'
      },
      {
        id: 'do-tier-3',
        name: 'Infrastructure as Code (Terraform)',
        subtitle: 'Declarative Cloud Infrastructure & State Locks',
        tier: 'Infrastructure: IaC',
        latencyTarget: 'Automated',
        badge: 'Cloud Automation',
        iconType: 'layers',
        summary: 'Defining complete cloud networks, VPCs, databases, and compute clusters as declarative, version-controlled code.',
        realWorldUseCase: 'Spinning up an identical staging and production AWS environment across 3 availability zones in 8 minutes using Terraform modules.',
        coreConcepts: [
          'Terraform State Management: Remote backends (S3) and state locking (DynamoDB)',
          'Terraform Modules, Variables, Outputs, and Workspaces',
          'VPC Architecture: Public Subnets, Private Subnets, NAT Gateways, Route Tables',
          'Immutable Infrastructure vs Configuration Drift'
        ],
        patternsAndTradeoffs: ['Always use remote state with DynamoDB locking; concurrent terraform apply runs will corrupt your state file.'],
        industryTools: ['Terraform', 'OpenTofu', 'Terragrunt', 'AWS CLI', 'Pulumi'],
        interviewQuestions: ['How do you recover from a corrupted Terraform state file or an acquired state lock?'],
        recommendedDocUrl: 'https://developer.hashicorp.com/terraform/docs'
      },
      {
        id: 'do-tier-4',
        name: 'CI/CD Pipelines & GitOps',
        subtitle: 'GitHub Actions, Automated Testing & ArgoCD',
        tier: 'Automation: Delivery',
        latencyTarget: '< 5 min builds',
        badge: 'Continuous Delivery',
        iconType: 'activity',
        summary: 'Automating linting, unit/integration testing, security scans, Docker builds, and declarative GitOps deployments on git push.',
        realWorldUseCase: 'Pushing code to main triggers a GitHub Actions pipeline that runs tests, builds a Docker image, and notifies ArgoCD to sync with K8s.',
        coreConcepts: [
          'CI/CD Pipeline Stages: Lint ➔ Test ➔ Scan ➔ Build ➔ Deploy',
          'GitOps Workflow: Git as the single source of truth for desired state (ArgoCD)',
          'Canary Deployments & Blue-Green Deployments for risk-free rollouts',
          'Automated Rollbacks based on Prometheus error rate alerts'
        ],
        patternsAndTradeoffs: ['Blue-Green deployments require 2x compute capacity temporarily during release cutover.'],
        industryTools: ['GitHub Actions', 'ArgoCD', 'GitLab CI', 'SonarQube', 'Docker Hub'],
        interviewQuestions: ['What is the difference between Blue-Green Deployment and Canary Deployment?'],
        recommendedDocUrl: 'https://argo-cd.readthedocs.io/'
      }
    ]
  }
];

// Helper to pick icon
function RenderTierIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'globe': return <Globe className={className} />;
    case 'shield': return <ShieldCheck className={className} />;
    case 'server': return <Server className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'radio': return <Radio className={className} />;
    case 'database': return <Database className={className} />;
    case 'activity': return <Activity className={className} />;
    case 'workflow': return <Workflow className={className} />;
    case 'layers': return <Layers className={className} />;
    default: return <Cpu className={className} />;
  }
}

interface CareerRoadmapTabProps {
  roadmap?: any;
  isTemporary?: boolean;
  onClearTemporary?: () => void;
  onNavigate?: (tab: string) => void;
}

export function CareerRoadmapTab({ 
  roadmap, 
  onNavigate 
}: CareerRoadmapTabProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>('system-design');
  const [activeNode, setActiveNode] = useState<ArchitectureNode | null>(ARCHITECTURE_TRACKS[0].nodes[0]);
  const [completedNodes, setCompletedNodes] = useState<Record<string, boolean>>({});

  const currentTrack = ARCHITECTURE_TRACKS.find(t => t.id === selectedTrackId) || ARCHITECTURE_TRACKS[0];

  const toggleNodeCompleted = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
    toast.success(completedNodes[nodeId] ? 'Marked as in-progress' : 'Architecture milestone marked as mastered! ✓');
  };

  const copyRoadmapAsMarkdown = () => {
    let md = `# Real-World Engineering Roadmap: ${currentTrack.title}\n`;
    md += `Target Role: ${currentTrack.role}\n\n`;
    md += `${currentTrack.overviewSummary}\n\n`;
    md += `## Architecture Blueprint & Flowchart\n\n`;

    currentTrack.nodes.forEach((node, idx) => {
      const isDone = completedNodes[node.id] ? '[x]' : '[ ]';
      md += `### ${idx + 1}. ${node.tier}: ${node.name}\n`;
      md += `${isDone} Target Latency: ${node.latencyTarget} | ${node.subtitle}\n\n`;
      md += `**Summary:** ${node.summary}\n\n`;
      md += `**Core Concepts:**\n`;
      node.coreConcepts.forEach(c => md += `- ${c}\n`);
      md += `\n**Industry Tools:** ${node.industryTools.join(', ')}\n\n`;
      md += `**Interview Questions:**\n`;
      node.interviewQuestions.forEach(q => md += `- ${q}\n`);
      md += `\n---\n\n`;
    });

    navigator.clipboard.writeText(md).then(() => {
      toast.success('Architecture roadmap copied to clipboard as Markdown!');
    }).catch(() => {
      toast.error('Failed writing to clipboard.');
    });
  };

  const completedCount = currentTrack.nodes.filter(n => completedNodes[n.id]).length;
  const progressPercent = Math.round((completedCount / currentTrack.nodes.length) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-24 px-2 sm:px-4">
      
      {/* HEADER SECTION */}
      <section className="text-center space-y-4 pt-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 blur-[110px] -z-10 rounded-full" />
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-500/20">
          <Layers className="w-3.5 h-3.5" />
          <span>Authentic Production Architecture Roadmap</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
          Real-World System Design & Engineering Architecture
        </h1>

        <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
          The verified architectural blueprints followed by staff engineers and top tech teams. No random AI prompts — this is how real high-scale distributed systems and cloud backends are designed.
        </p>

        {/* TRACK SELECTOR PILLS */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
          {ARCHITECTURE_TRACKS.map(track => {
            const isSelected = track.id === selectedTrackId;
            return (
              <button
                key={track.id}
                onClick={() => {
                  setSelectedTrackId(track.id);
                  setActiveNode(track.nodes[0]);
                }}
                className={cn(
                  "px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-2",
                  isSelected
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                )}
              >
                <span>{track.title}</span>
              </button>
            );
          })}
        </div>

        {/* PROGRESS AND QUICK ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 px-2 bg-card/60 border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-black text-sm">
              {progressPercent}%
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-foreground">
                Architecture Mastery Progress: {completedCount} / {currentTrack.nodes.length} Tiers Mastered
              </div>
              <div className="w-48 sm:w-64 h-2 bg-muted rounded-full overflow-hidden mt-1.5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={copyRoadmapAsMarkdown}
              size="sm"
              variant="outline"
              className="rounded-xl h-9 text-xs font-bold gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Architecture (Markdown)</span>
            </Button>
            <Button
              onClick={() => {
                window.print();
              }}
              size="sm"
              className="rounded-xl h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </Button>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN ARCHITECTURE CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE CONNECTED FLOWCHART TIERS (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
              <Workflow className="w-4 h-4 text-blue-500" />
              <span>End-to-End Request Flow (Client ➔ Persistence)</span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Click any tier to inspect</span>
          </div>

          {currentTrack.nodes.map((node, index) => {
            const isSelected = activeNode?.id === node.id;
            const isCompleted = !!completedNodes[node.id];
            const isLast = index === currentTrack.nodes.length - 1;

            return (
              <div key={node.id} className="relative">
                {/* Visual vertical connector line */}
                {!isLast && (
                  <div className="absolute left-6 top-14 bottom-[-16px] w-0.5 bg-gradient-to-b from-blue-500/40 via-blue-500/20 to-border z-0 hidden sm:block" />
                )}

                <div
                  onClick={() => setActiveNode(node)}
                  className={cn(
                    "relative z-10 p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
                    isSelected
                      ? "bg-blue-500/10 border-blue-500/60 shadow-lg shadow-blue-500/10 scale-[1.01]"
                      : "bg-card/70 hover:bg-card border-border hover:border-border/80"
                  )}
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    {/* Node Icon Box */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        : "bg-muted text-muted-foreground border-border"
                    )}>
                      <RenderTierIcon type={node.iconType} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {node.tier}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          Latency: {node.latencyTarget}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Mastered
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base text-foreground tracking-tight truncate">
                        {node.name}
                      </h3>

                      <p className="text-xs text-muted-foreground truncate font-medium">
                        {node.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={(e) => toggleNodeCompleted(node.id, e)}
                      title={isCompleted ? "Mark incomplete" : "Mark as mastered"}
                      className={cn(
                        "p-2 rounded-lg border transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer",
                        isCompleted
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Check className={cn("w-3.5 h-3.5", isCompleted ? "text-emerald-600" : "opacity-40")} />
                      <span className="text-[11px] hidden sm:inline">{isCompleted ? "Done" : "Mark Done"}</span>
                    </button>

                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform text-muted-foreground",
                      isSelected && "text-blue-500 translate-x-1"
                    )} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: ARCHITECTURAL SPECIFICATION DRAWER (5 COLS) */}
        <div className="lg:col-span-5 sticky top-20 space-y-5">
          {activeNode ? (
            <div className="bg-card/90 border border-border rounded-3xl p-6 md:p-7 shadow-xl space-y-6">
              
              {/* Drawer Header */}
              <div className="border-b border-border pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {activeNode.tier}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    Target: {activeNode.latencyTarget}
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  {activeNode.name}
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  {activeNode.subtitle}
                </p>
              </div>

              {/* Summary & Production Role */}
              <div className="space-y-1.5 text-xs leading-relaxed text-foreground/90 font-medium bg-muted/30 p-3.5 rounded-2xl border border-border/60">
                <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground block">
                  Architecture Role:
                </span>
                <p>{activeNode.summary}</p>
              </div>

              {/* Real World Production Example */}
              <div className="space-y-1.5 text-xs leading-relaxed bg-blue-500/5 p-3.5 rounded-2xl border border-blue-500/20">
                <span className="font-bold text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Real-World Production Scenario:
                </span>
                <p className="text-foreground/90">{activeNode.realWorldUseCase}</p>
              </div>

              {/* Core Concepts to Master */}
              <div className="space-y-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-foreground block">
                  Core Engineering Concepts:
                </span>
                <ul className="space-y-1.5">
                  {activeNode.coreConcepts.map((concept, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Patterns & Architecture Trade-offs */}
              {activeNode.patternsAndTradeoffs.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-border">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-foreground block">
                    Key Trade-offs & Architecture Patterns:
                  </span>
                  <ul className="space-y-1.5">
                    {activeNode.patternsAndTradeoffs.map((item, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Industry Standard Tools */}
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-xs font-extrabold uppercase tracking-wider text-foreground block">
                  Industry Standard Tooling:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeNode.industryTools.map((tool, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-background text-foreground border border-border text-xs font-bold"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Interview Questions */}
              <div className="space-y-2.5 pt-2 border-t border-border">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                  System Design Interview Questions:
                </span>
                <ul className="space-y-2">
                  {activeNode.interviewQuestions.map((q, idx) => (
                    <li key={idx} className="text-xs font-semibold text-foreground/90 p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15">
                      &ldquo;{q}&rdquo;
                    </li>
                  ))}
                </ul>
              </div>

              {/* Official Documentation Link */}
              {activeNode.recommendedDocUrl && (
                <div className="pt-2">
                  <a
                    href={activeNode.recommendedDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Read Official Architecture Docs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-3xl">
              Select an architectural tier on the left to inspect its system design specs.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
