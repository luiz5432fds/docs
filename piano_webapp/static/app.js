const input = document.getElementById('input');
const responseEl = document.getElementById('response');

document.getElementById('send').onclick = async () => {
    const text = input.value.trim();
    if (!text) return;
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    responseEl.textContent = data.response;
    speak(data.response);
};

document.getElementById('speak').onclick = () => {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = 'pt-BR';
    rec.start();
    rec.onresult = (e) => {
        input.value = e.results[0][0].transcript;
    };
};

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    speechSynthesis.speak(utterance);
}
