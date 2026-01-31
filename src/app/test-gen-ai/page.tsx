'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Bot, ChevronDown, ChevronUp, Download, FileJson, FileType, FileOutput, ShieldCheck } from 'lucide-react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

interface TestCase {
    test_case_id?: string;
    title?: string;
    preconditions?: string | string[];
    steps?: string[];
    actions?: string | string[];
    expected_result?: string;
    expected_results?: string[];
    expectations?: string | string[];
    [key: string]: any;
}

export default function TestGenAIPage() {
    const [file, setFile] = useState<File | null>(null);
    const [sourceText, setSourceText] = useState('');
    const [testType, setTestType] = useState('Functional');
    const [testCaseType, setTestCaseType] = useState('Positive');
    const [detailLevel, setDetailLevel] = useState('Detailed');
    const [totalTests, setTotalTests] = useState<number | string>(0);
    const [interactionMode, setInteractionMode] = useState(false);
    const [featureA, setFeatureA] = useState('');
    const [featureB, setFeatureB] = useState('');
    const [strictMode, setStrictMode] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedTests, setExpandedTests] = useState<Set<number>>(new Set());
    const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

    const toggleTestExpansion = (index: number) => {
        const newExpanded = new Set(expandedTests);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedTests(newExpanded);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        if (file) {
            formData.append('file', file);
        } else if (sourceText) {
            formData.append('source_text', sourceText);
        } else {
            setError('Please provide either a file or source text.');
            setIsLoading(false);
            return;
        }

        formData.append('test_type', testType);
        formData.append('test_case_type', testCaseType);
        formData.append('detail_level', detailLevel);
        formData.append('total_tests', (totalTests || 0).toString());
        formData.append('interaction_mode', interactionMode.toString());
        if (interactionMode) {
            formData.append('feature_a', featureA);
            formData.append('feature_b', featureB);
        }
        formData.append('strict_mode', strictMode.toString());

        // Log outgoing request for verification
        console.log('📤 Sending Request to Backend:');
        for (const [key, value] of formData.entries()) {
            console.log(`  ${key}:`, value);
        }

        try {
            const response = await fetch('http://localhost:8000/generate', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const getExtractedTCs = () => {
        if (!result) return [];
        let testCases: TestCase[] = [];
        if (Array.isArray(result)) {
            testCases = result;
        } else if (result.generated_tests && Array.isArray(result.generated_tests)) {
            testCases = result.generated_tests;
        } else if (result.test_cases && Array.isArray(result.test_cases)) {
            testCases = result.test_cases;
        } else if (result.tests && Array.isArray(result.tests)) {
            testCases = result.tests;
        } else if (result.scenarios && Array.isArray(result.scenarios)) {
            testCases = result.scenarios;
        } else if (typeof result === 'object') {
            testCases = [result];
        }
        return testCases;
    };

    const handleDownload = async (format: 'json' | 'txt' | 'docx' | 'pdf') => {
        const testCases = getExtractedTCs();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `TestCases_${timestamp}`;

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
            saveAs(blob, `${filename}.json`);
        } else if (format === 'txt') {
            let content = `TEST GEN AI - GENERATED TEST CASES\n`;
            content += `Generated on: ${new Date().toLocaleString()}\n`;
            content += `==========================================\n\n`;

            testCases.forEach((tc, i) => {
                const id = tc.test_case_id || tc.testCaseId || tc.test_id || tc.testId || tc.id || `TC-${i + 1}`;
                const title = tc.title || tc.name || tc.test_name || tc.testName || tc.description || 'Untitled';
                content += `${i + 1}. [${id}] ${title}\n`;

                const pre = tc.pre_conditions || tc.preconditions || tc.prerequisites || tc.setup || tc.given || tc.precondition;
                if (pre) {
                    content += `   Preconditions: ${Array.isArray(pre) ? pre.join(', ') : pre}\n`;
                }

                const steps = tc.steps || tc.actions || tc.test_steps || tc.testSteps || tc.when || tc.procedure;
                if (steps) {
                    content += `   Steps:\n`;
                    (Array.isArray(steps) ? steps : [steps]).forEach((s, j) => {
                        content += `     ${j + 1}. ${s}\n`;
                    });
                }

                const exp = tc.expected_result || tc.expectedResult || tc.expected_results || tc.expectedResults || tc.expectations || tc.expected || tc.then || tc.verification;
                if (exp) {
                    content += `   Expected Results: ${Array.isArray(exp) ? exp.join(', ') : exp}\n`;
                }
                content += `\n`;
            });

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, `${filename}.txt`);
        } else if (format === 'docx') {
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            text: "Generated Test Cases",
                            heading: HeadingLevel.TITLE,
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            text: `Generated on: ${new Date().toLocaleString()}`,
                            alignment: AlignmentType.CENTER,
                        }),
                        ...testCases.flatMap((tc, i) => {
                            const id = tc.test_case_id || tc.testCaseId || tc.test_id || tc.testId || tc.id || `TC-${i + 1}`;
                            const title = tc.title || tc.name || tc.test_name || tc.testName || tc.description || 'Untitled';
                            const pre = tc.pre_conditions || tc.preconditions || tc.prerequisites || tc.setup || tc.given || tc.precondition;
                            const steps = tc.steps || tc.actions || tc.test_steps || tc.testSteps || tc.when || tc.procedure;
                            const exp = tc.expected_result || tc.expectedResult || tc.expected_results || tc.expectedResults || tc.expectations || tc.expected || tc.then || tc.verification;

                            return [
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: `\n${i + 1}. [${id}] ${title}`, bold: true, size: 28 }),
                                    ],
                                    spacing: { before: 400 },
                                }),
                                ...(pre ? [new Paragraph({
                                    children: [
                                        new TextRun({ text: "Preconditions: ", bold: true }),
                                        new TextRun(Array.isArray(pre) ? pre.join(', ') : pre.toString()),
                                    ],
                                })] : []),
                                new Paragraph({
                                    children: [new TextRun({ text: "Steps:", bold: true })],
                                    spacing: { before: 200 }
                                }),
                                ...(Array.isArray(steps) ? steps : [steps]).map((s, j) =>
                                    new Paragraph({ text: `${j + 1}. ${s}`, indent: { left: 720 } })
                                ),
                                ...(exp ? [new Paragraph({
                                    children: [
                                        new TextRun({ text: "Expected Results: ", bold: true }),
                                        new TextRun(Array.isArray(exp) ? exp.join(', ') : exp.toString()),
                                    ],
                                    spacing: { before: 200 },
                                })] : []),
                            ];
                        })
                    ],
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${filename}.docx`);
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            let yPos = 20;
            const margin = 20;
            const pageWidth = doc.internal.pageSize.width;

            doc.setFontSize(20);
            doc.text("Generated Test Cases", pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;

            testCases.forEach((tc, i) => {
                if (yPos > 270) { doc.addPage(); yPos = 20; }

                const id = tc.test_case_id || tc.testCaseId || tc.test_id || tc.testId || tc.id || `TC-${i + 1}`;
                const title = tc.title || tc.name || tc.test_name || tc.testName || tc.description || 'Untitled';

                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                const titleText = `${i + 1}. [${id}] ${title}`;
                const titleLines = doc.splitTextToSize(titleText, pageWidth - (margin * 2));
                doc.text(titleLines, margin, yPos);
                yPos += (titleLines.length * 7);

                doc.setFontSize(10);
                const pre = tc.pre_conditions || tc.preconditions || tc.prerequisites || tc.setup || tc.given || tc.precondition;
                if (pre) {
                    doc.setFont("helvetica", "bold");
                    doc.text("Preconditions:", margin, yPos);
                    doc.setFont("helvetica", "normal");
                    const preText = Array.isArray(pre) ? pre.join(', ') : pre.toString();
                    const preLines = doc.splitTextToSize(preText, pageWidth - (margin * 2) - 30);
                    doc.text(preLines, margin + 30, yPos);
                    yPos += Math.max(7, preLines.length * 5) + 2;
                }

                const steps = tc.steps || tc.actions || tc.test_steps || tc.testSteps || tc.when || tc.procedure;
                if (steps) {
                    doc.setFont("helvetica", "bold");
                    doc.text("Steps:", margin, yPos);
                    yPos += 7;
                    doc.setFont("helvetica", "normal");
                    (Array.isArray(steps) ? steps : [steps]).forEach((s, j) => {
                        const stepText = `${j + 1}. ${s}`;
                        const stepLines = doc.splitTextToSize(stepText, pageWidth - (margin * 2) - 10);
                        if (yPos + (stepLines.length * 5) > 280) { doc.addPage(); yPos = 20; }
                        doc.text(stepLines, margin + 5, yPos);
                        yPos += (stepLines.length * 5);
                    });
                    yPos += 2;
                }

                const exp = tc.expected_result || tc.expectedResult || tc.expected_results || tc.expectedResults || tc.expectations || tc.expected || tc.then || tc.verification;
                if (exp) {
                    doc.setFont("helvetica", "bold");
                    doc.text("Expected Results:", margin, yPos);
                    doc.setFont("helvetica", "normal");
                    const expText = Array.isArray(exp) ? exp.join(', ') : exp.toString();
                    const expLines = doc.splitTextToSize(expText, pageWidth - (margin * 2) - 35);
                    doc.text(expLines, margin + 35, yPos);
                    yPos += Math.max(7, expLines.length * 5) + 5;
                }

                yPos += 5;
            });

            doc.save(`${filename}.pdf`);
        }
        setShowDownloadDropdown(false);
    };

    const renderTestCases = () => {
        const testCases = getExtractedTCs();

        if (testCases.length === 0) {
            return (
                <div className="space-y-4">
                    <div className="text-slate-400 text-center py-4 bg-slate-900/30 rounded-lg border border-slate-800">
                        Unable to parse test cases. Showing raw response:
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-auto max-h-96">
                        <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                </div>
            );
        }

        return testCases.map((testCase, index) => {
            const isExpanded = expandedTests.has(index);

            const testId = testCase.test_case_id
                || testCase.testCaseId
                || testCase.test_id
                || testCase.testId
                || testCase.id
                || testCase.scenario_id
                || `TC-${index + 1}`;

            const title = testCase.title
                || testCase.name
                || testCase.test_name
                || testCase.testName
                || testCase.description
                || testCase.scenario
                || testCase.summary
                || testCase.feature;

            let preconditions: string[] = [];
            const preconditionField = testCase.pre_conditions
                || testCase.preconditions
                || testCase.prerequisites
                || testCase.setup
                || testCase.given
                || testCase.precondition;

            if (preconditionField) {
                preconditions = Array.isArray(preconditionField)
                    ? preconditionField
                    : [preconditionField];
            }

            let actionsList: string[] = [];
            const actionsField = testCase.steps
                || testCase.actions
                || testCase.test_steps
                || testCase.testSteps
                || testCase.when
                || testCase.procedure;

            if (actionsField) {
                actionsList = Array.isArray(actionsField)
                    ? actionsField
                    : [actionsField];
            }

            let expectationsList: string[] = [];
            const expectationsField = testCase.expected_result
                || testCase.expectedResult
                || testCase.expected_results
                || testCase.expectedResults
                || testCase.expectations
                || testCase.expected
                || testCase.then
                || testCase.verification;

            if (expectationsField) {
                expectationsList = Array.isArray(expectationsField)
                    ? expectationsField
                    : [expectationsField];
            }

            const hasData = title || preconditions.length > 0 || actionsList.length > 0 || expectationsList.length > 0;

            const tags = testCase.tags || testCase.tag || [];
            const tagsList = Array.isArray(tags) ? tags : [tags];
            const relatedFeatures = testCase.related_features || testCase.relatedFeatures || testCase.features || [];
            const featuresList = Array.isArray(relatedFeatures) ? relatedFeatures : [relatedFeatures];

            return (
                <div
                    key={index}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all"
                >
                    <div
                        onClick={() => toggleTestExpansion(index)}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/30 border border-cyan-800/50 flex-shrink-0">
                                <span className="text-xs font-mono text-cyan-400">
                                    {index + 1}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-mono text-slate-500">{testId}</div>
                                <div className="text-base font-semibold text-slate-200 mt-0.5">{title}</div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
                            {featuresList.length > 0 && featuresList.filter(Boolean).slice(0, 2).length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                    {featuresList.filter(Boolean).slice(0, 2).map((feature: string, idx: number) => (
                                        <span
                                            key={`feature-${idx}`}
                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-700/50"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {tagsList.length > 0 && tagsList.filter(Boolean).length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                    {tagsList.filter(Boolean).map((tag: string, idx: number) => (
                                        <span
                                            key={`tag-${idx}`}
                                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${tag.toLowerCase() === 'positive' ? 'bg-green-900/30 text-green-300 border border-green-700/50' :
                                                tag.toLowerCase() === 'negative' ? 'bg-red-900/30 text-red-300 border border-red-700/50' :
                                                    'bg-purple-900/30 text-purple-300 border border-purple-700/50'
                                                }`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-slate-400 ml-2 flex-shrink-0" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400 ml-2 flex-shrink-0" />
                        )}
                    </div>

                    {isExpanded && (
                        <div className="border-t border-slate-800 p-4 space-y-4 bg-slate-950/30">
                            {!hasData ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-amber-400 mb-2">⚠️ Could not find expected fields. Raw test case data:</p>
                                    <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto max-h-64">
                                        {JSON.stringify(testCase, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <>
                                    {preconditions.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2">Preconditions</h4>
                                            <ul className="space-y-1.5">
                                                {preconditions.map((pre: string, idx: number) => (
                                                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                                        <span className="text-cyan-500 mt-1">•</span>
                                                        <span>{pre}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {actionsList.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-2">Actions / Steps</h4>
                                            <ol className="space-y-2">
                                                {actionsList.map((action: string, idx: number) => (
                                                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-3">
                                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-950/50 border border-purple-800/50 text-purple-400 text-xs font-mono flex-shrink-0 mt-0.5">{idx + 1}</span>
                                                        <span className="flex-1">{action}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}

                                    {expectationsList.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">Expected Results</h4>
                                            <ul className="space-y-1.5">
                                                {expectationsList.map((expectation: string, idx: number) => (
                                                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>{expectation}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            );
        });
    };

    const renderQualityReport = () => {
        if (!result || !result.quality_report) return null;

        const report = result.quality_report;
        let content: string[] = [];

        if (Array.isArray(report)) {
            content = report;
        } else if (typeof report === 'string') {
            // Split by newlines if it's a multiline string, otherwise keep as single item
            content = report.split('\n').filter(line => line.trim().length > 0);
        } else if (typeof report === 'object') {
            content = [JSON.stringify(report, null, 2)];
        }

        return (
            <div className="mt-8 pt-8 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-slate-200">AI Quality Report</h3>
                </div>
                <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/10" />
                    <div className="space-y-3 relative z-10">
                        {content.map((item, idx) => (
                            <div key={idx} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/50 flex-shrink-0" />
                                <p className={item.startsWith('{') ? 'font-mono text-xs whitespace-pre-wrap' : ''}>{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
            <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-8 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>

            <header className="mb-12 max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-cyan-900/30 rounded-xl border border-cyan-800">
                        <Bot className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">TestGenAI</h1>
                </div>
                <p className="text-xl text-slate-400">Generate comprehensive infotainment test cases from raw requirements using advanced AI.</p>
            </header>

            <div className="max-w-5xl mx-auto space-y-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-300">Requirements Input</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${file ? 'border-cyan-500/50 bg-cyan-950/20' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'}`}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".pdf,.txt"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setFile(e.target.files[0]);
                                                setSourceText('');
                                            }
                                        }}
                                    />
                                    <Upload className={`h-8 w-8 mb-2 ${file ? 'text-cyan-400' : 'text-slate-500'}`} />
                                    <span className="text-sm text-slate-400 truncate max-w-full px-2">{file ? file.name : "Upload .pdf or .txt"}</span>
                                </div>
                                <div className="relative">
                                    <textarea
                                        className="w-full h-full min-h-[120px] bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-slate-600 resize-none"
                                        placeholder="Or paste requirements text here..."
                                        value={sourceText}
                                        onChange={(e) => {
                                            setSourceText(e.target.value);
                                            setFile(null);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Testing Type</label>
                                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none" value={testType} onChange={(e) => setTestType(e.target.value)}>
                                    <option value="Functional">Functional</option>
                                    <option value="Regression">Regression</option>
                                    <option value="API">API</option>
                                    <option value="Security">Security</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Test Case Type</label>
                                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none" value={testCaseType} onChange={(e) => setTestCaseType(e.target.value)}>
                                    <option value="All">All</option>
                                    <option value="Positive">Positive Cases</option>
                                    <option value="Negative">Negative Cases</option>
                                    <option value="Edge">Edge Cases</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Detail Level</label>
                                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none" value={detailLevel} onChange={(e) => setDetailLevel(e.target.value)}>
                                    <option value="Detailed">Detailed Steps</option>
                                    <option value="High-level">High-level Overview</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Total Tests</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none"
                                    value={totalTests}
                                    onChange={(e) => setTotalTests(e.target.value === '' ? '' : parseInt(e.target.value))}
                                    onBlur={() => {
                                        if (totalTests === '' || Number(totalTests) < 0) setTotalTests(0);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-offset-slate-900 focus:ring-cyan-500 bg-slate-800" checked={interactionMode} onChange={(e) => setInteractionMode(e.target.checked)} />
                                    <span>Interaction Mode</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-offset-slate-900 focus:ring-cyan-500 bg-slate-800" checked={strictMode} onChange={(e) => setStrictMode(e.target.checked)} />
                                    <span>Strict Mode</span>
                                </label>
                            </div>
                            {interactionMode && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <input type="text" placeholder="Feature A (e.g. Navigation)" className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none" value={featureA} onChange={(e) => setFeatureA(e.target.value)} />
                                    <input type="text" placeholder="Feature B (e.g. Media)" className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none" value={featureB} onChange={(e) => setFeatureB(e.target.value)} />
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                            {isLoading ? <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Generating Tests...</> : <><FileText className="mr-2 h-5 w-5" /> Generate Test Cases</>}
                        </button>
                    </form>
                </div>

                {(result || error) && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                            <h2 className="text-lg font-semibold text-slate-200 flex items-center">
                                {error ? <><AlertCircle className="mr-2 h-5 w-5 text-red-500" /> Error</> : <><CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> Generated Test Cases</>}
                            </h2>
                            {!error && result && (
                                <div className="relative">
                                    <button onClick={() => setShowDownloadDropdown(!showDownloadDropdown)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                                        <Download className="h-4 w-4" /> Download <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDownloadDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showDownloadDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowDownloadDropdown(false)} />
                                            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                <button onClick={() => handleDownload('json')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border-b border-slate-800">
                                                    <FileJson className="h-4 w-4 text-amber-500" /> JSON Format
                                                </button>
                                                <button onClick={() => handleDownload('txt')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border-b border-slate-800">
                                                    <FileText className="h-4 w-4 text-blue-400" /> Plain Text
                                                </button>
                                                <button onClick={() => handleDownload('docx')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border-b border-slate-800">
                                                    <FileOutput className="h-4 w-4 text-blue-600" /> Word Document
                                                </button>
                                                <button onClick={() => handleDownload('pdf')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                                    <FileType className="h-4 w-4 text-red-500" /> PDF Document
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        {error ? (
                            <div className="flex flex-col items-center justify-center py-12 text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl">
                                <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                                <p className="text-center max-w-md">{error}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {renderTestCases()}
                                {renderQualityReport()}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
