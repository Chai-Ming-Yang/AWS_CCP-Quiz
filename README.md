# AWS Certified Cloud Practitioner Quiz Engine

An interactive, static exam simulation tool built to streamline your preparation for the AWS Certified Cloud Practitioner certification. 

🚀 **Start practicing here:** [https://aws-ccp-quiz.vercel.app/](https://aws-ccp-quiz.vercel.app/)

---

## 🎯 Core Features

* **Customizable Sessions:** Select exact exam categories and domains across separate difficulties to build custom practice sets tailored to your weak points.
* **Dynamic Layouts:** Questions and option order layouts are automatically randomized per attempt to prevent raw answer pattern memorization.
* **Instant Verification:** Validate your answers choice-by-choice during practice sessions with detailed underlying explanations provided instantly on confirmation.
* **Local Persistence Engine:** Keep track of your running preparation metrics. Your total practice history, overall score percentages, and wrong question logs are securely tracked completely inside your browser via local storage. No databases or logins required.

---

## 📊 Question Difficulties

The database splits focus cleanly across two primary tracks:
* **Easy Questions:** Straightforward, highly readable foundational definition checks. Excellent for standard vocabulary warming.
* **Hard Questions:** Complex scenario-driven inquiries, core case studies, and advanced multi-select combinations pulled directly from corporate Knowledge Check (KC) banks.

---

## ⚙️ Core Technical Architecture
* **Frontend Framework:** React 19 + TypeScript + Vite
* **Styling Engine:** Tailwind CSS v4
* **State & Persistence:** Zustand State Engine with Local JSON LocalStorage Persistence 
* **Deployment Target:** Vercel Static Hosting Platform
