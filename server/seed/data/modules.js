module.exports = [
    // ===== PHASE 1: FOUNDATION (Months 1-3) =====
    
    // VARC - Foundation
    { name: 'Reading Comprehension Basics', section: 'VARC', phase: 'Foundation', priority: 'High', estimatedHours: 25, order: 1 },
    { name: 'Vocabulary Building', section: 'VARC', phase: 'Foundation', priority: 'High', estimatedHours: 20, order: 2 },
    { name: 'Grammar Fundamentals', section: 'VARC', phase: 'Foundation', priority: 'Medium', estimatedHours: 15, order: 3 },
    { name: 'Sentence Correction', section: 'VARC', phase: 'Foundation', priority: 'Medium', estimatedHours: 12, order: 4 },
    
    // DILR - Foundation
    { name: 'Basic Data Interpretation', section: 'DILR', phase: 'Foundation', priority: 'High', estimatedHours: 20, order: 5 },
    { name: 'Tables and Charts', section: 'DILR', phase: 'Foundation', priority: 'High', estimatedHours: 18, order: 6 },
    { name: 'Simple Logical Reasoning', section: 'DILR', phase: 'Foundation', priority: 'Medium', estimatedHours: 15, order: 7 },
    { name: 'Blood Relations & Coding', section: 'DILR', phase: 'Foundation', priority: 'Low', estimatedHours: 10, order: 8 },
    
    // QA - Foundation
    { name: 'Number Systems', section: 'QA', phase: 'Foundation', priority: 'High', estimatedHours: 22, order: 9 },
    { name: 'Percentages & Ratios', section: 'QA', phase: 'Foundation', priority: 'High', estimatedHours: 20, order: 10 },
    { name: 'Averages & Mixtures', section: 'QA', phase: 'Foundation', priority: 'High', estimatedHours: 18, order: 11 },
    { name: 'Profit, Loss & Discount', section: 'QA', phase: 'Foundation', priority: 'Medium', estimatedHours: 16, order: 12 },
    { name: 'Simple & Compound Interest', section: 'QA', phase: 'Foundation', priority: 'Medium', estimatedHours: 14, order: 13 },
    { name: 'Time, Speed & Distance', section: 'QA', phase: 'Foundation', priority: 'High', estimatedHours: 20, order: 14 },
    { name: 'Time & Work', section: 'QA', phase: 'Foundation', priority: 'High', estimatedHours: 18, order: 15 },
    
    // ===== PHASE 2: INTERMEDIATE (Months 4-6) =====
    
    // VARC - Intermediate
    { name: 'Advanced Reading Comprehension', section: 'VARC', phase: 'Intermediate', priority: 'High', estimatedHours: 30, order: 16 },
    { name: 'Para Jumbles', section: 'VARC', phase: 'Intermediate', priority: 'High', estimatedHours: 20, order: 17 },
    { name: 'Para Summary', section: 'VARC', phase: 'Intermediate', priority: 'High', estimatedHours: 18, order: 18 },
    { name: 'Critical Reasoning', section: 'VARC', phase: 'Intermediate', priority: 'Medium', estimatedHours: 16, order: 19 },
    { name: 'Odd One Out', section: 'VARC', phase: 'Intermediate', priority: 'Medium', estimatedHours: 12, order: 20 },
    
    // DILR - Intermediate
    { name: 'Seating Arrangements', section: 'DILR', phase: 'Intermediate', priority: 'High', estimatedHours: 25, order: 21 },
    { name: 'Puzzles & Games', section: 'DILR', phase: 'Intermediate', priority: 'High', estimatedHours: 25, order: 22 },
    { name: 'Caselets', section: 'DILR', phase: 'Intermediate', priority: 'High', estimatedHours: 20, order: 23 },
    { name: 'Venn Diagrams & Set Theory', section: 'DILR', phase: 'Intermediate', priority: 'Medium', estimatedHours: 15, order: 24 },
    { name: 'Network Diagrams', section: 'DILR', phase: 'Intermediate', priority: 'Medium', estimatedHours: 12, order: 25 },
    
    // QA - Intermediate
    { name: 'Algebra - Equations', section: 'QA', phase: 'Intermediate', priority: 'High', estimatedHours: 22, order: 26 },
    { name: 'Algebra - Inequalities', section: 'QA', phase: 'Intermediate', priority: 'High', estimatedHours: 20, order: 27 },
    { name: 'Functions & Graphs', section: 'QA', phase: 'Intermediate', priority: 'Medium', estimatedHours: 18, order: 28 },
    { name: 'Logarithms & Surds', section: 'QA', phase: 'Intermediate', priority: 'Medium', estimatedHours: 16, order: 29 },
    { name: 'Geometry - Triangles', section: 'QA', phase: 'Intermediate', priority: 'High', estimatedHours: 22, order: 30 },
    { name: 'Geometry - Circles', section: 'QA', phase: 'Intermediate', priority: 'High', estimatedHours: 20, order: 31 },
    { name: 'Geometry - Quadrilaterals', section: 'QA', phase: 'Intermediate', priority: 'Medium', estimatedHours: 16, order: 32 },
    { name: 'Mensuration 2D & 3D', section: 'QA', phase: 'Intermediate', priority: 'High', estimatedHours: 20, order: 33 },
    
    // ===== PHASE 3: ADVANCED (Months 7-9) =====
    
    // VARC - Advanced
    { name: 'Complex RC Passages', section: 'VARC', phase: 'Advanced', priority: 'High', estimatedHours: 35, order: 34 },
    { name: 'Inference-Based Questions', section: 'VARC', phase: 'Advanced', priority: 'High', estimatedHours: 25, order: 35 },
    { name: 'Mixed VARC Practice', section: 'VARC', phase: 'Advanced', priority: 'High', estimatedHours: 30, order: 36 },
    
    // DILR - Advanced
    { name: 'CAT-Level DILR Sets', section: 'DILR', phase: 'Advanced', priority: 'High', estimatedHours: 40, order: 37 },
    { name: 'Mixed DILR Practice', section: 'DILR', phase: 'Advanced', priority: 'High', estimatedHours: 35, order: 38 },
    { name: 'Set Selection Strategy', section: 'DILR', phase: 'Advanced', priority: 'High', estimatedHours: 20, order: 39 },
    
    // QA - Advanced
    { name: 'Permutations & Combinations', section: 'QA', phase: 'Advanced', priority: 'High', estimatedHours: 25, order: 40 },
    { name: 'Probability', section: 'QA', phase: 'Advanced', priority: 'High', estimatedHours: 22, order: 41 },
    { name: 'Coordinate Geometry', section: 'QA', phase: 'Advanced', priority: 'Medium', estimatedHours: 18, order: 42 },
    { name: 'Trigonometry', section: 'QA', phase: 'Advanced', priority: 'Medium', estimatedHours: 16, order: 43 },
    { name: 'Mixed QA Practice', section: 'QA', phase: 'Advanced', priority: 'High', estimatedHours: 35, order: 44 },
    
    // ===== PHASE 4: FINAL PREP (Months 10-11) =====
    
    { name: 'Full-Length Mock Tests', section: 'VARC', phase: 'Final Prep', priority: 'High', estimatedHours: 50, order: 45 },
    { name: 'Sectional Tests - VARC', section: 'VARC', phase: 'Final Prep', priority: 'High', estimatedHours: 30, order: 46 },
    { name: 'Sectional Tests - DILR', section: 'DILR', phase: 'Final Prep', priority: 'High', estimatedHours: 30, order: 47 },
    { name: 'Sectional Tests - QA', section: 'QA', phase: 'Final Prep', priority: 'High', estimatedHours: 30, order: 48 },
    { name: 'Weak Area Revision', section: 'VARC', phase: 'Final Prep', priority: 'High', estimatedHours: 40, order: 49 },
    { name: 'Previous Year CAT Papers', section: 'DILR', phase: 'Final Prep', priority: 'High', estimatedHours: 25, order: 50 },
];
