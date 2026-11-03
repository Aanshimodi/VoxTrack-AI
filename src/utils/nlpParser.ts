import { ExpenseCategory, ParsedVoiceResult, TaskCategory, TaskPriority } from '../types';

// Helper to format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Add days to date
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Detect category from description keywords
export function detectExpenseCategory(text: string): ExpenseCategory {
  const lower = text.toLowerCase();

  if (/\b(food|lunch|dinner|breakfast|snack|coffee|tea|cafe|restaurant|burger|pizza|biryani|swiggy|zomato|kfc|mcdonald|meal|drinks|eating)\b/.test(lower)) {
    return 'Food & Dining';
  }
  if (/\b(grocer|grocery|groceries|supermarket|vegetable|fruit|milk|bread|egg|mart|walmart|instamart|blinkit|zepto|provisions)\b/.test(lower)) {
    return 'Groceries';
  }
  if (/\b(uber|ola|cab|taxi|auto|rickshaw|petrol|fuel|gas|diesel|bus|metro|train|flight|parking|toll|transit|transport)\b/.test(lower)) {
    return 'Transport';
  }
  if (/\b(bill|electricity|water|wifi|internet|broadband|recharge|phone|mobile|rent|maintenance|utility|utilities|netflix|spotify|subscription)\b/.test(lower)) {
    return 'Bills & Utilities';
  }
  if (/\b(shopping|clothes|shirt|pants|shoes|amazon|flipkart|myntra|electronics|gadget|mall|store|keyboard|headphone|mouse)\b/.test(lower)) {
    return 'Shopping';
  }
  if (/\b(movie|cinema|theatre|concert|game|gaming|party|club|pub|vacation|entertainment|fun)\b/.test(lower)) {
    return 'Entertainment';
  }
  if (/\b(medicine|doctor|hospital|clinic|pharmacy|chemist|dentist|gym|fitness|health|medical|consultation|test)\b/.test(lower)) {
    return 'Health';
  }
  if (/\b(book|course|udemy|tuition|exam|college|school|class|stationery|pen|notebook|fees|study|education)\b/.test(lower)) {
    return 'Education';
  }
  if (/\b(hotel|resort|trip|travel|airbnb|tour|flight)\b/.test(lower)) {
    return 'Travel';
  }
  return 'Other';
}

export function detectTaskCategory(text: string): TaskCategory {
  const lower = text.toLowerCase();
  if (/\b(urgent|asap|emergency|immediately|important|critical)\b/.test(lower)) return 'Urgent';
  if (/\b(assignment|study|exam|homework|class|lecture|project|course|read|test)\b/.test(lower)) return 'Study';
  if (/\b(work|client|meeting|presentation|report|email|office|colleague|pr|code|bug|deploy|boss)\b/.test(lower)) return 'Work';
  if (/\b(doctor|medicine|gym|workout|exercise|health|dentist|appointment)\b/.test(lower)) return 'Health';
  if (/\b(pay|bill|invest|bank|tax|emi|transfer|finance|insurance)\b/.test(lower)) return 'Finance';
  if (/\b(mom|dad|family|friend|call|home|buy|clean|dinner|personal)\b/.test(lower)) return 'Personal';
  return 'General';
}

export function detectTaskPriority(text: string): TaskPriority {
  const lower = text.toLowerCase();
  if (/\b(urgent|asap|high priority|critical|immediately|important)\b/.test(lower)) return 'high';
  if (/\b(low priority|whenever|someday|eventually|leisure|optional)\b/.test(lower)) return 'low';
  return 'medium';
}

