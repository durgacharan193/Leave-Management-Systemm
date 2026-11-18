const pptxgen = require('pptxgenjs');

let pptx = new pptxgen();

pptx.layout = 'LAYOUT_16x9';

// Define master slide for consistency
pptx.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: 'FFFFFF' },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: 0.75, fill: { color: '2563EB' } } },
    { text: { text: 'LeaveFlow', options: { x: 0.5, y: 0.1, w: 3, h: 0.5, fontFace: 'Arial', fontSize: 24, color: 'FFFFFF', bold: true } } }
  ]
});

// 1. Title Slide
let slide1 = pptx.addSlide();
slide1.background = { color: '2563EB' }; // Blue background
slide1.addText('LeaveFlow', { x: 1, y: 2.5, w: 8, fontSize: 54, color: 'FFFFFF', bold: true, align: 'center' });
slide1.addText('Role-Based Leave Management System', { x: 1, y: 3.5, w: 8, fontSize: 24, color: 'E2E8F0', align: 'center' });
slide1.addText('Project Presentation', { x: 1, y: 4.8, w: 8, fontSize: 18, color: 'FFFFFF', align: 'center', italic: true });

// 2. Problem Statement
let slide2 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide2.addText('The Problem', { x: 0.5, y: 1.2, w: 9, fontSize: 36, color: '1E293B', bold: true });
slide2.addText([
  { text: 'Manual leave tracking is time-consuming and error-prone.', options: { bullet: true } },
  { text: 'Lack of transparency regarding leave balances.', options: { bullet: true } },
  { text: 'Approval workflows are slow and disconnected.', options: { bullet: true } },
  { text: 'Hard to gather company-level analytics on employee absences.', options: { bullet: true } }
], { x: 0.5, y: 2.2, w: 9, fontSize: 24, color: '334155', lineSpacing: 36 });

// 3. The Solution
let slide3 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide3.addText('Our Solution: LeaveFlow', { x: 0.5, y: 1.2, w: 9, fontSize: 36, color: '1E293B', bold: true });
slide3.addText([
  { text: "A modern, full-stack web application designed to automate and simplify your company's leave tracking.", options: { bullet: true } },
  { text: 'Provides real-time dashboards for tracking requests and balances.', options: { bullet: true } },
  { text: 'Implements Role-Based Access Control (RBAC) ensuring correct governance.', options: { bullet: true } },
  { text: 'Responsive, user-friendly interface accessible from anywhere.', options: { bullet: true } }
], { x: 0.5, y: 2.2, w: 9, fontSize: 24, color: '334155', lineSpacing: 36 });

// 4. Key Features
let slide4 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide4.addText('Key Features Overview', { x: 0.5, y: 1.2, w: 9, fontSize: 36, color: '1E293B', bold: true });
slide4.addText([
  { text: 'For Employees', options: { fontSize: 22, bold: true, breakLine: true } },
  { text: '   • Apply for Casual, Sick, Paid, or Maternity leave\n   • View real-time personal leave balances\n   • Track status of pending requests', options: { fontSize: 18, color: '475569', breakLine: true } },
  { text: 'For Managers', options: { fontSize: 22, bold: true, breakLine: true } },
  { text: '   • Dedicated team dashboard to review applications\n   • One-click approve/reject actions with commenting\n   • Filter team requests by status and type', options: { fontSize: 18, color: '475569', breakLine: true } },
  { text: 'For Administrators', options: { fontSize: 22, bold: true, breakLine: true } },
  { text: '   • Oversee all company leaves via analytics charts\n   • User Account and System management', options: { fontSize: 18, color: '475569' } },
], { x: 0.5, y: 2, w: 9, h: 4.5, fill: { color: 'F8FAFC' }, p: 10, align: 'left', valign: 'top' });

// 5. Tech Stack
let slide5 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide5.addText('Technology Stack', { x: 0.5, y: 1.2, w: 9, fontSize: 36, color: '1E293B', bold: true });
slide5.addText([
  { text: 'Frontend Architecture', options: { fontSize: 24, bold: true, color: '2563EB', breakLine: true } },
  { text: '   • React.js with Vite for fast local development and builds\n   • Material-UI (MUI v5) for enterprise-grade components\n   • Axios for API communication and JWT interception', options: { fontSize: 20, color: '334155', breakLine: true } },
  { text: 'Backend Architecture', options: { fontSize: 24, bold: true, color: '10B981', breakLine: true } },
  { text: '   • Node.js & Express frame RESTful APIs\n   • MongoDB with Mongoose for NoSQL data persistence\n   • JSON Web Tokens (JWT) for secure authentication', options: { fontSize: 20, color: '334155' } },
], { x: 0.5, y: 2.2, w: 9, fontSize: 24, color: '334155', lineSpacing: 28 });

// 6. Security & Architecture
let slide6 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide6.addText('System Architecture', { x: 0.5, y: 1.2, w: 9, fontSize: 36, color: '1E293B', bold: true });
slide6.addText([
  { text: 'Robust Database Modeling:', options: { fontSize: 22, bold: true, breakLine: true } },
  { text: 'Referenced relational models between Users and Leave instances.', options: { fontSize: 18, color: '475569', breakLine: true } },
  { text: 'Gender-Aware Leave Validations:', options: { fontSize: 22, bold: true, breakLine: true } },
  { text: 'Maternity leave securely restricted based on contextual employee data.', options: { fontSize: 18, color: '475569', breakLine: true } },
  { text: 'Dynamic Analytics:', options: { fontSize: 22, bold: true, breakLine: true } },
  { text: 'MongoDB Aggregation pipes perform fast real-time statistical calculations.', options: { fontSize: 18, color: '475569' } },
], { x: 0.5, y: 2.2, w: 9, fontSize: 24, color: '334155', lineSpacing: 24 });

// 7. Conclusion
let slide7 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide7.addText('Conclusion & Future Scope', { x: 0.5, y: 1.2, w: 9, fontSize: 36, color: '1E293B', bold: true });
slide7.addText([
  { text: 'LeaveFlow provides a reliable, secure foundation for HR management operations.', options: { bullet: true } },
  { text: 'A completely decoupled frontend/backend creates scalability advantages.', options: { bullet: true } },
  { text: 'Future Additions:', options: { bullet: true, bold: true } },
  { text: 'Automated email alerts using Nodemailer.', options: { indentLevel: 1, bullet: true } },
  { text: 'Calendar Integration (Google Workspace/Outlook MS Graph).', options: { indentLevel: 1, bullet: true } },
  { text: 'Deep CSV and PDF Export capabilities for administration audit.', options: { indentLevel: 1, bullet: true } },
], { x: 0.5, y: 2.2, w: 9, fontSize: 24, color: '334155', lineSpacing: 36 });

let filename = 'Leave_Management_Presentation.pptx';
pptx.writeFile({ fileName: filename }).then(fileName => {
  console.log(`Successfully created ${fileName}`);
});
