const inputText = document.getElementById("inputText");
const issuesList = document.getElementById("issuesList");
const correctedText = document.getElementById("correctedText");
const scoreChip = document.getElementById("scoreChip");
const recommendations = document.getElementById("recommendations");

const sampleResponse = `The new policy was approved on March 3, 2025 and it guarantees a 45% reduction in incidents.\n\nAccording to several reports, the CEO said it will always remove human error. This program saved $12 million last quarter across all regions.`;

const riskyPatterns = [
  { label: "Specific date", regex: /(\b\d{1,2}\s)?(January|February|March|April|May|June|July|August|September|October|November|December)\b|\b\d{4}\b/ },
  { label: "Numbers or percentages", regex: /\b\d+(?:\.\d+)?%?\b/ },
  { label: "Absolute wording", regex: /\b(always|never|guarantees|proof|everyone|no one)\b/i },
  { label: "Attribution without source", regex: /\b(according to|reports say|studies show|experts agree)\b/i }
];

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function analyze(text) {
  const sentences = splitSentences(text);
  const issues = [];
  const kept = [];

  sentences.forEach((sentence) => {
    const hits = riskyPatterns.filter((pattern) => pattern.regex.test(sentence));
    if (hits.length) {
      const reasons = hits.map((hit) => hit.label).join(", ");
      issues.push({ sentence, reasons });
    } else {
      kept.push(sentence);
    }
  });

  const score = Math.max(40, 100 - issues.length * 12);
  const corrected = kept.length
    ? kept.join(" ")
    : "The response contains multiple claims that need verification. Please provide sources or rephrase with cautious language.";

  return { issues, score, corrected };
}

function renderResults({ issues, score, corrected }) {
  issuesList.innerHTML = "";

  if (!issues.length) {
    const li = document.createElement("li");
    li.innerHTML = "<strong>No issues flagged</strong>This response reads as cautious and non-absolute.";
    issuesList.appendChild(li);
  } else {
    issues.forEach((issue) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>Potential issue</strong>${issue.sentence}<br/><span>Why: ${issue.reasons}</span>`;
      issuesList.appendChild(li);
    });
  }

  scoreChip.textContent = `Score: ${score}`;
  correctedText.textContent = corrected;

  recommendations.innerHTML = "";
  const recs = [
    "Replace absolute claims with cautious language.",
    "Add sources or citations for dates, numbers, and named entities.",
    "Re-run after editing to confirm the response is stable."
  ];

  recs.forEach((rec) => {
    const p = document.createElement("p");
    p.textContent = rec;
    recommendations.appendChild(p);
  });
}

function runAudit() {
  const text = inputText.value.trim();
  if (!text) {
    correctedText.textContent = "Paste a response to analyze.";
    issuesList.innerHTML = "";
    scoreChip.textContent = "Score: --";
    return;
  }

  const result = analyze(text);
  renderResults(result);
}

function rerunWithCorrected() {
  const corrected = correctedText.textContent.trim();
  if (!corrected || corrected.includes("Run an audit")) {
    return;
  }
  inputText.value = corrected;
  runAudit();
}

function copyCorrected() {
  const text = correctedText.textContent.trim();
  if (!text) return;
  navigator.clipboard.writeText(text);
}

function setupReveal() {
  const revealTargets = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal", "is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((target) => {
    target.classList.add("reveal");
    observer.observe(target);
  });
}

setupReveal();

document.getElementById("runAudit").addEventListener("click", runAudit);
document.getElementById("runAuditInline").addEventListener("click", runAudit);
document.getElementById("clearInput").addEventListener("click", () => {
  inputText.value = "";
});
document.getElementById("loadSample").addEventListener("click", () => {
  inputText.value = sampleResponse;
});
document.getElementById("copyOutput").addEventListener("click", copyCorrected);
document.getElementById("rerunFix").addEventListener("click", rerunWithCorrected);
document.getElementById("rerunQuick").addEventListener("click", rerunWithCorrected);
