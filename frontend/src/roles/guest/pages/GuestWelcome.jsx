import { useMemo, useState } from 'react';
import { Check, CheckCircle2, CircleHelp, Eye, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';
import './GuestWelcome.css';

const questions = [
  {
    id: 'tum-statue',
    text: 'TUM ကျောင်းရှေ့က ရုပ်ထုကြီးရဲ့အမည်က ဘာလဲ?',
    hint: 'TUM ၏ သမိုင်းနှင့် နည်းပညာတိုးတက်ရေးကို ကိုယ်စားပြုသော မင်းသားကြီးကို စဉ်းစားပါ။',
    correctAnswer: 'd',
    explanation: 'အဖြေမှန်က ကနောင်မင်းသားကြီး ဖြစ်ပါတယ်။',
    options: [
      { id: 'a', label: 'ဦးရွှေရိုး' },
      { id: 'b', label: 'ဒေါ်မိုး' },
      { id: 'c', label: 'ဦးအောင်ဇေယျ' },
      { id: 'd', label: 'ကနောင်မင်းသားကြီး' },
    ],
  },
  {
    id: 'min-khant-hein-orientation',
    text: 'မင်းခန့်ဟိန်းရဲ့ Sexual orientation က ဘာလဲ?',
    correctAnswer: 'b',
    explanation: 'အဖြေမှန်က Gay ဖြစ်ပါတယ်။',
    options: [
      { id: 'a', label: 'Straight' },
      { id: 'b', label: 'Gay' },
      { id: 'c', label: 'Bisexual' },
      { id: 'd', label: 'Lesbian' },
    ],
  },
];

const GuestWelcome = () => {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter((question) => answers[question.id] === question.correctAnswer).length;
  const progress = useMemo(() => Math.round((answeredCount / questions.length) * 100), [answeredCount]);

  const reset = () => { setAnswers({}); setChecked(false); };
  const selectAnswer = (questionId, optionId) => {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setChecked(false);
  };

  return (
    <div className="guest-welcome-page">
      <section className="guest-welcome-hero">
        <div className="guest-hero-copy">
          <p className="guest-kicker"><Sparkles size={15} /> Interactive guest preview</p>
          <h1>See how students answer assignments</h1>
          <p>Try a sample question without creating an account. This preview shows the same clear, focused experience students use for online coursework.</p>
          <a href="#sample-question">Try the sample question</a>
        </div>
        <div className="guest-preview-card">
          <Eye size={23} />
          <span>Guest mode</span>
          <strong>No answers are saved</strong>
          <small>Explore safely without affecting real assignments.</small>
        </div>
      </section>

      <section className="guest-guide" aria-labelledby="guest-guide-title">
        <div className="guest-section-heading"><p>How it works</p><h2 id="guest-guide-title">A simple three-step experience</h2></div>
        <div className="guest-guide-grid">
          <article><span>1</span><div><h3>Read the question</h3><p>Review the prompt, point value, and any teacher hint.</p></div></article>
          <article><span>2</span><div><h3>Choose an answer</h3><p>Select an option. Your progress updates immediately.</p></div></article>
          <article><span>3</span><div><h3>Check your result</h3><p>Use this demo to see instant feedback and try again.</p></div></article>
        </div>
      </section>

      <section className="guest-demo" id="sample-question" aria-labelledby="sample-title">
        <div className="guest-demo-top">
          <div><p className="guest-kicker"><CircleHelp size={15} /> Sample assessment</p><h2 id="sample-title">TUM Guest Quiz</h2><p>Experience student-style multiple-choice questions.</p></div>
          <div className="guest-demo-stats"><span>Questions<strong>{questions.length}</strong></span><span>Total points<strong>10</strong></span></div>
        </div>

        <div className="guest-progress"><div><strong>{progress}% complete</strong><span>{answeredCount === questions.length ? 'Ready to check' : `${questions.length - answeredCount} question${questions.length - answeredCount === 1 ? '' : 's'} left`}</span></div><div><span style={{ width: `${progress}%` }} /></div></div>

        {questions.map((question, questionIndex) => {
          const answer = answers[question.id];
          const correct = answer === question.correctAnswer;
          return (
            <article className={`guest-question ${answer ? 'is-answered' : ''}`} key={question.id}>
              <div className="guest-question-head"><span>{answer ? <Check size={16} /> : questionIndex + 1}</span><div><small>Multiple choice</small><em>5 points</em></div></div>
              <h3>{question.text}</h3>
              <div className="guest-options">
                {question.options.map((option, optionIndex) => {
                  const selected = answer === option.id;
                  const state = checked && selected ? (correct ? 'is-correct' : 'is-wrong') : '';
                  return <button type="button" className={`${selected ? 'is-selected' : ''} ${state}`} key={option.id} onClick={() => selectAnswer(question.id, option.id)}><span>{String.fromCharCode(65 + optionIndex)}</span><strong>{option.label}</strong>{selected ? <Check size={16} /> : null}</button>;
                })}
              </div>
              {question.hint && <div className="guest-hint"><Lightbulb size={17} /><span><strong>Hint</strong> {question.hint}</span></div>}
              {checked && <div className={correct ? 'guest-feedback is-correct' : 'guest-feedback is-wrong'}><CheckCircle2 size={19} /><span><strong>{correct ? 'Correct!' : 'Not quite.'}</strong> {correct ? question.explanation : 'ထပ်မံရွေးချယ်ပြီး ကြိုးစားကြည့်ပါ။'}</span></div>}
            </article>
          );
        })}

        <div className="guest-demo-actions"><div><strong>{checked ? `${correctCount} of ${questions.length} correct` : `${answeredCount} of ${questions.length} answered`}</strong><span>This is only a preview and will not be submitted.</span></div>{checked ? <button type="button" className="guest-reset" onClick={reset}><RotateCcw size={17} /> Try again</button> : <button type="button" className="guest-check" disabled={answeredCount !== questions.length} onClick={() => setChecked(true)}><CheckCircle2 size={17} /> Check answers</button>}</div>
      </section>
    </div>
  );
};

export default GuestWelcome;
