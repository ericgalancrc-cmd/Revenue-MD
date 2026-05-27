# HIPAA Technical Safeguards Checklist — RevenueMD AWS Deployment

This checklist maps to the HIPAA Security Rule Technical Safeguards (45 CFR § 164.312). Work through every item before processing real PHI in production. Check each box as you complete it.

> **Prerequisite:** The AWS Business Associate Agreement (BAA) must be signed before any PHI touches AWS infrastructure. See `docs/AWS_BAA_GUIDE.md`.

---

## 1. Network & Access Controls

### VPC & Security Groups
- [ ] RevenueMD EC2 instance runs inside a **dedicated VPC** (not the default VPC)
- [ ] EC2 instance is placed in a **private subnet**; only the load balancer or nginx container sits in the public subnet
- [ ] Security group on EC2 allows **inbound port 80/443 only from the nginx container or ALB**, not from `0.0.0.0/0`
- [ ] Security group on EC2 allows **inbound SSH (port 22) only from your static management IP**, not `0.0.0.0/0`
- [ ] Security group allows **no inbound port 8000** from the public internet (FastAPI is only reachable through nginx)
- [ ] Outbound rules are restricted — EC2 should not need unrestricted outbound; limit to necessary destinations (e.g., PyPI, Docker Hub, AWS APIs)
- [ ] VPC has **no direct internet gateway attached to the private subnet** (use a NAT gateway for outbound-only internet access)
- [ ] **VPC Flow Logs** are enabled and sent to CloudWatch Logs or S3

### IAM
- [ ] Root account has **MFA enabled** and no active access keys (check via IAM console → Security recommendations)
- [ ] Root account is **not used for day-to-day operations** — all work is done through IAM users or roles
- [ ] EC2 instance has an **IAM instance role** (not hardcoded AWS credentials) with least-privilege permissions
- [ ] IAM instance role grants only the permissions RevenueMD actually needs (e.g., `s3:GetObject`, `s3:PutObject` on specific buckets — not `s3:*`)
- [ ] All IAM users who access the console have **MFA enabled**
- [ ] IAM password policy requires: minimum 12 characters, uppercase, lowercase, number, symbol, no reuse of last 24 passwords
- [ ] No IAM user has `AdministratorAccess` unless absolutely necessary; prefer scoped policies
- [ ] IAM access key rotation is reviewed quarterly; any unused keys are deactivated
- [ ] AWS Config rule `iam-root-access-key-check` is active and green
- [ ] AWS Config rule `mfa-enabled-for-iam-console-access` is active and green

---

## 2. Encryption

### Encryption at Rest
- [ ] **EBS root volume** of the EC2 instance is encrypted (enable in EC2 launch settings or via account-level default encryption in EC2 → Settings → EBS Encryption)
- [ ] EBS encryption uses a **KMS Customer Managed Key (CMK)**, not the default AWS-managed key, so you control key rotation and access policy
- [ ] KMS CMK has **automatic annual rotation enabled**
- [ ] If S3 is used for EDI 837 files or scrubbed output: **S3 Server-Side Encryption (SSE-KMS)** is enabled on all buckets
- [ ] All S3 buckets have **Block Public Access** turned on (all four settings: block public ACLs, block public bucket policies, ignore public ACLs, restrict public buckets)
- [ ] S3 bucket policy denies `s3:PutObject` requests that do not include `x-amz-server-side-encryption` header (enforce encryption in transit to S3)
- [ ] If RDS is added: **RDS storage encryption** is enabled at creation time (cannot be enabled on an existing instance — must snapshot and restore)
- [ ] CloudTrail log files are encrypted with KMS (`cloud-trail-encryption-enabled` Config rule is green)
- [ ] CloudWatch Log Groups storing application logs have **KMS encryption** enabled
- [ ] Secrets (API keys, DB passwords) are stored in **AWS Secrets Manager** or **SSM Parameter Store (SecureString)** — not in `.env` files committed to git or baked into Docker images

