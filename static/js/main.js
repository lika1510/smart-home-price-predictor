const { useState, useEffect, useMemo, createElement: h } = React;

// Format numbers in Indian Rupee Lakhs / Crores
function formatINR(val) {
    if (!val && val !== 0) return '₹ 0';
    if (val >= 10000000) {
        return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    } else if (val >= 100000) {
        return `₹ ${(val / 100000).toFixed(2)} Lakhs`;
    } else {
        return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
    }
}

function App() {
    // Input States
    const [sqft, setSqft] = useState(1800);
    const [beds, setBeds] = useState(3);
    const [age, setAge] = useState(8);
    const [loc, setLoc] = useState(7.5);
    const [cap, setCap] = useState(7.2);
    const [renovated, setRenovated] = useState(false);

    // Financing States
    const [downPct, setDownPct] = useState(20);
    const [interestRate, setInterestRate] = useState(8.5);

    // Results State
    const [results, setResults] = useState(null);
    const [showCode, setShowCode] = useState(false);
    const [rCodeText, setRCodeText] = useState('');

    // Fetch predictions from Flask backend whenever inputs change
    useEffect(() => {
        fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sqft, beds, age, loc, cap, renovated })
        })
        .then(res => res.json())
        .then(data => setResults(data))
        .catch(err => console.error(err));
    }, [sqft, beds, age, loc, cap, renovated]);

    // Fetch R code for under-the-hood inspector
    useEffect(() => {
        fetch('/api/code')
            .then(res => res.json())
            .then(data => setRCodeText(data.r_code));
    }, []);

    // EMI Calculation
    const emiMetrics = useMemo(() => {
        if (!results) return { emi: 0, netCashflow: 0 };
        const price = results.price;
        const downAmt = price * (downPct / 100);
        const loanAmt = price - downAmt;
        const monthlyRate = (interestRate / 100) / 12;
        const totalPayments = 20 * 12; // 20 year home loan

        const emi = (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
        const netCashflow = results.monthly_rent - emi;

        return { emi: Math.round(emi), netCashflow: Math.round(netCashflow) };
    }, [results, downPct, interestRate]);

    return h('div', { className: 'max-w-6xl mx-auto p-4 md:p-8 space-y-6' },
        // Header
        h('header', { className: 'flex flex-wrap justify-between items-center gap-4 bg-slate-900/80 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl' },
            h('div', { className: 'flex items-center gap-3' },
                h('div', { className: 'w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-sky-500/30' },
                    h('i', { className: 'fa-solid fa-house-circle-check' })
                ),
                h('div', null,
                    h('h1', { className: 'text-2xl font-bold text-white tracking-tight m-0' }, 'Smart Home Price & Risk Predictor'),
                    h('p', { className: 'text-xs text-slate-400 m-0' }, '4 R Machine Learning Algorithms Working Under The Hood • INR (₹)')
                )
            ),
            h('button', {
                onClick: () => setShowCode(true),
                className: 'px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-mono font-bold border border-sky-500/30 transition-all flex items-center gap-2'
            }, h('i', { className: 'fa-brands fa-r-project text-base' }), ' View 4 R Algorithms Code')
        ),

        // Main 2-Column Grid
        h('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-6' },
            // Left Column: Simple Inputs (5 cols)
            h('div', { className: 'lg:col-span-5 space-y-6' },
                h('div', { className: 'glass-card space-y-5 p-6 rounded-3xl bg-slate-900/70 border border-white/10' },
                    h('h2', { className: 'text-lg font-bold text-white flex items-center gap-2 mb-4' },
                        h('i', { className: 'fa-solid fa-sliders text-sky-400' }),
                        'Input Property Details'
                    ),

                    // SqFt Slider
                    h('div', null,
                        h('div', { className: 'flex justify-between text-xs font-semibold text-slate-300 mb-2' },
                            h('span', null, 'Square Footage:'),
                            h('span', { className: 'text-sky-400 font-mono font-bold' }, `${sqft} sqft`)
                        ),
                        h('input', { type: 'range', min: 800, max: 3500, step: 50, value: sqft, onChange: e => setSqft(+e.target.value), className: 'w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer' })
                    ),

                    // Bedrooms & Age
                    h('div', { className: 'grid grid-cols-2 gap-3' },
                        h('div', null,
                            h('label', { className: 'text-xs font-semibold text-slate-300 block mb-1' }, 'Bedrooms'),
                            h('input', { type: 'number', min: 1, max: 6, value: beds, onChange: e => setBeds(+e.target.value), className: 'w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-bold' })
                        ),
                        h('div', null,
                            h('label', { className: 'text-xs font-semibold text-slate-300 block mb-1' }, 'Property Age (Years)'),
                            h('input', { type: 'number', min: 0, max: 40, value: age, onChange: e => setAge(+e.target.value), className: 'w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-bold' })
                        )
                    ),

                    // Location Score Slider
                    h('div', null,
                        h('div', { className: 'flex justify-between text-xs font-semibold text-slate-300 mb-2' },
                            h('span', null, 'Location Desirability Score:'),
                            h('span', { className: 'text-sky-400 font-mono font-bold' }, `${loc} / 10`)
                        ),
                        h('input', { type: 'range', min: 1, max: 10, step: 0.1, value: loc, onChange: e => setLoc(+e.target.value), className: 'w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer' })
                    ),

                    // Target Cap Rate Slider
                    h('div', null,
                        h('div', { className: 'flex justify-between text-xs font-semibold text-slate-300 mb-2' },
                            h('span', null, 'Target Cap Rate Yield:'),
                            h('span', { className: 'text-emerald-400 font-mono font-bold' }, `${cap}%`)
                        ),
                        h('input', { type: 'range', min: 3, max: 12, step: 0.1, value: cap, onChange: e => setCap(+e.target.value), className: 'w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer' })
                    ),

                    // Renovation Toggle Switch
                    h('div', { className: 'pt-2 border-t border-white/10' },
                        h('label', { className: 'flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-200' },
                            h('input', { type: 'checkbox', checked: renovated, onChange: e => setRenovated(e.target.checked), className: 'w-4 h-4 rounded text-sky-500 focus:ring-0 cursor-pointer' }),
                            '🔨 Enable Renovation / Interior Upgrade (+Location Boost)'
                        )
                    )
                )
            ),

            // Right Column: Predictions (7 cols)
            h('div', { className: 'lg:col-span-7 space-y-6' },
                results && h('div', { className: 'space-y-4' },

                    // 1. Linear Regression Result Card
                    h('div', { className: 'p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 border border-sky-500/30 space-y-2 shadow-xl' },
                        h('div', { className: 'flex justify-between items-center' },
                            h('span', { className: 'text-xs font-bold text-sky-400 uppercase tracking-wider' }, '1. Linear Regression Result'),
                            h('span', { className: 'text-xs font-mono bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-full border border-sky-500/20' }, 'Algorithm: lm()')
                        ),
                        h('div', { className: 'text-3xl font-extrabold text-white font-mono' }, formatINR(results.price)),
                        h('div', { className: 'flex flex-wrap gap-4 text-xs text-slate-400 pt-1' },
                            h('span', null, 'Price/SqFt: ', h('strong', { className: 'text-slate-200' }, `₹ ${Math.round(results.price_per_sqft).toLocaleString('en-IN')} / sqft`)),
                            h('span', null, 'Confidence Range: ', h('strong', { className: 'text-slate-200' }, `${formatINR(results.conf_low)} - ${formatINR(results.conf_high)}`))
                        )
                    ),

                    // 2. Logistic Regression Result Card
                    h('div', { className: `p-6 rounded-3xl border transition-all shadow-xl ${
                        results.is_approved ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100' : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                    }` },
                        h('div', { className: 'flex justify-between items-center mb-2' },
                            h('span', { className: 'text-xs font-bold uppercase tracking-wider opacity-75' }, '2. Logistic Regression Result'),
                            h('span', { className: 'text-xs font-mono bg-white/10 px-2.5 py-1 rounded-full border border-white/20' }, 'Algorithm: glm()')
                        ),
                        h('div', { className: 'flex justify-between items-baseline' },
                            h('h3', { className: 'text-2xl font-extrabold tracking-tight' }, results.risk_status),
                            h('span', { className: 'text-xl font-bold font-mono' }, `${results.approval_prob}% Approval`)
                        ),
                        h('div', { className: 'w-full bg-black/40 h-2.5 rounded-full overflow-hidden mt-3' },
                            h('div', { className: `h-full ${results.is_approved ? 'bg-emerald-400' : 'bg-rose-400'}`, style: { width: `${results.approval_prob}%` } })
                        )
                    ),

                    // 3 & 4. K-Means & PCA Cards Row
                    h('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
                        // K-Means Card
                        h('div', { className: 'p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-2' },
                            h('div', { className: 'flex justify-between items-center' },
                                h('span', { className: 'text-xs font-bold text-purple-400 uppercase' }, '3. K-Means Clustering'),
                                h('span', { className: 'text-xs font-mono text-purple-400' }, 'kmeans()')
                            ),
                            h('div', { className: 'text-base font-bold text-white' }, results.property_category),
                            h('p', { className: 'text-xs text-slate-400' }, 'Property Market Tier Category')
                        ),

                        // PCA Card
                        h('div', { className: 'p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-2' },
                            h('div', { className: 'flex justify-between items-center' },
                                h('span', { className: 'text-xs font-bold text-amber-400 uppercase' }, '4. PCA Analysis'),
                                h('span', { className: 'text-xs font-mono text-amber-400' }, 'prcomp()')
                            ),
                            h('div', { className: 'text-lg font-bold text-white font-mono' }, `${results.neighborhood_quality} / 100`),
                            h('p', { className: 'text-xs text-slate-400' }, 'Neighborhood Quality Score')
                        )
                    ),

                    // EMI & Cashflow Calculator
                    h('div', { className: 'p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-4' },
                        h('h4', { className: 'text-sm font-bold text-white flex items-center gap-2' },
                            h('i', { className: 'fa-solid fa-indian-rupee-sign text-emerald-400' }),
                            'Home Loan EMI & Monthly Rental Income'
                        ),

                        h('div', { className: 'grid grid-cols-2 gap-4 text-xs' },
                            h('div', null,
                                h('label', { className: 'text-slate-400 block mb-1' }, `Down Payment: ${downPct}%`),
                                h('input', { type: 'range', min: 10, max: 50, step: 5, value: downPct, onChange: e => setDownPct(+e.target.value), className: 'w-full accent-sky-400 h-1.5 bg-slate-800 rounded' })
                            ),
                            h('div', null,
                                h('label', { className: 'text-slate-400 block mb-1' }, `Interest Rate: ${interestRate}%`),
                                h('input', { type: 'range', min: 6.5, max: 12, step: 0.25, value: interestRate, onChange: e => setInterestRate(+e.target.value), className: 'w-full accent-sky-400 h-1.5 bg-slate-800 rounded' })
                            )
                        ),

                        h('div', { className: 'grid grid-cols-3 gap-2 bg-slate-950 p-4 rounded-2xl border border-white/5 text-center text-xs' },
                            h('div', null,
                                h('span', { className: 'text-slate-400 block' }, 'Estimated EMI'),
                                h('strong', { className: 'text-white font-mono text-sm' }, `₹ ${emiMetrics.emi.toLocaleString('en-IN')} / mo`)
                            ),
                            h('div', null,
                                h('span', { className: 'text-slate-400 block' }, 'Est. Rent Income'),
                                h('strong', { className: 'text-emerald-400 font-mono text-sm' }, `₹ ${Math.round(results.monthly_rent).toLocaleString('en-IN')} / mo`)
                            ),
                            h('div', null,
                                h('span', { className: 'text-slate-400 block' }, 'Net Cashflow'),
                                h('strong', { className: `font-mono text-sm ${emiMetrics.netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}` },
                                    emiMetrics.netCashflow >= 0 ? `+₹ ${emiMetrics.netCashflow.toLocaleString('en-IN')}` : `-₹ ${Math.abs(emiMetrics.netCashflow).toLocaleString('en-IN')}`
                                )
                            )
                        )
                    )
                )
            )
        ),

        // Under-The-Hood Code Modal
        showCode && h('div', { className: 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4' },
            h('div', { className: 'glass-card max-w-2xl w-full p-6 rounded-3xl border border-sky-500/40 bg-slate-900 space-y-4' },
                h('div', { className: 'flex justify-between items-center border-b border-white/10 pb-3' },
                    h('h3', { className: 'text-base font-bold text-white flex items-center gap-2' },
                        h('i', { className: 'fa-brands fa-r-project text-sky-400' }),
                        'R Algorithms Code (algorithms.R)'
                    ),
                    h('button', { onClick: () => setShowCode(false), className: 'text-slate-400 hover:text-white text-lg' }, '×')
                ),
                h('pre', { className: 'bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 max-h-80 overflow-y-auto border border-white/5 whitespace-pre-wrap' }, rCodeText),
                h('div', { className: 'text-right' },
                    h('button', { onClick: () => setShowCode(false), className: 'px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700' }, 'Close')
                )
            )
        )
    );
}

// Render App
const root = ReactDOM.createRoot(document.getElementById('react-root'));
root.render(h(App));
