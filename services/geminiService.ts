
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Day, BlockType, Timetable, ChatMessage, SearchSource, Language } from "../types.ts";

const DEFAULT_MODEL = 'gemini-2.0-flash';

const extractText = (response: any) => {
  return response.candidates?.[0]?.content?.parts
    ?.filter((part: any) => part.text)
    ?.map((part: any) => part.text)
    ?.join('\n') || "";
};

const trackUsage = (feature: 'extract' | 'notes' | 'study' | 'bookPro') => {
  try {
    const saved = localStorage.getItem('smartclass_usage');
    const stats = saved ? JSON.parse(saved) : { extract: 0, notes: 0, study: 0, bookPro: 0 };
    stats[feature] = (stats[feature] || 0) + 1;
    localStorage.setItem('smartclass_usage', JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to track usage", e);
  }
};

export const extractTimetableFromImage = async (base64Image: string) => {
  trackUsage('extract');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: "Extract the class schedule from this image. Map it to a structured JSON format. Return only the JSON. Identify the Day (Monday-Friday), Subject, Teacher, Room, and Start/End times in 24-hour format (HH:mm). If a day or time is ambiguous, do your best to infer or skip. Only include Monday to Friday."
          }
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          blocks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, enum: Object.values(Day) },
                startTime: { type: Type.STRING, description: "HH:mm format" },
                endTime: { type: Type.STRING, description: "HH:mm format" },
                subject: { type: Type.STRING },
                teacher: { type: Type.STRING },
                room: { type: Type.STRING },
                type: { type: Type.STRING, enum: Object.values(BlockType) }
              },
              required: ["day", "startTime", "endTime", "subject"]
            }
          }
        }
      }
    }
  });

  try {
    const text = extractText(response);
    const data = JSON.parse(text);
    return data.blocks || [];
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return [];
  }
};

export const getSubjectInsights = async (subject: string, teacher?: string, language: Language = Language.ENGLISH) => {
  trackUsage('study');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Provide helpful educational insights for the class "${subject}" ${teacher ? `taught by ${teacher}` : ''}. Include common topics covered, recommended study resources, and potential online course links. Use Google Search to ensure info is up-to-date. IMPORTANT: Provide the response in ${language}.`;
  
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: extractText(response),
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri
    })).filter((c: any) => c.uri) || []
  };
};

export const sendStudyChatMessage = async (
  history: ChatMessage[], 
  currentSubject: string, 
  timetableContext: Timetable,
  sourceFocus: SearchSource = SearchSource.GOOGLE,
  language: Language = Language.ENGLISH
) => {
  trackUsage('study');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const gradeSummary = timetableContext.grades
    .map(g => `${g.subject}: ${g.value}% (${g.note || 'Exam'})`)
    .join(', ');
  
  const systemInstruction = `You are an elite AI Study Assistant with long-term memory and real-time web access. 
  
  USER CONTEXT:
  - Current focus subject: ${currentSubject}
  - Full Grade Profile: ${gradeSummary || 'No grades logged yet.'}
  - Total Classes: ${timetableContext.blocks.length}
  - SEARCH FOCUS: ${sourceFocus}
  - PREFERRED LANGUAGE: ${language}
  
  Your primary goal is to provide DIRECT, ACCURATE, and COMPREHENSIVE answers to the user's questions by searching the internet. 
  
  When answering:
  1. Use Google Search grounding to harvest the most recent and relevant data.
  2. Prioritize answering the user's specific query over providing general study advice or plans.
  3. If the user asks for a fact, definition, or explanation, provide it clearly and cite your sources.
  4. IMPORTANT: The user has requested to focus on ${sourceFocus}. 
     - If focus is Wikipedia: Prioritize information from Wikipedia.
     - If focus is Reddit: Look for student discussions and peer advice.
     - If focus is Bing/Google: Use standard search grounding to find the best academic sources.
  5. Only provide study plans or coaching advice if explicitly asked or if it directly helps answer the user's question.
  6. MANDATORY: You MUST provide the final response in ${language}.
  
  Maintain a professional, knowledgeable, and helpful persona.`;

  const contents = history.slice(-10).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
    },
  });

  const text = extractText(response) || "I'm processing that... let's look at it from another angle.";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Resource',
    uri: chunk.web?.uri
  })).filter((c: any) => c.uri) || [];

  return { text, sources };
};

export const analyzeStudyPages = async (base64Images: string[], language: Language = Language.ENGLISH) => {
  trackUsage('study');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: img,
    },
  }));

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: [
      {
        parts: [
          ...imageParts,
          {
            text: `Analyze these study pages. Identify the most important concepts, definitions, and key takeaways. Provide a comprehensive, well-structured summary that is easy to study from. Format the output clearly with headings and bullet points. Do not include any conversational filler, just the study material. IMPORTANT: The summary must be written in ${language}.`
          }
        ],
      },
    ],
  });

  return extractText(response) || "No content could be extracted from the provided pages.";
};

export const generateGlobalStudyPlan = async (timetable: Timetable, language: Language = Language.ENGLISH) => {
  trackUsage('study');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const gradesText = timetable.grades.length > 0 
    ? timetable.grades.map(g => `- ${g.subject}: ${g.value}% (Weight: ${g.weight}%)`).join('\n')
    : "No grades recorded yet.";

  const scheduleText = timetable.blocks.map(b => `- ${b.day} at ${b.startTime}: ${b.subject}`).join('\n');

  const prompt = `Act as a Senior Academic Strategist. Analyze the following student profile and generate a HOLISTIC STUDY PLAN.
  
  GRADES:
  ${gradesText}
  
  SCHEDULE:
  ${scheduleText}
  
  UPCOMING EXAMS:
  ${timetable.exams.map(e => `- ${e.name} on ${e.date}`).join('\n')}
  
  TASKS:
  1. Identify the 'At-Risk' subjects (lowest grades).
  2. Calculate the urgency based on upcoming exam dates.
  3. Propose a weekly 10-hour supplementary study routine.
  4. Use Google Search to find the top 3 specialized study communities or forums for their weakest subjects.
  
  IMPORTANT: The response must be written in ${language}.
  
  Format the response with clear headings: "Executive Summary", "Priority Analysis", "7-Day Action Plan", and "Recommended Communities".`;

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: extractText(response),
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Strategy Source',
      uri: chunk.web?.uri
    })).filter((c: any) => c.uri) || []
  };
};

export const getPrintOptimizedSummary = async (timetable: Timetable) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze this student's schedule: ${JSON.stringify(timetable.blocks)}. 
  Generate a very short (3-sentence) professional "Executive Summary" of their academic week to be included in a printable PDF. 
  Identify their heaviest day and provide one highly motivating quote customized to their subjects. 
  Return only the plain text summary and quote.`;

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
  });

  return extractText(response) || "Weekly schedule processed. Aim for excellence in all your classes.";
};

