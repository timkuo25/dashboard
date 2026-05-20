/**
 * Words/phrases to strip from titles in guest mode.
 * Add new entries here to expand the list.
 */
const BLOCKED_WORDS = [
  "shade finder",
  "ssf",
  "VTO",
];

export function maskCustomer(customer: string): string {
  if (!customer) return "";
  return "Brand " + customer.charAt(0).toUpperCase();
}

export function maskTitle(title: string, customer: string): string {
  if (!title) return title;

  let result = title;

  // Remove [bracket] patterns
  result = result.replace(/\[[^\]]*\]/g, "");

  // Remove customer name
  if (customer) {
    const escapedCustomer = customer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escapedCustomer, "gi"), "");
  }

  // Remove blocked words
  for (const word of BLOCKED_WORDS) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "gi"), "");
  }

  return result.replace(/\s+/g, " ").trim();
}