// Parse spoken relative dates
export function parseRelativeDate(text: string, baseDate = new Date()): { dateStr: string; dueLabel: string; timeStr?: string } {
  const lower = text.toLowerCase();
  const todayStr = formatDate(baseDate);

  // Extract time if specified (e.g. 5pm, 5:30 pm, 10 am)
  let timeStr: string | undefined = undefined;
  const timeMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3];
    if (period === 'pm' && hour < 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
    timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  if (/\bday after tomorrow\b/.test(lower)) {
    const target = addDays(baseDate, 2);
    return { dateStr: formatDate(target), dueLabel: 'in 2 days', timeStr };
  }

  if (/\btomorrow\b/.test(lower)) {
    const target = addDays(baseDate, 1);
    return { dateStr: formatDate(target), dueLabel: 'tomorrow', timeStr };
  }

  if (/\btonight\b|\btoday\b|\bthis evening\b|\bthis afternoon\b/.test(lower)) {
    return { dateStr: todayStr, dueLabel: 'today', timeStr };
  }

  const inDaysMatch = lower.match(/\bin\s+(\d+)\s+days?\b/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1], 10);
    const target = addDays(baseDate, days);
    return { dateStr: formatDate(target), dueLabel: `in ${days} days`, timeStr };
  }

  // Days of week
  const daysMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  for (const [dayName, dayIndex] of Object.entries(daysMap)) {
    const regex = new RegExp(`\\b(next|this)?\\s*${dayName}\\b`, 'i');
    if (regex.test(lower)) {
      const currentDay = baseDate.getDay();
      let diff = (dayIndex - currentDay + 7) % 7;
      if (diff === 0) diff = 7; // next week if same day
      const target = addDays(baseDate, diff);
      return {
        dateStr: formatDate(target),
        dueLabel: `on ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`,
        timeStr,
      };
    }
  }

  return { dateStr: todayStr, dueLabel: 'today', timeStr };
}

// Convert common spoken number words
function wordToNumber(str: string): number | null {
  const smallMap: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
    eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
    seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
  };

  const words = str.toLowerCase().split(/[\s-]+/);
  let total = 0;
  let current = 0;
  let matched = false;

  for (const word of words) {
    if (smallMap[word] !== undefined) {
      matched = true;
      const val = smallMap[word];
      if (val === 100) {
        current = (current === 0 ? 1 : current) * 100;
      } else if (val === 1000) {
        current = (current === 0 ? 1 : current) * 1000;
        total += current;
        current = 0;
      } else {
        current += val;
      }
    }
  }
  total += current;
  return matched ? total : null;
}