export const getAIGradeSupport = async (subject: string, currentGrade: number, language: Language = Language.ENGLISH) => {
  trackUsage('study');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `I am a student struggling with "${subject}". My current grade is ${currentGrade}%. 
  Please research this subject online and provide:
  1. A list of 5 core concepts I must master to improve.
  2. A 7-day intensive study plan.
  3. Direct links to top-rated free resources (YouTube tutorials, Khan Academy, or specialized blogs).
  Be encouraging and specific. Use Google Search to find real, working resource links.
  IMPORTANT: The response must be written in ${language}.`;
  
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: extractText(response),
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Resource',
      uri: chunk.web?.uri
    })).filter((c: any) => c.uri) || []
  };
};

export const getGeneralStudySupport = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as an elite academic coach. Provide a comprehensive guide on modern study techniques including:
  1. The Active Recall and Spaced Repetition methods.
  2. How to manage "Deep Work" sessions.
  3. A list of the top 5 productivity apps for students currently.
  4. General advice on handling exam anxiety.
  Research the latest pedagogical science using Google Search to ensure advice is modern and effective. Provide links to credible articles or videos explaining these methods.`;
  
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: extractText(response),
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Study Guide Source',
      uri: chunk.web?.uri
    })).filter((c: any) => c.uri) || []
  };
};

export const generateImportantNotes = async (audioBase64?: string, imageBase64s?: string[], language: Language = Language.ENGLISH, context?: string) => {
  trackUsage('notes');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [];

  if (audioBase64) {
    parts.push({
      inlineData: {
        mimeType: 'audio/webm', // MediaRecorder usually produces webm in browsers
        data: audioBase64,
      },
    });
  }

  if (imageBase64s && imageBase64s.length > 0) {
    imageBase64s.forEach(img => {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: img,
        },
      });
    });
  }

  parts.push({
    text: `You are a world-class academic assistant and professional stenographer. 
    ${context ? `CONTEXT FOR THIS SESSION: ${context}\n` : ''}
    Analyze the provided audio and/or images from this lecture or academic conversation.
    
    CRITICAL: If multiple images are provided, process them in the EXACT order they are given (from the first image to the last). Do not skip around or change the sequence.
    
    Your goal is to create highly structured, "Gold-Standard" study notes.
    
    CRITICAL: Keep the notes CONCISE and BITE-SIZED. Avoid long paragraphs. Use clear bullet points. This is important for both readability and for the AI Voice Reader to function correctly.
    
    STRUCTURE YOUR RESPONSE AS FOLLOWS:
    1. **Executive Summary**: A high-level 2-3 sentence overview of the main topic.
    2. **Key Concepts & Definitions**: List and explain any technical terms, theories, or core ideas mentioned.
    3. **Detailed Breakdown**: Use hierarchical bullet points to capture the flow of the discussion/lecture.
    4. **Formulas & Data**: If any mathematical formulas, dates, or specific data points were mentioned, list them clearly.
    5. **Action Items & Next Steps**: Any assignments, suggested readings, or follow-up questions mentioned.
    6. **AI Insights**: Based on the content, suggest 2-3 related topics the student should research to deepen their understanding.

    STYLE GUIDELINES:
    - Use professional, academic tone.
    - Use bolding for emphasis on key terms.
    - Use LaTeX-style formatting for math if applicable.
    - Ensure the notes are easy to skim but rich in detail.
    
    IMPORTANT: The entire response must be written in ${language}. 
    Return ONLY the markdown content.`
  });

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: [{ parts }],
  });

  return extractText(response) || "I couldn't generate any notes from the provided materials.";
};

export const getBookProInsights = async (bookName: string, language: Language = Language.ENGLISH) => {
  trackUsage('bookPro');
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Research the book "${bookName}" using Google Search. 
  Provide a comprehensive overview including:
  1. Author and publication year.
  2. A detailed summary of the plot or main arguments.
  3. Key themes and characters (if applicable).
  4. Critical reception and impact.
  5. Why it's worth reading.
  
  IMPORTANT: The response must be written in ${language}. 
  Format the response with clear headings and bullet points.`;
  
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: extractText(response),
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri
    })).filter((c: any) => c.uri) || []
  };
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean up markdown more thoroughly for better speech
  const cleanText = text
    .replace(/[#*`]/g, '') // Remove markdown symbols
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
    .replace(/(\r\n|\n|\r)/gm, " ") // Replace newlines with spaces
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim()
    .slice(0, 1500); 

  if (!cleanText || cleanText.length < 2) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName as any },
          },
        },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (audioPart?.inlineData?.data) {
      const base64Data = audioPart.inlineData.data;
      
      // The Gemini TTS model returns raw 16-bit linear PCM at 24kHz.
      // Browsers cannot play raw PCM directly via data URLs; it needs a WAV header.
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create WAV header (44 bytes)
      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);
      
      // "RIFF" chunk descriptor
      view.setUint32(0, 0x52494646, false); // "RIFF"
      view.setUint32(4, 36 + len, true);    // File size - 8
      view.setUint32(8, 0x57415645, false); // "WAVE"
      
      // "fmt " sub-chunk
      view.setUint32(12, 0x666d7420, false); // "fmt "
      view.setUint32(16, 16, true);          // Subchunk1Size (16 for PCM)
      view.setUint16(20, 1, true);           // AudioFormat (1 for PCM)
      view.setUint16(22, 1, true);           // NumChannels (1 for Mono)
      view.setUint32(24, 24000, true);       // SampleRate (24kHz)
      view.setUint32(28, 24000 * 2, true);   // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
      view.setUint16(32, 2, true);           // BlockAlign (NumChannels * BitsPerSample/8)
      view.setUint16(34, 16, true);          // BitsPerSample (16 bits)
      
      // "data" sub-chunk
      view.setUint32(36, 0x64617461, false); // "data"
      view.setUint32(40, len, true);         // Subchunk2Size (number of bytes in data)

      // Combine header and PCM data
      const combined = new Uint8Array(44 + len);
      combined.set(new Uint8Array(wavHeader), 0);
      combined.set(bytes, 44);

      // Convert back to base64
      let binary = '';
      const combinedLen = combined.byteLength;
      for (let i = 0; i < combinedLen; i++) {
        binary += String.fromCharCode(combined[i]);
      }
      return window.btoa(binary);
    }

    const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
    if (textPart?.text) {
      console.warn("TTS model returned text instead of audio:", textPart.text);
    }
    
    return null;
  } catch (error) {
    console.error("Error in generateSpeech:", error);
    throw error;
  }
};
