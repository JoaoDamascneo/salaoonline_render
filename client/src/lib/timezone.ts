// Timezone utilities for proper Brazil/UTC conversion

export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

// Convert Brazil local time to UTC for backend storage
export function convertBrazilTimeToUTC(dateStr: string, timeStr: string): Date {
  // Create a date string treating it as local browser time (which should be Brazil)
  const brazilDateStr = `${dateStr}T${timeStr}:00`;
  const localDate = new Date(brazilDateStr);
  
  // Brazil is UTC-3, so to convert Brazil time to UTC, we add 3 hours
  const utcTime = new Date(localDate.getTime() + (3 * 60 * 60 * 1000));
  
  return utcTime;
}

// Convert UTC time back to Brazil local time for display
export function convertUTCToBrazilTime(utcDate: Date | string): Date {
  const dateObj = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  
  // Brazil is UTC-3, so to convert UTC to Brazil time, we subtract 3 hours
  const brazilTime = new Date(dateObj.getTime() - (3 * 60 * 60 * 1000));
  
  return brazilTime;
}

// Format time from stored datetime string - extract time directly without Date conversion
export function formatBrazilTime(dateTimeString: Date | string): string {
  if (typeof dateTimeString === 'string') {
    // Extract time directly from the datetime string (YYYY-MM-DDTHH:MM:SS format)
    const timePart = dateTimeString.split('T')[1];
    if (timePart) {
      return timePart.substring(0, 5); // Return HH:MM format
    }
  }
  
  // Fallback for Date objects - but this should be avoided
  const dateObj = typeof dateTimeString === 'string' ? new Date(dateTimeString) : dateTimeString;
  return dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// Format datetime from stored string - extract directly without Date conversion
export function formatBrazilDateTime(dateTimeString: Date | string): string {
  if (typeof dateTimeString === 'string') {
    // Extract date and time directly from the datetime string (YYYY-MM-DDTHH:MM:SS format)
    const [datePart, timePart] = dateTimeString.split('T');
    if (datePart && timePart) {
      const [year, month, day] = datePart.split('-');
      const time = timePart.substring(0, 5); // HH:MM
      return `${day}/${month}/${year} ${time}`;
    }
  }
  
  // Fallback for Date objects - but this should be avoided
  const dateObj = typeof dateTimeString === 'string' ? new Date(dateTimeString) : dateTimeString;
  return dateObj.toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// Format date for date inputs (YYYY-MM-DD format)
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
}