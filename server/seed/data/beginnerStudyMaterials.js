// Comprehensive Study Materials for All Beginner Modules
// 15 Modules, 75 Chapters with detailed CAT-specific content

module.exports = {
    // ============================================
    // MODULE 1: READING COMPREHENSION BASICS (VARC)
    // ============================================
    
    // Chapter 1: Understanding Passage Structure (ALREADY EXISTS - keeping for reference)
    'Understanding Passage Structure': {
        chapterName: 'Understanding Passage Structure',
        videos: [],
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
</ol>`,
        keyPointers: [
            'First and last paragraphs contain 80% of main ideas',
            'Topic sentences (usually first sentence of paragraph) are crucial',
            'Transition words signal shifts in argument or perspective',
            'Don\'t get bogged down in details - focus on overall structure',
            'Author\'s tone reveals their position on the topic'
        ],
        formulas: [],
        examples: [
            {
                problem: 'Identify main idea: "Climate change is accelerating. Scientists report rising temperatures globally. Glaciers are melting faster than predicted. Immediate policy action is urgently needed."',
                solution: 'Main idea: Immediate action needed to address climate change crisis',
                explanation: 'The passage presents evidence (rising temperatures, melting glaciers) building to a conclusion (immediate action needed). The main idea is the call for urgent response.'
            },
            {
                problem: 'What is the tone? "The government\'s new policy, while well-intentioned, fundamentally fails to address the root causes of poverty."',
                solution: 'Critical tone',
                explanation: 'The author acknowledges good intentions but strongly criticizes effectiveness, indicating a critical perspective.'
            }
        ],
        practiceProblems: [
            {
                question: 'In an argumentative passage, where is the thesis usually located?',
                answer: 'First or second paragraph',
                difficulty: 'Easy',
                hint: 'Think about introduction sections',
                explanation: 'The thesis statement appears in the introduction to establish the main argument before presenting evidence.'
            },
            {
                question: 'What does the transition word "however" typically indicate?',
                answer: 'Contrast',
                difficulty: 'Easy',
                hint: 'Think about what comes after "however"',
                explanation: '"However" signals a shift to an opposing or different viewpoint from what was just stated.'
            },
            {
                question: 'If an author uses words like "allegedly" and "supposedly", what tone are they conveying?',
                answer: 'Skeptical',
                difficulty: 'Medium',
                hint: 'These words suggest doubt',
                explanation: 'These words indicate the author doubts the claim and is taking a skeptical or critical tone.'
            }
        ]
    },

    // Chapter 2: Inference Questions
    'Inference Questions': {
        chapterName: 'Inference Questions',
        videos: [],
        briefNotes: `Inference questions require you to "read between the lines" and draw logical conclusions from the passage. These questions test your ability to understand what is implied but not directly stated.

**Key Concepts:**
• **Inference vs Fact**: Facts are directly stated; inferences are logical conclusions based on facts
• **Must be True**: Correct inference MUST be supported by the passage
• **No Outside Knowledge**: Use only information from the passage
• **Avoid Extremes**: Watch out for "always," "never," "only," "all"

**Solving Strategy:**
1. Identify it as an inference question (keywords: infer, imply, suggest, conclude)
2. Locate relevant passage section
3. Analyze explicit facts
4. Predict your own inference
5. Eliminate wrong options`,
        detailedNotes: `<h2>Inference Questions - Complete Guide</h2>

<h3>What is an Inference?</h3>
<p>An inference is a logical conclusion drawn from facts and evidence presented in the passage. It's what the author implies without directly stating it.</p>

<h4>Inference vs Fact vs Assumption</h4>
<table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
    <tr style="background-color: #34A853; color: white;">
        <th>Type</th>
        <th>Definition</th>
        <th>Example</th>
    </tr>
    <tr>
        <td><strong>Fact</strong></td>
        <td>Directly stated in passage</td>
        <td>"The temperature was 30°C"</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>Inference</strong></td>
        <td>Logical conclusion from facts</td>
        <td>"It was a hot day" (from temp fact)</td>
    </tr>
    <tr>
        <td><strong>Assumption</strong></td>
        <td>Unstated premise taken for granted</td>
        <td>"Everyone felt uncomfortable"</td>
    </tr>
</table>

<h3>Identifying Inference Questions</h3>
<p><strong>Common keywords:</strong></p>
<ul>
    <li>"What can be <strong>inferred</strong> from the passage?"</li>
    <li>"The author <strong>implies</strong> that..."</li>
    <li>"It can be <strong>concluded</strong> that..."</li>
    <li>"The passage <strong>suggests</strong> that..."</li>
    <li>"What is the <strong>most likely reason</strong> for..."</li>
</ul>

<h3>4-Step Solving Strategy</h3>

<h4>Step 1: Understand the Question's Demand</h4>
<p>Clearly identify it as an inference question and understand what it's asking for.</p>

<h4>Step 2: Targeted Reading</h4>
<p>Locate the specific section of the passage relevant to the question. Read a few sentences before and after to grasp full context.</p>
<p><strong>Pay attention to:</strong></p>
<ul>
    <li>Transition words (however, therefore, moreover)</li>
    <li>Author's tone and attitude</li>
    <li>Cause-effect relationships</li>
</ul>

<h4>Step 3: Analyze and Predict</h4>
<p>Break down the explicit facts and try to predict your own logical inference before looking at options.</p>

<h4>Step 4: Evaluate Options (Elimination)</h4>
<p><strong>Eliminate options that:</strong></p>
<ul>
    <li><span style="color: red;">✗</span> Introduce new, out-of-scope information</li>
    <li><span style="color: red;">✗</span> Are directly stated facts (not inferences)</li>
    <li><span style="color: red;">✗</span> Use extreme language ("always," "never," "only")</li>
    <li><span style="color: red;">✗</span> Require outside knowledge</li>
    <li><span style="color: red;">✗</span> Are partially true but include incorrect elements</li>
</ul>

<p><strong>Select the option that:</strong></p>
<ul>
    <li><span style="color: green;">✓</span> MUST be true based ONLY on the passage</li>
    <li><span style="color: green;">✓</span> Is strongly supported by textual evidence</li>
    <li><span style="color: green;">✓</span> Uses moderate language</li>
</ul>

<h3>Common Traps to Avoid</h3>

<h4>1. Extreme Statements</h4>
<p>Options with "always," "never," "all," "none," "only" are usually incorrect as inferences are typically more cautious.</p>

<h4>2. Out-of-Scope Information</h4>
<p>Even if the statement is true in real life, if it's not supported by the passage, it's wrong.</p>

<h4>3. Direct Facts</h4>
<p>If something is explicitly stated, it's a fact, not an inference.</p>

<h4>4. Partial Truths</h4>
<p>Options that mix correct information with incorrect inferences.</p>

<h3>Practice Tips</h3>
<ul>
    <li>Read 2-3 RC passages daily focusing on inference questions</li>
    <li>Practice connecting information from different parts of the passage</li>
    <li>Understand author's intent and tone</li>
    <li>Review wrong answers to identify reasoning errors</li>
</ul>`,
        keyPointers: [
            'Inference MUST be supported by passage - not just possibly true',
            'Avoid bringing outside knowledge into your answer',
            'Watch for extreme words like "always," "never," "only"',
            'Connect multiple pieces of information to draw conclusions',
            'Author\'s tone often reveals the correct inference'
        ],
        formulas: [],
        examples: [
            {
                problem: 'Passage: "Sales of electric vehicles increased by 200% last year. Traditional car manufacturers are now investing heavily in EV technology." What can be inferred?',
                solution: 'Traditional manufacturers see EVs as important for their future',
                explanation: 'The heavy investment by traditional manufacturers (fact) logically implies they view EVs as strategically important. This is not directly stated but strongly supported.'
            },
            {
                problem: 'Passage: "The study was conducted on only 50 participants over 2 weeks. The researchers claim their findings are conclusive." What tone is implied?',
                solution: 'The author is skeptical of the study\'s conclusions',
                explanation: 'By highlighting limitations (small sample, short duration) before mentioning "conclusive" claims, the author implies doubt about the validity.'
            }
        ],
        practiceProblems: [
            {
                question: 'Passage states: "The company\'s profits dropped 40% after the scandal broke." What can be inferred?',
                answer: 'The scandal negatively impacted the company\'s financial performance',
                difficulty: 'Easy',
                hint: 'Connect the two events',
                explanation: 'The temporal connection ("after") and the negative change (40% drop) strongly suggest a cause-effect relationship between the scandal and financial decline.'
            },
            {
                question: 'If a passage describes a policy with "allegedly beneficial" effects, what is the author\'s likely stance?',
                answer: 'Skeptical or doubtful',
                difficulty: 'Medium',
                hint: 'Consider the word "allegedly"',
                explanation: '"Allegedly" indicates doubt. The author questions whether the effects are truly beneficial.'
            },
            {
                question: 'Passage: "Despite extensive research, no cure has been found." What can be inferred about the disease?',
                answer: 'The disease is difficult to cure',
                difficulty: 'Medium',
                hint: 'What does "despite extensive research" imply?',
                explanation: 'The contrast ("despite") between effort (extensive research) and result (no cure) implies the disease presents significant challenges.'
            }
        ]
    },

    // Chapter 3: Vocabulary in Context
    'Vocabulary in Context': {
        chapterName: 'Vocabulary in Context',
        videos: [],
        briefNotes: `Vocabulary in context questions test your ability to understand word meanings based on how they're used in the passage, not just dictionary definitions.

**Key Strategies:**
• **Context Clues**: Look at surrounding sentences for hints
• **Tone Matching**: Word should match the passage's tone
• **Substitution Test**: Replace the word with each option and see what fits
• **Root-Prefix-Suffix**: Break down unfamiliar words

**Types of Context Clues:**
1. **Definition**: Word is defined in the same sentence
2. **Example**: Examples illustrate the meaning
3. **Contrast**: Opposite meaning provides clue
4. **Inference**: Meaning implied by overall context`,
        detailedNotes: `<h2>Vocabulary in Context</h2>

<h3>Understanding Context-Based Meaning</h3>
<p>Words can have multiple meanings. In CAT, you must determine the specific meaning based on how the word is used in the passage.</p>

<h4>Why Context Matters</h4>
<p><strong>Example:</strong> The word "run"</p>
<ul>
    <li>"I run every morning" (physical exercise)</li>
    <li>"She runs a successful business" (manages)</li>
    <li>"The play will run for six months" (continue/operate)</li>
    <li>"There's a run on the bank" (rush/demand)</li>
</ul>

<h3>Types of Context Clues</h3>

<h4>1. Definition Clues</h4>
<p>The word is defined directly in the sentence.</p>
<p><strong>Example:</strong> "The <em>arboretum</em>, a place where trees are grown for study, contains over 500 species."</p>
<p><em>Clue:</em> "a place where trees are grown for study"</p>

<h4>2. Example Clues</h4>
<p>Examples help illustrate the word's meaning.</p>
<p><strong>Example:</strong> "The <em>fauna</em> of the region includes deer, bears, and wolves."</p>
<p><em>Clue:</em> The examples (deer, bears, wolves) indicate fauna means animals.</p>

<h4>3. Contrast Clues</h4>
<p>An opposite or contrasting idea reveals meaning.</p>
<p><strong>Example:</strong> "Unlike his <em>gregarious</em> brother, John was shy and reserved."</p>
<p><em>Clue:</em> "Unlike" signals contrast; opposite of "shy and reserved" = sociable/outgoing.</p>

<h4>4. Inference Clues</h4>
<p>Overall context implies the meaning.</p>
<p><strong>Example:</strong> "The <em>cacophony</em> of car horns, sirens, and construction made it impossible to concentrate."</p>
<p><em>Clue:</em> Multiple loud sounds suggest cacophony means harsh, discordant noise.</p>

<h3>Solving Strategy</h3>

<h4>Step 1: Read the Sentence Carefully</h4>
<p>Read the sentence containing the word plus 1-2 sentences before and after.</p>

<h4>Step 2: Identify Context Clues</h4>
<p>Look for definitions, examples, contrasts, or overall tone.</p>

<h4>Step 3: Predict the Meaning</h4>
<p>Before looking at options, predict what the word might mean based on context.</p>

<h4>Step 4: Substitution Test</h4>
<p>Replace the word with each option and see which makes the most sense.</p>

<h4>Step 5: Check Tone Consistency</h4>
<p>Ensure your choice matches the passage's tone (positive, negative, neutral).</p>

<h3>Word Roots, Prefixes, and Suffixes</h3>

<h4>Common Roots</h4>
<table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
    <tr style="background-color: #4285F4; color: white;">
        <th>Root</th>
        <th>Meaning</th>
        <th>Examples</th>
    </tr>
    <tr>
        <td><strong>bene</strong></td>
        <td>good</td>
        <td>benefit, benevolent</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>mal</strong></td>
        <td>bad</td>
        <td>malfunction, malady</td>
    </tr>
    <tr>
        <td><strong>phil</strong></td>
        <td>love</td>
        <td>philosophy, philanthropy</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>dict</strong></td>
        <td>say</td>
        <td>dictate, predict</td>
    </tr>
</table>

<h4>Common Prefixes</h4>
<table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
    <tr style="background-color: #34A853; color: white;">
        <th>Prefix</th>
        <th>Meaning</th>
        <th>Examples</th>
    </tr>
    <tr>
        <td><strong>un-</strong></td>
        <td>not</td>
        <td>unhappy, unclear</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>re-</strong></td>
        <td>again</td>
        <td>redo, return</td>
    </tr>
    <tr>
        <td><strong>pre-</strong></td>
        <td>before</td>
        <td>preview, predict</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
        <td><strong>dis-</strong></td>
        <td>opposite</td>
        <td>disagree, dislike</td>
    </tr>
</table>

<h3>Common Mistakes to Avoid</h3>
<ul>
    <li><span style="color: red;">✗</span> Choosing the most common meaning without checking context</li>
    <li><span style="color: red;">✗</span> Ignoring tone (choosing positive word in negative context)</li>
    <li><span style="color: red;">✗</span> Not reading enough surrounding text</li>
    <li><span style="color: red;">✗</span> Relying solely on dictionary definitions</li>
</ul>`,
        keyPointers: [
            'Always read 1-2 sentences before and after the word',
            'Use substitution test - replace word with each option',
            'Match the tone: positive/negative/neutral',
            'Look for signal words: "unlike," "such as," "for example"',
            'Break down unfamiliar words using roots/prefixes/suffixes'
        ],
        formulas: [],
        examples: [
            {
                problem: '"The politician\'s <em>mendacious</em> statements were exposed by investigative journalists." What does mendacious mean?',
                solution: 'Dishonest/False',
                explanation: 'Context: statements being "exposed" by journalists implies they were hiding something wrong. Mendacious means lying or dishonest.'
            },
            {
                problem: '"Unlike the <em>verbose</em> first draft, the final version was concise and clear." What does verbose mean?',
                solution: 'Wordy/Long-winded',
                explanation: '"Unlike" signals contrast. Opposite of "concise and clear" is wordy or using too many words.'
            }
        ],
        practiceProblems: [
            {
                question: '"The <em>ephemeral</em> nature of social media trends means they disappear as quickly as they appear." Ephemeral most likely means:',
                answer: 'Short-lived/Temporary',
                difficulty: 'Medium',
                hint: 'What does "disappear as quickly as they appear" suggest?',
                explanation: 'The context clue "disappear as quickly as they appear" indicates something temporary or short-lived.'
            },
            {
                question: '"The <em>ubiquitous</em> smartphone can be found in nearly every pocket worldwide." Ubiquitous means:',
                answer: 'Everywhere/Widespread',
                difficulty: 'Easy',
                hint: 'Consider "nearly every pocket worldwide"',
                explanation: '"Nearly every pocket worldwide" indicates something present everywhere - ubiquitous means widespread or omnipresent.'
            },
            {
                question: '"Her <em>taciturn</em> nature made conversations difficult, as she rarely spoke." Taciturn means:',
                answer: 'Reserved/Quiet',
                difficulty: 'Medium',
                hint: 'What does "rarely spoke" tell you?',
                explanation: '"Rarely spoke" directly indicates someone who is quiet or reserved in speech - taciturn means not talkative.'
            }
        ]
    }
};
