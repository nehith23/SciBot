// ===== Config =====
let GEMINI_API_KEY = localStorage.getItem('scibot_api_key') || '';
const GEMINI_MODEL = 'gemini-2.0-flash';

function getGeminiUrl() {
    return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
}

// ===== API Key Modal =====
const apiKeyModal = document.getElementById('apiKeyModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiKeySave = document.getElementById('apiKeySave');

if (GEMINI_API_KEY) {
    apiKeyModal.classList.add('hidden');
}

apiKeySave.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
        apiKeyInput.style.borderColor = '#ea4335';
        apiKeyInput.placeholder = 'Please enter a valid key!';
        return;
    }
    GEMINI_API_KEY = key;
    localStorage.setItem('scibot_api_key', key);
    apiKeyModal.classList.add('hidden');
    bootGreetings();
});

apiKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') apiKeySave.click();
});

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const html = document.documentElement;

const savedTheme = localStorage.getItem('scibot_theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    themeIcon.textContent = next === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('scibot_theme', next);
    // Update starfield colors
    initStarfield();
});

// ===== Animated Starfield Background =====
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
let animFrame;

function initStarfield() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const isDark = html.getAttribute('data-theme') === 'dark';
    const starCount = 120;
    stars = [];

    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.3 + 0.05,
            opacity: Math.random() * 0.7 + 0.3,
            pulse: Math.random() * Math.PI * 2,
            color: isDark
                ? (Math.random() > 0.7 ? '#7c5cfc' : Math.random() > 0.5 ? '#00e5b0' : '#ffffff')
                : (Math.random() > 0.7 ? '#6b46f5' : Math.random() > 0.5 ? '#00b893' : '#8888cc')
        });
    }
}

function drawStarfield() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.pulse += 0.015;
        star.y -= star.speed;
        if (star.y < -5) {
            star.y = canvas.height + 5;
            star.x = Math.random() * canvas.width;
        }

        const flicker = Math.sin(star.pulse) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity * flicker;
        ctx.fill();

        // Glow effect for larger stars
        if (star.size > 1.2) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.opacity * flicker * 0.08;
            ctx.fill();
        }
    });

    ctx.globalAlpha = 1;
    animFrame = requestAnimationFrame(drawStarfield);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

initStarfield();
drawStarfield();

// ===== System Prompt =====
const SYSTEM_PROMPT = `You are SciBot, a fun and friendly science project helper for kids aged 10 to 15.

IMPORTANT LANGUAGE RULES — Follow these strictly:
- Use very simple English. Write like you're talking to a 10-year-old.
- Use short sentences. Never write long, complicated sentences.
- Avoid big or technical words. If you must use one, explain it right away in simple words.
  Example: "This is called oxidation — that just means the metal reacts with air."
- Use real-life comparisons to explain hard ideas.
  Example: "Electricity flows through a wire like water flows through a pipe."
- Be encouraging and excited! Use emojis to keep it fun 🎉
- Talk directly to the student. Say "you" instead of "one" or "the student."

Your job is to:
- Help kids find fun science projects they can do at home or school
- Explain how things work in a way that's easy to picture
- List what materials they need (stuff that's easy to find at home)
- Give clear step-by-step instructions anyone can follow
- Always explain WHY the project works using simple words
- If a kid asks about something dangerous, kindly suggest a safe option instead

When suggesting a project, always include:
1. A fun project title with an emoji
2. How hard it is (Easy / Medium / Hard)
3. How long it takes
4. What you need (materials list)
5. What to do (step-by-step)
6. How it works (the science behind it, explained simply)

Stay focused on science projects and learning. If someone asks about something that isn't science, gently bring them back to science in a fun way.`;

// ===== Conversation History =====
let conversationHistory = [];

