# AWS Business Associate Agreement (BAA) Guide for RevenueMD

## What Is a BAA and Why You Need One

Under HIPAA, any vendor that handles Protected Health Information (PHI) on behalf of a covered entity or business associate is itself a business associate and must sign a Business Associate Agreement before touching PHI. Because RevenueMD processes EDI 837 claim files that contain patient names, dates of service, diagnosis codes, and other PHI, AWS is acting as your business associate the moment that data touches an EC2 instance, S3 bucket, or any other AWS service. Without a signed BAA with AWS, your use of AWS to process, store, or transmit PHI is a HIPAA violation regardless of the technical controls you have in place. The BAA is a legal prerequisite—not optional, and not something you can substitute with encryption alone.

---

## Step-by-Step: Sign the AWS BAA

### Step 1 — Create or log into your AWS account
Go to https://aws.amazon.com and sign in as the root user or an IAM user with the `AWSArtifactAccountSync` policy attached. The account that signs the BAA must be the account you actually use to run RevenueMD workloads.

### Step 2 — Navigate to AWS Artifact
In the AWS Management Console, use the search bar at the top and type **Artifact**. Click **AWS Artifact** in the results. AWS Artifact is the self-service portal for AWS compliance reports and agreements—it is free to access.

### Step 3 — Go to Agreements
In the left sidebar click **Agreements**. You will see two tabs: **Account agreements** (applies to your account) and **Organization agreements** (if you use AWS Organizations). For a single-account setup, use **Account agreements**.

### Step 4 — Locate the HIPAA BAA
Scroll down the list of available agreements until you find **AWS Business Associate Addendum (HIPAA)**. Click the row to expand it.

### Step 5 — Review and accept
Click **Download** to read the full agreement text. When you are ready, click **Accept agreement**. A dialog will appear asking you to confirm. Check the acknowledgment box and click **Accept**. The status column will change to **Active** immediately.

### Step 6 — Save confirmation
Take a screenshot or download the acceptance confirmation page. Keep it with your HIPAA compliance documentation. AWS does not email a confirmation.

> **Important:** The BAA covers only HIPAA-eligible services (listed below). Sending PHI through a non-eligible service (e.g., SES for email containing PHI) is still a violation even after signing the BAA.

---

## HIPAA-Eligible AWS Services

The following services are covered by the AWS BAA as of 2025. You may process PHI using these services:

| Service | Relevant Use for RevenueMD |
|---|---|
| **EC2** | Application server (FastAPI/Docker) |
| **EBS** | EC2 disk storage — must enable encryption |
| **VPC** | Network isolation for EC2 |
| **S3** | Storing EDI 837 files and scrubbed output — must enable encryption and block public access |
| **RDS** | Relational database if you add claim storage |
| **CloudWatch Logs** | Application and access logs — enable log encryption |
| **CloudTrail** | API audit trail — required for HIPAA |
| **KMS** | Encryption key management for EBS, S3, RDS |
| **IAM** | Access control — required |
| **Cognito** | User authentication if you add a login portal |
| **SES** | Transactional email (do NOT include PHI in email body) |
| **Lambda** | Serverless compute if needed |
| **Secrets Manager** | Storing API keys and database credentials |
| **Systems Manager (SSM)** | EC2 patch management and parameter store |

Full and current list: https://aws.amazon.com/compliance/hipaa-eligible-services-reference/

---

## Services to AVOID (Not Covered by the AWS BAA)

Do not process or store PHI using these services. They are not covered by the AWS BAA:

- **AWS CodePipeline / CodeBuild / CodeDeploy** — CI/CD pipelines: do not pass real PHI through build artifacts or environment variables
- **Elastic Beanstalk** — not BAA-covered; use EC2/ECS directly
- **Amazon Comprehend Medical** (standard tier) — use only the HIPAA-eligible dedicated endpoint if needed
- **Amazon Rekognition** — not covered
- **Amazon Lex / Alexa** — not covered
- **AWS Amplify Hosting** — not covered; use S3 + CloudFront for static hosting or GitHub Pages (frontend only, no PHI)
- **Amazon WorkSpaces** — not covered in all configurations; verify before use
- **AWS IoT services** — not covered

> **GitHub Pages** (your React frontend at revenuemdpr.com) is not an AWS service and is not covered by the BAA. This is fine as long as the frontend never stores or transmits PHI directly—all PHI-containing API calls go to api.revenuemdpr.com over TLS.

---

## AWS Config Rules to Enable for HIPAA

AWS Config continuously checks your resource configurations against rules. Enable these managed rules in the AWS Config console under **Rules > Add rule**:

| Config Rule | What It Checks |
|---|---|
| `encrypted-volumes` | EBS volumes attached to EC2 are encrypted |
| `s3-bucket-server-side-encryption-enabled` | S3 buckets have SSE enabled |
| `s3-bucket-public-read-prohibited` | No S3 bucket allows public read |
| `s3-bucket-public-write-prohibited` | No S3 bucket allows public write |
| `rds-storage-encrypted` | RDS instances use encrypted storage |
| `cloudtrail-enabled` | CloudTrail is active in the account |
| `cloud-trail-encryption-enabled` | CloudTrail logs are encrypted with KMS |
| `vpc-flow-logs-enabled` | VPC Flow Logs are enabled |
| `iam-password-policy` | IAM password policy meets minimum requirements |
| `iam-root-access-key-check` | Root account has no active access keys |
| `mfa-enabled-for-iam-console-access` | Console users have MFA enabled |
| `restricted-ssh` | Security groups do not allow unrestricted SSH (0.0.0.0/0 on port 22) |
| `restricted-common-ports` | No unrestricted inbound access on common ports |

To enable AWS Config: In the console, search for **Config**, click **Get started**, select the region where RevenueMD runs, choose **Record all resources**, create an S3 bucket for configuration history, and then add the rules above.

**AWS Security Hub** (optional but recommended): Enable the **AWS Foundational Security Best Practices** standard and the **HIPAA** standard in Security Hub. It aggregates Config findings and adds additional checks.

---

## Estimated Monthly Cost

| Component | Notes | Est. Cost/Month |
|---|---|---|
| EC2 t3.small (1 instance) | FastAPI + Docker, 2 vCPU / 2 GB RAM | ~$15 |
| EBS gp3 20 GB | Root volume, encrypted | ~$1.60 |
| Elastic IP | Static IP for api.revenuemdpr.com | ~$0 (free while attached) |
| Data transfer out | First 100 GB/month | ~$9 |
| CloudTrail | First trail free; S3 storage for logs | ~$1-2 |
| AWS Config | $0.003 per configuration item recorded | ~$2-5 |
| CloudWatch Logs | Ingestion + 30-day retention | ~$1-3 |
| KMS | 1 CMK + API calls | ~$1 |
| **Total** | | **~$30-37/month** |

Free tier applies to new accounts for the first 12 months (750 hours of t2.micro/t3.micro, 5 GB S3, etc.). A t3.micro may suffice for low traffic but t3.small is recommended for production FastAPI with 2 uvicorn workers.

> These are estimates based on us-east-1 pricing as of 2025. Use the [AWS Pricing Calculator](https://calculator.aws) to model your specific workload.
