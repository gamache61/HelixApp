async function send() {
    const i = document.getElementById('txt-input'); 
    const t = i.value.trim();
    
    // Check if we have anything to send
    if(!t && !imgData) return;

    i.value = ""; 
    addMsg('user', t || "[Code Scan Attached]"); 
    orb('thinking', 'THINKING');
    
    try {
        let p = []; 
        if(t) p.push({text: t}); 
        // Ensure image data is formatted correctly for Gemini Vision
        if(imgData) p.push({
            inline_data: {
                mime_type: "image/jpeg", 
                data: imgData
            }
        });

        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gKey}`, {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: [{ role: 'user', parts: p }] })
        });

        const d = await r.json();

        // --- NEW SAFETY CHECKS ---
        if (d.error) {
            throw new Error(d.error.message);
        }

        const candidate = d.candidates?.[0];
        
        // Check if the response was blocked by safety filters
        if (candidate?.finishReason === "SAFETY") {
            throw new Error("Blocked by Safety Filters. Try a closer crop of the code.");
        }

        // Extract the text safely
        const msg = candidate?.content?.parts?.[0]?.text;

        if (!msg) {
            throw new Error("No text returned. The image might be too blurry.");
        }

        // Success - Clear image and display message
        imgData = null; 
        document.getElementById('preview').style.display = 'none';
        addMsg('ai', msg); 
        orb(micOn ? 'listening' : '', micOn ? 'LISTENING' : 'HELIX'); 
        speak(msg);

    } catch(e) { 
        console.error("Helix API Error:", e);
        addMsg('ai', "⚠️ " + e.message); 
        orb('', 'ERROR'); 
    }
}
