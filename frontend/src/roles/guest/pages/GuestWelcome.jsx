import { useMemo, useState } from 'react';
import { Check, CheckCircle2, CircleHelp, Eye, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';
import './GuestWelcome.css';

const questions = [
  {
    id: 'tum-statue',
    text: 'TUM ကျောင်းရဲ့ အထင်ကရရုပ်ထုအမည်ကိုဖြေပါ။',
    // hint: 'TUM ၏ သမိုင်းနှင့် နည်းပညာတိုးတက်ရေးကို ကိုယ်စားပြုသော မင်းသားကြီးကို စဉ်းစားပါ။',
    correctAnswer: 'b',
    explanation: 'အဖြေမှန်က ဖန်ချက်ဝန် ဦးရွှေရိုး ဖြစ်ပါတယ်။',
    options: [
      { id: 'a', label: 'ဖန်ချက်ဝန် ဦးရွှေအိုး' },
      { id: 'b', label: 'ဖန်ချက်ဝန် ဦးရွှေရိုး' },
      { id: 'c', label: 'ဖန်ချက်ဝန် ဦးငွေအိုး' },
      { id: 'd', label: 'ဖန်ချက်ဝန် ဦးငွေရိုး' },
    ],
  },
  {
    id: 'tum-name',
    text: 'TUM ရဲ့ နာမည်အပြည့်အစုံကိုဖြေပါ။',
    correctAnswer: 'b',
    explanation: 'အဖြေမှန်က Technological University (Mandalay) ဖြစ်ပါတယ်။',
    options: [
      { id: 'a', label: 'Mandalay Technological University' },
      { id: 'b', label: 'Technological University (Mandalay)' },
      { id: 'c', label: 'Magway Technological University' },
      { id: 'd', label: 'Technological University (Magway)' },
    ],
  },
  {
    id: 'tum-majorCount',
    text: 'TUM မှာ စုစုပေါင်း major ဘယ်နှခုရှိပါသလဲ။',
    correctAnswer: 'c',
    explanation: 'အဖြေမှန်က 10ခု ဖြစ်ပါတယ်။',
    options: [
      { id: 'a', label: '8' },
      { id: 'b', label: '9' },
      { id: 'c', label: '10' },
      { id: 'd', label: '11' },
    ],
  },
  {
    id: 'tum-drawing',
    text: 'Engineering ကျောင်းသားတွေ အများဆုံးတွေ့ရတဲ့ Drawing အမျိုးအစားက ဘာလဲ?',
    correctAnswer: 'a',
    explanation: 'အဖြေမှန်က Engineering Drawing ဖြစ်ပါတယ်။',
    options: [
      { id: 'a', label: 'Engineering Drawing' },
      { id: 'b', label: 'Digital Drawing' },
      { id: 'c', label: 'Cartoon Drawing' },
      { id: 'd', label: 'Portrait Drawing' },
      ],
  },
  {
    id: 'ceit-name',
    text: 'CEIT major ရဲ့ နာမည်အပြည့်အစုံကိုဖြေပါ။',
    correctAnswer: 'b',
    explanation: 'အဖြေမှန်က Computer Engineering and Information Technology ဖြစ်ပါတယ်။',
    options: [
      { id: 'a', label: 'Computer Electronics and Information Technology' },
      { id: 'b', label: 'Computer Engineering and Information Technology' },
      { id: 'c', label: 'Computer Engineering and International Technology' },
      { id: 'd', label: 'Compound Engineering and Information Technology' },
      ],
  },
  {
    id: 'ceit-major',
    text: 'CEIT major တွင် အောက်ပါဘာသာရပ်များထဲမှ မည်သည့်ဘာသာရပ်ကို သင်ယူနိုင်သနည်း?',
    correctAnswer: 'b',
    explanation: 'အဖြေမှန်က Programming ဖြစ်ပါတယ်။',
    options: [
      { id: 'a', label: 'Baking' },
      { id: 'b', label: 'Programming' },
      { id: 'c', label: 'Agriculture' },
      { id: 'd', label: 'Architecture' },
      ],
  },
  {
    id: 'tum-minor',
    text: 'Engineering အတွက်လိုအပ်၍ minor အဖြစ်သင်ကြားရသော ဘာသာရပ်ကိုဖြေပါ။',
    correctAnswer: 'c',
    explanation: 'အဖြေမှန်က Engineering Mathematics ဖြစ်ပါတယ်။',
    options: [
      { id: 'a', label: 'Engineering Eco' },
      { id: 'b', label: 'Engineering Psychology' },
      { id: 'c', label: 'Engineering Mathematics' },
      { id: 'd', label: 'Engineering Bio' },
      ],
  },
  {
    id: 'drawing-size',
    text: 'Engineering Drawing တွင်အသုံးပြုသော စာရွက် size ကိုဖြေပါ။',
    correctAnswer: 'a',
    explanation: 'အဖြေမှန်က A1 ဖြစ်ပါတယ်။',
    options: [
      { id: 'a', label: 'A1' },
      { id: 'b', label: 'A2' },
      { id: 'c', label: 'A3' },
      { id: 'd', label: 'A4' },
      ],
  },
  {
    id: 'drawing-ruler',
    text: 'Engineering Drawing တွင်အသုံးပြုသော ပေတံအမည်ကိုဖြေပါ။',
    correctAnswer: 'c',
    explanation: 'အဖြေမှန်က Computer Engineering and Information Technology ဖြစ်ပါတယ်။',
    options: [
      { id: 'a', label: 'Bပေတံ' },
      { id: 'b', label: 'Vပေတံ' },
      { id: 'c', label: 'Tပေတံ' },
      { id: 'd', label: 'Cပေတံ' },
      ],
  },
  {
    id: 'tum-rollCall',
    text: 'TU ကျောင်းသားတစ်ယောက်အတွက် စာမေးပွဲဖြေရန် လိုအပ်သောကျောင်းခေါ်ချိန်ရာခိုင်နှုန်းမှာ မည်မျှဖြစ်သနည်း။',
    correctAnswer: 'b',
    explanation: 'အဖြေမှန်က 75% ဖြစ်ပါတယ်။',
    options: [
      { id: 'a', label: '70%' },
      { id: 'b', label: '75%' },
      { id: 'c', label: '80%' },
      { id: 'd', label: '85%' },
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
              <div className="guest-question-head"><span>{answer ? <Check size={16} /> : questionIndex + 1}</span><div><small>Multiple choice</small><em>1 points</em></div></div>
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
