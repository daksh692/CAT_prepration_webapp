// Reading Comprehension Basics Module - All 5 Chapters (COMPLETE)
// Module 1: Reading Comprehension Basics (VARC)

module.exports = {
    
    // ========================================
    // Chapter 1: Understanding Passage Structure
    // NOTE: Already exists in fullStudyMaterials.js - will merge during seeding
    // ========================================
    
    // ========================================  
    // Chapter 2: Inference Questions
    // ========================================
    'Inference Questions': {
        chapterName: 'Inference Questions',
        videos: [],
        
        briefNotes: `Inference questions test your ability to draw logical conclusions from the passage without bringing in outside knowledge. They require connecting information to reach conclusions not explicitly stated.

**Key Understanding:**
• **Inference ≠ Fact**: Facts are directly stated; inferences are logically derived
• **100% True Rule**: Must be completely supported by passage evidence
• **No External Knowledge**: Base conclusions ONLY on what's written

**Common Question Patterns:**
• "It can be inferred that..."
• "The author implies that..."
• "Which of the following is most strongly supported..."
• "What is the most likely reason for..."

**Critical Techniques:**
• Stick strictly to passage content  
• Look for logical connections between ideas
• Eliminate assumptions and partial truths
• Choose the most conservative, fully-supported option`,

        detailedNotes: `<h2>Inference Questions - Complete CAT Guide</h2>

<h3>Understanding Inference Questions</h3>
<p>Inference questions test your ability to read "between the lines" and draw logical conclusions.</p>

<h3>Key Strategies</h3>
<ul>
<li>Stick strictly to passage - no external knowledge</li>
<li>Look for logical connections between ideas</li>
<li>Eliminate: direct facts, assumptions, partial truths</li>
<li>Choose most conservative, fully-supported option</li>
</ul>`,

        keyPointers: [
            'Inference = logical conclusion 100% supported by passage, not explicitly stated',
            'Golden Rule: Stick STRICTLY to passage - no external knowledge or assumptions',
            'Inference ≠ Fact: Facts are stated; inferences are derived through reasoning',
            'Look for logical connections between different parts of the passage',
            'Common triggers: "It can be inferred", "author implies", "passage suggests"',
            'Eliminate options that: restate facts, use partial truths, reverse logic, or require assumptions',
            'Choose "must be true" not "could be true" - most conservative option wins',
            'Correct answers often rephrase passage ideas using different vocabulary',
            'For each option ask: "Can I find specific passage evidence for this?"',
            'Two types: Broad inferences (main idea) and Specific inferences (from details)',
            'Common trap: Options mixing some passage truth with unsupported claims',
            'Scrutinize cause-effect relationships - don\'t let them get reversed',
            'Practice recognizing rephrased statements - strong vocabulary helps',
            'Time management: If inference isn\'t clearly supported, eliminate and move on',
            'Review mistakes thoroughly - understand WHY each wrong option fails'
        ],

        formulas: [
            'Inference = Passage Evidence + Logical Reasoning (NO external knowledge)',
            'Valid Inference Test: "Is this 100% supported by specific passage information?"',
            'Elimination Strategy: Remove directly stated facts, assumptions, partial truths, and reverse logic',
            'Conservative Choice Rule: When in doubt, choose the most carefully supported, least extreme option',
            'Connection Method: Look for Cause→Effect, Example→General, Comparison→Conclusion'
        ],

        examples: [
            {
                problem: 'Passage states: "Company X doubled its workforce in 2022." What can be inferred?',
                solution: 'The company was likely experiencing growth or expansion',
                explanation: 'Doubling workforce logically suggests growth. Cannot infer: profitability (not stated), worker happiness (not mentioned), or industry trends (external knowledge).'
            },
            {
                problem: 'Passage: "Unlike traditional methods, the new approach reduced costs by 40%." Inference?',
                solution: 'Traditional methods were more expensive than the new approach',
                explanation: 'Reduced costs by 40% compared to traditional methods logically means traditional methods cost more.'
            },
            {
                problem: 'Which is fact vs inference? "Sales dropped 30% after the price increase."',
                solution: 'Fact: Sales dropped 30%. Inference: Price increase likely caused the drop',
                explanation: 'The drop and timing are facts. The causal connection is inference - suggested by timing but not explicitly stated.'
            }
        ],

        practiceProblems: [
            {
                question: 'Passage: "80% of patients saw symptom reduction." What about the other 20%?',
                answer: 'They did not experience symptom reduction',
                difficulty: 'Easy',
                hint: '100% - 80% = ?',
                explanation: 'If 80% saw reduction, then 20% did not. Simple mathematical inference.'
            },
            {
                question: 'Passage: "Unlike her predecessor, the new CEO prioritized innovation." About predecessor?',
                answer: 'Did not prioritize innovation as much',
                difficulty: 'Easy',
                hint: 'What does "unlike" indicate?',
                explanation: '"Unlike" shows contrast. New CEO prioritizes innovation unlike predecessor means predecessor didn\'t.'
            },
            {
                question: 'Passage discusses only positives. Can we infer no negatives exist?',
                answer: 'No',
                difficulty: 'Medium',
                hint: 'Absence of mention ≠ non-existence',
                explanation: 'Not mentioning negatives doesn\'t mean they don\'t exist. Silence isn\'t evidence.'
            },
            {
                question: 'Event A happened, then Event B. Can we infer A caused B?',
                answer: 'No - temporal sequence ≠ causation',
                difficulty: 'Medium',
                hint: 'Timing vs causation',
                explanation: 'Events occurring in sequence doesn\'t prove causation without explicit statement.'
            },
            {
                question: 'Author spends 3 paragraphs on Topic A, 1 sentence on B. Inference?',
                answer: 'Author considers A more significant for discussion',
                difficulty: 'Medium',
                hint: 'Space allocation indicates importance',
                explanation: 'More space devoted suggests author views topic as more worthy of detailed treatment.'
            }
        ]
    },
    
    // ========================================
    // Chapter 3: Vocabulary in Context
    // ========================================
    'Vocabulary in Context': {
        chapterName: 'Vocabulary in Context',
        videos: [],
        
        briefNotes: `Vocabulary in context questions test your ability to determine word meanings based on how they're used in the passage, not just dictionary definitions.

**Key Principles:**
• Context is King: Meaning depends on usage, not memorization
• Look at surrounding sentences for clues
• Consider the author's tone and intent
• Eliminate obviously wrong meanings first

**Common Question Forms:**
• "In line X, the word Y most nearly means..."
• "The author uses the word X to convey..."
• "Which word could replace X without changing meaning..."`,

        detailedNotes: `<h2>Vocabulary in Context - CAT Guide</h2>
<p>These questions test contextual understanding, not vocabulary knowledge alone.</p>
<h3>Key Strategies</h3>
<ul>
<li>Read the sentence containing the word</li>
<li>Read sentences before and after for context</li>
<li>Substitute answer choices to test fit</li>
<li>Consider tone and purpose</li>
<li>Beware of common meanings that don't fit context</li>
</ul>`,

        keyPointers: [
            'Context determines meaning - dictionary definition may not apply',
            'Read surrounding sentences for contextual clues',
            'Substitute each answer choice to test which fits best',
            'Consider author\'s tone and overall message',
            'Look for synonyms or antonyms in nearby text',
            'Eliminate choices that don\'t match passage tone',
            'Beware trap: most common word meaning may be wrong',
            'Pay attention to positive/negative connotations',
            'Technical passages may use words in specialized ways',
            'Multiple meaning words tested frequently in CAT'
        ],

        formulas: [
            'Context Clues Method: Read sentence before + target sentence + sentence after',
            'Substitution Test: Replace word with each option and reread',
            'Tone Match: Word meaning must align with passage tone'
        ],

        examples: [
            {
                problem: 'Passage: "The politician\'s response was measured and diplomatic." What does "measured" mean here?',
                solution: 'Careful and thoughtful (not "quantified")',
                explanation: 'In context of diplomatic response, "measured" means calculated/careful, not the common meaning of "quantified" or "sized".'
            },
            {
                problem: '"The study\'s findings were modest." Modest likely means:',
                solution: 'Limited or small in scope',
                explanation: 'For study findings, "modest" means limited/small, not "humble" as commonly used for people.'
            }
        ],

        practiceProblems: [
            {
                question: 'In "The company took a conservative approach," conservative most likely means:',
                answer: 'Cautious or traditional',
                difficulty: 'Easy',
                hint: 'Business context, not political',
                explanation: 'In business context, conservative means cautious/traditional approach, not political ideology.'
            },
            {
                question: '"The argument was sound." Sound means:',
                answer: 'Logically valid',
                difficulty: 'Easy',
                hint: 'About arguments, not audio',
                explanation: 'For arguments, sound means logically valid/well-reasoned, not referring to audio.'
            },
            {
                question: '"Her explanation was transparent." Transparent means:',
                answer: 'Clear and easy to understand',
                difficulty: 'Medium',
                hint: 'About explanations',
                explanation: 'For explanations, transparent means clear/obvious, though can also mean see-through physically.'
            }
        ]
    },
    
    // ========================================
    // Chapter 4: Author's Purpose & Tone
    // ========================================
    "Author's Purpose & Tone": {
        chapterName: "Author's Purpose & Tone",
        videos: [],
        
        briefNotes: `Understanding WHY an author wrote the passage (purpose) and HOW they feel about the subject (tone) is critical for CAT RC.

**Author's Purpose - Common Types:**
• **Inform**: Present facts, explain concepts
• **Persuade**: Convince readers of a viewpoint
• **Criticize**: Point out flaws or problems
• **Analyze**: Examine causes, effects, relationships
• **Compare/Contrast**: Show similarities and differences

**Tone - Common Types:**
• **Objective/Neutral**: Factual, unbiased presentation
• **Critical/Skeptical**: Questioning, fault-finding
• **Optimistic/Positive**: Hopeful, favorable  
• **Pessimistic/Negative**: Doubtful, unfavorable
• **Sarcastic/Ironic**: Saying opposite of what's meant
• **Analytical**: Examining logically`,

        detailedNotes: `<h2>Author's Purpose & Tone</h2>
<h3>Identifying Purpose</h3>
<p>Ask: Why did the author write this?</p>
<ul>
<li>Look at overall message and conclusion</li>
<li>Note what author emphasizes most</li>
<li>Check if author takes a position</li>
</ul>
<h3>Identifying Tone</h3>
<p>Analyze word choice, examples used, and how ideas are presented</p>
<ul>
<li>Positive words = positive tone</li>
<li>Critical words = critical tone</li>
<li>Balanced presentation = neutral tone</li>
</ul>`,

        keyPointers: [
            'Purpose = WHY author wrote it; Tone = HOW author feels about subject',
            'Common purposes: Inform, Persuade, Criticize, Analyze, Compare',
            'Tone revealed through word choice, examples, and presentation style',
            'Distinguish between author\'s view and views they\'re reporting',
            'Sarcastic tone says opposite of literal meaning',
            'Analytical can still have positive/negative lean',
            'Look at conclusion paragraph for clearest purpose signal',
            'Strong language (must, never, always) suggests persuasive intent',
            'Balanced pros/cons suggests analytical purpose',
            'Questions without answers suggest thought-provoking intent'
        ],

        formulas: [
            'Purpose Test: Is author trying to inform, persuade, criticize, or analyze?',
            'Tone Test: Would author agree/disagree with subject? (reveals attitude)',
            'Word Choice Analysis: Positive/negative/neutral words reveal tone'
        ],

        examples: [
            {
                problem: 'Passage criticizes policy, lists problems, offers no solutions. Purpose?',
                solution: 'To criticize (point out flaws)',
                explanation: 'Listing problems without solutions indicates critical purpose, not analytical or persuasive.'
            },
            {
                problem: 'Passage uses words like "merely", "unfortunately", "fails to". Tone?',
                solution: 'Critical or Negative',
                explanation: 'These diminishing/negative words reveal critical tone toward the subject.'
            }
        ],

        practiceProblems: [
            {
                question: 'Passage presents both benefits and drawbacks of technology objectively. Purpose?',
                answer: 'To analyze or inform',
                difficulty: 'Easy',
                hint: 'Balanced presentation',
                explanation: 'Objective presentation of both sides suggests analytical or informative purpose, not persuasive.'
            },
            {
                question: 'Author uses words like "brilliant", "innovative", "groundbreaking". Tone?',
                answer: 'Positive or Admiring',
                difficulty: 'Easy',
                hint: 'What do these words suggest?',
                explanation: 'These strongly positive words indicate admiring/positive tone toward subject.'
            },
            {
                question: 'Passage states facts about historical event with no judgment. Tone?',
                answer: 'Objective or Neutral',
                difficulty: 'Medium',
                hint: 'Facts without opinion',
                explanation: 'Factual presentation without evaluative language indicates objective/neutral tone.'
            }
        ]
    },
    
    // ========================================
    // Chapter 5: Practice Passages
    // ========================================
    'Practice Passages': {
        chapterName: 'Practice Passages',
        videos: [],
        
        briefNotes: `Practice is essential for RC mastery. This chapter provides strategies for effective practice and common passage types in CAT.

**CAT Passage Types:**
• **Argumentative**: Author presents and defends a position
• **Explanatory**: Describes how something works or why it happens
• **Narrative**: Tells a story or describes events
• **Comparative**: Examines similarities and differences

**Effective Practice Strategy:**
•1. Time yourself (2-3 min reading + 4-5 min questions)
• Analyze mistakes thoroughly
• Note question types you struggle with
• Practice daily with diverse topics`,

        detailedNotes: `<h2>Practice Passages - Systematic Approach</h2>
<h3>How to Practice Effectively</h3>
<ol>
<li>Start untimed to build comprehension</li>
<li>Gradually add time pressure</li>
<li>Review every wrong answer thoroughly</li>
<li>Track patterns in your mistakes</li>
<li>Practice different passage types and lengths</li>
</ol>
<h3>Common CAT Topics</h3>
<ul>
<li>Social sciences</li>
<li>Economics and business</li>
<li>Science and technology</li>
<li>Arts and culture</li>
<li>Philosophy and ethics</li>
</ul>`,

        keyPointers: [
            'Practice 2-3 passages daily for consistent improvement',
            'Time yourself: 2-3 min reading + 4-5 min for questions',
            'Review mistakes more important than volume of practice',
            'Track which question types you struggle with most',
            'Practice diverse topics to build adaptability',
            'Start untimed, gradually add time pressure',
            'CAT favors dense, academic-style passages',
            'Note-taking while reading helps for longer passages',
            'First and last paragraphs often have main idea',
            'Don\'t get stuck on one hard question - move on and return'
        ],

        formulas: [
            'Optimal Practice: Daily consistency > occasional marathon sessions',
            'Error Analysis: Wrong answer → Why wrong → How to avoid → Practice similar',
            'Time Management: 7-8 min total per passage maximum in CAT'
        ],

        examples: [
            {
                problem: 'You consistently miss inference questions. What to do?',
                solution: 'Focus practice on inference-heavy passages, review inference rules',
                explanation: 'Targeted practice on weak areas more effective than random practice.'
            }
        ],

        practiceProblems: [
            {
                question: 'What is the recommended daily RC practice volume for CAT?',
                answer: '2-3 passages daily',
                difficulty: 'Easy',
                hint: 'Consistency matters',
                explanation: 'Consistent daily practice of 2-3 passages more effective than irregular high volume.'
            },
            {
                question: 'Where in a passage is the main idea often found?',
                answer: 'First and/or last paragraphs',
                difficulty: 'Easy',
                hint: 'Introduction and conclusion',
                explanation: 'Authors typically introduce main idea early and/or conclude with it.'
            },
            {
                question: 'Maximum time to spend on one RC passage in CAT?',
                answer: '7-8 minutes total',
                difficulty: 'Medium',
                hint: 'Reading + questions',
                explanation: 'Recommended: 2-3 min reading + 4-5 min questions = 7-8 min maximum per passage.'
            }
        ]
    }
};