### Encryption in Transit
- [ ] All traffic between clients and api.revenuemdpr.com is over **TLS 1.2 or 1.3** (HTTP redirects to HTTPS via nginx config)
- [ ] nginx `ssl_protocols` is set to `TLSv1.2 TLSv1.3` only — TLS 1.0 and 1.1 are disabled
- [ ] nginx `ssl_ciphers` excludes `aNULL`, `MD5`, and weak cipher suites
- [ ] HSTS header (`Strict-Transport-Security`) is present with `max-age` of at least 1 year
- [ ] TLS certificate is valid and auto-renewing via certbot (`certbot renew` cron job confirmed in `/etc/crontab`)
- [ ] Internal communication between nginx container and FastAPI container stays on the Docker network (never leaves the host); no PHI sent over unencrypted internal links
- [ ] If RDS is added: database connection string uses `sslmode=require` (PostgreSQL) or `ssl=true` (MySQL)

---

## 3. Logging & Monitoring

### CloudTrail
- [ ] **CloudTrail is enabled** in all regions (or at minimum the region where RevenueMD runs)
- [ ] CloudTrail logs are delivered to a **dedicated S3 bucket with S3 Object Lock** (WORM) to prevent tampering
- [ ] CloudTrail S3 bucket has **access logging enabled** (log who accesses the audit logs)
- [ ] CloudTrail captures **management events** (API calls: create, delete, modify resources) and **data events** for S3 (object-level reads/writes on PHI buckets)
- [ ] CloudTrail log file validation is enabled (integrity checking)
- [ ] AWS Config rule `cloudtrail-enabled` is green

### CloudWatch
- [ ] **CloudWatch Log Group** exists for FastAPI application logs (stdout/stderr from Docker container)
- [ ] **CloudWatch Log Group** exists for nginx access logs
- [ ] Log retention is set to at least **6 years** for HIPAA audit purposes (or export to S3 Glacier for cost savings after 90 days)
- [ ] **CloudWatch Alarm** is set on HTTP 5xx error rate (threshold: >1% of requests)
- [ ] **CloudWatch Alarm** is set on CPU utilization (threshold: >80% for 5 minutes)
- [ ] **CloudWatch Alarm** is set on failed SSH login attempts (via metric filter on `/var/log/auth.log`)
- [ ] SNS topic is attached to all alarms so the on-call engineer receives email/SMS notifications

### VPC Flow Logs
- [ ] VPC Flow Logs are enabled and retained for at least **6 years** (or archived to S3)
- [ ] Flow logs capture both **ACCEPT and REJECT** traffic

### Additional
- [ ] **AWS Security Hub** is enabled with the HIPAA standard activated
- [ ] **Amazon GuardDuty** is enabled (threat detection — detects unusual API calls, port scans, crypto mining)
- [ ] GuardDuty findings route to CloudWatch Events and trigger SNS alerts

---

## 4. Backup & Recovery

### EC2 / EBS
- [ ] **AWS Backup** plan is configured to snapshot the EC2 EBS volume daily
- [ ] Snapshots are retained for at least **30 days** (adjust based on your recovery objectives)
- [ ] Snapshots are tested quarterly — restore a snapshot to a test instance and verify the application starts
- [ ] EBS snapshots are encrypted (they inherit the CMK from the source volume)

### S3
- [ ] **S3 Versioning** is enabled on buckets that store EDI 837 files or scrubbed output
- [ ] **S3 Object Lock** (WORM mode) is considered for audit log buckets
- [ ] **S3 Lifecycle policy** transitions old versions to S3 Glacier after 90 days to control cost
- [ ] Cross-region replication is considered for DR (replicate PHI buckets to a second region)

### RDS (if/when added)
- [ ] **Automated backups** are enabled with a retention period of at least 7 days
- [ ] **Multi-AZ** deployment is enabled for production RDS (standby replica in a second availability zone)
- [ ] RDS snapshots are encrypted with KMS CMK
- [ ] Manual snapshots are taken before any major schema migration or deployment

### Recovery Objectives
- [ ] **Recovery Time Objective (RTO)** is documented: how long can RevenueMD be down? (Recommended: < 4 hours)
- [ ] **Recovery Point Objective (RPO)** is documented: how much data can be lost? (Recommended: < 24 hours)
- [ ] Recovery procedure is documented and tested at least annually

---

## 5. Incident Response

### Breach Notification Procedure
Under HIPAA, a breach of unsecured PHI must be reported to affected individuals within **60 days** of discovery, to HHS within **60 days**, and (if >500 individuals in a state) to prominent media in that state.

