import { createServer, Response } from "miragejs";
import storageService from "./lib/storage";

function generateRandomInteger(maxValue) {
  return Math.floor(Math.random() * maxValue);
}
function shouldSimulateFailure(failureRate = 0.08) {
  return Math.random() < failureRate;
}
function simulateNetworkLatency(minMs = 200, maxMs = 1200) {
  return new Promise((resolve) =>
    setTimeout(resolve, minMs + generateRandomInteger(maxMs - minMs))
  );
}
function generateId() {
  return `id-${Math.random().toString(36).substr(2, 9)}`;
}

export default function createMockServer({ environment = "development" } = {}) {
  (async () => {
    const generateJobData = () => {
      const availableJobTitles = [
        "software engineer 1",
        "software engineer 2",
        "software engineer 3",
        "senior software engineer",
        "technical lead",
        "ML Engineer",
        "DevOPS engineer",
      ];
      const jobDataList = [];
      for (let jobIndex = 1; jobIndex <= 25; jobIndex++) {
        const selectedTitle =
          availableJobTitles[
            Math.floor(Math.random() * availableJobTitles.length)
          ];
        jobDataList.push({
          id: `job-${jobIndex}`,
          title: selectedTitle,
          slug: `job-${jobIndex}`,
          status: "open",
          tags: ["engineering", jobIndex % 2 ? "frontend" : "backend"],
          order: jobIndex,
          archived: false,
        });
      }
      return jobDataList;
    };
    const candidateWorkflowStages = [
      "Applied",
      "Phone Screen",
      "Onsite",
      "Offer",
      "Hired",
      "Rejected",
    ];
    const generateCandidateData = (jobsList) => {
      const availableCandidateNames = [
        "Gaurav",
        "Arjun",
        "Abhinav",
        "Harsh",
        "Dhruv",
        "Giriraj",
        "Ojas",
        "Abhishek",
        "Nitin",
        "Armaan",
        "Siddharth",
        "Nidhan",
        "Archit",
      ];
      const candidateDataList = [];
      for (let candidateIndex = 1; candidateIndex <= 900; candidateIndex++) {
        const assignedJob = jobsList[(candidateIndex - 1) % jobsList.length];
        const currentStage =
          candidateWorkflowStages[
            Math.floor(Math.random() * candidateWorkflowStages.length)
          ];
        const selectedName =
          availableCandidateNames[
            Math.floor(Math.random() * availableCandidateNames.length)
          ];
        const normalizedEmailName = selectedName.toLowerCase();
        candidateDataList.push({
          id: `cand-${candidateIndex}`,
          name: selectedName,
          email: `${normalizedEmailName}${candidateIndex}@example.com`,
          stage: currentStage,
          jobId: assignedJob.id,
        });
      }
      return candidateDataList;
    };
    const generateAssessmentData = (jobsList) => {
      const assessmentDataList = [];

      // Create unique assessment templates
      const predefinedAssessmentTemplates = [
        {
          title: "Software Development Assessment",
          description: "Technical assessment for software engineers",
          sections: [
            {
              title: "Programming Background",
              description: "Tell us about your coding experience",
              questions: [
                {
                  type: "short-text",
                  label: "Primary programming language",
                  required: true,
                  validation: { maxLength: 50 },
                },
                {
                  type: "long-text",
                  label: "Describe your most challenging project",
                  required: true,
                  validation: { maxLength: 500 },
                },
                {
                  type: "numeric",
                  label: "Years of coding experience",
                  required: true,
                  validation: { min: 0, max: 30 },
                },
                {
                  type: "single-choice",
                  label: "Preferred development methodology",
                  required: true,
                  options: [
                    { label: "Agile", value: "Agile" },
                    { label: "Waterfall", value: "Waterfall" },
                    { label: "DevOps", value: "DevOps" },
                  ],
                },
              ],
            },
            {
              title: "Technical Skills",
              description: "Evaluate your technical proficiency",
              questions: [
                {
                  type: "multi-choice",
                  label: "Frameworks you've worked with",
                  required: true,
                  options: [
                    { label: "React", value: "React" },
                    { label: "Angular", value: "Angular" },
                    { label: "Vue.js", value: "Vue.js" },
                    { label: "Spring Boot", value: "Spring Boot" },
                  ],
                },
                {
                  type: "long-text",
                  label: "Explain the concept of inheritance in OOP",
                  required: false,
                  validation: { maxLength: 300 },
                },
              ],
            },
          ],
        },
        {
          title: "Leadership & Management Assessment",
          description: "Assessment for senior and lead positions",
          sections: [
            {
              title: "Leadership Experience",
              description: "Your management and leadership background",
              questions: [
                {
                  type: "short-text",
                  label: "Largest team size you've managed",
                  required: true,
                  validation: { maxLength: 20 },
                },
                {
                  type: "long-text",
                  label: "Describe a difficult team situation you resolved",
                  required: true,
                  validation: { maxLength: 600 },
                },
                {
                  type: "numeric",
                  label: "Years in leadership roles",
                  required: true,
                  validation: { min: 0, max: 25 },
                },
                {
                  type: "single-choice",
                  label: "Leadership style preference",
                  required: true,
                  options: [
                    { label: "Democratic", value: "Democratic" },
                    { label: "Transformational", value: "Transformational" },
                    {
                      label: "Servant Leadership",
                      value: "Servant Leadership",
                    },
                  ],
                },
              ],
            },
            {
              title: "Strategic Thinking",
              description: "Your approach to planning and strategy",
              questions: [
                {
                  type: "multi-choice",
                  label: "Key areas of focus as a leader",
                  required: true,
                  options: [
                    { label: "Team Development", value: "Team Development" },
                    { label: "Product Strategy", value: "Product Strategy" },
                    {
                      label: "Process Improvement",
                      value: "Process Improvement",
                    },
                    { label: "Innovation", value: "Innovation" },
                  ],
                },
                {
                  type: "long-text",
                  label: "How do you handle conflicting priorities?",
                  required: false,
                  validation: { maxLength: 400 },
                },
              ],
            },
          ],
        },
        {
          title: "Machine Learning & AI Assessment",
          description: "Specialized assessment for ML Engineers",
          sections: [
            {
              title: "ML Fundamentals",
              description: "Core machine learning concepts",
              questions: [
                {
                  type: "short-text",
                  label: "Favorite ML algorithm and why",
                  required: true,
                  validation: { maxLength: 100 },
                },
                {
                  type: "long-text",
                  label: "Explain overfitting and how to prevent it",
                  required: true,
                  validation: { maxLength: 400 },
                },
                {
                  type: "numeric",
                  label: "Years of ML experience",
                  required: true,
                  validation: { min: 0, max: 20 },
                },
                {
                  type: "single-choice",
                  label: "Primary ML domain",
                  required: true,
                  options: [
                    { label: "Computer Vision", value: "Computer Vision" },
                    { label: "Natural Language Processing", value: "NLP" },
                    {
                      label: "Recommendation Systems",
                      value: "Recommendation Systems",
                    },
                    { label: "Time Series Analysis", value: "Time Series" },
                  ],
                },
              ],
            },
            {
              title: "Tools & Technologies",
              description: "ML tools and frameworks",
              questions: [
                {
                  type: "multi-choice",
                  label: "ML frameworks you've used",
                  required: true,
                  options: [
                    { label: "TensorFlow", value: "TensorFlow" },
                    { label: "PyTorch", value: "PyTorch" },
                    { label: "Scikit-learn", value: "Scikit-learn" },
                    { label: "Keras", value: "Keras" },
                  ],
                },
                {
                  type: "long-text",
                  label: "Describe your model deployment experience",
                  required: false,
                  validation: { maxLength: 350 },
                },
              ],
            },
          ],
        },
        {
          title: "DevOps & Infrastructure Assessment",
          description: "Assessment for DevOps Engineers",
          sections: [
            {
              title: "Infrastructure & Automation",
              description: "Your experience with infrastructure management",
              questions: [
                {
                  type: "short-text",
                  label: "Preferred cloud platform",
                  required: true,
                  validation: { maxLength: 50 },
                },
                {
                  type: "long-text",
                  label: "Describe a complex deployment you automated",
                  required: true,
                  validation: { maxLength: 500 },
                },
                {
                  type: "numeric",
                  label: "Years of DevOps experience",
                  required: true,
                  validation: { min: 0, max: 20 },
                },
                {
                  type: "single-choice",
                  label: "Container orchestration preference",
                  required: true,
                  options: [
                    { label: "Kubernetes", value: "Kubernetes" },
                    { label: "Docker Swarm", value: "Docker Swarm" },
                    { label: "Amazon ECS", value: "Amazon ECS" },
                  ],
                },
              ],
            },
            {
              title: "Monitoring & Security",
              description: "Your approach to system monitoring and security",
              questions: [
                {
                  type: "multi-choice",
                  label: "Monitoring tools you've implemented",
                  required: true,
                  options: [
                    { label: "Prometheus", value: "Prometheus" },
                    { label: "Grafana", value: "Grafana" },
                    { label: "ELK Stack", value: "ELK Stack" },
                    { label: "Datadog", value: "Datadog" },
                  ],
                },
                {
                  type: "long-text",
                  label: "How do you ensure security in CI/CD pipelines?",
                  required: false,
                  validation: { maxLength: 400 },
                },
              ],
            },
          ],
        },
      ];

      // Assign assessments to jobs based on their titles
      for (
        let jobIndex = 0;
        jobIndex < Math.min(jobsList.length, 25);
        jobIndex++
      ) {
        const currentJob = jobsList[jobIndex];
        let selectedTemplateIndex = 0;

        // Choose assessment based on job title
        if (
          currentJob.title.toLowerCase().includes("senior") ||
          currentJob.title.toLowerCase().includes("lead")
        ) {
          selectedTemplateIndex = 1; // Leadership assessment
        } else if (
          currentJob.title.toLowerCase().includes("ml") ||
          currentJob.title.toLowerCase().includes("machine")
        ) {
          selectedTemplateIndex = 2; // ML assessment
        } else if (currentJob.title.toLowerCase().includes("devops")) {
          selectedTemplateIndex = 3; // DevOps assessment
        } else {
          selectedTemplateIndex = 0; // Default software development assessment
        }

        const selectedTemplate =
          predefinedAssessmentTemplates[selectedTemplateIndex];

        // Build assessment with unique IDs for this job
        const processedSections = selectedTemplate.sections.map(
          (sectionTemplate) => ({
            id: generateId(),
            title: sectionTemplate.title,
            description: sectionTemplate.description,
            questions: sectionTemplate.questions.map((questionTemplate) => {
              const processedQuestion = {
                id: generateId(),
                type: questionTemplate.type,
                label: questionTemplate.label,
                required: questionTemplate.required,
                validation: questionTemplate.validation,
              };

              if (questionTemplate.options) {
                processedQuestion.options = questionTemplate.options.map(
                  (optionTemplate) => ({
                    id: generateId(),
                    label: optionTemplate.label,
                    value: optionTemplate.value,
                  })
                );
              }

              if (questionTemplate.showIf)
                processedQuestion.showIf = questionTemplate.showIf;

              return processedQuestion;
            }),
          })
        );

        assessmentDataList.push({
          jobId: currentJob.id,
          title: `${selectedTemplate.title} for ${currentJob.title}`,
          description: selectedTemplate.description,
          sections: processedSections,
        });
      }

      return assessmentDataList;
    };
    const generatedJobs = generateJobData();
    const generatedCandidates = generateCandidateData(generatedJobs);
    const generatedAssessments = generateAssessmentData(generatedJobs);
    await storageService.seedIfEmpty({
      jobs: generatedJobs,
      candidates: generatedCandidates,
      assessments: generatedAssessments,
    });
  })();
  
  let mockServer = createServer({
    environment,

    routes() {
      this.namespace = "api";

      this.get("/jobs", async (schema, request) => {
        await simulateNetworkLatency();
        // parse query params
        const queryParameters = {
          search: request.queryParams.search,
          status: request.queryParams.status || "all",
          page: request.queryParams.page || 1,
          pageSize: request.queryParams.pageSize || 25,
          sort: request.queryParams.sort,
          tags: request.queryParams.tags
            ? request.queryParams.tags.split(",")
            : undefined,
        };
        const responseData = await storageService.getJobs(queryParameters);
        return responseData;
      });

      // Candidates endpoints
      this.get("/candidates", async (schema, request) => {
        await simulateNetworkLatency();
        const queryParameters = {
          search: request.queryParams.search,
          stage: request.queryParams.stage || "all",
          page: request.queryParams.page || 1,
        };
        const responseData = await storageService.getCandidates(
          queryParameters
        );
        return responseData;
      });

      // Fetch a single candidate by id
      this.get("/candidates/:id", async (schema, request) => {
        await simulateNetworkLatency();
        const candidateId = request.params.id;
        // Fetch a large page to ensure we can find the candidate without separate storage API
        const candidateData = await storageService.getCandidates({
          page: 1,
          pageSize: 10000,
        });
        const foundCandidate = (candidateData.candidates || []).find(
          (candidate) => String(candidate.id) === String(candidateId)
        );
        if (!foundCandidate)
          return new Response(404, {}, { error: "Candidate not found" });
        return { candidate: foundCandidate };
      });

      this.post("/candidates", async (schema, request) => {
        await simulateNetworkLatency();
        const candidateAttributes = JSON.parse(request.requestBody);
        // uniqueness check on email (case-insensitive)
        const emailAddress = String(candidateAttributes.email || "")
          .trim()
          .toLowerCase();
        if (emailAddress) {
          const allCandidates = await storageService.getCandidates({});
          const emailExists = (allCandidates.candidates || []).some(
            (candidate) =>
              String(candidate.email || "")
                .trim()
                .toLowerCase() === emailAddress
          );
          if (emailExists)
            return new Response(
              409,
              {},
              { error: "A candidate with this email already exists" }
            );
        }
        const newCandidate = await storageService.addCandidate(
          candidateAttributes
        );
        return { candidate: newCandidate };
      });

      this.put("/candidates/:id", async (schema, request) => {
        await simulateNetworkLatency();
        const candidateId = request.params.id;
        const updateAttributes = JSON.parse(request.requestBody);
        // uniqueness check if email provided
        if (updateAttributes.email !== undefined) {
          const emailAddress = String(updateAttributes.email || "")
            .trim()
            .toLowerCase();
          if (emailAddress) {
            const allCandidates = await storageService.getCandidates({});
            const emailExists = (allCandidates.candidates || []).some(
              (candidate) =>
                String(candidate.email || "")
                  .trim()
                  .toLowerCase() === emailAddress &&
                String(candidate.id) !== String(candidateId)
            );
            if (emailExists)
              return new Response(
                409,
                {},
                { error: "A candidate with this email already exists" }
              );
          }
        }
        const updatedCandidate = await storageService.updateCandidate(
          candidateId,
          updateAttributes
        );
        return { candidate: updatedCandidate };
      });

      this.del("/candidates/:id", async (schema, request) => {
        await simulateNetworkLatency();
        if (shouldSimulateFailure())
          return new Response(500, {}, { error: "Random write error" });
        const candidateId = request.params.id;
        await storageService.deleteCandidate(candidateId);
        return { success: true };
      });

      this.post("/jobs", async (schema, request) => {
        await simulateNetworkLatency();
        if (shouldSimulateFailure())
          return new Response(500, {}, { error: "Random write error" });
        const jobAttributes = JSON.parse(request.requestBody);
        const existingJobs = (await storageService.getJobs()) || [];
        const newJob = { id: Date.now().toString(), ...jobAttributes };
        existingJobs.push(newJob);
        await storageService.saveJobs(existingJobs);
        return { job: newJob };
      });

      this.put("/jobs/:id", async (schema, request) => {
        await simulateNetworkLatency();
        if (shouldSimulateFailure())
          return new Response(500, {}, { error: "Random write error" });
        const jobId = request.params.id;
        const updateAttributes = JSON.parse(request.requestBody);
        const updatedJob = await storageService.updateJob(
          jobId,
          updateAttributes
        );
        return { job: updatedJob };
      });

      this.patch("/jobs/:id/archive", async (schema, request) => {
        await simulateNetworkLatency();
        if (shouldSimulateFailure())
          return new Response(500, {}, { error: "Random write error" });
        const jobId = request.params.id;
        const archiveAttributes = JSON.parse(request.requestBody);
        const isArchived = archiveAttributes.archived === true;
        const archivedJob = await storageService.archiveJob(jobId, isArchived);
        return { job: archivedJob };
      });

      this.post("/jobs/reorder", async (schema, request) => {
        await simulateNetworkLatency();
        // occasionally return 500 to test rollback
        if (shouldSimulateFailure(0.08))
          return new Response(
            500,
            {},
            { error: "Intermittent reorder failure" }
          );
        const requestBody = JSON.parse(request.requestBody);
        const { order } = requestBody; // expect { order: [id1, id2, ...] }
        const reorderedJobs = await storageService.reorderJobs(order || []);
        return { jobs: reorderedJobs };
      });

      this.post("/jobs/bulk-unarchive", async (schema, request) => {
        await simulateNetworkLatency();
        const requestBody = JSON.parse(request.requestBody);
        const { ids } = requestBody;
        const unarchivedJobs = await storageService.bulkUnarchive(ids || []);
        return { jobs: unarchivedJobs };
      });

      this.del("/jobs/:id", async (schema, request) => {
        await simulateNetworkLatency();
        if (shouldSimulateFailure())
          return new Response(500, {}, { error: "Random write error" });
        const jobId = request.params.id;
        let existingJobs = await storageService.getJobs();
        existingJobs = existingJobs.filter(
          (job) => String(job.id) !== String(jobId)
        );
        await storageService.saveJobs(existingJobs);
        return { success: true };
      });

      // Candidate timeline
      this.get("/candidates/:id/timeline", async (schema, request) => {
        await simulateNetworkLatency();
        const candidateId = request.params.id;
        const timelineData = await storageService.getTimeline(candidateId);
        return { timeline: timelineData };
      });

      // Assessments endpoints
      this.get("/assessments/:jobId", async (schema, request) => {
        await simulateNetworkLatency();
        const jobId = request.params.jobId;
        const assessmentData = await storageService.getAssessment(jobId);
        return { assessment: assessmentData };
      });

      this.put("/assessments/:jobId", async (schema, request) => {
        await simulateNetworkLatency();
        if (shouldSimulateFailure())
          return new Response(500, {}, { error: "Random write error" });
        const jobId = request.params.jobId;
        const assessmentPayload = JSON.parse(request.requestBody);
        const savedAssessment = await storageService.saveAssessment(
          jobId,
          assessmentPayload
        );
        return { assessment: savedAssessment };
      });

      this.post("/assessments/:jobId/submit", async (schema, request) => {
        await simulateNetworkLatency();
        const jobId = request.params.jobId;
        const submissionPayload = JSON.parse(request.requestBody);
        const submissionResult = await storageService.submitAssessment(
          jobId,
          submissionPayload
        );
        return { submission: submissionResult };
      });

      // Assessments submissions list (for HR)
      this.get("/assessments/:jobId/submissions", async (schema, request) => {
        await simulateNetworkLatency();
        const jobId = request.params.jobId;
        const submissionsList = await storageService.getSubmissions(jobId);
        return { submissions: submissionsList };
      });

      // Candidate assignments
      this.get("/candidates/:id/assignments", async (schema, request) => {
        await simulateNetworkLatency();
        const candidateId = request.params.id;
        const assignmentsList = await storageService.getAssignments(
          candidateId
        );
        return { assignments: assignmentsList };
      });
      this.post("/candidates/:id/assign", async (schema, request) => {
        await simulateNetworkLatency();
        if (shouldSimulateFailure())
          return new Response(500, {}, { error: "Random write error" });
        const candidateId = request.params.id;
        const { jobId } = JSON.parse(request.requestBody);
        const updatedAssignments = await storageService.assignAssessment(
          candidateId,
          jobId
        );
        return { assignments: updatedAssignments };
      });

      // Candidate auth: invite and login
      this.post("/auth/invite", async (schema, request) => {
        await simulateNetworkLatency();
        if (shouldSimulateFailure())
          return new Response(500, {}, { error: "Random write error" });
        const { candidateId, email } = JSON.parse(request.requestBody);
        // generate simple random password
        const temporaryPassword = Math.random().toString(36).slice(2, 8);
        const authCredentials = await storageService.createCandidateAuth(
          candidateId,
          email,
          temporaryPassword
        );
        // simulate email outbox
        await storageService.addOutboxMessage({
          to: email,
          subject: "Your TalentFlow access",
          body: `Hello, your temporary password is: ${temporaryPassword}`,
        });
        return {
          auth: { email: authCredentials.email },
          password: temporaryPassword,
        };
      });
      this.post("/auth/login", async (schema, request) => {
        await simulateNetworkLatency();
        const { email, password } = JSON.parse(request.requestBody);
        const normalizedEmail = String(email || "")
          .trim()
          .toLowerCase();
        const providedPassword = String(password || "").trim();
        if (!normalizedEmail || !providedPassword)
          return new Response(
            400,
            {},
            { error: "Email and password are required" }
          );
        const authCredentials = await storageService.getCandidateAuthByEmail(
          normalizedEmail
        );
        if (!authCredentials || authCredentials.password !== providedPassword)
          return new Response(401, {}, { error: "Invalid credentials" });
        // Ensure the candidate still exists
        const allCandidates = await storageService.getCandidates({});
        const candidateExists = (allCandidates.candidates || []).some(
          (candidate) =>
            String(candidate.id) === String(authCredentials.candidateId)
        );
        if (!candidateExists)
          return new Response(401, {}, { error: "Invalid credentials" });
        return {
          session: {
            candidateId: authCredentials.candidateId,
            email: authCredentials.email,
          },
        };
      });

      // Debug outbox viewer (optional)
      this.get("/outbox", async () => {
        await simulateNetworkLatency();
        const outboxMessages = await storageService.getOutbox();
        return { outbox: outboxMessages };
      });

      // Development helper: force re-seed data
      this.post("/dev/reseed", async () => {
        await simulateNetworkLatency();
        // Clear existing data
        await storageService.clearAll();
        // Re-seed with new data
        const generatedJobs = generateJobData();
        const generatedCandidates = generateCandidateData(generatedJobs);
        const generatedAssessments = generateAssessmentData(generatedJobs);
        await storageService.seedIfEmpty({
          jobs: generatedJobs,
          candidates: generatedCandidates,
          assessments: generatedAssessments,
        });
        return { success: true, message: "Data re-seeded successfully" };
      });

      // allow other requests to pass through to the network
      this.passthrough();
      this.passthrough("https://api.emailjs.com/**");
    },
  });

  // seed data if empty (25 jobs, 1000 candidates, 3 assessments)

  return mockServer;
}