// ===== Built-in Projects =====
const projects = {
    physics: [
        {
            title: "🚀 Balloon-Powered Car",
            difficulty: "Easy",
            time: "30 mins",
            materials: ["Plastic bottle", "4 bottle caps", "2 wooden skewers", "Balloon", "Tape", "Straw"],
            steps: [
                "Poke a hole through the center of each bottle cap — these are your wheels.",
                "Push a skewer through 2 caps to make an axle. Repeat for the second axle.",
                "Tape both axles to the bottom of the bottle so the wheels spin freely.",
                "Tape the straw to the top of the bottle, with one end sticking out the back.",
                "Stretch the balloon over the straw's back end. Blow through the front to inflate it.",
                "Pinch the balloon, set the car down, and let go — watch it zoom! 🏎️"
            ],
            explanation: "Air rushes out of the balloon (action) and pushes the car forward (reaction). That's Newton's Third Law!"
        },
        {
            title: "🔦 Build a Simple Circuit",
            difficulty: "Easy",
            time: "20 mins",
            materials: ["LED bulb", "9V battery", "2 small wires (or aluminium foil strips)", "Tape", "Cardboard"],
            steps: [
                "Tape the battery to a piece of cardboard so it doesn't roll.",
                "Attach one wire from the positive (+) battery terminal to the longer LED leg.",
                "Attach the second wire from the shorter LED leg to the negative (−) terminal.",
                "Your LED should light up! If not, flip the LED legs — polarity matters.",
                "Try adding a switch by leaving a gap in one wire that you can bridge with foil."
            ],
            explanation: "Electricity flows in a loop (circuit). Breaking the loop (switch) stops the flow, turning the light off."
        },
        {
            title: "🥚 Egg Drop Challenge",
            difficulty: "Medium",
            time: "45 mins",
            materials: ["Raw egg", "Straws", "Tape", "Cotton balls or bubble wrap", "Plastic bag", "Cardboard"],
            steps: [
                "Your goal: protect the egg from a 2-meter drop!",
                "Wrap the egg in cotton balls or bubble wrap as a cushion layer.",
                "Build a frame around it with straws and tape.",
                "Add a small plastic-bag parachute to slow the fall.",
                "Drop it from a height and see if the egg survives! 🥚💥",
                "Try different designs and see which one works best."
            ],
            explanation: "Cushioning absorbs impact energy, and the parachute increases air resistance to slow the fall. Engineers use these same ideas!"
        }
    ],
    chemistry: [
        {
            title: "🌋 Baking Soda Volcano",
            difficulty: "Easy",
            time: "30 mins",
            materials: ["Baking soda", "Vinegar", "Dish soap", "Food coloring", "Plastic bottle", "Clay or playdough"],
            steps: [
                "Shape clay around the bottle to make it look like a volcano.",
                "Add 2 tablespoons of baking soda into the bottle.",
                "Add a squirt of dish soap and a few drops of red/orange food coloring.",
                "Pour in about 100ml of vinegar and step back!",
                "Watch the foamy eruption! 🌋",
                "Experiment with different amounts to change the eruption size."
            ],
            explanation: "Baking soda (base) + vinegar (acid) creates carbon dioxide gas. The soap traps the gas into bubbles, making it extra foamy!"
        },
        {
            title: "🥛 Invisible Ink",
            difficulty: "Easy",
            time: "20 mins",
            materials: ["Lemon juice", "Cotton swab or paintbrush", "White paper", "Lamp or iron (with adult help)"],
            steps: [
                "Squeeze some lemon juice into a small cup.",
                "Dip a cotton swab in the juice and write a secret message on white paper.",
                "Let the paper dry completely — the message will become invisible!",
                "To reveal it, hold the paper near a warm lamp or ask an adult to iron it gently.",
                "Watch your secret message appear in brown! 🕵️"
            ],
            explanation: "Lemon juice is acidic and weakens the paper. Heat causes those weakened spots to brown (oxidize) faster than the rest of the paper."
        },
        {
            title: "🫧 Make a Lava Lamp",
            difficulty: "Easy",
            time: "15 mins",
            materials: ["Clear bottle or jar", "Water", "Vegetable oil", "Food coloring", "Effervescent tablet (like Alka-Seltzer)"],
            steps: [
                "Fill the bottle about ¾ full with vegetable oil.",
                "Pour water on top until the bottle is almost full. Wait for layers to separate.",
                "Add 5–8 drops of food coloring. Watch them sink through the oil!",
                "Break an effervescent tablet in half and drop it in.",
                "Enjoy the lava lamp effect! Add more tablet pieces to keep it going. ✨"
            ],
            explanation: "Oil and water don't mix because of different densities. The fizzing tablet creates gas bubbles that carry colored water up through the oil, then pop at the top!"
        }
    ],
    biology: [
        {
            title: "🌱 Grow a Bean in a Bag",
            difficulty: "Easy",
            time: "5 mins setup + 7 days observing",
            materials: ["Zip-lock bag", "Paper towel", "Bean seeds (lima or kidney)", "Water", "Tape"],
            steps: [
                "Dampen a paper towel (moist, not dripping).",
                "Place 2–3 bean seeds inside the folded towel.",
                "Slide it all into the zip-lock bag and partially seal it (leave a small gap for air).",
                "Tape the bag to a sunny window.",
                "Check daily and mist with water if the towel dries out.",
                "In 3–5 days you'll see roots, and in a week you'll see a sprout! 🌿"
            ],
            explanation: "Seeds contain a tiny plant embryo and stored food. Water activates enzymes that kick-start growth. Light tells the stem which way to grow!"
        },
        {
            title: "🦴 Extract DNA from a Strawberry",
            difficulty: "Medium",
            time: "30 mins",
            materials: ["Strawberry", "Zip-lock bag", "Dish soap", "Salt", "Rubbing alcohol (cold)", "Coffee filter", "Cup"],
            steps: [
                "Put a strawberry in a zip-lock bag and smash it thoroughly (the fun part! 🍓).",
                "Mix 1 tsp dish soap + ¼ tsp salt + 2 tbsp water in a cup.",
                "Pour the soapy mixture into the bag with the strawberry. Gently mix for 2 minutes.",
                "Pour the liquid through a coffee filter into a clean cup.",
                "Slowly pour very cold rubbing alcohol down the side of the cup so it layers on top.",
                "Wait 2 minutes — you'll see white, stringy DNA clump at the boundary! 🧬"
            ],
            explanation: "Soap breaks open cell membranes, salt clumps proteins together, and alcohol makes the DNA come out of solution so you can see it!"
        },
        {
            title: "🐛 Build a Worm Hotel",
            difficulty: "Easy",
            time: "20 mins setup + weeks observing",
            materials: ["Large clear jar or 2-liter bottle", "Soil", "Sand", "Worms (from outside)", "Dark paper", "Spray bottle"],
            steps: [
                "Layer soil and sand alternately in the jar (like a cake 🎂).",
                "Add 4–5 worms from your garden to the top.",
                "Sprinkle some veggie scraps on top for food.",
                "Wrap the jar with dark paper (worms prefer darkness).",
                "Mist with water every couple of days to keep it damp.",
                "Remove the paper every few days to see how the worms mix the layers! 👀"
            ],
            explanation: "Worms are nature's recyclers! They eat organic matter and mix soil layers, which helps plants grow. This is called vermicomposting."
        }
    ],
    earth: [
        {
            title: "🌧️ Make a Rain Cloud in a Jar",
            difficulty: "Easy",
            time: "15 mins",
            materials: ["Glass jar", "Hot water", "Shaving cream", "Blue food coloring", "Dropper or spoon"],
            steps: [
                "Fill the jar about ¾ full with warm water.",
                "Spray a thick layer of shaving cream on top — this is your cloud! ☁️",
                "Mix some blue food coloring with a little water in a separate cup.",
                "Use a dropper to slowly drip the colored water onto the shaving cream.",
                "Watch as 'rain' falls through the cloud into the water below! 🌧️",
                "Try different amounts of color to see heavier vs lighter rainfall."
            ],
            explanation: "This models how real rain works! Clouds collect water vapor until they're too heavy, then release it as precipitation."
        },
        {
            title: "🪨 Make Your Own Fossils",
            difficulty: "Easy",
            time: "1 hour + drying time",
            materials: ["Air-dry clay or salt dough", "Leaves, shells, or small toys", "Petroleum jelly", "Rolling pin"],
            steps: [
                "If using salt dough: mix 1 cup salt + 1 cup flour + ½ cup water. Knead until smooth.",
                "Roll the dough flat to about 2cm thick.",
                "Lightly coat your object (leaf, shell, etc.) with petroleum jelly.",
                "Press the object firmly into the dough, then carefully remove it.",
                "Let the imprint dry for 24–48 hours (or bake at low heat if using dough).",
                "Paint them if you like! You've made trace fossils! 🦕"
            ],
            explanation: "Real fossils form when organisms get buried in sediment that hardens over millions of years. Your model shows how imprints are preserved!"
        },
        {
            title: "🌪️ Tornado in a Bottle",
            difficulty: "Easy",
            time: "10 mins",
            materials: ["2 plastic bottles", "Water", "Duct tape", "Glitter (optional)", "Dish soap (optional)"],
            steps: [
                "Fill one bottle about ⅔ with water. Add a drop of soap and some glitter if you like.",
                "Place the empty bottle upside-down on top of the filled one, mouth to mouth.",
                "Tape them tightly together so no water leaks.",
                "Flip so the full bottle is on top.",
                "Quickly swirl the top bottle in a circle and watch a vortex form! 🌪️",
                "The water drains much faster with the vortex than without — try both!"
            ],
            explanation: "Swirling creates a vortex (like a mini tornado). The spinning water moves to the edges, letting air travel up through the center, which speeds up the flow."
        }
    ]
};