// Extract money amount and currency from text
export function extractAmount(text: string, defaultCurrency = 'INR'): { amount: number; currency: string } | null {
  const lower = text.toLowerCase();

  // Currency detection
  let currency = defaultCurrency;
  if (/(\$|dollar|usd)/i.test(lower)) currency = 'USD';
  else if (/(₹|rs\.?|rupee|rupees|inr)/i.test(lower)) currency = 'INR';
  else if (/(€|euro|euros|eur)/i.test(lower)) currency = 'EUR';
  else if (/(£|pound|pounds|gbp)/i.test(lower)) currency = 'GBP';

  // 1. Direct regex for numbers: e.g. "250", "₹250", "250.50", "1,200", "$45"
  const regexPatterns = [
    /(?:rs\.?|₹|inr|rupees?|\$|usd|€|eur|£|gbp)\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i,
    /([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)\s*(?:rs\.?|₹|inr|rupees?|\$|dollars?|usd|€|euros?|eur|£|pounds?|gbp|bucks)/i,
    /(?:spent|paid|bought|cost|costs|costed|worth|charged|for)\s+([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i,
    /\b([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)\b/,
  ];

  for (const pattern of regexPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleaned = match[1].replace(/,/g, '');
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num > 0) {
        return { amount: num, currency };
      }
    }
  }

  // 2. Check for spoken number words e.g. "two hundred fifty rupees"
  const numberWordMatch = lower.match(/(?:spent|paid|worth|for)?\s*([a-z\s-]+)\s*(?:rupees|rs|dollars|inr|euros|pounds|bucks)/);
  if (numberWordMatch) {
    const val = wordToNumber(numberWordMatch[1]);
    if (val && val > 0) {
      return { amount: val, currency };
    }
  }

  return null;
}

// Master Local Rule-Based NLP Parser
export function parseVoiceInputLocally(
  transcript: string,
  currentDate = new Date(),
  defaultCurrency = 'INR'
): ParsedVoiceResult {
  const trimmed = transcript.trim();
  const lower = trimmed.toLowerCase();

  // Check Task indicators
  const isTaskKeyword = /\b(remind|reminder|task|todo|to-do|remember|schedule|submit|prepare|finish|complete|call|message|email|buy|bring|clean|pickup|appointment|meet|workout|exercise)\b/i.test(
    lower
  );
  // Check Expense indicators
  const isExpenseKeyword = /\b(spent|spend|paid|pay|bought|buy|bought|cost|costs|expense|bill|recharge|purchased|ordered|fare|rent|fees|shopping|dining|food)\b/i.test(
    lower
  );

  const amountInfo = extractAmount(trimmed, defaultCurrency);

  // If there's a clear money amount, or expense keyword without task cues, classify as Expense
  if (amountInfo && (isExpenseKeyword || !isTaskKeyword || lower.includes('on') || lower.includes('for'))) {
    // Determine description
    let desc = trimmed;
    // Strip common phrases
    desc = desc.replace(/^(i\s+)?(have\s+)?(spent|paid|bought|purchased|added|add)\s+/i, '');
    desc = desc.replace(/(?:rs\.?|₹|inr|rupees?|\$|usd|€|eur|£|gbp)\s*[0-9]+(?:\.[0-9]+)?/gi, '');
    desc = desc.replace(/[0-9]+(?:\.[0-9]+)?\s*(?:rs\.?|₹|inr|rupees?|\$|dollars?|usd|€|euros?|eur|£|pounds?|bucks)?/gi, '');
    desc = desc.replace(/\b(for|on|worth of|at)\b/gi, ' ');
    desc = desc.replace(/\s+/g, ' ').trim();

    if (!desc || desc.length < 2) {
      desc = 'General expense';
    } else {
      // Capitalize first letter
      desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    }

    const category = detectExpenseCategory(trimmed);
    const dateStr = formatDate(currentDate);

    const currencySymbol =
      amountInfo.currency === 'INR'
        ? '₹'
        : amountInfo.currency === 'USD'
        ? '$'
        : amountInfo.currency === 'EUR'
        ? '€'
        : '£';

    const feedback = `Saved ${currencySymbol}${amountInfo.amount} for ${desc} under ${category}.`;

    return {
      type: 'expense',
      expense: {
        amount: amountInfo.amount,
        currency: amountInfo.currency,
        category,
        description: desc,
        date: dateStr,
      },
      voiceFeedback: feedback,
      confidence: 0.95,
      source: 'local-nlp',
    };
  }

  // Otherwise, classify as Task
  if (isTaskKeyword || lower.includes('tomorrow') || lower.includes('today') || lower.includes('need to') || lower.includes('have to')) {
    const { dateStr, dueLabel, timeStr } = parseRelativeDate(trimmed, currentDate);
    const category = detectTaskCategory(trimmed);
    const priority = detectTaskPriority(trimmed);

    // Clean task title
    let title = trimmed;
    title = title.replace(/^(remind me to|reminder to|add task to|add task|add todo|todo|schedule|need to|have to|don't forget to|remember to)\s+/i, '');
    title = title.replace(/\b(tomorrow|today|tonight|next week|day after tomorrow|this evening|this afternoon)\b/gi, '');
    title = title.replace(/\b(at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/gi, '');
    title = title.replace(/\s+/g, ' ').trim();

    if (!title || title.length < 2) {
      title = trimmed;
    }
    title = title.charAt(0).toUpperCase() + title.slice(1);

    const timeFeedback = timeStr ? ` at ${timeStr}` : '';
    const feedback = `Task added: ${title}, due ${dueLabel}${timeFeedback}.`;

    return {
      type: 'task',
      task: {
        title,
        dueDate: dateStr,
        dueTime: timeStr,
        priority,
        category,
      },
      voiceFeedback: feedback,
      confidence: 0.92,
      source: 'local-nlp',
    };
  }

  // Fallback if neither matches directly
  return {
    type: 'unknown',
    voiceFeedback: `I heard: "${trimmed}". You can say "Spent 250 rupees on lunch" or "Remind me to study tomorrow".`,
    confidence: 0.4,
    source: 'local-nlp',
  };
}
