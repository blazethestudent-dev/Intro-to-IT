const answerKey = [{"kind": "text", "answer": ["CPU", "central processing unit"], "display": "CPU (central processing unit)", "why": "The CPU executes instructions."}, {"kind": "text", "answer": ["RAM", "random access memory"], "display": "RAM (random access memory)", "why": "RAM holds active work and loses its contents when power is off."}, {"kind": "radio", "answer": "Router", "display": "Router", "why": "A router forwards packets between networks."}, {"kind": "radio", "answer": "Windows", "display": "Windows", "why": "Windows manages hardware resources and provides application services."}, {"kind": "radio", "answer": "SSD", "display": "SSD", "why": "An SSD provides persistent storage."}, {"kind": "checkbox", "answer": ["Keyboard", "Mouse"], "display": ["Keyboard", "Mouse"], "why": "Keyboards and mice send input into a computer."}, {"kind": "radio", "answer": "Domain names into IP addresses", "display": "Domain names into IP addresses", "why": "DNS helps resolve names to network addresses."}, {"kind": "radio", "answer": "No", "display": "No", "why": "Your local network can work while the internet connection is unavailable."}, {"kind": "radio", "answer": "Open the official school website directly", "display": "Open the official school website directly", "why": "Verify the request using the official website rather than an unexpected link."}, {"kind": "radio", "answer": "Storing files in an online drive", "display": "Storing files in an online drive", "why": "Cloud services provide resources over a network on demand."}];
// A timestamp deadline keeps time accurate even when the browser delays callbacks.
const form = document.querySelector('#quiz');
const start = document.querySelector('#start');
const reset = document.querySelector('#reset');
const timer = document.querySelector('#timer');
const results = document.querySelector('#results');
let startedAt = null, deadline = null, interval = null, finished = false;
const duration = 600000;
const normalize = value => value.trim().toLowerCase().replace(/\s+/g, ' ');
function formatTime(seconds) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }
function tick() {
 const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
 timer.textContent = `Time remaining: ${formatTime(remaining)}`;
 if (!remaining) grade(true);
}
start.addEventListener('click', () => {
 startedAt = Date.now(); deadline = startedAt + duration; finished = false;
 start.hidden = true; form.hidden = false; reset.hidden = false;
 tick(); interval = setInterval(tick, 250);
 document.querySelector('#q1').focus();
});
// Use textContent for user answers, so typed markup is never executed.
function paragraph(parent, text) { const el = document.createElement('p'); el.textContent = text; parent.append(el); }
function grade(timedOut = false) {
 if (finished || startedAt === null) return;
 finished = true; clearInterval(interval);
 const elapsed = Math.min(duration, Date.now() - startedAt);
 timedOut = timedOut || Date.now() >= deadline;
 const data = new FormData(form);
 let score = 0;
 results.replaceChildren();
 const heading = document.createElement('h2'); results.append(heading);
 paragraph(results, `${timedOut ? 'Time expired. ' : ''}Time spent: ${formatTime(Math.floor(elapsed / 1000))}`);
 answerKey.forEach((q, i) => {
  const values = data.getAll(`q${i+1}`);
  let correct;
  if (q.kind === 'text') correct = q.answer.some(a => normalize(a) === normalize(values[0] || ''));
  else if (q.kind === 'checkbox') correct = values.length === q.answer.length && q.answer.every(a => values.includes(a));
  else correct = values[0] === q.answer;
  if (correct) score++;
  const item = document.createElement('article'); item.className = correct ? 'correct' : 'incorrect';
  paragraph(item, `Question ${i+1}: ${correct ? 'Correct' : 'Incorrect'}`);
  paragraph(item, `Your answer: ${values.filter(v => v.trim()).join(', ') || 'Not answered'}`);
  paragraph(item, `Correct answer: ${Array.isArray(q.display) ? q.display.join(', ') : q.display}. ${q.why}`);
  results.append(item);
 });
 heading.textContent = `${score >= 7 ? 'PASS' : 'FAIL'} — ${score}/10 (${score*10}%)`;
 heading.className = score >= 7 ? 'correct' : 'incorrect';
 document.querySelector('#questions').disabled = true;
 document.querySelector('#submit').disabled = true;
 results.hidden = false; results.focus();
 if (timedOut) timer.textContent = 'Time remaining: 0:00';
}
form.addEventListener('submit', e => { e.preventDefault(); grade(); });
reset.addEventListener('click', () => {
 clearInterval(interval); form.reset(); startedAt = deadline = null; finished = false;
 document.querySelector('#questions').disabled = false;
 document.querySelector('#submit').disabled = false;
 form.hidden = true; results.hidden = true; results.replaceChildren();
 start.hidden = false; reset.hidden = true; timer.textContent = 'Time remaining: 10:00'; start.focus();
});