// ===== Greeting Messages =====
const greetings = [
    "Hey there, future scientist! 👋 I'm <strong>SciBot</strong>, your AI science project buddy!",
    "I can suggest projects from my library, or you can ask me <em>anything</em> about science — I'm powered by <strong>Gemini AI</strong>! 🤖✨",
    "Tap a category below or just type your question! 🚀"
];

// ===== DOM Elements =====
const chatArea = document.getElementById('chatArea');
const inputForm = document.getElementById('inputForm');
const userInput = document.getElementById('userInput');
const suggestionsEl = document.getElementById('suggestions');

// ===== Helpers =====
function scrollToBottom() {
    chatArea.scrollTop = chatArea.scrollHeight;
}

function createMessageEl(sender, html) {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = sender === 'bot' ? '🤖' : '🧑‍🔬';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = html;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    return wrapper;
}

function addMessage(sender, html) {
    chatArea.appendChild(createMessageEl(sender, html));
    scrollToBottom();
}

function showTyping() {
    const wrapper = document.createElement('div');
    wrapper.className = 'message bot';
    wrapper.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    chatArea.appendChild(wrapper);
    scrollToBottom();
}

function removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

function formatProject(project) {
    let html = `<h3>${project.title}</h3>`;
    html += `<span class="tag">${project.difficulty}</span> <span class="tag">⏱ ${project.time}</span>`;
    html += `<br><br><strong>Materials you'll need:</strong><ul>`;
    project.materials.forEach(m => html += `<li>${m}</li>`);
    html += `</ul><strong>Steps:</strong><ol>`;
    project.steps.forEach(s => html += `<li>${s}</li>`);
    html += `</ol><br>💡 <strong>How it works:</strong> ${project.explanation}`;
    return html;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ===== Markdown to HTML =====
function markdownToHtml(text) {
    let html = text;
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/<br><ul>/g, '<ul>');
    html = html.replace(/<\/ul><br>/g, '</ul>');
    return html;
}

