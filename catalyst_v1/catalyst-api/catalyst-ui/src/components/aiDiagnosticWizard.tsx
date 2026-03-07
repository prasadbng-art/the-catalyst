import { useState } from "react";
import { aiDiagnosticQuestions } from "../config/aiDiagnosticQuestions";

type AIDiagnosticWizardProps = {
    onComplete: (answers: Record<string, number>) => void;
};

export default function AIDiagnosticWizard({
    onComplete,
}: AIDiagnosticWizardProps) {

    const [step, setStep] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});

    const question = aiDiagnosticQuestions[step];
    const progress = ((step + 1) / aiDiagnosticQuestions.length) * 100;

    function selectAnswer(value: number) {

        const updated = { ...answers, [question.id]: value };
        setAnswers(updated);

        if (step < aiDiagnosticQuestions.length - 1) {
            setStep(step + 1);
        } else {
            console.log("Diagnostic answers:", updated);
            onComplete(updated);
        }

    }

    function goBack() {

        if (step === 0) return;

        setStep(step - 1);

    }

    function resetWizard() {

        setAnswers({});
        setStep(0);

    }

    return (

        <div
            style={{
                marginTop: 10,
                fontSize: 13,
                textAlign: "left",
                lineHeight: 1.5
            }}
        >

            <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
                AI READINESS DIAGNOSTIC
            </div>

            <div
                style={{
                    width: "100%",
                    height: 4,
                    background: "#1e293b",
                    marginBottom: 10,
                    borderRadius: 2
                }}
            >
                <div
                    style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: "#60a5fa",
                        transition: "width 0.3s ease",
                        borderRadius: 2
                    }}
                />
            </div>

            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {question.dimension}
            </div>

            <div style={{ marginBottom: 10 }}>
                {question.question}
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                }}
            >

                {question.options.map((opt) => (

                    <button
                        key={opt.label}
                        onClick={() => selectAnswer(opt.value)}
                        style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "6px 10px",
                            fontSize: 12,
                            background: "#1e293b",
                            border: "1px solid #334155",
                            color: "#e2e8f0",
                            borderRadius: 4,
                            cursor: "pointer"
                        }}
                    >
                        {opt.label}
                    </button>

                ))}

            </div>

            <div
                style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "space-between"
                }}
            >

                <button
                    onClick={goBack}
                    disabled={step === 0}
                    style={{
                        padding: "4px 10px",
                        fontSize: 11,
                        background: "#334155",
                        color: "#e2e8f0",
                        border: "none",
                        borderRadius: 3,
                        cursor: "pointer"
                    }}
                >
                    Back
                </button>

                <button
                    onClick={resetWizard}
                    style={{
                        padding: "4px 10px",
                        fontSize: 11,
                        background: "#475569",
                        color: "#e2e8f0",
                        border: "none",
                        borderRadius: 3,
                        cursor: "pointer"
                    }}
                >
                    Reset
                </button>

            </div>

            <div
                style={{
                    marginTop: 6,
                    fontSize: 11,
                    opacity: 0.7
                }}
            >
                Question {step + 1} of {aiDiagnosticQuestions.length}
            </div>

        </div>

    );

}