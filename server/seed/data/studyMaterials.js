// Study materials data for Divisibility Rules chapter
module.exports = function() {
    return {
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

<h3>Rule for 3</h3>
<p>A number is divisible by <strong>3</strong> if the sum of its digits is divisible by 3.</p>

<h3>Rule for 11 (Important for CAT!)</h3>
<p>A number is divisible by <strong>11</strong> if the alternating sum of its digits is 0 or divisible by 11.</p>
<p><strong>Method:</strong> (Sum of digits at odd positions) - (Sum of digits at even positions)</p>`,
        
        videos: [
            {
                title: 'Divisibility Rules (2-10) - Khan Academy',
                url: 'https://www.youtube.com/watch?v=UDaIKloRbx4',
                duration: '12:45',
                channel: 'Khan Academy',
                order: 1
            },
            {
                title: 'Divisibility Rules 11 and Beyond',
                url: 'https://www.youtube.com/watch?v=fSh1Kx4Z6Ms',
                duration: '8:30',
                channel: 'Khan Academy',
                order: 2
            }
        ],
        
        pointers: [
            { content: 'For powers of 2 (2, 4, 8): Check last 1, 2, or 3 digits respectively', order: 1 },
            { content: 'For 3 and 9: Sum all digits and check if sum is divisible', order: 2 },
            { content: 'For 11: Calculate alternating sum (add odd positions, subtract even positions)', order: 3 },
            { content: 'For 6: Number must pass BOTH the test for 2 AND for 3', order: 4 },
            { content: 'Master these rules - they save 30-40 seconds per CAT question!', order: 5 }
        ],
        
        formulas: [
            { formula: 'Divisibility by 11: (d₁ + d₃ + d₅ + ...) - (d₂ + d₄ + d₆ + ...) = 0 or multiple of 11', description: null, order: 1 }
        ],
        
        examples: [
            {
                problem: 'Is 5436 divisible by 4?',
                solution: 'Last 2 digits = 36. Since 36 ÷ 4 = 9, YES it is divisible by 4.',
                explanation: 'For divisibility by 4, we only check the last 2 digits. If those form a number divisible by 4, the entire number is divisible by 4.',
                order: 1
            },
            {
                problem: 'Check if 7854 is divisible by 3',
                solution: 'Sum = 7+8+5+4 = 24. Since 24 ÷ 3 = 8, YES it is divisible by 3.',
                explanation: 'Add all digits: 7+8+5+4 = 24. Since 24 is divisible by 3, the original number 7854 is also divisible by 3.',
                order: 2
            }
        ],
        
        practiceProblems: [
            {
                question: 'Is 98765 divisible by 5?',
                answer: 'Yes',
                difficulty: 'Easy',
                hint: 'Check the last digit',
                explanation: 'The last digit is 5. Any number ending in 0 or 5 is divisible by 5. Therefore, 98765 is divisible by 5.',
                order: 1
            },
            {
                question: 'Is 123456 divisible by 3?',
                answer: 'Yes',
                difficulty: 'Easy',
                hint: 'Add all the digits',
                explanation: 'Sum of digits = 1+2+3+4+5+6 = 21. Since 21 is divisible by 3 (21 ÷ 3 = 7), the number 123456 is also divisible by 3.',
                order: 2
            }
        ],
        
        skipTestQuestions: [
            {
                question: 'Which of the following numbers is divisible by 4?',
                options: ['1234', '5678', '9012', '3457'],
                correctAnswer: 2,
                explanation: '9012: Last 2 digits = 12, and 12÷4 = 3. Therefore divisible by 4.',
                difficulty: 'Easy',
                order: 1
            },
            {
                question: 'For a number to be divisible by 6, it must be divisible by:',
                options: ['2 or 3', '2 and 3', '2 and 4', '3 and 4'],
                correctAnswer: 1,
                explanation: 'A number is divisible by 6 if and only if it is divisible by BOTH 2 AND 3.',
                difficulty: 'Easy',
                order: 2
            },
            {
                question: 'Which number is divisible by 11?',
                options: ['1234', '2345', '3456', '1001'],
                correctAnswer: 3,
                explanation: '1001: Alternating sum = (1+0) - (0+1) = 0. Therefore divisible by 11.',
                difficulty: 'Medium',
                order: 3
            }
        ]
    };
};