// ===== Gemini API Call (with auto-retry) =====
async function askGemini(userMessage, retryCount = 0) {
    // Only add to history on first attempt
    if (retryCount === 0) {
        conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });

        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }
    }

    const requestBody = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: conversationHistory,
        generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
    };

    try {
        const response = await fetch(getGeminiUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const err = await response.json();
            console.error('Gemini API error:', err);

            // Auto-retry on rate limit (429) — up to 2 retries
            if (response.status === 429 && retryCount < 2) {
                // Parse wait time from error or default to 35s
                const waitMatch = err.error?.message?.match(/retry in ([\d.]+)s/i);
                const waitSecs = waitMatch ? Math.ceil(parseFloat(waitMatch[1])) : 35;

                // Show a friendly waiting message
                removeTyping();
                addMessage('bot', `⏳ I'm a bit busy right now! Retrying in <strong>${waitSecs} seconds</strong>... hang tight!`);
                showTyping();

                await new Promise(r => setTimeout(r, waitSecs * 1000));
                return askGemini(userMessage, retryCount + 1);
            }

            throw new Error(err.error?.message || 'API request failed');
        }

        const data = await response.json();
        const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hmm, I didn't get a response. Try again!";

        conversationHistory.push({ role: 'model', parts: [{ text: botText }] });
        return markdownToHtml(botText);
    } catch (error) {
        console.error('Error calling Gemini:', error);
        return `Oops! I had trouble connecting to my AI brain 🧠<br><br>Error: ${error.message}<br><br>But I still have my built-in projects — try tapping a category below! 👇`;
    }
}

// ===== Quick Offline Responses =====
function getQuickResponse(input) {
    const lower = input.toLowerCase();

    if (/^show me a physics/.test(lower) || /^physics project/.test(lower))
        return formatProject(getRandomItem(projects.physics));
    if (/^show me a chemistry/.test(lower) || /^chemistry project/.test(lower))
        return formatProject(getRandomItem(projects.chemistry));
    if (/^show me a biology/.test(lower) || /^biology project/.test(lower))
        return formatProject(getRandomItem(projects.biology));
    if (/^show me an earth/.test(lower) || /^earth science project/.test(lower))
        return formatProject(getRandomItem(projects.earth));
    if (/^surprise me/.test(lower)) {
        const all = [...projects.physics, ...projects.chemistry, ...projects.biology, ...projects.earth];
        return formatProject(getRandomItem(all));
    }

    return null;
}

// ===== Handle User Input =====
let isProcessing = false;

async function handleUserMessage(text) {
    if (isProcessing) return;

    addMessage('user', text);
    showTyping();
    isProcessing = true;

    userInput.disabled = true;
    document.getElementById('sendBtn').disabled = true;

    const quickResponse = getQuickResponse(text);

    if (quickResponse) {
        await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
        removeTyping();
        addMessage('bot', quickResponse);
    } else {
        const aiResponse = await askGemini(text);
        removeTyping();
        addMessage('bot', aiResponse);
    }

    isProcessing = false;
    userInput.disabled = false;
    document.getElementById('sendBtn').disabled = false;
    userInput.focus();
}

// Form submit
inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;
    userInput.value = '';
    handleUserMessage(text);
});

// Suggestion buttons
suggestionsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.suggestion-btn');
    if (!btn) return;
    handleUserMessage(btn.dataset.msg);
});

// ===== Boot Sequence =====
function bootGreetings() {
    greetings.forEach((msg, i) => {
        setTimeout(() => addMessage('bot', msg), 400 * (i + 1));
    });
}

if (GEMINI_API_KEY) {
    bootGreetings();
}
