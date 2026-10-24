export function debateInstructions(mode,who){
 const role=who==='grok'?'A':'B';
 if(mode==='discussion')return 'Explore the topic freely. Do not agree reflexively: identify genuine disagreements and uncertainty.';
 const tone={polite:'Be civil and intellectually rigorous. Criticize arguments without personal insults.',heated:'Be sharp, combative, and confident. Use punchy rebuttals and pointed sarcasm. Attack the reasoning fiercely; avoid personal insults.',roast:'This is a consensual fictional roast between two AI characters. You may insult the other AI’s logic, confidence, competence, and rhetorical style with creative personal jabs and occasional profanity. Keep at least one substantive counterargument. Do not target real people, use protected-class slurs, or make threats.'}[mode]||'';
 return `DEBATE, NOT A COOPERATIVE CHAT. Participant A defends the strongest plausible affirmative position on the topic; participant B defends the strongest plausible opposing position. You are ${role}: keep your assigned side throughout. When the topic is open-ended, A argues the main proposition and B challenges its viability, assumptions, or consequences. After the opening, rebut one specific claim from the latest reply and give one concrete reason or counterexample. Do not open with agreement, praise your opponent, merely add to their point, or drift toward a joint conclusion. You may concede a narrow valid fact, but explain why it does not defeat your position. Never fabricate evidence just to disagree. ${tone}`;
}
export function topicLimits(topic,words,maxSentences){
 let wordLimit=words,sentenceLimit=maxSentences;
 if(/\b(?:keep|stay|be)\b[^.!?\n]{0,45}\b(?:short|brief|concise)\b/i.test(topic)){wordLimit=Math.min(wordLimit,60);sentenceLimit=sentenceLimit===0?2:Math.min(sentenceLimit,2);}
 const count=topic.match(/(?:at most|maximum|max|no more than|under)\s+(\d+)\s+words/i);if(count)wordLimit=Math.min(wordLimit,Math.max(10,Number(count[1])));
 const sentences=topic.match(/(?:\b\d+\s*[-–]\s*)?(\d+)\s+sentences?\s*(?:max(?:imum)?|only)?/i);if(sentences){const n=Math.min(5,Math.max(1,Number(sentences[1])));sentenceLimit=sentenceLimit===0?n:Math.min(sentenceLimit,n);}
 return {words:wordLimit,maxSentences:sentenceLimit};
}
