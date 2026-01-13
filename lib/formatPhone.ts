/**
 * Formats a phone number to (XXX) XXX-XXXX format
 * Handles various input formats and strips non-numeric characters
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''

  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '')

  // Handle different lengths
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  // Handle 11 digits (with leading 1)
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }

  // If it doesn't fit standard format, return cleaned version
  return phone
}

/**
 * Formats phone for tel: links (just digits)
 */
export function formatPhoneLink(phone: string | null | undefined): string {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

/**
 * Formats phone as user types - for input fields
 * Progressively formats: 123 -> (123) -> (123) 456 -> (123) 456-7890
 */
export function formatPhoneInput(value: string): string {
  // Remove all non-numeric characters
  const digits = value.replace(/\D/g, '')

  // Limit to 10 digits
  const limited = digits.slice(0, 10)

  if (limited.length === 0) return ''
  if (limited.length <= 3) return `(${limited}`
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
}
