import type { BeltLevel } from "./course";

export interface CertificateState {
  certificateId: string;
  learnerName: string;
  courseTitle: string;
  belt: BeltLevel;
  completionDate: string;
  issuedBy: string;
  verificationUrl: string;
  downloaded: boolean;
  shared: boolean;
  postedToLinkedIn: boolean;
}

export const mockCertificate: CertificateState = {
  certificateId: "cert_mock_2026_001",
  learnerName: "Thandi Mokoena",
  courseTitle: "Six Sigma White Belt",
  belt: "white",
  completionDate: "26 May 2026",
  issuedBy: "Six Sigma South Africa · powered by Sigmafy",
  verificationUrl: "https://verify.sigmafy.example/cert/mock_2026_001",
  downloaded: false,
  shared: false,
  postedToLinkedIn: false,
};