- [ ] A designated **Privacy Officer / Security Officer** is named and documented
- [ ] An **incident log** template exists (date discovered, date contained, data types involved, number of individuals affected, root cause, corrective action)
- [ ] Template breach notification letter is drafted and reviewed by legal counsel
- [ ] HHS breach reporting portal is bookmarked: https://ocrportal.hhs.gov/ocr/breach/wizard_breach.jsf
- [ ] Internal escalation path is documented (who gets called at 2 AM when GuardDuty fires?)

### Runbook — Suspected Breach
1. **Contain** — immediately isolate the affected EC2 instance (modify security group to deny all inbound/outbound), do NOT terminate it (preserve forensic evidence)
2. **Assess** — determine what data was accessed, time range, and method of access using CloudTrail and VPC Flow Logs
3. **Notify internal** — inform Privacy Officer and legal counsel within 24 hours
4. **Preserve evidence** — create an EBS snapshot of the affected instance before any remediation
5. **Remediate** — patch the vulnerability, rotate all credentials (API keys, DB passwords, SSH keys), redeploy from a clean image
6. **Report** — if PHI was involved, initiate the 60-day breach notification clock; file with HHS and notify affected individuals
7. **Post-mortem** — document root cause and corrective actions; update this checklist

### Access Revocation
- [ ] Procedure exists to revoke all AWS access for a departing employee within **24 hours** (disable IAM user, rotate shared credentials, remove SSH public key from EC2)
- [ ] Procedure exists to rotate API keys if an `X-API-Key` value is suspected compromised

---

## 6. Before Going Live Checklist

Complete every item in this section before RevenueMD processes real patient data in production.

### Legal & Administrative
- [ ] **AWS BAA is signed** (AWS Artifact → Agreements → HIPAA BAA status = Active)
- [ ] **HIPAA Risk Analysis is complete** — a documented assessment of threats to PHI confidentiality, integrity, and availability (required by 45 CFR § 164.308(a)(1))
- [ ] Risk Analysis findings are documented and a remediation plan exists for identified risks
- [ ] **Workforce training** is complete — all employees who may access PHI have received HIPAA Privacy and Security training within the past year; training records are on file
- [ ] **Business Associate Agreements** are signed with any third-party vendors who may access PHI (e.g., email provider if you send reports, logging SaaS)
- [ ] **Privacy Policy** on revenuemdpr.com accurately describes how PHI is handled
- [ ] **Notice of Privacy Practices** is available if RevenueMD is a covered entity or acts as one

### Technical — Final Verification
- [ ] `curl https://api.revenuemdpr.com/health` returns HTTP 200 from outside the VPC
- [ ] `curl http://api.revenuemdpr.com/health` returns HTTP 301 redirect to HTTPS (no plaintext API access)
- [ ] TLS certificate is valid and issued to `api.revenuemdpr.com`: `openssl s_client -connect api.revenuemdpr.com:443 < /dev/null | openssl x509 -noout -dates`
- [ ] Security headers are present on all responses: run `curl -I https://api.revenuemdpr.com/health` and confirm `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Cache-Control: no-store`
- [ ] Rate limiting is active: send >30 requests/minute to any endpoint and confirm HTTP 429 responses
- [ ] All AWS Config rules listed in `docs/AWS_BAA_GUIDE.md` are in **Compliant** state (no red/orange rules)
- [ ] GuardDuty shows no active HIGH or CRITICAL findings
- [ ] Security Hub HIPAA standard score is reviewed and critical findings are resolved
- [ ] Penetration test or vulnerability scan has been run against api.revenuemdpr.com (OWASP ZAP, Nessus, or third-party)
- [ ] No PHI appears in CloudWatch Logs in plaintext (sample the logs and verify scrubbing/masking is working)
- [ ] Docker image does not contain secrets — run `docker inspect revenuemd-api:latest` and verify no `API_KEY`, passwords, or tokens are baked in as ENV variables
- [ ] `.env` file is listed in `.gitignore` and has never been committed to the repository (`git log --all --full-history -- '**/.env'` returns empty)

---

*Last reviewed: 2026-05-27 — review annually or after any significant infrastructure change.*
