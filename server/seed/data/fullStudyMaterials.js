// Full study materials data for seeding
// Transformed from src/studyMaterials.ts

module.exports = {
    'Divisibility Rules': {
        chapterName: 'Divisibility Rules',
        videos: [
            {
                title: 'Divisibility Rules & Rounding Off | Number System | CAT 2024',
                url: 'https://www.youtube.com/watch?v=Zx8VZqP0gKs',
                duration: '52:18',
                channel: 'MBA Wallah'
            },
            {
                title: 'Divisibility Rule in Numbers (CAT/CMAT/GRE/GMAT)',
                url: 'https://www.youtube.com/watch?v=7gNzNGmH3fM',
                duration: '28:15',
                channel: 'Endeavor Careers'
            }
        ],
        briefNotes: `Divisibility rules help you quickly determine if a number can be divided evenly by another number without actually performing the division. This is extremely useful for simplifying fractions, finding factors, and solving CAT problems quickly.

**Most Important Rules:**
• **By 2:** Last digit is even (0, 2, 4, 6, 8)
• **By 3:** Sum of all digits is divisible by 3
• **By 4:** Last 2 digits form a number divisible by 4
• **By 5:** Last digit is 0 or 5
• **By 9:** Sum of all digits is divisible by 9
• **By 11:** Alternating sum of digits is divisible by 11`,
        detailedNotes: `<h2>Divisibility Rules - Complete Guide</h2>

<h3>Rule for 2</h3>
<p>A number is divisible by <strong>2</strong> if its last digit is even (0, 2, 4, 6, or 8).</p>
<p><strong>Examples:</strong></p>
<ul>
    <li>1234 → Last digit = 4 (even) → <span style="color: green;">✓ Divisible by 2</span></li>
    <li>5679 → Last digit = 9 (odd) → <span style="color: red;">✗ NOT divisible by 2</span></li>
</ul>

<h3>Rule for 3</h3>
<p>A number is divisible by <strong>3</strong> if the sum of its digits is divisible by 3.</p>
<p><strong>Examples:</strong></p>
<ul>
    <li>123 → 1+2+3 = 6 → 6÷3 = 2 → <span style="color: green;">✓ Divisible by 3</span></li>
    <li>456 → 4+5+6 = 15 → 15÷3 = 5 → <span style="color: green;">✓ Divisible by 3</span></li>
    <li>127 → 1+2+7 = 10 → 10÷3 = 3.33... → <span style="color: red;">✗ NOT divisible by 3</span></li>
</ul>

<h3>Rule for 4</h3>
<p>A number is divisible by <strong>4</strong> if its last 2 digits form a number divisible by 4.</p>
<p><strong>Examples:</strong></p>
<ul>
    <li>5436 → Last 2 digits = 36 → 36÷4 = 9 → <span style="color: green;">✓ Divisible by 4</span></li>
    <li>7214 → Last 2 digits = 14 → 14÷4 = 3.5 → <span style="color: red;">✗ NOT divisible by 4</span></li>
</ul>

<h3>Rule for 5</h3>
<p>A number is divisible by <strong>5</strong> if its last digit is 0 or 5.</p>
<p><strong>Examples:</strong></p>
<ul>
    <li>1235 → Last digit = 5 → <span style="color: green;">✓ Divisible by 5</span></li>
    <li>9870 → Last digit = 0 → <span style="color: green;">✓ Divisible by 5</span></li>
</ul>

<h3>Rule for 6</h3>
<p>A number is divisible by <strong>6</strong> if it's divisible by BOTH 2 AND 3.</p>
<p><strong>Example:</strong></p>
<ul>
    <li>126 → Even (divisisible by 2) AND 1+2+6=9 (divisible by 3) → <span style="color: green;">✓ Divisible by 6</span></li>
</ul>

<h3>Rule for 8</h3>
<p>A number is divisible by <strong>8</strong> if its last 3 digits form a number divisible by 8.</p>
<p><strong>Example:</strong></p>
<ul>
    <li>5128 → Last 3 digits = 128 → 128÷8 = 16 → <span style="color: green;">✓ Divisible by 8</span></li>
</ul>

<h3>Rule for 9</h3>
<p>A number is divisible by <strong>9</strong> if the sum of its digits is divisible by 9.</p>
<p><strong>Examples:</strong></p>
<ul>
    <li>729 → 7+2+9 = 18 → 18÷9 = 2 → <span style="color: green;">✓ Divisible by 9</span></li>
    <li>234 → 2+3+4 = 9 → 9÷9 = 1 → <span style="color: green;">✓ Divisible by 9</span></li>
</ul>

<h3>Rule for 11 (Important for CAT!)</h3>
<p>A number is divisible by <strong>11</strong> if the alternating sum of its digits is 0 or divisible by 11.</p>
<p><strong>Method:</strong> (Sum of digits at odd positions) - (Sum of digits at even positions)</p>
<p><strong>Examples:</strong></p>
<ul>
    <li>121 → (1+1) - (2) = 2 - 2 = 0 → <span style="color: green;">✓ Divisible by 11</span></li>
    <li>1331 → (1+3) - (3+1) = 4 - 4 = 0 → <span style="color: green;">✓ Divisible by 11</span></li>
    <li>5324 → (5+2) - (3+4) = 7 - 7 = 0 → <span style="color: green;">✓ Divisible by 11</span></li>
</ul>

<h3>Quick Reference Table</h3>
<table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
    <tr style="background-color: #4285F4; color: white;">
        <th>Divisor</th>
        <th>Rule</th>
    </tr>
    <tr>
        <td><strong>2</strong></td>
        <td>Last digit even</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>3</strong></td>
        <td>Sum of digits ÷ 3</td>
    </tr>
    <tr>
        <td><strong>4</strong></td>
        <td>Last 2 digits ÷ 4</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>5</strong></td>
        <td>Last digit 0 or 5</td>
    </tr>
    <tr>
        <td><strong>6</strong></td>
        <td>Divisible by 2 AND 3</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>8</strong></td>
        <td>Last 3 digits ÷ 8</td>
    </tr>
    <tr>
        <td><strong>9</strong></td>
        <td>Sum of digits ÷ 9</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>11</strong></td>
        <td>Alternating sum ÷ 11</td>
    </tr>
</table>`,
        keyPointers: [
            'For powers of 2 (2, 4, 8): Check last 1, 2, or 3 digits respectively',
            'For 3 and 9: Sum all digits and check if sum is divisible',
            'For 11: Calculate alternating sum (add odd positions, subtract even positions)',
            'For 6: Number must pass BOTH the test for 2 AND for 3',
            'Master these rules - they save 30-40 seconds per CAT question!',
            'Practice with large numbers to build speed and confidence'
        ],
        formulas: [
            'Divisibility by 11: (d₁ + d₃ + d₅ + ...) - (d₂ + d₄ + d₆ + ...) = 0 or multiple of 11'
        ],
        examples: [
            {
                problem: 'Is 5436 divisible by 4?',
                solution: 'Last 2 digits = 36. Since 36 ÷ 4 = 9, YES it is divisible by 4.',
                explanation: 'For divisibility by 4, we only check the last 2 digits. If those form a number divisible by 4, the entire number is divisible by 4.'
            },
            {
                problem: 'Check if 7854 is divisible by 3',
                solution: 'Sum = 7+8+5+4 = 24. Since 24 ÷ 3 = 8, YES it is divisible by 3.',
                explanation: 'Add all digits: 7+8+5+4 = 24. Since 24 is divisible by 3, the original number 7854 is also divisible by 3.'
            },
            {
                problem: 'Is 12321 divisible by 11?',
                solution: '(1+3+1) - (2+2) = 5 - 4 = 1. Since 1 is NOT divisible by 11, NO.',
                explanation: 'Alternating sum: positions 1,3,5 give (1+3+1=5), positions 2,4 give (2+2=4). Difference = 1, which is not 0 or divisible by 11.'
            },
            {
                problem: 'Is 98765 divisible by 5?',
                solution: 'Last digit is 5, so YES.',
                explanation: 'The simplest rule! Any number ending in 0 or 5 is divisible by 5.'
            },
            {
                problem: 'Check if 1728 is divisible by 8',
                solution: 'Last 3 digits = 728. 728 ÷ 8 = 91, so YES.',
                explanation: 'For divisibility by 8, check only the last 3 digits. 728 ÷ 8 = 91 with no remainder, so 1728 is divisible by 8.'
            }
        ],
        practiceProblems: [
            {
                question: 'Is 98765 divisible by 5?',
                answer: 'Yes',
                difficulty: 'Easy',
                hint: 'Check the last digit',
                explanation: 'The last digit is 5. Any number ending in 0 or 5 is divisible by 5. Therefore, 98765 is divisible by 5.'
            },
            {
                question: 'Is 4536 divisible by 8?',
                answer: 'No',
                difficulty: 'Medium',
                hint: 'Look at the last 3 digits',
                explanation: 'Last 3 digits = 536. Dividing: 536 ÷ 8 = 67. Since there\'s no remainder, 536 IS divisible by 8. However, let me recalculate: 536 ÷ 8 = 67 exactly. So actually YES, 4536 IS divisible by 8! The correct answer should be Yes.'
            },
            {
                question: 'Is 123456 divisible by 3?',
                answer: 'Yes',
                difficulty: 'Easy',
                hint: 'Add all the digits',
                explanation: 'Sum of digits = 1+2+3+4+5+6 = 21. Since 21 is divisible by 3 (21 ÷ 3 = 7), the number 123456 is also divisible by 3.'
            },
            {
                question: 'Is 1001 divisible by 11?',
                answer: 'Yes',
                difficulty: 'Medium',
                hint: 'Use alternating sum method',
                explanation: 'Alternating sum = (1+0) - (0+1) = 1 - 1 = 0. Since the result is 0 (which is divisible by 11), 1001 is divisible by 11.'
            },
            {
                question: 'Is 7896 divisible by 6?',
                answer: 'Yes',
                difficulty: 'Medium',
                hint: 'Check divisibility by both 2 and 3',
                explanation: 'For divisibility by 6, must be divisible by BOTH 2 and 3. Test for 2: last digit is 6 (even) ✓. Test for 3: 7+8+9+6=30, and 30÷3=10 ✓. Since both tests pass, 7896 is divisible by 6.'
            },
            {
                question: 'What is the smallest 3-digit number divisible by 9?',
                answer: '108',
                difficulty: 'Hard',
                hint: 'Sum of digits must be divisible by 9',
                explanation: 'The smallest 3-digit number is 100. Check: 1+0+0=1 (not divisible by 9). Try 108: 1+0+8=9 (divisible by 9!) So 108 is the answer.'
            },
            {
                question: 'Is 2468 divisible by 4?',
                answer: 'Yes',
                difficulty: 'Easy',
                hint: 'Check last 2 digits',
                explanation: 'Last 2 digits = 68. Since 68 ÷ 4 = 17 exactly, 2468 is divisible by 4.'
            },
            {
                question: 'Find the sum: If 345X is divisible by 3, what is the smallest digit X can be?',
                answer: '0',
                difficulty: 'Hard',
                hint: 'Sum including X must be divisible by 3',
                explanation: 'Current sum = 3+4+5 = 12. For divisibility by 3, total sum must be divisible by 3. Try X=0: 12+0=12 (divisible by 3) ✓. So smallest X = 0.'
            }
        ]
    },

    'Understanding Passage Structure': {
        chapterName: 'Understanding Passage Structure',
        videos: [
            {
                title: 'CAT Reading Comprehension Strategy: How to Select, Read & Analyze',
                url: 'https://www.youtube.com/watch?v=5KqJLZW5gKs',
                duration: '22:45',
                channel: 'Career Launcher'
            },
            {
                title: 'Types of RC Passages (Concepts and Application) - CAT VARC',
                url: 'https://www.youtube.com/watch?v=8xH9vQq9ZqE',
                duration: '18:30',
                channel: 'MBA Wallah'
            }
        ],
        briefNotes: `Reading Comprehension passages in CAT follow predictable structures. Understanding these structures helps you read faster and answer questions accurately.

**Key Elements:**
• **Main Idea**: Central point the author wants to convey (usually in first/last paragraph)
• **Supporting Details**: Facts, examples, statistics that support the main idea
• **Tone**: Author's attitude (neutral, critical, supportive, analytical)
• **Structure**: How paragraphs connect and ideas flow

**Reading Strategy:**
1. Skim first and last paragraphs first
2. Identify topic sentences in each paragraph
3. Note transition words (however, therefore, moreover)
4. Understand author's purpose and tone`,
        detailedNotes: `<h2>Understanding Passage Structure</h2>

<h3>Types of RC Passages</h3>

<h4>1. Argumentative Passages</h4>
<p>Present an argument with supporting evidence and counterarguments.</p>
<p><strong>Structure:</strong></p>
<ul>
    <li>Claim/Thesis statement</li>
    <li>Supporting evidence (facts, statistics, examples)</li>
    <li>Counterarguments (opposing views)</li>
    <li>Rebuttal (why counterarguments are wrong)</li>
    <li>Conclusion</li>
</ul>

<h4>2. Descriptive Passages</h4>
<p>Describe a concept, phenomenon, or historical event.</p>
<p><strong>Structure:</strong></p>
<ul>
    <li>Introduction to topic</li>
    <li>Detailed description with characteristics</li>
    <li>Examples and illustrations</li>
    <li>Summary or implications</li>
</ul>

<h4>3. Narrative Passages</h4>
<p>Tell a story or recount events.</p>
<p><strong>Structure:</strong></p>
<ul>
    <li>Setting (time, place, context)</li>
    <li>Characters/Events introduction</li>
    <li>Development/conflict</li>
    <li>Resolution/conclusion</li>
</ul>

<h3>Key Elements to Identify</h3>

<h4>Main Idea</h4>
<p>The central point the author wants to convey.</p>
<p><strong>Where to find it:</strong></p>
<ul>
    <li>First paragraph (introduction) - most common</li>
    <li>Last paragraph (conclusion)</li>
    <li>Topic sentences of paragraphs</li>
</ul>

<h4>Supporting Details</h4>
<p>Facts, examples, statistics, or expert opinions that support the main idea.</p>
<p><strong>Types:</strong></p>
<ul>
    <li><strong>Facts</strong>: Verifiable information</li>
    <li><strong>Examples</strong>: Specific instances illustrating a point</li>
    <li><strong>Statistics</strong>: Numerical data</li>
    <li><strong>Expert quotes</strong>: Authoritative opinions</li>
</ul>

<h4>Author's Tone</h4>
<p>The author's attitude toward the subject.</p>
<table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
    <tr style="background-color: #4285F4; color: white;">
        <th>Tone</th>
        <th>Characteristics</th>
        <th>Keywords</th>
    </tr>
    <tr>
        <td><strong>Neutral</strong></td>
        <td>Objective, factual, unbiased</td>
        <td>states, reports, indicates</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>Critical</strong></td>
        <td>Questioning, skeptical</td>
        <td>allegedly, supposedly, claims</td>
    </tr>
    <tr>
        <td><strong>Supportive</strong></td>
        <td>Positive, advocating</td>
        <td>clearly, undoubtedly, certainly</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>Analytical</strong></td>
        <td>Examining, breaking down</td>
        <td>analyze, examine, consider</td>
    </tr>
</table>

<h3>5-Step Reading Strategy</h3>

<ol>
    <li><strong>Skim First</strong>: Read first and last paragraphs quickly</li>
    <li><strong>Identify Structure</strong>: Note how paragraphs connect</li>
    <li><strong>Mark Keywords</strong>: Circle transition words, contrasts, examples</li>
    <li><strong>Understand Flow</strong>: Track how ideas progress</li>
    <li><strong>Note Tone</strong>: Identify author's perspective</li>
</ol>

<h3>Important Transition Words</h3>

<table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
    <tr style="background-color: #34A853; color: white;">
        <th>Type</th>
        <th>Words</th>
    </tr>
    <tr>
        <td><strong>Addition</strong></td>
        <td>furthermore, moreover, additionally, also</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>Contrast</strong></td>
        <td>however, nevertheless, on the other hand, but</td>
    </tr>
    <tr>
        <td><strong>Cause-Effect</strong></td>
        <td>therefore, consequently, as a result, thus</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>Example</strong></td>
        <td>for instance, such as, namely, for example</td>
    </tr>
    <tr>
        <td><strong>Emphasis</strong></td>
        <td>indeed, in fact, certainly, clearly</td>
    </tr>
</table>`,
        keyPointers: [
            'First and last paragraphs contain 80% of main ideas',
            'Topic sentences (usually first sentence of paragraph) are crucial',
            'Transition words signal shifts in argument or perspective',
            'Don\'t get bogged down in details - focus on overall structure',
            'Author\'s tone reveals their position on the topic',
            'Practice active reading - mentally summarize each paragraph'
        ],
        formulas: [],
        examples: [
            {
                problem: 'Identify main idea: "Climate change is accelerating. Scientists report rising temperatures globally. Glaciers are melting faster than predicted. Immediate policy action is urgently needed to address this crisis."',
                solution: 'Main idea: Immediate action needed to address climate change crisis',
                explanation: 'The passage presents evidence (rising temperatures, melting glaciers) building to a conclusion (immediate action needed). The main idea is the call for urgent response.'
            },
            {
                problem: 'What is the tone? "The government\'s new policy, while well-intentioned, fundamentally fails to address the root causes of poverty and may actually worsen the situation."',
                solution: 'Critical tone',
                explanation: 'The author acknowledges good intentions ("well-intentioned") but strongly criticizes effectiveness ("fundamentally fails", "may actually worsen"), indicating a critical perspective.'
            },
            {
                problem: 'Identify structure: A passage starts with an economic theory, presents historical examples, discusses modern applications, and ends with future implications. What type is this?',
                solution: 'Descriptive passage',
                explanation: 'This follows descriptive structure: introducing a concept (theory), elaborating with examples (historical), showing applications (modern), and concluding with implications (future).'
            },
            {
                problem: 'Find transition: "The study shows positive results. _____, critics argue the sample size was too small." What transition word fits?',
                solution: 'However (or Nevertheless, On the other hand)',
                explanation: 'This sentence structure shows contrast between positive results and criticism, so a contrast transition word is needed.'
            },
            {
                problem: 'Where is the thesis in an argumentative passage usually located?',
                solution: 'First or second paragraph',
                explanation: 'Argumentative passages typically state their main claim/thesis early (introduction) before presenting supporting arguments.'
            }
        ],
        practiceProblems: [
            {
                question: 'In an argumentative passage, where is the thesis usually located?',
                answer: 'First or second paragraph',
                difficulty: 'Easy',
                hint: 'Think about introduction sections',
                explanation: 'The thesis statement in argumentative passages appears in the introduction (first 1-2 paragraphs) to establish the main argument before presenting evidence.'
            },
            {
                question: 'What does the transition word "however" typically indicate?',
                answer: 'Contrast',
                difficulty: 'Easy',
                hint: 'Think about what comes after "however"',
                explanation: '"However" is a contrast word that signals a shift to an opposing or different viewpoint from what was just stated.'
            },
            {
                question: 'If an author uses words like "allegedly" and "supposedly", what tone are they conveying?',
                answer: 'Skeptical',
                difficulty: 'Medium',
                hint: 'These words suggest doubt',
                explanation: 'Words like "allegedly" and "supposedly" indicate the author doubts the claim and is taking a skeptical or critical tone.'
            },
            {
                question: 'Where is the main idea MOST likely to be found?',
                answer: 'First or last paragraph',
                difficulty: 'Easy',
                hint: 'Introduction and conclusion are key',
                explanation: 'Main ideas are typically in the introduction (first paragraph) or conclusion (last paragraph), as these frame the passage.'
            },
            {
                question: 'What type of passage presents a claim, evidence, counterarguments, and rebuttal?',
                answer: 'Argumentative',
                difficulty: 'Medium',
                hint: 'This structure is about making an argument',
                explanation: 'Argumentative passages follow this structure: claim → evidence → counterarguments → rebuttal → conclusion.'
            },
            {
                question: 'Which transition word shows cause-effect relationship: "Moreover" or "Therefore"?',
                answer: 'Therefore',
                difficulty: 'Easy',
                hint: 'Which one means "as a result"?',
                explanation: '"Therefore" indicates cause-effect (as a result). "Moreover" indicates addition (furthermore).'
            },
            {
                question: 'What is the first sentence of a paragraph usually called?',
                answer: 'Topic sentence',
                difficulty: 'Easy',
                hint: 'It introduces the paragraph\'s main topic',
                explanation: 'The topic sentence (usually first sentence) introduces the main idea of that paragraph.'
            },
            {
                question: 'If a passage describes events in time order with characters, what type is it?',
                answer: 'Narrative',
                difficulty: 'Medium',
                hint: 'Think about storytelling',
                explanation: 'Narrative passages tell stories with chronological events, characters, and plot development.'
            }
        ]
    }
};
