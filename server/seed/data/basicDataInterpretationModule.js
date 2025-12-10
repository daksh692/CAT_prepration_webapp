// Basic Data Interpretation Module - All 5 Chapters
// Module 5: Basic Data Interpretation (DILR)

module.exports = {
    
    // ========================================
    // Chapter 1: Reading Tables
    // ========================================
    'Reading Tables': {
        chapterName: 'Reading Tables',
        videos: [],
        
        briefNotes: `Tables are the foundation of Data Interpretation. Master reading tables efficiently to excel in CAT DI.

**Key Skills:**
• Quick scanning for required data
• Row and column navigation
• Multi-table comparisons
• Percentage calculations from table values

**Common Question Types:**
• Direct value lookup
• Percentage calculations
• Ratio comparisons
• Trend identification across rows/columns
• Missing value calculations

**Time-Saving Tips:**
• Read table headers carefully first
• Note units (lakhs, crores, thousands, %)
• Use finger/pen to track rows and columns
• Calculate only what's asked - don't over-analyze`,

        detailedNotes: `<h2>Reading Tables - Complete DI Guide</h2>
<h3>Understanding Table Structure</h3>
<p>Every table has:</p>
<ul>
<li>Title: What data is shown</li>
<li>Row headers: Categories listed vertically</li>
<li>Column headers: Categories listed horizontally</li>
<li>Values: Data at row-column intersections</li>
<li>Units: How values are measured (check carefully!)</li>
</ul>
<h3>Common Operations</h3>
<ul>
<li>Percentage: (Part/Total) × 100</li>
<li>Percentage change: [(New - Old)/Old] × 100</li>
<li>Ratio: Value1 : Value2 (simplify if needed)</li>
<li>Average: Sum of values / Number of values</li>
</ul>`,

        keyPointers: [
            'Always read title and headers first - understand what data represents',
            'Note units carefully (lakhs, crores, %, absolute numbers)',
            'Use finger or pen to avoid reading wrong row/column',
            'Calculate only what question asks - don\'t waste time',
            'For % calculations: (Part/Total) × 100',
            'Percentage change: [(New-Old)/Old] × 100',
            'Row totals often given - use them to save time',
            'Compare values by looking at differences or ratios',
            'Missing values can often be calculated from totals',
            'Multi-table questions: identify relationship between tables first'
        ],

        formulas: [
            'Percentage: (Value/Total) × 100',
            'Percentage Change: [(New Value - Old Value)/Old Value] × 100',
            'Ratio: Value A : Value B (simplify to lowest terms)',
            'Average: Sum of all values / Count of values',
            'Missing Value: Total - Sum of known values'
        ],

        examples: [
            {
                problem: 'Table shows sales for 5 products. Product A: 120, B: 150, C: 180, D: 90, E: 60. What % is Product C?',
                solution: 'Total = 120+150+180+90+60 = 600. Product C % = (180/600)×100 = 30%',
                explanation: 'First find total of all products, then calculate percentage of Product C.'
            },
            {
                problem: 'Sales in 2021: 500 lakhs. Sales in 2022: 650 lakhs. Percentage increase?',
                solution: '[(650-500)/500]×100 = (150/500)×100 = 30%',
                explanation: 'Use percentage change formula: divide difference by original value, multiply by 100.'
            }
        ],

        practiceProblems: [
            {
                question: 'If total is 800 and Part A is 200, what is percentage of Part A?',
                answer: '25%',
                difficulty: 'Easy',
                hint: '(Part/Total) × 100',
                explanation: '(200/800) × 100 = 0.25 × 100 = 25%'
            },
            {
                question: 'Values: 10, 20, 30, 40, 50. What is the average?',
                answer: '30',
                difficulty: 'Easy',
                hint: 'Sum/Count',
                explanation: '(10+20+30+40+50)/5 = 150/5 = 30'
            },
            {
                question: 'Price increased from 80 to 100. Percentage increase?',
                answer: '25%',
                difficulty: 'Medium',
                hint: '[(New-Old)/Old] × 100',
                explanation: '[(100-80)/80] × 100 = (20/80) × 100 = 25%'
            }
        ]
    },

    // ========================================
    // Chapter 2: Bar Graphs
    // ========================================
    'Bar Graphs': {
        chapterName: 'Bar Graphs',
        videos: [],
        
        briefNotes: `Bar graphs visually represent data using rectangular bars. Heights/lengths represent values.

**Types:**
• **Simple Bar Graph**: One bar per category
• **Multiple Bar Graph**: Multiple bars per category (comparing groups)
• **Stacked Bar Graph**: Bars divided into segments (showing parts of whole)

**Reading Strategy:**
• Check X and Y axis labels and scales
• Note whether bars are vertical or horizontal
• For multiple bars, check the legend
• Approximate values when precise reading difficult`,

        detailedNotes: `<h2>Bar Graphs in CAT DI</h2>
<h3>Components</h3>
<ul>
<li>Bars: Represent categories or time periods</li>
<li>X-axis: Usually categories</li>
<li>Y-axis: Usually values/quantities</li>
<li>Legend: Identifies what each bar/color represents</li>
<li>Scale: How units are marked on axes</li>
</ul>
<h3>Quick Analysis</h3>
<ul>
<li>Tallest/shortest bars = max/min values</li>
<li>Compare bar heights for relative sizes</li>
<li>Look for trends (increasing/decreasing pattern)</li>
</ul>`,

        keyPointers: [
            'Read X and Y axis labels first - know what graph shows',
            'Check scale carefully - is it 10s, 100s, 1000s?',
            'Approximate when exact reading difficult - CAT allows this',
            'Multiple bars: Use legend to identify each category',
            'Stacked bars: Each segment adds to previous',
            'Compare heights visually for quick relative analysis',
            'Tallest bar = maximum value, shortest = minimum',
            'Look for patterns: increasing, decreasing, stable',
            'Calculate differences by subtracting bar heights',
            'Total in stacked bar = height of entire bar'
        ],

        formulas: [
            'Bar value ≈ Read from Y-axis at top of bar',
            'Difference = Taller bar - Shorter bar',
            'Stacked bar total = Sum of all segments',
            'Growth trend: Later bars taller than earlier bars'
        ],

        examples: [
            {
                problem: 'Bar graph shows sales: 2019=40, 2020=50, 2021=55, 2022=60. Which year had highest growth?',
                solution: '2020 (grew by 10 from 40 to 50)',
                explanation: 'Calculate year-to-year growth: 2020 grew 10, 2021 grew 5, 2022 grew 5. Maximum growth in 2020.'
            }
        ],

        practiceProblems: [
            {
                question: 'Three bars show heights 20, 35, 50. What is the ratio of smallest to largest?',
                answer: '2:5',
                difficulty: 'Easy',
                hint: 'Simplify 20:50',
                explanation: '20:50 = 2:5 (divide both by 10)'
            },
            {
                question: 'Stacked bar has 3 segments: 10, 15, 25. What is total bar height?',
                answer: '50',
                difficulty: 'Easy',
                hint: 'Add all segments',
                explanation: '10 + 15 + 25 = 50'
            }
        ]
    },

    // ========================================
    // Chapter 3: Line Graphs
    // ========================================
    'Line Graphs': {
        chapterName: 'Line Graphs',
        videos: [],
        
        briefNotes: `Line graphs show trends over time or continuous data. Points connected by lines make patterns easy to see.

**Key Features:**
• Shows trends clearly (increasing, decreasing, stable)
• Multiple lines can compare different categories
• Slope indicates rate of change
• Peaks and troughs show maximums and minimums

**Common Analysis:**
• Identify upward/downward trends
• Find steepest increase/decrease
• Compare multiple line patterns
• Identify intersections (where lines cross)`,

        detailedNotes: `<h2>Line Graphs - Trend Analysis</h2>
<h3>Reading Line Graphs</h3>
<ul>
<li>X-axis: Usually time (years, months, days)</li>
<li>Y-axis: Value being measured</li>
<li>Points: Mark data values</li>
<li>Lines: Connect points to show trend</li>
<li>Multiple lines: Different categories or groups</li>
</ul>
<h3>Trend Patterns</h3>
<ul>
<li>Upward slope: Increasing trend</li>
<li>Downward slope: Decreasing trend</li>
<li>Horizontal line: Stable/constant</li>
<li>Steeper slope: Faster rate of change</li>
</ul>`,

        keyPointers: [
            'Line slope shows rate of change - steep = fast change',
            'Upward slope = increase, downward = decrease, flat = constant',
            'Peak = local maximum, trough = local minimum',
            'Steepest rise = period of maximum growth',
            'Multiple lines: Compare positions and slopes',
            'Intersection point: where two categories equal',
            'Overall trend: Look at start and end points',
            'Fluctuations: Up-down pattern indicates instability',
            'Parallel lines: Categories changing at similar rate',
            'Diverging lines: Gap between categories widening'
        ],

        formulas: [
            'Slope (rate of change) = (Y2 - Y1)/(X2 - X1)',
            'Total change = End value - Start value',
            'Average value = (Sum of all points)/Number of points',
            'Trend: Compare start vs end position'
        ],

        examples: [
            {
                problem: 'Line starts at 100, ends at 150 over 5 years. Average annual growth?',
                solution: '(150-100)/5 = 10 per year',
                explanation: 'Total growth 50 over 5 years = 10 per year average.'
            }
        ],

        practiceProblems: [
            {
                question: 'Value at Year 1 is 50, Year 5 is 90. What is total change?',
                answer: '40',
                difficulty: 'Easy',
                hint: 'End - Start',
                explanation: '90 - 50 = 40'
            },
            {
                question: 'Line shows: Jan=20, Feb=25, Mar=30, Apr=35. What is the monthly growth rate?',
                answer: '5 per month',
                difficulty: 'Easy',
                hint: 'Consistent increase',
                explanation: 'Each month increases by 5 (25-20=5, 30-25=5, etc.)'
            }
        ]
    },

    // ========================================
    // Chapter 4: Pie Charts
    // ========================================
    'Pie Charts': {
        chapterName: 'Pie Charts',
        videos: [],
        
        briefNotes: `Pie charts show parts of a whole as slices. Each slice's size represents its percentage or proportion.

**Key Concepts:**
• Total circle = 360° = 100%
• Each slice = portion of total
• Larger slice = larger proportion
• Multiple pie charts can show changes over time

**Quick Calculations:**
• % to degrees: (% × 360)/100
• Degrees to %: (degrees/360) × 100
• Value of slice: (% × Total value)/100`,

        detailedNotes: `<h2>Pie Charts - Part-to-Whole Analysis</h2>
<h3>Understanding Pie Charts</h3>
<ul>
<li>Full circle = 100% of total</li>
<li>Each slice = category's share</li>
<li>Slice size α its percentage/value</li>
<li>All slices sum to 100%</li>
</ul>
<h3>Conversions</h3>
<ul>
<li>1% = 3.6 degrees</li>
<li>25% = 90 degrees (quarter circle)</li>
<li>50% = 180 degrees (semicircle)</li>
<li>10% = 36 degrees</li>
</ul>`,

        keyPointers: [
            'Full circle = 360° = 100% of total',
            'To convert %  to degrees: (% × 360)/100 or % × 3.6',
            'To convert degrees to %: (degrees/360) × 100',
            'Value of slice: (Slice %/100) × Total',
            'Largest slice = largest percentage/value',
            'Compare slice sizes visually for quick assessment',
            'All slices must sum to 100%',
            'Missing slice % = 100% - sum of given slices',
            'Multiple pie charts: Compare same slice across charts',
            'Quarter circle = 90° = 25%, Half circle = 180° = 50%'
        ],

        formulas: [
            'Degrees to Percentage: (Degrees/360) × 100',
            'Percentage to Degrees: Percentage × 3.6',
            'Slice Value: (Slice %/100) × Total Value',
            'Missing Slice %: 100% - Sum of all other slices'
        ],

        examples: [
            {
                problem: 'Pie chart: Slice A = 90°. If total value is 800, what is value of A?',
                solution: '90°/360° = 25%. Value = 25% of 800 = 200',
                explanation: 'Convert degrees to percentage first, then find that percentage of total.'
            }
        ],

        practiceProblems: [
            {
                question: 'Slice represents 20% of pie. How many degrees?',
                answer: '72 degrees',
                difficulty: 'Easy',
                hint: 'multiply by 3.6',
                explanation: '20 × 3.6 = 72 degrees'
            },
            {
                question: 'Total = 600. Slice A is 30%. What is value of slice A?',
                answer: '180',
                difficulty: 'Easy',
                hint: '30% of 600',
                explanation: '(30/100) × 600 = 0.30 × 600 = 180'
            },
            {
                question: 'Slices show 25%, 35%, 15%. What % is the remaining slice?',
                answer: '25%',
                difficulty: 'Medium',
                hint: '100% - sum of given',
                explanation: '100% - (25+35+15)% = 100% - 75% = 25%'
            }
        ]
    },

    // ========================================
    // Chapter 5: Mixed DI Sets
    // ========================================
    'Mixed DI Sets': {
        chapterName: 'Mixed DI Sets',
        videos: [],
        
        briefNotes: `Mixed DI sets combine multiple chart types or require cross-referencing data. These test your ability to integrate information.

**Common Combinations:**
• Table + Bar graph
• Line graph + Pie chart
• Multiple tables
• Table + Graph + Text Data

**Strategy:**
• Read all data representations first
• Identify relationships between datasets
• Note which data source answers each question
• Cross-verify when possible
• Don't assume relationships - read carefully`,

        detailedNotes: `<h2>Mixed DI Sets - Integration Skills</h2>
<h3>Approach Strategy</h3>
<ol>
<li>Scan all charts/tables quickly</li>
<li>Understand what each represents</li>
<li>Identify how they relate</li>
<li>Read questions to know what's needed</li>
<li>Extract data systematically</li>
<li>Cross-check when  data overlaps</li>
</ol>
<h3>Common Challenges</h3>
<ul>
<li>Different scales/units in different charts</li>
<li>Incomplete data requiring calculations</li>
<li>Multiple steps needed</li>
<li>Time pressure</li>
</ul>`,

        keyPointers: [
            'Read all data sources before attempting questions',
            'Identify relationship between different datasets first',
            'Different charts may use different units - convert carefully',
            'Some questions need data from multiple sources',
            'Incomplete data: Calculate using totals or other given info',
            'Multi-step problems: Break into smaller calculations',
            'Time management: Skip very complex questions if needed',
            'Cross-verify answers using different data when possible',
            'Note which chart/table each question refers to',
            'Practice mixed sets regularly - CAT heavily features these'
        ],

        formulas: [
            'Integration: Use Data Source 1 + Data Source 2 → Answer',
            'Cross-verification: Calculate same value using two different methods',
            'Unit conversion: Ensure all values in same unit before calculating'
        ],

        examples: [
            {
                problem: 'Table shows quantity sold. Graph shows price per unit. How to find total revenue?',
                solution: 'Revenue = Quantity (from table) × Price (from graph) for each item',
                explanation: 'Combine data from both sources: multiply corresponding values from table and graph.'
            }
        ],

        practiceProblems: [
            {
                question: 'Table shows sales in units. Graph shows price in Rs. What is revenue calculation?',
                answer: 'Units × Price',
                difficulty: 'Easy',
                hint: 'Revenue = Quantity × Price',
                explanation: 'Multiply values from table (quantity) with values from graph (price)'
            },
            {
                question: 'DI shows values in lakhs and crores. What conversion factor?',
                answer: '1 crore = 100 lakhs',
                difficulty: 'Easy',
                hint: 'Standard conversion',
                explanation: '1 crore = 100 lakhs. To compare, convert all to same unit.'
            },
            {
                question: 'When dealing with 3+ data sources, what is the first step?',
                answer: 'Understand what each source represents and how they relate',
                difficulty: 'Medium',
                hint: 'Systematic approach',
                explanation: 'First understand all sources and their relationships before attempting calculations.'
            }
        ]
    }
};
