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

    return (

        <div className="diagnostic-card">

            <h3>{question.dimension}</h3>

            <p>{question.question}</p>

            <div className="options">

                {question.options.map((opt) => (

                    <button
                        key={opt.label}
                        onClick={() => selectAnswer(opt.value)}
                        className="option-button"
                    >

                        {opt.label}

                    </button>

                ))}

            </div>

            <div className="progress">

                Question {step + 1} / {aiDiagnosticQuestions.length}

            </div>

        </div>

    );

}